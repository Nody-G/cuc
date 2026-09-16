import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TacticalButton } from './TacticalButton';

/**
 * Tests unitaires du composant TacticalButton (Phase 6).
 * Vérifie le rendu, la propagation des props natives et l'accessibilité.
 */
describe('TacticalButton', () => {
    it('rend son contenu textuel', () => {
        render(<TacticalButton>Découvrir</TacticalButton>);
        expect(screen.getByRole('button', { name: 'Découvrir' })).toBeInTheDocument();
    });

    it('applique la variante demandée', () => {
        render(<TacticalButton variant="danger">Supprimer</TacticalButton>);
        const button = screen.getByRole('button', { name: 'Supprimer' });
        expect(button.className).toContain('bg-[#E53E3E]');
    });

    it('désactive le bouton lorsque disabled est fourni', () => {
        render(<TacticalButton disabled>Indisponible</TacticalButton>);
        expect(screen.getByRole('button', { name: 'Indisponible' })).toBeDisabled();
    });

    it('déclenche onClick à l’activation', async () => {
        const user = userEvent.setup();
        const handleClick = vi.fn();
        render(<TacticalButton onClick={handleClick}>Valider</TacticalButton>);

        await user.click(screen.getByRole('button', { name: 'Valider' }));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('place l’icône à droite par défaut', () => {
        render(
            <TacticalButton icon={<span data-testid="icon">→</span>}>
                Suivant
            </TacticalButton>
        );
        const button = screen.getByRole('button', { name: /Suivant/ });
        const icon = screen.getByTestId('icon');
        expect(button.lastElementChild).toContainElement(icon);
    });
});
