'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ExternalLink } from 'lucide-react';
import { TacticalButton } from '../ui/TacticalButton';
import { NavDropdownItem } from './navbar/NavDropdowns';
import { NavActionsBar } from './navbar/NavActionsBar';
import { NavMobileDrawer } from './navbar/NavMobileDrawer';
import { AnnouncementBanner } from './AnnouncementBanner';
import { useNavigation } from '@/lib/hooks/useNavigation';
import type { NavItem } from '@/data/navigation';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const navigation = useNavigation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // UX: Auto-close dropdowns and mobile drawer on route change
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpenDropdownId(null);
    setMobileMenuOpen(false);
  }

  // Global Keyboard: Escape closes any open dropdown or the mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdownId(null);
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

  const isItemActive = (item: NavItem): boolean => {
    if (item.href && pathname === item.href) return true;
    if (item.activeMatchPrefixes?.some((prefix) => pathname.startsWith(prefix))) return true;
    if (item.children?.some((child) => child.href && pathname === child.href)) return true;
    return false;
  };

  // Ordre global unique : on ne sépare PAS dropdowns et liens en deux blocs,
  // sinon « Accueil » (lien, order 1) se retrouverait après les dropdowns.
  // Chaque item est rendu à sa place selon `order`.
  const orderedItems = useMemo(
    () =>
      navigation.items
        .filter((item) => item.is_visible !== false)
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [navigation.items]
  );

  const cta = navigation.cta;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{ viewTransitionName: 'site-header' }}
    >
      <AnnouncementBanner />
      {/* Main Bar */}
      <nav
        className={`transition-all duration-200 border-b ${isScrolled
          ? 'bg-[#060608]/95 backdrop-blur-md border-white/10 py-2.5 shadow-2xl'
          : 'bg-[#060608]/85 backdrop-blur-xs border-white/5 py-3.5'
          }`}
      >
        <div className="max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo CUC */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
              <Image
                src="/images/logos/cuc-logo-yellow.png"
                alt="Logo Campus Univers Cascades"
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

          {/* Desktop Navigation Links — séquence unique ordonnée par `order` */}
          <div className="hidden xl:flex items-center gap-3.5 2xl:gap-5 text-xs font-mono-tech uppercase tracking-wider shrink-0">
            {orderedItems.map((item) => {
              // Dropdown (Formation & Stages, Events) — piloté par site_navigation
              if (item.type === 'dropdown' && item.children?.length) {
                return (
                  <NavDropdownItem
                    key={item.id}
                    item={item}
                    openDropdownId={openDropdownId}
                    setOpenDropdownId={setOpenDropdownId}
                    isItemActive={isItemActive}
                  />
                );
              }

              const active = isItemActive(item);
              const baseClass = `py-1 transition-colors ${active
                ? 'text-[#FFE500] font-bold border-b-2 border-[#FFE500]'
                : 'text-zinc-300 hover:text-[#FFE500]'
                }`;

              if (item.is_external || item.type === 'external') {
                return (
                  <a
                    key={item.id}
                    href={item.href ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${baseClass} flex items-center gap-1`}
                    title={item.title}
                  >
                    <span>{item.label}</span>
                    <ExternalLink className="w-2.5 h-2.5 text-zinc-500" />
                  </a>
                );
              }

              return (
                <Link key={item.id} href={item.href ?? '/'} className={baseClass}>
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right Action CTA & Quick Tools */}
          <NavActionsBar />

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 xl:hidden">
            <Link href={cta.href}>
              <TacticalButton
                variant="primary"
                size="sm"
                className="text-xs px-2.5 py-1 sm:hidden"
              >
                {cta.label}
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
