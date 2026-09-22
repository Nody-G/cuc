import { analyzeContentHealth } from './content-health';
import { baseInput, makeFooter, makeNav, makePage } from './content-health.fixtures';

/**
 * Tests unitaires — familles « liens internes cassés » du diagnostic de
 * santé du contenu (routes statiques, pages CMS, CTA, navigation, footer).
 */

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
