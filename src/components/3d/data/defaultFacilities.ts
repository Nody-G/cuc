import { CameraPreset, CameraPresetConfig, EditableFacilityItem } from '../types/campus3d.types';
import { REAL_FACILITIES, REAL_FACILITY_ORDER } from './realFacilities';

// Placements dérivés des empreintes OpenStreetMap réelles du domaine CUC
// (Le Cateau-Cambrésis, 70 Rue Faidherbe — origine : centroïde du domaine).
// Voir `realFacilities.ts` et `scripts/generate_real_facilities.mjs`.
export const DEFAULT_FACILITIES: Record<string, EditableFacilityItem> =
  Object.fromEntries(
    REAL_FACILITY_ORDER.map((id) => {
      const real = REAL_FACILITIES[id];
      const item: EditableFacilityItem = {
        id: real.id,
        name: real.name,
        code: real.code,
        x: real.x,
        z: real.z,
        rotationY: real.rotationY,
        // Échelle 1:1 avec l'empreinte OSM réelle : le modèle n'est ni
        // agrandi ni réduit tant que l'opérateur n'en décide pas autrement.
        scaleX: 1,
        scaleY: 1,
        scaleZ: 1,
        // Verrou d'échelle uniforme actif par défaut : un bâtiment se
        // redimensionne d'abord de façon homothétique, le déverrouillage
        // restant un geste explicite de l'opérateur.
        uniformScale: true,
        visible: true,
      };
      return [id, item];
    }),
  );

// Vues caméra publiques : vue globale du domaine et plan zénithal 2D.
// Le cadrage par bâtiment est assuré par `focusFacility` (sélecteur
// d'installations), ce qui évite toute redondance dans l'interface.
export const PRESET_CONFIGS: Record<CameraPreset, CameraPresetConfig> = {
  overview: {
    label: 'Vue globale',
    radius: 150,
    theta: Math.PI * 0.25,
    phi: Math.PI * 0.32,
    center: [0, 2, 10],
  },
  zenith: {
    label: 'Plan 2D',
    radius: 190,
    theta: 0,
    phi: 0.05,
    center: [0, 0, 0],
  },
};
