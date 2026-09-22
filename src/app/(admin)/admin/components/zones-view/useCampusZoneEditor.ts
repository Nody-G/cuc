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
import { createEmptyZone } from './zone-form';

export interface UseCampusZoneEditorArgs {
    campusPOIs: POI[];
    setCampusPOIs: Dispatch<SetStateAction<POI[]>>;
    showToast: (msg: string) => void;
}

export interface UseCampusZoneEditorResult {
    editingPOI: POI | null;
    showMediaPicker: boolean;
    openNewZone: () => void;
    openEditor: (poi: POI) => void;
    closeEditor: () => void;
    updateDraft: (patch: Partial<POI>) => void;
    openMediaPicker: () => void;
    closeMediaPicker: () => void;
    handleMediaSelect: (url: string) => void;
    handleSave: (e: FormEvent) => void;
    handleDelete: (id: string) => void;
}

export function useCampusZoneEditor({
    campusPOIs,
    setCampusPOIs,
    showToast,
}: UseCampusZoneEditorArgs): UseCampusZoneEditorResult {
    const [, startTransition] = useTransition();
    const [editingPOI, setEditingPOI] = useState<POI | null>(null);
    const [showMediaPicker, setShowMediaPicker] = useState(false);

    const openNewZone = useCallback(() => {
        setEditingPOI(createEmptyZone(campusPOIs.length));
    }, [campusPOIs.length]);

    const openEditor = useCallback((poi: POI) => {
        setEditingPOI(poi);
    }, []);

    const closeEditor = useCallback(() => {
        setEditingPOI(null);
    }, []);

    const updateDraft = useCallback((patch: Partial<POI>) => {
        setEditingPOI((prev) => (prev ? { ...prev, ...patch } : prev));
    }, []);

    const openMediaPicker = useCallback(() => setShowMediaPicker(true), []);
    const closeMediaPicker = useCallback(() => setShowMediaPicker(false), []);

    const handleMediaSelect = useCallback((url: string) => {
        setEditingPOI((prev) => (prev ? { ...prev, image_url: url } : prev));
        setShowMediaPicker(false);
    }, []);

    const handleSave = useCallback(
        (e: FormEvent) => {
            e.preventDefault();
            if (!editingPOI) return;

            const target = editingPOI;
            const exists = campusPOIs.some((p) => p.id === target.id);
            const nextList: POI[] = exists
                ? campusPOIs.map((p) => (p.id === target.id ? target : p))
                : [...campusPOIs, target];

            setCampusPOIs(nextList);
            setEditingPOI(null);
            showToast(`Zone "${target.name}" enregistrée !`);

            startTransition(async () => {
                await upsertCampusPOI(target);
                await updateSiteSettings('campus_pois', { list: nextList });
            });
        },
        [campusPOIs, editingPOI, setCampusPOIs, showToast, startTransition],
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
        [campusPOIs, setCampusPOIs, showToast, startTransition],
    );

    return {
        editingPOI,
        showMediaPicker,
        openNewZone,
        openEditor,
        closeEditor,
        updateDraft,
        openMediaPicker,
        closeMediaPicker,
        handleMediaSelect,
        handleSave,
        handleDelete,
    };
}
