import { PRESET_CONFIGS, DEFAULT_FACILITIES } from './defaultFacilities';

/**
 * Tests unitaires des données du plan 3D (Phase 6).
 * Garantit que l'épuration de l'interface (2 vues caméra publiques)
 * reste stable et qu'aucun preset redondant ne réapparaisse.
 */
describe('defaultFacilities — PRESET_CONFIGS', () => {
    it('n’expose que les deux vues caméra publiques', () => {
        expect(Object.keys(PRESET_CONFIGS).sort()).toEqual(['overview', 'zenith']);
    });

    it('définit un label et une configuration caméra pour chaque vue', () => {
        for (const config of Object.values(PRESET_CONFIGS)) {
            expect(typeof config.label).toBe('string');
            expect(config.label.length).toBeGreaterThan(0);
            expect(typeof config.radius).toBe('number');
            expect(typeof config.theta).toBe('number');
            expect(typeof config.phi).toBe('number');
            expect(Array.isArray(config.center)).toBe(true);
            expect(config.center).toHaveLength(3);
        }
    });

    it('ne contient plus de preset par bâtiment (spotId supprimé)', () => {
        for (const config of Object.values(PRESET_CONFIGS)) {
            expect(config).not.toHaveProperty('spotId');
        }
    });
});

describe('defaultFacilities — DEFAULT_FACILITIES', () => {
    it('définit au moins une installation', () => {
        expect(Object.keys(DEFAULT_FACILITIES).length).toBeGreaterThan(0);
    });

    it('fournit des coordonnées numériques valides pour chaque installation', () => {
        for (const facility of Object.values(DEFAULT_FACILITIES)) {
            expect(typeof facility.id).toBe('string');
            expect(typeof facility.name).toBe('string');
            expect(Number.isFinite(facility.x)).toBe(true);
            expect(Number.isFinite(facility.z)).toBe(true);
            expect(typeof facility.visible).toBe('boolean');
        }
    });

    it('expose une transformée complète (translation, lacet, échelle par axe)', () => {
        for (const facility of Object.values(DEFAULT_FACILITIES)) {
            expect(Number.isFinite(facility.rotationY)).toBe(true);
            expect(Number.isFinite(facility.scaleX)).toBe(true);
            expect(Number.isFinite(facility.scaleY)).toBe(true);
            expect(Number.isFinite(facility.scaleZ)).toBe(true);
            expect(typeof facility.uniformScale).toBe('boolean');
        }
    });

    it('démarre à l’échelle 1:1 sur les empreintes OSM réelles', () => {
        for (const facility of Object.values(DEFAULT_FACILITIES)) {
            expect(facility.scaleX).toBe(1);
            expect(facility.scaleY).toBe(1);
            expect(facility.scaleZ).toBe(1);
        }
    });

    it('ne porte ni altitude ni inclinaison (périmètre retenu)', () => {
        for (const facility of Object.values(DEFAULT_FACILITIES)) {
            expect(facility).not.toHaveProperty('y');
            expect(facility).not.toHaveProperty('rotationX');
            expect(facility).not.toHaveProperty('rotationZ');
        }
    });

    it('n’écrit plus les champs hérités v1 (`scale`, `heightScale`)', () => {
        for (const facility of Object.values(DEFAULT_FACILITIES)) {
            expect(facility).not.toHaveProperty('scale');
            expect(facility).not.toHaveProperty('heightScale');
        }
    });
});
