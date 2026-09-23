import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/lib/i18n/entities';
import { getLocalizedPageContent } from '@/lib/i18n/server';
import { PageDataProvider } from '@/components/i18n/PageDataProvider';
import { HomeView } from '../HomeView';

/**
 * Aperçu de l'accueil (`/preview`, `/en/preview`) : même écran que la page
 * publique, sans la porte 404 — l'accès est déjà gardé par le layout d'aperçu
 * (session admin) et le brouillon doit s'afficher tel que l'éditeur le compose.
 * `instant = false` : un aperçu (session lue en amont) ne se prérend jamais.
 */
export const instant = false;
export default async function PreviewHomePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const safeLocale: Locale = hasLocale(routing.locales, locale)
        ? (locale as Locale)
        : 'fr';

    const page = await getLocalizedPageContent('/', safeLocale);

    return (
        <PageDataProvider page={page} allowUnpublished>
            <HomeView />
        </PageDataProvider>
    );
}
