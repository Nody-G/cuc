import { extractInstagramShortcode, decodeInstagramEntities } from '@/lib/instagram-utils';

describe('extractInstagramShortcode', () => {
    it('extrait le shortcode depuis une URL /reel/', () => {
        expect(extractInstagramShortcode('https://www.instagram.com/reel/DJW5wq0MIzt/')).toBe('DJW5wq0MIzt');
        expect(extractInstagramShortcode('https://instagram.com/reel/DKAFa9dsRVa')).toBe('DKAFa9dsRVa');
    });

    it('extrait le shortcode depuis une URL /p/', () => {
        expect(extractInstagramShortcode('https://www.instagram.com/p/C-12345/')).toBe('C-12345');
    });

    it('renvoie null pour une URL invalide ou vide', () => {
        expect(extractInstagramShortcode('')).toBeNull();
        expect(extractInstagramShortcode('https://youtube.com/watch?v=123')).toBeNull();
        expect(extractInstagramShortcode('https://www.instagram.com/campus.univers.cascades/')).toBeNull();
    });
});

describe('decodeInstagramEntities', () => {
    it('décode les entités html', () => {
        expect(decodeInstagramEntities('&quot;Hello&quot; &#039;World&#039; &amp; CUC')).toBe('"Hello" \'World\' & CUC');
    });
});
