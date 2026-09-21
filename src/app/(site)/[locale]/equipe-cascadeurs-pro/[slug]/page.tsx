import React from 'react';
import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { CUC_TEAM } from '@/data/team';
import { getEntityOverlays } from '@/lib/i18n/server';
import type { Locale } from '@/lib/i18n/entities';
import { applyTeamOverlay } from '@/lib/i18n/apply-team-overlay';
import { CoachDetailClient } from './CoachDetailClient';

interface CoachPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return CUC_TEAM.map((member) => ({
    slug: member.id,
  }));
}

/**
 * Métadonnées localisées : l'overlay EN des coachs (table `site_translations`,
 * entité `team`) est résolu AVANT le rendu — le titre et la description partent
 * donc déjà dans la bonne langue, comme le reste de la fiche.
 */
export async function generateMetadata({ params }: CoachPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const safeLocale: Locale = hasLocale(routing.locales, locale)
    ? (locale as Locale)
    : 'fr';
  const overlays = await getEntityOverlays('team', safeLocale);

  const base = CUC_TEAM.find((m) => m.id === slug);
  if (!base) {
    return {
      title: 'Instructeur introuvable | Campus Univers Cascades',
    };
  }

  const member = applyTeamOverlay(base, overlays[slug]);
  const isEn = safeLocale === 'en';

  const title = `${member.name} — ${member.title} | CUC Stunt Team`;
  const description = isEn
    ? `${member.bio.slice(0, 160)}... Full profile, filmography and specialties of ${member.name} at Campus Univers Cascades.`
    : `${member.bio.slice(0, 160)}... Retrouvez la fiche complète, filmographie et spécialités de ${member.name} au Campus Univers Cascades.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: member.avatarUrl ? [{ url: member.avatarUrl, alt: member.name }] : [],
    },
  };
}

export default async function CoachDetailPage({ params }: CoachPageProps) {
  const { locale, slug } = await params;
  const overlays = hasLocale(routing.locales, locale)
    ? await getEntityOverlays('team', locale as Locale)
    : {};

  return <CoachDetailClient slug={slug} teamOverlays={overlays} />;
}
