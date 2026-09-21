'use client';

import React from 'react';
import { Target, Clock, MapPin, Bed, CheckCircle2, ShieldCheck, Award } from 'lucide-react';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { TacticalButton } from '@/components/ui/TacticalButton';

interface FormationFormulesSectionProps {
  onApply: (programId: string) => void;
  formulesData?: {
    badge?: string;
    title?: string;
    subtitle?: string;
    items?: Array<{
      id: string;
      step_badge?: string;
      duration_badge?: string;
      title: string;
      description?: string;
      duration_text?: string;
      schedule_text?: string;
      boarding_text?: string;
      certification_text?: string;
      cta_text?: string;
      program_id?: string;
    }>;
  };
}

export const FormationFormulesSection: React.FC<FormationFormulesSectionProps> = ({
  onApply,
  formulesData,
}) => {
  const badge = formulesData?.badge || "PARCOURS D'ADMISSION & CURSUS";
  const title = formulesData?.title || "DU STAGE DÉCOUVERTE AU DIPLÔME PRO";
  const subtitle =
    formulesData?.subtitle ||
    "L'accès à la formation longue durée est conditionné par la validation du stage découverte. Ce protocole sélectif garantit la sécurité de tous et le niveau d'excellence de la promotion.";

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <StuntBadge variant="yellow" icon={<Target className="w-3.5 h-3.5" />}>
            {badge}
          </StuntBadge>
          <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white mt-3 mb-3">
            {title}
          </h2>
          <p className="text-sm font-tech text-zinc-400">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Carte 1 : Formule Découverte & Sélection */}
          <div
            id="formule-decouverte"
            className="bg-[#0e0e14] border-2 border-zinc-800 hover:border-[#FFE500]/50 transition-colors p-6 sm:p-8 relative flex flex-col justify-between scroll-mt-24"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="px-2.5 py-1 bg-zinc-800 text-zinc-300 font-mono-tech text-[10px] uppercase tracking-wider">
                  ÉTAPE 01 • SÉLECTION OBLIGATOIRE
                </span>
                <span className="text-xs font-mono-tech text-[#FFE500]">
                  80 HEURES
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-display uppercase text-white mb-2">
                STAGE DÉCOUVERTE &amp; SÉLECTION
              </h3>
              <p className="text-xs font-tech text-zinc-400 mb-6">
                12 jours consécutifs pour tester vos aptitudes physiques, votre sang-froid
                et votre capacité d'adaptation avant de postuler au cursus long.
              </p>

              <div className="space-y-3 mb-6 text-xs font-tech">
                <div className="flex items-center gap-3 text-zinc-300">
                  <Clock className="w-4 h-4 text-[#FFE500] shrink-0" />
                  <span>
                    <strong>Durée :</strong> 12 jours consécutifs (80h de pratique)
                  </span>
                </div>
                <div className="flex items-center gap-3 text-zinc-300">
                  <MapPin className="w-4 h-4 text-[#FFE500] shrink-0" />
                  <span>
                    <strong>Lieu :</strong> Domaine CUC, 59360 Le Cateau-Cambrésis
                  </span>
                </div>
                <div className="flex items-center gap-3 text-zinc-300">
                  <Bed className="w-4 h-4 text-[#FFE500] shrink-0" />
                  <span>
                    <strong>Hébergement :</strong> Pension complète disponible sur place (90 lits)
                  </span>
                </div>
              </div>

              <h4 className="text-xs font-mono-tech text-[#FFE500] uppercase mb-2">
                Au programme des 12 jours :
              </h4>
              <ul className="space-y-2 text-xs font-tech text-zinc-300 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FFE500] shrink-0" />
                  <span>Initiation aux combats chorégraphiés et axes caméra</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FFE500] shrink-0" />
                  <span>Chutes de sa hauteur et absorptions sur praticables</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FFE500] shrink-0" />
                  <span>Sauts progressifs en hauteur jusqu'à 6-9 mètres sur airbag</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FFE500] shrink-0" />
                  <span>Parcours d'obstacles et Parkour Yamakasi</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FFE500] shrink-0" />
                  <span>Bilan individuel d'aptitude et verdict d'admission pro</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <TacticalButton
                variant="secondary"
                size="md"
                className="w-full"
                onClick={() => onApply('stage-decouverte')}
              >
                Réserver la Session Découverte
              </TacticalButton>
            </div>
          </div>

          {/* Carte 2 : Cursus Pro Longue Durée */}
          <div
            id="formation-pro"
            className="bg-[#0e0e14] border-2 border-[#FFE500] p-6 sm:p-8 relative flex flex-col justify-between shadow-[0_0_30px_rgba(255,229,0,0.1)] scroll-mt-24"
          >

            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="px-2.5 py-1 bg-[#FFE500] text-black font-mono-tech text-[10px] font-bold uppercase tracking-wider">
                  ÉTAPE 02 • FORMATION PROFESSIONNELLE
                </span>
                <span className="text-xs font-mono-tech text-[#FFE500]">
                  720 À 800 HEURES
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-display uppercase text-white mb-2">
                FORMATION PROFESSIONNELLE 2 ANS
              </h3>
              <p className="text-xs font-tech text-zinc-300 mb-6">
                9 à 10 stages de 12 jours échelonnés sur deux ans. Le cursus complet qui forme les
                cascadeurs polyvalents aptes à tourner immédiatement pour le cinéma international.
              </p>

              <div className="space-y-3 mb-6 text-xs font-tech">
                <div className="flex items-center gap-3 text-zinc-300">
                  <Clock className="w-4 h-4 text-[#FFE500] shrink-0" />
                  <span>
                    <strong>Rythme :</strong> 1 stage de 12 jours tous les deux mois (2 ans)
                  </span>
                </div>
                <div className="flex items-center gap-3 text-zinc-300">
                  <ShieldCheck className="w-4 h-4 text-[#FFE500] shrink-0" />
                  <span>
                    <strong>Agrément :</strong> Certifié QUALIOPI • Prise en charge AFDAS / France Travail
                  </span>
                </div>
                <div className="flex items-center gap-3 text-zinc-300">
                  <Award className="w-4 h-4 text-[#FFE500] shrink-0" />
                  <span>
                    <strong>Certification :</strong> Diplôme de Cascadeur Professionnel CUC
                  </span>
                </div>
              </div>

              <h4 className="text-xs font-mono-tech text-[#FFE500] uppercase mb-2">
                Maîtrise totale des modules :
              </h4>
              <ul className="space-y-2 text-xs font-tech text-zinc-300 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FFE500] shrink-0" />
                  <span>Chutes extrêmes jusqu'à 21 mètres sur la CUC Tower</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FFE500] shrink-0" />
                  <span>Torche humaine intégrale avec protocoles pyro</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FFE500] shrink-0" />
                  <span>Câblage 3D, wirework super-héroïque et catapultes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FFE500] shrink-0" />
                  <span>Forces spéciales, armes à blanc et rappel tactique</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FFE500] shrink-0" />
                  <span>Insertion directe dans le réseau de coordinateurs cascades CUC</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <TacticalButton
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => onApply('pro-longue-duree')}
              >
                Candidater au Cursus Pro
              </TacticalButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
