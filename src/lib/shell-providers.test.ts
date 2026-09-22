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
 * Depuis le Mode Studio, la coquille porte `PreviewIntlProvider` (client) : il
 * applique les surcharges de micro-textes de l'aperçu **et** rend le
 * `NextIntlClientProvider`. Ce test vérifie les deux maillons de l'invariant :
 *   1. `RootShell` englobe les composants de coquille consommateurs d'i18n ;
 *   2. `PreviewIntlProvider` rend bien le provider next-intl (chaîne intacte).
 */

const ROOT_SHELL = join(process.cwd(), 'src', 'components', 'layout', 'RootShell.tsx');
const PREVIEW_INTL_PROVIDER = join(
    process.cwd(),
    'src',
    'components',
    'preview',
    'PreviewIntlProvider.tsx'
);

describe('RootShell — périmètre du provider next-intl', () => {
    const src = readFileSync(ROOT_SHELL, 'utf8');

    it('rend PreviewIntlProvider (qui porte le NextIntlClientProvider)', () => {
        expect(
            src.includes('<PreviewIntlProvider'),
            'RootShell doit porter le provider i18n de l’aperçu : les composants de coquille en dépendent.'
        ).toBe(true);
        expect(src.includes('</PreviewIntlProvider>')).toBe(true);
    });

    it('conserve la chaîne next-intl : PreviewIntlProvider rend NextIntlClientProvider', () => {
        const providerSrc = readFileSync(PREVIEW_INTL_PROVIDER, 'utf8');
        expect(
            providerSrc.includes('<NextIntlClientProvider'),
            'PreviewIntlProvider doit rendre <NextIntlClientProvider>, sinon toute la coquille perd son contexte i18n.'
        ).toBe(true);
    });

    it('englobe MobileStickyCTA (dont le Link localisé exige le contexte i18n)', () => {
        const open = src.indexOf('<PreviewIntlProvider');
        const close = src.indexOf('</PreviewIntlProvider>');
        const sticky = src.indexOf('<MobileStickyCTA');

        expect(open, 'Balise ouvrante <PreviewIntlProvider> absente').toBeGreaterThan(-1);
        expect(close, 'Balise fermante </PreviewIntlProvider> absente').toBeGreaterThan(open);
        expect(sticky, '<MobileStickyCTA /> absent de la coquille').toBeGreaterThan(-1);

        expect(
            sticky > open && sticky < close,
            '<MobileStickyCTA /> doit être rendu À L\'INTÉRIEUR du provider i18n, sinon son <Link> localisé lève « No intl context found » dès le premier défilement.'
        ).toBe(true);
    });

    it('englobe également le pont d’aperçu du Cockpit', () => {
        const open = src.indexOf('<PreviewIntlProvider');
        const close = src.indexOf('</PreviewIntlProvider>');
        const preview = src.indexOf('<PreviewBridgeClient');

        expect(
            preview > open && preview < close,
            '<PreviewBridgeClient /> doit rester dans le périmètre du provider.'
        ).toBe(true);
    });
});
