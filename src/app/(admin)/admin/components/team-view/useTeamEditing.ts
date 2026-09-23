'use client';

import React, { useState, useTransition } from 'react';
import type { Instructor } from '@/types';
import { upsertTeamMember, deleteTeamMember } from '@/app/(admin)/admin/actions';

export interface UseTeamEditingArgs {
    setTeam: React.Dispatch<React.SetStateAction<Instructor[]>>;
    showToast: (msg: string) => void;
}

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
 * modal médiathèque, l'enregistrement (optimiste + Server Action) et la
 * suppression. La vue ne fait que consommer ce contrat.
 */
export function useTeamEditing({ setTeam, showToast }: UseTeamEditingArgs) {
    const [, startTransition] = useTransition();
    const [editingMember, setEditingMember] = useState<Instructor | null>(null);
    const [showMediaPickerTeam, setShowMediaPickerTeam] = useState(false);

    const handleSaveTeamMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMember) return;

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
        setEditingMember(null);
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
        editingMember,
        setEditingMember,
        showMediaPickerTeam,
        setShowMediaPickerTeam,
        handleSaveTeamMember,
        handleDeleteTeamMember,
    };
}
