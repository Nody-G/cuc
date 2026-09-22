'use client';

import React, { useMemo } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { applyMicrocopyOverlay } from '@/lib/i18n/microcopy';
import { usePreviewMicrocopy } from '@/lib/preview/use-preview-microcopy';

/**
 * ==============================================================================
 * CUC — Provider i18n de l'aperçu (micro-textes éditables)
 * ==============================================================================
 * Dans l'iframe du Cockpit, les micro-textes modifiés en place arrivent par
 * `microcopy-draft`. Ce provider applique la surcharge au catalogue de la locale
 * avec la **même fusion que le serveur** (`applyMicrocopyOverlay`, clonage sans
 * mutation) : aucun texte n'est recomposé localement, la règle
 * « une seule fusion » de `site_microcopy.md` reste tenue.
 *
 * Hors aperçu, la carte est vide : le catalogue servi est rendu tel quel (aucun
 * rendu supplémentaire, un `useMemo` sur des références stables).
 */

type IntlMessages = NonNullable<
    React.ComponentProps<typeof NextIntlClientProvider>['messages']
>;

export interface PreviewIntlProviderProps {
    locale: string;
    messages?: IntlMessages;
    children: React.ReactNode;
}

export const PreviewIntlProvider: React.FC<PreviewIntlProviderProps> = ({
    locale,
    messages,
    children,
}) => {
    const overrides = usePreviewMicrocopy();

    const merged = useMemo(() => {
        if (!messages) return messages;
        if (Object.keys(overrides).length === 0) return messages;
        return applyMicrocopyOverlay(messages, overrides);
    }, [messages, overrides]);

    /**
     * Sans surcharge, la surcouche est **transparente** : elle rend les enfants
     * tels quels, laissant le provider de la coquille (RootShell) porter le
     * contexte i18n — c'est lui qui garantit l'accès au catalogue pendant le
     * prerender. Le provider fusionné n'apparaît qu'en aperçu, quand un
     * micro-texte vient réellement d'être modifié.
     */
    if (merged === messages) return <>{children}</>;

    return (
        <NextIntlClientProvider locale={locale} messages={merged}>
            {children}
        </NextIntlClientProvider>
    );
};

export default PreviewIntlProvider;
