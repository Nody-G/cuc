'use client';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

import React, { useState, useEffect } from 'react';

import { Phone, Mail, ExternalLink } from 'lucide-react';
import { SocialIcon } from '@/components/ui/logos/SocialLogos';
import { getSiteSettings, DEFAULT_SITE_SETTINGS, SiteSettings } from '@/lib/data/site-service';
import { useSocialLinks } from '@/lib/hooks/useNavigation';

/**
 * Lignes directes + réseaux sociaux du pied de page.
 * Les réseaux sont pilotés par `site_social_links` (fallback `DEFAULT_SOCIAL_LINKS`),
 * les coordonnées par `site_settings`.
 */
export const FooterDirectContacts: React.FC = () => {
  const t = useTranslations('footer');
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const socialLinks = useSocialLinks();

  useEffect(() => {
    getSiteSettings().then((s) => {
      if (s) setSettings(s);
    });
  }, []);

  const footerSocials = [...socialLinks]
    .filter((social) => social.is_active && social.show_in_footer)
    .sort((a, b) => a.order_index - b.order_index);

  return (
    <>
      {/* Contacts Directs */}
      <div className="space-y-3">
        <h4 className="text-base font-display uppercase tracking-wider text-white border-b border-zinc-800 pb-2">
          {t('directLines')}
        </h4>

        <div className="space-y-3 text-xs font-mono-tech">
          <div className="flex items-center gap-2 text-zinc-300">
            <Phone className="w-4 h-4 text-[#FFE500] shrink-0" />
            <a
              href={`tel:${(settings.phone || '+33672849492').replace(/\s+/g, '')}`}
              className="hover:text-[#FFE500] transition-colors"
            >
              {settings.phone || '(+33) 06 72 84 94 92'}
            </a>
          </div>

          <div className="flex items-center gap-2 text-zinc-300">
            <Mail className="w-4 h-4 text-[#FFE500] shrink-0" />
            <a
              href={`mailto:${settings.email_general || 'contact@campus-universcascades.com'}`}
              className="hover:text-[#FFE500] transition-colors"
            >
              {settings.email_general || 'contact@campus-universcascades.com'}
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
        <h4 className="text-base font-display uppercase tracking-wider text-white border-b border-zinc-800 pb-2">
          {t('networksTitle')}
        </h4>

        <p className="text-xs text-zinc-400 font-tech">
          {t('networksText')}
        </p>

        <div className="flex flex-col space-y-2">
          {footerSocials.map((social) => (
            <a
              key={social.id}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 bg-[#101016] border border-zinc-800 hover:border-[#FFE500]/70 text-xs font-mono-tech text-zinc-300 hover:text-white transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <SocialIcon
                  platform={social.platform}
                  variant="color"
                  className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform"
                />
                <span className="group-hover:text-white">{social.label}</span>
              </div>
              {social.display_hint && (
                <span className="text-[10px] text-zinc-500 font-mono-tech group-hover:text-[#FFE500]">
                  {social.display_hint}
                </span>
              )}
            </a>
          ))}
        </div>
      </div>
    </>
  );
};
