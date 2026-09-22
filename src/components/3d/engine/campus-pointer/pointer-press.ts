import { soundFX } from '@/lib/soundFx';
import { getFacilityRadius } from '../../data/facilityTransform';
import { anchorGizmo, applyTransformToObject } from '../campusSync';
import {
    findBuildingGroup,
    findFirstGizmoHandle,
    handleToDragType,
    handleToMode,
    setGizmoMode,
    setHighlightRadius,
} from '../useCampusGizmo';
import { applyPan, beginPan, updateMouseVector } from './pointer-camera';
import { beginGizmoDrag, resolveGizmoDragTransform } from './pointer-gizmo';
import type { PointerContext } from './pointer-options';

export function handlePointerDown(e: PointerEvent, ctx: PointerContext): void {
    const three = ctx.threeRef.current;
    if (!three) return;

    three.prevMousePos = { x: e.clientX, y: e.clientY };
    ctx.session.pointerDownClientPos = { x: e.clientX, y: e.clientY };
    ctx.session.pendingTransform = null;
    updateMouseVector(ctx.canvas, three, e);

    // Bouton droit ou molette : déplacement latéral, dans tous les contextes
    // (y compris hors studio, où le bouton gauche est réservé à l'orbite).
    if (e.button === 1 || e.button === 2) {
        beginPan(ctx.canvas, three, e);
        return;
    }

    if (ctx.isEditorOpenRef.current && e.button === 0) {
        // 1. Poignée de gizmo : noms exacts **et** poignée réellement visible
        //    (`Raycaster` ignore `Object3D.visible`, donc les jeux de poignées
        //    masqués doivent être écartés explicitement).
        //    Priorité aux poignées de l'outil courant : l'anneau de lacet, affiché
        //    en permanence, ne doit pas voler le clic destiné à une flèche ou à un
        //    axe d'échelle placés devant lui.
        const currentItem = ctx.facilitiesRef.current[ctx.selectedObjectIdRef.current];
        const gizmoHits = three.raycaster.intersectObjects(three.gizmoGroup.children, true);
        if (currentItem && gizmoHits.length > 0) {
            const handle =
                findFirstGizmoHandle(gizmoHits, three.gizmoGroup, (name) => handleToMode(name) === three.gizmoMode) ??
                findFirstGizmoHandle(gizmoHits, three.gizmoGroup);

            const dragType = handle ? handleToDragType(handle) : null;
            if (dragType) {
                // Glisser l'anneau de lacet depuis un autre outil bascule sur
                // « Tourner » : la manipulation aboutit toujours, et le panneau
                // reflète ensuite l'outil réellement utilisé.
                if (dragType === 'rotate-y' && three.gizmoMode !== 'rotate') {
                    three.gizmoMode = 'rotate';
                    setGizmoMode(three.gizmoGroup, 'rotate');
                    ctx.onGizmoModeChange('rotate');
                }
                beginGizmoDrag(ctx.canvas, three, e, currentItem, dragType);
                return;
            }
        }

        // 2. Clic sur un bâtiment : sélection, puis glisser libre au sol si le
        //    mode « Gizmo » est actif.
        const bldgHits = three.raycaster.intersectObjects(three.buildingsGroup.children, true);
        if (bldgHits.length > 0) {
            const topBldg = findBuildingGroup(bldgHits[0].object, three.buildingsGroup);
            if (topBldg && topBldg.name) {
                ctx.onSelectObjectId(topBldg.name);
                soundFX.playTacticalClick();

                if (ctx.dragModeRef.current === 'gizmo') {
                    const curItem = ctx.facilitiesRef.current[topBldg.name];
                    if (curItem) {
                        beginGizmoDrag(ctx.canvas, three, e, curItem, 'translate-free');
                    }
                }
                return;
            }
        }
    }

    // Maj + glisser au sol : déplacement latéral plutôt que rotation.
    if (e.button === 0 && e.shiftKey) {
        beginPan(ctx.canvas, three, e);
        return;
    }

    three.isDragging = true;
    three.isPanning = false;
    three.isDraggingGizmo = false;
    ctx.canvas.setPointerCapture(e.pointerId);
}

export function handlePointerMove(e: PointerEvent, ctx: PointerContext): void {
    const three = ctx.threeRef.current;
    if (!three) return;

    // --- Manipulation de gizmo active ---
    if (three.isDraggingGizmo && ctx.isEditorOpenRef.current && three.activeDragType) {
        const active = three.activeDragType;
        updateMouseVector(ctx.canvas, three, e);

        const id = ctx.selectedObjectIdRef.current;
        const item = ctx.facilitiesRef.current[id];
        if (!item) return;

        const next = resolveGizmoDragTransform({
            three,
            active,
            item,
            event: e,
            snap: ctx.snapGridRef.current,
        });

        // Application directe à 60 FPS, sans écriture de persistance.
        applyTransformToObject(three, id, next);
        anchorGizmo(three, id, next, three.gizmoMode);
        if (three.highlightGroup?.visible) {
            setHighlightRadius(three.highlightGroup, getFacilityRadius(id, next));
        }

        ctx.session.pendingTransform = { id, transform: next };
        return;
    }

    // --- Déplacement latéral (pan) ---
    if (three.isPanning) {
        const deltaX = e.clientX - three.prevMousePos.x;
        const deltaY = e.clientY - three.prevMousePos.y;
        three.prevMousePos = { x: e.clientX, y: e.clientY };
        applyPan(ctx.canvas, three, deltaX, deltaY);
        return;
    }

    // --- Orbite caméra ---
    if (three.isDragging) {
        const deltaX = e.clientX - three.prevMousePos.x;
        const deltaY = e.clientY - three.prevMousePos.y;
        three.prevMousePos = { x: e.clientX, y: e.clientY };

        three.targetSpherical.theta -= deltaX * 0.007;
        three.targetSpherical.phi = Math.max(
            0.04,
            Math.min(Math.PI * 0.48, three.targetSpherical.phi - deltaY * 0.007)
        );
    }
}

