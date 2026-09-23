import { NextIntlClientProvider } from 'next-intl';
import { axe } from 'jest-axe';
import type { Result } from 'axe-core';
import type { ReactNode } from 'react';
import fr from '../../../messages/fr.json';

/**
 * ==============================================================================
 * Harnais d'audit accessibilité des composants (jsdom)
 * ==============================================================================
 * - `IntlTestProvider` : mêmes messages que la production (catalogue FR réel),
 *   pour auditer les libellés réellement servis aux visiteurs.
 * - `auditA11y` : lance axe-core sur le conteneur rendu et sépare les
 *   violations bloquantes (`serious`/`critical` — seuil retenu dans le plan de
 *   finalisation) du simple comptage.
 * - `color-contrast` est désactivé : jsdom ne calcule ni couleurs ni mises en
 *   page. Le contraste se vérifie en navigateur — limite documentée dans
 *   `plans/roadmap-site-2026.md`, jamais contournée par un faux test.
 */

export function IntlTestProvider({ children }: { children: ReactNode }) {
    return (
        <NextIntlClientProvider locale="fr" messages={fr}>
            {children}
        </NextIntlClientProvider>
    );
}

export interface A11yAudit {
    /** Violations bloquantes (`serious`/`critical`) — seuil du lot. */
    blocking: Result[];
    /** Toutes les violations détectées, pour publier le comptage. */
    total: number;
}

export async function auditA11y(container: Element): Promise<A11yAudit> {
    const results = await axe(container, {
        rules: {
            // jsdom ne calcule pas les couleurs : règle désactivée ici, vérifiée
            // en navigateur (revue manuelle).
            'color-contrast': { enabled: false },
        },
    });

    const blocking = results.violations.filter(
        (violation) => violation.impact === 'serious' || violation.impact === 'critical'
    );

    return { blocking, total: results.violations.length };
}

export function formatViolations(violations: Result[]): string {
    return violations.map((violation) => `${violation.id} (${violation.impact})`).join(', ');
}

/**
 * Assertion commune : zéro violation bloquante, avec le comptage total publié
 * dans le message d'échec (jamais un échec muet).
 */
export function expectNoBlockingViolations(audit: A11yAudit, surface: string): void {
    expect(
        audit.blocking,
        `${surface} : ${formatViolations(audit.blocking)} — ${audit.total} violation(s) au total (color-contrast exclu)`
    ).toEqual([]);
}
