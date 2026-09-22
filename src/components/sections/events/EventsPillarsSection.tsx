'use client';
import { Link } from '@/i18n/navigation';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';

import Image from 'next/image';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { getEvents, SiteEvent } from '@/lib/data/site-service';
import { useRealtimeRefresh } from '@/lib/hooks/useRealtimeRefresh';
import { applyEventOverlays } from '@/lib/i18n/apply-event-overlay';
import { useEntityOverlays } from '@/lib/hooks/useEntityOverlays';
import { mergeSectionItems, usePageSectionData } from '@/lib/hooks/usePageSectionData';
import { cucField, itemPath } from '@/lib/preview/cuc-field';

/** Copie éditoriale d'un pilier d'agence (repli quand la base est vide). */
interface PillarCopy {
  tag: string;
  title: string;
  paragraph1: string;
  paragraph2: string;
  cta: string;
  imageAlt: string;
}

export const EventsPillarsSection: React.FC = () => {
  const t = useTranslations('eventsAgence');
  /** Chrome commun : nom du campus (repli visuel d'affiche). */
  const chrome = useTranslations('commonChrome');
  const pillars = t.raw('pillars') as PillarCopy[];

  /**
   * Textes des piliers éditables en place : les données de la page
   * (`sections_data.events_pillars.items`) priment, le repli traduit reste.
   */
  const sectionData = usePageSectionData<{ items?: Array<Partial<PillarCopy>> }>(
    'events_pillars'
  );
  const pillarItems = mergeSectionItems(pillars, sectionData);
  const [dbEvents, setDbEvents] = useState<SiteEvent[]>([]);

  /**
   * Overlays EN des événements (entité `event`).
   *
   * Sans eux, les trois événements de `site_events` s'affichaient en français
   * sur les pages anglaises : la traduction existait en base mais aucun écran ne
   * la lisait. Défaut hors de portée du crawler, ces lignes étant chargées côté
   * navigateur (hors HTML initial).
   */
  const eventOverlays = useEntityOverlays('event');
  const localizedEvents = applyEventOverlays(dbEvents, eventOverlays);

  /** Recharge les événements (état initial + synchronisation Realtime). */
  const loadEvents = useCallback(() => {
    getEvents().then((evts) => {
      if (evts && evts.length > 0) {
        setDbEvents(evts);
      }
    });
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Synchronisation Realtime Cockpit → Vitrine (événements d'agence).
  useRealtimeRefresh(['site_events'], loadEvents);

  return (
    <section className="py-20">
      <div className="page-shell space-y-16">
        {localizedEvents.length > 0 ? (
          localizedEvents.map((evt, idx) => {
            const isReversed = idx % 2 === 1;
            return (
              <div
                key={evt.id}
                className="bg-[#0e0e14] border-2 border-zinc-800 hover:border-[#FFE500]/50 transition-all p-8 relative"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div
                    className={`lg:col-span-7 space-y-4 ${isReversed ? 'order-1 lg:order-2' : ''
                      }`}
                  >
                    <div className="mb-4">
                      {evt.badge && (
                        <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider block mb-1">
                          {evt.badge}
                        </span>
                      )}
                      <h3 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white">
                        {evt.title}
                      </h3>
                      {evt.subtitle && (
                        <div className="text-xs font-mono-tech text-zinc-400 mt-1 uppercase">
                          {evt.subtitle}
                        </div>
                      )}
                    </div>

                    {evt.description && (
                      <p className="text-sm font-tech text-zinc-300 leading-relaxed whitespace-pre-line">
                        {evt.description}
                      </p>
                    )}

                    {evt.features && evt.features.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                        {evt.features.map((feat, fIdx) => (
                          <div
                            key={fIdx}
                            className="flex items-center gap-2 text-xs text-zinc-300 font-tech"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#FFE500] shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-4">
                      <Link href={evt.cta_link || '/contact-cuc?demande=cuc-events'}>
                        <TacticalButton
                          variant="primary"
                          size="md"
                          icon={<ArrowRight className="w-4 h-4" />}
                        >
                          {evt.cta_text || t('learnMore')}
                        </TacticalButton>
                      </Link>
                    </div>
                  </div>

                  <div
                    className={`lg:col-span-5 relative h-64 sm:h-72 border border-zinc-800 overflow-hidden bg-black ${isReversed ? 'order-2 lg:order-1' : ''
                      }`}
                  >
                    {evt.image_url ? (
                      <Image
                        src={evt.image_url}
                        alt={evt.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600 font-mono text-xs">
                        {chrome('campusNameTitle')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <>
            {/* 1. SPECTACLES (Fallback) */}
            <div className="bg-[#0e0e14] border-2 border-zinc-800 hover:border-[#FFE500]/50 transition-all p-8 relative">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="mb-4">
                    <span
                      {...cucField(itemPath('events_pillars', 0, 'tag'))}
                      className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider block mb-1"
                    >
                      {pillarItems[0].tag}
                    </span>
                    <h3
                      {...cucField(itemPath('events_pillars', 0, 'title'))}
                      className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white"
                    >
                      {pillarItems[0].title}
                    </h3>
                  </div>

                  <p
                    {...cucField(itemPath('events_pillars', 0, 'paragraph1'), 'textarea')}
                    className="text-sm font-tech text-zinc-300 leading-relaxed"
                  >
                    {pillarItems[0].paragraph1}
                  </p>
                  <p
                    {...cucField(itemPath('events_pillars', 0, 'paragraph2'), 'textarea')}
                    className="text-xs font-tech text-zinc-400 leading-relaxed"
                  >
                    {pillarItems[0].paragraph2}
                  </p>

                  <div className="pt-4">
                    <Link href="/contact-cuc?demande=cuc-events">
                      <TacticalButton variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                        <span {...cucField(itemPath('events_pillars', 0, 'cta'))}>
                          {pillarItems[0].cta}
                        </span>
                      </TacticalButton>
                    </Link>
                  </div>
                </div>

                <div
                  {...cucField(itemPath('events_pillars', 0, 'image'), 'image')}
                  className="lg:col-span-5 relative h-64 sm:h-72 border border-zinc-800 overflow-hidden bg-black"
                >
                  <Image
                    src="https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Photos-Spectacle-300x200.jpg"
                    alt={pillarItems[0].imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* 2. ANIMATIONS */}
            <div className="bg-[#0e0e14] border-2 border-zinc-800 hover:border-[#FFE500]/50 transition-all p-8 relative">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div
                  {...cucField(itemPath('events_pillars', 1, 'image'), 'image')}
                  className="lg:col-span-5 relative h-64 sm:h-72 border border-zinc-800 overflow-hidden bg-black order-2 lg:order-1"
                >
                  <Image
                    src="https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/FreeJump-CCJ-Puteaux-03-300x200.jpg"
                    alt={pillarItems[1].imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>

                <div className="lg:col-span-7 space-y-4 order-1 lg:order-2">
                  <div className="mb-4">
                    <span
                      {...cucField(itemPath('events_pillars', 1, 'tag'))}
                      className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider block mb-1"
                    >
                      {pillarItems[1].tag}
                    </span>
                    <h3
                      {...cucField(itemPath('events_pillars', 1, 'title'))}
                      className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white"
                    >
                      {pillarItems[1].title}
                    </h3>
                  </div>

                  <p
                    {...cucField(itemPath('events_pillars', 1, 'paragraph1'), 'textarea')}
                    className="text-sm font-tech text-zinc-300 leading-relaxed"
                  >
                    {pillarItems[1].paragraph1}
                  </p>
                  <p
                    {...cucField(itemPath('events_pillars', 1, 'paragraph2'), 'textarea')}
                    className="text-xs font-tech text-zinc-400 leading-relaxed"
                  >
                    {pillarItems[1].paragraph2}
                  </p>

                  <div className="pt-4">
                    <Link href="/contact-cuc?demande=cuc-events">
                      <TacticalButton variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                        <span {...cucField(itemPath('events_pillars', 1, 'cta'))}>
                          {pillarItems[1].cta}
                        </span>
                      </TacticalButton>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. TEAM BUILDING */}
            <div className="bg-[#0e0e14] border-2 border-zinc-800 hover:border-[#FFE500]/50 transition-all p-8 relative">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="mb-4">
                    <span
                      {...cucField(itemPath('events_pillars', 2, 'tag'))}
                      className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider block mb-1"
                    >
                      {pillarItems[2].tag}
                    </span>
                    <h3
                      {...cucField(itemPath('events_pillars', 2, 'title'))}
                      className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white"
                    >
                      {pillarItems[2].title}
                    </h3>
                  </div>

                  <p
                    {...cucField(itemPath('events_pillars', 2, 'paragraph1'), 'textarea')}
                    className="text-sm font-tech text-zinc-300 leading-relaxed"
                  >
                    {pillarItems[2].paragraph1}
                  </p>
                  <p
                    {...cucField(itemPath('events_pillars', 2, 'paragraph2'), 'textarea')}
                    className="text-xs font-tech text-zinc-400 leading-relaxed"
                  >
                    {pillarItems[2].paragraph2}
                  </p>

                  <div className="pt-4">
                    <Link href="/contact-cuc?demande=cuc-events">
                      <TacticalButton variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                        <span {...cucField(itemPath('events_pillars', 2, 'cta'))}>
                          {pillarItems[2].cta}
                        </span>
                      </TacticalButton>
                    </Link>
                  </div>
                </div>

                <div
                  {...cucField(itemPath('events_pillars', 2, 'image'), 'image')}
                  className="lg:col-span-5 relative h-64 sm:h-72 border border-zinc-800 overflow-hidden bg-black"
                >
                  <Image
                    src="https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/A-atelier-cinema-indoor-300x200.jpg"
                    alt={pillarItems[2].imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

