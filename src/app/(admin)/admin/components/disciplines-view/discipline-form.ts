/**
 * Domaine de l'éditeur de disciplines : filtres de niveau, normalisation du
 * matériel, badge de niveau et fabrique de nouveau module.
 * Module pur (`AGENTS.md` § 1).
 */
import type { Discipline } from '@/types';

export const LEVEL_FILTERS = ['all', 'Fondamental', 'Avancé', 'Extrême', 'Tactique'] as const;
export type DisciplineLevelFilter = (typeof LEVEL_FILTERS)[number];

/**
 * Normalise le matériel : tableau, chaîne CSV héritée (anciennes fiches) ou
 * vide. Aucun champ n'est inventé.
 */
export function normalizeDisciplineEquipment(discipline: Discipline): string[] {
    const raw: unknown = (discipline as { equipment?: unknown }).equipment;
    if (Array.isArray(raw)) return raw as string[];
    if (typeof raw === 'string') {
        return raw
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
    }
    return [];
}

/** Couleurs du badge de niveau (fixes par niveau technique). */
export function disciplineLevelBadgeClass(level: Discipline['level']): string {
    switch (level) {
        case 'Extrême':
            return 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
        case 'Tactique':
            return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
        case 'Avancé':
            return 'bg-sky-500/20 text-sky-300 border border-sky-500/30';
        default:
            return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    }
}

/** Nouveau module pré-rempli (numérotation continue du catalogue). */
export function createEmptyDiscipline(existingCount: number): Discipline {
    const nextNum = existingCount + 1;
    return {
        id: `module-${Date.now()}`,
        number: `MOD-${nextNum < 10 ? '0' + nextNum : nextNum}`,
        name: '',
        shortDesc: '',
        fullDesc: '',
        iconName: 'Shield',
        level: 'Fondamental',
        equipment: [],
        cinemaContext: '',
        heroImage: '',
        instructor_ids: [],
        campus_zone_id: '',
        program_ids: [],
        film_ids: [],
    };
}
