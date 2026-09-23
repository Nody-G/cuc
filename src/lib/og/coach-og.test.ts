import type { Instructor } from '@/types';
import { coachOgOptions } from './coach-og';

function makeMember(overrides: Partial<Instructor> = {}): Instructor {
    return {
        id: 'jean-cascade',
        name: 'Jean Cascade',
        role: 'Coordinateur de cascades',
        title: 'Formateur référent',
        specialties: ['Chutes', 'Bagarres', 'Sécurité'],
        bio: 'Bio de test.',
        notableCredits: ['Film (2025) — Cascadeur'],
        ...overrides,
    };
}

describe('coachOgOptions', () => {
    it('rend un repli générique quand le slug est inconnu (jamais de carte vide)', () => {
        const options = coachOgOptions(undefined, 'fr');
        expect(options.eyebrow).toBe("L'ÉQUIPE");
        expect(options.title).toBe("L'ÉQUIPE DU CAMPUS");
        expect(options.metrics?.length).toBe(4);
        expect(options.subtitle && options.subtitle.length > 0).toBe(true);
    });

    it('compose la carte d’un coach du catalogue : nom, fonction, spécialités', () => {
        const options = coachOgOptions(makeMember(), 'fr');
        expect(options.title).toBe('Jean Cascade');
        expect(options.subtitle).toBe('Formateur référent');
        expect(options.metrics).toEqual(['Chutes', 'Bagarres', 'Sécurité']);
        expect(options.eyebrow).toBe('FICHE CASCADEUR');
    });

    it('plafonne les spécialités à quatre entrées et ignore les vides', () => {
        const options = coachOgOptions(
            makeMember({ specialties: ['A', ' ', 'B', 'C', 'D', 'E'] }),
            'fr'
        );
        expect(options.metrics).toEqual(['A', 'B', 'C', 'D']);
    });

    it('replie sur le rôle quand aucune spécialité exploitable', () => {
        const options = coachOgOptions(
            makeMember({ specialties: [], role: 'Coordinateur de cascades' }),
            'fr'
        );
        expect(options.metrics).toEqual(['Coordinateur de cascades']);
    });

    it('anglais : repli et carte coach dans la langue de la fiche', () => {
        expect(coachOgOptions(undefined, 'en').title).toBe('THE CAMPUS TEAM');
        expect(coachOgOptions(makeMember(), 'en').eyebrow).toBe(
            'STUNT PERFORMER PROFILE'
        );
        expect(coachOgOptions(makeMember(), 'en').title).toBe('Jean Cascade');
    });
});
