import { render, screen, fireEvent } from '@testing-library/react';
import { InquiryClassificationSection } from './InquiryClassificationSection';

describe('InquiryClassificationSection', () => {
  it('affiche le badge "À classer par l’équipe" lorsque le programme est autre ou général', () => {
    render(
      <InquiryClassificationSection
        currentProgramId="autre"
        currentProgramTitle="Autre question générale"
      />
    );

    expect(screen.getByText("À classer par l'équipe")).toBeInTheDocument();
  });

  it('ne montre pas le badge "À classer" lorsque le dossier est déjà classé', () => {
    render(
      <InquiryClassificationSection
        currentProgramId="stage-decouverte"
        currentProgramTitle="Stage Découverte & Sélection (12 jours / 80h)"
      />
    );

    expect(screen.queryByText("À classer par l'équipe")).not.toBeInTheDocument();
  });

  it('appelle onProgramChange lors du changement de sélection', () => {
    const handleChange = vi.fn();
    render(
      <InquiryClassificationSection
        currentProgramId="autre"
        currentProgramTitle="Autre question générale"
        onProgramChange={handleChange}
      />
    );

    const select = screen.getByRole('combobox', { name: /Classifier le type de demande/i });
    fireEvent.change(select, { target: { value: 'afdas-artistes-interpretes' } });

    expect(handleChange).toHaveBeenCalledWith(
      'afdas-artistes-interpretes',
      'Stage AFDAS Artistes Interprètes (Gennevilliers)'
    );
  });
});
