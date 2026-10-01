'use client';

import { useCallback, useState, useTransition } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { FilmCredit } from '@/types';
import type { EditorLocaleOption } from '../ui';
import { upsertFilm, deleteFilm } from '@/app/(admin)/admin/actions';
import { useEntityEditorLocale } from '../entity-translation/useEntityEditorLocale';
import { FILM_CODEC } from '../entity-translation/entity-codec';
import { createEmptyFilm, normalizeDoubledActors } from './film-form';

export interface UseFilmEditorArgs {
    setFilms: React.Dispatch<React.SetStateAction<FilmCredit[]>>;
    showToast: (msg: string) => void;
}

/** Fiche neutre : brouillon inerte passé au socle bilingue hors édition. */
const CLOSED_FILM: FilmCredit = {
    id: '',
    title: '',
    year: '',
    category: '',
    stuntRoles: '',
    highlight: false,
    image: '',
    tag: '',
    imdbUrl: '',
    allocineUrl: '',
    trailerUrl: '',
};

/**
 * Champs du brouillon film traduisibles. `FILM_CODEC` expose la colonne
 * d'overlay (`stunt_roles`) là où la modale manipule `stuntRoles` : ce miroir
 * porte le pont camelCase → snake_case et reste aligné sur le codec.
 */
const FILM_TRANSLATABLE_DRAFT_FIELDS: readonly string[] = ['description', 'stuntRoles'];

/**
 * Édition d'un projet : fiche en cours, enregistrement optimiste (liste mise à
 * jour immédiatement, écriture en transition), suppression, intervenants CUC
 * (avec rôles par membre) et affiche.
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1) — les Server Actions
 * restent dans `actions/**`.
 */
export function useFilmEditor({ setFilms, showToast }: UseFilmEditorArgs) {
    const [, startTransition] = useTransition();
    const [editingFilm, setEditingFilm] = useState<FilmCredit | null>(null);
    const [showMediaPicker, setShowMediaPicker] = useState(false);

    /**
     * Point d'écriture de la fiche **source française** (intervenants, rôles,
     * affiche). La fiche reste la propriété de ce hook.
     */
    const setSourceFilm = useCallback<Dispatch<SetStateAction<FilmCredit>>>(
        (value) => {
            setEditingFilm((previous) => {
                if (!previous) return previous;
                return typeof value === 'function'
                    ? (value as (prev: FilmCredit) => FilmCredit)(previous)
                    : value;
            });
        },
        []
    );

    /**
     * Édition EN PLACE (WS-2) : l'overlay `film` ne porte que `description` et
     * les rôles de cascades, via le pont `stuntRoles ⇄ stunt_roles`. Tant
     * qu'aucun film n'est ouvert, `entityId` est vide et la locale reste en FR.
     */
    const locale = useEntityEditorLocale({
        codec: FILM_CODEC,
        entityId: editingFilm?.id ?? '',
        draft: editingFilm ?? CLOSED_FILM,
        setDraft: setSourceFilm,
    });

    /** Ouvre une fiche existante : on repart toujours de la source française. */
    const openEdit = (film: FilmCredit) => {
        setEditingFilm(film);
        locale.setLocale('fr');
    };

    /** Fiche vierge prête pour la modale (voir `film-form.ts`). */
    const openCreate = () => {
        setEditingFilm(createEmptyFilm());
        locale.setLocale('fr');
    };

    /**
     * Ferme la modale. Un brouillon anglais non enregistré demande confirmation :
     * cette sortie l'abandonne (elle n'écrit jamais l'overlay). Les deux
     * mutations restent groupées dans le même rendu : la locale retombe en FR
     * avant que `entityId` ne passe à vide, donc la fermeture ne déclenche aucun
     * chargement d'overlay.
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
        setEditingFilm(null);
        locale.setLocale('fr');
    };

    /**
     * Bascule de langue. En français, une retouche des champs traduisibles
     * marque le brouillon « non enregistré » (overlay non chargé) : réaligner la
     * base avant d'ouvrir l'anglais évite de servir du français comme
     * traduction. Quitter l'anglais avec une saisie non enregistrée demande
     * confirmation.
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

    /**
     * Garde de champ : en anglais, seuls `description` et les rôles de cascades
     * restent éditables, et seulement une fois l'overlay chargé.
     */
    const isFieldReadOnly = (field: string) =>
        locale.isReadOnlyField(field) ||
        (locale.isEnglish && (!locale.ready || !FILM_TRANSLATABLE_DRAFT_FIELDS.includes(field)));

    /**
     * Patch de la fiche **active** : français en FR, overlay en EN. Tous les
     * champs traduisibles de la modale passent par ici.
     */
    const patchActive = (updates: Partial<FilmCredit>) => {
        locale.setActive((previous) => ({ ...previous, ...updates }));
    };

    /**
     * Patch de la fiche en cours : point d'écriture des champs de la **source
     * française** (intervenants, rôles, affiche).
     */
    const patchEditing = (updates: Partial<FilmCredit>) => {
        setEditingFilm((prev) => (prev ? { ...prev, ...updates } : prev));
    };

    /** Intervenant CUC coché/décoché : alimente les deux champs historiques. */
    const toggleTeamMember = (memberId: string) => {
        if (!editingFilm) return;
        const isChecked =
            editingFilm.cuc_team_involved?.includes(memberId) ||
            editingFilm.instructor_ids?.includes(memberId);
        const current = editingFilm.cuc_team_involved || editingFilm.instructor_ids || [];
        const updated = isChecked ? current.filter((id) => id !== memberId) : [...current, memberId];
        setEditingFilm({
            ...editingFilm,
            cuc_team_involved: updated,
            instructor_ids: updated,
        });
    };

    const setMemberRole = (memberId: string, role: string) => {
        if (!editingFilm) return;
        setEditingFilm({
            ...editingFilm,
            cuc_team_roles: {
                ...(editingFilm.cuc_team_roles || {}),
                [memberId]: role,
            },
        });
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingFilm) return;

        /*
         * En anglais, l'action principale enregistre l'**overlay** de traduction
         * (`description`, rôles de cascades) et ne persiste jamais la ligne
         * française. La fermeture qui suit n'est pas gardée : le brouillon vient
         * d'être persisté.
         */
        if (locale.isEnglish) {
            void locale.saveTranslation().then((result) => {
                if (!result.success) return;
                setEditingFilm(null);
                locale.setLocale('fr');
                showToast('Traduction anglaise du film enregistrée.');
            });
            return;
        }

        const updated: FilmCredit = {
            ...editingFilm,
            doubledActors: normalizeDoubledActors(editingFilm),
        };

        setFilms((prev) => {
            const exists = prev.some((f) => f.id === updated.id);
            if (exists) return prev.map((f) => (f.id === updated.id ? updated : f));
            return [...prev, updated];
        });
        closeEditor();
        showToast('Projet enregistré au catalogue !');

        startTransition(async () => {
            await upsertFilm({
                id: updated.id,
                title: updated.title,
                year: updated.year,
                category: updated.category,
                director: updated.director,
                description: updated.description,
                stunt_roles: updated.stuntRoles,
                image: updated.image,
                tag: updated.tag,
                imdb_url: updated.imdbUrl,
                allocine_url: updated.allocineUrl,
                trailer_url: updated.trailerUrl,
                doubled_actors: updated.doubledActors,
                highlight: updated.highlight,
                cuc_team_involved: updated.cuc_team_involved || updated.instructor_ids || [],
                cuc_team_roles: updated.cuc_team_roles || {},
            });
        });
    };

    const remove = (id: string, title: string) => {
        if (!confirm(`Supprimer définitivement le projet "${title}" ?`)) return;

        setFilms((prev) => prev.filter((f) => f.id !== id));
        showToast(`Projet "${title}" supprimé`);

        startTransition(async () => {
            await deleteFilm(id);
        });
    };

    const openMediaPicker = () => setShowMediaPicker(true);
    const closeMediaPicker = () => setShowMediaPicker(false);

    const applyPoster = (url: string) => {
        patchEditing({ image: url });
        setShowMediaPicker(false);
    };

    return {
        /** Fiche source française (intervenants, affiche, save FR). */
        editingFilm,
        setSourceFilm,
        /** Fiche active : français en FR, contenu localisé en EN. */
        activeFilm: locale.active,
        patchActive,
        patchEditing,
        /** État bilingue complet, consommé par l'en-tête de la modale. */
        locale,
        changeLocale,
        isFieldReadOnly,
        openCreate,
        openEdit,
        closeEditor,
        toggleTeamMember,
        setMemberRole,
        handleSave,
        remove,
        showMediaPicker,
        openMediaPicker,
        closeMediaPicker,
        applyPoster,
    };
}
