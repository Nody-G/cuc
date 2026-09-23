/**
 * Audit accessibilité axe — accueil : la plus grande section éditoriale
 * (titres, image, citation du fondateur, CTA). Seuil : 0 violation
 * `serious`/`critical` ; `color-contrast` est hors périmètre jsdom (documenté
 * dans le harnais).
 */
import { render } from '@testing-library/react';
import type { AnchorHTMLAttributes } from 'react';
import { IntlTestProvider, auditA11y, expectNoBlockingViolations } from '@/lib/testing/a11y-harness';
import { HomeAboutSection } from './HomeAboutSection';

vi.mock('@/i18n/navigation', async () => {
    const { createElement } = await import('react');
    return {
        Link: ({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) =>
            createElement('a', { href, ...rest }, children),
    };
});

describe('Accueil — accessibilité (axe)', () => {
    it('HomeAboutSection — aucune violation serious/critical', async () => {
        const { container } = render(
            <IntlTestProvider>
                <HomeAboutSection />
            </IntlTestProvider>
        );
        const audit = await auditA11y(container);
        expectNoBlockingViolations(audit, 'accueil.about');
    });
});
