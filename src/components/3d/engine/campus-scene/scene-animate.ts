/**
 * Boucle de rendu 60 fps du campus : interpolation caméra, télémétrie React
 * throttlée, pulsations gizmo / surbrillance / balises.
 */

import type React from 'react';
import { computeGizmoScale } from '../gizmoMath';
import { setGizmoScale } from '../useCampusGizmo';
import type { ThreeSceneContext } from '../../types/campus3d.types';

export interface SceneTelemetrySink {
    lastUpdateRef: React.MutableRefObject<number>;
    prevBearingRef: React.MutableRefObject<number>;
    prevDistRef: React.MutableRefObject<number>;
    setBearing: React.Dispatch<React.SetStateAction<number>>;
    setCameraDistance: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * Fabrique la fonction `animate` de la boucle de rendu.
 * La `threeRef` est créée par le hook appelant et passée en paramètre.
 */
export function createSceneRenderLoop(
    threeRef: React.MutableRefObject<ThreeSceneContext | null>,
    telemetry: SceneTelemetrySink
): () => void {
    const { lastUpdateRef, prevBearingRef, prevDistRef, setBearing, setCameraDistance } = telemetry;

    const animate = () => {
        const three = threeRef.current;
        if (!three) return;

        three.pulseTime += 0.035;
        three.spherical.radius += (three.targetSpherical.radius - three.spherical.radius) * 0.08;
        three.spherical.theta += (three.targetSpherical.theta - three.spherical.theta) * 0.08;
        three.spherical.phi += (three.targetSpherical.phi - three.spherical.phi) * 0.08;

        three.center.lerp(three.targetCenter, 0.08);
        three.currentLookAt.lerp(three.center, 0.08);

        const { radius, theta, phi } = three.spherical;
        const camX = three.center.x + radius * Math.sin(phi) * Math.sin(theta);
        const camY = three.center.y + radius * Math.cos(phi);
        const camZ = three.center.z + radius * Math.sin(phi) * Math.cos(theta);

        three.camera.position.set(camX, camY, camZ);
        three.camera.lookAt(three.currentLookAt);

        // Throttle React telemetry state updates to ~120ms to prevent 60fps React thrashing
        const now = performance.now();
        if (now - lastUpdateRef.current > 120) {
            lastUpdateRef.current = now;
            const deg = Math.round((theta * 180) / Math.PI) % 360;
            const normalizedDeg = deg >= 0 ? deg : 360 + deg;
            const roundedDist = Math.round(radius);

            if (prevBearingRef.current !== normalizedDeg) {
                prevBearingRef.current = normalizedDeg;
                setBearing(normalizedDeg);
            }
            if (prevDistRef.current !== roundedDist) {
                prevDistRef.current = roundedDist;
                setCameraDistance(roundedDist);
            }
        }

        // Gizmo : pulsation du disque central + échelle adaptative.
        // L'échelle est recalculée depuis la distance caméra (constance à
        // l'écran) sauf pendant un glisser, où elle reste gelée pour éviter
        // toute boucle de rétroaction sur la mise à l'échelle.
        if (three.gizmoGroup && three.gizmoGroup.visible) {
            const pulse = 1 + Math.sin(three.pulseTime * 4) * 0.03;
            const disc = three.gizmoGroup.getObjectByName('gizmo-center');
            if (disc) disc.scale.set(pulse, pulse, 1);

            if (three.gizmoScaleFrozen === null) {
                setGizmoScale(
                    three.gizmoGroup,
                    computeGizmoScale(three.spherical.radius, three.gizmoObjectRadius)
                );
            }
        }

        // Animate highlight target reticle & pulsing ring
        if (three.highlightGroup && three.highlightGroup.visible) {
            const reticle = three.highlightGroup.getObjectByName('highlight-reticle');
            if (reticle) reticle.rotation.y += 0.012;
            const pulse = 1 + Math.sin(three.pulseTime * 3) * 0.05;
            const outer = three.highlightGroup.getObjectByName('highlight-outer-ring');
            if (outer) outer.scale.set(pulse, pulse, 1);
        }

        // Animate holographic beacon diamonds
        three.beaconsGroup.children.forEach((bGroup, index) => {
            const diamond = bGroup.children[0];
            if (diamond) {
                diamond.rotation.y += 0.03;
                diamond.position.y = 14 + Math.sin(three.pulseTime * 2 + index * 0.8) * 0.6;
            }
        });

        three.renderer.render(three.scene, three.camera);
        three.animFrameId = requestAnimationFrame(animate);
    };

    return animate;
}
