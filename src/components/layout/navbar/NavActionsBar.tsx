'use client';

import React, { useState, useEffect } from 'react';
import { PhoneCall, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { InstagramFollowerBadge } from '@/components/ui/InstagramFollowerBadge';
import { usePreviewSettings } from '@/lib/preview/use-preview-settings';
import { cucSetting } from '@/lib/preview/cuc-chrome';
import { getSiteSettings, DEFAULT_SITE_SETTINGS, SiteSettings } from '@/lib/data/site-service';
import { useRealtimeRefresh } from '@/lib/hooks/useRealtimeRefresh';

/**
 * Barre d'actions de la Navbar (réseaux sociaux, téléphone, CTA).
 *
 * Doctrine : les réseaux sociaux proviennent de `site_social_links` (source
 * unique de vérité partagée avec le Footer et le drawer mobile). Le fallback
 * `DEFAULT_SOCIAL_LINKS` corrige l'incohérence historique TikTok/YouTube en
 * unifiant les handles sur `@campusuniverscascades`.
 */
export const NavActionsBar: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const previewSettings = usePreviewSettings();
  const ctaText =
    previewSettings.hero_primary_cta_text || settings.hero_primary_cta_text || 'Contact & Projets';
  const ctaUrl =
    previewSettings.hero_primary_cta_url || settings.hero_primary_cta_url || '/contact-cuc';
  const phone = previewSettings.phone || settings.phone || '06 72 84 94 92';

  /** Recharge les réglages du site (état initial + synchronisation Realtime). */
  const loadSettings = React.useCallback(() => {
    getSiteSettings().then((s) => {
      if (s) setSettings(s);
    });
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Synchronisation Realtime Cockpit → Vitrine (coordonnées et libellés).
  useRealtimeRefresh(['site_settings'], loadSettings);

  return (
    <div className="hidden sm:flex items-center gap-2.5 shrink-0">
      {/* Badge officiel certifié Instagram CUC */}
      <div className="hidden lg:flex items-center">
        <InstagramFollowerBadge variant="header" />
      </div>

      <a
        href={`tel:${phone.replace(/\s/g, '')}`}
        className="hidden 2xl:flex whitespace-nowrap shrink-0 text-xs font-mono-tech text-zinc-400 hover:text-[#FFE500] items-center gap-1.5 px-2.5 py-1.5 border border-zinc-800 hover:border-zinc-600 transition-colors"
        title="Standard CUC"
      >
        <PhoneCall className="w-3.5 h-3.5 text-[#FFE500] shrink-0" />
        {/* Numéro de réglage : éditable en place dans l'aperçu du Cockpit. */}
        <span {...cucSetting('phone')} className="whitespace-nowrap font-mono-tech">
          {phone}
        </span>
      </a>

      <LanguageSwitcher />

      <Link href={ctaUrl} className="shrink-0">
        <TacticalButton
          variant="primary"
          size="sm"
          icon={<ChevronRight className="w-4 h-4" />}
          className="whitespace-nowrap"
        >
          {/* Texte de réglage : éditable en place dans l'aperçu du Cockpit. */}
          <span {...cucSetting('hero_primary_cta_text')}>{ctaText}</span>
        </TacticalButton>
      </Link>
    </div>
  );
};
