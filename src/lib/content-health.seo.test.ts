import { analyzeContentHealth } from './content-health';
import { baseInput, makePage } from './content-health.fixtures';

/**
 * Tests unitaires — familles « métadonnées SEO » du diagnostic de santé du
 * contenu (titres, méta-descriptions, image Open Graph).
 */

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
