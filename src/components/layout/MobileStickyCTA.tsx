'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSiteSettings, DEFAULT_SITE_SETTINGS, SiteSettings } from '@/lib/data/site-service';

/**
 * Barre d'action collante mobile — libellés et liens pilotés par `site_settings`
 * (fallback `DEFAULT_SITE_SETTINGS`, zéro régression).
 */
export const MobileStickyCTA: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    getSiteSettings().then((s) => {
      if (s) setSettings(s);
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky CTA after scrolling past initial hero (200px)
      setIsVisible(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const phone = settings.phone || '(+33) 06 72 84 94 92';
  const callLabel = settings.mobile_sticky_call_label || 'Appel';
  const ctaLabel =
    settings.mobile_sticky_cta_text ||
    settings.hero_primary_cta_text ||
    'Contact & Projets';
  const ctaUrl =
    settings.mobile_sticky_cta_url ||
    settings.hero_primary_cta_url ||
    '/contact-cuc';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#060608]/95 backdrop-blur-md border-t border-[#FFE500]/30 px-3.5 py-2.5 flex items-center justify-between gap-2.5 shadow-[0_-10px_25px_rgba(0,0,0,0.9)]"
        >
          {/* Quick Call Button */}
          <a
            href={`tel:${phone.replace(/\s+/g, '')}`}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#121218] border border-zinc-700 text-[#FFE500] font-mono-tech text-xs uppercase tracking-wider active:bg-zinc-800 shrink-0"
            title="Appeler le CUC"
          >
            <Phone className="w-3.5 h-3.5" />
            <span className="font-bold">{callLabel}</span>
          </a>

          {/* Candidater / Réserver : le lien porte lui-même l'apparence du
              bouton. Un `<button>` imbriqué dans un `<Link>` superposait deux
              éléments interactifs, ce qui brouille le clic et la navigation au
              clavier pour les lecteurs d'écran. */}
          <Link
            href={ctaUrl}
            className="flex-grow flex items-center justify-center gap-2 px-3.5 py-2 bg-[#FFE500] text-black font-display font-bold uppercase text-xs tracking-wider shadow-[0_0_15px_rgba(255,229,0,0.3)] active:scale-98"
          >
            <span>{ctaLabel}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
