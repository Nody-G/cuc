'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import {
    DEFAULT_NAVIGATION,
    type NavChildItem,
    type NavItem,
    type NavigationStructure,
} from '@/data/navigation';
import { getNavigation, upsertNavigation } from '@/lib/data/site-service';
import type { EditorLocaleOption } from '../ui';
import { useLabelsEditorLocale } from '../entity-translation/useLabelsEditorLocale';
import { navigationLabelsCodec, type LabelsRow } from '../entity-translation/labels-codec';
import type { EntityEditorLocale } from '../entity-translation/entity-translation.contract';
import { useNavigationSourceActions } from './useNavigationSourceActions';
import { sortedItems, updateChildIn, updateItemIn } from './navigation-form';

/** Codec de l'overlay `navigation` — constante de module (identité stable). */
const NAVIGATION_CODEC = navigationLabelsCodec();

export interface UseNavigationEditorArgs {
    showToast: (msg: string) => void;
}

export interface UseNavigationEditorResult {
    structure: NavigationStructure;
    items: NavItem[];
    isPublished: boolean;
    isLoading: boolean;
    isPending: boolean;
    isDirty: boolean;
    expandedId: string | null;
    setPublished: (value: boolean) => void;
    moveItem: (index: number, direction: -1 | 1) => void;
    updateItem: (id: string, updates: Partial<NavItem>) => void;
    removeItem: (id: string) => void;
    addItem: () => void;
    toggleExpanded: (id: string) => void;
    /** Déplie une entrée sans la refermer si elle l'était déjà. */
    expandItem: (id: string) => void;
    updateChild: (parentId: string, childId: string, updates: Partial<NavChildItem>) => void;
    moveChild: (parentId: string, index: number, direction: -1 | 1) => void;
    removeChild: (parentId: string, childId: string) => void;
    addChild: (parentId: string) => void;
    updateCta: (updates: Partial<NavigationStructure['cta']>) => void;
    handleSave: () => void;
    handleReset: () => void;
    /** Édition anglaise active : les contrôles structurels sont verrouillés. */
    isEnglish: boolean;
    /** Brouillon actif : français en FR, contenu localisé en EN. */
    activeStructure: NavigationStructure;
    /** État bilingue complet, consommé par l'en-tête (barre FR | EN). */
    locale: EntityEditorLocale<NavigationStructure>;
    /** Bascule de langue avec garde-fou sur un brouillon anglais non enregistré. */
    changeLocale: (next: EditorLocaleOption) => void;
    /** Verrou générique d'un champ en anglais (médias / technique). */
    isFieldReadOnly: (field: string) => boolean;
}

/**
 * État et écritures de la navigation principale.
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1) : le brouillon source FR,
 * le brouillon actif (FR en FR, localisé en EN) et — depuis WS-7 — l'édition
 * bilingue EN PLACE via `useEntityEditorLocale`. Seuls les **libellés** sont
 * traduisibles : liens, ordre et visibilité restent des données françaises.
 */
export function useNavigationEditor({
    showToast,
}: UseNavigationEditorArgs): UseNavigationEditorResult {
    const [structure, setStructure] = useState<NavigationStructure>(DEFAULT_NAVIGATION.structure);
    const [isPublished, setIsPublished] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isDirty, setIsDirty] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const mutateStructure = useCallback((next: NavigationStructure) => {
        setStructure(next);
        setIsDirty(true);
    }, []);

    /**
     * Édition EN PLACE : le codec `navigation` projette la structure vers
     * l'overlay `labels` (clés = `item.id` / `child.id`) et rend la structure
     * active. Le français reste la source ; rien n'est chargé en FR.
     */
    const labelsEditor = useLabelsEditorLocale<NavigationStructure, LabelsRow>({
        codec: NAVIGATION_CODEC,
        entityId: 'main',
        draft: structure,
        setDraft: setStructure,
    });

    const locale = labelsEditor.locale;
    const isEnglish = labelsEditor.isEnglish;
    /** Structure affichée : libellés localisés en EN, français sinon. */
    const activeStructure = labelsEditor.active;

    /**
     * Écriture du brouillon affiché : en FR le français (marqué modifié) ; en EN
     * l'overlay uniquement — le codec ne laisse passer que les libellés.
     */
    const commit = useCallback(
        (next: NavigationStructure) => {
            if (isEnglish) labelsEditor.setActive(next);
            else mutateStructure(next);
        },
        [isEnglish, labelsEditor, mutateStructure]
    );

    useEffect(() => {
        let cancelled = false;
        getNavigation('main')
            .then((nav) => {
                if (cancelled) return;
                setStructure(nav.structure);
                setIsPublished(nav.is_published);
                setIsDirty(false);
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    // --- Champs traduisibles (libellés d'entrées et de sous-entrées) ---

    const updateItem = useCallback(
        (id: string, updates: Partial<NavItem>) => {
            // En EN, seul `label` peut atteindre ici (les autres champs sont
            // verrouillés) ; le codec écarte de toute façon tout le reste.
            commit(updateItemIn(activeStructure, id, updates));
        },
        [commit, activeStructure]
    );

    const updateChild = useCallback(
        (parentId: string, childId: string, updates: Partial<NavChildItem>) => {
            commit(updateChildIn(activeStructure, parentId, childId, updates));
        },
        [commit, activeStructure]
    );

    // --- Édition bilingue ---
    // Locale, réalignement anti-clés-orphelines et verrous de champs sont portés
    // par `useLabelsEditorLocale` (mécanique partagée avec le pied de page).

    const changeLocale = labelsEditor.changeLocale;
    const isFieldReadOnly = labelsEditor.isFieldReadOnly;

    // --- Persistance ---

    /**
     * Action principale de l'écran : en anglais elle enregistre l'**overlay** des
     * libellés et laisse la source française intacte ; en français la sémantique
     * structurelle existante est conservée à l'identique.
     */
    const handleSave = useCallback(() => {
        if (isEnglish) {
            void locale.saveTranslation().then((result) => {
                showToast(
                    result.success
                        ? 'Traduction anglaise de la navigation enregistrée.'
                        : 'Échec de l\'enregistrement de la traduction.'
                );
            });
            return;
        }

        startTransition(async () => {
            const ok = await upsertNavigation(structure, { id: 'main', isPublished });
            if (ok) {
                setIsDirty(false);
            }
            showToast(
                ok
                    ? 'Navigation enregistrée — la vitrine est mise à jour en direct.'
                    : 'Échec de l\'enregistrement de la navigation.'
            );
        });
    }, [isEnglish, locale, structure, isPublished, showToast, startTransition]);

    /**
     * Mutation structurelle FR (ordre, ajout / retrait, CTA, publication,
     * réinitialisation) : extraite pour garder ce hook sous le plafond de
     * lignes et respecter la séparation des responsabilités.
     */
    const sourceActions = useNavigationSourceActions({
        structure,
        setStructure,
        mutateStructure,
        setIsDirty,
        setIsPublished,
        setExpandedId,
        isEnglish,
        showToast,
    });

    return {
        structure,
        items: sortedItems(activeStructure),
        isPublished,
        isLoading,
        isPending,
        isDirty,
        expandedId,
        updateItem,
        updateChild,
        handleSave,
        isEnglish,
        activeStructure,
        locale,
        changeLocale,
        isFieldReadOnly,
        ...sourceActions,
    };
}
