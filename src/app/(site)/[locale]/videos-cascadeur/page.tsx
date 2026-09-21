'use client';
import { Link } from '@/i18n/navigation';

import React, { useState } from 'react';

import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StuntBadge } from '@/components/ui/StuntBadge';
import {
  Video,
  Play,
  Tv,
  ChevronRight,
  ExternalLink,
  X
} from 'lucide-react';
import { PROGRAMMES_TV } from '@/data/videos';
import { getVideos } from '@/lib/data/site-service';
import { videoObjectJsonLd } from '@/lib/seo';

import { usePageDynamicContent } from '@/lib/hooks/usePageDynamicContent';
import { useRealtimeRefresh } from '@/lib/hooks/useRealtimeRefresh';
import { useTranslations } from 'next-intl';

/** Titre et sous-titre localisés d'un programme, appariés par `dmId`. */
interface VideoCopy {
  dmId: string;
  title: string;
  sub: string;
}

interface MediaItem {
  channel: string;
  label: string;
}

export default function VideosCascadeurPage() {
  const t = useTranslations('videos');
  const [activeVideo, setActiveVideo] = useState<'tf1' | 'france2'>('tf1');
  const [selectedDmVideo, setSelectedDmVideo] = useState<{ id: string; title: string } | null>(null);
  const [tvPrograms, setTvPrograms] = useState(PROGRAMMES_TV);
  const { content } = usePageDynamicContent('videos-cascadeur');
  const videoCopy = t.raw('programs') as VideoCopy[];
  const mediaItems = t.raw('mediaItems') as MediaItem[];

  /** Recharge les programmes TV (état initial + synchronisation Realtime). */
  const loadVideos = React.useCallback(() => {
    getVideos().then(setTvPrograms);
  }, []);

  React.useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  // Synchronisation Realtime Cockpit → Vitrine (clé `videos` de site_settings).
  useRealtimeRefresh(['site_settings'], loadVideos);

  /**
   * Titres et sous-titres des programmes : les DONNÉES (`site_videos` /
   * `PROGRAMMES_TV`) fournissent `dmId` et l'image, la copie éditoriale vient du
   * catalogue (`videos.programs`). Un `dmId` sans copie retombe sur la donnée.
   */
  const localizedPrograms = React.useMemo(() => {
    const byId = new Map(videoCopy.map((copy) => [copy.dmId, copy]));
    return tvPrograms.map((program) => {
      const copy = byId.get(program.dmId);
      return copy ? { ...program, title: copy.title, sub: copy.sub } : program;
    });
  }, [tvPrograms, videoCopy]);

  const heroBadge = content.hero?.badge || t('heroBadge');
  const heroTitle = content.hero?.title || t('heroTitle');
  const heroSubtitle = content.hero?.subtitle || t('heroSubtitle');
  const heroBg =
    content.hero?.bg_image ||
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/slider-5-scaled.jpg';

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      {/* JSON-LD : un VideoObject par programme TV (rich results Google Vidéo) */}
      {localizedPrograms.map((v) => (
        <script
          key={v.dmId}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              videoObjectJsonLd({
                name: v.title,
                description: v.sub,
                thumbnailUrl: v.img,
                embedUrl: `https://www.dailymotion.com/embed/video/${v.dmId}`,
              })
            ),
          }}
        />
      ))}

      <Navbar />

      <main id="contenu-principal" className="flex-grow pt-28">
        {/* Hero Header */}
        <section className="relative py-20 bg-black border-b border-zinc-800 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src={heroBg}
              alt={t('heroImageAlt')}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center brightness-35 contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/80 to-transparent" />
          </div>

          <div className="relative z-10 page-shell">
            <div className="flex items-center gap-2 text-xs font-mono-tech text-zinc-400 mb-4">
              <Link href="/" className="hover:text-[#FFE500] transition-colors">
                {t('breadcrumbHome')}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              <span className="text-[#FFE500]">{t('breadcrumbCurrent')}</span>
            </div>

            <div className="inline-flex items-center gap-2 mb-4">
              <StuntBadge variant="yellow" icon={<Tv className="w-3.5 h-3.5" />}>
                {heroBadge}
              </StuntBadge>
              <span className="text-xs font-mono-tech text-zinc-400">
                {t('heroMeta')}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display uppercase tracking-tight text-white max-w-5xl leading-none">
              {heroTitle.includes('&') ? (
                <>
                  {heroTitle.split('&')[0]} &amp;{' '}
                  <span className="text-[#FFE500]">{heroTitle.split('&')[1]}</span>
                </>
              ) : (
                heroTitle
              )}
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 font-tech max-w-3xl mt-4 leading-relaxed">
              {heroSubtitle}
            </p>
          </div>
        </section>

        {/* Video Player Box */}
        <section className="py-16">
          <div className="page-shell">
            {/* Video Selector Tabs */}
            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={() => setActiveVideo('tf1')}
                className={`px-5 py-3 border font-mono-tech text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${activeVideo === 'tf1'
                  ? 'bg-[#FFE500] text-black border-[#FFE500] font-bold shadow-lg'
                  : 'bg-[#101016] border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
              >
                <Tv className="w-4 h-4" />
                <span>{t('tabTf1')}</span>
              </button>

              <button
                onClick={() => setActiveVideo('france2')}
                className={`px-5 py-3 border font-mono-tech text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${activeVideo === 'france2'
                  ? 'bg-[#FFE500] text-black border-[#FFE500] font-bold shadow-lg'
                  : 'bg-[#101016] border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
              >
                <Tv className="w-4 h-4" />
                <span>{t('tabFrance2')}</span>
              </button>
            </div>

            {/* Main Video Screen with HUD Frame */}
            <div className="bg-[#0e0e14] border-2 border-zinc-800 p-4 sm:p-8 relative">

              <div className="relative aspect-video w-full bg-black border border-zinc-800 overflow-hidden mb-6">
                {activeVideo === 'tf1' ? (
                  <video
                    key="tf1-video"
                    controls
                    preload="metadata"
                    className="w-full h-full object-contain"
                    poster="https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/ReportageBFMTV-Alecoledescascadeurs.jpeg"
                  >
                    <source
                      src="https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/reportages/TF1-JT-20h-CUC-reportage-1.mp4"
                      type="video/mp4"
                    />
                    {t('videoFallback')}
                  </video>
                ) : (
                  <video
                    key="france2-video"
                    controls
                    preload="metadata"
                    className="w-full h-full object-contain"
                    poster="https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/coeur-de-cascadeurs.jpeg"
                  >
                    <source
                      src="https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/reportages/20h30-A-LECOLE-DES-CASCADEURS-FRANCE2-VWeb2-1-part1.mp4"
                      type="video/mp4"
                    />
                    <source
                      src="https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/reportages/20h30-A-LECOLE-DES-CASCADEURS-FRANCE2-VWeb2-1-part2.mp4"
                      type="video/mp4"
                    />
                    {t('videoFallback')}
                  </video>
                )}
              </div>

              {/* Video Information */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-display uppercase text-white">
                    {activeVideo === 'tf1' ? t('tf1Title') : t('france2Title')}
                  </h2>
                  <p className="text-xs sm:text-sm font-tech text-zinc-400 mt-1 max-w-3xl">
                    {activeVideo === 'tf1' ? t('tf1Desc') : t('france2Desc')}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-3 py-1.5 bg-[#14141c] border border-zinc-800 text-xs font-mono-tech text-[#FFE500]">
                    {t('broadcastBadge')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Real CUC Videos & Documentaries Grid */}
        <section className="py-16 bg-[#09090d] border-t border-zinc-800">
          <div className="page-shell">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <StuntBadge variant="yellow" icon={<Video className="w-3.5 h-3.5" />}>
                {t('docusBadge')}
              </StuntBadge>
              <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white mt-3 mb-2">
                {t('docusTitle')}
              </h2>
              <p className="text-xs sm:text-sm font-tech text-zinc-400">
                {t('docusHint')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {localizedPrograms.map((v, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedDmVideo({ id: v.dmId, title: v.title })}
                  className="bg-[#0e0e14] border border-zinc-800 hover:border-[#FFE500]/70 transition-all p-4 group text-left cursor-pointer focus:outline-hidden"
                >
                  <div className="relative aspect-video w-full mb-3 border border-zinc-800 overflow-hidden bg-black">
                    <Image
                      src={v.img}
                      alt={v.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-[#FFE500] text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-black ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-display uppercase text-lg text-white group-hover:text-[#FFE500] transition-colors">
                    {v.title}
                  </h3>
                  <p className="text-xs font-tech text-zinc-400">{v.sub}</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Video Player Modal */}
        {selectedDmVideo && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedDmVideo(null)}
          >
            <div
              className="relative w-full max-w-4xl bg-[#0e0e14] border-2 border-[#FFE500] p-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
                <h3 className="font-display text-xl uppercase text-white tracking-wide">
                  {selectedDmVideo.title}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedDmVideo(null)}
                  className="p-1.5 text-zinc-400 hover:text-white border border-zinc-800 hover:border-[#FFE500] transition-colors cursor-pointer"
                  title={t('closeTitle')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="relative aspect-video w-full bg-black">
                <iframe
                  src={`https://www.dailymotion.com/embed/video/${selectedDmVideo.id}?autoplay=1`}
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}

        {/* Médias & Réseaux Sociaux */}
        <section className="py-16 bg-[#0c0c10] border-t border-zinc-800">
          <div className="page-shell">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider block mb-2">
                {t('mediaTag')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white mb-3">
                {t('mediaTitle')}
              </h2>
              <p className="text-sm font-tech text-zinc-400">
                {t('mediaIntro')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mediaItems.map((item, index) => (
                <div
                  key={item.channel}
                  className="bg-[#121218] border border-zinc-800 p-6 text-center"
                >
                  <div
                    className={`text-3xl sm:text-4xl font-display mb-1 ${index % 2 === 0 ? 'text-[#FFE500]' : 'text-white'}`}
                  >
                    {item.channel}
                  </div>
                  <div className="text-xs font-mono-tech text-zinc-400 uppercase">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <a
                href="https://www.instagram.com/campus.univers.cascades/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-[#121218] border border-zinc-800 hover:border-[#FFE500] text-xs font-mono-tech text-zinc-300 hover:text-white flex items-center gap-2 transition-colors"
              >
                <span>{t('socialInstagram')}</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#FFE500]" />
              </a>

              <a
                href="https://www.tiktok.com/@campusuniverscascades"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-[#121218] border border-zinc-800 hover:border-[#FFE500] text-xs font-mono-tech text-zinc-300 hover:text-white flex items-center gap-2 transition-colors"
              >
                <span>{t('socialTiktok')}</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#FFE500]" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
