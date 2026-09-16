'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { TacticalButton } from '@/components/ui/TacticalButton';
import {
  Users,
  ChevronRight
} from 'lucide-react';

const TEAM_BUILDING_WORKSHOPS = [
  {
    title: "Chute de Hauteur sur Airbag",
    category: "Adrénaline & Confiance",
    desc: "En intérieur comme en extérieur, faites goûter à vos collaborateurs les sensations de la chute libre sur coussin d'air géant de cinéma. Dépassement de soi et cohésion collective garantie.",
    img: "https://www.campus-universcascades.com/wp-content/uploads/2021/07/Team-building-chute-hauteur-1.jpg"
  },
  {
    title: "Combats au Cinéma",
    category: "Chorégraphie & Précision",
    desc: "Plongez au cœur d'une scène d'action ! Initiation aux techniques de combats de films : esquives, feintes, coups de poing de cinéma et respect chirurgical des axes caméra.",
    img: "https://www.campus-universcascades.com/wp-content/uploads/2021/07/Team-building-combat-cinema-1.jpg"
  },
  {
    title: "Parkour & Yamakasi",
    category: "Agilité & Mouvement",
    desc: "Initiation encadrée par des cascadeurs professionnels et spécialistes du déplacement urbain : franchissements d'obstacles, sauts de précision et motricité.",
    img: "https://www.campus-universcascades.com/wp-content/uploads/2021/07/Team-building-parkour-1.jpg"
  },
  {
    title: "Maquillage Effets Spéciaux (SFX)",
    category: "Coulisses & Cinéma",
    desc: "Découvrez les secrets des maquilleurs de cinéma : création de blessures ultra-réalistes, fausses cicatrices, impacts de balles et prothèses d'action.",
    img: "https://www.campus-universcascades.com/wp-content/uploads/2021/07/Team-building-maquillage.jpg"
  },
  {
    title: "Doublage de Voix & Post-Production",
    category: "Créativité & Voix",
    desc: "Mettez-vous dans la peau d'un comédien de doublage ! Enregistrez en équipe les répliques et bruitages de séquences cultes du cinéma d'action.",
    img: "https://www.campus-universcascades.com/wp-content/uploads/2021/07/Team-building-doublage-voix.jpg"
  }
];

export default function TeamBuildingCascadesPage() {
  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      <Navbar />

      <main id="contenu-principal" className="flex-grow pt-28">
        {/* Hero Header */}
        <section className="relative py-20 bg-black border-b border-zinc-800 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://www.campus-universcascades.com/wp-content/uploads/2021/07/Team-building-combat-cinema-1.jpg"
              alt="Team building cinéma et cascades CUC Events"
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
              <Link href="/cuc-events-agence" className="hover:text-[#FFE500] transition-colors">
                CUC EVENTS
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              <span className="text-[#FFE500]">TEAM BUILDING D'EXCEPTION</span>
            </div>

            <div className="inline-flex items-center gap-2 mb-4">
              <StuntBadge variant="yellow" icon={<Users className="w-3.5 h-3.5" />}>
                SÉMINAIRES & ENTREPRISES
              </StuntBadge>
              <span className="text-xs font-mono-tech text-zinc-400">
                COHÉSION D'ÉQUIPE • COULISSES DU CINÉMA
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display uppercase tracking-tight text-white max-w-5xl leading-none">
              TEAM BUILDING <span className="text-[#FFE500]">D'EXCEPTION</span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 font-tech max-w-3xl mt-4 leading-relaxed">
              Offrez à vos équipes une immersion inoubliable dans l'univers du cinéma d'action
              et des cascadeurs professionnels. Ateliers modulables de 10 à 300 personnes sur notre campus
              ou sur le lieu de votre séminaire.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link href="/contact-cuc">
                <TacticalButton variant="primary" size="lg" icon={<ChevronRight className="w-4 h-4" />}>
                  Construire votre Projet Team Building
                </TacticalButton>
              </Link>
              <Link href="/cuc-events-agence">
                <TacticalButton variant="secondary" size="lg">
                  Découvrir CUC Events
                </TacticalButton>
              </Link>
            </div>
          </div>
        </section>

        {/* Intro */}
        <section className="py-14 bg-[#09090d] border-b border-zinc-800">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="mb-4 flex flex-col items-center justify-center gap-2">
              <Image
                src="/images/logos/cuc-logo-yellow.png"
                alt="CUC Events Team Building"
                width={52}
                height={52}
                className="w-13 h-13 object-contain drop-shadow-[0_0_12px_rgba(255,229,0,0.35)]"
              />
              <span className="text-xs font-mono-tech text-[#FFE500] font-bold tracking-widest uppercase">
                CUC EVENTS • IMMERSION ENTREPRISE
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display uppercase text-white mb-4">
              LES ATELIERS DU CINÉMA
            </h2>
            <p className="text-sm font-tech text-zinc-300 leading-relaxed">
              Nous vous proposons des animations et initiations autour du métier de cascadeur, du cinéma
              et de ses coulisses. Team building, séminaires, collectivités... Notre équipe de professionnels
              vous propose des ateliers au choix avec du matériel spécifique et une sécurité sans compromis.
            </p>
          </div>
        </section>

        {/* Les 5 Ateliers */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {TEAM_BUILDING_WORKSHOPS.map((workshop, idx) => (
                <div
                  key={idx}
                  className="bg-[#0e0e14] border border-zinc-800 hover:border-[#FFE500]/60 p-5 group transition-all flex flex-col justify-between"
                >

                  <div>
                    <div className="relative h-56 w-full mb-4 border border-zinc-800 overflow-hidden bg-black">
                      <Image
                        src={workshop.img}
                        alt={workshop.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 bg-black/85 px-2.5 py-0.5 text-[10px] font-mono-tech text-[#FFE500] border border-white/20">
                        {workshop.category}
                      </div>
                    </div>

                    <h3 className="text-xl font-display uppercase tracking-wide text-white group-hover:text-[#FFE500] transition-colors mb-2">
                      {workshop.title}
                    </h3>
                    <p className="text-xs font-tech text-zinc-400 leading-relaxed">
                      {workshop.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono-tech text-zinc-500">
                    <span>Atelier au choix</span>
                    <span className="text-[#FFE500]">Modulable</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Formule personnalisée CTA */}
        <section className="py-16 bg-[#0c0c10] border-t border-zinc-800">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <StuntBadge variant="yellow" icon={<Users className="w-3.5 h-3.5" />}>
              SUR MESURE
            </StuntBadge>
            <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white mt-3 mb-4">
              COMBINEZ PLUSIEURS ATELIERS POUR VOTRE JOURNÉE
            </h2>
            <p className="text-xs sm:text-sm font-tech text-zinc-400 leading-relaxed mb-8 max-w-2xl mx-auto">
              Nous adaptons le déroulement, le nombre d'animateurs cascadeurs et le matériel selon vos objectifs,
              vos contraintes de planning et la taille de votre groupe.
            </p>
            <Link href="/contact-cuc">
              <TacticalButton variant="primary" size="lg" icon={<ChevronRight className="w-4 h-4" />}>
                Recevoir une Proposition Détaillée & Devis
              </TacticalButton>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
