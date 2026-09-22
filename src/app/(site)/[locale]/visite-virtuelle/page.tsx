'use client';
import { Link } from '@/i18n/navigation';

import React, { useState, useEffect } from 'react';

import dynamic from 'next/dynamic';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { VirtualTourViewer } from '@/components/ui/VirtualTourViewer';
import { soundFX } from '@/lib/soundFx';
import { useTranslations } from 'next-intl';
import { usePageDynamicContent } from '@/lib/hooks/usePageDynamicContent';
import { cucField } from '@/lib/preview/cuc-field';
import {
  ChevronRight,
  MapPin,
  Building,
  ShieldCheck,
  PhoneCall,
  Layers,
  Eye,
} from 'lucide-react';

/**
 * Attente du plan 3D : composant dédié, car `dynamic()` est évalué au niveau du
 * module, hors du composant de page — le hook de traduction n'y est pas
 * disponible.
 */
const Plan3DLoading: React.FC = () => {
  const t = useTranslations('visiteVirtuelle');
  return (
    <div className="w-full h-[520px] sm:h-[620px] lg:h-[720px] flex items-center justify-center bg-[#0c0c12] border border-zinc-800">
      <span className="text-xs font-mono-tech text-zinc-500 uppercase tracking-widest animate-pulse">
        {t('loading3d')}
      </span>
    </div>
  );
};

// Three.js (~600 ko) chargé à la demande, uniquement côté client, quand
// l'utilisateur ouvre l'onglet « Plan 3D ». Évite de pénaliser le LCP initial.
const CampusPlan3D = dynamic(
  () => import('@/components/3d/CampusPlan3D').then((m) => m.CampusPlan3D),
  {
    ssr: false,
    loading: () => <Plan3DLoading />,
  }
);

export default function VisiteVirtuellePage() {
  const t = useTranslations('visiteVirtuelle');
  const [activeTab, setActiveTab] = useState<'360' | '3d'>('360');
  const { content } = usePageDynamicContent('visite-virtuelle');

  const sortedSections = (content?.layout_sections ?? [])
    .filter((s) => s.is_visible)
    .sort((a, b) => a.order - b.order);

  const isSectionVisible = (id: string) =>
    sortedSections.some((s) => s.id === id);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);
      if (hash === '#plan-3d-campus' || params.get('tab') === '3d') {
        setActiveTab('3d');
      }
    };

    window.addEventListener('hashchange', handleHash);
    const timer = setTimeout(handleHash, 0);
    return () => {
      window.removeEventListener('hashchange', handleHash);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      <Navbar />

      <main id="contenu-principal" className="flex-grow pt-28 pb-16">
        <div className="page-shell">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-mono-tech text-zinc-400 mb-4">
            <Link href="/" className="hover:text-[#FFE500] transition-colors">
              {t('breadcrumbHome')}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <Link href="/visite-guidee" className="hover:text-[#FFE500] transition-colors">
              {t('breadcrumbCampus')}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-[#FFE500]">
              {activeTab === '360' ? t('breadcrumb360') : t('breadcrumb3d')}
            </span>
          </div>

          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span
                  {...cucField('hero.badge')}
                  className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider"
                >
                  {content.hero?.badge || t('pageTag')}
                </span>
                <span className="text-xs font-mono-tech text-zinc-500">•</span>
                <span
                  {...cucField('hero.meta')}
                  className="text-xs font-mono-tech text-zinc-400"
                >
                  {content.hero?.meta || 'LE CATEAU-CAMBRÉSIS'}
                </span>
              </div>

              <h1
                {...cucField('hero.title')}
                className="text-4xl sm:text-5xl md:text-6xl font-display uppercase tracking-tight text-white leading-none"
              >
                {content.hero?.title || t('pageTitle')}{' '}
                <span className="text-[#FFE500]">
                  {activeTab === '360' ? t('suffix360') : t('suffix3d')}
                </span>
              </h1>

              <p
                {...cucField('hero.subtitle', 'textarea')}
                className="text-sm sm:text-base text-zinc-300 font-tech mt-3 max-w-3xl leading-relaxed"
              >
                {content.hero?.subtitle || t('pageSubtitle')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="bg-[#121218] border border-zinc-800 p-1 flex items-center">
                <button
                  onClick={() => {
                    setActiveTab('360');
                    soundFX.playTacticalClick();
                  }}
                  className={`px-3 py-1.5 text-xs font-mono-tech font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === '360'
                    ? 'bg-[#FFE500] text-black shadow'
                    : 'text-zinc-400 hover:text-white'
                    }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{t('tab360Label')}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('3d');
                    soundFX.playTacticalClick();
                  }}
                  className={`px-3 py-1.5 text-xs font-mono-tech font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === '3d'
                    ? 'bg-[#FFE500] text-black shadow'
                    : 'text-zinc-400 hover:text-white'
                    }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{t('tab3dLabel')}</span>
                </button>
              </div>

              <Link href="/contact-cuc?demande=stage-decouverte">
                <TacticalButton variant="primary" size="md" icon={<PhoneCall className="w-4 h-4" />}>
                  {t('ctaRendezVous')}
                </TacticalButton>
              </Link>
            </div>
          </div>

          {/* Interactive Viewer: either 360 Player or 3D Campus Plan */}
          {isSectionVisible('viewer') && (
            <div id="plan-3d-campus" className="mb-12 scroll-mt-28">
              {activeTab === '360' ? (
                <VirtualTourViewer />
              ) : (
                <CampusPlan3D />
              )}
            </div>
          )}

          {/* Key Facts and Practical Info */}
          {isSectionVisible('facilities') && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-tech">
              <div className="bg-[#0e0e14] border border-zinc-800 p-6 relative">
                <div className="flex items-center gap-3 mb-3">
                  <Building className="w-5 h-5 text-[#FFE500]" />
                  <h2 className="font-display uppercase text-lg text-white">
                    {t('factsTitle1')}
                  </h2>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {t('factsBody1')}
                </p>
              </div>

              <div className="bg-[#0e0e14] border border-zinc-800 p-6 relative">
                <div className="flex items-center gap-3 mb-3">
                  <ShieldCheck className="w-5 h-5 text-[#FFE500]" />
                  <h2 className="font-display uppercase text-lg text-white">
                    {t('factsTitle2')}
                  </h2>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {t('factsBody2')}
                </p>
              </div>

              <div className="bg-[#0e0e14] border border-zinc-800 p-6 relative">
                <div className="flex items-center gap-3 mb-3">
                  <MapPin className="w-5 h-5 text-[#FFE500]" />
                  <h2 className="font-display uppercase text-lg text-white">
                    {t('factsTitle3')}
                  </h2>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {t('factsBody3')}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
