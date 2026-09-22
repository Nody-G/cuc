import { buildRouteMetadata } from './route-metadata';

const getLocalizedPageContentMock = vi.fn();

vi.mock('@/lib/i18n/server', () => ({
    getLocalizedPageContent: (...args: unknown[]) => getLocalizedPageContentMock(...args),
}));

const FALLBACK = { title: 'Titre de repli', description: 'Description de repli' };

function pageWith(isPublished: boolean) {
    return {
        slug: 'partenaires',
        title: 'Partenaires',
        meta_title: 'Partenaires — CUC',
        meta_description: 'Les partenaires du campus.',
        is_published: isPublished,
    };
}

describe('buildRouteMetadata', () => {
    beforeEach(() => {
        getLocalizedPageContentMock.mockReset();
    });

    it('expose la metadata éditoriale quand la page est publiée', async () => {
        getLocalizedPageContentMock.mockResolvedValue(pageWith(true));

        const metadata = await buildRouteMetadata({
            slug: 'partenaires',
            locale: 'fr',
            fallback: FALLBACK,
        });

        expect(metadata.title).toBe('Partenaires — CUC');
        expect(metadata.description).toBe('Les partenaires du campus.');
        expect(metadata.robots).toBeUndefined();
        expect(metadata.alternates).toEqual({
            canonical: '/partenaires',
            languages: { fr: '/partenaires', en: '/en/partenaires' },
        });
    });

    it('sort la page du moteur dès qu’elle est en brouillon', async () => {
        getLocalizedPageContentMock.mockResolvedValue(pageWith(false));

        const metadata = await buildRouteMetadata({
            slug: 'partenaires',
            locale: 'fr',
            fallback: FALLBACK,
        });

        expect(metadata.robots).toEqual({ index: false, follow: false });
    });

    it('retombe sur la copie FR si la page n’existe pas en base', async () => {
        getLocalizedPageContentMock.mockResolvedValue(null);

        const metadata = await buildRouteMetadata({
            slug: 'partenaires',
            locale: 'en',
            fallback: FALLBACK,
        });

        expect(metadata.title).toBe(FALLBACK.title);
        expect(metadata.description).toBe(FALLBACK.description);
        expect(metadata.robots).toBeUndefined();
    });

    it('normalise une locale inconnue vers le français', async () => {
        getLocalizedPageContentMock.mockResolvedValue(pageWith(true));

        await buildRouteMetadata({ slug: 'partenaires', locale: 'de', fallback: FALLBACK });

        expect(getLocalizedPageContentMock).toHaveBeenCalledWith('partenaires', 'fr');
    });
});
