'use client';

import { useState, useTransition } from 'react';
import type { Discipline } from '@/types';
import { upsertDiscipline, deleteDiscipline, updateSiteSettings } from '../../actions';
import { createEmptyDiscipline, normalizeDisciplineEquipment } from './discipline-form';

export interface UseDisciplineEditorArgs {
    disciplines: Discipline[];
    setDisciplines: React.Dispatch<React.SetStateAction<Discipline[]>>;
    showToast: (msg: string) => void;
}

/**
 * Édition d'un module : fiche en cours, enregistrement optimiste (liste mise à
 * jour immédiatement, écritures en transition), suppression, liaisons croisées
 * et sélection d'image.
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1) — les Server Actions
 * restent dans `actions/**`.
 */
export function useDisciplineEditor({
    disciplines,
    setDisciplines,
    showToast,
}: UseDisciplineEditorArgs) {
    const [, startTransition] = useTransition();
    const [editingDiscipline, setEditingDiscipline] = useState<Discipline | null>(null);
    const [showMediaPicker, setShowMediaPicker] = useState(false);

    const openCreate = () => setEditingDiscipline(createEmptyDiscipline(disciplines.length));
    const openEdit = (discipline: Discipline) => setEditingDiscipline(discipline);
    const closeEditor = () => setEditingDiscipline(null);

    /** Patch de la fiche en cours : point d'écriture unique des champs du formulaire. */
    const patchEditing = (updates: Partial<Discipline>) => {
        setEditingDiscipline((prev) => (prev ? { ...prev, ...updates } : prev));
    };

    const toggleArrayItem = (
        field: 'instructor_ids' | 'film_ids' | 'program_ids',
        id: string
    ) => {
        if (!editingDiscipline) return;
        const current = editingDiscipline[field] || [];
        const exists = current.includes(id);
        const updated = exists ? current.filter((x) => x !== id) : [...current, id];
        setEditingDiscipline({ ...editingDiscipline, [field]: updated });
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingDiscipline) return;

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

        setEditingDiscipline(null);
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

    const applyHeroImage = (url: string) => {
        if (editingDiscipline) {
            setEditingDiscipline({ ...editingDiscipline, heroImage: url });
        }
        setShowMediaPicker(false);
        showToast('Image appliquée avec succès !');
    };

    return {
        editingDiscipline,
        patchEditing,
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
