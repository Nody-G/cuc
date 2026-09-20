import { analyzeContentHealth } from './content-health';
import type { ContentHealthInput } from './content-health';
import type { SitePageContent, SitePartner, SiteEvent } from '@/lib/data/site-service';
import type { NavigationStructure, FooterStructure, SiteSocialLink } from '@/data/navigation';

/**
 * Tests unitaires du diagnostic de santé du contenu.
 *
 * Le module est pur : il reçoit l'état complet du contenu et retourne une
 * liste d'anomalies. Ces tests couvrent les quatre familles détectées
 * (lien cassé, image manquante, orphelin, SEO) ainsi que le calcul du score.
 */

function makePage(overrides: Partial<SitePageContent> = {}): SitePageContent {
    return {
        slug: '/test',
        title: 'Page de test',
        is_published: true,
        meta_title: 'Un titre SEO suffisamment long',
        meta_description:
            'Une méta-description factuelle et suffisamment longue pour dépasser le seuil minimal de cinquante caractères.',
        og_image: '/images/og/test.png',
        ...overrides,
    } as SitePageContent;
}

function makeNav(overrides: Partial<NavigationStructure> = {}): NavigationStructure {
    return {
        items: [],
        ...overrides,
    } as NavigationStructure;
}

function makeFooter(overrides: Partial<FooterStructure> = {}): FooterStructure {
    return {
        columns: [],
        ...overrides,
    } as FooterStructure;
}

function baseInput(overrides: Partial<ContentHealthInput> = {}): ContentHealthInput {
    return {
        pages: [],
        navigation: null,
        footer: null,
        socialLinks: [],
        partners: [],
        events: [],
        settings: null,
        ...overrides,
    };
}

describe('analyzeContentHealth — contenu sain', () => {
    it('retourne un score de 100 et aucune anomalie sur un contenu propre', () => {
        const report = analyzeContentHealth(
            baseInput({
                pages: [makePage({ slug: '/', title: 'Accueil' })],
            })
        );

        expect(report.issues).toEqual([]);
        expect(report.score).toBe(100);
        expect(report.counts['broken-link']).toBe(0);
        expect(report.counts['missing-image']).toBe(0);
        expect(report.counts.orphan).toBe(0);
        expect(report.counts.seo).toBe(0);
    });
});

describe('analyzeContentHealth — liens internes cassés', () => {
    it('signale un lien de navigation sans route correspondante', () => {
        const report = analyzeContentHealth(
            baseInput({
                navigation: makeNav({
                    items: [{ id: 'n1', label: 'Page fantôme', href: '/page-inexistante' } as never],
                }),
            })
        );

        const broken = report.issues.filter((i) => i.kind === 'broken-link');
        expect(broken).toHaveLength(1);
        expect(broken[0].severity).toBe('error');
        expect(broken[0].value).toBe('/page-inexistante');
        expect(broken[0].scope).toBe('Navigation');
    });

    it('accepte les routes statiques connues', () => {
        const report = analyzeContentHealth(
            baseInput({
                navigation: makeNav({
                    items: [{ id: 'n1', label: 'Partenaires', href: '/partenaires' } as never],
                }),
            })
        );
        expect(report.issues.filter((i) => i.kind === 'broken-link')).toHaveLength(0);
    });

    it('accepte un lien pointant vers une page CMS existante', () => {
        const report = analyzeContentHealth(
            baseInput({
                pages: [makePage({ slug: '/ma-page-cms', title: 'Ma page' })],
                navigation: makeNav({
                    items: [{ id: 'n1', label: 'Ma page', href: '/ma-page-cms' } as never],
                }),
            })
        );
        expect(report.issues.filter((i) => i.kind === 'broken-link')).toHaveLength(0);
    });

    it('ignore les liens externes, ancres et requêtes', () => {
        const report = analyzeContentHealth(
            baseInput({
                navigation: makeNav({
                    items: [
                        { id: 'n1', label: 'Externe', href: 'https://example.org/x' } as never,
                        { id: 'n2', label: 'Ancre', href: '#section' } as never,
                        { id: 'n3', label: 'Requête', href: '?q=1' } as never,
                        { id: 'n4', label: 'Mail', href: 'mailto:contact@cuc.fr' } as never,
                    ],
                }),
            })
        );
        expect(report.issues.filter((i) => i.kind === 'broken-link')).toHaveLength(0);
    });

    it('détecte un lien cassé dans le pied de page et le CTA de navigation', () => {
        const report = analyzeContentHealth(
            baseInput({
                navigation: makeNav({
                    cta: { label: 'S’inscrire', href: '/inscription-inexistante' } as never,
                }),
                footer: makeFooter({
                    columns: [
                        {
                            id: 'c1',
                            title: 'Liens',
                            links: [{ id: 'l1', label: 'Cassé', href: '/footer-casse' } as never],
                        } as never,
                    ],
                }),
            })
        );

        const broken = report.issues.filter((i) => i.kind === 'broken-link');
        expect(broken).toHaveLength(2);
        expect(broken.some((i) => i.scope === 'Navigation (CTA)')).toBe(true);
        expect(broken.some((i) => i.scope === 'Pied de page')).toBe(true);
    });

    it('détecte un CTA de page cassé', () => {
        const report = analyzeContentHealth(
            baseInput({
                pages: [
                    makePage({
                        slug: '/accueil',
                        title: 'Accueil',
                        hero: {
                            cta_primary_text: 'Nous contacter',
                            cta_primary_link: '/contact-casse',
                        } as never,
                    }),
                ],
            })
        );

        const broken = report.issues.filter((i) => i.kind === 'broken-link');
        expect(broken).toHaveLength(1);
        expect(broken[0].scope).toContain('Accueil');
    });
});

describe('analyzeContentHealth — images manquantes', () => {
    it('signale une image vide ou de substitution', () => {
        const report = analyzeContentHealth(
            baseInput({
                pages: [makePage({ slug: '/a', og_image: 'https://via.placeholder.com/1200' })],
            })
        );

        const missing = report.issues.filter((i) => i.kind === 'missing-image');
        expect(missing).toHaveLength(1);
        expect(missing[0].severity).toBe('warning');
    });

    it('signale un fichier local introuvable quand la liste des assets est fournie', () => {
        const report = analyzeContentHealth(
            baseInput({
                pages: [makePage({ slug: '/a', og_image: '/images/absent.png' })],
                knownPublicAssets: ['/images/present.png'],
            })
        );

        const missing = report.issues.filter((i) => i.kind === 'missing-image');
        expect(missing).toHaveLength(1);
        expect(missing[0].severity).toBe('error');
        expect(missing[0].value).toBe('/images/absent.png');
    });

    it('ne signale rien si le fichier local existe', () => {
        const report = analyzeContentHealth(
            baseInput({
                pages: [makePage({ slug: '/a', og_image: '/images/present.png' })],
                knownPublicAssets: ['/images/present.png'],
            })
        );
        expect(report.issues.filter((i) => i.kind === 'missing-image')).toHaveLength(0);
    });

    it('ignore les images externes valides', () => {
        const report = analyzeContentHealth(
            baseInput({
                pages: [makePage({ slug: '/a', og_image: 'https://cdn.example.org/photo.jpg' })],
                knownPublicAssets: [],
            })
        );
        expect(report.issues.filter((i) => i.kind === 'missing-image')).toHaveLength(0);
    });

    it('contrôle les logos de partenaires et les visuels d’événements', () => {
        const report = analyzeContentHealth(
            baseInput({
                // Une URL vide est considérée comme « non renseignée » et ignorée ;
                // un placeholder explicite est en revanche signalé.
                partners: [{ id: 'p1', name: 'Partenaire', logo_url: '#' } as SitePartner],
                events: [{ id: 'e1', title: 'Événement', image_url: 'https://via.placeholder.com/600' } as SiteEvent],
            })
        );

        const missing = report.issues.filter((i) => i.kind === 'missing-image');
        expect(missing).toHaveLength(2);
        expect(missing.some((i) => i.scope === 'Partenaire')).toBe(true);
        expect(missing.some((i) => i.scope === 'Événement')).toBe(true);
    });

    it('ignore une image non renseignée (chaîne vide)', () => {
        const report = analyzeContentHealth(
            baseInput({
                partners: [{ id: 'p1', name: 'Partenaire', logo_url: '' } as SitePartner],
            })
        );
        expect(report.issues.filter((i) => i.kind === 'missing-image')).toHaveLength(0);
    });
});

describe('analyzeContentHealth — contenu orphelin', () => {
    it('signale une page publiée non référencée dans la navigation', () => {
        const report = analyzeContentHealth(
            baseInput({
                pages: [makePage({ slug: '/orpheline', title: 'Orpheline' })],
                navigation: makeNav({ items: [] }),
            })
        );

        const orphans = report.issues.filter((i) => i.kind === 'orphan');
        expect(orphans).toHaveLength(1);
        expect(orphans[0].severity).toBe('warning');
        expect(orphans[0].value).toBe('/orpheline');
    });

    it('ne signale pas une page atteignable depuis le pied de page', () => {
        const report = analyzeContentHealth(
            baseInput({
                pages: [makePage({ slug: '/accessible', title: 'Accessible' })],
                footer: makeFooter({
                    columns: [
                        {
                            id: 'c1',
                            title: 'Liens',
                            links: [{ id: 'l1', label: 'Accessible', href: '/accessible' } as never],
                        } as never,
                    ],
                }),
            })
        );
        expect(report.issues.filter((i) => i.kind === 'orphan')).toHaveLength(0);
    });

    it('ne signale jamais la racine comme orpheline', () => {
        const report = analyzeContentHealth(
            baseInput({ pages: [makePage({ slug: '/', title: 'Accueil' })] })
        );
        expect(report.issues.filter((i) => i.kind === 'orphan')).toHaveLength(0);
    });

    it('ignore les pages non publiées', () => {
        const report = analyzeContentHealth(
            baseInput({ pages: [makePage({ slug: '/brouillon', is_published: false })] })
        );
        expect(report.issues.filter((i) => i.kind === 'orphan')).toHaveLength(0);
    });

    it('signale un réseau social sans URL exploitable', () => {
        const report = analyzeContentHealth(
            baseInput({
                socialLinks: [{ id: 's1', platform: 'instagram', url: '' } as SiteSocialLink],
            })
        );

        const orphans = report.issues.filter((i) => i.kind === 'orphan');
        expect(orphans).toHaveLength(1);
        expect(orphans[0].severity).toBe('info');
        expect(orphans[0].scope).toBe('Réseaux sociaux');
    });
});

describe('analyzeContentHealth — métadonnées SEO', () => {
    it('signale un titre SEO absent ou trop court', () => {
        const report = analyzeContentHealth(
            baseInput({ pages: [makePage({ slug: '/a', meta_title: 'Court' })] })
        );
        const seo = report.issues.filter((i) => i.kind === 'seo' && i.label === 'Titre SEO');
        expect(seo).toHaveLength(1);
        expect(seo[0].severity).toBe('warning');
    });

    it('signale un titre SEO trop long en information', () => {
        const report = analyzeContentHealth(
            baseInput({ pages: [makePage({ slug: '/a', meta_title: 'T'.repeat(80) })] })
        );
        const seo = report.issues.filter((i) => i.kind === 'seo' && i.label === 'Titre SEO');
        expect(seo).toHaveLength(1);
        expect(seo[0].severity).toBe('info');
    });

    it('signale une méta-description trop courte', () => {
        const report = analyzeContentHealth(
            baseInput({ pages: [makePage({ slug: '/a', meta_description: 'Trop court.' })] })
        );
        const seo = report.issues.filter((i) => i.kind === 'seo' && i.label === 'Méta-description');
        expect(seo).toHaveLength(1);
        expect(seo[0].severity).toBe('warning');
    });

    it('signale l’absence d’image Open Graph en information', () => {
        const report = analyzeContentHealth(
            baseInput({ pages: [makePage({ slug: '/a', og_image: undefined })] })
        );
        const seo = report.issues.filter((i) => i.kind === 'seo' && i.label === 'Image Open Graph');
        expect(seo).toHaveLength(1);
        expect(seo[0].severity).toBe('info');
    });

    it('n’analyse pas le SEO des pages non publiées', () => {
        const report = analyzeContentHealth(
            baseInput({
                pages: [
                    makePage({
                        slug: '/brouillon',
                        is_published: false,
                        meta_title: '',
                        meta_description: '',
                        og_image: undefined,
                    }),
                ],
            })
        );
        expect(report.issues.filter((i) => i.kind === 'seo')).toHaveLength(0);
    });
});

describe('analyzeContentHealth — agrégation et score', () => {
    it('compte les anomalies par famille et par sévérité', () => {
        const report = analyzeContentHealth(
            baseInput({
                pages: [makePage({ slug: '/orpheline', meta_title: 'Court' })],
                navigation: makeNav({
                    items: [{ id: 'n1', label: 'Cassé', href: '/nope' } as never],
                }),
            })
        );

        expect(report.counts['broken-link']).toBe(1);
        expect(report.counts.orphan).toBe(1);
        expect(report.counts.seo).toBeGreaterThanOrEqual(1);
        expect(report.severityCounts.error).toBe(1);
        expect(report.severityCounts.warning).toBeGreaterThanOrEqual(2);
    });

    it('déduit le score du poids des sévérités (error = 10, warning = 4, info = 1)', () => {
        // Une seule erreur → 100 - 10 = 90.
        const report = analyzeContentHealth(
            baseInput({
                navigation: makeNav({
                    items: [{ id: 'n1', label: 'Cassé', href: '/nope' } as never],
                }),
            })
        );
        expect(report.score).toBe(90);
    });

    it('borne le score à 0 quand les anomalies s’accumulent', () => {
        const manyBroken = Array.from({ length: 20 }, (_, i) => ({
            id: `n${i}`,
            label: `Cassé ${i}`,
            href: `/nope-${i}`,
        }));
        const report = analyzeContentHealth(
            baseInput({ navigation: makeNav({ items: manyBroken as never }) })
        );
        expect(report.score).toBe(0);
    });

    it('expose un horodatage de contrôle', () => {
        const report = analyzeContentHealth(baseInput());
        expect(typeof report.checkedAt).toBe('string');
        expect(Number.isNaN(new Date(report.checkedAt).getTime())).toBe(false);
    });

    it('génère des identifiants d’anomalie stables et déterministes', () => {
        const report = analyzeContentHealth(
            baseInput({
                navigation: makeNav({
                    items: [
                        { id: 'n1', label: 'A', href: '/nope-a' } as never,
                        { id: 'n2', label: 'B', href: '/nope-b' } as never,
                    ],
                }),
            })
        );
        const ids = report.issues.map((i) => i.id);
        // Deux liens distincts → deux identifiants distincts.
        expect(new Set(ids).size).toBe(ids.length);
        // L'identifiant encode le type, le périmètre et la valeur fautive.
        expect(ids).toContain('broken-link:Navigation:/nope-a');
        expect(ids).toContain('broken-link:Navigation:/nope-b');
    });

    it('déduplique deux anomalies strictement identiques (même type, périmètre et valeur)', () => {
        const report = analyzeContentHealth(
            baseInput({
                navigation: makeNav({
                    items: [
                        { id: 'n1', label: 'A', href: '/nope' } as never,
                        { id: 'n2', label: 'B', href: '/nope' } as never,
                    ],
                }),
            })
        );
        // Les deux entrées produisent la même clé : le diagnostic les fusionne
        // volontairement pour éviter le bruit dans le rapport.
        const ids = report.issues.map((i) => i.id);
        expect(new Set(ids).size).toBe(1);
    });
});
