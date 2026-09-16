'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { VirtualTourViewer } from '@/components/ui/VirtualTourViewer';
import { LightboxModal } from '@/components/ui/LightboxModal';
import { CampusPlan3D } from '@/components/3d/CampusPlan3D';
import { Layers, Compass } from 'lucide-react';
import {
  CAMPUS_GALLERY_PHOTOS,
  VisiteHeroSection,
  VisiteFacilitiesDetail,
  VisitePhotoGallery,
  VisiteAccessTransport,
} from '@/components/sections/visite';

export default function VisiteGuideePage() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      <Navbar />

      <main className="flex-grow pt-28">
        {/* 1. Hero Header & Chiffres Clés */}
        <VisiteHeroSection />

        {/* 2. Plan 3D Interactif du Domaine 6 Ha */}
        <section
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
                  TOPOGRAPHIE SPATIALE 3D
                </StuntBadge>
                <span className="text-xs font-mono-tech text-zinc-400">
                  DOMAINE CLOS • LE CATEAU-CAMBRÉSIS
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display uppercase tracking-wide text-white mb-3">
                PLAN 3D INTERACTIF <span className="text-[#FFE500]">DU CAMPUS</span>
              </h2>
              <p className="text-sm font-tech text-zinc-400">
                Faites pivoter la vue aérienne, explorez les 9 infrastructures en
                trois dimensions, et sélectionnez une zone pour découvrir ses
                installations spécialisées.
              </p>
            </div>

            <CampusPlan3D />
          </div>
        </section>

        {/* 3. Visite Virtuelle 360° Interactive (HD Media) */}
        <section
          id="visite-virtuelle-360"
          className="py-16 bg-[#07070a] border-b border-zinc-800 scroll-mt-24"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <StuntBadge
                variant="yellow"
                icon={<Compass className="w-3.5 h-3.5" />}
              >
                EXPÉRIENCE 360° OFFICIELLE
              </StuntBadge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display uppercase tracking-wide text-white mt-3 mb-3">
                VISITE VIRTUELLE <span className="text-[#FFE500]">360° DU CAMPUS</span>
              </h2>
              <p className="text-sm font-tech text-zinc-400">
                Explorez le domaine en immersion totale : naviguez librement
                dans le Zoé Bell Hall, observez la fosse olympique à cubes, la
                Tour CUC de 21m et l'ensemble des plateaux techniques.
              </p>
            </div>

            <VirtualTourViewer />
          </div>
        </section>

        {/* 4. Visite Détaillée des 9 Installations */}
        <VisiteFacilitiesDetail />

        {/* 5. Galerie Photos Authentique avec Lightbox */}
        <VisitePhotoGallery
          photos={CAMPUS_GALLERY_PHOTOS}
          onOpenLightbox={setLightboxIndex}
        />

        {/* 6. Plan d'Accès, Itinéraires & Transport */}
        <VisiteAccessTransport />
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
