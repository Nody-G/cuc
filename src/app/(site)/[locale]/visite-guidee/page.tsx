'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { VirtualTourViewer } from '@/components/ui/VirtualTourViewer';
import { LightboxModal } from '@/components/ui/LightboxModal';
import { Compass } from 'lucide-react';
import { usePageDynamicContent } from '@/lib/hooks/usePageDynamicContent';
import { cucMicro } from '@/lib/preview/cuc-micro';
import {
  CAMPUS_GALLERY_PHOTOS,
  VisiteHeroSection,
  VisiteFacilitiesDetail,
  VisitePhotoGallery,
  VisiteAccessTransport,
} from '@/components/sections/visite';

export default function VisiteGuideePage() {
  const t = useTranslations('visiteGuidee');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { content } = usePageDynamicContent('visite-guidee');

  // Ordre éditorial imposé : infrastructures d'abord, puis visite 360°.
  const SECTION_ORDER: Record<string, number> = {
    hero: 0,
    facilities: 1,
    virtual_tour: 2,
    photos: 3,
    access: 4,
  };

  const sortedSections = (content?.layout_sections ?? [])
    .filter((s) => s.is_visible)
    .sort((a, b) => {
      const orderA = SECTION_ORDER[a.id] ?? a.order + 100;
      const orderB = SECTION_ORDER[b.id] ?? b.order + 100;
      return orderA - orderB;
    });

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'hero':
        return <VisiteHeroSection key="hero" hero={content?.hero} />;

      case 'virtual_tour':
        return (
          <section
            key="virtual_tour"
            id="visite-virtuelle-360"
            className="py-16 bg-[#07070a] border-b border-zinc-800 scroll-mt-24"
          >
            <div className="page-shell">
              <div className="text-center max-w-3xl mx-auto mb-10">
                <StuntBadge
                  variant="yellow"
                  icon={<Compass className="w-3.5 h-3.5" />}
                >
                  <span {...cucMicro('visiteGuidee.tour360Badge')}>{t('tour360Badge')}</span>
                </StuntBadge>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-display uppercase tracking-wide text-white mt-3 mb-3">
                  <span {...cucMicro('visiteGuidee.tour360Title')}>{t('tour360Title')}</span>{' '}
                  <span className="text-[#FFE500]" {...cucMicro('visiteGuidee.tour360TitleAccent')}>
                    {t('tour360TitleAccent')}
                  </span>
                </h2>
                <p className="text-sm font-tech text-zinc-400">
                  <span {...cucMicro('visiteGuidee.tour360Paragraph')}>{t('tour360Paragraph')}</span>
                </p>
              </div>
              <VirtualTourViewer />
            </div>
          </section>
        );

      case 'facilities':
        return <VisiteFacilitiesDetail key="facilities" />;

      case 'photos':
        return (
          <VisitePhotoGallery
            key="photos"
            photos={CAMPUS_GALLERY_PHOTOS}
            onOpenLightbox={setLightboxIndex}
          />
        );

      case 'access':
        return <VisiteAccessTransport key="access" />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      <Navbar />

      <main id="contenu-principal" className="flex-grow pt-28">
        {sortedSections.map((section) => renderSection(section.id))}
      </main>

      {/* Lightbox Modal */}
      <LightboxModal
        images={CAMPUS_GALLERY_PHOTOS}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />

      <Footer />
    </div>
  );
}
