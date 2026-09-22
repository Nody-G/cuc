/**
 * Repli navigateur des placements 3D.
 *
 * ⚠ Il s'agit d'un **repli**, pas d'une source partagée : les placements
 * faisant autorité vivent dans Supabase (`site_settings`).
 */
import { DEFAULT_FACILITIES } from '../data/defaultFacilities';
import { normalizeFacilityRecord } from '../data/facilityTransform';
import type { EditableFacilityItem } from '../types/campus3d.types';

/** Clé `localStorage` des placements (mode public). */
export const LOCAL_STORAGE_KEY = 'cuc_campus_placements_v2';

/**
 * Placements conservés par le navigateur, normalisés.
 * Retourne `null` si rien n'est stocké ou si la valeur est illisible.
 */
export function readLocalPlacements(): Record<string, EditableFacilityItem> | null {
    if (typeof window === 'undefined') return null;
    const saved = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) return null;
    try {
        // Migration transparente des placements v1 (`scale` / `heightScale`).
        return normalizeFacilityRecord(JSON.parse(saved), DEFAULT_FACILITIES);
    } catch {
        return null;
    }
}

/** Écrit le repli navigateur ; `false` si le stockage est indisponible. */
export function writeLocalPlacements(payload: Record<string, EditableFacilityItem>): boolean {
    try {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
        return true;
    } catch {
        return false;
    }
}
