'use client';
import { Link } from '@/i18n/navigation';

import React from 'react';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { VirtualTourViewer } from '@/components/ui/VirtualTourViewer';
import { useTranslations } from 'next-intl';
import { usePageDynamicContent } from '@/lib/hooks/usePageDynamicContent';
import { cucField } from '@/lib/preview/cuc-field';
import { cucMicro } from '@/lib/preview/cuc-micro';
import {
  ChevronRight,
  MapPin,
  Building,
  ShieldCheck,
  PhoneCall,
} from 'lucide-react';

export default function VisiteVirtuellePage() {
  const t = useTranslations('visiteVirtuelle');
  const { content } = usePageDynamicContent('visite-virtuelle');

  const sortedSections = (content?.layout_sections ?? [])
    .filter((s) => s.is_visible)
    .sort((a, b) => a.order - b.order);

  const isSectionVisible = (id: string) =>
    sortedSections.some((s) => s.id === id);

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      <Navbar />

      <main id="contenu-principal" className="flex-grow pt-28 pb-16">
        <div className="page-shell">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-mono-tech text-zinc-400 mb-4">
            <Link href="/" className="hover:text-[#FFE500] transition-colors">
              <span {...cucMicro('visiteVirtuelle.breadcrumbHome')}>{t('breadcrumbHome')}</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <Link href="/visite-guidee" className="hover:text-[#FFE500] transition-colors">
              <span {...cucMicro('visiteVirtuelle.breadcrumbCampus')}>{t('breadcrumbCampus')}</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-[#FFE500]" {...cucMicro('visiteVirtuelle.breadcrumb360')}>
              {t('breadcrumb360')}
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
                  {t('suffix360')}
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
              <Link href="/contact-cuc?demande=stage-decouverte">
                <TacticalButton variant="primary" size="md" icon={<PhoneCall className="w-4 h-4" />}>
                  <span {...cucMicro('visiteVirtuelle.ctaRendezVous')}>{t('ctaRendezVous')}</span>
                </TacticalButton>
              </Link>
            </div>
          </div>

          {/* Interactive Viewer: 360 Player */}
          {isSectionVisible('viewer') && (
            <div className="mb-12">
              <span id="viewer" aria-hidden="true" className="block h-0 scroll-mt-28" />
              <VirtualTourViewer />
            </div>
          )}

          {/* Key Facts and Practical Info */}
          {isSectionVisible('facilities') && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-tech">
              <div className="bg-[#0e0e14] border border-zinc-800 p-6 relative">
                <div className="flex items-center gap-3 mb-3">
                  <Building className="w-5 h-5 text-[#FFE500]" />
                  <h2 className="font-display uppercase text-lg text-white">
                    <span {...cucMicro('visiteVirtuelle.factsTitle1')}>{t('factsTitle1')}</span>
                  </h2>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  <span {...cucMicro('visiteVirtuelle.factsBody1')}>{t('factsBody1')}</span>
                </p>
              </div>

              <div className="bg-[#0e0e14] border border-zinc-800 p-6 relative">
                <div className="flex items-center gap-3 mb-3">
                  <ShieldCheck className="w-5 h-5 text-[#FFE500]" />
                  <h2 className="font-display uppercase text-lg text-white">
                    <span {...cucMicro('visiteVirtuelle.factsTitle2')}>{t('factsTitle2')}</span>
                  </h2>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  <span {...cucMicro('visiteVirtuelle.factsBody2')}>{t('factsBody2')}</span>
                </p>
              </div>

              <div className="bg-[#0e0e14] border border-zinc-800 p-6 relative">
                <div className="flex items-center gap-3 mb-3">
                  <MapPin className="w-5 h-5 text-[#FFE500]" />
                  <h2 className="font-display uppercase text-lg text-white">
                    <span {...cucMicro('visiteVirtuelle.factsTitle3')}>{t('factsTitle3')}</span>
                  </h2>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  <span {...cucMicro('visiteVirtuelle.factsBody3')}>{t('factsBody3')}</span>
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
