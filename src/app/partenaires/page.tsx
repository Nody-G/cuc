'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  PartenairesHeroSection,
  PartenairesGridSection,
  PartenairesCtaSection,
} from '@/components/sections/partenaires';

export default function PartenairesPage() {
  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      <Navbar />

      <main id="contenu-principal" className="flex-grow pt-28">
        <PartenairesHeroSection />
        <PartenairesGridSection />
        <PartenairesCtaSection />
      </main>

      <Footer />
    </div>
  );
}
