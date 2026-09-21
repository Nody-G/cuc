'use client';
import { Link } from '@/i18n/navigation';

import React from 'react';

import { motion, AnimatePresence } from 'framer-motion';
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
 * Rendu en composant UNITAIRE (et non en liste) afin que la Navbar puisse
 * intercaler dropdowns et liens simples dans un ordre global unique piloté
 * par `item.order` — sans quoi « Accueil » (lien, order 1) se retrouverait
 * systématiquement après les dropdowns.
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

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpenDropdownId(item.id)}
      onMouseLeave={() => setOpenDropdownId(null)}
    >
      <button
        type="button"
        onClick={() => setOpenDropdownId(isOpen ? null : item.id)}
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

      <AnimatePresence>
        {isOpen && children.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 min-w-[280px] bg-[#0D0D12]/98 backdrop-blur-md border border-white/10 shadow-2xl p-2 z-50"
          >
            {children.map((child) => (
              <Link
                key={child.id}
                href={child.href}
                target={child.is_external ? '_blank' : undefined}
                rel={child.is_external ? 'noopener noreferrer' : undefined}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
