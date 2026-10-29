import { render, screen } from '@testing-library/react';
import { InquiryRow } from './InquiryRow';
import type { SiteInquiry } from '@/lib/data/site-service';

const baseInquiry: SiteInquiry = {
  id: 'inq_row_1',
  full_name: 'Lucas Martin',
  email: 'lucas@example.com',
  phone: '0612345678',
  program_id: 'autre',
  program_title: 'Autre question générale',
  message: 'Demande générale d’informations',
  status: 'recue',
  created_at: '2026-10-29T10:00:00Z',
};

describe('InquiryRow', () => {
  it('affiche le badge "À classer" pour les demandes générales spontanées', () => {
    render(
      <InquiryRow
        inquiry={baseInquiry}
        onOpen={vi.fn()}
        onStageChange={vi.fn()}
      />
    );

    expect(screen.getByText('À classer')).toBeInTheDocument();
  });

  it('ne montre pas "À classer" quand la demande a été classée dans un programme', () => {
    render(
      <InquiryRow
        inquiry={{
          ...baseInquiry,
          program_id: 'pro-longue-duree',
          program_title: 'Formation Professionnelle Longue Durée (2 ans / 720h)',
        }}
        onOpen={vi.fn()}
        onStageChange={vi.fn()}
      />
    );

    expect(screen.queryByText('À classer')).not.toBeInTheDocument();
  });
});
