'use client';
import { Link } from '@/i18n/navigation';

import React from 'react';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';
import {
  StudioParallaxScene,
  StudioParallaxLayer,
  StudioParallaxCard,
} from '@/components/ui/parallax';

interface HomePartner {
  name: string;
  /** Clé de rôle sous `home.partners.roles` — jamais de libellé en dur. */
  roleKey: string;
  logo: string;
  bgVariant?: 'light' | 'dark';
  speed: number;
}

/**
 * Données éditables du bloc « partners » (page Accueil).
 * Toutes les clés sont optionnelles : en leur absence, les valeurs
 * certifiées ci-dessous sont utilisées (zéro régression).
 */
export interface HomePartnersData {
  badge?: string;
  title?: string;
  subtitle?: string;
}

interface HomePartnersSectionProps {
  partnersData?: HomePartnersData;
}

export const HomePartnersSection: React.FC<HomePartnersSectionProps> = ({
  partnersData,
}) => {
  const t = useTranslations('home.partners');
  const roles = (t.raw('roles') as Record<string, string>) ?? {};

  const badge = partnersData?.badge || t('badge');
  const title = partnersData?.title || t('title');
  const subtitle = partnersData?.subtitle || '';

  const partners: HomePartner[] = [
    {
      name: 'Nike',
      roleKey: 'equipementier',
      logo: '/images/partenaires/nike.jpg',
      bgVariant: 'dark',
      speed: -0.06,
    },
    {
      name: 'Kiloutou',
      roleKey: 'nacelles',
      logo: '/images/partenaires/kiloutou.jpg',
      bgVariant: 'light',
      speed: 0.06,
    },
    {
      name: 'Qualiopi',
      roleKey: 'certification',
      logo: '/images/partenaires/qualiopi.png',
      bgVariant: 'light',
      speed: -0.05,
    },
    {
      name: 'RXR Protect',
      roleKey: 'protections',
      logo: '/images/partenaires/rxr-protect.jpg',
      bgVariant: 'dark',
      speed: 0.05,
    },
    {
      name: 'C17 Special Effects',
      roleKey: 'pyrotechnie',
      logo: '/images/partenaires/c17.jpg',
      bgVariant: 'light',
      speed: -0.06,
    },
    {
      name: 'Action Cascade',
      roleKey: 'cascadePro',
      logo: '/images/partenaires/action-cascade.jpg',
      bgVariant: 'dark',
      speed: 0.06,
    },
  ];

  return (
    <StudioParallaxScene className="py-20 bg-[#08080c]/90 border-b border-zinc-800/80 relative overflow-hidden">
      {/* Background Soft Glow */}
      <StudioParallaxLayer
        speed={-0.2}
        className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[#FFE500]/[0.02] blur-3xl pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <span
              data-cuc-field="sections_data.partners.badge"
              className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold block mb-1"
            >
              {badge}
            </span>
            <h3
              data-cuc-field="sections_data.partners.title"
              className="text-2xl sm:text-3xl font-display uppercase text-white"
            >
              {title}
            </h3>
            {subtitle ? (
              <p
                data-cuc-field="sections_data.partners.subtitle"
                className="text-xs sm:text-sm font-tech text-zinc-400 mt-1 max-w-2xl"
              >
                {subtitle}
              </p>
            ) : null}
          </div>
          <Link
            href="/partenaires"
            className="text-xs font-mono-tech text-zinc-400 hover:text-[#FFE500] flex items-center gap-1.5 transition-colors group"
          >
            <span>{t('viewAll')}</span>
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Staggered Wave Parallax Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 items-stretch">
          {partners.map((partner, i) => (
            <StudioParallaxLayer key={i} speed={partner.speed}>
              <StudioParallaxCard maxTilt={6} className="h-full">
                <Link
                  href="/partenaires"
                  className="h-28 bg-[#0e0e14]/90 backdrop-blur-xs border border-zinc-800 hover:border-[#FFE500]/50 p-3 flex flex-col items-center justify-between transition-all duration-300 group hover:shadow-[0_4px_25px_rgba(255,229,0,0.12)] relative rounded-xs block h-full"
                >
                  <div
                    className={`w-full h-14 ${partner.bgVariant === 'light'
                      ? 'bg-white border-zinc-200'
                      : 'bg-black/90 border-zinc-800'
                      } border p-1.5 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 duration-300 relative`}
                  >
                    <Image
                      src={partner.logo}
                      alt={t('logoAlt', { name: partner.name })}
                      fill
                      sizes="140px"
                      className="object-contain p-1"
                    />
                  </div>

                  <div className="text-center w-full">
                    <span className="block text-[11px] font-display uppercase tracking-wider text-zinc-300 group-hover:text-white transition-colors truncate">
                      {partner.name}
                    </span>
                    <span className="block text-[9px] font-mono-tech text-zinc-500 uppercase tracking-tight truncate">
                      {roles[partner.roleKey] ?? ''}
                    </span>
                  </div>
                </Link>
              </StudioParallaxCard>
            </StudioParallaxLayer>
          ))}
        </div>
      </div>
    </StudioParallaxScene>
  );
};
