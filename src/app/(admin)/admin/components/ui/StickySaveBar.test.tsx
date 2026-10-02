import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StickySaveBar } from './StickySaveBar';

describe('StickySaveBar — bouton « Annuler »', () => {
    it('ne rend rien tant qu’il n’y a pas de brouillon', () => {
        const { container } = render(<StickySaveBar isDirty={false} onSave={vi.fn()} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('ne rend « Annuler » que si onReset est fourni', () => {
        render(<StickySaveBar isDirty onSave={vi.fn()} />);
        expect(screen.queryByRole('button', { name: /annuler/i })).toBeNull();
    });

    it('rend « Annuler » et déclenche le callback au clic', async () => {
        const onReset = vi.fn();
        render(<StickySaveBar isDirty onSave={vi.fn()} onReset={onReset} />);

        await userEvent.click(screen.getByRole('button', { name: /annuler/i }));

        expect(onReset).toHaveBeenCalledTimes(1);
    });

    it('déclenche l’enregistrement au clic sur « Enregistrer »', async () => {
        const onSave = vi.fn();
        render(<StickySaveBar isDirty onSave={onSave} onReset={vi.fn()} />);

        await userEvent.click(screen.getByRole('button', { name: /enregistrer/i }));

        expect(onSave).toHaveBeenCalledTimes(1);
    });
});
