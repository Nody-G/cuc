'use client';

import React, { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Languages } from 'lucide-react';

/**
 * Sélecteur de langue FR ⇄ EN.
 *
 * Bascule la locale via les wrappers next-intl (le chemin courant est conservé).
 * `localePrefix: 'as-needed'` ⇒ FR sans préfixe, EN sous `/en/...`.
 */
export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
    const locale = useLocale();
    const t = useTranslations('common');
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const next = locale === 'fr' ? 'en' : 'fr';
    const label = next === 'en' ? t('switchToEnglish') : t('switchToFrench');

    const switchLocale = () => {
        startTransition(() => {
            router.replace(pathname, { locale: next });
        });
    };

    return (
        <button
            type="button"
            onClick={switchLocale}
            disabled={isPending}
            aria-label={t('languageMenuLabel')}
            title={label}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-zinc-800 hover:border-[#FFE500] text-xs font-mono-tech uppercase text-zinc-400 hover:text-[#FFE500] transition-colors disabled:opacity-50 cursor-pointer shrink-0 ${className}`}
        >
            <Languages className="w-3.5 h-3.5" />
            <span>{label}</span>
        </button>
    );
};

export default LanguageSwitcher;
