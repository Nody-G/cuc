'use client';
import { Link } from '@/i18n/navigation';

import React, { useEffect, useRef } from 'react';

import { ChevronDown } from 'lucide-react';
import type { NavItem } from '@/data/navigation';

interface NavDropdownItemProps {
  /** Item de type « dropdown » issu de `site_navigation` (fallback constantes). */
  item: NavItem;
  /** Identifiant du dropdown actuellement ouvert (un seul à la fois). */
  openDropdownId: string | null;
  setOpenDropdownId: (id: string | null) => void;
  /** Détermine si un item (ou l'un de ses enfants) correspond à la route courante. */
  isItemActive: (item: NavItem) => boolean;
}

/**
 * Méga-menu unitaire de la Navbar desktop.
 *
 * Doctrine : entièrement piloté par la structure `site_navigation`. Aucun
 * libellé, lien ou description n'est codé en dur ici — le fallback
 * `DEFAULT_NAVIGATION` garantit un rendu identique à l'historique.
 *
 * Ergonomie :
 * - Pont de survol sans pixel vide (`pt-2` au lieu de `mt-2`) pour empêcher
 *   que la liste ne disparaisse quand la souris descend vers les liens ;
 * - Délai de grâce de 150 ms sur `mouseleave` pour tolérer les trajectoires
 *   de curseur en diagonale.
 */
export const NavDropdownItem: React.FC<NavDropdownItemProps> = ({
  item,
  openDropdownId,
  setOpenDropdownId,
  isItemActive,
}) => {
  const isOpen = openDropdownId === item.id;
  const active = isItemActive(item);
  const children = (item.children ?? [])
    .filter((child) => child.is_visible)
    .sort((a, b) => a.order - b.order);

  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setOpenDropdownId(item.id);
  };

  const handleMouseLeave = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setOpenDropdownId(null);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      /**
       * Accessibilité clavier (WCAG 2.2) :
       * - `Échap` referme le méga-menu, y compris depuis un lien enfant ;
       * - la sortie du focus (Tab au-delà du panneau) le referme aussi, sans
       *   jamais interrompre une navigation au clavier à l'intérieur.
       */
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
          setOpenDropdownId(null);
        }
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
          setOpenDropdownId(null);
        }
      }}
    >
      <button
        type="button"
        onClick={() => {
          if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
          setOpenDropdownId(isOpen ? null : item.id);
        }}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`py-1 transition-colors flex items-center gap-1 cursor-pointer ${active
          ? 'text-[#FFE500] font-bold border-b-2 border-[#FFE500]'
          : 'text-zinc-300 hover:text-[#FFE500]'
          }`}
      >
        <span>{item.label}</span>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {children.length > 0 && (
        <div
          aria-hidden={!isOpen}
          className={`absolute top-full left-0 pt-2 min-w-[280px] z-50 transition-[opacity,transform,visibility] duration-150 ease-out ${isOpen
            ? 'visible opacity-100 translate-y-0'
            : 'invisible opacity-0 -translate-y-1.5 pointer-events-none'
            }`}
        >
          {/* Conteneur stylé avec fond et bordure, séparé du pont de survol pt-2 */}
          <div className="bg-[#0D0D12]/98 backdrop-blur-md border border-white/10 shadow-2xl p-2">
            {children.map((child) => (
              <Link
                key={child.id}
                href={child.href}
                target={child.is_external ? '_blank' : undefined}
                rel={child.is_external ? 'noopener noreferrer' : undefined}
                onClick={() => setOpenDropdownId(null)}
                className="block px-3 py-2.5 hover:bg-white/5 transition-colors group/item"
              >
                <span className="block text-xs font-display uppercase tracking-wider text-zinc-200 group-hover/item:text-[#FFE500] transition-colors">
                  {child.label}
                </span>
                {child.description && (
                  <span className="block text-[10px] font-mono-tech text-zinc-500 mt-0.5 normal-case tracking-normal">
                    {child.description}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
