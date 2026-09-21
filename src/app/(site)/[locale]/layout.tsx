import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { RootShell } from '@/components/layout/RootShell';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, DEFAULT_OG_IMAGE } from '@/lib/seo';

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: 'Campus Univers Cascades • École de Cascadeurs',
        template: '%s | CUC',
    },
    description: SITE_DESCRIPTION,
    alternates: {
        canonical: '/',
        languages: {
            fr: '/',
            en: '/en',
        },
    },
    keywords: [
        'cascadeur professionnel',
        'école de cascade',
        'Campus Univers Cascades',
        'CUC',
        'Lucas Dollfus',
        'formation cascadeur cinéma',
        'stage cascade afdas',
        'stunt school europe',
        'le cateau-cambresis',
        'parkour yamakasi',
    ],
    authors: [{ name: 'Campus Univers Cascades - CUC Prod' }],
    openGraph: {
        title: 'CAMPUS UNIVERS CASCADES • École Professionnelle de Cascadeurs',
        description:
            "La plus grande école de cascadeurs professionnels au monde. 11 000 m² d'infrastructures, tour d'impact 21m, certification Qualiopi et formations AFDAS.",
        url: SITE_URL,
        siteName: SITE_NAME,
        images: [DEFAULT_OG_IMAGE],
        locale: 'fr_FR',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'CAMPUS UNIVERS CASCADES • Stunt Academy & Team',
        description: 'Plus grand centre de formation professionnelle de cascadeurs de cinéma au monde.',
        images: [DEFAULT_OG_IMAGE.url],
    },
    icons: {
        icon: [{ url: '/images/logos/cuc-logo-yellow.png', type: 'image/png' }],
        apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    },
};

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    // Active le rendu statique par locale (recommandé par next-intl).
    setRequestLocale(locale);

    const messages = await getMessages();

    return (
        <RootShell locale={locale}>
            <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
        </RootShell>
    );
}
