'use client';

import { useTranslations } from 'next-intl';
import { cucMicro } from '@/lib/preview/cuc-micro';

/**
 * Lien d'évitement — accessibilité clavier (WCAG 2.4.1).
 *
 * Composant CLIENT dédié : `RootShell` est un composant serveur (fonts, JSON-LD)
 * et ne peut pas appeler `useTranslations`. Le libellé vit dans le catalogue
 * `common.skipToContent` (AR + EN), ce qui supprime le « Aller au contenu
 * principal » figé en dur qui s'affichait aussi en mode anglais.
 */
export const SkipLink: React.FC = () => {
    const t = useTranslations('common');
    return (
        <a
            href="#contenu-principal"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:px-4 focus:py-2 focus:bg-[#FFE500] focus:text-black focus:font-bold focus:text-sm focus:border-2 focus:border-black"
        >
            <span {...cucMicro('common.skipToContent')}>{t('skipToContent')}</span>
        </a>
    );
};
