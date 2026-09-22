'use client';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

import React from 'react';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { SocialIcon } from '@/components/ui/logos/SocialLogos';
import { useNavigation, useSocialLinks } from '@/lib/hooks/useNavigation';
import { cucMicro } from '@/lib/preview/cuc-micro';
import type { NavItem } from '@/data/navigation';

interface NavMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Drawer de navigation mobile.
 *
 * Doctrine : entièrement piloté par `site_navigation` (items, groupes, ordre,
 * visibilité) et `site_social_links` (réseaux sociaux). Le fallback
 * `DEFAULT_NAVIGATION` / `DEFAULT_SOCIAL_LINKS` garantit un rendu identique à
 * l'historique tant que rien n'est modifié en base.
 */
export const NavMobileDrawer: React.FC<NavMobileDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const navigation = useNavigation();
  const socialLinks = useSocialLinks();
  const t = useTranslations('common');
  /** Chrome commun (marque, accroche, ville) — éditable via « Micro-textes ». */
  const chrome = useTranslations('commonChrome');

  const drawerSocials = socialLinks.filter((s) => s.show_in_drawer);
  const cta = navigation.cta;

  const renderItem = (item: NavItem) => {
    if (item.type === 'dropdown') {
      const children = (item.children ?? [])
        .filter((child) => child.is_visible)
        .sort((a, b) => a.order - b.order);
      if (!children.length) return null;

      return (
        <div key={item.id} className="py-2 border-b border-zinc-800">
          <span className="text-xs font-mono-tech uppercase text-[#FFE500] block mb-1">
            {item.label} :
          </span>
          <div className="pl-3 space-y-2 text-sm font-display uppercase tracking-wider">
            {children.map((child) => (
              <Link
                key={child.id}
                href={child.href}
                target={child.is_external ? '_blank' : undefined}
                rel={child.is_external ? 'noopener noreferrer' : undefined}
                onClick={onClose}
                className="block text-zinc-300 hover:text-[#FFE500]"
              >
                • {child.label}
              </Link>
            ))}
          </div>
        </div>
      );
    }

    const isExternal = item.is_external || item.type === 'external';

    if (isExternal) {
      return (
        <a
          key={item.id}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="text-base font-display uppercase tracking-widest text-zinc-200 hover:text-[#FFE500] py-2 border-b border-zinc-800 flex items-center justify-between"
        >
          <span>{item.label}</span>
          <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
        </a>
      );
    }

    return (
      <Link
        key={item.id}
        href={item.href ?? '/'}
        onClick={onClose}
        className="text-base font-display uppercase tracking-widest text-zinc-200 hover:text-[#FFE500] py-2 border-b border-zinc-800"
      >
        {item.label}
      </Link>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        /* Voile de fermeture au tap : posé sous la barre (z négatif dans le
           contexte d'empilement du header) pour laisser la navigation visible. */
        <motion.button
          type="button"
          key="mobile-nav-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          aria-label={t('closeMenu')}
          className="xl:hidden fixed inset-0 -z-10 bg-black/50 cursor-default"
        />
      )}
      {isOpen && (
        <motion.div
          key="mobile-nav-panel"
          id="mobile-nav-drawer"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
          className="xl:hidden relative bg-[#0a0a0e] border-b border-[#FFE500]/40 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-3 shadow-2xl max-h-[85dvh] overflow-y-auto overscroll-contain"
        >
          <div className="h-1 w-full hazard-stripes mb-2" />

          {/* Mobile Brand Header */}
          <div className="flex items-center gap-3 pb-2.5 mb-1 border-b border-zinc-800">
            <div className="relative w-9 h-9 shrink-0">
              <Image
                src="/images/logos/cuc-logo-yellow.png"
                alt="Logo Campus Univers Cascades"
                width={36}
                height={36}
                className="object-contain drop-shadow-[0_0_8px_rgba(255,229,0,0.4)]"
              />
            </div>
            <div>
              <span
                className="font-display text-sm font-bold tracking-wider text-white block leading-tight"
                {...cucMicro('commonChrome.brandName')}
              >
                {chrome('brandName')}
              </span>
              <span
                className="text-[9px] font-mono-tech text-[#FFE500] uppercase tracking-widest block"
                {...cucMicro('commonChrome.brandTagline')}
              >
                {chrome('brandTagline')}
              </span>
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            {navigation.items
              .filter((item) => item.is_visible)
              .sort((a, b) => a.order - b.order)
              .map(renderItem)}
          </div>

          <div className="pt-3 flex flex-col gap-2">
            <Link href={cta.href} onClick={onClose}>
              <TacticalButton variant="primary" size="md" className="w-full">
                {cta.label}
              </TacticalButton>
            </Link>
            <div className="flex items-center justify-between text-xs font-mono-tech text-zinc-400 pt-2">
              <span>{chrome('campusCity')}</span>
              <a href="tel:+33672849492" className="text-[#FFE500]">
                06 72 84 94 92
              </a>
            </div>

            {/* Réseaux : logos seuls (aucun libellé visible), piloté par
                `site_social_links`. Nom et handle restent accessibles. */}
            {drawerSocials.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-3 border-t border-zinc-800">
                {drawerSocials.map((social) => (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ ['--brand' as string]: social.brand_color || '#FFE500' } as React.CSSProperties}
                    className="w-10 h-10 flex items-center justify-center bg-[#14141c] border border-zinc-800 hover:border-[color:var(--brand)] hover:bg-white/[0.05] transition-colors group"
                    aria-label={social.handle ? `${social.label} · ${social.handle}` : social.label}
                    title={social.handle ? `${social.label} — ${social.handle}` : social.label}
                  >
                    <SocialIcon
                      platform={social.platform}
                      variant="color"
                      className="w-4 h-4 group-hover:scale-110 transition-transform"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
