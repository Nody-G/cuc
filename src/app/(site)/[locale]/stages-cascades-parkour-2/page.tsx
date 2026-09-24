'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useRouter } from '@/i18n/navigation';
import { StagesHeroSection, StagesGridSection } from '@/components/sections/stages';
import { usePageDynamicContent } from '@/lib/hooks/usePageDynamicContent';

/**
 * Page Stages — aucun bloc de contact : les CTA mènent à la page contact,
 * pré-remplie avec l'intention (`?demande=<stage>`), puis cale la vue sur le
 * formulaire (`#contact-form`).
 */
export default function StagesCascadesParkourPage() {
  const router = useRouter();
  const { content } = usePageDynamicContent('stages-cascades-parkour-2');

  const handleOpenApplication = (programId: string) =>
    router.push(`/contact-cuc?demande=${programId}#contact-form`);

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      <Navbar />

      <main id="contenu-principal" className="flex-grow pt-28">
        <StagesHeroSection heroData={content.hero} />
        <StagesGridSection
          onOpenApplication={handleOpenApplication}
          customStages={content.sections_data?.stages_catalogue}
        />
      </main>

      <Footer />
    </div>
  );
}
