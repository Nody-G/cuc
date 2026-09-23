import { hasSupabaseAuthCookie, isPreviewPath } from './preview-guard';

describe('isPreviewPath', () => {
    it('couvre la locale par défaut (sans préfixe) et l’anglais', () => {
        expect(isPreviewPath('/preview')).toBe(true);
        expect(isPreviewPath('/preview/formation-de-cascadeur')).toBe(true);
        expect(isPreviewPath('/en/preview')).toBe(true);
        expect(isPreviewPath('/en/preview/formation-de-cascadeur')).toBe(true);
    });

    it('ne touche ni la vitrine ni les chemins qui ressemblent', () => {
        expect(isPreviewPath('/formation-de-cascadeur')).toBe(false);
        expect(isPreviewPath('/previsions')).toBe(false);
        expect(isPreviewPath('/en/previews')).toBe(false);
        expect(isPreviewPath('/admin/preview')).toBe(false);
        expect(isPreviewPath('/previewer')).toBe(false);
    });
});

describe('hasSupabaseAuthCookie', () => {
    it('détecte le cookie de session Supabase (y compris découpé)', () => {
        expect(hasSupabaseAuthCookie('sb-xkbkcsypftvspmkfnrfm-auth-token=abc')).toBe(true);
        expect(
            hasSupabaseAuthCookie('theme=dark; sb-xkbkcsypftvspmkfnrfm-auth-token.0=part1; a=b')
        ).toBe(true);
    });

    it('refuse l’absence de cookie ou un cookie étranger', () => {
        expect(hasSupabaseAuthCookie(null)).toBe(false);
        expect(hasSupabaseAuthCookie('')).toBe(false);
        expect(hasSupabaseAuthCookie('NEXT_LOCALE=fr; theme=dark')).toBe(false);
    });
});
