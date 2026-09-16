'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  EventsHeroSection,
  EventsPillarsSection,
  EventsPartnersBanners,
  EventsGuaranteesSection,
} from '@/components/sections/events';

export default function CucEventsAgencePage() {
  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      <Navbar />

      <main id="contenu-principal" className="flex-grow pt-28">
        <EventsHeroSection />
        <EventsPillarsSection />
        <EventsPartnersBanners />
        <EventsGuaranteesSection />
      </main>

      <Footer />
    </div>
  );
}
