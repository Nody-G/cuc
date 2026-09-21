import {
    TRANSFORM_LIMITS,
    clampPosition,
    clampScale,
    getFacilityRadius,
    getRealFootprintReference,
    normalizeAngle360,
    normalizeFacilityItem,
    normalizeFacilityRecord,
    rotateYPatch,
    scaleAxisPatch,
    scaleUniformPatch,
    snapToStep,
} from './facilityTransform';

describe('facilityTransform — normalisation et migration', () => {
    it('migre les champs hérités v1 vers les axes d’échelle', () => {
        // La scène v1 appliquait `scale.set(scale, scale * heightScale, scale)`.
        const item = normalizeFacilityItem('legacy', {
            x: 5,
            z: 3,
            scale: 1.5,
            heightScale: 2,
            rotationY: 30,
        });

        expect(item.scaleX).toBe(1.5);
        expect(item.scaleZ).toBe(1.5);
        expect(item.scaleY).toBe(3);
        expect(item.rotationY).toBe(30);
        expect(item.visible).toBe(true);
    });

    it('privilégie les axes explicites sur les champs hérités', () => {
        const item = normalizeFacilityItem('mixed', {
            scale: 4,
            heightScale: 4,
            scaleX: 1.2,
            scaleY: 1.3,
            scaleZ: 1.4,
        });

        expect(item.scaleX).toBe(1.2);
        expect(item.scaleY).toBe(1.3);
        expect(item.scaleZ).toBe(1.4);
    });

    it('ignore les clés hors périmètre (altitude, inclinaisons)', () => {
        const item = normalizeFacilityItem('hors-scope', {
            x: 1,
            z: 2,
            ...({ y: 12, rotationX: 40, rotationZ: -25 } as Record<string, number>),
        });

        expect(item).not.toHaveProperty('y');
        expect(item).not.toHaveProperty('rotationX');
        expect(item).not.toHaveProperty('rotationZ');
    });

    it('retombe sur les valeurs de base pour les champs absents', () => {
        const base = normalizeFacilityItem('a', { name: 'Bâtiment', code: '01', x: 10, z: 20, rotationY: 45 });
        const merged = normalizeFacilityItem('a', { x: 99 }, base);

        expect(merged.name).toBe('Bâtiment');
        expect(merged.code).toBe('01');
        expect(merged.x).toBe(99);
        expect(merged.z).toBe(20);
        expect(merged.rotationY).toBe(45);
    });

    it('ne laisse passer aucune valeur non finie', () => {
        const item = normalizeFacilityItem('nan', {
            x: Number.NaN,
            z: Number.NEGATIVE_INFINITY,
            scaleX: Number.NaN,
            rotationY: Number.NaN,
        });

        expect(item.x).toBe(0);
        expect(item.z).toBe(0);
        expect(item.scaleX).toBe(1);
        expect(item.rotationY).toBe(0);
    });

    it('borne la position sur la demi-étendue du domaine', () => {
        expect(clampPosition(9999)).toBe(TRANSFORM_LIMITS.position);
        expect(clampPosition(-9999)).toBe(-TRANSFORM_LIMITS.position);
    });

    it('laisse intactes les installations réelles du domaine', () => {
        // `site-tournage` est à z = 106,63 m : l'ancienne borne de ±75 m le
        // téléportait au premier glisser.
        expect(clampPosition(106.63)).toBeCloseTo(106.63, 5);
        expect(clampPosition(-46.02)).toBeCloseTo(-46.02, 5);
    });

    it('borne l’échelle', () => {
        expect(clampScale(0)).toBe(TRANSFORM_LIMITS.scale.min);
        expect(clampScale(1000)).toBe(TRANSFORM_LIMITS.scale.max);
    });

    it('normalise le lacet dans [0, 360)', () => {
        expect(normalizeAngle360(-30)).toBe(330);
        expect(normalizeAngle360(750)).toBe(30);
    });
});

describe('facilityTransform — dictionnaire complet', () => {
    const defaults = {
        a: normalizeFacilityItem('a', { name: 'A', code: '01', x: 1, z: 1, rotationY: 10 }),
    };

    it('conserve uniquement les clés fournies sans base (import JSON)', () => {
        const normalized = normalizeFacilityRecord({ b: { x: 2, z: 3 } });
        expect(Object.keys(normalized)).toEqual(['b']);
        expect(normalized.b.x).toBe(2);
    });

    it('réintroduit les installations absentes lorsqu’une base est fournie', () => {
        const normalized = normalizeFacilityRecord({ b: { x: 2, z: 3 } }, defaults);
        expect(Object.keys(normalized).sort()).toEqual(['a', 'b']);
        expect(normalized.a.name).toBe('A');
    });

    it('tolère une entrée non-objet', () => {
        expect(normalizeFacilityRecord(null)).toEqual({});
        expect(normalizeFacilityRecord('nope')).toEqual({});
    });
});

describe('facilityTransform — verrou d’échelle uniforme', () => {
    const item = normalizeFacilityItem('u', {
        scaleX: 2,
        scaleY: 2,
        scaleZ: 2,
        uniformScale: true,
    });

    it('reporte le rapport sur les trois axes quand le verrou est actif', () => {
        expect(scaleAxisPatch(item, 'x', 4)).toEqual({ scaleX: 4, scaleY: 4, scaleZ: 4 });
    });

    it('respecte un jeu d’échelles déséquilibré lors d’un glisser uniforme', () => {
        const uneven = normalizeFacilityItem('u2', {
            scaleX: 1,
            scaleY: 2,
            scaleZ: 3,
            uniformScale: true,
        });
        const patch = scaleAxisPatch(uneven, 'x', 2);
        expect(patch.scaleX).toBeCloseTo(2, 6);
        expect(patch.scaleY).toBeCloseTo(4, 6);
        expect(patch.scaleZ).toBeCloseTo(6, 6);
    });

    it('n’affecte qu’un axe quand le verrou est inactif', () => {
        const free = normalizeFacilityItem('f', {
            scaleX: 1,
            scaleY: 1,
            scaleZ: 1,
            uniformScale: false,
        });
        expect(scaleAxisPatch(free, 'y', 3)).toEqual({ scaleY: 3 });
    });

    it('applique la même valeur aux trois axes en échelle uniforme absolue', () => {
        expect(scaleUniformPatch(1.5)).toEqual({ scaleX: 1.5, scaleY: 1.5, scaleZ: 1.5 });
    });
});

describe('facilityTransform — rotation', () => {
    const item = normalizeFacilityItem('r', { rotationY: 350 });

    it('décale le lacet avec repli circulaire', () => {
        expect(rotateYPatch(item, 20).rotationY).toBe(10);
        expect(rotateYPatch(item, -360).rotationY).toBe(350);
    });
});

describe('facilityTransform — références réelles', () => {
    it('expose l’empreinte OSM des installations documentées', () => {
        const reference = getRealFootprintReference('zoe-bell-hall');
        expect(reference).not.toBeNull();
        expect(reference?.width).toBeGreaterThan(0);
        expect(reference?.depth).toBeGreaterThan(0);
    });

    it('n’invente aucune dimension pour un repère créé dans le cockpit', () => {
        expect(getRealFootprintReference('zone-1234567890')).toBeNull();
    });

    it('fait grandir le rayon d’emprise avec l’échelle appliquée', () => {
        const base = getFacilityRadius('zoe-bell-hall', { scaleX: 1, scaleZ: 1 });
        const doubled = getFacilityRadius('zoe-bell-hall', { scaleX: 2, scaleZ: 2 });
        expect(doubled).toBeCloseTo(base * 2, 4);
    });

    it('retombe sur un rayon neutre sans empreinte réelle', () => {
        expect(getFacilityRadius('zone-abc', { scaleX: 2, scaleZ: 2 })).toBe(9);
    });
});

describe('facilityTransform — aimantation', () => {
    it('arrondit au pas demandé', () => {
        expect(snapToStep(10.24, 0.5)).toBe(10);
        expect(snapToStep(10.26, 0.5)).toBe(10.5);
    });

    it('se contente d’un arrondi fin quand l’aimantation est désactivée', () => {
        expect(snapToStep(10.24689, 0)).toBe(10.247);
    });
});
