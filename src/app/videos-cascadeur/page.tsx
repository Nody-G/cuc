'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
import { videoObjectJsonLd } from '@/lib/seo';

export default function VideosCascadeurPage() {
  const [activeVideo, setActiveVideo] = useState<'tf1' | 'france2'>('tf1');
  const [selectedDmVideo, setSelectedDmVideo] = useState<{ id: string; title: string } | null>(null);

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      {/* JSON-LD : un VideoObject par programme TV (rich results Google Vidéo) */}
      {PROGRAMMES_TV.map((v) => (
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
              src="https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-5-scaled.jpg"
              alt="Vidéos et reportages du Campus Univers Cascades"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center brightness-35 contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/80 to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-xs font-mono-tech text-zinc-400 mb-4">
              <Link href="/" className="hover:text-[#FFE500] transition-colors">
                ACCUEIL
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              <span className="text-[#FFE500]">NOS VIDÉOS & REPORTAGES</span>
            </div>

            <div className="inline-flex items-center gap-2 mb-4">
              <StuntBadge variant="yellow" icon={<Tv className="w-3.5 h-3.5" />}>
                REPORTAGES TÉLÉVISION
              </StuntBadge>
              <span className="text-xs font-mono-tech text-zinc-400">
                TF1 JT 20H • FRANCE 2 • BFM TV
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display uppercase tracking-tight text-white max-w-5xl leading-none">
              LES REPORTAGES & <span className="text-[#FFE500]">VIDÉOS DU CUC</span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 font-tech max-w-3xl mt-4 leading-relaxed">
              Plongez au cœur de l'entraînement des cascadeurs avec les reportages exclusifs diffusés
              sur les journaux télévisés de TF1 et France 2, ainsi que les showreels de la CUC Stunt Team.
            </p>
          </div>
        </section>

        {/* Video Player Box */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <span>REPORTAGE TF1 (JT 20H)</span>
              </button>

              <button
                onClick={() => setActiveVideo('france2')}
                className={`px-5 py-3 border font-mono-tech text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${activeVideo === 'france2'
                  ? 'bg-[#FFE500] text-black border-[#FFE500] font-bold shadow-lg'
                  : 'bg-[#101016] border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
              >
                <Tv className="w-4 h-4" />
                <span>REPORTAGE FRANCE 2 (20H30 LE MAG)</span>
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
                    poster="https://www.campus-universcascades.com/wp-content/uploads/2025/12/ReportageBFMTV-Alecoledescascadeurs.jpeg"
                  >
                    <source
                      src="https://www.campus-universcascades.com/wp-content/uploads/2021/07/TF1-JT-20h-CUC-reportage-1.mp4"
                      type="video/mp4"
                    />
                    Votre navigateur ne prend pas en charge la lecture de vidéos HTML5.
                  </video>
                ) : (
                  <video
                    key="france2-video"
                    controls
                    preload="metadata"
                    className="w-full h-full object-contain"
                    poster="https://www.campus-universcascades.com/wp-content/uploads/2025/12/coeur-de-cascadeurs.jpeg"
                  >
                    <source
                      src="https://www.campus-universcascades.com/wp-content/uploads/2021/07/20h30-A-LECOLE-DES-CASCADEURS-FRANCE2-VWeb2-1.mp4"
                      type="video/mp4"
                    />
                    Votre navigateur ne prend pas en charge la lecture de vidéos HTML5.
                  </video>
                )}
              </div>

              {/* Video Information */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-display uppercase text-white">
                    {activeVideo === 'tf1'
                      ? 'REPORTAGE TF1 — LE JT DE 20H AU CUC'
                      : "FRANCE 2 — 20H30 LE MAG : « À L'ÉCOLE DES CASCADEURS »"}
                  </h2>
                  <p className="text-xs sm:text-sm font-tech text-zinc-400 mt-1 max-w-3xl">
                    {activeVideo === 'tf1'
                      ? "Immersion des caméras du journal télévisé de TF1 au Campus Univers Cascades : entraînements aux chutes de hauteur, cascades en feu et formation des futures doublures du cinéma d'action."
                      : "Grand format de 20h30 Le Mag sur France 2 présenté par Laurent Delahousse. Les coulisses de la formation professionnelle au Cateau-Cambrésis et le quotidien des élèves."}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-3 py-1.5 bg-[#14141c] border border-zinc-800 text-xs font-mono-tech text-[#FFE500]">
                    DIFFUSION NATIONALE
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Real CUC Videos & Documentaries Grid */}
        <section className="py-16 bg-[#09090d] border-t border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <StuntBadge variant="yellow" icon={<Video className="w-3.5 h-3.5" />}>
                DOCUS & SÉRIES TV
              </StuntBadge>
              <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white mt-3 mb-2">
                LES PROGRAMMES TV & REPORTAGES DU SITE
              </h2>
              <p className="text-xs sm:text-sm font-tech text-zinc-400">
                Cliquez sur une vignette pour lancer la vidéo dans le lecteur immersif.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PROGRAMMES_TV.map((v, i) => (
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
                  title="Fermer"
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider block mb-2">
                COUVERTURE MÉDIATIQUE
              </span>
              <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white mb-3">
                LE CUC DANS LES MÉDIAS
              </h2>
              <p className="text-sm font-tech text-zinc-400">
                Découvrez les reportages consacrés aux coulisses du campus et à l'entraînement des cascadeurs
                sur les grandes chaînes nationales et nos réseaux.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#121218] border border-zinc-800 p-6 text-center">
                <div className="text-3xl sm:text-4xl font-display text-[#FFE500] mb-1">TF1</div>
                <div className="text-xs font-mono-tech text-zinc-400 uppercase">Le Journal de 20H au Campus</div>
              </div>

              <div className="bg-[#121218] border border-zinc-800 p-6 text-center">
                <div className="text-3xl sm:text-4xl font-display text-white mb-1">FRANCE 2</div>
                <div className="text-xs font-mono-tech text-zinc-400 uppercase">20h30 Le Mag avec Laurent Delahousse</div>
              </div>

              <div className="bg-[#121218] border border-zinc-800 p-6 text-center">
                <div className="text-3xl sm:text-4xl font-display text-[#FFE500] mb-1">BFM TV</div>
                <div className="text-xs font-mono-tech text-zinc-400 uppercase">Grand Format à l'École des Cascadeurs</div>
              </div>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <a
                href="https://www.instagram.com/campus.univers.cascades/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-[#121218] border border-zinc-800 hover:border-[#FFE500] text-xs font-mono-tech text-zinc-300 hover:text-white flex items-center gap-2 transition-colors"
              >
                <span>Voir les cascades sur Instagram</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#FFE500]" />
              </a>

              <a
                href="https://www.tiktok.com/@campus.univers.cascades"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-[#121218] border border-zinc-800 hover:border-[#FFE500] text-xs font-mono-tech text-zinc-300 hover:text-white flex items-center gap-2 transition-colors"
              >
                <span>Suivre la Stunt Team sur TikTok</span>
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
