'use client';

import { useState } from 'react';
import type { SiteEvent } from '@/lib/data/site-service';
import { upsertEvent, deleteEvent } from '@/app/(admin)/admin/actions';
import { createEmptyEvent } from './events-form';

export interface EventsEditor {
    events: SiteEvent[];
    editingEvent: SiteEvent | null;
    setEditingEvent: React.Dispatch<React.SetStateAction<SiteEvent | null>>;
    showMediaPicker: boolean;
    setShowMediaPicker: React.Dispatch<React.SetStateAction<boolean>>;
    featureInput: string;
    setFeatureInput: React.Dispatch<React.SetStateAction<string>>;
    startCreate: () => void;
    handleSave: (e: React.FormEvent) => Promise<void>;
    handleDelete: (id: string, title: string) => Promise<void>;
    handleAddFeature: () => void;
    handleRemoveFeature: (index: number) => void;
    applySelectedImage: (url: string) => void;
}

/**
 * Orchestration de l'éditeur de prestations : édition locale optimiste,
 * enregistrement / suppression distants et gestion des atouts.
 */
export function useEventsEditor(
    events: SiteEvent[],
    onEventSaved: (event: SiteEvent) => void,
    onEventDeleted: (id: string) => void,
    showToast: (msg: string) => void
): EventsEditor {
    const [editingEvent, setEditingEvent] = useState<SiteEvent | null>(null);
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [featureInput, setFeatureInput] = useState('');

    const startCreate = () => setEditingEvent(createEmptyEvent(events));

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingEvent) return;

        const eventToSave = { ...editingEvent };
        onEventSaved(eventToSave);
        setEditingEvent(null);
        showToast(`Prestation "${eventToSave.title}" enregistrée !`);

        await upsertEvent({
            id: eventToSave.id,
            title: eventToSave.title,
            subtitle: eventToSave.subtitle,
            badge: eventToSave.badge,
            description: eventToSave.description,
            features: eventToSave.features,
            price_indicator: eventToSave.price_indicator,
            cta_text: eventToSave.cta_text,
            cta_link: eventToSave.cta_link,
            image_url: eventToSave.image_url,
            order_index: eventToSave.order_index,
        });
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Supprimer la prestation "${title}" ?`)) return;

        onEventDeleted(id);
        showToast(`Prestation "${title}" supprimée`);
        await deleteEvent(id);
    };

    const handleAddFeature = () => {
        if (!featureInput.trim() || !editingEvent) return;
        setEditingEvent({
            ...editingEvent,
            features: [...(editingEvent.features || []), featureInput.trim()],
        });
        setFeatureInput('');
    };

    const handleRemoveFeature = (index: number) => {
        if (!editingEvent) return;
        setEditingEvent({
            ...editingEvent,
            features: (editingEvent.features || []).filter((_, i) => i !== index),
        });
    };

    const applySelectedImage = (url: string) => {
        if (editingEvent) {
            setEditingEvent({ ...editingEvent, image_url: url });
        }
        setShowMediaPicker(false);
    };

    return {
        events,
        editingEvent,
        setEditingEvent,
        showMediaPicker,
        setShowMediaPicker,
        featureInput,
        setFeatureInput,
        startCreate,
        handleSave,
        handleDelete,
        handleAddFeature,
        handleRemoveFeature,
        applySelectedImage,
    };
}
