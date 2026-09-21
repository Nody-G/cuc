'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ShieldCheck, Building } from 'lucide-react';

interface GuaranteeCopy {
  title: string;
  description: string;
}

/**
 * Les trois garanties de l'agence événementielle : la copie vient du catalogue
 * (`eventsAgence.guarantees`), les icônes et le logo restent des éléments
 * d'interface. Aucune chaîne française n'est laissée en dur.
 */
export const EventsGuaranteesSection: React.FC = () => {
  const t = useTranslations('eventsAgence');
  const guarantees = t.raw('guarantees') as GuaranteeCopy[];

  return (
    <section className="py-16 bg-[#0c0c10] border-t border-zinc-800">
      <div className="page-shell">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-[#121218] border border-zinc-800">
            <ShieldCheck className="w-8 h-8 text-[#FFE500] mx-auto mb-3" />
            <h3 className="font-display uppercase text-lg text-white mb-1">
              {guarantees[0].title}
            </h3>
            <p className="text-xs font-tech text-zinc-400">{guarantees[0].description}</p>
          </div>

          <div className="p-6 bg-[#121218] border border-zinc-800">
            <div className="w-10 h-10 mx-auto mb-2 relative flex items-center justify-center">
              <Image
                src="/images/logos/cuc-logo-yellow.png"
                alt={t('guaranteeLogoAlt')}
                width={36}
                height={36}
                className="w-9 h-9 object-contain drop-shadow-[0_0_10px_rgba(255,229,0,0.35)]"
              />
            </div>
            <h3 className="font-display uppercase text-lg text-white mb-1">
              {guarantees[1].title}
            </h3>
            <p className="text-xs font-tech text-zinc-400">{guarantees[1].description}</p>
          </div>

          <div className="p-6 bg-[#121218] border border-zinc-800">
            <Building className="w-8 h-8 text-[#FFE500] mx-auto mb-3" />
            <h3 className="font-display uppercase text-lg text-white mb-1">
              {guarantees[2].title}
            </h3>
            <p className="text-xs font-tech text-zinc-400">{guarantees[2].description}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
