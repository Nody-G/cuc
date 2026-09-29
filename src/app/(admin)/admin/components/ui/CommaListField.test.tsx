/**
 * Tests du champ « liste séparée par des virgules ».
 *
 * Régression couverte : un champ contrôlé qui re-normalise à chaque frappe
 * (`split` → `trim` → `join`) réinjecte une valeur différente de la saisie,
 * React la réécrit et replace le curseur en fin de champ — impossible de
 * corriger le milieu d'une ligne.
 */

import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { CommaListField } from './CommaListField';

describe('CommaListField', () => {
    it('affiche la forme canonique au montage', () => {
        const { getByRole } = render(
            <CommaListField
                value={['Airbag géant', 'Harnais']}
                onChange={() => { }}
                aria-label="Matériel"
            />
        );
        expect((getByRole('textbox') as HTMLInputElement).value).toBe('Airbag géant, Harnais');
    });

    it('ne réécrit jamais le texte pendant la frappe', () => {
        const onChange = vi.fn();
        const { getByRole } = render(
            <CommaListField value={['Airbag', 'Harnais']} onChange={onChange} aria-label="Matériel" />
        );
        const input = getByRole('textbox') as HTMLInputElement;

        fireEvent.change(input, { target: { value: 'Airbag ,  Harnais' } });

        // Le texte tapé est conservé tel quel : aucune normalisation ne vient
        // replacer le curseur en fin de champ.
        expect(input.value).toBe('Airbag ,  Harnais');
        expect(onChange).toHaveBeenLastCalledWith(['Airbag', 'Harnais']);
    });

    it('applique la forme canonique au blur uniquement', () => {
        const { getByRole } = render(
            <CommaListField value={['Airbag', 'Harnais']} onChange={() => { }} aria-label="Matériel" />
        );
        const input = getByRole('textbox') as HTMLInputElement;

        fireEvent.change(input, { target: { value: 'Airbag ,  Harnais' } });
        fireEvent.blur(input);

        expect(input.value).toBe('Airbag, Harnais');
    });
});
