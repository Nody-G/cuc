import type { SitePageContent } from '@/lib/data/site-service';
import { getPublicPageContent } from './public-page';
import { getLocalizedPageContent } from './server';
import { getPagePublicationState } from './page-publication';

/**
 * La porte de diffusion : une page DÉFINITIVEMENT non publiée est un 404, jamais
 * un 200 avec avis — y compris sous RLS, où la ligne du brouillon est « absente »
 * pour le client public. Les deux replis (panne de lecture → copie certifiée ;
 * page absente → null) ne doivent JAMAIS ressembler à une dépublication.
 */

vi.mock('next/navigation', () => ({
    notFound: () => {
        throw new Error('NEXT_NOT_FOUND');
    },
}));

vi.mock('./server', () => ({
    getLocalizedPageContent: vi.fn(),
}));

vi.mock('./page-publication', () => ({
    getPagePublicationState: vi.fn(),
}));

const getLocalizedPageContentMock = vi.mocked(getLocalizedPageContent);
const getPagePublicationStateMock = vi.mocked(getPagePublicationState);

function makePage(isPublished: boolean): SitePageContent {
    return {
        slug: '/formation-de-cascadeur',
        title: 'Formation',
        hero: { title: 'T', subtitle: 'S' },
        layout_sections: [],
        sections_data: {},
        sections: [],
        is_published: isPublished,
    } as unknown as SitePageContent;
}

describe('getPublicPageContent', () => {
    beforeEach(() => {
        getLocalizedPageContentMock.mockReset();
        getPagePublicationStateMock.mockReset();
        getPagePublicationStateMock.mockResolvedValue('unknown');
    });

    it('sert une page publiée', async () => {
        const page = makePage(true);
        getLocalizedPageContentMock.mockResolvedValue(page);

        await expect(getPublicPageContent('/formation-de-cascadeur')).resolves.toBe(page);
        expect(getPagePublicationStateMock).not.toHaveBeenCalled();
    });

    it('répond 404 pour une page définitivement non publiée (jamais le contenu)', async () => {
        getLocalizedPageContentMock.mockResolvedValue(makePage(false));

        await expect(getPublicPageContent('/formation-de-cascadeur')).rejects.toThrow(
            'NEXT_NOT_FOUND'
        );
    });

    it('répond 404 sous RLS : ligne invisible + état « unpublished » (client admin)', async () => {
        getLocalizedPageContentMock.mockResolvedValue(null);
        getPagePublicationStateMock.mockResolvedValue('unpublished');

        await expect(getPublicPageContent('/formation-de-cascadeur')).rejects.toThrow(
            'NEXT_NOT_FOUND'
        );
    });

    it('sert la copie certifiée en cas de panne de lecture (jamais un 404)', async () => {
        const certifiedCopy = makePage(true);
        getLocalizedPageContentMock.mockResolvedValue(certifiedCopy);

        await expect(getPublicPageContent('/formation-de-cascadeur')).resolves.toBe(
            certifiedCopy
        );
    });

    it('laisse passer une page absente (null) : repli client certifié', async () => {
        getLocalizedPageContentMock.mockResolvedValue(null);

        await expect(getPublicPageContent('/formation-de-cascadeur')).resolves.toBeNull();
    });

    it('état « published » avec ligne absente (course de lecture) → null, jamais un 404', async () => {
        getLocalizedPageContentMock.mockResolvedValue(null);
        getPagePublicationStateMock.mockResolvedValue('published');

        await expect(getPublicPageContent('/formation-de-cascadeur')).resolves.toBeNull();
    });
});
