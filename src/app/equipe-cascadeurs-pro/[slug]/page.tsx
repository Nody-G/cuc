import React from 'react';
import type { Metadata } from 'next';
import { CUC_TEAM } from '@/data/team';
import { CoachDetailClient } from './CoachDetailClient';

interface CoachPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return CUC_TEAM.map((member) => ({
    slug: member.id,
  }));
}

export async function generateMetadata({ params }: CoachPageProps): Promise<Metadata> {
  const { slug } = await params;
  const member = CUC_TEAM.find((m) => m.id === slug);

  if (!member) {
    return {
      title: 'Instructeur introuvable | Campus Univers Cascades',
    };
  }

  const title = `${member.name} — ${member.title} | CUC Stunt Team`;
  const description = `${member.bio.slice(0, 160)}... Retrouvez la fiche complète, filmographie et spécialités de ${member.name} au Campus Univers Cascades.`;

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
  const { slug } = await params;
  return <CoachDetailClient slug={slug} />;
}
