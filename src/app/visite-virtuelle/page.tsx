'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { VirtualTourViewer } from '@/components/ui/VirtualTourViewer';
import { CampusPlan3D } from '@/components/3d/CampusPlan3D';
import { soundFX } from '@/lib/soundFx';
import {
  Compass,
  ChevronRight,
  MapPin,
  Building,
  ShieldCheck,
  PhoneCall,
  Layers,
  Eye
} from 'lucide-react';

export default function VisiteVirtuellePage() {
  const [activeTab, setActiveTab] = useState<'360' | '3d'>('360');

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);
      if (hash === '#plan-3d-campus' || params.get('tab') === '3d') {
        setActiveTab('3d');
      }
    };

    window.addEventListener('hashchange', handleHash);
    const timer = setTimeout(handleHash, 0);
    return () => {
      window.removeEventListener('hashchange', handleHash);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      <Navbar />

      <main className="flex-grow pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-mono-tech text-zinc-400 mb-4">
            <Link href="/" className="hover:text-[#FFE500] transition-colors">
              ACCUEIL
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <Link href="/visite-guidee" className="hover:text-[#FFE500] transition-colors">
              LE CAMPUS
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-[#FFE500]">
              {activeTab === '360' ? 'VISITE VIRTUELLE 360°' : 'PLAN 3D DU DOMAINE'}
            </span>
          </div>

          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider">
                  VISITE DU DOMAINE
                </span>
                <span className="text-xs font-mono-tech text-zinc-500">•</span>
                <span className="text-xs font-mono-tech text-zinc-400">
                  LE CATEAU-CAMBRÉSIS • 6 HECTARES
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-display uppercase tracking-tight text-white leading-none">
                DÉCOUVRIR LE CAMPUS <span className="text-[#FFE500]">{activeTab === '360' ? 'EN 360°' : 'EN 3D'}</span>
              </h1>

              <p className="text-sm sm:text-base text-zinc-300 font-tech mt-3 max-w-3xl leading-relaxed">
                Explorez les infrastructures du centre de formation de cascadeurs au Cateau-Cambrésis.
                Basculez librement entre les panoramas 360° et le plan 3D interactif du domaine.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="bg-[#121218] border border-zinc-800 p-1 flex items-center">
                <button
                  onClick={() => {
                    setActiveTab('360');
                    soundFX.playTacticalClick();
                  }}
                  className={`px-3 py-1.5 text-xs font-mono-tech font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === '360'
                      ? 'bg-[#FFE500] text-black shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Vue 360° VR</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('3d');
                    soundFX.playTacticalClick();
                  }}
                  className={`px-3 py-1.5 text-xs font-mono-tech font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === '3d'
                      ? 'bg-[#FFE500] text-black shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Plan 3D</span>
                </button>
              </div>

              <Link href="/contact-cuc">
                <TacticalButton variant="primary" size="md" icon={<PhoneCall className="w-4 h-4" />}>
                  Prendre Rendez-vous
                </TacticalButton>
              </Link>
            </div>
          </div>

          {/* Interactive Viewer: either 360 Player or 3D Campus Plan */}
          <div id="plan-3d-campus" className="mb-12 scroll-mt-28">
            {activeTab === '360' ? (
              <VirtualTourViewer />
            ) : (
              <CampusPlan3D />
            )}
          </div>

          {/* Key Facts and Practical Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-tech">
            <div className="bg-[#0e0e14] border border-zinc-800 p-6 relative">
              <div className="flex items-center gap-3 mb-3">
                <Building className="w-5 h-5 text-[#FFE500]" />
                <h2 className="font-display uppercase text-lg text-white">
                  6 Hectares d'Infrastructures
                </h2>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tour de saut de 21 mètres, salle d'entraînement Zoé Bell, dojos,
                manège équestre et hangars de cascades mécaniques réunis sur un même domaine privé.
              </p>
            </div>

            <div className="bg-[#0e0e14] border border-zinc-800 p-6 relative">
              <div className="flex items-center gap-3 mb-3">
                <ShieldCheck className="w-5 h-5 text-[#FFE500]" />
                <h2 className="font-display uppercase text-lg text-white">
                  Sécurité & Équipements
                </h2>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Matériel professionnel de cascade aux normes en vigueur : matelas de réception certifiés,
                airbags de saut, trampolines et fosse de travail.
              </p>
            </div>

            <div className="bg-[#0e0e14] border border-zinc-800 p-6 relative">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-5 h-5 text-[#FFE500]" />
                <h2 className="font-display uppercase text-lg text-white">
                  Accès & Hébergement
                </h2>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Situé au Cateau-Cambrésis (à 2h de Paris, 1h de Lille). Possibilité d'hébergement
                sur site en pension complète pour les élèves en formation et stages.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
