import { render, screen } from '@testing-library/react';
import { UnpublishedPageGate } from './UnpublishedPageGate';

const isPreviewFrameMock = vi.fn(() => false);

vi.mock('@/lib/preview/preview-context', () => ({
    isPreviewFrame: () => isPreviewFrameMock(),
}));

function pageWith(isPublished: boolean) {
    return {
        slug: 'formation-de-cascadeur',
        title: 'Formation',
        hero: { title: 'T', subtitle: 'S' },
        is_published: isPublished,
    } as never;
}

describe('UnpublishedPageGate', () => {
    beforeEach(() => {
        isPreviewFrameMock.mockReturnValue(false);
    });

    it('rend la page quand elle est publiée', () => {
        render(
            <UnpublishedPageGate page={pageWith(true)}>
                <p>Contenu publié</p>
            </UnpublishedPageGate>
        );
        expect(screen.getByText('Contenu publié')).toBeTruthy();
    });

    it('ne rend JAMAIS le contenu d’un brouillon au visiteur', () => {
        render(
            <UnpublishedPageGate page={pageWith(false)}>
                <p>Contenu non publié</p>
            </UnpublishedPageGate>
        );
        expect(screen.queryByText('Contenu non publié')).toBeNull();
        expect(screen.getByText('Cette page n’est pas publiée')).toBeTruthy();
    });

    it('laisse l’aperçu du Cockpit servir le brouillon', () => {
        isPreviewFrameMock.mockReturnValue(true);
        render(
            <UnpublishedPageGate page={pageWith(false)}>
                <p>Contenu non publié</p>
            </UnpublishedPageGate>
        );
        expect(screen.getByText('Contenu non publié')).toBeTruthy();
    });

    it('reste transparente sans contenu de page', () => {
        render(
            <UnpublishedPageGate page={null}>
                <p>Contenu sans état de publication</p>
            </UnpublishedPageGate>
        );
        expect(screen.getByText('Contenu sans état de publication')).toBeTruthy();
    });

    it('sert le brouillon quand la route d’aperçu admin l’autorise (allowUnpublished)', () => {
        render(
            <UnpublishedPageGate page={pageWith(false)} allowUnpublished>
                <p>Brouillon servi à l’éditeur</p>
            </UnpublishedPageGate>
        );
        expect(screen.getByText('Brouillon servi à l’éditeur')).toBeTruthy();
    });
});
