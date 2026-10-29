/**
 * Audit accessibilité axe — contact : formulaire complet (étiquettes,
 * champs requis, sélecteur de demande). Seuil : 0 violation
 * `serious`/`critical` ; `color-contrast` est hors périmètre jsdom (documenté
 * dans le harnais). La Server Action est mockée : aucun réseau en test.
 */
import { render } from '@testing-library/react';
import type { AnchorHTMLAttributes } from 'react';
import { IntlTestProvider, auditA11y, expectNoBlockingViolations } from '@/lib/testing/a11y-harness';
import { ContactForm } from './ContactForm';

vi.mock('@/app/(admin)/admin/actions', () => ({
    submitInquiry: vi.fn(),
}));

vi.mock('@/i18n/navigation', async () => {
    const { createElement } = await import('react');
    return {
        Link: ({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) =>
            createElement('a', { href, ...rest }, children),
    };
});

describe('Contact — accessibilité (axe)', () => {
    it('ContactForm — aucune violation serious/critical', async () => {
        const { container } = render(
            <IntlTestProvider>
                <ContactForm />
            </IntlTestProvider>
        );
        const audit = await auditA11y(container);
        expectNoBlockingViolations(audit, 'contact.form');
    });
});
