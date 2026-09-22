'use client';
import { Link } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';

import React, { useState, useEffect } from 'react';

import { Phone, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSiteSettings, DEFAULT_SITE_SETTINGS, SiteSettings } from '@/lib/data/site-service';
import { useRealtimeRefresh } from '@/lib/hooks/useRealtimeRefresh';
import { usePreviewSettings } from '@/lib/preview/use-preview-settings';
import { cucSetting } from '@/lib/preview/cuc-chrome';

/**
 * Barre d'action collante mobile — libellés et liens pilotés par `site_settings`
 * (fallback `DEFAULT_SITE_SETTINGS`, zéro régression).
 */
export const MobileStickyCTA: React.FC = () => {
  const t = useTranslations('common');
  const locale = useLocale();
  const [isVisible, setIsVisible] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  /** Recharge les réglages du site (état initial + synchronisation Realtime). */
  const loadSettings = React.useCallback(() => {
    getSiteSettings().then((s) => {
      if (s) setSettings(s);
    });
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Synchronisation Realtime Cockpit → Vitrine (téléphone et libellés du CTA).
  useRealtimeRefresh(['site_settings'], loadSettings);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky CTA after scrolling past initial hero (200px)
      setIsVisible(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /** Brouillon de réglages du Mode Studio : la surcharge locale prime. */
  const previewSettings = usePreviewSettings();
  const phone = previewSettings.phone || settings.phone || '(+33) 06 72 84 94 92';
  // Les libellés de `site_settings` sont en français (données FR) : en mode
  // anglais, on sert le catalogue `common`, sinon les réglages du Cockpit.
  const isEn = locale === 'en';
  const callLabel = isEn
    ? t('call')
    : previewSettings.mobile_sticky_call_label ||
    settings.mobile_sticky_call_label ||
    'Appel';
  const ctaLabel = isEn
    ? t('stickyCta')
    : previewSettings.mobile_sticky_cta_text ||
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
          className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#060608]/95 backdrop-blur-md border-t border-[#FFE500]/30 px-3.5 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-2.5 shadow-[0_-10px_25px_rgba(0,0,0,0.9)]"
        >
          {/* Quick Call Button */}
          <a
            href={`tel:${phone.replace(/\s+/g, '')}`}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#121218] border border-zinc-700 text-[#FFE500] font-mono-tech text-xs uppercase tracking-wider active:bg-zinc-800 shrink-0"
            title={t('callTitle')}
          >
            <Phone className="w-3.5 h-3.5" />
            {/* Libellé FR piloté par les réglages : éditable en place (jamais en EN). */}
            <span
              {...(!isEn ? cucSetting('mobile_sticky_call_label') : {})}
              className="font-bold"
            >
              {callLabel}
            </span>
          </a>

          {/* Candidater / Réserver : le lien porte lui-même l'apparence du
              bouton. Un `<button>` imbriqué dans un `<Link>` superposait deux
              éléments interactifs, ce qui brouille le clic et la navigation au
              clavier pour les lecteurs d'écran. */}
          <Link
            href={ctaUrl}
            className="flex-grow flex items-center justify-center gap-2 px-3.5 py-2 bg-[#FFE500] text-black font-display font-bold uppercase text-xs tracking-wider shadow-[0_0_15px_rgba(255,229,0,0.3)] active:scale-98"
          >
            <span {...(!isEn ? cucSetting('mobile_sticky_cta_text') : {})}>
              {ctaLabel}
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
