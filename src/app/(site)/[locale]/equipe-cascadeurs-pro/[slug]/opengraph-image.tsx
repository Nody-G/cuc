import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { CUC_TEAM } from '@/data/team';
import { getEntityOverlays } from '@/lib/i18n/server';
import { applyTeamOverlay } from '@/lib/i18n/apply-team-overlay';
import type { Locale } from '@/lib/i18n/entities';
import { coachOgOptions } from '@/lib/og/coach-og';
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-image';

/**
 * Image Open Graph dynamique d'une fiche coach : nom, fonction et spécialités
 * via la fabrique partagée (charte CUC). Le catalogue (`CUC_TEAM`) et l'overlay
 * EN (`getEntityOverlays`, `'use cache'`) sont les mêmes sources que la page —
 * aucune lecture supplémentaire par rendu. Slug inconnu → carte générique de
 * l'équipe, jamais d'image vide.
 */
export const alt = "Fiches cascadeurs — Campus Univers Cascades";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

interface CoachOgImageProps {
    params: Promise<{
        locale: string;
        slug: string;
    }>;
}

export default async function OpengraphImage({ params }: CoachOgImageProps) {
    const { locale, slug } = await params;
    const safeLocale: Locale = hasLocale(routing.locales, locale)
        ? (locale as Locale)
        : 'fr';

    const base = CUC_TEAM.find((member) => member.id === slug);
    if (!base) {
        return renderOgImage(coachOgOptions(undefined, safeLocale));
    }

    const overlays = await getEntityOverlays('team', safeLocale);
    const member = applyTeamOverlay(base, overlays[slug]);
    return renderOgImage(coachOgOptions(member, safeLocale));
}
