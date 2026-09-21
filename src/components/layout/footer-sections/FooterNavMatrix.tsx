'use client';
import { Link } from '@/i18n/navigation';

import React from 'react';

import { ExternalLink } from 'lucide-react';
import { useFooter } from '@/lib/hooks/useNavigation';

/**
 * Matrice de navigation du pied de page — pilotée par `site_footer`.
 * Fallback intégral sur `DEFAULT_FOOTER` (zéro régression) tant que la table
 * n'est pas modifiée dans le Cockpit.
 */
export const FooterNavMatrix: React.FC = () => {
  const footer = useFooter();

  const columns = [...footer.columns]
    .filter((column) => column.is_visible)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="py-8 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs font-mono-tech">
      {columns.map((column) => {
        const links = [...column.links]
          .filter((link) => link.is_visible)
          .sort((a, b) => a.order - b.order);

        return (
          <div key={column.id}>
            <span className="text-[#FFE500] uppercase font-bold block mb-2">
              {column.title}
            </span>
            <ul className="space-y-1.5 text-zinc-400">
              {links.map((link) =>
                link.is_external ? (
                  <li key={link.id}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white flex items-center gap-1 transition-colors"
                    >
                      {link.label} <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </li>
                ) : (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      className="hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
};
