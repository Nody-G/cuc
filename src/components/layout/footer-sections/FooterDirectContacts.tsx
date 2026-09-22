'use client';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

import React, { useState, useEffect } from 'react';

import { Phone, Mail, ExternalLink } from 'lucide-react';
import { SocialIcon } from '@/components/ui/logos/SocialLogos';
import { getSiteSettings, DEFAULT_SITE_SETTINGS, SiteSettings } from '@/lib/data/site-service';
import { useRealtimeRefresh } from '@/lib/hooks/useRealtimeRefresh';
import { useSocialLinks } from '@/lib/hooks/useNavigation';
import { usePreviewSettings } from '@/lib/preview/use-preview-settings';
import { cucSetting } from '@/lib/preview/cuc-chrome';
import { cucMicro } from '@/lib/preview/cuc-micro';

/**
 * Lignes directes + réseaux sociaux du pied de page.
 * Les réseaux sont pilotés par `site_social_links` (fallback `DEFAULT_SOCIAL_LINKS`),
 * les coordonnées par `site_settings`.
 */
export const FooterDirectContacts: React.FC = () => {
  const t = useTranslations('footer');
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const socialLinks = useSocialLinks();
  /** Brouillon de réglages du Mode Studio : la surcharge locale prime. */
  const previewSettings = usePreviewSettings();
  const phone = previewSettings.phone || settings.phone || '(+33) 06 72 84 94 92';
  const email =
    previewSettings.email_general ||
    settings.email_general ||
    'contact@campus-universcascades.com';

  /** Recharge les coordonnées (état initial + synchronisation Realtime). */
  const loadSettings = React.useCallback(() => {
    getSiteSettings().then((s) => {
      if (s) setSettings(s);
    });
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Synchronisation Realtime Cockpit → Vitrine (lignes directes du footer).
  useRealtimeRefresh(['site_settings'], loadSettings);

  const footerSocials = [...socialLinks]
    .filter((social) => social.is_active && social.show_in_footer)
    .sort((a, b) => a.order_index - b.order_index);

  return (
    <>
      {/* Contacts Directs */}
      <div className="space-y-3">
        <h4
          {...cucMicro('footer.directLines')}
          className="text-base font-display uppercase tracking-wider text-white border-b border-zinc-800 pb-2"
        >
          {t('directLines')}
        </h4>

        <div className="space-y-3 text-xs font-mono-tech">
          <div className="flex items-center gap-2 text-zinc-300">
            <Phone className="w-4 h-4 text-[#FFE500] shrink-0" />
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              {...cucSetting('phone')}
              className="hover:text-[#FFE500] transition-colors"
            >
              {phone}
            </a>
          </div>

          <div className="flex items-center gap-2 text-zinc-300">
            <Mail className="w-4 h-4 text-[#FFE500] shrink-0" />
            <a
              href={`mailto:${email}`}
              {...cucSetting('email_general')}
              className="hover:text-[#FFE500] transition-colors"
            >
              {email}
            </a>
          </div>

          <div className="pt-2">
            <Link
              href="/contact-cuc"
              className="inline-flex items-center justify-between w-full p-2.5 bg-[#FFE500] text-black font-display uppercase font-bold text-xs tracking-wider hover:bg-[#FFF04D] transition-colors"
            >
              <span>{t('admissionFile')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Socials & Networks — pilotés par site_social_links */}
      <div className="space-y-3">
        <h4
          {...cucMicro('footer.networksTitle')}
          className="text-base font-display uppercase tracking-wider text-white border-b border-zinc-800 pb-2"
        >
          {t('networksTitle')}
        </h4>

        <p className="text-xs text-zinc-400 font-tech">
          <span {...cucMicro('footer.networksText')}>{t('networksText')}</span>
        </p>

        {/* Logos seuls : le libellé et l'indice d'affichage deviennent
            accessibles (`aria-label` / `title`) et ne surchargent plus la carte. */}
        <div className="flex flex-wrap items-center gap-2">
          {footerSocials.map((social) => {
            const label = [social.label, social.handle, social.display_hint]
              .filter(Boolean)
              .join(' · ');
            return (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                style={{ ['--brand' as string]: social.brand_color || '#FFE500' } as React.CSSProperties}
                className="w-9 h-9 flex items-center justify-center bg-[#101016] border border-zinc-800 hover:border-[color:var(--brand)] hover:bg-white/[0.05] transition-colors duration-200 group/soc"
              >
                <SocialIcon
                  platform={social.platform}
                  variant="color"
                  className="w-4 h-4 group-hover/soc:scale-110 transition-transform duration-200"
                />
              </a>
            );
          })}
        </div>
      </div>
    </>
  );
};
