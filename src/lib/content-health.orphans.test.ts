import { analyzeContentHealth } from './content-health';
import { baseInput, makeFooter, makeNav, makePage } from './content-health.fixtures';
import type { SiteSocialLink } from '@/data/navigation';

/**
 * Tests unitaires — familles « contenu orphelin » du diagnostic de santé du
 * contenu (pages publiées non référencées, réseaux sociaux sans URL).
 */

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

    /**
     * Forme réelle observée en base : `site_pages.slug` est stocké SANS slash
     * initial (« visite-guidee ») alors que `site_navigation` /
     * `site_footer` écrivent des `href` absolus (« /visite-guidee »).
     */
    it('ne signale pas orpheline une page dont le slug est sans slash et l’href de navigation absolu', () => {
        const report = analyzeContentHealth(
            baseInput({
                pages: [makePage({ slug: 'visite-guidee', title: 'Visite Guidée' })],
                navigation: makeNav({
                    items: [
                        {
                            id: 'campus',
                            label: 'LE CAMPUS',
                            href: '/visite-guidee',
                            type: 'link',
                            order: 1,
                            is_visible: true,
                        } as never,
                    ],
                }),
            })
        );

        expect(report.issues.filter((i) => i.kind === 'orphan')).toHaveLength(0);
    });

    it('ne signale pas orpheline une page atteignable par un lien de pied de page portant une ancre', () => {
        const report = analyzeContentHealth(
            baseInput({
                pages: [makePage({ slug: 'formation-de-cascadeur' })],
                footer: makeFooter({
                    columns: [
                        {
                            id: 'formations',
                            title: 'Formations',
                            links: [
                                {
                                    id: 'formation-pro',
                                    label: 'Formation Pro',
                                    href: '/formation-de-cascadeur#formation-pro',
                                } as never,
                            ],
                        } as never,
                    ],
                }),
            })
        );

        expect(report.issues.filter((i) => i.kind === 'orphan')).toHaveLength(0);
    });

    it('signale toujours orpheline une page au slug sans slash absente de la navigation', () => {
        const report = analyzeContentHealth(
            baseInput({
                pages: [makePage({ slug: 'page-fantome', title: 'Page fantôme' })],
                navigation: makeNav({ items: [] }),
            })
        );

        const orphans = report.issues.filter((i) => i.kind === 'orphan');
        expect(orphans).toHaveLength(1);
        expect(orphans[0].value).toBe('/page-fantome');
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
