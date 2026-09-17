'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { Compass } from 'lucide-react';
import { InteractiveCampusMap } from '@/components/ui/InteractiveCampusMap';
import {
  ContactHeroSection,
  ContactForm,
  ContactCoordinatesSidebar,
} from '@/components/sections/contact';
import { usePageDynamicContent } from '@/lib/hooks/usePageDynamicContent';

export default function ContactCucPage() {
  const { content } = usePageDynamicContent('contact-cuc');

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      <Navbar />

      <main id="contenu-principal" className="flex-grow pt-28">
        {/* 1. Page Header Hero */}
        <ContactHeroSection heroData={content.hero} />

        {/* 2. Contact Form & Coordinates Hub */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Formulaire de Contact */}
              <ContactForm />

              {/* Coordonnées, Standard & Deux Sites */}
              <ContactCoordinatesSidebar accessInfo={content.sections_data?.access_info} />
            </div>
          </div>
        </section>

        {/* 3. Interactive Campus Map & Navigation Hub */}
        <section
          id="campus-map-hub"
          className="py-16 bg-[#08080c] border-t border-zinc-800"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <StuntBadge
                variant="yellow"
                icon={<Compass className="w-3.5 h-3.5" />}
              >
                GÉOLOCALISATION &amp; ASSISTANT DE NAVIGATION
              </StuntBadge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display uppercase tracking-wide text-white mt-3 mb-3">
                PLAN DU DOMAINE &amp; <span className="text-[#FFE500]">ITINÉRAIRES</span>
              </h2>
              <p className="text-xs sm:text-sm font-tech text-zinc-400">
                Retrouvez les coordonnées GPS exactes, les temps de trajet en train ou
                voiture depuis Paris, Lille, Bruxelles, et lancez instantanément votre
                navigation dans Google Maps, Apple Maps, Waze ou SNCF Connect.
              </p>
            </div>

            <InteractiveCampusMap />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
