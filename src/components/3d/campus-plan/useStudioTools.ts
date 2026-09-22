'use client';

import { useCallback, useState } from 'react';
import { soundFX } from '@/lib/soundFx';
import { DEFAULT_FACILITIES } from '../data/defaultFacilities';
import { normalizeFacilityRecord } from '../data/facilityTransform';
import type { EditableFacilityItem } from '../types/campus3d.types';

export interface UseStudioToolsArgs {
    facilitiesRef: React.MutableRefObject<Record<string, EditableFacilityItem>>;
    commitFacilities: (next: Record<string, EditableFacilityItem>, key: string) => void;
    focusFacility: (id: string) => void;
    onSelectObjectId: (id: string) => void;
}

/**
 * Outils du studio : copie / téléchargement de la configuration JSON, import
 * normalisé, réinitialisation aux défauts calibrés et ajout de repère.
 * Chaque action est inscrite dans l'historique et signalée par le son tactique.
 */
export function useStudioTools({
    facilitiesRef,
    commitFacilities,
    focusFacility,
    onSelectObjectId,
}: UseStudioToolsArgs) {
    const [copiedFeedback, setCopiedFeedback] = useState(false);

    const copyConfiguration = useCallback(() => {
        const jsonStr = JSON.stringify(facilitiesRef.current, null, 2);
        navigator.clipboard
            .writeText(jsonStr)
            .then(() => {
                setCopiedFeedback(true);
                soundFX.playTacticalClick();
                setTimeout(() => setCopiedFeedback(false), 2500);
            })
            .catch(() => { });
    }, [facilitiesRef]);

    const downloadJsonFile = useCallback(() => {
        const blob = new Blob([JSON.stringify(facilitiesRef.current, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cuc-campus-placements-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
        soundFX.playTacticalClick();
    }, [facilitiesRef]);

    /** Applique un JSON importé (normalisé : bornes et migration des champs hérités). */
    const applyImportedJson = useCallback(
        (jsonString: string): string | null => {
            try {
                const parsed = JSON.parse(jsonString);
                if (typeof parsed !== 'object' || parsed === null) {
                    return 'Format JSON invalide : un objet clé/valeur est attendu.';
                }
                const normalized = normalizeFacilityRecord(parsed);
                if (Object.keys(normalized).length === 0) {
                    return 'Aucune installation exploitable dans ce JSON.';
                }
                commitFacilities(normalized, `import:${Date.now()}`);
                soundFX.playTacticalClick();
                return null;
            } catch {
                return 'Erreur de syntaxe JSON. Veuillez vérifier le format de votre code.';
            }
        },
        [commitFacilities]
    );

    const resetToDefault = useCallback(() => {
        if (confirm('Voulez-vous réinitialiser tous les emplacements par défaut ?')) {
            commitFacilities(DEFAULT_FACILITIES, `reset:${Date.now()}`);
            soundFX.playTacticalClick();
        }
    }, [commitFacilities]);

    const addCustomMarker = useCallback(() => {
        const customId = `zone-${Date.now()}`;
        const newFacility: EditableFacilityItem = {
            id: customId,
            name: `Repère ${Object.keys(facilitiesRef.current).length + 1}`,
            code: `ZON-${String(Object.keys(facilitiesRef.current).length + 1).padStart(2, '0')}`,
            x: 0,
            z: 0,
            rotationY: 0,
            scaleX: 1,
            scaleY: 1,
            scaleZ: 1,
            uniformScale: true,
            visible: true,
        };
        commitFacilities({ ...facilitiesRef.current, [customId]: newFacility }, `add:${customId}`);
        onSelectObjectId(customId);
        focusFacility(customId);
        soundFX.playTacticalClick();
    }, [commitFacilities, facilitiesRef, focusFacility, onSelectObjectId]);

    return {
        copiedFeedback,
        copyConfiguration,
        downloadJsonFile,
        applyImportedJson,
        resetToDefault,
        addCustomMarker,
    };
}
