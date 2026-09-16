'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileCheck } from 'lucide-react';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { QualiopiLogo } from '@/components/ui/BrandLogos';

export const HomeQualiopiSection: React.FC = () => {
  return (
    <section className="py-14 bg-[#0e0e14] border-b border-zinc-800">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#121218] border-2 border-[#FFE500] p-6 sm:p-8 relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[0_0_30px_rgba(255,229,0,0.08)]">

            <div className="flex items-start gap-4">
              <div className="p-2 bg-white border-2 border-[#FFE500] shrink-0 shadow-md flex items-center justify-center">
                <QualiopiLogo className="h-12 w-auto" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider">
                    CERTIFICATION OFFICIELLE
                  </span>
                  <span className="text-xs font-mono-tech text-zinc-400">
                    • RÉPUBLIQUE FRANÇAISE
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-display uppercase tracking-wider text-white">
                  CERTIFICATION QUALIOPI
                </h3>
                <p className="text-xs sm:text-sm font-tech text-zinc-300 mt-1 max-w-2xl">
                  La certification qualité a été délivrée au titre de la catégorie
                  d’action suivante :{' '}
                  <strong className="text-white">ACTIONS DE FORMATION</strong>. Une
                  formation certifiée et éligible aux financements professionnels
                  (AFDAS, France Travail).
                </p>
              </div>
            </div>

            <a
              href="https://www.campus-universcascades.com/wp-content/uploads/2024/12/21452296-CHALLENGE-EUROPE-PRODUCTIONS-Qualiopi.pdf"
              target="_blank"
              rel="noreferrer"
              className="shrink-0"
            >
              <TacticalButton
                variant="outline"
                size="sm"
                icon={<FileCheck className="w-4 h-4" />}
              >
                Voir le Certificat Qualiopi (PDF)
              </TacticalButton>
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
