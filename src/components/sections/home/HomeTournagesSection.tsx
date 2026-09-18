'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Film, Clapperboard, ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';
import { TacticalButton } from '@/components/ui/TacticalButton';
import {
  StudioParallaxScene,
  StudioParallaxLayer,
  StudioParallaxCard,
} from '@/components/ui/parallax';

interface HighlightProject {
  title: string;
  year: string;
  category: string;
  actors: string;
  poster: string;
}

const FEATURED_PRODUCTIONS: HighlightProject[] = [
  {
    title: 'Le Comte de Monte-Cristo',
    year: '2024',
    category: 'Cinéma Français',
    actors: 'Doublures de Pierre Niney',
    poster: 'https://www.campus-universcascades.com/wp-content/uploads/2024/12/LE-COMTE-DE-MONTECRISTO-1.jpg',
  },
  {
    title: 'John Wick : Chapitre 4',
    year: '2023',
    category: 'Blockbuster US',
    actors: 'Cascadeurs CUC & Gun-Fu',
    poster: 'https://www.campus-universcascades.com/wp-content/uploads/2024/12/John-Wick-4.jpg',
  },
  {
    title: 'The Substance',
    year: '2024',
    category: 'Prix du Scénario Cannes',
    actors: 'Demi Moore & M. Qualley',
    poster: 'https://www.campus-universcascades.com/wp-content/uploads/2024/12/The-substance.jpg',
  },
  {
    title: "L'Amour Ouf",
    year: '2024',
    category: 'Gilles Lellouche',
    actors: 'Cascades & Bagarres de rue',
    poster: 'https://www.campus-universcascades.com/wp-content/uploads/2024/12/Lamour-ouf.jpg',
  },
];

export const HomeTournagesSection: React.FC = () => {
  return (
    <StudioParallaxScene className="py-24 sm:py-28 bg-[#08080c] border-b border-zinc-800/80 relative overflow-hidden">
      {/* Cinematic Golden Ambience Beam */}
      <StudioParallaxLayer
        speed={-0.2}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[52rem] h-[52rem] rounded-full bg-[radial-gradient(circle,_rgba(255,229,0,0.05)_0%,_transparent_70%)] blur-3xl pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider flex items-center gap-1.5">
                <Clapperboard className="w-3.5 h-3.5" />
                SECTEUR PRODUCTION CINÉMA &amp; TOURNAGES
              </span>
              <span className="text-xs font-mono-tech text-zinc-500 hidden sm:inline">
                • CUC STUNT TEAM
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display uppercase tracking-tight text-white leading-tight max-w-3xl">
              COORDINATION DE CASCADES &amp; <span className="text-[#FFE500]">TOURNAGES</span>
            </h2>

            <p className="text-sm sm:text-base font-tech text-zinc-300 leading-relaxed max-w-3xl">
              Partenaire privilégié des productions de cinéma, des séries et des diffuseurs mondiaux, le Campus
              Univers Cascades met à disposition son expertise en action design, direction de combats et sécurité
              sur plateau avec plus de 63 longs-métrages coordonnés au box-office.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Link href="/cuc-team-cascadeur">
              <TacticalButton variant="primary" size="md" icon={<ChevronRight className="w-4 h-4" />}>
                Découvrir la CUC Stunt Team
              </TacticalButton>
            </Link>
          </div>
        </div>

        {/* Studio Card with 3 Pillars & Production Poster Showcase */}
        <StudioParallaxCard maxTilt={2}>
          <div className="bg-[#0e0e14]/95 backdrop-blur-md border border-[#FFE500]/50 p-6 sm:p-10 relative shadow-[0_0_40px_rgba(255,229,0,0.08)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: 3 Pillars */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 bg-[#14141c] border border-zinc-800 hover:border-[#FFE500]/50 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-mono-tech text-[#FFE500] uppercase font-bold mb-1">
                    <Film className="w-3.5 h-3.5" />
                    <span>1. Action Design &amp; Chorégraphie d'Action</span>
                  </div>
                  <p className="text-xs sm:text-sm font-tech text-zinc-300 leading-relaxed">
                    Découpage technique, prévisualisation vidéo, chorégraphie sur-mesure des fusillades et combats,
                    et préparation intensive des comédiens en amont du tournage dans notre studio parisien.
                  </p>
                </div>

                <div className="p-4 bg-[#14141c] border border-zinc-800 hover:border-[#FFE500]/50 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-mono-tech text-[#FFE500] uppercase font-bold mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>2. Vivier de 200+ Cascadeurs &amp; Doublures</span>
                  </div>
                  <p className="text-xs sm:text-sm font-tech text-zinc-300 leading-relaxed">
                    Doublures physiques des plus grands acteurs (Keanu Reeves, Pierre Niney, Tomer Sisley, Demi Moore...),
                    performers multi-disciplinaires (chutes de hauteur, torche humaine, câblerie, parkour, armes).
                  </p>
                </div>

                <div className="p-4 bg-[#14141c] border border-zinc-800 hover:border-[#FFE500]/50 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-mono-tech text-[#FFE500] uppercase font-bold mb-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>3. Régie Cascade &amp; Sécurité Homologuée CNC</span>
                  </div>
                  <p className="text-xs sm:text-sm font-tech text-zinc-300 leading-relaxed">
                    Régleurs de cascades chevronnés, matériel de pointe (airbags certifiés, rigging 3D, crash-pads)
                    et domaine privé de 6 hectares privatisable pour répétitions de scènes complexes.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <Link href="/contact-cuc">
                    <TacticalButton variant="primary" size="md">
                      Échanger sur votre Production
                    </TacticalButton>
                  </Link>
                  <Link href="/cuc-team-cascadeur#affiches">
                    <span className="text-xs font-mono-tech text-zinc-400 hover:text-[#FFE500] transition-colors flex items-center gap-1">
                      Voir les 63 affiches de films
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Mini Showcase of Featured Production Posters */}
              <div className="lg:col-span-5">
                <div className="grid grid-cols-2 gap-3">
                  {FEATURED_PRODUCTIONS.map((prod, idx) => (
                    <Link
                      key={idx}
                      href="/equipe-cascadeurs-pro#filmographie"
                      className="group relative aspect-[2/3] overflow-hidden bg-black border border-zinc-800 hover:border-[#FFE500] transition-all"
                    >
                      <Image
                        src={prod.poster}
                        alt={`Affiche de ${prod.title}`}
                        fill
                        sizes="(max-width: 1024px) 50vw, 20vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                      <div className="absolute bottom-0 left-0 right-0 p-2.5 space-y-0.5 z-10">
                        <span className="text-[9px] font-mono-tech text-[#FFE500] font-bold block uppercase">
                          {prod.year} • {prod.category}
                        </span>
                        <h4 className="font-display uppercase text-xs sm:text-sm text-white font-bold leading-tight truncate">
                          {prod.title}
                        </h4>
                        <span className="text-[10px] font-tech text-zinc-300 block truncate">
                          {prod.actors}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </StudioParallaxCard>
      </div>
    </StudioParallaxScene>
  );
};
