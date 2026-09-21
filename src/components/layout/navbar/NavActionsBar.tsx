'use client';

import React, { useState, useEffect } from 'react';
import { PhoneCall, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { SocialIcon } from '@/components/ui/logos/SocialLogos';
import { useSocialLinks } from '@/lib/hooks/useNavigation';
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
  const socialLinks = useSocialLinks();

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

  const navbarSocials = socialLinks.filter((s) => s.show_in_navbar);

  return (
    <div className="hidden sm:flex items-center gap-2.5 shrink-0">
      {/* Quick Official Social Icons — pilotés par site_social_links */}
      {navbarSocials.length > 0 && (
        <div className="hidden xl:flex items-center gap-1 border-r border-zinc-800 pr-2">
          {navbarSocials.map((social) => (
            <a
              key={social.id}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ['--brand' as string]: social.brand_color || '#FFE500' } as React.CSSProperties}
              aria-label={social.handle ? `${social.label} · ${social.handle}` : social.label}
              className="p-1.5 border border-transparent hover:border-[color:var(--brand)] hover:bg-white/[0.06] transition-colors group/soc"
              title={social.handle ? `${social.label} ${social.handle}` : social.label}
            >
              <SocialIcon
                platform={social.platform}
                className="w-3.5 h-3.5 group-soc:scale-110 transition-transform"
                variant="color"
              />
            </a>
          ))}
        </div>
      )}

      <a
        href={`tel:${(settings.phone || '06 72 84 94 92').replace(/\s/g, '')}`}
        className="hidden 2xl:flex whitespace-nowrap shrink-0 text-xs font-mono-tech text-zinc-400 hover:text-[#FFE500] items-center gap-1.5 px-2.5 py-1.5 border border-zinc-800 hover:border-zinc-600 transition-colors"
        title="Standard CUC"
      >
        <PhoneCall className="w-3.5 h-3.5 text-[#FFE500] shrink-0" />
        <span className="whitespace-nowrap font-mono-tech">{settings.phone || '06 72 84 94 92'}</span>
      </a>

      <LanguageSwitcher />

      <Link href={settings.hero_primary_cta_url || '/contact-cuc'} className="shrink-0">
        <TacticalButton
          variant="primary"
          size="sm"
          icon={<ChevronRight className="w-4 h-4" />}
          className="whitespace-nowrap"
        >
          {settings.hero_primary_cta_text || 'Contact & Projets'}
        </TacticalButton>
      </Link>
    </div>
  );
};
