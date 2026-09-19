'use client';

import React from 'react';
import Image from 'next/image';
import { ShieldCheck, Building } from 'lucide-react';

export const EventsGuaranteesSection: React.FC = () => {
  return (
    <section className="py-16 bg-[#0c0c10] border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-[#121218] border border-zinc-800">
            <ShieldCheck className="w-8 h-8 text-[#FFE500] mx-auto mb-3" />
            <h3 className="font-display uppercase text-lg text-white mb-1">SÉCURITÉ &amp; HOMOLOGATION</h3>
            <p className="text-xs font-tech text-zinc-400">
              Assurance professionnelle spectacle, matériel homologué et protocoles stricts.
            </p>
          </div>

          <div className="p-6 bg-[#121218] border border-zinc-800">
            <div className="w-10 h-10 mx-auto mb-2 relative flex items-center justify-center">
              <Image
                src="/images/logos/cuc-logo-yellow.png"
                alt="Cascadeurs Professionnels CUC"
                width={36}
                height={36}
                className="w-9 h-9 object-contain drop-shadow-[0_0_10px_rgba(255,229,0,0.35)]"
              />
            </div>
            <h3 className="font-display uppercase text-lg text-white mb-1">CASCADEURS PROFESSIONNELS</h3>
            <p className="text-xs font-tech text-zinc-400">
              Performeurs formés au CUC, actifs sur des productions cinéma et parcs à thème majeurs.
            </p>
          </div>

          <div className="p-6 bg-[#121218] border border-zinc-800">
            <Building className="w-8 h-8 text-[#FFE500] mx-auto mb-3" />
            <h3 className="font-display uppercase text-lg text-white mb-1">PARTOUT EN FRANCE & EUROPE</h3>
            <p className="text-xs font-tech text-zinc-400">
              Déplacement de nos structures mobiles et équipes de cascadeurs sur votre site d'événement.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
