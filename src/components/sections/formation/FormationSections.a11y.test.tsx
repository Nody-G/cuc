/**
 * Audit accessibilité axe — formation : héros (titres, CTA) et formules
 * (sécurité, parcours d'admission, CTA). Seuil : 0 violation
 * `serious`/`critical` ; `color-contrast` est hors périmètre jsdom (documenté
 * dans le harnais).
 */
import { render } from '@testing-library/react';
import type { AnchorHTMLAttributes } from 'react';
import { IntlTestProvider, auditA11y, expectNoBlockingViolations } from '@/lib/testing/a11y-harness';
import { FormationHeroSection } from './FormationHeroSection';
import { FormationFormulesSection } from './FormationFormulesSection';

vi.mock('@/i18n/navigation', async () => {
    const { createElement } = await import('react');
    return {
        Link: ({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) =>
            createElement('a', { href, ...rest }, children),
    };
});

const noop = () => { };

describe('Formation — accessibilité (axe)', () => {
    it('FormationHeroSection — aucune violation serious/critical', async () => {
        const { container } = render(
            <IntlTestProvider>
                <FormationHeroSection onApply={noop} />
            </IntlTestProvider>
        );
        const audit = await auditA11y(container);
        expectNoBlockingViolations(audit, 'formation.hero');
    });

    it('FormationFormulesSection — aucune violation serious/critical', async () => {
        const { container } = render(
            <IntlTestProvider>
                <FormationFormulesSection onApply={noop} />
            </IntlTestProvider>
        );
        const audit = await auditA11y(container);
        expectNoBlockingViolations(audit, 'formation.formules');
    });
});
