import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/lib/i18n/entities';
import { getPreviewPageContent } from '@/lib/i18n/server-preview';
import { PageDataProvider } from '@/components/i18n/PageDataProvider';
import { normalizePreviewSlug } from '@/lib/preview/preview-url';
import { PREVIEW_SCREENS } from '../screens';

/**
 * Aperçu d'une page éditable (`/preview/<slug>`, `/en/preview/<slug>`) : rend le
 * **vrai écran** de la page (registre `screens.ts`), avec le contenu localisé —
 * brouillon compris (`allowUnpublished`). L'accès est gardé par le layout
 * d'aperçu (session admin) ; un slug inconnu est un 404.
 * `instant = false` : un aperçu (session lue en amont) ne se prérend jamais.
 */
export const instant = false;
export default async function PreviewSlugPage({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}) {
    const { locale, slug } = await params;
    const key = normalizePreviewSlug(slug);

    const Screen = PREVIEW_SCREENS[key];
    if (!Screen) notFound();

    const safeLocale: Locale = hasLocale(routing.locales, locale)
        ? (locale as Locale)
        : 'fr';

    const page = await getPreviewPageContent(key, safeLocale);

    return (
        <PageDataProvider page={page} allowUnpublished>
            {/* Même enveloppe que les layouts de route publique (mise en page). */}
            <section className="w-full flex-grow flex flex-col">
                <Screen />
            </section>
        </PageDataProvider>
    );
}
