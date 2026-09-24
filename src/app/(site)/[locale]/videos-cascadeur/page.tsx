'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { videoObjectJsonLd } from '@/lib/seo';
import { useVideosPage } from './sections/useVideosPage';
import { VideosHero } from './sections/VideosHero';
import { VideosDocusGrid } from './sections/VideosDocusGrid';
import { DmVideoModal } from './sections/DmVideoModal';
import { VideosReelsSection } from './sections/VideosReelsSection';
import { VideosReelsModal } from './sections/VideosReelsModal';
import { VideosMediaSection } from './sections/VideosMediaSection';

/**
 * Page « Vidéos & Reportages » — documentaires Dailymotion et relais médias.
 * Copie éditable en Studio (`sections_data` + catalogue i18n), données
 * `site_videos` synchronisées en Realtime. Implémentation découpée dans
 * `./sections/**`.
 */
export default function VideosCascadeurPage() {
  const page = useVideosPage();

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      {/* JSON-LD : un VideoObject par programme TV (rich results Google Vidéo) */}
      {page.localizedPrograms.map((v) => (
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
        <VideosHero hero={page.hero} labels={page.labels} />

        {/* Real CUC Videos & Documentaries Grid */}
        <VideosDocusGrid
          programs={page.localizedPrograms}
          onSelectProgram={page.openDmVideo}
          labels={page.labels}
        />

        {/* Video Player Modal */}
        <DmVideoModal
          video={page.selectedDmVideo}
          onClose={page.closeDmVideo}
          closeTitle={page.labels.closeTitle}
        />

        {/* Real CUC Action & Stunt Reels (Instagram) — Zéro badge */}
        <VideosReelsSection
          reels={page.localizedReels}
          allReels={page.allReels}
          columns={page.reelsColumns}
          onSelectReel={page.openReel}
          labels={{
            title: page.labels.reelsTitle,
            intro: page.labels.reelsIntro,
            play: page.labels.reelsPlay,
            socialInstagram: page.labels.socialInstagram,
            seeMore: page.labels.reelsSeeMore,
            sortByFeatured: page.labels.reelsSortByFeatured,
            sortByViews: page.labels.reelsSortByViews,
            sortByDateDesc: page.labels.reelsSortByDateDesc,
            sortByDateAsc: page.labels.reelsSortByDateAsc,
          }}
        />

        {/* Reel Player Modal (Lazy loaded 9:16 smartphone player) */}
        <VideosReelsModal
          reel={page.selectedReel}
          onClose={page.closeReel}
          onPrev={page.prevReel}
          onNext={page.nextReel}
          hasPrev={page.hasPrevReel}
          hasNext={page.hasNextReel}
          labels={{
            closeTitle: page.labels.closeTitle,
            watchOnInsta: page.labels.reelsWatchOnInsta,
            prev: page.labels.reelsPrev,
            next: page.labels.reelsNext,
          }}
        />

        {/* Médias & Réseaux Sociaux */}
        <VideosMediaSection mediaItems={page.mediaItems} labels={page.labels} />
      </main>

      <Footer />
    </div>
  );
}
