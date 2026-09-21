'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { VirtualTourViewer } from '@/components/ui/VirtualTourViewer';
import { LightboxModal } from '@/components/ui/LightboxModal';
import { Layers, Compass } from 'lucide-react';
import { usePageDynamicContent } from '@/lib/hooks/usePageDynamicContent';
import {
  CAMPUS_GALLERY_PHOTOS,
  VisiteHeroSection,
  VisiteFacilitiesDetail,
  VisitePhotoGallery,
  VisiteAccessTransport,
} from '@/components/sections/visite';

/**
 * Attente du plan 3D : composant dédié, car `dynamic()` est évalué au niveau du
 * module, hors du composant de page — le hook de traduction n'y est pas
 * disponible.
 */
const Plan3DLoading: React.FC = () => {
  const t = useTranslations('visiteGuidee');
  return (
    <div className="w-full h-[520px] sm:h-[620px] lg:h-[720px] flex items-center justify-center bg-[#0c0c12] border border-zinc-800">
      <span className="text-xs font-mono-tech text-zinc-500 uppercase tracking-widest animate-pulse">
        {t('loading3d')}
      </span>
    </div>
  );
};

// Three.js (~600 ko) chargé à la demande, uniquement côté client.
const CampusPlan3D = dynamic(
  () => import('@/components/3d/CampusPlan3D').then((m) => m.CampusPlan3D),
  {
    ssr: false,
    loading: () => <Plan3DLoading />,
  }
);

export default function VisiteGuideePage() {
  const t = useTranslations('visiteGuidee');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { content } = usePageDynamicContent('visite-guidee');

  // Ordre éditorial imposé : infrastructures d'abord, puis visite 360°, puis plan 3D.
  const SECTION_ORDER: Record<string, number> = {
    hero: 0,
    facilities: 1,
    virtual_tour: 2,
    plan_3d: 3,
    photos: 4,
    access: 5,
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
        return <VisiteHeroSection key="hero" />;

      case 'plan_3d':
        return (
          <section
            key="plan_3d"
            id="plan-3d-domaine"
            className="py-16 bg-[#060608] border-b border-zinc-800 scroll-mt-24"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-10">
                <div className="inline-flex items-center gap-2 mb-2">
                  <StuntBadge
                    variant="yellow"
                    icon={<Layers className="w-3.5 h-3.5" />}
                  >
                    {t('tour3dBadge')}
                  </StuntBadge>
                  <span className="text-xs font-mono-tech text-zinc-400">
                    DOMAINE CLOS • LE CATEAU-CAMBRÉSIS
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-display uppercase tracking-wide text-white mb-3">
                  {t('tour3dTitle')} <span className="text-[#FFE500]">{t('tour3dTitleAccent')}</span>
                </h2>
                <p className="text-sm font-tech text-zinc-400">
                  {t('tour3dParagraph')}
                </p>
              </div>
              <CampusPlan3D />
            </div>
          </section>
        );

      case 'virtual_tour':
        return (
          <section
            key="virtual_tour"
            id="visite-virtuelle-360"
            className="py-16 bg-[#07070a] border-b border-zinc-800 scroll-mt-24"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-10">
                <StuntBadge
                  variant="yellow"
                  icon={<Compass className="w-3.5 h-3.5" />}
                >
                  {t('tour360Badge')}
                </StuntBadge>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-display uppercase tracking-wide text-white mt-3 mb-3">
                  {t('tour360Title')} <span className="text-[#FFE500]">{t('tour360TitleAccent')}</span>
                </h2>
                <p className="text-sm font-tech text-zinc-400">
                  {t('tour360Paragraph')}
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
