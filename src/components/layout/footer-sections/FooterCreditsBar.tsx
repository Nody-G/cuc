'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FooterCreditsBar: React.FC = () => {
  const [showFloatingTop, setShowFloatingTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingTop(window.scrollY > 450);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Cinematic Credits Footer Bar */}
      <div className="pt-8 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-mono-tech text-zinc-500">
        <div>
          &copy; {new Date().getFullYear()} CAMPUS UNIVERS CASCADES • TOUS DROITS
          RÉSERVÉS // CUC PROD
        </div>

        <div className="flex items-center gap-4 text-zinc-400 flex-wrap justify-center">
          <Link href="/visite-guidee" className="hover:text-white transition-colors">
            Le Cateau-Cambrésis (59)
          </Link>
          <span>•</span>
          <Link href="/contact-cuc" className="hover:text-white transition-colors">
            Règlement &amp; Inscriptions
          </Link>
          <span>•</span>
          <span className="text-[#FFE500]/80">Agrément QUALIOPI</span>
          <span>•</span>
          <Link href="/contact-cuc" className="hover:text-white transition-colors">
            Secrétariat Pédagogique
          </Link>
        </div>

        <button
          onClick={scrollToTop}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-[#FFE500] uppercase transition-colors cursor-pointer"
        >
          <span>Haut de page</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Back To Top Button */}
      <AnimatePresence>
        {showFloatingTop && (
          <motion.button
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 sm:bottom-8 right-5 sm:right-8 z-40 p-3 bg-[#0a0a0e]/90 hover:bg-[#FFE500] text-zinc-300 hover:text-black border border-zinc-700 hover:border-[#FFE500] backdrop-blur-md shadow-2xl transition-colors cursor-pointer active:scale-95"
            aria-label="Remonter en haut de la page"
            title="Remonter en haut"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};
