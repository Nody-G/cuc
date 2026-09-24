import type { FilmCategoryOrEmpty } from '@/lib/film-category';

export interface StuntProgram {
  id: string;
  category: 'pro' | 'discovery' | 'weekend' | 'afdas' | 'summer';
  title: string;
  badge: string;
  highlight?: boolean;
  tagline: string;
  duration: string;
  hours: string;
  location: string;
  price: string;
  priceNote?: string;
  ageRequirement: string;
  eligibility: string[];
  nextSessions: {
    id?: string;
    cuc_sign_formation_id?: string | null;
    date: string;
    status: 'complet' | 'ouvert' | 'dernières places' | 'bientôt';
    booked_seats?: number;
    max_seats?: number;
  }[];
  description: string;
  objectives: string[];
  keyModules: string[];
  certification?: string;
  ctaText: string;
  brochureUrl?: string;
}

export interface Discipline {
  id: string;
  number: string;
  name: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  level: 'Fondamental' | 'Avancé' | 'Extrême' | 'Tactique';
  equipment: string[];
  cinemaContext: string;
  heroImage: string;
  instructor_ids?: string[];
  campus_zone_id?: string;
  program_ids?: string[];
  film_ids?: string[];
}

export interface FilmCredit {
  id: string;
  title: string;
  year: string;
  /**
   * Seule distinction éditoriale autorisée : `Film` · `Série` ·
   * `Court métrage` (cf. `@/lib/film-category`). Chaîne vide = aucune
   * catégorie factuelle disponible (ex. clip musical, jeu vidéo, podcast) :
   * aucun badge n'est alors affiché — une valeur fausse serait pire.
   */
  category: FilmCategoryOrEmpty;
  director?: string;
  stuntRoles: string;
  /** Description factuelle de la fiche film (générée depuis les données vérifiées). */
  description?: string;
  doubledActors?: string[];
  highlight: boolean;
  image: string;
  tag: string;
  imdbUrl: string;
  allocineUrl: string;
  trailerUrl: string;
  instructor_ids?: string[];
  cuc_team_involved?: string[];
  cuc_team_roles?: Record<string, string>;
}

export type StuntRoleCategory = 'coordination' | 'stunt' | 'doublure' | 'choreography' | 'rigger' | 'parkour' | 'special';

export interface ParsedCredit {
  raw: string;
  title: string;
  role?: string;
  category: StuntRoleCategory;
  year?: string;
}

/**
 * Analyse un crédit de tournage pour séparer proprement le titre de l'œuvre et le rôle exact
 * (ex: Coordinateur des cascades, Cascadeur, Doublure de Tomer Sisley, etc.)
 */
export function parseCredit(creditStr: string): ParsedCredit {
  if (!creditStr) {
    return { raw: '', title: '', category: 'stunt' };
  }
  const raw = creditStr.trim();

  let title = raw;
  let role: string | undefined = undefined;

  // Format "Titre — Rôle"
  if (raw.includes(' — ')) {
    const parts = raw.split(' — ');
    title = parts[0].trim();
    role = parts.slice(1).join(' — ').trim();
  } else {
    // Format "Titre (Rôle)" à la fin
    const matchParen = raw.match(/^(.*?)\s*\(([^)]+)\)$/);
    if (matchParen) {
      const candidateTitle = matchParen[1].trim();
      const candidateRole = matchParen[2].trim();
      // Si ce n'est pas simplement une année isolée (ex: 2024)
      if (!/^\d{4}$/.test(candidateRole)) {
        title = candidateTitle;
        role = candidateRole;
      }
    }
  }

  // Détection de la catégorie technique
  let category: StuntRoleCategory = 'stunt';
  const roleLower = (role || '').toLowerCase();

  if (roleLower.includes('coordinat') || roleLower.includes('régleur') || roleLower.includes('supervis')) {
    category = 'coordination';
  } else if (roleLower.includes('doublure') || roleLower.includes('double')) {
    category = 'doublure';
  } else if (roleLower.includes('chorégraph') || roleLower.includes('action designer')) {
    category = 'choreography';
  } else if (roleLower.includes('parkour') || roleLower.includes('freerun') || roleLower.includes('yamakasi')) {
    category = 'parkour';
  } else if (roleLower.includes('câbl') || roleLower.includes('rigger') || roleLower.includes('rigging')) {
    category = 'rigger';
  } else if (raw.toLowerCase().includes('champion') || raw.toLowerCase().includes('award')) {
    category = 'special';
  } else {
    category = 'stunt';
  }

  return { raw, title, role, category };
}

export interface DoubledCelebrity {
  id: string;
  name: string;
  photo: string;
  productions: string[];
  stuntSpecialty: string;
  stuntDoubles: string;
  imdbUrl: string;
}

/**
 * Métadonnées libres d'un formateur (`site_team.metadata`).
 * Les clés exploitées par l'application sont typées ; les clés inconnues
 * restent `unknown` et exigent un narrowing — plus aucun `any`.
 */
export interface InstructorMetadata {
  /** Rôle de chaque membre CUC dans un film, indexé par identifiant de film. */
  film_roles?: Record<string, string>;
  [key: string]: unknown;
}

export interface Instructor {
  id: string;
  name: string;
  role: string;
  title: string;
  specialties: string[];
  bio: string;
  doubledActors?: string[];
  notableCredits: string[];
  /**
   * Crédits mis en avant sur la fiche publique, dans l'ordre choisi dans le
   * Cockpit. Contient des chaînes identiques à celles de `notableCredits`
   * (format « Titre (Année) — Rôle »). Vide = tri automatique par notoriété.
   */
  featuredCredits?: string[];
  /**
   * Nombre de crédits affichés avant le bouton « Afficher tous les crédits ».
   * Défaut : 8.
   */
  creditsDisplayLimit?: number;
  externalUrl?: string;
  avatarUrl?: string;
  instagram?: string;
  imdb?: string;
  allocine?: string;
  film_ids?: string[];
  discipline_ids?: string[];
  profile_id?: string | null;
  metadata?: InstructorMetadata;
}

export interface InfrastructureSpot {
  id: string;
  code: string;
  name: string;
  size: string;
  description: string;
  features: string[];
  specifications: string;
  image: string;
}
