'use client';

import React from 'react';
import Link from 'next/link';
import { PhoneCall, ChevronRight } from 'lucide-react';
import { TacticalButton } from '@/components/ui/TacticalButton';
import {
  InstagramLogo,
  YouTubeLogo,
  TikTokLogo,
} from '@/components/ui/BrandLogos';

export const NavActionsBar: React.FC = () => {
  return (
    <div className="hidden sm:flex items-center gap-2.5 shrink-0">
      {/* Quick Official Social Icons */}
      <div className="hidden xl:flex items-center gap-1 border-r border-zinc-800 pr-2">
        <a
          href="https://www.instagram.com/campus.univers.cascades/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram officiel du Campus Univers Cascades (nouvelle fenêtre)"
          className="p-1.5 text-zinc-400 hover:text-[#E1306C] hover:bg-white/5 transition-all group/soc"
          title="Instagram Officiel @campus.univers.cascades"
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
          aria-label="Chaîne YouTube officielle du Campus Univers Cascades (nouvelle fenêtre)"
          className="p-1.5 text-zinc-400 hover:text-[#FF0000] hover:bg-white/5 transition-all group/soc"
          title="YouTube Officiel @campusuniverscascades"
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
          aria-label="TikTok officiel du Campus Univers Cascades (nouvelle fenêtre)"
          className="p-1.5 text-zinc-400 hover:text-[#25F4EE] hover:bg-white/5 transition-all group/soc"
          title="TikTok Officiel @campusuniverscascades"
        >
          <TikTokLogo
            className="w-3.5 h-3.5 group-hover/soc:scale-110 transition-transform"
            variant="color"
          />
        </a>
      </div>

      <a
        href="tel:+33672849492"
        className="hidden 2xl:flex whitespace-nowrap shrink-0 text-xs font-mono-tech text-zinc-400 hover:text-[#FFE500] items-center gap-1.5 px-2.5 py-1.5 border border-zinc-800 hover:border-zinc-600 transition-colors"
        title="Standard CUC"
      >
        <PhoneCall className="w-3.5 h-3.5 text-[#FFE500] shrink-0" />
        <span className="whitespace-nowrap font-mono-tech">06 72 84 94 92</span>
      </a>

      <Link href="/contact-cuc" className="shrink-0">
        <TacticalButton
          variant="primary"
          size="sm"
          icon={<ChevronRight className="w-4 h-4" />}
          className="whitespace-nowrap"
        >
          Candidater / Réserver
        </TacticalButton>
      </Link>
    </div>
  );
};
