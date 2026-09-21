import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import {
  getLocalizedFooterChrome,
  getLocalizedNavigation,
  getLocalizedPageContent,
} from '@/lib/i18n/server';
import { SiteDataProvider } from '@/components/i18n/SiteDataProvider';
import type { Locale } from '@/lib/i18n/entities';
import { HomeView } from './HomeView';

/**
 * Route d'accueil — **Server Component**.
 *
 * Elle résout la localisation AVANT le rendu : contenu de page FR + overlay EN
 * fusionnés, navigation et pied de page traduits inclus. La vue cliente reçoit
 * donc des données déjà dans la bonne langue et son premier rendu est correct —
 * c'est ce qui supprime le français affiché « un bref instant » en mode anglais.
 * L'enveloppe HTML part aussi complète côté serveur (meilleur SEO).
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const [page, navigation, footer] = await Promise.all([
    getLocalizedPageContent('/', locale as Locale),
    getLocalizedNavigation('main', locale as Locale),
    getLocalizedFooterChrome('main', locale as Locale),
  ]);

  return (
    <SiteDataProvider value={{ locale, page, navigation, footer }}>
      <HomeView />
    </SiteDataProvider>
  );
}
