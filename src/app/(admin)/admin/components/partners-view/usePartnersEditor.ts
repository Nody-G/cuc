'use client';

/**
 * Orchestration de l'éditeur de partenaires : fiche en cours d'édition, filtre
 * de catégorie, sélecteur média et écritures.
 *
 * La mise à jour de la liste reste **optimiste et portée par le parent**
 * (`onPartnerSaved` / `onPartnerDeleted`) ; l'action serveur suit — c'est le
 * comportement d'origine, conservé à l'identique.
 */

import { useState } from 'react';
import { deletePartner, upsertPartner } from '@/app/(admin)/admin/actions';
import type { SitePartner } from '@/lib/data/site-service';
import {
    createEmptyPartner,
    filterPartnersByCategory,
    toPartnerUpsertPayload,
} from './partners-model';

export interface UsePartnersEditorOptions {
    partners: SitePartner[];
    onPartnerSaved: (partner: SitePartner) => void;
    onPartnerDeleted: (id: string) => void;
    showToast: (msg: string) => void;
}

export interface PartnersEditor {
    editingPartner: SitePartner | null;
    showMediaPicker: boolean;
    filterCategory: string;
    filteredPartners: SitePartner[];
    setFilterCategory: (category: string) => void;
    startCreate: () => void;
    startEdit: (partner: SitePartner) => void;
    closeEditor: () => void;
    updateDraft: (patch: Partial<SitePartner>) => void;
    openMediaPicker: () => void;
    closeMediaPicker: () => void;
    applyLogo: (url: string) => void;
    submit: (event: React.FormEvent) => Promise<void>;
    remove: (id: string, name: string) => Promise<void>;
}

export function usePartnersEditor({
    partners,
    onPartnerSaved,
    onPartnerDeleted,
    showToast,
}: UsePartnersEditorOptions): PartnersEditor {
    const [editingPartner, setEditingPartner] = useState<SitePartner | null>(null);
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [filterCategory, setFilterCategory] = useState<string>('all');

    const startCreate = () => setEditingPartner(createEmptyPartner(partners.length + 1));

    const startEdit = (partner: SitePartner) => setEditingPartner(partner);

    const closeEditor = () => setEditingPartner(null);

    const updateDraft = (patch: Partial<SitePartner>) =>
        setEditingPartner((prev) => (prev ? { ...prev, ...patch } : prev));

    const openMediaPicker = () => setShowMediaPicker(true);

    const closeMediaPicker = () => setShowMediaPicker(false);

    const applyLogo = (url: string) => {
        setEditingPartner((prev) => (prev ? { ...prev, logo_url: url } : prev));
        setShowMediaPicker(false);
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPartner) return;

        const partnerToSave = { ...editingPartner };
        onPartnerSaved(partnerToSave);
        setEditingPartner(null);
        showToast(`Partenaire "${partnerToSave.name}" enregistré !`);

        await upsertPartner(toPartnerUpsertPayload(partnerToSave));
    };

    const remove = async (id: string, name: string) => {
        if (!confirm(`Supprimer le partenaire "${name}" ?`)) return;

        onPartnerDeleted(id);
        showToast(`Partenaire "${name}" supprimé`);
        await deletePartner(id);
    };

    return {
        editingPartner,
        showMediaPicker,
        filterCategory,
        filteredPartners: filterPartnersByCategory(partners, filterCategory),
        setFilterCategory,
        startCreate,
        startEdit,
        closeEditor,
        updateDraft,
        openMediaPicker,
        closeMediaPicker,
        applyLogo,
        submit,
        remove,
    };
}
