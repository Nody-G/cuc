'use client';

import { useCallback, useState, useTransition } from 'react';
import type { Dispatch, FormEvent, SetStateAction } from 'react';
import type { Discipline } from '@/types';
import { upsertDiscipline, deleteDiscipline, updateSiteSettings } from '../../actions';
import type { EditorLocaleOption } from '../ui';
import { useEntityEditorLocale } from '../entity-translation/useEntityEditorLocale';
import { DISCIPLINE_CODEC } from '../entity-translation/entity-codec';
import { createEmptyDiscipline, normalizeDisciplineEquipment } from './discipline-form';

export interface UseDisciplineEditorArgs {
    disciplines: Discipline[];
    setDisciplines: React.Dispatch<React.SetStateAction<Discipline[]>>;
    showToast: (msg: string) => void;
}

/** Module neutre : brouillon inerte passé au socle bilingue hors édition. */
const CLOSED_DISCIPLINE: Discipline = {
    id: '',
    number: '',
    name: '',
    shortDesc: '',
    fullDesc: '',
    iconName: 'Shield',
    level: 'Fondamental',
    equipment: [],
    cinemaContext: '',
    heroImage: '',
};

/**
 * Édition d'un module : fiche en cours, enregistrement optimiste (liste mise à
 * jour immédiatement, écritures en transition), suppression, liaisons croisées
 * et sélection d'image.
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1) — les Server Actions
 * restent dans `actions/**`. Depuis WS-4, l'édition bilingue EN PLACE du texte
 * passe par le socle `entity-translation` (allow-list `DISCIPLINE_CODEC`) sans
 * toucher au double écrit FR (`upsertDiscipline` + `updateSiteSettings`).
 */
export function useDisciplineEditor({
    disciplines,
    setDisciplines,
    showToast,
}: UseDisciplineEditorArgs) {
    const [, startTransition] = useTransition();
    const [editingDiscipline, setEditingDiscipline] = useState<Discipline | null>(null);
    const [showMediaPicker, setShowMediaPicker] = useState(false);

    /** Point d'écriture de la fiche source française. */
    const setSourceDiscipline = useCallback<Dispatch<SetStateAction<Discipline>>>(
        (value) => {
            setEditingDiscipline((previous) => {
                if (!previous) return previous;
                return typeof value === 'function'
                    ? (value as (prev: Discipline) => Discipline)(previous)
                    : value;
            });
        },
        []
    );

    const locale = useEntityEditorLocale({
        codec: DISCIPLINE_CODEC,
        entityId: editingDiscipline?.id ?? '',
        draft: editingDiscipline ?? CLOSED_DISCIPLINE,
        setDraft: setSourceDiscipline,
    });

    /** Patch des champs traduisibles : FR → source, EN → overlay. */
    const patchActive = useCallback(
        (updates: Partial<Discipline>) => {
            locale.setActive((prev) => ({ ...prev, ...updates }));
        },
        [locale]
    );

    /** Patch des champs techniques (numéro, niveau, zone, visuel, liens). */
    const patchSource = useCallback(
        (updates: Partial<Discipline>) => {
            setSourceDiscipline((prev) => ({ ...prev, ...updates }));
        },
        [setSourceDiscipline]
    );

    const openCreate = () => {
        setEditingDiscipline(createEmptyDiscipline(disciplines.length));
        locale.setLocale('fr');
    };

    const openEdit = (discipline: Discipline) => {
        setEditingDiscipline(discipline);
        locale.setLocale('fr');
    };

    /**
     * Ferme l'éditeur. Un brouillon anglais non enregistré demande confirmation :
     * cette sortie l'abandonne (elle n'écrit jamais l'overlay).
     */
    const closeEditor = () => {
        if (
            locale.isEnglish &&
            locale.dirty &&
            !window.confirm(
                'Des modifications anglaises ne sont pas enregistrées. Fermer l\'éditeur les abandonnera.\n\nContinuer sans enregistrer ?'
            )
        ) {
            return;
        }
        setEditingDiscipline(null);
        locale.setLocale('fr');
    };

    /**
     * Bascule de langue : confirmation si un brouillon anglais est sale, et
     * réalignement de la base avant d'ouvrir l'anglais (le FR n'est jamais servi
     * comme traduction).
     */
    const changeLocale = (next: EditorLocaleOption) => {
        if (next === locale.locale) return;
        if (
            locale.isEnglish &&
            locale.dirty &&
            !window.confirm(
                'Des modifications anglaises ne sont pas enregistrées. Changer de langue les abandonnera.\n\nContinuer sans enregistrer ?'
            )
        ) {
            return;
        }
        if (next === 'en') locale.revertTranslation();
        locale.setLocale(next);
    };

    const isFieldReadOnly = (field: string) =>
        locale.isReadOnlyField(field) ||
        (locale.isEnglish && (!locale.ready || !DISCIPLINE_CODEC.fields.includes(field)));

    const toggleArrayItem = (
        field: 'instructor_ids' | 'film_ids' | 'program_ids',
        id: string
    ) => {
        setSourceDiscipline((prev) => {
            const current = prev[field] || [];
            const exists = current.includes(id);
            const updated = exists ? current.filter((x) => x !== id) : [...current, id];
            return { ...prev, [field]: updated };
        });
    };

    const handleSave = (e: FormEvent) => {
        e.preventDefault();
        if (!editingDiscipline) return;

        /*
         * En anglais, l'action principale enregistre l'**overlay** de traduction
         * et ne touche jamais la source française (ni la table, ni le miroir
         * `site_settings`). La fermeture qui suit n'est pas gardée.
         */
        if (locale.isEnglish) {
            void locale.saveTranslation().then((result) => {
                if (!result.success) return;
                setEditingDiscipline(null);
                locale.setLocale('fr');
                showToast('Traduction anglaise du module enregistrée.');
            });
            return;
        }

        const updated: Discipline = {
            ...editingDiscipline,
            equipment: normalizeDisciplineEquipment(editingDiscipline),
        };

        let nextList: Discipline[] = [];
        setDisciplines((prev) => {
            const exists = prev.some((d) => d.id === updated.id);
            nextList = exists ? prev.map((d) => (d.id === updated.id ? updated : d)) : [...prev, updated];
            return nextList;
        });

        closeEditor();
        showToast(`Discipline ${updated.number} enregistrée !`);

        startTransition(async () => {
            await upsertDiscipline(updated);
            await updateSiteSettings('disciplines', { list: nextList });
        });
    };

    const handleDelete = (id: string) => {
        if (!confirm('Supprimer définitivement ce module de cascade ?')) return;

        const nextList = disciplines.filter((d) => d.id !== id);
        setDisciplines(nextList);

        showToast('Module supprimé.');

        startTransition(async () => {
            await deleteDiscipline(id);
            await updateSiteSettings('disciplines', { list: nextList });
        });
    };

    const openMediaPicker = () => setShowMediaPicker(true);
    const closeMediaPicker = () => setShowMediaPicker(false);

    /** Visuel verrouillé en anglais : toujours écrit sur la source FR. */
    const applyHeroImage = (url: string) => {
        if (editingDiscipline) {
            setSourceDiscipline({ ...editingDiscipline, heroImage: url });
        }
        setShowMediaPicker(false);
        showToast('Image appliquée avec succès !');
    };

    return {
        /** Fiche source française (visuel, liens, save FR). */
        editingDiscipline,
        /** Brouillon actif : français en FR, contenu localisé en EN. */
        activeDiscipline: locale.active,
        /** Écriture du brouillon actif (mêmes champs, locale courante). */
        setActiveDiscipline: locale.setActive,
        /** Patch traduisible / technique. */
        patchActive,
        patchSource,
        /** État bilingue complet, consommé par l'en-tête de la modale. */
        locale,
        changeLocale,
        isFieldReadOnly,
        openCreate,
        openEdit,
        closeEditor,
        toggleArrayItem,
        handleSave,
        handleDelete,
        showMediaPicker,
        openMediaPicker,
        closeMediaPicker,
        applyHeroImage,
    };
}
