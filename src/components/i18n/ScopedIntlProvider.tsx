'use client';

import React, { useMemo } from 'react';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { applyMicrocopyOverlay } from '@/lib/i18n/microcopy';
import { usePreviewMicrocopy } from '@/lib/preview/use-preview-microcopy';

/**
 * ==============================================================================
 * [Hooks] — Provider i18n de PORTÉE : hérite de la coquille + ajoute la route
 * ==============================================================================
 * Le layout de locale (WS-F / F1) ne sérialise plus que les namespaces de la
 * **coquille** (`SHELL_NAMESPACES`). Ce provider client, posé par la route,
 * **fusionne** le catalogue hérité du parent (coquille) avec le sous-ensemble
 * propre à la route.
 *
 * Pourquoi une fusion et non un simple remplacement : `use-intl` REMPLACE les
 * messages dès qu'on en fournit (il ne fusionne pas tout seul). Sans la fusion,
 * les composants de coquille rendus dans l'arbre de la route (Navbar, footer)
 * perdraient leurs namespaces.
 *
 * Mode Studio : la surcharge de micro-textes de l'aperçu est réappliquée ici,
 * avec la MÊME fusion que le serveur — l'édition en place reste donc fidèle
 * sous ce provider.
 *
 * Sûreté : aucune valeur n'est inventée ; on ne fait que recopier. Un namespace
 * absent du parent ET de `messages` n'existe pas — d'où la carte conservatrice
 * `ROUTE_NAMESPACES` et son garde-fou automatisé.
 */

type IntlMessages = NonNullable<
    React.ComponentProps<typeof NextIntlClientProvider>['messages']
>;

export interface ScopedIntlProviderProps {
    locale: string;
    /** Namespaces PROPRES à la route (la coquille est héritée du parent). */
    messages?: Record<string, unknown>;
    children: React.ReactNode;
}

export const ScopedIntlProvider: React.FC<ScopedIntlProviderProps> = ({
    locale,
    messages,
    children,
}) => {
    const parentMessages = useMessages() as Record<string, unknown> | undefined;
    const overrides = usePreviewMicrocopy();

    const scoped = useMemo<IntlMessages>(() => {
        const base = {
            ...(parentMessages ?? {}),
            ...(messages ?? {}),
        } as IntlMessages;
        if (Object.keys(overrides).length === 0) return base;
        return applyMicrocopyOverlay(base, overrides) as IntlMessages;
    }, [parentMessages, messages, overrides]);

    return (
        <NextIntlClientProvider locale={locale} messages={scoped}>
            {children}
        </NextIntlClientProvider>
    );
};

export default ScopedIntlProvider;
