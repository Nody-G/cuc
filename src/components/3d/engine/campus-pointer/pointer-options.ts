import type {
    EditableFacilityItem,
    FacilityTransform,
    GizmoMode,
    ThreeSceneContext,
} from '../../types/campus3d.types';

export interface PointerEventsSetupOptions {
    canvas: HTMLCanvasElement;
    threeRef: React.RefObject<ThreeSceneContext | null>;
    facilitiesRef: React.RefObject<Record<string, EditableFacilityItem>>;
    selectedObjectIdRef: React.RefObject<string>;
    isEditorOpenRef: React.RefObject<boolean>;
    snapGridRef: React.RefObject<number>;
    dragModeRef: React.RefObject<'gizmo' | 'orbit'>;
    updateFacilityRef: React.RefObject<(id: string, updates: Partial<EditableFacilityItem>) => void>;
    onSelectObjectId: (id: string) => void;
    setCameraDistance: (dist: number) => void;
    /** Synchronise l'état React de l'outil quand une poignée impose de changer. */
    onGizmoModeChange: (mode: GizmoMode) => void;
}

/** État local d'un geste de pointeur (entre pointerdown et pointerup). */
export interface PointerSession {
    pointerDownClientPos: { x: number; y: number };
    pendingTransform: { id: string; transform: FacilityTransform } | null;
}

/** Contexte partagé des handlers : options du setup + session de geste. */
export type PointerContext = PointerEventsSetupOptions & { session: PointerSession };

export function createPointerSession(): PointerSession {
    return {
        pointerDownClientPos: { x: 0, y: 0 },
        pendingTransform: null,
    };
}

/** Amplitudes de déplacement latéral de la caméra, en mètres. */
export const PAN_BOUNDS = 260;

export type Axis = 'x' | 'y' | 'z';
