'use client';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

import React, { useState, useEffect } from 'react';

import { ArrowUp } from 'lucide-react';
import { useFooter } from '@/lib/hooks/useNavigation';
import { cucMicro } from '@/lib/preview/cuc-micro';

/**
 * Barre de crédits légaux du pied de page — pilotée par `site_footer.legal`
 * (fallback `DEFAULT_FOOTER`, zéro régression).
 */
export const FooterCreditsBar: React.FC = () => {
  const t = useTranslations('footer');
  const { legal } = useFooter();
  const [showFloatingTop, setShowFloatingTop] = useState(false);
  // Année calculée côté client uniquement : évite le gel de la valeur au
  // moment du prerender (contrainte `cacheComponents` / PPR).
  const [year] = useState<number | null>(() =>
    typeof window === 'undefined' ? null : new Date().getFullYear()
  );

  const legalLinks = [...legal.links]
    .filter((link) => link.is_visible)
    .sort((a, b) => a.order - b.order);

  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingTop(window.scrollY > 450);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Cinematic Credits Footer Bar */}
      <div className="pt-8 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-mono-tech text-zinc-500">
        <div>
          {legal.copyright.replace('{year}', String(year ?? 2026))}
        </div>

        <div className="flex items-center gap-4 text-zinc-400 flex-wrap justify-center">
          {legalLinks.map((link, idx) => (
            <React.Fragment key={link.id}>
              {idx > 0 && <span>•</span>}
              {link.is_external ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link href={link.href} className="hover:text-white transition-colors">
                  {link.label}
                </Link>
              )}
            </React.Fragment>
          ))}
          <span>•</span>
          <span className="text-[#FFE500]/80" {...cucMicro('footer.qualiopiBadge')}>
            {t('qualiopiBadge')}
          </span>
        </div>

        <button
          onClick={scrollToTop}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-[#FFE500] uppercase transition-colors cursor-pointer"
        >
          <span {...cucMicro('footer.backToTop')}>{t('backToTop')}</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Back To Top Button — `bottom` mobile = au-dessus de la barre
          collante + encoche iOS ; masquée (invisible + non focusable) tant que
          le seuil de scroll n'est pas franchi. */}
      <button
        onClick={scrollToTop}
        aria-hidden={!showFloatingTop}
        tabIndex={showFloatingTop ? 0 : -1}
        className={`fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] sm:bottom-8 right-5 sm:right-8 z-40 p-3 bg-[#0a0a0e]/90 hover:bg-[#FFE500] text-zinc-300 hover:text-black border border-zinc-700 hover:border-[#FFE500] backdrop-blur-md shadow-2xl cursor-pointer active:scale-95 transition-[opacity,transform,background-color,border-color,color] duration-200 ${showFloatingTop
          ? 'opacity-100 scale-100 translate-y-0'
          : 'opacity-0 scale-90 translate-y-2.5 invisible pointer-events-none'
          }`}
        aria-label={t('backToTopLabel')}
        title={t('backToTopTitle')}
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </>
  );
};
