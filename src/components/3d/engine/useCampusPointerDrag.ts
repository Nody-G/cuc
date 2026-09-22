'use client';

import type { PointerEventsSetupOptions } from './campus-pointer/pointer-options';
import { createPointerSession } from './campus-pointer/pointer-options';
import { handlePointerDown, handlePointerMove } from './campus-pointer/pointer-press';
import {
  handleContextMenu,
  handlePointerUp,
  handleWheel,
} from './campus-pointer/pointer-release';

/**
 * Branche les interactions pointeur de la scène campus (orbite, pan, gizmo,
 * sélection, zoom) et retourne la fonction de détachement.
 *
 * Implémentation découpée dans `./campus-pointer/**` : session de geste,
 * caméra/pan, glisser de gizmo, presse/déplacement, relâchement/molette.
 */
export function setupCampusPointerEvents(options: PointerEventsSetupOptions) {
  const { canvas } = options;
  const ctx = { ...options, session: createPointerSession() };

  const onPointerDown = (e: PointerEvent) => handlePointerDown(e, ctx);
  const onPointerMove = (e: PointerEvent) => handlePointerMove(e, ctx);
  const onPointerUp = (e: PointerEvent) => handlePointerUp(e, ctx);
  const onWheel = (e: WheelEvent) => handleWheel(e, ctx);
  const onContextMenu = (e: MouseEvent) => handleContextMenu(e);

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('wheel', onWheel, { passive: false });
  canvas.addEventListener('contextmenu', onContextMenu);

  return () => {
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointercancel', onPointerUp);
    canvas.removeEventListener('wheel', onWheel);
    canvas.removeEventListener('contextmenu', onContextMenu);
  };
}
