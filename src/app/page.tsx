'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ParallaxHero } from '@/components/ui/ParallaxHero';
import {
  HomeAboutSection,
  HomeVirtualTourSection,
  HomeQualiopiSection,
  HomePartnersSection,
  HomeSocialSection,
} from '@/components/sections/home';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      <Navbar />

      <main id="contenu-principal" className="flex-grow pt-28">
        {/* 1. Cinematic Multi-Plane Parallax Hero */}
        <ParallaxHero />

        {/* 2. Dossier Architectural & Institutionnel (Qui Sommes-Nous) */}
        <HomeAboutSection />

        {/* 3. Visite Virtuelle 360° en Immersion HD Media */}
        <HomeVirtualTourSection />

        {/* 4. Certification Qualiopi & Agrément État */}
        <HomeQualiopiSection />

        {/* 5. Partenaires de référence */}
        <HomePartnersSection />

        {/* 6. Communauté & Réseaux Sociaux */}
        <HomeSocialSection />
      </main>

      <Footer />
    </div>
  );
}
