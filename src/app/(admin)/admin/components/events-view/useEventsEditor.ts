'use client';

import { useCallback, useState } from 'react';
import type { Dispatch, FormEvent, SetStateAction } from 'react';
import type { SiteEvent } from '@/lib/data/site-service';
import { upsertEvent, deleteEvent } from '@/app/(admin)/admin/actions';
import type { EditorLocaleOption } from '../ui';
import { useEntityEditorLocale } from '../entity-translation/useEntityEditorLocale';
import { EVENT_CODEC } from '../entity-translation/entity-codec';
import type { EntityEditorLocale } from '../entity-translation/entity-translation.contract';
import { createEmptyEvent } from './events-form';

export interface EventsEditor {
    events: SiteEvent[];
    /** Prestation source française (médiathèque, enregistrement FR). */
    editingEvent: SiteEvent | null;
    /** Brouillon actif : français en FR, contenu localisé en EN. */
    activeEvent: SiteEvent;
    /** Écriture du brouillon actif (mêmes champs, locale courante). */
    setActiveEvent: Dispatch<SetStateAction<SiteEvent>>;
    /** Écriture des champs techniques (image, lien, ordre) : source française. */
    patchSourceEvent: (patch: Partial<SiteEvent>) => void;
    /** État bilingue complet, consommé par l'en-tête de la modale. */
    locale: EntityEditorLocale<SiteEvent>;
    changeLocale: (next: EditorLocaleOption) => void;
    isFieldReadOnly: (field: string) => boolean;
    showMediaPicker: boolean;
    setShowMediaPicker: Dispatch<SetStateAction<boolean>>;
    featureInput: string;
    setFeatureInput: Dispatch<SetStateAction<string>>;
    startCreate: () => void;
    openEditor: (event: SiteEvent) => void;
    closeEditor: () => void;
    handleSave: (e: FormEvent) => Promise<void>;
    handleDelete: (id: string, title: string) => Promise<void>;
    handleAddFeature: () => void;
    handleRemoveFeature: (index: number) => void;
    applySelectedImage: (url: string) => void;
}

/** Prestation neutre : brouillon inerte passé au socle bilingue hors édition. */
const CLOSED_EVENT: SiteEvent = { id: '', title: '' };

/**
 * Orchestration de l'éditeur de prestations : édition locale optimiste,
 * enregistrement / suppression distants, atouts et — via le socle
 * `entity-translation` — édition bilingue EN PLACE (allow-list `EVENT_CODEC`).
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

    /** Point d'écriture de la prestation source française. */
    const setSourceEvent = useCallback<Dispatch<SetStateAction<SiteEvent>>>(
        (value) => {
            setEditingEvent((previous) => {
                if (!previous) return previous;
                return typeof value === 'function'
                    ? (value as (prev: SiteEvent) => SiteEvent)(previous)
                    : value;
            });
        },
        []
    );

    /**
     * Édition EN PLACE : le hook partagé projette la prestation ouverte vers
     * l'overlay `event` (allow-list de `EVENT_CODEC`). Tant qu'aucune prestation
     * n'est ouverte, `entityId` est vide et la locale reste `fr`.
     */
    const locale = useEntityEditorLocale({
        codec: EVENT_CODEC,
        entityId: editingEvent?.id ?? '',
        draft: editingEvent ?? CLOSED_EVENT,
        setDraft: setSourceEvent,
    });

    const patchSourceEvent = useCallback(
        (patch: Partial<SiteEvent>) => {
            setSourceEvent((prev) => ({ ...prev, ...patch }));
        },
        [setSourceEvent]
    );

    /** Ouvre l'éditeur d'une prestation : on repart toujours de la source FR. */
    const openEditor = (event: SiteEvent) => {
        setEditingEvent(event);
        locale.setLocale('fr');
    };

    /**
     * Ferme l'éditeur : locale retombée en FR avant que `entityId` ne se vide.
     * Un brouillon anglais non enregistré demande confirmation — cette sortie
     * l'abandonne et n'écrit jamais l'overlay.
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
        setEditingEvent(null);
        locale.setLocale('fr');
    };

    const startCreate = () => {
        setEditingEvent(createEmptyEvent(events));
        locale.setLocale('fr');
    };

    /**
     * Bascule de langue. Une saisie anglaise non enregistrée demande
     * confirmation, et l'ouverture de l'anglais réaligne d'abord la base
     * (`revertTranslation`) dans le même rendu : le brouillon FR n'est jamais
     * servi comme traduction (comportement `keepDraft` du socle).
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
     * Garde de champ : verrous médias/technique du socle, plus tout champ hors
     * allow-list tant que l'overlay anglais n'est pas chargé.
     */
    const isFieldReadOnly = (field: string) =>
        locale.isReadOnlyField(field) ||
        (locale.isEnglish && (!locale.ready || !EVENT_CODEC.fields.includes(field)));

    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        if (!editingEvent) return;

        /*
         * En anglais, l'action principale enregistre l'**overlay** de traduction
         * et ne persiste jamais la prestation française. La fermeture qui suit
         * n'est pas gardée : le brouillon vient d'être persisté.
         */
        if (locale.isEnglish) {
            const result = await locale.saveTranslation();
            if (!result.success) return;
            setEditingEvent(null);
            locale.setLocale('fr');
            showToast('Traduction anglaise de la prestation enregistrée.');
            return;
        }

        const eventToSave = { ...editingEvent };
        onEventSaved(eventToSave);
        closeEditor();
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

    /** `features` est un tableau traduisible : écriture via le brouillon actif. */
    const handleAddFeature = () => {
        if (!featureInput.trim()) return;
        locale.setActive((prev) => ({
            ...prev,
            features: [...(prev.features || []), featureInput.trim()],
        }));
        setFeatureInput('');
    };

    const handleRemoveFeature = (index: number) => {
        locale.setActive((prev) => ({
            ...prev,
            features: (prev.features || []).filter((_, i) => i !== index),
        }));
    };

    /** Média verrouillé en anglais : il s'écrit toujours sur la source FR. */
    const applySelectedImage = (url: string) => {
        if (editingEvent) {
            setSourceEvent({ ...editingEvent, image_url: url });
        }
        setShowMediaPicker(false);
    };

    return {
        events,
        editingEvent,
        activeEvent: locale.active,
        setActiveEvent: locale.setActive,
        patchSourceEvent,
        locale,
        changeLocale,
        isFieldReadOnly,
        showMediaPicker,
        setShowMediaPicker,
        featureInput,
        setFeatureInput,
        startCreate,
        openEditor,
        closeEditor,
        handleSave,
        handleDelete,
        handleAddFeature,
        handleRemoveFeature,
        applySelectedImage,
    };
}
