'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useRouter } from '@/i18n/navigation';
import { WorkshopHero } from './sections/WorkshopHero';
import { WorkshopHighlights } from './sections/WorkshopHighlights';
import { WorkshopProgram } from './sections/WorkshopProgram';
import { WorkshopInfoCards } from './sections/WorkshopInfoCards';
import { WorkshopApplyBox } from './sections/WorkshopApplyBox';
import { useWorkshopContent } from './sections/useWorkshopContent';

/**
 * Workshop international — les CTA mènent à la page contact, pré-remplie avec
 * l'intention « workshop-international » (`?demande=…`), puis cale la vue sur le
 * formulaire (`#contact-form`). Aucune fenêtre de contact.
 */
export default function StuntWorkshopCucPage() {
  const router = useRouter();
  const copy = useWorkshopContent();

  const handleApply = () =>
    router.push('/contact-cuc?demande=workshop-international#contact-form');

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      <Navbar />

      <main id="contenu-principal" className="flex-grow pt-28">
        {/* International Workshop Hero */}
        <WorkshopHero breadcrumbs={copy.breadcrumbs} hero={copy.hero} onApply={handleApply} />

        {/* Global Key Highlights */}
        <WorkshopHighlights highlights={copy.highlights} />

        {/* Workshop Content & Curriculum */}
        <WorkshopProgram program={copy.program} curriculum={copy.curriculum} />

        {/* Accommodation & Location Info */}
        <section className="py-16 bg-[#0c0c10] border-t border-zinc-800">
          <div className="page-shell">
            <WorkshopInfoCards
              location={copy.location}
              housing={copy.housing}
              certificate={copy.certificate}
            />

            <WorkshopApplyBox cta={copy.cta} onApply={handleApply} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
