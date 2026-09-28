import { extractShortcode } from './instagram-reel-meta';

describe('instagram-reel-meta', () => {
    it('extractShortcode extrait correctement le shortcode de différentes URLs Instagram', () => {
        expect(extractShortcode('https://www.instagram.com/reel/DdEoOcyM-We/')).toBe('DdEoOcyM-We');
        expect(extractShortcode('https://www.instagram.com/p/Dc80NYLMv1Y/')).toBe('Dc80NYLMv1Y');
        expect(extractShortcode('https://instagram.com/tv/Dcqh0VisRnc/')).toBe('Dcqh0VisRnc');
        expect(extractShortcode('')).toBeNull();
        expect(extractShortcode('https://example.com/other')).toBeNull();
    });
});
