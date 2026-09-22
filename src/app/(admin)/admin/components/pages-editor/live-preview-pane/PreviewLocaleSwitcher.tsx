'use client';

import React from 'react';
import { cx } from '@/app/(admin)/admin/components/ui';
import { LOCALES, type PreviewLocale } from './preview-devices';

interface PreviewLocaleSwitcherProps {
    locale: PreviewLocale;
    onLocaleChange?: (locale: PreviewLocale) => void;
}

/** Bascule de langue : recharge l'aperçu dans la langue choisie. */
export const PreviewLocaleSwitcher: React.FC<PreviewLocaleSwitcherProps> = ({
    locale,
    onLocaleChange,
}) => (
    <div
        className="flex items-center gap-2"
        role="group"
        aria-label="Langue de l’aperçu et de l’édition"
    >
        <span className="hidden sm:inline text-[10px] font-mono-tech uppercase tracking-wider text-zinc-500">
            Langue
        </span>
        <div className="flex items-center rounded-md border border-white/10 overflow-hidden">
            {LOCALES.map((value) => (
                <button
                    key={value}
                    type="button"
                    onClick={() => onLocaleChange?.(value)}
                    aria-pressed={locale === value}
                    title={
                        value === 'fr'
                            ? 'Afficher et éditer la version française'
                            : 'Afficher et éditer la version anglaise'
                    }
                    className={cx(
                        'px-2.5 py-1 text-[11px] font-mono-tech uppercase transition-colors',
                        locale === value
                            ? 'bg-[#FFE500] text-black font-bold'
                            : 'bg-black/40 text-zinc-400 hover:text-white'
                    )}
                >
                    {value}
                </button>
            ))}
        </div>
    </div>
);
