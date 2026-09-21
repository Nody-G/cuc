'use client';

import React from 'react';
import {
  FooterBrandAndSites,
  FooterDirectContacts,
  FooterNavMatrix,
  FooterCreditsBar,
} from './footer-sections';

export const Footer: React.FC = () => {
  return (
    <footer
      id="contact"
      className="bg-[#040406] text-zinc-400 border-t-2 border-[#FFE500]/40 relative"
    >
      {/* Top Hazard Accent Line */}
      <div className="h-1.5 w-full hazard-stripes" />

      {/* Main Footer Container */}
      <div className="page-shell py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand, Mission & Adresses */}
          <FooterBrandAndSites />

          {/* Lignes Directes & Réseaux */}
          <FooterDirectContacts />
        </div>

        {/* Quick Nav Matrix */}
        <FooterNavMatrix />

        {/* Cinematic Credits Footer Bar & Floating Top Button */}
        <FooterCreditsBar />
      </div>
    </footer>
  );
};
