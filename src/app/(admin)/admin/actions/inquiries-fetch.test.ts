/**
 * Aucun import de `vitest` : `globals: true` est activé (`vitest.config.mts`).
 * L'import explicite résolvait une seconde instance du paquet, sans
 * configuration — la suite échouait au chargement, avant tout test.
 */
import { fetchInquiriesAction } from './inquiries';
import * as mirrorModule from './inquiries-mirror';

describe('fetchInquiriesAction', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('retourne les entrées de site_inquiries si disponibles', async () => {
    const mockInquiry = {
      id: 'inq_test_1',
      full_name: 'Jean Test',
      email: 'jean@example.com',
      phone: '0102030405',
      program_id: 'pro-longue-duree',
      message: 'Demande test',
      status: 'nouveau' as const,
      created_at: '2026-09-29T10:00:00Z',
      updated_at: '2026-09-29T10:00:00Z',
    };

    vi.spyOn(mirrorModule, 'selectInquiriesRows').mockResolvedValue({
      entries: [mockInquiry],
      error: null,
    });

    const result = await fetchInquiriesAction();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('inq_test_1');
    expect(result[0].full_name).toBe('Jean Test');
  });

  it('retombe sur le miroir site_settings si la table site_inquiries est vide ou inaccessible', async () => {
    const mirrorInquiry = {
      id: 'inq_mirror_1',
      full_name: 'Claire Miroir',
      email: 'claire@example.com',
      phone: '0600000000',
      program_id: 'workshop-international',
      message: 'Demande depuis miroir',
      status: 'nouveau' as const,
      created_at: '2026-09-29T10:00:00Z',
      updated_at: '2026-09-29T10:00:00Z',
    };

    // selectInquiriesRows renvoie vide (ex: table vide ou RLS anon)
    vi.spyOn(mirrorModule, 'selectInquiriesRows').mockResolvedValue({
      entries: [],
      error: null,
    });

    // readInquiryMirror a une entrée
    vi.spyOn(mirrorModule, 'readInquiryMirror').mockResolvedValue({
      entries: [mirrorInquiry],
      error: null,
    });

    const result = await fetchInquiriesAction();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('inq_mirror_1');
    expect(result[0].full_name).toBe('Claire Miroir');
  });

  it('retourne un tableau vide si aucune candidature n’existe', async () => {
    vi.spyOn(mirrorModule, 'selectInquiriesRows').mockResolvedValue({
      entries: [],
      error: null,
    });
    vi.spyOn(mirrorModule, 'readInquiryMirror').mockResolvedValue({
      entries: [],
      error: null,
    });

    const result = await fetchInquiriesAction();
    expect(result).toEqual([]);
  });
});
