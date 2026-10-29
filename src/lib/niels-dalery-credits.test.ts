import { CUC_TEAM } from '@/data/team';
import { FILMOGRAPHY_CREDITS } from '@/data/filmography';

describe('Véracité filmographique — Niels Dalery', () => {
  const niels = CUC_TEAM.find((member) => member.id === 'niels-dalery');

  it('Niels Dalery est bien présent dans l’équipe CUC', () => {
    expect(niels).toBeDefined();
  });

  it('Niels Dalery est uniquement crédité sur "Loin du périph" et non pas "Sous la Seine"', () => {
    expect(niels?.notableCredits).toEqual(['Loin du périph (2022) — Cascadeur']);

    const filmRoles = (niels?.metadata as { film_roles?: Record<string, string> })?.film_roles || {};
    expect(filmRoles['loin-du-periph']).toBe('Cascadeur');
    expect(filmRoles['sous-la-seine']).toBeUndefined();
  });

  it('Le film "Loin du périph" rattache bien Niels Dalery en tant que Cascadeur', () => {
    const loinDuPeriph = FILMOGRAPHY_CREDITS.find((f) => f.id === 'loin-du-periph');
    expect(loinDuPeriph).toBeDefined();
    expect(loinDuPeriph?.cuc_team_involved).toContain('niels-dalery');
    expect(loinDuPeriph?.cuc_team_roles?.['niels-dalery']).toBe('Cascadeur');
  });

  it('Le film "Sous la Seine" ne rattache pas Niels Dalery', () => {
    const sousLaSeine = FILMOGRAPHY_CREDITS.find((f) => f.id === 'sous-la-seine');
    expect(sousLaSeine).toBeDefined();
    expect(sousLaSeine?.cuc_team_involved).not.toContain('niels-dalery');
    expect(sousLaSeine?.cuc_team_roles?.['niels-dalery']).toBeUndefined();
  });
});
