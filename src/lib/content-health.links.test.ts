import { analyzeContentHealth } from './content-health';
import { STATIC_ROUTES } from './content-health/path-collectors';
import { baseInput, makeFooter, makeNav } from './content-health.fixtures';
import { SITE_PAGE_CATALOG } from '@/lib/data/site/page-options';

/**
 * Tests unitaires — famille « liens internes cassés » du diagnostic de santé du
 * contenu : liste blanche des routes servies et dédoublonnage des anomalies.
 */

/** Href public d'une entrée du catalogue canonique (`/` inclus). */
function catalogHref(value: string): string {
    return value === '/' ? '/' : `/${value}`;
}

function navItem(href: string, label = 'Lien'): never {
    return { id: `n-${label}`, label, href, type: 'link', order: 1, is_visible: true } as never;
}

function footerLink(href: string, label = 'Lien'): never {
    return { id: `f-${label}`, label, href, order: 1, is_visible: true } as never;
}

function footerWith(href: string): ReturnType<typeof makeFooter> {
    return makeFooter({
        columns: [{ id: 'c1', title: 'Liens', links: [footerLink(href)] } as never],
    });
}

describe('analyzeContentHealth — liste blanche des routes servies', () => {
    it('ne signale aucun lien cassé pour les routes réellement servies', () => {
        const items = SITE_PAGE_CATALOG.map((entry) =>
            navItem(catalogHref(entry.value), entry.label)
        );
        const report = analyzeContentHealth(baseInput({ navigation: makeNav({ items }) }));

        expect(report.issues.filter((issue) => issue.kind === 'broken-link')).toHaveLength(0);
    });

    it('couvre les routes servies auparavant omises par la liste codée en dur', () => {
        const served = [
            '/visite-guidee',
            '/visite-virtuelle',
            '/videos-cascadeur',
            '/cuc-events-agence',
            '/spectacles-cascadeurs-yamakasi',
            '/animations-airbag-parkour',
            '/stunt-workshop-cuc',
        ];
        served.forEach((route) => expect(STATIC_ROUTES.has(route)).toBe(true));
    });

    it('n’exempte plus la route fantôme /visite, qui n’est servie par aucune route', () => {
        expect(STATIC_ROUTES.has('/visite')).toBe(false);

        const report = analyzeContentHealth(
            baseInput({ navigation: makeNav({ items: [navItem('/visite')] }) })
        );
        expect(report.issues.filter((issue) => issue.kind === 'broken-link')).toHaveLength(1);
    });
});

describe('analyzeContentHealth — dédoublonnage des anomalies', () => {
    it('ne pénalise qu’une fois un même href cassé présent en navigation et en pied de page', () => {
        const report = analyzeContentHealth(
            baseInput({
                navigation: makeNav({ items: [navItem('/nope', 'A')] }),
                footer: footerWith('/nope'),
            })
        );

        const broken = report.issues.filter((issue) => issue.kind === 'broken-link');
        expect(broken).toHaveLength(1);
        expect(report.counts['broken-link']).toBe(1);
        expect(report.severityCounts.error).toBe(1);
        // Une seule erreur → 100 - 10 = 90 (et non 80).
        expect(report.score).toBe(90);
    });

    it('compte bien deux liens cassés distincts', () => {
        const report = analyzeContentHealth(
            baseInput({
                navigation: makeNav({ items: [navItem('/nope-a', 'A')] }),
                footer: footerWith('/nope-b'),
            })
        );

        expect(report.issues.filter((issue) => issue.kind === 'broken-link')).toHaveLength(2);
        expect(report.score).toBe(80);
    });
});
