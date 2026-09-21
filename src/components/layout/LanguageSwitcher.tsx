'use client';

import React, { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { LocaleFlag } from '@/components/ui/logos/FlagLogos';

/**
 * Sélecteur de langue FR ⇄ EN.
 *
 * Bascule la locale via les wrappers next-intl (le chemin courant est conservé).
 * `localePrefix: 'as-needed'` ⇒ FR sans préfixe, EN sous `/en/...`.
 *
 * L'affordance visuelle est le **drapeau officiel de la langue de destination**
 * (tricolore / Union Jack), dans le même esprit que le libellé précédent qui
 * nommait la langue cible. Le texte n'est pas perdu : il reste porté par
 * `aria-label` et `title`, car un drapeau ne désigne pas une langue de façon
 * fiable pour les lecteurs d'écran (et les emoji drapeaux ne s'affichent pas
 * sous Windows — d'où le SVG, voir `FlagLogos`).
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
            aria-label={label}
            title={label}
            className={`inline-flex items-center justify-center p-2 border border-zinc-800 hover:border-[#FFE500] transition-colors disabled:opacity-50 cursor-pointer shrink-0 ${className}`}
        >
            <LocaleFlag locale={next} className="border border-white/20" />
        </button>
    );
};

export default LanguageSwitcher;
