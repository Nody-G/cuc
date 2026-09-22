'use client';

import type { SitePageContent } from '@/lib/data/site-service';

export interface SectionHandlers {
    handleUpdateWorkshop: (index: number, updates: Record<string, unknown>) => void;
    handleAddWorkshop: () => void;
    handleRemoveWorkshop: (index: number) => void;
    handleUpdateFormule: (index: number, updates: Record<string, unknown>) => void;
    handleUpdateStageItem: (index: number, updates: Record<string, unknown>) => void;
    handleAddStageItem: () => void;
    handleRemoveStageItem: (index: number) => void;
    handleAddKeyStat: () => void;
    handleRemoveKeyStat: (id: string) => void;
    handleUpdateKeyStat: (
        id: string,
        updates: Partial<{ title: string; value: string; description: string }>
    ) => void;
}

export interface UseSectionHandlersArgs {
    setActiveData: React.Dispatch<React.SetStateAction<SitePageContent>>;
    /** Garde-fou : la structure (ajout/retrait de bloc) appartient au français. */
    blockStructureChangeInEnglish: (what: string) => boolean;
}

/**
 * Mutations de blocs des éditeurs thématiques (ateliers Team Building, formules
 * Formation, catalogue Stages, chiffres clés).
 *
 * Toutes les écritures passent par `setActiveData` et lisent l'état précédent :
 * en anglais, elles modifient le brouillon de traduction sans jamais écraser
 * une valeur anglaise avec la valeur française.
 */
export function useSectionHandlers({
    setActiveData,
    blockStructureChangeInEnglish,
}: UseSectionHandlersArgs): SectionHandlers {
    const handleUpdateWorkshop = (index: number, updates: Record<string, unknown>) => {
        setActiveData((prev) => {
            const currentList = Array.isArray(prev.sections_data?.workshops)
                ? [...prev.sections_data.workshops]
                : [];
            currentList[index] = { ...currentList[index], ...updates };
            return {
                ...prev,
                sections_data: {
                    ...(prev.sections_data || {}),
                    workshops: currentList,
                },
            };
        });
    };

    const handleAddWorkshop = () => {
        if (blockStructureChangeInEnglish('Les ateliers')) return;
        setActiveData((prev) => {
            const currentList = Array.isArray(prev.sections_data?.workshops)
                ? [...prev.sections_data.workshops]
                : [];
            currentList.push({
                id: `workshop_${Date.now()}`,
                title: 'Nouvel Atelier Cascade',
                category: 'Initiation & Action',
                desc: 'Description des exercices et sensations proposées aux équipes.',
                img: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Team-building-combat-cinema-1.jpg',
            });
            return {
                ...prev,
                sections_data: {
                    ...(prev.sections_data || {}),
                    workshops: currentList,
                },
            };
        });
    };

    const handleRemoveWorkshop = (index: number) => {
        if (blockStructureChangeInEnglish('Les ateliers')) return;
        setActiveData((prev) => {
            const currentList = Array.isArray(prev.sections_data?.workshops)
                ? prev.sections_data.workshops.filter((_: unknown, i: number) => i !== index)
                : [];
            return {
                ...prev,
                sections_data: {
                    ...(prev.sections_data || {}),
                    workshops: currentList,
                },
            };
        });
    };

    const handleUpdateFormule = (index: number, updates: Record<string, unknown>) => {
        setActiveData((prev) => {
            const current = prev.sections_data?.formules || {};
            const items = Array.isArray(current.items) ? [...current.items] : [];
            items[index] = { ...items[index], ...updates };
            return {
                ...prev,
                sections_data: {
                    ...(prev.sections_data || {}),
                    formules: {
                        ...current,
                        items,
                    },
                },
            };
        });
    };

    const handleUpdateStageItem = (index: number, updates: Record<string, unknown>) => {
        setActiveData((prev) => {
            const current = prev.sections_data?.stages_catalogue || {};
            const items = Array.isArray(current.items) ? [...current.items] : [];
            items[index] = { ...items[index], ...updates };
            return {
                ...prev,
                sections_data: {
                    ...(prev.sections_data || {}),
                    stages_catalogue: {
                        ...current,
                        items,
                    },
                },
            };
        });
    };

    const handleAddStageItem = () => {
        if (blockStructureChangeInEnglish('Le catalogue de stages')) return;
        setActiveData((prev) => {
            const current = prev.sections_data?.stages_catalogue || {};
            const items = Array.isArray(current.items) ? [...current.items] : [];
            items.push({
                id: `stage_${Date.now()}`,
                title: 'Nouveau Stage Thématique',
                duration: '3 Jours (21h)',
                desc: 'Description des disciplines enseignées et du niveau requis.',
            });
            return {
                ...prev,
                sections_data: {
                    ...(prev.sections_data || {}),
                    stages_catalogue: {
                        ...current,
                        items,
                    },
                },
            };
        });
    };

    const handleRemoveStageItem = (index: number) => {
        if (blockStructureChangeInEnglish('Le catalogue de stages')) return;
        setActiveData((prev) => {
            const current = prev.sections_data?.stages_catalogue || {};
            const items = Array.isArray(current.items)
                ? current.items.filter((_: unknown, i: number) => i !== index)
                : [];
            return {
                ...prev,
                sections_data: {
                    ...(prev.sections_data || {}),
                    stages_catalogue: {
                        ...current,
                        items,
                    },
                },
            };
        });
    };

    const handleAddKeyStat = () => {
        if (blockStructureChangeInEnglish('Les chiffres clés')) return;
        setActiveData((prev) => {
            const currentList = Array.isArray(prev.sections) ? [...prev.sections] : [];
            currentList.push({
                id: `stat_${Date.now()}`,
                title: 'Nouvelle Statistique',
                value: '100%',
                description: 'Précision sur la métrique',
            });
            return { ...prev, sections: currentList };
        });
    };

    const handleRemoveKeyStat = (id: string) => {
        if (blockStructureChangeInEnglish('Les chiffres clés')) return;
        setActiveData((prev) => ({
            ...prev,
            sections: (prev.sections || []).filter((s) => s.id !== id),
        }));
    };

    const handleUpdateKeyStat = (
        id: string,
        updates: Partial<{ title: string; value: string; description: string }>
    ) => {
        setActiveData((prev) => ({
            ...prev,
            sections: (prev.sections || []).map((s) => (s.id === id ? { ...s, ...updates } : s)),
        }));
    };

    return {
        handleUpdateWorkshop,
        handleAddWorkshop,
        handleRemoveWorkshop,
        handleUpdateFormule,
        handleUpdateStageItem,
        handleAddStageItem,
        handleRemoveStageItem,
        handleAddKeyStat,
        handleRemoveKeyStat,
        handleUpdateKeyStat,
    };
}
