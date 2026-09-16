'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ExternalLink } from 'lucide-react';
import { TacticalButton } from '../ui/TacticalButton';
import { NavDropdowns } from './navbar/NavDropdowns';
import { NavActionsBar } from './navbar/NavActionsBar';
import { NavMobileDrawer } from './navbar/NavMobileDrawer';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formationsDropdownOpen, setFormationsDropdownOpen] = useState(false);
  const [campusDropdownOpen, setCampusDropdownOpen] = useState(false);
  const [eventsDropdownOpen, setEventsDropdownOpen] = useState(false);

  // UX: Auto-close dropdowns and mobile drawer on route change
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setFormationsDropdownOpen(false);
    setCampusDropdownOpen(false);
    setEventsDropdownOpen(false);
    setMobileMenuOpen(false);
  }

  // Global Keyboard: Escape closes any open dropdown or the mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFormationsDropdownOpen(false);
        setCampusDropdownOpen(false);
        setEventsDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isFormationsActive =
    pathname.startsWith('/formation') || pathname.startsWith('/stages');

  const isCampusActive =
    pathname.startsWith('/visite-guidee') ||
    pathname.startsWith('/visite-virtuelle');

  const isEventsActive =
    pathname.startsWith('/cuc-events') ||
    pathname.startsWith('/spectacles') ||
    pathname.startsWith('/animations') ||
    pathname.startsWith('/team-building');

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{ viewTransitionName: 'site-header' }}
    >
      {/* Main Bar */}
      <nav
        className={`transition-all duration-200 border-b ${isScrolled
          ? 'bg-[#060608]/95 backdrop-blur-md border-white/10 py-2.5 shadow-2xl'
          : 'bg-[#060608]/85 backdrop-blur-xs border-white/5 py-3.5'
          }`}
      >
        <div className="max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo CUC Officiel */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
              <Image
                src="/images/logos/cuc-logo-yellow.png"
                alt="Logo Officiel Campus Univers Cascades"
                width={48}
                height={48}
                priority
                className="object-contain drop-shadow-[0_0_10px_rgba(255,229,0,0.4)] group-hover:drop-shadow-[0_0_16px_rgba(255,229,0,0.7)] transition-all"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg sm:text-xl font-bold tracking-wider text-white leading-none group-hover:text-[#FFE500] transition-colors">
                CAMPUS UNIVERS CASCADES
              </span>
              <span className="text-[10px] font-mono-tech tracking-widest text-zinc-400 uppercase leading-tight mt-0.5">
                Stunt Academy & Team • Est. 2008
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden xl:flex items-center gap-3.5 2xl:gap-5 text-xs font-mono-tech uppercase tracking-wider shrink-0">
            <Link
              href="/"
              className={`py-1 transition-colors ${pathname === '/'
                ? 'text-[#FFE500] font-bold border-b-2 border-[#FFE500]'
                : 'text-zinc-300 hover:text-[#FFE500]'
                }`}
            >
              Accueil
            </Link>

            {/* Dropdowns (Formation, Campus, Events) */}
            <NavDropdowns
              isFormationsActive={isFormationsActive}
              isCampusActive={isCampusActive}
              isEventsActive={isEventsActive}
              formationsDropdownOpen={formationsDropdownOpen}
              setFormationsDropdownOpen={setFormationsDropdownOpen}
              campusDropdownOpen={campusDropdownOpen}
              setCampusDropdownOpen={setCampusDropdownOpen}
              eventsDropdownOpen={eventsDropdownOpen}
              setEventsDropdownOpen={setEventsDropdownOpen}
            />

            <Link
              href="/stunt-workshop-cuc"
              className={`py-1 transition-colors ${pathname === '/stunt-workshop-cuc'
                ? 'text-[#FFE500] font-bold border-b-2 border-[#FFE500]'
                : 'text-zinc-300 hover:text-[#FFE500]'
                }`}
            >
              Workshop
            </Link>

            <Link
              href="/equipe-cascadeurs-pro"
              className={`py-1 transition-colors ${pathname === '/equipe-cascadeurs-pro'
                ? 'text-[#FFE500] font-bold border-b-2 border-[#FFE500]'
                : 'text-zinc-300 hover:text-[#FFE500]'
                }`}
            >
              L’équipe
            </Link>

            <Link
              href="/videos-cascadeur"
              className={`py-1 transition-colors ${pathname === '/videos-cascadeur'
                ? 'text-[#FFE500] font-bold border-b-2 border-[#FFE500]'
                : 'text-zinc-300 hover:text-[#FFE500]'
                }`}
            >
              Nos Vidéos
            </Link>

            <Link
              href="/cuc-team-cascadeur"
              className={`py-1 transition-colors ${pathname === '/cuc-team-cascadeur'
                ? 'text-[#FFE500] font-bold border-b-2 border-[#FFE500]'
                : 'text-zinc-300 hover:text-[#FFE500]'
                }`}
            >
              Tournages
            </Link>

            <Link
              href="/partenaires"
              className={`py-1 transition-colors ${pathname === '/partenaires'
                ? 'text-[#FFE500] font-bold border-b-2 border-[#FFE500]'
                : 'text-zinc-300 hover:text-[#FFE500]'
                }`}
            >
              Partenaires
            </Link>

            {/* Boutique Link */}
            <a
              href="https://ma-boutique-club.com/campus-universcascades/"
              target="_blank"
              rel="noopener noreferrer"
              className="py-1 text-zinc-300 hover:text-[#FFE500] transition-colors flex items-center gap-1"
              title="Boutique Officielle CUC (Textiles, Sweats, Équipements)"
            >
              <span>Boutique</span>
              <ExternalLink className="w-2.5 h-2.5 text-zinc-500" />
            </a>

            <Link
              href="/contact-cuc"
              className={`py-1 transition-colors ${pathname === '/contact-cuc'
                ? 'text-[#FFE500] font-bold border-b-2 border-[#FFE500]'
                : 'text-zinc-300 hover:text-[#FFE500]'
                }`}
            >
              Contact
            </Link>
          </div>

          {/* Right Action CTA & Quick Tools */}
          <NavActionsBar />

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 xl:hidden">
            <Link href="/contact-cuc">
              <TacticalButton
                variant="primary"
                size="sm"
                className="text-xs px-2.5 py-1 sm:hidden"
              >
                Candidater
              </TacticalButton>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-300 hover:text-[#FFE500] border border-zinc-800 bg-[#121216] cursor-pointer"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <NavMobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </header>
  );
};
