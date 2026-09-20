'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Building, Compass, Layers } from 'lucide-react';

interface NavDropdownsProps {
  isFormationsActive: boolean;
  isCampusActive: boolean;
  isEventsActive: boolean;
  formationsDropdownOpen: boolean;
  setFormationsDropdownOpen: (open: boolean) => void;
  campusDropdownOpen: boolean;
  setCampusDropdownOpen: (open: boolean) => void;
  eventsDropdownOpen: boolean;
  setEventsDropdownOpen: (open: boolean) => void;
}

export const NavDropdowns: React.FC<NavDropdownsProps> = ({
  isFormationsActive,
  isCampusActive,
  isEventsActive,
  formationsDropdownOpen,
  setFormationsDropdownOpen,
  campusDropdownOpen,
  setCampusDropdownOpen,
  eventsDropdownOpen,
  setEventsDropdownOpen,
}) => {
  return (
    <>
      {/* Dropdown Formation & Stages */}
      <div
        className="relative py-2"
        onMouseEnter={() => setFormationsDropdownOpen(true)}
        onMouseLeave={() => setFormationsDropdownOpen(false)}
      >
        <button
          className={`flex items-center gap-1 uppercase transition-colors cursor-pointer ${
            isFormationsActive
              ? 'text-[#FFE500] font-bold border-b-2 border-[#FFE500]'
              : 'text-zinc-300 hover:text-[#FFE500]'
          }`}
          aria-haspopup="true"
          aria-expanded={formationsDropdownOpen}
        >
          <span>Formation & Stages</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        <AnimatePresence>
          {formationsDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute top-full left-0 w-64 bg-[#0e0e14] border-2 border-[#FFE500] p-2 shadow-2xl space-y-1 z-50 origin-top"
            >
              <Link
                href="/formation-de-cascadeur"
                onClick={() => setFormationsDropdownOpen(false)}
                className="block p-2.5 text-xs font-mono-tech text-zinc-200 hover:bg-[#FFE500] hover:text-black transition-colors"
              >
                <span className="font-bold block">FORMATION DE CASCADEUR</span>
                <span className="text-[10px] opacity-80 block">
                  Formule découverte & Cursus pro 2 ans
                </span>
              </Link>
              <Link
                href="/stages-cascades-parkour-2"
                onClick={() => setFormationsDropdownOpen(false)}
                className="block p-2.5 text-xs font-mono-tech text-zinc-200 hover:bg-[#FFE500] hover:text-black transition-colors border-t border-zinc-800"
              >
                <span className="font-bold block">STAGES & SÉJOURS</span>
                <span className="text-[10px] opacity-80 block">
                  Week-end, AFDAS, Summer Camp
                </span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dropdown Le Campus (Visite Guidée + Visite Virtuelle 360°) */}
      <div
        className="relative py-2"
        onMouseEnter={() => setCampusDropdownOpen(true)}
        onMouseLeave={() => setCampusDropdownOpen(false)}
      >
        <button
          className={`flex items-center gap-1 uppercase transition-colors cursor-pointer ${
            isCampusActive
              ? 'text-[#FFE500] font-bold border-b-2 border-[#FFE500]'
              : 'text-zinc-300 hover:text-[#FFE500]'
          }`}
          aria-haspopup="true"
          aria-expanded={campusDropdownOpen}
        >
          <span>Le Campus</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        <AnimatePresence>
          {campusDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute top-full left-0 w-72 bg-[#0e0e14] border-2 border-[#FFE500] p-2 shadow-2xl space-y-1 z-50 origin-top"
            >
              <Link
                href="/visite-guidee"
                onClick={() => setCampusDropdownOpen(false)}
                className="block p-2.5 text-xs font-mono-tech text-zinc-200 hover:bg-[#FFE500] hover:text-black transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">VISITE GUIDÉE (6 HA)</span>
                  <Building className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] opacity-80 block">
                  Les 9 installations et parc technique
                </span>
              </Link>
              <Link
                href="/visite-virtuelle#plan-3d-campus"
                onClick={() => setCampusDropdownOpen(false)}
                className="block p-2.5 text-xs font-mono-tech text-zinc-200 hover:bg-[#FFE500] hover:text-black transition-colors border-t border-zinc-800"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">PLAN 3D INTERACTIF</span>
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] opacity-80 block">
                  Three.js WebGL • 6 Hectares modélisés
                </span>
              </Link>
              <Link
                href="/visite-virtuelle"
                onClick={() => setCampusDropdownOpen(false)}
                className="block p-2.5 text-xs font-mono-tech text-zinc-200 hover:bg-[#FFE500] hover:text-black transition-colors border-t border-zinc-800"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">VISITE VIRTUELLE 360°</span>
                  <Compass className="w-3.5 h-3.5 text-[#FFE500]" />
                </div>
                <span className="text-[10px] opacity-80 block">
                  Immersion interactive HD Media
                </span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dropdown Events */}
      <div
        className="relative py-2"
        onMouseEnter={() => setEventsDropdownOpen(true)}
        onMouseLeave={() => setEventsDropdownOpen(false)}
      >
        <button
          className={`flex items-center gap-1 uppercase transition-colors cursor-pointer ${
            isEventsActive
              ? 'text-[#FFE500] font-bold border-b-2 border-[#FFE500]'
              : 'text-zinc-300 hover:text-[#FFE500]'
          }`}
          aria-haspopup="true"
          aria-expanded={eventsDropdownOpen}
        >
          <span>Events</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        <AnimatePresence>
          {eventsDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute top-full left-0 w-72 bg-[#0e0e14] border-2 border-[#FFE500] p-2 shadow-2xl space-y-1 z-50 origin-top"
            >
              <Link
                href="/cuc-events-agence"
                onClick={() => setEventsDropdownOpen(false)}
                className="block p-2 text-xs font-mono-tech text-zinc-200 hover:bg-[#FFE500] hover:text-black transition-colors"
              >
                <span className="font-bold block">AGENCE CUC EVENTS</span>
                <span className="text-[10px] opacity-80 block">
                  Présentation globale des prestations
                </span>
              </Link>
              <Link
                href="/spectacles-cascadeurs-yamakasi"
                onClick={() => setEventsDropdownOpen(false)}
                className="block p-2 text-xs font-mono-tech text-zinc-200 hover:bg-[#FFE500] hover:text-black transition-colors border-t border-zinc-800"
              >
                <span className="font-bold block">SPECTACLES CASCADEURS</span>
                <span className="text-[10px] opacity-80 block">
                  Shows clé en main & Yamakasi
                </span>
              </Link>
              <Link
                href="/animations-airbag-parkour"
                onClick={() => setEventsDropdownOpen(false)}
                className="block p-2 text-xs font-mono-tech text-zinc-200 hover:bg-[#FFE500] hover:text-black transition-colors border-t border-zinc-800"
              >
                <span className="font-bold block">ANIMATION AIRBAG GÉANT</span>
                <span className="text-[10px] opacity-80 block">
                  Xtrem Jump initiation grand public
                </span>
              </Link>
              <Link
                href="/team-building-cascades"
                onClick={() => setEventsDropdownOpen(false)}
                className="block p-2 text-xs font-mono-tech text-zinc-200 hover:bg-[#FFE500] hover:text-black transition-colors border-t border-zinc-800"
              >
                <span className="font-bold block">TEAM BUILDING D'EXCEPTION</span>
                <span className="text-[10px] opacity-80 block">
                  Ateliers d'action pour entreprises
                </span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
