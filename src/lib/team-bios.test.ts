import { describe, expect, it } from 'vitest';
import { CUC_TEAM } from '../data/team';

describe('Biographies des coachs CUC — Authenticité & Zéro AI slop', () => {
  it('contient exactement 20 coachs dans CUC_TEAM', () => {
    expect(CUC_TEAM).toHaveLength(20);
  });

  it('chaque coach possède une description détaillée (> 150 caractères)', () => {
    for (const coach of CUC_TEAM) {
      expect(coach.bio.trim().length, `Bio de ${coach.name} trop courte`).toBeGreaterThan(150);
    }
  });

  it('ne contient aucun cliché IA ni superlatif creux banni', () => {
    const BANNED_TERMS = [
      /virtuose/i,
      /légendaire/i,
      /prodige/i,
      /élite mondiale/i,
      /traceur d'élite/i,
      /maître absolu/i,
    ];

    for (const coach of CUC_TEAM) {
      for (const pattern of BANNED_TERMS) {
        expect(coach.bio, `Bio de ${coach.name} contient le terme interdit ${pattern}`).not.toMatch(pattern);
      }
    }
  });

  it('respecte strictement la doctrine Parkour pour Malik Diouf (aucun "Art du Déplacement")', () => {
    const malik = CUC_TEAM.find((c) => c.id === 'malik-diouf');
    expect(malik).toBeDefined();
    expect(malik?.bio).toContain('Parkour');
    expect(malik?.bio).not.toMatch(/art du d[eé]placement/i);
    expect(malik?.bio).not.toMatch(/\bADD\b/);

    for (const spec of malik?.specialties || []) {
      expect(spec).not.toMatch(/art du d[eé]placement/i);
      expect(spec).not.toMatch(/\bADD\b/);
    }
  });

  it('associe Niels Dalery exclusivement à "Loin du périph" et jamais à "Sous la Seine"', () => {
    const niels = CUC_TEAM.find((c) => c.id === 'niels-dalery');
    expect(niels).toBeDefined();
    expect(niels?.bio).toContain('Loin du périph');
    expect(niels?.bio).not.toContain('Sous la Seine');
  });

  it('chaque coach a un rôle et un titre cohérents et définis', () => {
    for (const coach of CUC_TEAM) {
      expect(coach.role.trim().length).toBeGreaterThan(0);
      expect(coach.title.trim().length).toBeGreaterThan(0);
      expect(coach.specialties.length).toBeGreaterThanOrEqual(3);
    }
  });
});
