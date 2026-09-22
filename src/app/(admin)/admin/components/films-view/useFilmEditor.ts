'use client';

import { useState, useTransition } from 'react';
import type { FilmCredit } from '@/types';
import { upsertFilm, deleteFilm } from '@/app/(admin)/admin/actions';
import { createEmptyFilm, normalizeDoubledActors } from './film-form';

export interface UseFilmEditorArgs {
    setFilms: React.Dispatch<React.SetStateAction<FilmCredit[]>>;
    showToast: (msg: string) => void;
}

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

    const openCreate = () => setEditingFilm(createEmptyFilm());
    const openEdit = (film: FilmCredit) => setEditingFilm(film);
    const closeEditor = () => setEditingFilm(null);

    /** Patch de la fiche en cours : point d'écriture unique des champs du formulaire. */
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

        const updated: FilmCredit = {
            ...editingFilm,
            doubledActors: normalizeDoubledActors(editingFilm),
        };

        setFilms((prev) => {
            const exists = prev.some((f) => f.id === updated.id);
            if (exists) return prev.map((f) => (f.id === updated.id ? updated : f));
            return [...prev, updated];
        });
        setEditingFilm(null);
        showToast('Projet enregistré au catalogue !');

        startTransition(async () => {
            await upsertFilm({
                id: updated.id,
                title: updated.title,
                year: updated.year,
                category: updated.category,
                director: updated.director,
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
        if (editingFilm) {
            setEditingFilm({ ...editingFilm, image: url });
        }
        setShowMediaPicker(false);
    };

    return {
        editingFilm,
        patchEditing,
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
