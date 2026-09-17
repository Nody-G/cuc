'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, Mail, ExternalLink } from 'lucide-react';
import {
  InstagramLogo,
  YouTubeLogo,
  TikTokLogo,
  FacebookLogo,
  WhatsAppLogo,
} from '@/components/ui/BrandLogos';
import { getSiteSettings, DEFAULT_SITE_SETTINGS, SiteSettings } from '@/lib/data/site-service';

export const FooterDirectContacts: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    getSiteSettings().then((s) => {
      if (s) setSettings(s);
    });
  }, []);

  return (
    <>
      {/* Contacts Directs */}
      <div className="space-y-3">
        <h4 className="text-base font-display uppercase tracking-wider text-white border-b border-zinc-800 pb-2">
          Lignes Directes
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
              <span>Dossier d&apos;Admission 2026/2027</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Socials & Networks with Official Brand Logos */}
      <div className="space-y-3">
        <h4 className="text-base font-display uppercase tracking-wider text-white border-b border-zinc-800 pb-2">
          Réseaux &amp; Médias
        </h4>

        <p className="text-xs text-zinc-400 font-tech">
          Suivez les entraînements quotidiens, cascades exclusives et coulisses de
          tournages :
        </p>

        <div className="flex flex-col space-y-2">
          {/* Instagram */}
          <a
            href="https://www.instagram.com/campus.univers.cascades/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 bg-[#101016] border border-zinc-800 hover:border-[#E1306C]/70 text-xs font-mono-tech text-zinc-300 hover:text-white transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <InstagramLogo
                variant="color"
                className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform"
              />
              <span className="group-hover:text-white">Instagram</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono-tech group-hover:text-[#E1306C]">
              @campus.univers.cascades
            </span>
          </a>

          {/* YouTube */}
          <a
            href="https://www.youtube.com/@campusuniverscascades"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 bg-[#101016] border border-zinc-800 hover:border-[#FF0000]/70 text-xs font-mono-tech text-zinc-300 hover:text-white transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <YouTubeLogo
                variant="color"
                className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform"
              />
              <span className="group-hover:text-white">YouTube</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono-tech group-hover:text-[#FF0000]">
              Chaîne Stunt Team
            </span>
          </a>

          {/* TikTok */}
          <a
            href="https://www.tiktok.com/@campusuniverscascades"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 bg-[#101016] border border-zinc-800 hover:border-[#25F4EE]/70 text-xs font-mono-tech text-zinc-300 hover:text-white transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <TikTokLogo
                variant="color"
                className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform"
              />
              <span className="group-hover:text-white">TikTok</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono-tech group-hover:text-[#25F4EE]">
              @campusuniverscascades
            </span>
          </a>

          {/* Facebook */}
          <a
            href="https://www.facebook.com/campus.univers.cascades"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 bg-[#101016] border border-zinc-800 hover:border-[#1877F2]/70 text-xs font-mono-tech text-zinc-300 hover:text-white transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <FacebookLogo
                variant="color"
                className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform"
              />
              <span className="group-hover:text-white">Facebook</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono-tech group-hover:text-[#1877F2]">
              Page Facebook
            </span>
          </a>

          {/* WhatsApp Pro */}
          <a
            href="https://wa.me/33672849492?text=Bonjour%2C%20je%20souhaite%20des%20renseignements%20sur%20les%20formations%20du%20CUC"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 bg-[#101016] border border-zinc-800 hover:border-[#25D366]/70 text-xs font-mono-tech text-zinc-300 hover:text-white transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <WhatsAppLogo className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="group-hover:text-white">WhatsApp</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono-tech group-hover:text-[#25D366]">
              Ligne Admission Pro
            </span>
          </a>
        </div>
      </div>
    </>
  );
};
