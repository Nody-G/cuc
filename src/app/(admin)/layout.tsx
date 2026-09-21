import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { RootShell } from '@/components/layout/RootShell';
import frMessages from '../../../messages/fr.json';

/**
 * Layout racine du Cockpit CUC (FR uniquement, hors i18n de routage).
 * Le Cockpit n'est jamais indexé. `NextIntlClientProvider` est fourni avec le
 * catalogue FR statique afin que les composants partagés (Navbar, aperçu live)
 * utilisant `useTranslations` fonctionnent sans route localisée.
 */
export const metadata: Metadata = {
    title: 'Cockpit CUC',
    robots: { index: false, follow: false },
};

// Le Cockpit dépend de données d'authentification (cookies/session) : on le
// déclare en route bloquante pour ne pas tenter de prérendu du shell statique.
export const instant = false;

export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
    return (
        <RootShell locale="fr">
            <NextIntlClientProvider locale="fr" messages={frMessages}>
                {children}
            </NextIntlClientProvider>
        </RootShell>
    );
}
