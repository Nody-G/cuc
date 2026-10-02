/**
 * Tests du domaine « résolution d'embed vidéo ».
 *
 * Aucun import de `vitest` : `globals: true` est activé dans `vitest.config.mts`
 * (convention du dépôt).
 */

import { resolveEmbedUrl, resolveVideoMedia } from './video-embed';

describe('resolveEmbedUrl', () => {
    it('renvoie un embed vide pour une référence absente', () => {
        expect(resolveEmbedUrl('')).toEqual({ kind: 'iframe', url: '', provider: 'unknown' });
        expect(resolveEmbedUrl('   ')).toEqual({ kind: 'iframe', url: '', provider: 'unknown' });
    });

    it('traite un fichier mp4 comme une balise video', () => {
        const embed = resolveEmbedUrl('https://cdn.example.com/reportage.mp4');
        expect(embed.kind).toBe('video');
        expect(embed.provider).toBe('file');
        expect(embed.url).toBe('https://cdn.example.com/reportage.mp4');
    });

    it('traite un fichier webm (avec query) comme une balise video', () => {
        const embed = resolveEmbedUrl('https://cdn.example.com/reportage.webm?_=2');
        expect(embed.kind).toBe('video');
        expect(embed.provider).toBe('file');
    });

    it('résout un identifiant Dailymotion nu (x…) en lecteur embed', () => {
        const embed = resolveEmbedUrl('x9uewe0');
        expect(embed.kind).toBe('iframe');
        expect(embed.provider).toBe('dailymotion');
        expect(embed.url).toBe('https://www.dailymotion.com/embed/video/x9uewe0?autoplay=1&mute=1');
        expect(embed.watchUrl).toBe('https://www.dailymotion.com/video/x9uewe0');
    });

    it('résout un identifiant Dailymotion nu (k…) en lecteur embed', () => {
        const embed = resolveEmbedUrl('k2LHEg1AIHtIfYxkvcz');
        expect(embed.provider).toBe('dailymotion');
        expect(embed.url).toContain('/embed/video/k2LHEg1AIHtIfYxkvcz');
    });

    it('résout une URL Dailymotion de visionnage en lecteur embed', () => {
        const embed = resolveEmbedUrl('https://www.dailymotion.com/video/x8581s9');
        expect(embed.provider).toBe('dailymotion');
        expect(embed.url).toBe('https://www.dailymotion.com/embed/video/x8581s9?autoplay=1&mute=1');
    });

    it('résout une URL YouTube longue en embed sans cookie', () => {
        const embed = resolveEmbedUrl('https://www.youtube.com/watch?v=X1LJN9AswpU');
        expect(embed.provider).toBe('youtube');
        expect(embed.url).toBe('https://www.youtube-nocookie.com/embed/X1LJN9AswpU?autoplay=1&rel=0');
        expect(embed.watchUrl).toBe('https://www.youtube.com/watch?v=X1LJN9AswpU');
    });

    it('résout une URL youtu.be courte en embed sans cookie', () => {
        const embed = resolveEmbedUrl('https://youtu.be/-jVwT--LbHA');
        expect(embed.provider).toBe('youtube');
        expect(embed.url).toContain('youtube-nocookie.com/embed/-jVwT--LbHA');
    });

    it('résout un Reel Instagram en embed vertical', () => {
        const embed = resolveEmbedUrl('https://www.instagram.com/reel/DdWhAaRsaBa/');
        expect(embed.provider).toBe('instagram');
        expect(embed.url).toBe('https://www.instagram.com/reel/DdWhAaRsaBa/embed/');
        expect(embed.watchUrl).toBe('https://www.instagram.com/reel/DdWhAaRsaBa/');
    });

    it('laisse passer toute autre URL http(s) en iframe brute', () => {
        const embed = resolveEmbedUrl('https://player.example.com/abc');
        expect(embed.kind).toBe('iframe');
        expect(embed.provider).toBe('external');
        expect(embed.url).toBe('https://player.example.com/abc');
    });

    it('ne fabrique aucun embed à partir d’un jeton inconnu', () => {
        const embed = resolveEmbedUrl('video-inconnue');
        expect(embed.url).toBe('');
        expect(embed.provider).toBe('unknown');
    });
});

describe('resolveVideoMedia', () => {
    it('expose contentUrl pour un fichier servi directement', () => {
        expect(resolveVideoMedia('https://cdn.example.com/a.mp4')).toEqual({
            contentUrl: 'https://cdn.example.com/a.mp4',
        });
    });

    it('expose embedUrl pour un lecteur Dailymotion', () => {
        expect(resolveVideoMedia('x9uewe0')).toEqual({
            embedUrl: 'https://www.dailymotion.com/embed/video/x9uewe0?autoplay=1&mute=1',
        });
    });

    it('n’expose rien pour une référence inexploitable', () => {
        expect(resolveVideoMedia('jeton-inconnu')).toEqual({});
    });
});
