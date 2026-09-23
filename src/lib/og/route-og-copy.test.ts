import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROUTE_OG_COPY, ogLocale, routeOgOptions, type RouteOgSlug } from './route-og-copy';

/**
 * Garde-fou des cartes Open Graph de route (bilingues).
 *
 * Incident réel : les 14 routes publiques exportaient leur copie française en
 * dur — une page `/en/…` partageait donc une vignette française. Le contenu vit
 * désormais dans `route-og-copy.ts` et les routes lisent leurs `params`.
 *
 * Ce test échoue si :
 *   1. une entrée du catalogue perd sa version FR ou EN (ou la laisse vide) ;
 *   2. une traduction EN n'est qu'une copie du FR (titre/accroche identiques) —
 *      le symptôme exact de l'incident d'origine ;
 *   3. une route OG cesse de lire la locale (retour à une carte figée en FR) ;
 *   4. une route du catalogue n'a pas de fichier `opengraph-image.tsx`.
 */

const ROUTES_DIR = join(process.cwd(), 'src', 'app', '(site)', '[locale]');

const SLUGS = Object.keys(ROUTE_OG_COPY) as RouteOgSlug[];

describe('Cartes Open Graph de route — catalogue bilingue', () => {
    it('chaque route du catalogue a ses deux langues, non vides', () => {
        for (const slug of SLUGS) {
            for (const locale of ['fr', 'en'] as const) {
                const copy = ROUTE_OG_COPY[slug][locale];
                expect(copy.eyebrow.trim(), `${slug}.${locale}.eyebrow`).not.toBe('');
                expect(copy.title.trim(), `${slug}.${locale}.title`).not.toBe('');
                expect(copy.subtitle.trim(), `${slug}.${locale}.subtitle`).not.toBe('');
                expect(copy.metrics.length, `${slug}.${locale}.metrics`).toBe(4);
                for (const metric of copy.metrics) {
                    expect(metric.trim(), `${slug}.${locale}.metrics`).not.toBe('');
                }
            }
        }
    });

    it('l’anglais n’est jamais une copie du français', () => {
        for (const slug of SLUGS) {
            const { fr, en } = ROUTE_OG_COPY[slug];
            expect(en.title, `${slug}.title`).not.toBe(fr.title);
            expect(en.subtitle, `${slug}.subtitle`).not.toBe(fr.subtitle);
        }
    });

    it('`routeOgOptions` porte la locale et retombe sur FR sans locale valide', () => {
        const en = routeOgOptions('formation-de-cascadeur', 'en');
        expect(en.locale).toBe('en');
        expect(en.title).toBe('PROFESSIONAL STUNT TRAINING');

        const unknown = routeOgOptions('formation-de-cascadeur', undefined);
        expect(unknown.locale).toBe('fr');
        expect(unknown.title).toBe('DEVENIR CASCADEUR DE CINÉMA');

        expect(ogLocale('en')).toBe('en');
        expect(ogLocale('de')).toBe('fr');
    });

    it('chaque route lit la locale : fichier présent et branché sur le catalogue', () => {
        for (const slug of SLUGS) {
            const file = join(ROUTES_DIR, slug, 'opengraph-image.tsx');
            expect(existsSync(file), `fichier manquant : ${slug}`).toBe(true);

            const source = readFileSync(file, 'utf8');
            expect(
                source.includes(`routeOgOptions("${slug}"`),
                `${slug} : la route ne lit plus le catalogue bilingue (carte figée ?)`
            ).toBe(true);
            expect(
                source.includes('params'),
                `${slug} : la route n’attend plus les paramètres de route (locale ignorée)`
            ).toBe(true);
        }
    });
});
