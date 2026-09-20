'use client';

import React from 'react';
import Image from 'next/image';
import { FileCheck } from 'lucide-react';
import { TacticalButton } from '@/components/ui/TacticalButton';
import {
  StudioParallaxScene,
  StudioParallaxLayer,
  StudioParallaxCard,
} from '@/components/ui/parallax';

/**
 * Données éditables du bloc « qualiopi » (page Accueil).
 * Toutes les clés sont optionnelles : en leur absence, les valeurs
 * certifiées ci-dessous sont utilisées (zéro régression).
 */
export interface HomeQualiopiData {
  badge?: string;
  title?: string;
  subtitle?: string;
  afdas_badge?: string;
  afdas_text?: string;
  france_travail_badge?: string;
  france_travail_text?: string;
  opco_badge?: string;
  opco_text?: string;
}

interface HomeQualiopiSectionProps {
  qualiopiData?: HomeQualiopiData;
}

export const HomeQualiopiSection: React.FC<HomeQualiopiSectionProps> = ({
  qualiopiData,
}) => {
  const badge = qualiopiData?.badge || 'CERTIFICATION QUALIOPI';
  const title = qualiopiData?.title || 'FORMATIONS CERTIFIÉES';
  const subtitle =
    qualiopiData?.subtitle ||
    'Certification délivrée au titre des ACTIONS DE FORMATION. Nos formations sont éligibles aux financements professionnels (AFDAS, France Travail).';

  return (
    <StudioParallaxScene className="py-16 bg-[#0e0e14]/90 border-b border-zinc-800/80 relative overflow-hidden">
      {/* Ambient Certification Glow */}
      <StudioParallaxLayer
        speed={-0.18}
        className="absolute -top-24 right-1/4 w-80 h-80 rounded-full bg-[#FFE500]/[0.025] blur-3xl pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <StudioParallaxCard maxTilt={3}>
          <div className="bg-[#121218]/95 backdrop-blur-md border border-[#FFE500]/50 p-6 sm:p-8 relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[0_0_35px_rgba(255,229,0,0.06)]">
            <div className="flex items-start gap-4 sm:gap-6">
              {/* Floating Accreditation Badge */}
              <StudioParallaxLayer speed={0.08} className="shrink-0">
                <div className="relative w-36 sm:w-44 h-20 sm:h-22 p-2 bg-white border border-[#FFE500] shadow-lg flex items-center justify-center">
                  <Image
                    src="/images/partenaires/qualiopi.png"
                    alt="Logo Qualiopi"
                    fill
                    className="object-contain p-1.5"
                    sizes="180px"
                  />
                </div>
              </StudioParallaxLayer>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    data-cuc-field="sections_data.qualiopi.badge"
                    className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider"
                  >
                    {badge}
                  </span>
                </div>
                <h3
                  data-cuc-field="sections_data.qualiopi.title"
                  className="text-2xl sm:text-3xl font-display uppercase tracking-wider text-white"
                >
                  {title}
                </h3>
                <p
                  data-cuc-field="sections_data.qualiopi.subtitle"
                  className="text-xs sm:text-sm font-tech text-zinc-300 mt-1 max-w-2xl leading-relaxed"
                >
                  {subtitle}
                </p>
              </div>
            </div>

            <a
              href="https://www.campus-universcascades.com/wp-content/uploads/2024/12/21452296-CHALLENGE-EUROPE-PRODUCTIONS-Qualiopi.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <TacticalButton
                variant="outline"
                size="sm"
                icon={<FileCheck className="w-4 h-4" />}
              >
                Voir le certificat (PDF)
              </TacticalButton>
            </a>
          </div>
        </StudioParallaxCard>
      </div>
    </StudioParallaxScene>
  );
};
