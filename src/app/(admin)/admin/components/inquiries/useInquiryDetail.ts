'use client';

import { useState } from 'react';
import type { SiteInquiry } from '@/lib/data/site-service';
import { parseNotesAndChecklist, serializeNotesAndChecklist } from './checklist';
import { RESPONSE_TEMPLATES } from './templates';
import type { ConvertInquiryResult, PersistNotesResult, RemoveInquiryResult } from './useInquiriesData';

export interface UseInquiryDetailArgs {
    /** Liste courante : la fiche ouverte en est dérivée par identifiant. */
    inquiries: SiteInquiry[];
    showToast: (msg: string) => void;
    persistNotes: (id: string, serialized: string) => Promise<PersistNotesResult>;
    removeInquiry: (id: string) => Promise<RemoveInquiryResult>;
    convertInquiry: (id: string) => Promise<ConvertInquiryResult>;
}

/**
 * Fiche candidat ouverte : sélection, notes, checklist, modèles d'email et
 * passerelle CUC Sign.
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1) — la fiche affichée est
 * **dérivée** de la liste par identifiant : toute mutation (statut, notes,
 * conversion) se répercute automatiquement dans la modale, sans double état.
 */
export function useInquiryDetail({
    inquiries,
    showToast,
    persistNotes,
    removeInquiry,
    convertInquiry,
}: UseInquiryDetailArgs) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [editingNotes, setEditingNotes] = useState('');
    const [currentChecklist, setCurrentChecklist] = useState<Record<string, boolean>>({});
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>(RESPONSE_TEMPLATES[0].id);
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [copiedTemplate, setCopiedTemplate] = useState(false);
    const [isConverting, setIsConverting] = useState(false);

    const selectedInquiry = selectedId
        ? inquiries.find((item) => item.id === selectedId) ?? null
        : null;

    const openInquiryModal = (inq: SiteInquiry) => {
        const { checklist, notes } = parseNotesAndChecklist(inq.admin_notes || '');
        setSelectedId(inq.id);
        setEditingNotes(notes);
        setCurrentChecklist(checklist);
        setSelectedTemplateId(RESPONSE_TEMPLATES[0].id);
        setCopiedTemplate(false);
    };

    const closeInquiryModal = () => setSelectedId(null);

    const selectTemplate = (id: string) => {
        setSelectedTemplateId(id);
        setCopiedTemplate(false);
    };

    const saveNotes = async () => {
        if (!selectedInquiry) return;
        setIsSavingNotes(true);
        const serialized = serializeNotesAndChecklist(currentChecklist, editingNotes);
        const res = await persistNotes(selectedInquiry.id, serialized);
        setIsSavingNotes(false);
        if (res.success) {
            showToast('Note administrative enregistrée !');
        } else {
            showToast(`Erreur : ${res.error}`);
        }
    };

    const toggleChecklist = async (stepId: string) => {
        if (!selectedInquiry) return;
        const updatedChecklist = {
            ...currentChecklist,
            [stepId]: !currentChecklist[stepId],
        };
        setCurrentChecklist(updatedChecklist);
        const serialized = serializeNotesAndChecklist(updatedChecklist, editingNotes);
        const res = await persistNotes(selectedInquiry.id, serialized);
        if (res.success) {
            showToast('Suivi candidat mis à jour !');
        }
    };

    const copyTemplate = (subject: string, body: string) => {
        navigator.clipboard.writeText(`${subject}\n\n${body}`);
        setCopiedTemplate(true);
        showToast('Modèle d\'email copié dans le presse-papier !');
        setTimeout(() => setCopiedTemplate(false), 2500);
    };

    const deleteSelected = async () => {
        if (!selectedInquiry) return;
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) return;
        const res = await removeInquiry(selectedInquiry.id);
        if (res.success) {
            showToast('Demande supprimée avec succès.');
            setSelectedId(null);
        } else {
            showToast(`Erreur : ${res.error}`);
        }
    };

    const convertSelected = async () => {
        if (!selectedInquiry) return;
        setIsConverting(true);
        try {
            const res = await convertInquiry(selectedInquiry.id);
            if (res.success) {
                showToast(res.message || 'Élève créé avec succès dans CUC Sign !');
            } else {
                showToast(`Erreur : ${res.error}`);
            }
        } finally {
            setIsConverting(false);
        }
    };

    return {
        selectedInquiry,
        openInquiryModal,
        closeInquiryModal,
        editingNotes,
        setEditingNotes,
        currentChecklist,
        toggleChecklist,
        selectedTemplateId,
        selectTemplate,
        copiedTemplate,
        copyTemplate,
        saveNotes,
        isSavingNotes,
        isConverting,
        deleteSelected,
        convertSelected,
    };
}
