import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Garde-fou de non-régression — contexte next-intl de la coquille.
 *
 * Panne réelle (production) : `MobileStickyCTA` est rendu par `RootShell`, donc
 * EN DEHORS du `NextIntlClientProvider` que les layouts racines déclaraient
 * autour de `{children}`. Or ce composant ne monte son `<Link>` localisé qu'au
 * premier défilement (`scrollY > 200`) et le `Link` de `@/i18n/navigation`
 * appelle `useLocale()` à chaque rendu. Résultat : au scroll, hors provider,
 * l'exception suivante — au message vide en production — remontait jusqu'à
 * `global-error` et remplaçait toute la page :
 *
 *   "No intl context found. Have you configured the provider?"
 *
 * Le provider est désormais porté par la coquille, à la racine. Ce test vérifie
 * l'invariant structurel : les composants de coquille consommateurs de next-intl
 * doivent être rendus À L'INTÉRIEUR du provider.
 */

const ROOT_SHELL = join(process.cwd(), 'src', 'components', 'layout', 'RootShell.tsx');

describe('RootShell — périmètre du provider next-intl', () => {
    const src = readFileSync(ROOT_SHELL, 'utf8');

    it('rend un NextIntlClientProvider', () => {
        expect(
            src.includes('<NextIntlClientProvider'),
            'RootShell doit porter le provider next-intl : les composants de coquille en dépendent.'
        ).toBe(true);
    });

    it('englobe MobileStickyCTA (dont le Link localisé exige le contexte i18n)', () => {
        const open = src.indexOf('<NextIntlClientProvider');
        const close = src.indexOf('</NextIntlClientProvider>');
        const sticky = src.indexOf('<MobileStickyCTA');

        expect(open, 'Balise ouvrante <NextIntlClientProvider> absente').toBeGreaterThan(-1);
        expect(close, 'Balise fermante </NextIntlClientProvider> absente').toBeGreaterThan(open);
        expect(sticky, '<MobileStickyCTA /> absent de la coquille').toBeGreaterThan(-1);

        expect(
            sticky > open && sticky < close,
            '<MobileStickyCTA /> doit être rendu À L\'INTÉRIEUR de <NextIntlClientProvider>, sinon son <Link> localisé lève « No intl context found » dès le premier défilement.'
        ).toBe(true);
    });

    it('englobe également le pont d’aperçu du Cockpit', () => {
        const open = src.indexOf('<NextIntlClientProvider');
        const close = src.indexOf('</NextIntlClientProvider>');
        const preview = src.indexOf('<PreviewBridgeClient');

        expect(
            preview > open && preview < close,
            '<PreviewBridgeClient /> doit rester dans le périmètre du provider.'
        ).toBe(true);
    });
});
