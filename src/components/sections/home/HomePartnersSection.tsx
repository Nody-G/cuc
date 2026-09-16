'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface HomePartner {
  name: string;
  role: string;
  /** Chemin vers le logo officiel du partenaire (fichier image réel). */
  logo: string;
  bgVariant?: 'light' | 'dark';
}

export const HomePartnersSection: React.FC = () => {
  const partners: HomePartner[] = [
    {
      name: 'Nike',
      role: 'Équipementier Officiel',
      logo: '/images/partenaires/nike.jpg',
      bgVariant: 'dark',
    },
    {
      name: 'Kiloutou',
      role: 'Nacelles & Levage',
      logo: '/images/partenaires/kiloutou.jpg',
      bgVariant: 'light',
    },
    {
      name: 'Qualiopi',
      role: 'Certification d’État',
      logo: '/images/partenaires/qualiopi.png',
      bgVariant: 'light',
    },
    {
      name: 'RXR Protect',
      role: 'Air Shock Protection',
      logo: '/images/partenaires/rxr-protect.jpg',
      bgVariant: 'dark',
    },
    {
      name: 'C17 Special Effects',
      role: 'Pyrotechnie & SFX',
      logo: '/images/partenaires/c17.jpg',
      bgVariant: 'light',
    },
    {
      name: 'Action Cascade',
      role: 'Stunt & Rigging',
      logo: '/images/partenaires/action-cascade.jpg',
      bgVariant: 'dark',
    },
  ];

  return (
    <section className="py-14 bg-[#08080c] border-b border-zinc-800">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold block mb-1">
                COLLABORATION INDUSTRIE &amp; CINÉMA
              </span>
              <h3 className="text-2xl sm:text-3xl font-display uppercase text-white">
                NOS PARTENAIRES OFFICIELS
              </h3>
            </div>
            <Link
              href="/partenaires"
              className="text-xs font-mono-tech text-zinc-400 hover:text-[#FFE500] flex items-center gap-1.5 transition-colors"
            >
              <span>Découvrir les 13 partenaires officiels</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 items-stretch">
            {partners.map((partner, i) => (
              <Link
                key={i}
                href="/partenaires"
                className="h-28 bg-[#0e0e14] border border-zinc-800 hover:border-[#FFE500] p-3 flex flex-col items-center justify-between transition-all duration-300 group hover:shadow-[0_4px_20px_rgba(255,229,0,0.12)] relative"
              >
                <div
                  className={`w-full h-14 ${partner.bgVariant === 'light'
                      ? 'bg-white border-zinc-200'
                      : 'bg-black/90 border-zinc-800'
                    } border p-1.5 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 duration-300 relative`}
                >
                  <Image
                    src={partner.logo}
                    alt={`Logo ${partner.name}`}
                    fill
                    className="object-contain p-1"
                    sizes="160px"
                  />
                </div>
                <span className="text-[10px] font-mono-tech text-zinc-500 group-hover:text-zinc-300 transition-colors uppercase tracking-wider text-center line-clamp-1 mt-1">
                  {partner.role}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};
