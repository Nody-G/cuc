'use client';

import React, { useCallback, useState, useTransition } from 'react';
import type { Instructor } from '@/types';
import { upsertTeamMember, deleteTeamMember } from '@/app/(admin)/admin/actions';
import type { EditorLocaleOption } from '../ui';
import { useEntityEditorLocale } from '../entity-translation/useEntityEditorLocale';
import { TEAM_CODEC } from '../entity-translation/entity-codec';

export interface UseTeamEditingArgs {
    setTeam: React.Dispatch<React.SetStateAction<Instructor[]>>;
    showToast: (msg: string) => void;
}

/** Fiche neutre : brouillon inerte passé au socle bilingue hors édition. */
const CLOSED_MEMBER: Instructor = {
    id: '',
    name: '',
    role: '',
    title: '',
    specialties: [],
    bio: '',
    notableCredits: [],
};

/**
 * Normalise un champ liste : tableau conservé, chaîne « a, b » découpée,
 * tout le reste → tableau vide (les fiches historiques portaient des chaînes).
 */
function toStringList(value: unknown): string[] {
    if (Array.isArray(value)) return value as string[];
    if (typeof value === 'string') {
        return value.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
}

/**
 * État et écritures de la liste des formateurs (Cockpit).
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1) : la fiche en édition, le
 * modal médiathèque, l'enregistrement (optimiste + Server Action), la
 * suppression et — depuis WS-1 — l'édition bilingue EN PLACE via le socle
 * `entity-translation`. La vue ne fait que consommer ce contrat.
 */
export function useTeamEditing({ setTeam, showToast }: UseTeamEditingArgs) {
    const [, startTransition] = useTransition();
    const [editingMember, setEditingMember] = useState<Instructor | null>(null);
    const [showMediaPickerTeam, setShowMediaPickerTeam] = useState(false);

    /**
     * Point d'écriture de la fiche **source française**. La fiche reste la
     * propriété de ce hook ; le socle bilingue ne fait que l'orchestrer.
     */
    const setSourceMember = useCallback<React.Dispatch<React.SetStateAction<Instructor>>>(
        (value) => {
            setEditingMember((previous) => {
                if (!previous) return previous;
                return typeof value === 'function'
                    ? (value as (prev: Instructor) => Instructor)(previous)
                    : value;
            });
        },
        []
    );

    /**
     * Édition EN PLACE : le hook partagé projette la fiche ouverte vers
     * l'overlay `team` (allow-list de `TEAM_CODEC`) et rend le brouillon actif.
     * Tant qu'aucune fiche n'est ouverte, `entityId` est vide et la locale
     * reste `fr` : aucun chargement n'est émis.
     */
    const locale = useEntityEditorLocale({
        codec: TEAM_CODEC,
        entityId: editingMember?.id ?? '',
        draft: editingMember ?? CLOSED_MEMBER,
        setDraft: setSourceMember,
    });

    /** Ouvre l'éditeur : on repart toujours de la source française. */
    const openEditor = (member: Instructor) => {
        setEditingMember(member);
        locale.setLocale('fr');
    };

    /**
     * Ferme l'éditeur. Un brouillon anglais non enregistré demande confirmation :
     * cette sortie abandonne la saisie (elle n'écrit jamais l'overlay). Les deux
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
        setEditingMember(null);
        locale.setLocale('fr');
    };

    /**
     * Bascule de langue. En français, une retouche des champs traduisibles
     * marque le brouillon « non enregistré » (l'overlay n'est pas encore
     * chargé) : réaligner la base avant d'ouvrir l'anglais évite de servir du
     * français comme traduction. Quitter l'anglais avec une saisie non
     * enregistrée demande confirmation.
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
     * Garde de champ : en anglais, seuls les champs de l'allow-list du codec
     * restent éditables, et seulement une fois l'overlay chargé ; les verrous
     * médias/technique viennent du socle.
     */
    const isFieldReadOnly = (field: string) =>
        locale.isReadOnlyField(field) ||
        (locale.isEnglish && (!locale.ready || !TEAM_CODEC.fields.includes(field)));

    const handleSaveTeamMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMember) return;

        /*
         * En anglais, l'action principale enregistre l'**overlay** de traduction
         * et ne touche jamais la ligne française : enregistrer la source ici
         * écraserait la saisie anglaise en cours. La fermeture qui suit n'est pas
         * gardée (le brouillon vient d'être persisté).
         */
        if (locale.isEnglish) {
            void locale.saveTranslation().then((result) => {
                if (!result.success) return;
                setEditingMember(null);
                locale.setLocale('fr');
                showToast('Traduction anglaise enregistrée.');
            });
            return;
        }

        const updated: Instructor = {
            ...editingMember,
            specialties: toStringList(editingMember.specialties),
            doubledActors: toStringList(editingMember.doubledActors),
            notableCredits: toStringList(editingMember.notableCredits),
            featuredCredits: Array.isArray(editingMember.featuredCredits)
                ? editingMember.featuredCredits
                : [],
            creditsDisplayLimit:
                typeof editingMember.creditsDisplayLimit === 'number' && editingMember.creditsDisplayLimit > 0
                    ? editingMember.creditsDisplayLimit
                    : 8,
        };

        setTeam((prev) => {
            const exists = prev.some((m) => m.id === updated.id);
            if (exists) return prev.map((m) => (m.id === updated.id ? updated : m));
            return [...prev, updated];
        });
        closeEditor();
        showToast(`Formateur "${updated.name}" enregistré.`);

        startTransition(async () => {
            await upsertTeamMember({
                id: updated.id,
                name: updated.name,
                role: updated.role,
                title: updated.title,
                avatar_url: updated.avatarUrl,
                bio: updated.bio,
                specialties: updated.specialties,
                doubled_actors: updated.doubledActors,
                notable_credits: updated.notableCredits,
                featured_credits: updated.featuredCredits,
                credits_display_limit: updated.creditsDisplayLimit,
                instagram: updated.instagram,
                imdb: updated.imdb,
                external_url: updated.externalUrl,
                profile_id: updated.profile_id,
                metadata: updated.metadata,
            });
        });
    };

    const handleDeleteTeamMember = (id: string, name: string) => {
        if (!confirm(`Supprimer définitivement le formateur "${name}" ?`)) return;

        setTeam((prev) => prev.filter((m) => m.id !== id));
        showToast(`Formateur "${name}" supprimé.`);

        startTransition(async () => {
            await deleteTeamMember(id);
        });
    };

    return {
        startTransition,
        /** Fiche source française (colonne Filmographie, médiathèque, save FR). */
        editingMember,
        setEditingMember,
        /** Écriture de la source française (colonnes verrouillées en anglais). */
        setSourceMember,
        /** Brouillon actif : français en FR, contenu localisé en EN. */
        activeMember: locale.active,
        /** Écriture du brouillon actif (mêmes champs, locale courante). */
        setActiveMember: locale.setActive,
        /** État bilingue complet, consommé par l'en-tête de la modale. */
        locale,
        changeLocale,
        isFieldReadOnly,
        openEditor,
        closeEditor,
        showMediaPickerTeam,
        setShowMediaPickerTeam,
        handleSaveTeamMember,
        handleDeleteTeamMember,
    };
}
