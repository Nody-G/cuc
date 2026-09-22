import { soundFX } from '@/lib/soundFx';
import { findBuildingGroup } from '../useCampusGizmo';
import { updateMouseVector } from './pointer-camera';
import type { PointerContext } from './pointer-options';

export function handlePointerUp(e: PointerEvent, ctx: PointerContext): void {
    const three = ctx.threeRef.current;
    if (!three) return;

    if (ctx.canvas.hasPointerCapture(e.pointerId)) {
        ctx.canvas.releasePointerCapture(e.pointerId);
    }

    if (three.isPanning) {
        three.isPanning = false;
        return;
    }

    const totalDragDist = Math.hypot(
        e.clientX - ctx.session.pointerDownClientPos.x,
        e.clientY - ctx.session.pointerDownClientPos.y
    );

    // Hors studio, un clic net (sans glisser) **sélectionne** le bâtiment
    // pointé, sans recadrer la caméra : la vue publique ne doit pas sauter
    // d'un bâtiment à l'autre, l'orientation restant à l'utilisateur.
    if (!ctx.isEditorOpenRef.current && !three.isDraggingGizmo) {
        if (totalDragDist < 6) {
            updateMouseVector(ctx.canvas, three, e);
            const intersects = three.raycaster.intersectObjects(three.buildingsGroup.children, true);
            if (intersects.length > 0) {
                const topObj = findBuildingGroup(intersects[0].object, three.buildingsGroup);
                if (topObj && topObj.name) {
                    ctx.onSelectObjectId(topObj.name);
                }
            }
        }
    }

    // Validation de la manipulation à la fin du glisser : une seule écriture,
    // donc une seule entrée d'historique par geste.
    if (three.isDraggingGizmo) {
        three.isDraggingGizmo = false;
        three.activeDragType = null;
        three.gizmoScaleFrozen = null;

        if (ctx.session.pendingTransform) {
            ctx.updateFacilityRef.current(ctx.session.pendingTransform.id, {
                ...ctx.session.pendingTransform.transform,
            });
            ctx.session.pendingTransform = null;
        }
        soundFX.playTacticalClick();
    }

    three.isDragging = false;
}

export function handleWheel(e: WheelEvent, ctx: PointerContext): void {
    e.preventDefault();
    const three = ctx.threeRef.current;
    if (!three) return;
    // Bornes alignées sur `handleZoom` (20 → 220 m) pour couvrir le domaine réel.
    three.targetSpherical.radius = Math.max(
        20,
        Math.min(220, three.targetSpherical.radius + e.deltaY * 0.06)
    );
    ctx.setCameraDistance(Math.round(three.targetSpherical.radius));
}

/** Le clic droit sert au déplacement : pas de menu contextuel du navigateur. */
export function handleContextMenu(e: MouseEvent): void {
    e.preventDefault();
}
