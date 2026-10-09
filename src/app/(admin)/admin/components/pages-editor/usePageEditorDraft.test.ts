import { act, renderHook } from '@testing-library/react';
import { usePageEditorDraft } from './usePageEditorDraft';
import type { SitePageContent } from '@/lib/data/site-service';

// Mock useEntityTranslation to keep tests focused on draft orchestration
vi.mock('@/lib/hooks/useEntityTranslation', () => ({
    useEntityTranslation: ({ base }: { base: unknown }) => ({
        ready: true,
        loading: false,
        saving: false,
        dirty: false,
        localized: base,
        setLocalized: vi.fn(),
        save: vi.fn().mockResolvedValue({ success: true }),
        revert: vi.fn(),
        updatedAt: null,
        coverage: { missing: [], staleArrays: [] },
    }),
}));

const mockHomeFromDb: SitePageContent = {
    slug: '/',
    title: 'Accueil',
    meta_title: 'Campus Univers Cascades | SEO Meta',
    meta_description: 'Description SEO Google',
    hero: {
        title: 'CAMPUS UNIVERS COSCADES',
        badge: 'PREMIER CENTRE EUROPÉEN',
        since: 'depuis 2008',
        subtitle: 'Sous-titre depuis la base',
    },
    sections_data: {},
    layout_sections: [],
    is_published: true,
};

const mockStagesFromDb: SitePageContent = {
    slug: 'stages-cascades-parkour-2',
    title: 'Stages',
    meta_title: 'Stages Parkour & Cascades',
    meta_description: 'Description Stages',
    hero: {
        title: 'STAGES INTENSIFS',
        badge: 'PARKOUR & CASCADE',
        subtitle: 'Formation courte',
    },
    sections_data: {},
    layout_sections: [],
    is_published: true,
};

beforeEach(() => {
    localStorage.clear();
});

describe('usePageEditorDraft — synchronisation asynchrone et édition', () => {
    it('hydrate automatiquement formData lorsque les pages arrivent de Supabase après le montage', () => {
        // Initialement : pages est vide [] comme au chargement initial du Cockpit
        let pages: SitePageContent[] = [];
        const { result, rerender } = renderHook(
            ({ p, slug }) => usePageEditorDraft({ pages: p, selectedSlug: slug, editorLocale: 'fr' }),
            { initialProps: { p: pages, slug: '/' } }
        );

        // Au montage initial (pages vide), formData utilise le repli statique par défaut
        expect(result.current.formData.slug).toBe('/');
        expect(result.current.formData.hero.title).toBe('CAMPUS UNIVERS CASCADES');

        // Supabase répond et transmet la liste des pages réelles (avec le titre modifié "COSCADES")
        pages = [mockHomeFromDb, mockStagesFromDb];
        rerender({ p: pages, slug: '/' });

        // formData doit être synchronisé immédiatement avec la valeur réelle en base !
        expect(result.current.formData.hero.title).toBe('CAMPUS UNIVERS COSCADES');
        expect(result.current.savedData.hero.title).toBe('CAMPUS UNIVERS COSCADES');
        expect(result.current.draftChanges.length).toBe(0);
    });

    it('applique immédiatement les modifications de l’Aperçu en direct (handlePreviewFieldCommit)', () => {
        const pages = [mockHomeFromDb];
        const { result } = renderHook(() =>
            usePageEditorDraft({ pages, selectedSlug: '/', editorLocale: 'fr' })
        );

        expect(result.current.formData.hero.title).toBe('CAMPUS UNIVERS COSCADES');

        // Simulation de la saisie en direct dans le Mode Studio (Aperçu en direct)
        act(() => {
            result.current.handlePreviewFieldCommit('hero.title', 'CAMPUS UNIVERS CASCADES');
        });

        // formData doit refléter la modification immédiatement
        expect(result.current.formData.hero.title).toBe('CAMPUS UNIVERS CASCADES');
        expect(result.current.draftChanges.length).toBe(1);
        expect(result.current.draftChanges[0].path).toBe('hero.title');
    });

    it('bascule proprement le contenu lors du changement de page sélectionnée', () => {
        const pages = [mockHomeFromDb, mockStagesFromDb];
        const { result, rerender } = renderHook(
            ({ slug }) => usePageEditorDraft({ pages, selectedSlug: slug, editorLocale: 'fr' }),
            { initialProps: { slug: '/' } }
        );

        expect(result.current.formData.hero.title).toBe('CAMPUS UNIVERS COSCADES');

        // Navigation vers la page Stages
        rerender({ slug: 'stages-cascades-parkour-2' });

        expect(result.current.formData.slug).toBe('stages-cascades-parkour-2');
        expect(result.current.formData.hero.title).toBe('STAGES INTENSIFS');
        expect(result.current.draftChanges.length).toBe(0);
    });
});
