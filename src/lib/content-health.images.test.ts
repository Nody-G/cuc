import { analyzeContentHealth } from './content-health';
import { baseInput, makePage } from './content-health.fixtures';
import type { SitePartner, SiteEvent } from '@/lib/data/site-service';

/**
 * Tests unitaires — familles « images manquantes » du diagnostic de santé du
 * contenu (placeholders, assets locaux, partenaires, événements).
 */

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
