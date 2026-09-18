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
  category: 'Blockbuster' | 'Cinéma Français' | 'Cinéma International' | 'Série / Plateforme' | 'Show & Événement' | 'Film Culte' | 'Streaming Global';
  director?: string;
  stuntRoles: string;
  doubledActors?: string[];
  highlight: boolean;
  image: string;
  tag: string;
  imdbUrl: string;
  allocineUrl: string;
  trailerUrl: string;
  instructor_ids?: string[];
}

export interface DoubledCelebrity {
  id: string;
  name: string;
  photo: string;
  roleType: string;
  productions: string[];
  stuntSpecialty: string;
  stuntDoubles: string;
  imdbUrl: string;
  highlightTag: string;
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
  externalUrl?: string;
  avatarUrl?: string;
  instagram?: string;
  imdb?: string;
  film_ids?: string[];
  discipline_ids?: string[];
  profile_id?: string | null;
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
