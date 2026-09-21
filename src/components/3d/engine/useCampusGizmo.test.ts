import * as THREE from 'three';
import { GizmoMode } from '../types/campus3d.types';
import {
    GIZMO_HANDLE_NAMES,
    createCampusGizmo,
    findGizmoHandle,
    handleToDragType,
    handleToMode,
    setGizmoMode,
} from './useCampusGizmo';

/** Premier maillage portant ce nom (les poignées sont hampe + embout). */
function findMesh(root: THREE.Object3D, name: string): THREE.Object3D {
    let found: THREE.Object3D | null = null;
    root.traverse((obj) => {
        if (!found && obj instanceof THREE.Mesh && obj.name === name) found = obj;
    });
    if (!found) throw new Error(`Maillage introuvable : ${name}`);
    return found;
}

const ALL_MODES: GizmoMode[] = ['translate', 'rotate', 'scale'];

describe('gizmo — contrat des poignées', () => {
    it('déclare des noms de poignées uniques', () => {
        expect(new Set(GIZMO_HANDLE_NAMES).size).toBe(GIZMO_HANDLE_NAMES.length);
    });

    it('rattache chaque poignée à un outil et à un type de manipulation', () => {
        expect(handleToMode('gizmo-rotate-y')).toBe('rotate');
        expect(handleToMode('gizmo-scale-z')).toBe('scale');
        expect(handleToMode('gizmo-scale-uniform')).toBe('scale');
        expect(handleToMode('gizmo-translate-x')).toBe('translate');
        expect(handleToMode('gizmo-center')).toBe('translate');

        expect(handleToDragType('gizmo-rotate-y')).toBe('rotate-y');
        expect(handleToDragType('gizmo-scale-uniform')).toBe('scale-uniform');
        expect(handleToDragType('gizmo-center')).toBe('translate-free');
    });

    it('ne crée aucune poignée hors liste blanche', () => {
        const gizmo = createCampusGizmo();
        const names = new Set<string>(GIZMO_HANDLE_NAMES);

        gizmo.traverse((obj) => {
            if (obj.name.startsWith('gizmo-') && obj.parent !== null && obj.name !== 'gizmo-root') {
                // Les groupes conteneurs ne sont pas des poignées : ils sont exclus
                // par `findGizmoHandle`, mais ne doivent pas usurper un nom de poignée.
                const isContainer = obj.name.endsWith('-group');
                if (!isContainer) expect(names.has(obj.name)).toBe(true);
            }
        });
    });
});

describe('gizmo — visibilité par outil', () => {
    it('garde l’anneau de lacet visible dans tous les outils', () => {
        const gizmo = createCampusGizmo();

        ALL_MODES.forEach((mode) => {
            setGizmoMode(gizmo, mode);
            expect(gizmo.getObjectByName('gizmo-rotate-group')?.visible).toBe(true);
            expect(gizmo.getObjectByName('gizmo-rotate-y')).toBeTruthy();
        });
    });

    it('rend les flèches et les axes d’échelle mutuellement exclusifs', () => {
        const gizmo = createCampusGizmo();

        setGizmoMode(gizmo, 'translate');
        expect(gizmo.getObjectByName('gizmo-translate-group')?.visible).toBe(true);
        expect(gizmo.getObjectByName('gizmo-scale-group')?.visible).toBe(false);

        setGizmoMode(gizmo, 'scale');
        expect(gizmo.getObjectByName('gizmo-translate-group')?.visible).toBe(false);
        expect(gizmo.getObjectByName('gizmo-scale-group')?.visible).toBe(true);
    });

    it('refuse une poignée dont le groupe porteur est masqué', () => {
        const gizmo = createCampusGizmo();
        setGizmoMode(gizmo, 'scale');

        // Le maillage de la flèche X reste `visible`, mais son groupe porteur ne
        // l'est plus : sans contrôle de la chaîne complète, il capterait le clic.
        const arrowMesh = findMesh(gizmo, 'gizmo-translate-x');
        expect(arrowMesh.visible).toBe(true);
        expect(findGizmoHandle(arrowMesh, gizmo)).toBeNull();

        const knobMesh = findMesh(gizmo, 'gizmo-scale-x');
        expect(findGizmoHandle(knobMesh, gizmo)).toBe('gizmo-scale-x');
    });

    it('répond à l’anneau de lacet quel que soit l’outil', () => {
        const gizmo = createCampusGizmo();
        const ringMesh = findMesh(gizmo, 'gizmo-rotate-y');

        ALL_MODES.forEach((mode) => {
            setGizmoMode(gizmo, mode);
            expect(findGizmoHandle(ringMesh, gizmo)).toBe('gizmo-rotate-y');
        });
    });
});
