/**
 * Tests de la politique média — profils, plafonds, préfixes réservés.
 *
 * Aucun import de `vitest` : `globals: true` est activé dans
 * `vitest.config.mts` (convention du dépôt).
 */

import {
    COMPRESSION_PROFILES,
    MEDIA_LIMITS,
    acceptsMime,
    describeCeilingRefusal,
    isReservedPrefix,
    mediaNature,
    originalRetentionAllowed,
    profileForPath,
    uploadCeilingBytes,
} from './media-policy';

describe('profileForPath', () => {
    it('applique le profil web par défaut aux visuels courants', () => {
        expect(profileForPath('media/cuc-visual/Airbag-vert.webp').id).toBe('web');
    });

    it('réserve le profil logo aux logos partenaires', () => {
        expect(profileForPath('media/partner-logo/logo-cuc.png').id).toBe('logo');
    });

    it('réserve le profil plein écran au dossier hero', () => {
        expect(profileForPath('media/cuc-visual/hero/slider-5.jpg').id).toBe('hero');
    });

    it('réserve le profil portrait aux portraits et à l’équipe', () => {
        expect(profileForPath('media/cuc-visual/portraits/niels.jpg').id).toBe('portrait');
        expect(profileForPath('media/team/coach.jpg').id).toBe('portrait');
    });

    it('juge un négatif sur son chemin d’origine', () => {
        expect(profileForPath('_originals/media/partner-logo/logo-cuc.png').id).toBe('logo');
    });

    it('ne confond pas un dossier dont le nom contient le motif', () => {
        expect(profileForPath('media/cuc-visual/heroisme/photo.jpg').id).toBe('web');
    });
});

describe('profils de compression', () => {
    it('n’agrandit jamais et garde le WebP comme cible', () => {
        expect(COMPRESSION_PROFILES.web.maxLongEdge).toBe(2560);
        expect(COMPRESSION_PROFILES.hero.quality).toBeGreaterThanOrEqual(0.9);
        expect(COMPRESSION_PROFILES.passthrough.maxLongEdge).toBe(0);
    });

    it('ne fixe jamais une qualité supérieure à 1', () => {
        for (const profile of Object.values(COMPRESSION_PROFILES)) {
            expect(profile.quality).toBeLessThanOrEqual(1);
            expect(profile.quality).toBeGreaterThan(0);
        }
    });
});

describe('isReservedPrefix', () => {
    it('reconnaît les négatifs et la corbeille', () => {
        expect(isReservedPrefix('_originals/photo.jpg')).toBe(true);
        expect(isReservedPrefix('_trash/media/photo.jpg')).toBe(true);
    });

    it('laisse passer le catalogue éditorial', () => {
        expect(isReservedPrefix('media/cuc-visual/photo.jpg')).toBe(false);
        expect(isReservedPrefix('_original/photo.jpg')).toBe(false);
        expect(isReservedPrefix('')).toBe(false);
    });
});

describe('mediaNature', () => {
    it('déduit la nature du type MIME', () => {
        expect(mediaNature('image/jpeg', 'a.jpg')).toBe('image');
        expect(mediaNature('IMAGE/PNG', 'a.png')).toBe('image');
        expect(mediaNature('application/pdf', 'plaquette.pdf')).toBe('document');
    });

    it('retombe sur l’extension quand le type est générique', () => {
        expect(mediaNature('application/octet-stream', 'reportage.mp4')).toBe('video');
        expect(mediaNature('', 'clip.mov')).toBe('video');
    });

    it('renvoie null pour ce que la médiathèque n’accepte pas', () => {
        expect(mediaNature('application/zip', 'archive.zip')).toBeNull();
        expect(mediaNature('', 'sans-extension')).toBeNull();
    });
});

describe('plafonds', () => {
    it('double le plafond quand un négatif est conservé', () => {
        expect(uploadCeilingBytes('image', false)).toBe(MEDIA_LIMITS.image.maxBytes);
        expect(uploadCeilingBytes('image', true)).toBe(MEDIA_LIMITS.image.maxOriginalBytes);
    });

    it('ignore la conservation de négatif sur une nature qui n’en admet pas', () => {
        expect(uploadCeilingBytes('video', true)).toBe(MEDIA_LIMITS.video.maxBytes);
        expect(originalRetentionAllowed('video')).toBe(false);
        expect(originalRetentionAllowed('image')).toBe(true);
    });

    it('tolère un type absent ou générique, refuse un type étranger', () => {
        expect(acceptsMime('image', '')).toBe(true);
        expect(acceptsMime('video', 'application/octet-stream')).toBe(true);
        expect(acceptsMime('image', 'image/jpeg')).toBe(true);
        expect(acceptsMime('image', 'application/zip')).toBe(false);
    });
});

describe('describeCeilingRefusal', () => {
    it('chiffre le refus en Mo avec virgule française', () => {
        const message = describeCeilingRefusal(9_000_000, 8_000_000, false);
        expect(message).toContain('9,0 Mo');
        expect(message).toContain('8,0 Mo');
        expect(message).toContain('Compressez-le');
    });

    it('distingue le refus d’un négatif', () => {
        expect(describeCeilingRefusal(13_000_000, 12_000_000, true)).toContain('Négatif refusé');
    });
});
