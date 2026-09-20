'use client';

import React from 'react';
import Link from 'next/link';
import { TacticalButton } from '@/components/ui/TacticalButton';

export const TeamProductionServices: React.FC = () => {
  return (
    <section className="py-16 bg-[#0c0c10] border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider block mb-2">
              SERVICES AUX PRODUCTIONS
            </span>
            <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white mb-4">
              TOURNER VOS SCÈNES D'ACTION AVEC LE CUC
            </h2>
            <p className="text-xs sm:text-sm font-tech text-zinc-300 leading-relaxed mb-6">
              De la pré-production à l'exécution sur le plateau, le Campus Univers Cascades met à
              votre disposition ses ressources techniques et humaines :
            </p>

            <div className="space-y-3 text-xs font-tech text-zinc-300">
              <div className="p-3 bg-[#14141c] border border-zinc-800">
                <strong className="text-[#FFE500] font-mono-tech block mb-1">
                  1. COORDINATION &amp; CHORÉGRAPHIE :
                </strong>
                Analyse du scénario, chiffrage budgétaire, découpage technique de l'action et chorégraphies sur-mesure adaptées au jeu des comédiens.
              </div>

              <div className="p-3 bg-[#14141c] border border-zinc-800">
                <strong className="text-[#FFE500] font-mono-tech block mb-1">
                  2. PRÉPARATION DES COMÉDIENS (STUDIO PARIS / GENNEVILLIERS) :
                </strong>
                Sessions de répétition en amont du tournage pour habituer les acteurs aux armes factices, aux mouvements de combat et aux réactions de tir.
              </div>

              <div className="p-3 bg-[#14141c] border border-zinc-800">
                <strong className="text-[#FFE500] font-mono-tech block mb-1">
                  3. MATÉRIEL DE TOURNAGE &amp; DOMAINE :
                </strong>
                Airbags certifiés, systèmes de câblage (rigging), harnais de cascade et mise à disposition du domaine de 6 hectares comme décor naturel.
              </div>
            </div>
          </div>

          {/* Callout contact production */}
          <div className="bg-[#121218] border-2 border-[#FFE500] p-6 sm:p-8 relative shadow-xl">

            <h3 className="text-2xl sm:text-3xl font-display uppercase text-white mb-2">
              CONTACT PRODUCTION & CASTING
            </h3>
            <p className="text-xs font-tech text-zinc-400 mb-6">
              Vous préparez un long-métrage, une série, un clip ou un spectacle ?
              Contactez directement notre bureau de coordination.
            </p>

            <div className="space-y-3 text-xs font-mono-tech text-zinc-300 mb-6">
              <div>
                <span className="text-[#FFE500] block">COORDINATEUR RÉFÉRENT :</span>
                Lucas Dollfus — CUC PROD
              </div>
              <div>
                <span className="text-[#FFE500] block">TÉLÉPHONE DIRECT :</span>
                <a href="tel:+33672849492" className="text-white hover:text-[#FFE500]">06 72 84 94 92</a>
              </div>
              <div>
                <span className="text-[#FFE500] block">EMAIL PRO :</span>
                <a href="mailto:contact@campus-universcascades.com" className="text-zinc-400 hover:text-white">
                  contact@campus-universcascades.com
                </a>
              </div>
            </div>

            <Link href="/contact-cuc?demande=tournage-production">
              <TacticalButton variant="primary" size="md" className="w-full">
                Demande de Devis & Collaboration
              </TacticalButton>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
