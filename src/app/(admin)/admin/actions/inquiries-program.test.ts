import { updateInquiryProgram } from './inquiries';
import * as mirrorModule from './inquiries-mirror';
import * as auditModule from './audit';

describe('updateInquiryProgram', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(auditModule, 'logAuditEvent').mockResolvedValue();
  });

  it('met à jour la classification de programme sur la table et le miroir', async () => {
    const updateSpy = vi.spyOn(mirrorModule, 'updateInquiryRow').mockResolvedValue(null);
    const readSpy = vi.spyOn(mirrorModule, 'readInquiryMirror').mockResolvedValue({
      entries: [
        {
          id: 'inq_123',
          full_name: 'Test Candidat',
          email: 'test@example.com',
          phone: '0600000000',
          program_id: 'autre',
          program_title: 'Autre question générale',
          message: 'Bonjour',
          status: 'recue',
          created_at: '2026-10-29T10:00:00Z',
        },
      ],
      error: null,
    });
    const writeSpy = vi.spyOn(mirrorModule, 'writeInquiryMirror').mockResolvedValue(null);

    const result = await updateInquiryProgram(
      'inq_123',
      'stage-decouverte',
      'Stage Découverte & Sélection (12 jours / 80h)'
    );

    expect(result.success).toBe(true);
    expect(updateSpy).toHaveBeenCalledWith(
      'inq_123',
      expect.objectContaining({
        program_id: 'stage-decouverte',
        program_title: 'Stage Découverte & Sélection (12 jours / 80h)',
      })
    );
    expect(readSpy).toHaveBeenCalled();
    expect(writeSpy).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'inq_123',
          program_id: 'stage-decouverte',
          program_title: 'Stage Découverte & Sélection (12 jours / 80h)',
        }),
      ])
    );
  });
});
