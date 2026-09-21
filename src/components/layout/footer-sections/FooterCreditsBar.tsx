'use client';
import { Link } from '@/i18n/navigation';

import React, { useState, useEffect } from 'react';

import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFooter } from '@/lib/hooks/useNavigation';

/**
 * Barre de crédits légaux du pied de page — pilotée par `site_footer.legal`
 * (fallback `DEFAULT_FOOTER`, zéro régression).
 */
export const FooterCreditsBar: React.FC = () => {
  const { legal } = useFooter();
  const [showFloatingTop, setShowFloatingTop] = useState(false);
  // Année calculée côté client uniquement : évite le gel de la valeur au
  // moment du prerender (contrainte `cacheComponents` / PPR).
  const [year] = useState<number | null>(() =>
    typeof window === 'undefined' ? null : new Date().getFullYear()
  );

  const legalLinks = [...legal.links]
    .filter((link) => link.is_visible)
    .sort((a, b) => a.order - b.order);

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
          {legal.copyright.replace('{year}', String(year ?? 2026))}
        </div>

        <div className="flex items-center gap-4 text-zinc-400 flex-wrap justify-center">
          {legalLinks.map((link, idx) => (
            <React.Fragment key={link.id}>
              {idx > 0 && <span>•</span>}
              {link.is_external ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link href={link.href} className="hover:text-white transition-colors">
                  {link.label}
                </Link>
              )}
            </React.Fragment>
          ))}
          <span>•</span>
          <span className="text-[#FFE500]/80">Agrément QUALIOPI</span>
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
            /* `bottom` mobile = au-dessus de la barre collante + encoche iOS. */
            className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] sm:bottom-8 right-5 sm:right-8 z-40 p-3 bg-[#0a0a0e]/90 hover:bg-[#FFE500] text-zinc-300 hover:text-black border border-zinc-700 hover:border-[#FFE500] backdrop-blur-md shadow-2xl transition-colors cursor-pointer active:scale-95"
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
