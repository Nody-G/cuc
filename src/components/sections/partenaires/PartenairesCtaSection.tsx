'use client';

import React from 'react';
import Link from 'next/link';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { Handshake, ChevronRight } from 'lucide-react';

export const PartenairesCtaSection: React.FC = () => {
  return (
    <section className="py-16 bg-[#0c0c10] border-t border-zinc-800">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <StuntBadge variant="yellow" icon={<Handshake className="w-3.5 h-3.5" />}>
          COLLABORATION & SPONSORING
        </StuntBadge>
        <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white mt-3 mb-4">
          DEVENEZ PARTENAIRE DU CAMPUS UNIVERS CASCADES
        </h2>
        <p className="text-xs sm:text-sm font-tech text-zinc-400 leading-relaxed mb-8 max-w-2xl mx-auto">
          Vous êtes fabricant de matériel de sport, équipementier de protection, société d'effets spéciaux
          ou marque désireuse d'associer son image au premier centre mondial de cascade de cinéma ?
        </p>
        <Link href="/contact-cuc">
          <TacticalButton variant="primary" size="lg" icon={<ChevronRight className="w-4 h-4" />}>
            Prendre Contact avec la Direction des Partenariats
          </TacticalButton>
        </Link>
      </div>
    </section>
  );
};
