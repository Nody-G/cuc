'use client';

import React from 'react';
import Link from 'next/link';
import { Search, PhoneCall, ChevronRight } from 'lucide-react';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { soundFX } from '@/lib/soundFx';
import {
  InstagramLogo,
  YouTubeLogo,
  TikTokLogo,
} from '@/components/ui/BrandLogos';

interface NavActionsBarProps {
  onOpenCommandPalette: () => void;
}

export const NavActionsBar: React.FC<NavActionsBarProps> = ({
  onOpenCommandPalette,
}) => {
  return (
    <div className="hidden sm:flex items-center gap-2.5 shrink-0">
      {/* Quick Official Social Icons */}
      <div className="hidden xl:flex items-center gap-1 border-r border-zinc-800 pr-2">
        <a
          href="https://www.instagram.com/campus.univers.cascades/"
          target="_blank"
          rel="noopener noreferrer"
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
          className="p-1.5 text-zinc-400 hover:text-[#25F4EE] hover:bg-white/5 transition-all group/soc"
          title="TikTok Officiel @campusuniverscascades"
        >
          <TikTokLogo
            className="w-3.5 h-3.5 group-hover/soc:scale-110 transition-transform"
            variant="color"
          />
        </a>
      </div>

      {/* Command Palette Trigger */}
      <button
        onClick={() => {
          soundFX.playTacticalClick();
          onOpenCommandPalette();
        }}
        className="px-2.5 py-1.5 bg-[#14141c] hover:bg-[#1a1a24] border border-zinc-800 hover:border-[#FFE500] text-zinc-300 hover:text-white text-xs font-mono-tech flex items-center gap-2 cursor-pointer transition-colors"
        title="Recherche rapide (Cmd+K)"
      >
        <Search className="w-3.5 h-3.5 text-[#FFE500]" />
        <span className="hidden md:inline">Recherche</span>
        <kbd className="hidden lg:inline-block px-1 py-0.2 bg-black text-[9px] text-zinc-400 border border-zinc-700">
          ⌘K
        </kbd>
      </button>

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
