'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { TacticalButton } from '@/components/ui/TacticalButton';

export const HomeAboutSection: React.FC = () => {
  return (
    <section className="py-24 bg-[#08080a] border-b border-zinc-800 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual Side: Portrait Stunt Team */}
            <div className="lg:col-span-5 relative">
              <div className="relative h-[460px] sm:h-[540px] w-full border border-zinc-800 bg-[#0c0c12] overflow-hidden shadow-2xl group">
                <Image
                  src="https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-5-scaled.jpg"
                  alt="Campus Univers Cascades - Cascadeurs professionnels et formation"
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover object-center brightness-90 contrast-110 group-hover:scale-102 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                {/* Founder Quote Card Overlay */}
                <div className="absolute bottom-5 left-5 right-5 bg-[#0a0a0e]/95 backdrop-blur-md border border-zinc-700/80 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#FFE500]" />
                    <span className="text-[10px] font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider">
                      LE MOT DU FONDATEUR
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 font-tech italic leading-relaxed">
                    « Maîtriser le risque, créer l&apos;inédit, repousser les limites de la vérité physique
                    au service de la vision des plus grands réalisateurs. »
                  </p>
                  <div className="mt-2 pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono-tech text-zinc-400">
                    <span className="text-white font-bold">LUCAS DOLLFUS</span>
                    <span className="text-[#FFE500]">FONDATEUR &amp; RÉGLEUR</span>
                  </div>
                </div>
              </div>

              {/* Year Tag Badge */}
              <div className="absolute -top-3 -left-3 bg-[#FFE500] text-black font-display text-sm tracking-widest px-3.5 py-1 font-bold shadow-lg">
                DEPUIS 2008
              </div>
            </div>

            {/* Editorial Content: Bespoke Typography & 4 Pillars Grid */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider">
                    PRÉSENTATION
                  </span>
                  <span className="text-xs font-mono-tech text-zinc-400">
                    • CINÉMA, SÉRIES &amp; SPECTACLE
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-display uppercase tracking-tight text-white leading-tight">
                  LE CENTRE DE FORMATION DE RÉFÉRENCE EN <span className="text-[#FFE500]">CASCADE DE CINÉMA</span>
                </h2>

                <p className="text-sm sm:text-base font-tech text-zinc-300 mt-3 leading-relaxed">
                  Créé en 2008 par Lucas Dollfus, le <strong className="text-white">Campus Univers Cascades (CUC)</strong> est
                  un centre de formation professionnelle dédié aux techniques de cascade physique et mécanique,
                  établi sur un domaine privé de 6 hectares au Cateau-Cambrésis (59).
                </p>
              </div>

              {/* 4 Pillars Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {[
                  {
                    title: "INFRASTRUCTURES DÉDIÉES",
                    desc: "Plateaux techniques complets : fosse de réception, dojos de combat chorégraphié, hangars de cascades mécaniques et manège équestre sur 6 hectares.",
                    tag: "6 HECTARES"
                  },
                  {
                    title: "ÉQUIPE & INSTRUCTEURS",
                    desc: "Encadrement par des régleurs et coordinateurs en activité, maîtres d'armes et spécialistes du combat scénique et du parkour.",
                    tag: "PÉDAGOGIE"
                  },
                  {
                    title: "INSERTION PROFESSIONNELLE",
                    desc: "Des diplômés actifs sur les longs-métrages, séries télévisées, spectacles vivants et productions internationales.",
                    tag: "CINÉMA & TV"
                  },
                  {
                    title: "AGENCE CUC EVENTS",
                    desc: "Spectacles d'action sur mesure, cascades en direct, animations et démonstrations événementielles.",
                    tag: "ÉVÉNEMENTS"
                  }
                ].map((pillar, idx) => (
                  <div
                    key={idx}
                    className="p-4 border border-zinc-800 bg-[#0d0d12] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <h4 className="text-sm font-display uppercase tracking-wider text-white">
                          {pillar.title}
                        </h4>
                        <span className="text-[9px] font-mono-tech text-[#FFE500] border border-[#FFE500]/30 px-1.5 py-0.2">
                          {pillar.tag}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 font-tech leading-relaxed">
                        {pillar.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Action Buttons */}
              <div className="pt-2 flex flex-wrap gap-3">
                <Link href="/formation-de-cascadeur">
                  <TacticalButton variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                    Découvrir la Formation Pro
                  </TacticalButton>
                </Link>
                <Link href="/equipe-cascadeurs-pro">
                  <TacticalButton variant="secondary" size="md">
                    L'Équipe des Cascadeurs
                  </TacticalButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
