'use client';

import { useEffect } from 'react';
import {
    clampPosition,
    clampScale,
    normalizeAngle360,
} from '../data/facilityTransform';
import type { EditableFacilityItem, GizmoMode } from '../types/campus3d.types';

export interface UseCampusStudioShortcutsArgs {
    isEditorOpen: boolean;
    selectedObjectId: string;
    facilitiesRef: React.MutableRefObject<Record<string, EditableFacilityItem>>;
    updateFacility: (id: string, updates: Partial<EditableFacilityItem>) => void;
    focusFacility: (id: string) => void;
    undo: () => void;
    redo: () => void;
    setGizmoMode: (mode: GizmoMode) => void;
}

/**
 * Navigation clavier du studio (actif uniquement quand le panneau est ouvert).
 *
 * Flèches : déplacement (Maj ×5, Alt pas fin) · `[` `]` : rotation ±15° ·
 * `+` `-` : échelle (Alt = pas fin) · `1` `2` `3` : modes du gizmo ·
 * `F` : recadrer sur l'installation · Ctrl/Cmd+Z (Maj) : annuler / rétablir.
 * Inactif dans un champ de saisie.
 */
export function useCampusStudioShortcuts({
    isEditorOpen,
    selectedObjectId,
    facilitiesRef,
    updateFacility,
    focusFacility,
    undo,
    redo,
    setGizmoMode,
}: UseCampusStudioShortcutsArgs) {
    useEffect(() => {
        if (!isEditorOpen) return;

        const onKeyDown = (e: KeyboardEvent) => {
            const activeTag = (document.activeElement?.tagName || '').toLowerCase();
            if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

            // Historique : disponible quel que soit l'état de l'élément sélectionné.
            if (e.ctrlKey || e.metaKey) {
                if (e.key.toLowerCase() === 'z') {
                    e.preventDefault();
                    if (e.shiftKey) redo();
                    else undo();
                    return;
                }
            }

            const item = facilitiesRef.current[selectedObjectId];
            if (!item) return;

            const step = e.shiftKey ? 2.5 : e.altKey ? 0.1 : 0.5;
            const scaleFactor = e.altKey ? 1.01 : 1.1;

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    updateFacility(selectedObjectId, { x: clampPosition(Number((item.x - step).toFixed(2))) });
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    updateFacility(selectedObjectId, { x: clampPosition(Number((item.x + step).toFixed(2))) });
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    updateFacility(selectedObjectId, { z: clampPosition(Number((item.z - step).toFixed(2))) });
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    updateFacility(selectedObjectId, { z: clampPosition(Number((item.z + step).toFixed(2))) });
                    break;
                case '[':
                    e.preventDefault();
                    updateFacility(selectedObjectId, {
                        rotationY: normalizeAngle360(item.rotationY - 15),
                    });
                    break;
                case ']':
                    e.preventDefault();
                    updateFacility(selectedObjectId, {
                        rotationY: normalizeAngle360(item.rotationY + 15),
                    });
                    break;
                case '+':
                case '=':
                    e.preventDefault();
                    updateFacility(selectedObjectId, {
                        scaleX: clampScale(item.scaleX * scaleFactor),
                        scaleY: clampScale(item.scaleY * scaleFactor),
                        scaleZ: clampScale(item.scaleZ * scaleFactor),
                    });
                    break;
                case '-':
                case '_':
                    e.preventDefault();
                    updateFacility(selectedObjectId, {
                        scaleX: clampScale(item.scaleX / scaleFactor),
                        scaleY: clampScale(item.scaleY / scaleFactor),
                        scaleZ: clampScale(item.scaleZ / scaleFactor),
                    });
                    break;
                case '1':
                    e.preventDefault();
                    setGizmoMode('translate');
                    break;
                case '2':
                    e.preventDefault();
                    setGizmoMode('rotate');
                    break;
                case '3':
                    e.preventDefault();
                    setGizmoMode('scale');
                    break;
                case 'f':
                case 'F':
                    e.preventDefault();
                    focusFacility(selectedObjectId);
                    break;
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [
        isEditorOpen,
        selectedObjectId,
        facilitiesRef,
        updateFacility,
        focusFacility,
        undo,
        redo,
        setGizmoMode,
    ]);
}
