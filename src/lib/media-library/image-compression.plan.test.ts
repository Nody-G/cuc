/**
 * Tests du domaine pur de compression — géométrie, décision, gain, nommage.
 *
 * Aucun import de `vitest` : `globals: true` est activé dans
 * `vitest.config.mts` (convention du dépôt).
 */

import {
    compressionGain,
    extensionOf,
    isAlreadyLean,
    isRasterCompressible,
    planCompression,
    replaceExtension,
    sanitizeFileName,
    shouldKeepCompressed,
    stampedPath,
    targetBox,
    webpFileName,
} from './image-compression.plan';
import { COMPRESSION_PROFILES } from './media-policy';

describe('targetBox', () => {
    it('ramène le bord long à la cible en conservant le rapport', () => {
        const box = targetBox({ width: 4032, height: 3024 }, 2560);
        expect(box.width).toBe(2560);
        expect(box.height).toBe(1920);
        expect(box.scale).toBeCloseTo(0.6349, 4);
    });

    it('traite une photo verticale par son bord long', () => {
        const box = targetBox({ width: 3024, height: 4032 }, 2560);
        expect(box.width).toBe(1920);
        expect(box.height).toBe(2560);
    });

    it('n’agrandit jamais une image plus petite que la cible', () => {
        expect(targetBox({ width: 1200, height: 800 }, 2560)).toEqual({ width: 1200, height: 800, scale: 1 });
    });

    it('ne redimensionne pas quand la cible vaut 0', () => {
        expect(targetBox({ width: 4032, height: 3024 }, 0).scale).toBe(1);
    });

    it('ne produit jamais une dimension nulle', () => {
        const box = targetBox({ width: 4000, height: 2 }, 100);
        expect(box.height).toBeGreaterThanOrEqual(1);
    });
});

describe('isRasterCompressible', () => {
    it('accepte les rasters réencodables', () => {
        expect(isRasterCompressible('image/jpeg')).toBe(true);
        expect(isRasterCompressible('image/png')).toBe(true);
        expect(isRasterCompressible('image/webp')).toBe(true);
    });

    it('laisse passer animation, vectoriel et AVIF déjà optimisé', () => {
        expect(isRasterCompressible('image/gif')).toBe(false);
        expect(isRasterCompressible('image/svg+xml')).toBe(false);
        expect(isRasterCompressible('image/avif')).toBe(false);
    });

    it('se rabat sur l’extension quand le type est absent', () => {
        expect(isRasterCompressible('', 'Photo.JPG')).toBe(true);
        expect(isRasterCompressible('', 'schema.svg')).toBe(false);
    });
});

describe('isAlreadyLean', () => {
    it('considère légère une petite image déjà bien dimensionnée', () => {
        expect(isAlreadyLean({ bytes: 90_000, width: 1200, height: 800 }, COMPRESSION_PROFILES.web)).toBe(true);
    });

    it('réencode une petite image trop grande pour la cible', () => {
        expect(isAlreadyLean({ bytes: 90_000, width: 4032, height: 3024 }, COMPRESSION_PROFILES.web)).toBe(false);
    });

    it('réencode une image lourde même bien dimensionnée', () => {
        expect(isAlreadyLean({ bytes: 900_000, width: 1200, height: 800 }, COMPRESSION_PROFILES.web)).toBe(false);
    });
});

describe('planCompression', () => {
    it('décide la compression d’une photo de téléphone', () => {
        const decision = planCompression(
            { bytes: 8_000_000, width: 4032, height: 3024, mime: 'image/jpeg', name: 'IMG_4821.jpg' },
            COMPRESSION_PROFILES.web,
        );
        expect(decision.compress).toBe(true);
        expect(decision.reason).toBe('compressible');
        expect(decision.box?.width).toBe(2560);
    });

    it('refuse de réencoder un SVG', () => {
        const decision = planCompression(
            { bytes: 20_000, width: 512, height: 512, mime: 'image/svg+xml', name: 'logo.svg' },
            COMPRESSION_PROFILES.logo,
        );
        expect(decision.compress).toBe(false);
        expect(decision.reason).toBe('not-a-raster-image');
        expect(decision.box).toBeNull();
    });

    it('respecte un profil sans recompression', () => {
        const decision = planCompression(
            { bytes: 8_000_000, width: 4032, height: 3024, mime: 'image/jpeg', name: 'brut.jpg' },
            COMPRESSION_PROFILES.passthrough,
        );
        expect(decision.compress).toBe(false);
        expect(decision.reason).toBe('profile-is-passthrough');
    });

    it('épargne une image déjà légère et bien dimensionnée', () => {
        const decision = planCompression(
            { bytes: 80_000, width: 1200, height: 800, mime: 'image/jpeg', name: 'vignette.jpg' },
            COMPRESSION_PROFILES.web,
        );
        expect(decision.compress).toBe(false);
        expect(decision.reason).toBe('already-lean');
        expect(decision.box?.scale).toBe(1);
    });
});

describe('compressionGain', () => {
    it('chiffre une économie franche', () => {
        const gain = compressionGain(8_000_000, 500_000);
        expect(gain.savedBytes).toBe(7_500_000);
        expect(gain.ratio).toBeCloseTo(0.9375, 4);
        expect(gain.label).toBe('-94 %');
    });

    it('signale un dérivé plus lourd au lieu de mentir', () => {
        const gain = compressionGain(1_000_000, 1_030_000);
        expect(gain.savedBytes).toBe(0);
        expect(gain.ratio).toBe(0);
        expect(gain.label).toBe('+3 %');
    });

    it('ne divise pas par zéro', () => {
        expect(compressionGain(0, 0).label).toBe('0 %');
        expect(compressionGain(0, 0).ratio).toBe(0);
    });
});

describe('shouldKeepCompressed', () => {
    it('garde le dérivé quand le gain dépasse le seuil', () => {
        expect(shouldKeepCompressed(100_000, 50_000)).toBe(true);
    });

    it('écarte un dérivé au gain négligeable', () => {
        expect(shouldKeepCompressed(100_000, 95_000)).toBe(false);
    });

    it('écarte un dérivé vide ou absurde', () => {
        expect(shouldKeepCompressed(100_000, 0)).toBe(false);
        expect(shouldKeepCompressed(0, 0)).toBe(false);
    });
});

describe('nommage', () => {
    it('retire accents et majuscules, remplace le reste', () => {
        expect(sanitizeFileName('Photo Été.JPG')).toBe('photo_ete.jpg');
        expect(sanitizeFileName('Mon Image (1).PNG')).toBe('mon_image__1_.png');
    });

    it('impose le WebP pour le dérivé servi', () => {
        expect(webpFileName('Photo Été.JPG')).toBe('photo_ete.webp');
        expect(webpFileName('affiche.png')).toBe('affiche.webp');
    });

    it('lit et remplace une extension, y compris absente', () => {
        expect(extensionOf('media/x/photo.JPEG')).toBe('jpeg');
        expect(extensionOf('photo')).toBe('');
        expect(replaceExtension('photo', 'webp')).toBe('photo.webp');
    });

    it('horodate le chemin selon le contrat de la médiathèque', () => {
        expect(stampedPath('media/cuc-visual', 'photo.webp', 1759000000000)).toBe(
            'media/cuc-visual/1759000000000_photo.webp',
        );
        expect(stampedPath('/media/cuc-visual/', 'x.webp', 1)).toBe('media/cuc-visual/1_x.webp');
        expect(stampedPath('', 'x.webp', 1)).toBe('1_x.webp');
    });
});
