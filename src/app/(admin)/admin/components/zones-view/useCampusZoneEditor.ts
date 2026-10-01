'use client';

import {
    useCallback,
    useState,
    useTransition,
    type Dispatch,
    type FormEvent,
    type SetStateAction,
} from 'react';
import { POI } from '@/components/ui/campus-map/campusMap.data';
import { upsertCampusPOI, deleteCampusPOI, updateSiteSettings } from '../../actions';
import type { EditorLocaleOption } from '../ui';
import { useEntityEditorLocale } from '../entity-translation/useEntityEditorLocale';
import { ZONE_CODEC } from '../entity-translation/entity-codec';
import type { EntityEditorLocale } from '../entity-translation/entity-translation.contract';
import { createEmptyZone } from './zone-form';

export interface UseCampusZoneEditorArgs {
    campusPOIs: POI[];
    setCampusPOIs: Dispatch<SetStateAction<POI[]>>;
    showToast: (msg: string) => void;
}

export interface UseCampusZoneEditorResult {
    /** POI source française (visuel, géo, signalétique, statut, save FR). */
    editingPOI: POI | null;
    /** Brouillon actif : français en FR, contenu localisé en EN. */
    activePOI: POI;
    setActivePOI: Dispatch<SetStateAction<POI>>;
    /** Patch des champs traduisibles / techniques. */
    patchActive: (patch: Partial<POI>) => void;
    patchSource: (patch: Partial<POI>) => void;
    /** État bilingue complet, consommé par l'en-tête de la modale. */
    locale: EntityEditorLocale<POI>;
    changeLocale: (next: EditorLocaleOption) => void;
    isFieldReadOnly: (field: string) => boolean;
    showMediaPicker: boolean;
    openNewZone: () => void;
    openEditor: (poi: POI) => void;
    closeEditor: () => void;
    openMediaPicker: () => void;
    closeMediaPicker: () => void;
    handleMediaSelect: (url: string) => void;
    handleSave: (e: FormEvent) => void;
    handleDelete: (id: string) => void;
}

/** Zone neutre : brouillon inerte passé au socle bilingue hors édition. */
const CLOSED_POI: POI = {
    id: '',
    name: '',
    category: '',
    description: '',
    specs: '',
    coordinates: '',
    badge: '',
    xPercent: 50,
    yPercent: 50,
};

/**
 * Orchestration de l'éditeur de zones du campus : brouillon optimiste,
 * médiathèque, enregistrement / suppression distants, et — via le socle
 * `entity-translation` — édition bilingue EN PLACE (allow-list `ZONE_CODEC`).
 * Le double écrit FR (`upsertCampusPOI` + `updateSiteSettings`) reste inchangé.
 */
export function useCampusZoneEditor({
    campusPOIs,
    setCampusPOIs,
    showToast,
}: UseCampusZoneEditorArgs): UseCampusZoneEditorResult {
    const [, startTransition] = useTransition();
    const [editingPOI, setEditingPOI] = useState<POI | null>(null);
    const [showMediaPicker, setShowMediaPicker] = useState(false);

    /** Point d'écriture du POI source français. */
    const setSourcePOI = useCallback<Dispatch<SetStateAction<POI>>>(
        (value) => {
            setEditingPOI((previous) => {
                if (!previous) return previous;
                return typeof value === 'function'
                    ? (value as (prev: POI) => POI)(previous)
                    : value;
            });
        },
        []
    );

    const locale = useEntityEditorLocale({
        codec: ZONE_CODEC,
        entityId: editingPOI?.id ?? '',
        draft: editingPOI ?? CLOSED_POI,
        setDraft: setSourcePOI,
    });

    /** Patch des champs traduisibles (nom, catégorie, description, badge, specs). */
    const patchActive = useCallback(
        (patch: Partial<POI>) => {
            locale.setActive((prev) => ({ ...prev, ...patch }));
        },
        [locale]
    );

    /** Patch des champs techniques (visuel, géo, signalétique, statut, ordre). */
    const patchSource = useCallback(
        (patch: Partial<POI>) => {
            setSourcePOI((prev) => ({ ...prev, ...patch }));
        },
        [setSourcePOI]
    );

    const openNewZone = useCallback(() => {
        setEditingPOI(createEmptyZone(campusPOIs.length));
        locale.setLocale('fr');
    }, [campusPOIs.length, locale]);

    const openEditor = useCallback(
        (poi: POI) => {
            setEditingPOI(poi);
            locale.setLocale('fr');
        },
        [locale]
    );

    /**
     * Ferme l'éditeur. Un brouillon anglais non enregistré demande confirmation :
     * cette sortie l'abandonne (elle n'écrit jamais l'overlay).
     */
    const closeEditor = useCallback(() => {
        if (
            locale.isEnglish &&
            locale.dirty &&
            !window.confirm(
                'Des modifications anglaises ne sont pas enregistrées. Fermer l\'éditeur les abandonnera.\n\nContinuer sans enregistrer ?'
            )
        ) {
            return;
        }
        setEditingPOI(null);
        locale.setLocale('fr');
    }, [locale]);

    /**
     * Bascule de langue : confirmation si un brouillon anglais est sale, et
     * réalignement de la base avant d'ouvrir l'anglais.
     */
    const changeLocale = useCallback(
        (next: EditorLocaleOption) => {
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
        },
        [locale]
    );

    const isFieldReadOnly = useCallback(
        (field: string) =>
            locale.isReadOnlyField(field) ||
            (locale.isEnglish && (!locale.ready || !ZONE_CODEC.fields.includes(field))),
        [locale]
    );

    const openMediaPicker = useCallback(() => setShowMediaPicker(true), []);
    const closeMediaPicker = useCallback(() => setShowMediaPicker(false), []);

    /** Visuel verrouillé en anglais : toujours écrit sur la source FR. */
    const handleMediaSelect = useCallback((url: string) => {
        setEditingPOI((prev) => (prev ? { ...prev, image_url: url } : prev));
        setShowMediaPicker(false);
    }, []);

    const handleSave = useCallback(
        (e: FormEvent) => {
            e.preventDefault();
            if (!editingPOI) return;

            /*
             * En anglais, l'action principale enregistre l'**overlay** de
             * traduction et ne touche jamais la source française (ni la table,
             * ni le miroir `site_settings`). La fermeture qui suit n'est pas
             * gardée : le brouillon vient d'être persisté.
             */
            if (locale.isEnglish) {
                void locale.saveTranslation().then((result) => {
                    if (!result.success) return;
                    setEditingPOI(null);
                    locale.setLocale('fr');
                    showToast('Traduction anglaise de la zone enregistrée.');
                });
                return;
            }

            const target = editingPOI;
            const exists = campusPOIs.some((p) => p.id === target.id);
            const nextList: POI[] = exists
                ? campusPOIs.map((p) => (p.id === target.id ? target : p))
                : [...campusPOIs, target];

            setCampusPOIs(nextList);
            setEditingPOI(null);
            locale.setLocale('fr');
            showToast(`Zone "${target.name}" enregistrée !`);

            startTransition(async () => {
                await upsertCampusPOI(target);
                await updateSiteSettings('campus_pois', { list: nextList });
            });
        },
        [campusPOIs, editingPOI, setCampusPOIs, showToast, startTransition, locale]
    );

    const handleDelete = useCallback(
        (id: string) => {
            if (!confirm('Supprimer cet aménagement du campus ?')) return;

            const nextList = campusPOIs.filter((p) => p.id !== id);
            setCampusPOIs(nextList);

            showToast('Zone supprimée.');

            startTransition(async () => {
                await deleteCampusPOI(id);
                await updateSiteSettings('campus_pois', { list: nextList });
            });
        },
        [campusPOIs, setCampusPOIs, showToast, startTransition]
    );

    return {
        editingPOI,
        activePOI: locale.active,
        setActivePOI: locale.setActive,
        patchActive,
        patchSource,
        locale,
        changeLocale,
        isFieldReadOnly,
        showMediaPicker,
        openNewZone,
        openEditor,
        closeEditor,
        openMediaPicker,
        closeMediaPicker,
        handleMediaSelect,
        handleSave,
        handleDelete,
    };
}
