import type { ContentHealthInput } from './content-health';
import type { SitePageContent } from '@/lib/data/site-service';
import type { NavigationStructure, FooterStructure } from '@/data/navigation';
import type { DoubledCelebrity, FilmCredit, Instructor } from '@/types';

/**
 * Fixtures partagées des tests du diagnostic de santé du contenu.
 *
 * Le module testé est pur : il reçoit l'état complet du contenu et retourne une
 * liste d'anomalies. Ces constructeurs produisent des états valides par défaut,
 * surchargés champ par champ dans chaque test.
 */

export function makePage(overrides: Partial<SitePageContent> = {}): SitePageContent {
    return {
        slug: '/test',
        title: 'Page de test',
        is_published: true,
        meta_title: 'Un titre SEO suffisamment long',
        meta_description:
            'Une méta-description factuelle et suffisamment longue pour dépasser le seuil minimal de cinquante caractères.',
        og_image: '/images/og/test.png',
        ...overrides,
    } as SitePageContent;
}

export function makeNav(overrides: Partial<NavigationStructure> = {}): NavigationStructure {
    return {
        items: [],
        ...overrides,
    } as NavigationStructure;
}

export function makeFooter(overrides: Partial<FooterStructure> = {}): FooterStructure {
    return {
        columns: [],
        ...overrides,
    } as FooterStructure;
}

export function baseInput(overrides: Partial<ContentHealthInput> = {}): ContentHealthInput {
    return {
        pages: [],
        navigation: null,
        footer: null,
        socialLinks: [],
        partners: [],
        events: [],
        settings: null,
        films: [],
        team: [],
        celebrities: [],
        ...overrides,
    };
}

/** Film du catalogue : rôles CUC par identifiant de coach. */
export function makeFilm(overrides: Partial<FilmCredit> = {}): FilmCredit {
    return {
        id: 'film-test',
        title: 'Film de test',
        year: '2026',
        category: 'film',
        director: '',
        stuntRoles: '',
        description: '',
        doubledActors: [],
        highlight: false,
        image: '',
        tag: '',
        imdbUrl: '',
        allocineUrl: '',
        trailerUrl: '',
        cuc_team_involved: [],
        cuc_team_roles: {},
        ...overrides,
    } as FilmCredit;
}

/** Formateur : `doubledActors` porte les comédiens déclarés sur sa fiche. */
export function makeMember(overrides: Partial<Instructor> = {}): Instructor {
    return {
        id: 'coach-test',
        name: 'Coach de test',
        role: 'Cascadeur',
        title: 'Cascadeur',
        specialties: [],
        bio: '',
        doubledActors: [],
        notableCredits: [],
        ...overrides,
    } as Instructor;
}

export function makeCelebrity(overrides: Partial<DoubledCelebrity> = {}): DoubledCelebrity {
    return {
        id: 'comedien-test',
        name: 'Comédien de test',
        photo: '',
        productions: [],
        stuntSpecialty: '',
        stuntDoubles: '',
        imdbUrl: '',
        ...overrides,
    };
}
