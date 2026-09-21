/**
 * ==============================================================================
 * ⚠️  SCRIPT HISTORIQUE — NE PAS RELANCER TEL QUEL
 * ==============================================================================
 * Ce script contient encore l'ancienne identité erronée « michael-troude »
 * (IMDb nm0873735). L'identité réelle du coach est **Michel Bouis**
 * (IMDb nm0099365), vérifiée sur 3 sources (site campus, IMDb, avatar
 * officiel `14-michel.png`).
 *
 * Source de vérité actuelle :
 *   - `scripts/lib/coach-registry.mjs` (registre canonique des 12 coachs)
 *   - `src/data/team.ts` (fiche publique)
 *   - pipeline : `npm run coaches:scrape:imdb` → `coaches:curate` →
 *     `coaches:apply` → `coaches:sync`
 *
 * Migration d'identité déjà appliquée en base via
 * `scripts/migrate_michel_bouis_supabase.mjs`.
 * ==============================================================================
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !serviceKey) {
  console.error('Missing SUPABASE env variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

// Données des 12 coachs avec crédits détaillés et précis
const TEAM_UPDATES = [
  {
    id: 'lucas-dollfus',
    name: 'Lucas Dollfus',
    role: 'Fondateur & Directeur Général',
    title: 'Coordinateur de Cascades & Formateur Référent',
    notable_credits: [
      'Bagarre (2024) — Coordinateur des cascades & Action Designer',
      'Nouveaux Riches (2023) — Coordinateur des cascades',
      'Néro (2024, Netflix) — Coordinateur des cascades superviseur',
      'Coka Chicas (2025) — Coordinateur des cascades',
      'Good Vibes Only (2026) — Coordinateur des cascades',
      'John Wick : Chapitre 4 (2023) — Cascadeur (Combats et cascades physiques à Paris)',
      'Sous la Seine (2024) — Cascadeur (Cascades subaquatiques et physiques)',
      'L\'Amour Ouf (2024) — Cascadeur & Câblage',
      'Largo Winch : Le Prix de l\'argent (2024) — Cascadeur'
    ],
    film_roles: {
      'bagarre': 'Coordinateur des cascades & Action Designer',
      'nouveaux-riches': 'Coordinateur des cascades',
      'nero': 'Coordinateur des cascades superviseur',
      'coka-chicas': 'Coordinateur des cascades',
      'john-wick-4': 'Cascadeur (Combats et cascades physiques à Paris)',
      'sous-la-seine': 'Cascadeur (Cascades subaquatiques et physiques)',
      'lamour-ouf': 'Cascadeur & Câblage',
      'largo-winch-3': 'Cascadeur'
    }
  },
  {
    id: 'jerome-gaspard',
    name: 'Jérôme Gaspard',
    role: 'Responsable Pédagogique',
    title: 'Coordinateur de Cascades Référent Cinéma',
    notable_credits: [
      'The Substance (2024) — Coordinateur des cascades France',
      'Athena (2022) — Coordinateur des cascades',
      'Le Salaire de la Peur (2024) — Coordinateur des cascades',
      'Sentinelle (2021) — Coordinateur des cascades',
      'Sacrifice (2025) — Coordinateur des cascades',
      'Braquo — Coordinateur des cascades',
      'Valérian et la Cité des mille planètes (2017) — Coordinateur des cascades & Câblage',
      'Le Pacte des loups (2001) — Cascadeur & Doublure Samuel Le Bihan',
      '007 Spectre (2015) — Cascadeur',
      'Fast & Furious 6 (2013) — Cascadeur',
      'Lucy (2014) — Cascadeur',
      'Dunkerque (Dunkirk, 2017) — Cascadeur',
      'Bastille Day (2016) — Cascadeur',
      'Le Comte de Monte-Cristo (2024) — Cascadeur',
      'Largo Winch (2008) — Cascadeur'
    ],
    film_roles: {
      'the-substance': 'Coordinateur des cascades France',
      'athena': 'Coordinateur des cascades',
      'le-salaire-de-la-peur': 'Coordinateur des cascades',
      'sentinelle': 'Coordinateur des cascades',
      'valerian': 'Coordinateur des cascades & Câblage',
      'le-pacte-des-loups': 'Cascadeur & Doublure Samuel Le Bihan',
      'james-bond-spectre': 'Cascadeur',
      'fast-furious-6': 'Cascadeur',
      'lucy': 'Cascadeur',
      'dunkirk': 'Cascadeur',
      'monte-cristo': 'Cascadeur',
      'largo-winch': 'Cascadeur'
    }
  },
  {
    id: 'vincent-bouillon',
    name: 'Vincent Bouillon',
    role: 'Spécialiste Combats & Chutes',
    title: 'Cascadeur Professionnel & Doublure',
    notable_credits: [
      'John Wick : Chapitre 4 (2023) — Cascadeur & Doublure Keanu Reeves (Taurus World Stunt Award)',
      'The Killer (2024, John Woo) — Stunt Coordinator (Nomination Taurus Award) & Cascadeur',
      'Largo Winch : Le Prix de l\'argent (2024) — Cascadeur & Doublure Tomer Sisley',
      'Le Comte de Monte-Cristo (2024) — Cascadeur & Doublure combats',
      'L\'Amour Ouf (2024) — Cascadeur & Combats',
      'Elyas (2024) — Cascadeur (Combats rapprochés)',
      'Hunger Games : La Ballade du serpent (2023) — Cascadeur',
      'Murder Mystery 2 (2023) — Cascadeur & Doublure',
      '6 Underground (2019, Michael Bay) — Cascadeur',
      '007 Spectre (2015) — Cascadeur',
      'Balthazar (Série TF1) — Doublure cascades Tomer Sisley',
      'The Substance (2024) — Cascadeur'
    ],
    film_roles: {
      'john-wick-4': 'Cascadeur & Doublure Keanu Reeves (Taurus Award)',
      'the-killer': 'Stunt Coordinator (Nomination Taurus) & Cascadeur',
      'largo-winch-3': 'Cascadeur & Doublure Tomer Sisley',
      'monte-cristo': 'Cascadeur & Doublure combats',
      'lamour-ouf': 'Cascadeur & Combats',
      'elyas': 'Cascadeur (Combats rapprochés)',
      'the-hunger-games': 'Cascadeur',
      'murder-mystery-2': 'Cascadeur & Doublure',
      '6-underground': 'Cascadeur',
      'james-bond-spectre': 'Cascadeur',
      'the-substance': 'Cascadeur',
      'largo-winch': 'Cascadeur & Doublure Tomer Sisley'
    }
  },
  {
    id: 'malik-diouf',
    name: 'Malik Diouf',
    role: 'Co-fondateur des Yamakasi',
    title: 'Référent Parkour',
    notable_credits: [
      'Planète B (2024) — Coordinateur des cascades',
      'Le Roi des Ombres (2023, Netflix) — Coordinateur des cascades',
      'Machine (2024, Arte) — Coordinateur des cascades & Régleur Parkour',
      'Yamakasi : Les samouraïs des temps modernes (2001) — Acteur principal & Cascadeur Parkour',
      'Les Fils du vent (2004) — Acteur principal & Cascadeur Parkour',
      'Taxi 2 (2000) — Cascadeur (Traceur Parkour)',
      'BAC Nord (2021) — Cascadeur',
      'Les Misérables (2019) — Conseiller Parkour & Cascadeur',
      'Athena (2022) — Cascadeur & Franchissement Parkour',
      'Fiasco (2024) — Cascadeur'
    ],
    film_roles: {
      'planete-b': 'Coordinateur des cascades',
      'le-roi-des-ombres': 'Coordinateur des cascades',
      'machine': 'Coordinateur des cascades & Régleur Parkour',
      'yamakasi': 'Acteur principal & Cascadeur Parkour',
      'bac-nord': 'Cascadeur',
      'les-miserables': 'Conseiller Parkour & Cascadeur',
      'athena': 'Cascadeur & Franchissement Parkour',
      'fiasco': 'Cascadeur'
    }
  },
  {
    id: 'franck-blanc',
    name: 'Franck Blanc',
    role: 'Directeur Adjoint',
    title: 'Coach Câblage 3D, Torches & Pyrotechnie',
    notable_credits: [
      'John Wick : Chapitre 4 (2023) — Cascadeur (Combats & Chutes)',
      'Anna (2019, Luc Besson) — Cascadeur & Câblage',
      'Overdose (2022, Olivier Marchal) — Cascadeur & Torches humaines',
      'Acide (2023, Just Philippot) — Cascadeur & Effets physiques',
      'Sous la Seine (2024) — Cascadeur (Chutes & Cascades eau)',
      'The Killer (2024, John Woo) — Cascadeur & Câblage 3D',
      'Valérian et la Cité des mille planètes (2017) — Cascadeur & Câblage',
      'La Nuit se traîne (2024) — Cascadeur & Chutes de hauteur',
      'Kepler(s) — Cascadeur & Pyrotechnie'
    ],
    film_roles: {
      'john-wick-4': 'Cascadeur (Combats & Chutes)',
      'anna': 'Cascadeur & Câblage',
      'sous-la-seine': 'Cascadeur (Chutes & Cascades eau)',
      'the-killer': 'Cascadeur & Câblage 3D',
      'valerian': 'Cascadeur & Câblage'
    }
  },
  {
    id: 'kefi-abrikh',
    name: 'Kefi Abrikh',
    role: 'Action Designer & Chorégraphe',
    title: 'Spécialiste Chorégraphies de Combat & 2e Équipe',
    notable_credits: [
      'The Princess (2022) — Coordinateur des cascades & Chorégraphe combats',
      'Furie (2019) — Coordinateur des cascades & Action Designer',
      'Nicky Larson et le Parfum de Cupidon (2019) — Chorégraphe des combats',
      'Furies (2024, Netflix) — Action Designer & Combats',
      '007 Spectre (2015) — Cascadeur',
      'Fast & Furious 6 (2013) — Cascadeur',
      'Jason Bourne (2016) — Cascadeur',
      'John Wick : Chapitre 4 (2023) — Cascadeur'
    ],
    film_roles: {
      'the-princess': 'Coordinateur des cascades & Chorégraphe combats',
      'nicky-larson': 'Chorégraphe des combats',
      'furies': 'Action Designer & Combats',
      'james-bond-spectre': 'Cascadeur',
      'fast-furious-6': 'Cascadeur',
      'jason-bourne': 'Cascadeur',
      'john-wick-4': 'Cascadeur'
    }
  },
  {
    id: 'maurice-chan',
    name: 'Maurice Chan',
    role: 'Instructeur Référent',
    title: 'Spécialiste Combats, Chutes & Comédie Martiale',
    notable_credits: [
      'John Wick : Chapitre 4 (2023) — Cascadeur (Combats martiaux)',
      'Lucy (2014, Luc Besson) — Cascadeur & Chorégraphe arts martiaux',
      'The Killer (2024, John Woo) — Cascadeur (Gun-fu & Combats)',
      '007 Spectre (2015) — Cascadeur',
      'Danny the Dog (2005) — Cascadeur',
      'Jack Ryan (Amazon Prime) — Cascadeur',
      'Back to the Future (The Musical) — Cascadeur & Câblage'
    ],
    film_roles: {
      'john-wick-4': 'Cascadeur (Combats martiaux)',
      'lucy': 'Cascadeur & Chorégraphe arts martiaux',
      'the-killer': 'Cascadeur (Gun-fu & Combats)',
      'james-bond-spectre': 'Cascadeur',
      'danny-the-dog': 'Cascadeur'
    }
  },
  {
    id: 'michael-troude',
    name: 'Michaël Troude',
    role: 'Formateur Combat',
    title: 'Spécialiste Actions & Réactions',
    notable_credits: [
      'BAC Nord (2021) — Cascadeur (Affrontements & chutes corporelles)',
      'Athena (2022) — Cascadeur (Impacts & affrontements)',
      'The Substance (2024) — Cascadeur (Chutes sous prothèses)',
      'Elyas (2024) — Cascadeur (Combats tactiques)',
      'Balle Perdue (2020) & Balle Perdue 2 (2022) — Cascadeur',
      'Dunkerque (Dunkirk, 2017) — Cascadeur',
      'Le Transporteur (2002) — Cascadeur',
      'Taken (2008) — Cascadeur',
      'Banlieue 13 (2004) — Cascadeur',
      'Danny the Dog (2005) — Cascadeur',
      'Mortel (2019) — Cascadeur'
    ],
    film_roles: {
      'bac-nord': 'Cascadeur (Affrontements & chutes corporelles)',
      'athena': 'Cascadeur (Impacts & affrontements)',
      'the-substance': 'Cascadeur (Chutes sous prothèses)',
      'elyas': 'Cascadeur (Combats tactiques)',
      'balle-perdue': 'Cascadeur',
      'dunkirk': 'Cascadeur',
      'danny-the-dog': 'Cascadeur',
      'mortel': 'Cascadeur'
    }
  },
  {
    id: 'amedeo-cazzella',
    name: 'Amédéo Cazzella',
    role: 'Formateur Armes & Combats',
    title: 'Spécialiste Combats & Maniement d\'Armes',
    notable_credits: [
      'Le Pacte des loups (2001) — Cascadeur & Escrime scénique',
      'Le Comte de Monte-Cristo (2024) — Cascadeur & Combats d\'époque',
      'Astérix & Obélix : L\'Empire du Milieu (2023) — Cascadeur & Maniement d\'armes',
      'John Wick : Chapitre 4 (2023) — Cascadeur',
      'The Killer (2024) — Cascadeur',
      'Valérian et la Cité des mille planètes (2017) — Cascadeur & Câblage',
      'Anna (2019) — Cascadeur',
      'Lucy (2014) — Cascadeur',
      'Le Transporteur Héritage (2015) — Cascadeur',
      'Taken 2 (2012) — Cascadeur',
      'Raid Dingue (2017) — Cascadeur'
    ],
    film_roles: {
      'le-pacte-des-loups': 'Cascadeur & Escrime scénique',
      'monte-cristo': 'Cascadeur & Combats d\'époque',
      'john-wick-4': 'Cascadeur',
      'the-killer': 'Cascadeur',
      'valerian': 'Cascadeur & Câblage',
      'anna': 'Cascadeur',
      'lucy': 'Cascadeur',
      'le-transporteur-heritage': 'Cascadeur',
      'taken-2': 'Cascadeur',
      'raid-dingue': 'Cascadeur'
    }
  },
  {
    id: 'niels-dalery',
    name: 'Niels Dalery',
    role: 'Formateur Acrobatie & Freerun',
    title: 'Spécialiste Acrobaties & Freerunning',
    notable_credits: [
      'Sous la Seine (2024) — Cascadeur (Acrobaties & cascades subaquatiques)',
      'Champion de France Speed Running (2013) — Titre National',
      'Trigger — Cascadeur & Freerunner',
      'XTreme Gravity — Performer acrobaties & tricks'
    ],
    film_roles: {
      'sous-la-seine': 'Cascadeur (Acrobaties & cascades subaquatiques)'
    }
  },
  {
    id: 'bastien-trouve',
    name: 'Bastien Trouvé',
    role: 'Instructeur & Cascadeur',
    title: 'Cascadeur Professionnel',
    notable_credits: [
      'Largo Winch : Le Prix de l\'argent (2024) — Cascadeur',
      'L\'Amour Ouf (2024) — Cascadeur',
      'Anna (2019) — Cascadeur',
      'Fight concepts cinéma — Performer & Chorégraphe'
    ],
    film_roles: {
      'largo-winch-3': 'Cascadeur',
      'lamour-ouf': 'Cascadeur',
      'anna': 'Cascadeur'
    }
  },
  {
    id: 'alan-cueff',
    name: 'Alan Cueff',
    role: 'Instructeur & Cascadeur',
    title: 'Cascadeur Professionnel & Formateur CUC',
    notable_credits: [
      'Elyas (2024) — Cascadeur (Cascades physiques & tactique)',
      'The Sentinels (2024) — Cascadeur',
      'Anna (2019) — Cascadeur',
      'Quasimodo — Cascadeur & Acrobaties'
    ],
    film_roles: {
      'elyas': 'Cascadeur (Cascades physiques & tactique)',
      'anna': 'Cascadeur'
    }
  }
];

// Nouveaux films clés à insérer dans site_films
const NEW_FILMS = [
  {
    id: 'bagarre',
    title: 'Bagarre',
    year: '2024',
    category: 'Cinéma Français',
    director: 'Julien Royal',
    stunt_roles: 'Action design, combats rapprochés percutants et chorégraphies physiques.',
    doubled_actors: ['Nassim Lyes'],
    highlight: true,
    image: 'https://www.campus-universcascades.com/wp-content/uploads/2024/12/Bagarre.jpg',
    tag: 'ACTION DESIGN',
    imdb_url: 'https://www.imdb.com/title/tt31189772/',
    allocine_url: 'https://www.allocine.fr/film/fichefilm_gen_cfilm=324021.html',
    trailer_url: 'https://www.youtube.com/watch?v=3-Dm59tR_rM',
    cuc_team_involved: ['lucas-dollfus'],
    metadata: {
      cuc_team_roles: {
        'lucas-dollfus': 'Coordinateur des cascades & Action Designer'
      }
    },
    is_published: true,
    order_index: 1
  },
  {
    id: 'nouveaux-riches',
    title: 'Nouveaux Riches',
    year: '2023',
    category: 'Streaming Global',
    director: 'Julien Royal',
    stunt_roles: 'Combats rapprochés, cascades urbaines, chutes physiques et poursuites.',
    doubled_actors: ['Nassim Lyes'],
    highlight: true,
    image: 'https://www.campus-universcascades.com/wp-content/uploads/2024/12/Nouveaux-riches.jpg',
    tag: 'NETFLIX ACTION',
    imdb_url: 'https://www.imdb.com/title/tt27995874/',
    allocine_url: 'https://www.allocine.fr/film/fichefilm_gen_cfilm=317540.html',
    trailer_url: 'https://www.youtube.com/watch?v=J9K4WlQv_tE',
    cuc_team_involved: ['lucas-dollfus'],
    metadata: {
      cuc_team_roles: {
        'lucas-dollfus': 'Coordinateur des cascades'
      }
    },
    is_published: true,
    order_index: 2
  },
  {
    id: 'athena',
    title: 'Athena',
    year: '2022',
    category: 'Streaming Global',
    director: 'Romain Gavras',
    stunt_roles: 'Coordination générale des cascades, plans-séquences d\'émeutes, pyrotechnie et franchissements Parkour.',
    doubled_actors: [],
    highlight: true,
    image: 'https://www.campus-universcascades.com/wp-content/uploads/2024/12/Athena.jpg',
    tag: 'PLAN-SÉQUENCE ACTION',
    imdb_url: 'https://www.imdb.com/title/tt15445056/',
    allocine_url: 'https://www.allocine.fr/film/fichefilm_gen_cfilm=295328.html',
    trailer_url: 'https://www.youtube.com/watch?v=z8BvWJ4jJqQ',
    cuc_team_involved: ['jerome-gaspard', 'malik-diouf', 'michael-troude'],
    metadata: {
      cuc_team_roles: {
        'jerome-gaspard': 'Coordinateur des cascades',
        'malik-diouf': 'Conseiller Franchissement & Parkour',
        'michael-troude': 'Cascadeur (Impacts & affrontements)'
      }
    },
    is_published: true,
    order_index: 3
  },
  {
    id: 'le-pacte-des-loups',
    title: 'Le Pacte des loups',
    year: '2001',
    category: 'Film Culte',
    director: 'Christophe Gans',
    stunt_roles: 'Combats d\'époque, escrime scénique, chutes de hauteur et cascades équestres.',
    doubled_actors: ['Samuel Le Bihan (doublé par Jérôme Gaspard)'],
    highlight: true,
    image: 'https://www.campus-universcascades.com/wp-content/uploads/2024/12/Le-Pacte-des-Loups.jpg',
    tag: 'FILM CULTE ACTION',
    imdb_url: 'https://www.imdb.com/title/tt0252444/',
    allocine_url: 'https://www.allocine.fr/film/fichefilm_gen_cfilm=27765.html',
    trailer_url: 'https://www.youtube.com/watch?v=kYJmQ6oBqB4',
    cuc_team_involved: ['jerome-gaspard', 'amedeo-cazzella'],
    metadata: {
      cuc_team_roles: {
        'jerome-gaspard': 'Cascadeur & Doublure Samuel Le Bihan',
        'amedeo-cazzella': 'Cascadeur (Escrime scénique)'
      }
    },
    is_published: true,
    order_index: 4
  }
];

// Mappage des rôles par film existant
const FILM_ROLES_MAP = {
  'john-wick-4': {
    'vincent-bouillon': 'Cascadeur & Doublure Keanu Reeves (Taurus Award)',
    'lucas-dollfus': 'Cascadeur (Combats et cascades physiques à Paris)',
    'jerome-gaspard': 'Cascadeur',
    'maurice-chan': 'Cascadeur (Arts martiaux)',
    'franck-blanc': 'Cascadeur (Combats & chutes)',
    'amedeo-cazzella': 'Cascadeur',
    'kefi-abrikh': 'Cascadeur'
  },
  'sous-la-seine': {
    'lucas-dollfus': 'Cascadeur (Cascades subaquatiques et physiques)',
    'franck-blanc': 'Cascadeur (Chutes & cascades eau)',
    'niels-dalery': 'Cascadeur (Acrobaties & cascades eau)'
  },
  'lamour-ouf': {
    'vincent-bouillon': 'Cascadeur (Combats)',
    'lucas-dollfus': 'Cascadeur & Câblage',
    'bastien-trouve': 'Cascadeur'
  },
  'largo-winch-3': {
    'vincent-bouillon': 'Cascadeur & Doublure Tomer Sisley',
    'lucas-dollfus': 'Cascadeur',
    'bastien-trouve': 'Cascadeur'
  },
  'the-killer': {
    'vincent-bouillon': 'Stunt Coordinator (Nomination Taurus) & Cascadeur',
    'maurice-chan': 'Cascadeur (Gun-fu & Combats)',
    'franck-blanc': 'Cascadeur & Câblage 3D',
    'amedeo-cazzella': 'Cascadeur'
  },
  'the-substance': {
    'jerome-gaspard': 'Coordinateur des cascades France',
    'michael-troude': 'Cascadeur (Chutes sous prothèses)',
    'vincent-bouillon': 'Cascadeur'
  },
  'le-salaire-de-la-peur': {
    'jerome-gaspard': 'Coordinateur des cascades'
  },
  'machine': {
    'malik-diouf': 'Coordinateur des cascades & Régleur Parkour'
  },
  'valerian': {
    'jerome-gaspard': 'Coordinateur des cascades & Câblage',
    'franck-blanc': 'Cascadeur & Câblage',
    'amedeo-cazzella': 'Cascadeur & Câblage'
  },
  'elyas': {
    'vincent-bouillon': 'Cascadeur (Combats rapprochés)',
    'michael-troude': 'Cascadeur (Combats tactiques)',
    'alan-cueff': 'Cascadeur'
  },
  'fast-furious-6': {
    'jerome-gaspard': 'Cascadeur',
    'kefi-abrikh': 'Cascadeur'
  },
  'james-bond-spectre': {
    'jerome-gaspard': 'Cascadeur',
    'vincent-bouillon': 'Cascadeur',
    'kefi-abrikh': 'Cascadeur',
    'maurice-chan': 'Cascadeur'
  },
  'lucy': {
    'maurice-chan': 'Cascadeur & Chorégraphe martial',
    'jerome-gaspard': 'Cascadeur',
    'amedeo-cazzella': 'Cascadeur'
  },
  'yamakasi': {
    'malik-diouf': 'Acteur principal & Cascadeur Parkour'
  },
  'danny-the-dog': {
    'maurice-chan': 'Cascadeur',
    'michael-troude': 'Cascadeur',
    'amedeo-cazzella': 'Cascadeur'
  },
  'bac-nord': {
    'michael-troude': 'Cascadeur (Affrontements & chutes)',
    'malik-diouf': 'Cascadeur'
  },
  'monte-cristo': {
    'jerome-gaspard': 'Cascadeur',
    'vincent-bouillon': 'Cascadeur',
    'amedeo-cazzella': 'Cascadeur'
  },
  'dunkirk': {
    'jerome-gaspard': 'Cascadeur',
    'michael-troude': 'Cascadeur'
  },
  'fiasco': {
    'malik-diouf': 'Cascadeur'
  },
  'sentinelle': {
    'jerome-gaspard': 'Coordinateur des cascades'
  }
};

async function syncAll() {
  console.log('=== DÉBUT DE LA SYNCHRONISATION PRÉCISE DES COACHS & RÔLES ===');

  // 1. Mettre à jour site_team dans Supabase
  for (const t of TEAM_UPDATES) {
    console.log(`Synchronisation coach ${t.name} (${t.id})...`);
    const { data: existing } = await supabase.from('site_team').select('metadata').eq('id', t.id).maybeSingle();
    const currentMetadata = existing?.metadata || {};
    const updatedMetadata = {
      ...currentMetadata,
      film_roles: t.film_roles
    };

    const { error } = await supabase.from('site_team').update({
      notable_credits: t.notable_credits,
      metadata: updatedMetadata,
      updated_at: new Date().toISOString()
    }).eq('id', t.id);

    if (error) {
      console.error(`Erreur mise à jour site_team ${t.id}:`, error.message);
    } else {
      console.log(`✅ Coach ${t.name} mis à jour avec ${t.notable_credits.length} crédits qualifiés.`);
    }
  }

  // 2. Insérer ou mettre à jour les nouveaux films majeurs
  console.log('\n--- Ajout / Mise à jour des films majeurs dans site_films ---');
  for (const film of NEW_FILMS) {
    const { error } = await supabase.from('site_films').upsert(film);
    if (error) {
      console.error(`Erreur upsert film ${film.id}:`, error.message);
    } else {
      console.log(`✅ Film ${film.title} (${film.id}) enregistré dans Supabase.`);
    }
  }

  // 3. Mettre à jour cuc_team_roles dans site_films pour les films existants
  console.log('\n--- Mise à jour des rôles par film dans site_films ---');
  for (const [filmId, roles] of Object.entries(FILM_ROLES_MAP)) {
    const { data: existingFilm } = await supabase.from('site_films').select('metadata, cuc_team_involved').eq('id', filmId).maybeSingle();
    if (!existingFilm) continue;

    const currentMetadata = existingFilm.metadata || {};
    const mergedMetadata = {
      ...currentMetadata,
      cuc_team_roles: {
        ...(currentMetadata.cuc_team_roles || {}),
        ...roles
      }
    };

    // S'assurer que tous les membres avec un rôle sont aussi dans cuc_team_involved
    const teamInvolved = Array.from(new Set([...(existingFilm.cuc_team_involved || []), ...Object.keys(roles)]));

    const { error } = await supabase.from('site_films').update({
      metadata: mergedMetadata,
      cuc_team_involved: teamInvolved,
      updated_at: new Date().toISOString()
    }).eq('id', filmId);

    if (error) {
      console.error(`Erreur update film ${filmId}:`, error.message);
    } else {
      console.log(`✅ Film ${filmId} mis à jour avec rôles d'équipe.`);
    }
  }

  console.log('\n=== SYNCHRONISATION SUPABASE ACHEVÉE AVEC SUCCÈS ===');
}

syncAll().catch(console.error);
