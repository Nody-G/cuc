'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PhoneCall, ChevronRight } from 'lucide-react';
import { TacticalButton } from '@/components/ui/TacticalButton';
import {
  InstagramLogo,
  YouTubeLogo,
  TikTokLogo,
} from '@/components/ui/BrandLogos';
import { getSiteSettings, DEFAULT_SITE_SETTINGS, SiteSettings } from '@/lib/data/site-service';

export const NavActionsBar: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    getSiteSettings().then((s) => {
      if (s) setSettings(s);
    });
  }, []);
  return (
    <div className="hidden sm:flex items-center gap-2.5 shrink-0">
      {/* Quick Official Social Icons */}
      <div className="hidden xl:flex items-center gap-1 border-r border-zinc-800 pr-2">
        <a
          href="https://www.instagram.com/campus.univers.cascades/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram du Campus Univers Cascades (nouvelle fenêtre)"
          className="p-1.5 text-zinc-400 hover:text-[#E1306C] hover:bg-white/5 transition-all group/soc"
          title="Instagram @campus.univers.cascades"
        >
          <InstagramLogo
            className="w-3.5 h-3.5 group-hover/soc:scale-110 transition-transform"
            variant="color"
          />
        </a>
        <a
          href="https://www.youtube.com/@campusuniverscascades"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chaîne YouTube du Campus Univers Cascades (nouvelle fenêtre)"
          className="p-1.5 text-zinc-400 hover:text-[#FF0000] hover:bg-white/5 transition-all group/soc"
          title="YouTube @campusuniverscascades"
        >
          <YouTubeLogo
            className="w-3.5 h-3.5 group-hover/soc:scale-110 transition-transform"
            variant="color"
          />
        </a>
        <a
          href="https://www.tiktok.com/@campusuniverscascades"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TikTok du Campus Univers Cascades (nouvelle fenêtre)"
          className="p-1.5 text-zinc-400 hover:text-[#25F4EE] hover:bg-white/5 transition-all group/soc"
          title="TikTok @campusuniverscascades"
        >
          <TikTokLogo
            className="w-3.5 h-3.5 group-hover/soc:scale-110 transition-transform"
            variant="color"
          />
        </a>
      </div>

      <a
        href={`tel:${(settings.phone || '06 72 84 94 92').replace(/\s/g, '')}`}
        className="hidden 2xl:flex whitespace-nowrap shrink-0 text-xs font-mono-tech text-zinc-400 hover:text-[#FFE500] items-center gap-1.5 px-2.5 py-1.5 border border-zinc-800 hover:border-zinc-600 transition-colors"
        title="Standard CUC"
      >
        <PhoneCall className="w-3.5 h-3.5 text-[#FFE500] shrink-0" />
        <span className="whitespace-nowrap font-mono-tech">{settings.phone || '06 72 84 94 92'}</span>
      </a>

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
