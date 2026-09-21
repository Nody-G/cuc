import type { Instructor } from '@/types';

/**
 * ==============================================================================
 * Fusion de l'overlay EN d'un coach (entité `team` de `site_translations`)
 * ==============================================================================
 * Règle doctrinale : le français reste la base, l'overlay EN se pose PAR-DESSUS.
 * Une clé absente (ou vide) laisse le français — jamais l'inverse. Les noms
 * propres (nom, avatar, liens, crédits) ne sont jamais traduits : seuls les
 * champs déclarés traduisibles dans `src/lib/i18n/entities.json` le sont.
 */
export function applyTeamOverlay(
    member: Instructor,
    overlay?: Record<string, unknown> | null
): Instructor {
    if (!overlay) return member;

    const pickString = (value: unknown, fallback: string): string =>
        typeof value === 'string' && value.trim().length > 0 ? value : fallback;

    const specialties = Array.isArray(overlay.specialties)
        ? (overlay.specialties as unknown[]).filter(
            (value): value is string => typeof value === 'string' && value.trim().length > 0
        )
        : null;

    return {
        ...member,
        role: pickString(overlay.role, member.role),
        title: pickString(overlay.title, member.title),
        bio: pickString(overlay.bio, member.bio),
        specialties:
            specialties && specialties.length > 0 ? specialties : member.specialties,
    };
}
