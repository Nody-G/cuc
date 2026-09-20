import { createClient } from '@/lib/supabase/client';
import { STUNT_PROGRAMS } from '@/data/programs';
import { CUC_TEAM } from '@/data/team';
import { FILMOGRAPHY_CREDITS } from '@/data/filmography';
import { CUC_DISCIPLINES } from '@/data/disciplines';
import { DOUBLED_CELEBRITIES } from '@/data/celebrities';
import { PROGRAMMES_TV, ProgrammeTvItem } from '@/data/videos';
import { OFFICIAL_FILM_BANNERS, FilmBanner } from '@/data/filmBanners';
import { CAMPUS_FACILITIES } from '@/data/campus';
import { CAMPUS_POIS, POI } from '@/components/ui/campus-map/campusMap.data';
import { StuntProgram, Instructor, FilmCredit, Discipline, DoubledCelebrity, InfrastructureSpot } from '@/types';

export interface SiteAnnouncement {
  id: string;
  title: string;
  message: string;
  badge?: string;
  link_url?: string;
  link_text?: string;
  style: 'gold' | 'info' | 'alert' | 'dark';
  is_active: boolean;
}

export interface SiteSession {
  id: string;
  program_id: string;
  date_display: string;
  status: 'complet' | 'ouvert' | 'dernières places' | 'bientôt';
  max_seats?: number;
  booked_seats?: number;
  order_index: number;
}

/**
 * Récupère les programmes de formation avec leurs sessions associées.
 * Bascule automatiquement sur les données locales statiques si Supabase n'est pas configuré ou en cas de panne réseau.
 */
export async function getPrograms(): Promise<StuntProgram[]> {
  try {
    const supabase = createClient();
    const { data: programs, error: progError } = await supabase
      .from('site_programs')
      .select('*')
      .eq('is_published', true)
      .order('order_index', { ascending: true });

    if (progError || !programs || programs.length === 0) {
      return STUNT_PROGRAMS;
    }

    const { data: sessions, error: sessError } = await supabase
      .from('site_sessions')
      .select('*')
      .eq('is_published', true)
      .order('order_index', { ascending: true });

    if (sessError || !sessions) {
      return STUNT_PROGRAMS;
    }

    // Associer les sessions à chaque programme
    return programs.map((p) => {
      const progSessions = sessions
        .filter((s) => s.program_id === p.id)
        .map((s) => ({
          id: s.id,
          cuc_sign_formation_id: s.cuc_sign_formation_id,
          date: s.date_display,
          status: s.status as 'complet' | 'ouvert' | 'dernières places' | 'bientôt',
          booked_seats: s.booked_seats,
          max_seats: s.max_seats,
        }));

      return {
        id: p.id,
        category: p.category,
        title: p.title,
        badge: p.badge || '',
        highlight: p.highlight,
        tagline: p.tagline || '',
        duration: p.duration || '',
        hours: p.hours || '',
        location: p.location || 'Campus CUC — Le Cateau-Cambrésis (59)',
        price: p.price || '',
        priceNote: p.price_note,
        ageRequirement: p.age_requirement || '',
        eligibility: p.eligibility || [],
        nextSessions: progSessions.length > 0 ? progSessions : (STUNT_PROGRAMS.find((sp) => sp.id === p.id)?.nextSessions || []),
        description: p.description || '',
        objectives: p.objectives || [],
        keyModules: p.key_modules || [],
        certification: p.certification,
        ctaText: p.cta_text || 'Postuler',
        brochureUrl: p.brochure_url,
      };
    });
  } catch {
    // Fallback de résilience absolue
    return STUNT_PROGRAMS;
  }
}

/**
 * Récupère l'équipe d'instructeurs.
 */
export async function getTeam(): Promise<Instructor[]> {
  try {
    const supabase = createClient();
    // `featured_credits` et `credits_display_limit` sont optionnelles : si la
    // migration n'a pas encore été appliquée, on retombe sur un select de base
    // pour ne jamais casser l'affichage public.
    let data: any[] | null = null;
    let error: any = null;

    const extended = await supabase
      .from('site_team')
      .select('*, featured_credits, credits_display_limit')
      .eq('is_published', true)
      .order('order_index', { ascending: true });

    if (extended.error) {
      const fallback = await supabase
        .from('site_team')
        .select('*')
        .eq('is_published', true)
        .order('order_index', { ascending: true });
      data = fallback.data;
      error = fallback.error;
    } else {
      data = extended.data;
      error = extended.error;
    }

    if (error || !data || data.length === 0) {
      return CUC_TEAM;
    }

    // Récupération des correspondances de films pour relier les cascades certifiées
    let teamFilmsMap: Record<string, string[]> = {};
    try {
      const { data: filmsData } = await supabase
        .from('site_films')
        .select('id, cuc_team_involved')
        .eq('is_published', true);

      if (filmsData) {
        for (const f of filmsData) {
          if (Array.isArray(f.cuc_team_involved)) {
            for (const memberId of f.cuc_team_involved) {
              if (!teamFilmsMap[memberId]) teamFilmsMap[memberId] = [];
              teamFilmsMap[memberId].push(f.id);
            }
          }
        }
      }
    } catch {
      // Ignorer si échec
    }

    return data.map((t) => ({
      id: t.id,
      name: t.name,
      role: t.role,
      title: t.title,
      specialties: t.specialties || [],
      bio: t.bio || '',
      doubledActors: t.doubled_actors,
      notableCredits: t.notable_credits || [],
      featuredCredits: t.featured_credits || [],
      creditsDisplayLimit:
        typeof t.credits_display_limit === 'number' && t.credits_display_limit > 0
          ? t.credits_display_limit
          : 8,
      externalUrl: t.external_url,
      avatarUrl: t.avatar_url,
      instagram: t.instagram,
      imdb: t.imdb,
      profile_id: t.profile_id || null,
      film_ids: teamFilmsMap[t.id] || [],
      metadata: t.metadata || {},
    }));
  } catch {
    return CUC_TEAM;
  }
}

/**
 * Récupère la filmographie.
 */
export async function getFilms(): Promise<FilmCredit[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('site_films')
      .select('*')
      .eq('is_published', true)
      .order('order_index', { ascending: true });

    if (error || !data || data.length === 0) {
      const { data: settingRow } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'filmography_credits')
        .maybeSingle();

      if (settingRow && Array.isArray(settingRow.value) && settingRow.value.length > 0) {
        return settingRow.value as FilmCredit[];
      }
      return FILMOGRAPHY_CREDITS;
    }

    return data.map((f) => ({
      id: f.id,
      title: f.title,
      year: f.year || '',
      category: f.category || 'Cinéma',
      director: f.director,
      stuntRoles: f.stunt_roles || '',
      description: f.description || '',
      doubledActors: f.doubled_actors,
      highlight: !!f.highlight,
      image: f.image || '',
      tag: f.tag || '',
      imdbUrl: f.imdb_url || '',
      allocineUrl: f.allocine_url || '',
      trailerUrl: f.trailer_url || '',
      cuc_team_involved: f.cuc_team_involved || [],
      cuc_team_roles: f.metadata?.cuc_team_roles || f.cuc_team_roles || {},
    }));
  } catch {
    return FILMOGRAPHY_CREDITS;
  }
}

/**
 * Récupère les célébrités et comédiens doublés par le CUC.
 * Persisté dans Supabase (site_settings key='celebrities').
 */
export async function getCelebrities(): Promise<DoubledCelebrity[]> {
  try {
    const supabase = createClient();
    const { data: row } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'celebrities')
      .maybeSingle();

    if (row?.value?.list && Array.isArray(row.value.list) && row.value.list.length > 0) {
      return row.value.list as DoubledCelebrity[];
    }
    return DOUBLED_CELEBRITIES;
  } catch {
    return DOUBLED_CELEBRITIES;
  }
}

/**
 * Récupère les reportages TV et vidéos d'archives du CUC.
 * Persisté dans Supabase (site_settings key='videos').
 */
export async function getVideos(): Promise<ProgrammeTvItem[]> {
  try {
    const supabase = createClient();
    const { data: row } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'videos')
      .maybeSingle();

    if (row?.value?.list && Array.isArray(row.value.list) && row.value.list.length > 0) {
      return row.value.list as ProgrammeTvItem[];
    }
    return PROGRAMMES_TV;
  } catch {
    return PROGRAMMES_TV;
  }
}

/**
 * Récupère les bannières cinéma panoramiques du CUC.
 * Persisté dans Supabase (site_settings key='film_banners').
 */
export async function getFilmBanners(): Promise<FilmBanner[]> {
  try {
    const supabase = createClient();
    const { data: row } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'film_banners')
      .maybeSingle();

    if (row?.value?.list && Array.isArray(row.value.list) && row.value.list.length > 0) {
      return row.value.list as FilmBanner[];
    }
    return OFFICIAL_FILM_BANNERS;
  } catch {
    return OFFICIAL_FILM_BANNERS;
  }
}

/**
 * Récupère les installations et infrastructures techniques du campus.
 * Persisté dans Supabase (site_settings key='campus_facilities').
 */
export async function getCampusFacilities(): Promise<InfrastructureSpot[]> {
  try {
    const supabase = createClient();
    const { data: row } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'campus_facilities')
      .maybeSingle();

    if (row?.value?.list && Array.isArray(row.value.list) && row.value.list.length > 0) {
      return row.value.list as InfrastructureSpot[];
    }
    return CAMPUS_FACILITIES;
  } catch {
    return CAMPUS_FACILITIES;
  }
}

/**
 * Récupère le bandeau d'alerte / flash info actif (s'il existe).
 */
export async function getActiveAnnouncement(): Promise<SiteAnnouncement | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('site_announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data as SiteAnnouncement;
  } catch {
    return null;
  }
}

export interface LayoutSection {
  id: string;
  name: string;
  order: number;
  is_visible: boolean;
}

export interface SitePageHero {
  badge?: string;
  title: string;
  subtitle: string;
  cta_primary_text?: string;
  cta_primary_link?: string;
  cta_secondary_text?: string;
  cta_secondary_link?: string;
  bg_image?: string;
  video_url?: string;
}

export interface SitePageSection {
  id: string;
  title: string;
  value?: string;
  description?: string;
  content?: string;
  image?: string;
}

export interface SitePageContent {
  slug: string;
  title: string;
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
  hero: SitePageHero;
  sections?: SitePageSection[];
  layout_sections?: LayoutSection[];
  sections_data?: Record<string, any>;
  is_published: boolean;
  updated_at?: string;
}

export function normalizeSlug(slug: string): string {
  if (!slug || slug === '/') return '/';
  return slug.replace(/^\//, '');
}

export const DEFAULT_PAGE_CONTENTS: Record<string, SitePageContent> = {
  '/': {
    slug: '/',
    title: 'Accueil',
    meta_title: "Campus Univers Cascades | 1ère École de Cascadeurs Professionnels d'Europe",
    meta_description: "Centre d'entraînement de cascadeurs professionnels fondé en 2008 par Lucas Dollfus. 11 000 m² d'infrastructures dédiées au cinéma d'action, parkour, combat et cascades.",
    og_image: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/1-lucas.png',
    hero: {
      badge: 'PREMIER CENTRE EUROPÉEN • ACTION DESIGN & CASCADE CINÉMA',
      title: 'CAMPUS UNIVERS CASCADES',
      subtitle: "Le plus grand centre européen d'entraînement et de formation professionnelle de cascadeurs pour le cinéma d'action international.",
      cta_primary_text: 'Découvrir la formation pro',
      cta_primary_link: '/formation-de-cascadeur',
      cta_secondary_text: 'Visite guidée du campus',
      cta_secondary_link: '/visite-guidee',
      bg_image: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg',
    },
    layout_sections: [
      { id: 'hero', name: 'Section Héros Parallaxe', order: 1, is_visible: true },
      { id: 'about', name: 'Dossier Présentation & Piliers', order: 2, is_visible: true },
      { id: 'tournages', name: 'Tournages & Productions Cinéma', order: 3, is_visible: true },
      { id: 'qualiopi', name: 'Agrément Qualiopi & Financements', order: 4, is_visible: true },
      { id: 'partners', name: 'Partenaires Studios & Labels', order: 5, is_visible: true },
      { id: 'social', name: 'Réseaux Sociaux & Communauté', order: 6, is_visible: true },
    ],
    sections_data: {
      about: {
        tag: 'PRÉSENTATION',
        subtag: '• CINÉMA, SÉRIES & SPECTACLE',
        title: 'LE CENTRE DE FORMATION DE RÉFÉRENCE EN CASCADE DE CINÉMA',
        description: "Créé en 2008 par Lucas Dollfus, le Campus Univers Cascades (CUC) est un centre de formation professionnelle dédié aux techniques de cascade physique et mécanique, établi sur un domaine privé de 6 hectares au Cateau-Cambrésis (59).",
        founder_quote: "« Maîtriser le risque, créer l'inédit, repousser les limites de la vérité physique au service de la vision des plus grands réalisateurs. »",
        founder_name: 'LUCAS DOLLFUS',
        founder_role: 'FONDATEUR & RÉGLEUR',
        badge_year: 'DEPUIS 2008',
        image_url: 'https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-5-scaled.jpg',
        cta_primary_text: 'Découvrir la Formation Pro',
        cta_primary_link: '/formation-de-cascadeur',
        cta_secondary_text: "L'Équipe des Cascadeurs",
        cta_secondary_link: '/equipe-cascadeurs-pro',
      },
      tournages: {
        badge: 'ACTION DESIGN & COORDINATION DE CASCADES',
        title: 'TOURNAGES & PRODUCTIONS CINÉMA',
        subtitle: 'De la prévisualisation 3D aux tournages internationaux : le CUC accompagne les plus grands réalisateurs et plateformes mondiales.',
        cta_text: 'Échanger sur votre production',
        cta_link: '/contact-cuc',
      },
      virtual_tour: {
        badge: 'EXPLORATION 360° IMMERSIVE',
        title: 'VISITE VIRTUELLE DU CAMPUS',
        subtitle: "Explorez nos 11 000 m² d'infrastructures de pointe : fosse de chute, dojos de combat, hangars de câblerie et zones de cascades mécaniques.",
        cta_text: "Lancer l'immersion 3D",
        cta_link: '/visite-virtuelle',
      },
      qualiopi: {
        badge: 'FORMATION PROFESSIONNELLE DIPLÔMANTE & CERTIFIÉE',
        title: 'CERTIFICATION QUALIOPI & FINANCEMENTS',
        subtitle: "Nos formations professionnelles répondent aux critères d'exigence du Référentiel National Qualité et sont éligibles aux prises en charge de la formation professionnelle.",
        afdas_badge: 'AFDAS & AFDAS PRO',
        afdas_text: 'Financement total ou partiel pour artistes et intermittents du spectacle.',
        france_travail_badge: 'FRANCE TRAVAIL (AIF)',
        france_travail_text: "Accompagnement et aide individuelle à la formation pour les demandeurs d'emploi.",
        opco_badge: 'OPCO & PLANS ENTREPRISE',
        opco_text: 'Prise en charge via les opérateurs de compétences pour les professionnels.',
      },
      partners: {
        badge: 'COLLABORATIONS & STUDIOS',
        title: 'ILS FONT CONFIANCE AU CAMPUS',
        subtitle: 'Les plus grands diffuseurs, studios de cinéma et productions internationales font appel aux cascadeurs et régleurs formés au CUC.',
      },
      social: {
        badge: 'COMMUNAUTÉ & TOURNAGES',
        title: 'SUIVEZ LE CAMPUS EN DIRECT',
        subtitle: 'Coulisses des entraînements, extraits de tournages et réalisations de nos élèves sur les réseaux officiels du CUC.',
      },
    },
    sections: [
      { id: 'stat_years', title: "Années d'expérience", value: '18 Ans', description: 'Fondé en 2008 par Lucas Dollfus' },
      { id: 'stat_graduates', title: 'Cascadeurs formés', value: '1200+', description: 'Diplômés en activité dans le monde entier' },
      { id: 'stat_productions', title: 'Productions cinéma', value: '150+', description: 'Films, séries et blockbusters internationaux' },
      { id: 'stat_surface', title: 'Superficie totale', value: '11 000 m²', description: 'Infrastructures indoor et outdoor uniques en Europe' },
    ],
    is_published: true,
  },
  'formation-de-cascadeur': {
    slug: 'formation-de-cascadeur',
    title: 'Formation Professionnelle',
    meta_title: 'Formation de Cascadeur Pro en 2 Ans | Campus Univers Cascades',
    meta_description: "Formation professionnelle longue durée de 2 ans. 720h à 800h d'entraînement intensif aux combats, chutes, câblerie, feu et torche humaine.",
    og_image: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-equipe.jpg',
    hero: {
      badge: 'FORMATION PROFESSIONNELLE • 2 ANS',
      title: 'FORMATION PROFESSIONNELLE DE CASCADEUR',
      subtitle: "Un cursus d'excellence de 720h à 800h sur 2 ans pour maîtriser l'ensemble des disciplines de la cascade physique et cinématographique.",
      cta_primary_text: 'Candidater à la sélection',
      cta_primary_link: '/stages-cascades-parkour-2',
      cta_secondary_text: 'Télécharger la brochure',
      cta_secondary_link: '/contact-cuc',
      bg_image: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-equipe.jpg',
    },
    layout_sections: [
      { id: 'hero', name: 'En-tête & Titre Programme', order: 1, is_visible: true },
      { id: 'overview', name: 'Fiche Synthèse (Durée, Lieu, Âge)', order: 2, is_visible: true },
      { id: 'sessions', name: 'Calendrier des Prochaines Sessions', order: 3, is_visible: true },
      { id: 'modules', name: 'Programme Pédagogique Détaillé', order: 4, is_visible: true },
      { id: 'admission', name: "Critères d'Admissibilité & Démarches", order: 5, is_visible: true },
      { id: 'cta', name: 'Bannière Postuler / Contact', order: 6, is_visible: true },
    ],
    sections_data: {
      formules: {
        badge: "PARCOURS D'ADMISSION & CURSUS",
        title: "DU STAGE DÉCOUVERTE AU DIPLÔME PRO",
        subtitle: "L'accès à la formation longue durée est conditionné par la validation du stage découverte. Ce protocole sélectif garantit la sécurité de tous et le niveau d'excellence de la promotion.",
        items: [
          {
            id: 'decouverte',
            step_badge: 'ÉTAPE 01 • SÉLECTION OBLIGATOIRE',
            duration_badge: '80 HEURES',
            title: 'STAGE DÉCOUVERTE & SÉLECTION',
            description: "12 jours consécutifs pour tester vos aptitudes physiques, votre sang-froid et votre capacité d'adaptation avant de postuler au cursus long.",
            duration_text: '12 jours consécutifs (80h de pratique)',
            schedule_text: 'Du lundi au samedi (9h-18h)',
            boarding_text: 'Hébergement & restauration sur place',
            certification_text: 'Bilan d’évaluation personnalisé & attestation de stage',
            cta_text: 'Postuler au Stage Découverte',
            program_id: 'stage-decouverte',
          },
          {
            id: 'pro_longue_duree',
            step_badge: 'ÉTAPE 02 • FORMATION PROFESSIONNELLE',
            duration_badge: '720H À 800H',
            title: 'FORMATION PROFESSIONNELLE 2 ANS',
            description: "Le cursus complet pour devenir cascadeur professionnel certifié. 9 modules intensifs répartis sur 2 ans d'entraînement physique et cinématographique.",
            duration_text: '2 ans (9 à 10 modules de 80h)',
            schedule_text: 'Entraînements intensifs + mises en situation réelles',
            boarding_text: 'Accès illimité aux 11 000 m² d’infrastructures',
            certification_text: 'Agrément Qualiopi & Financements (AFDAS, France Travail)',
            cta_text: 'Candidater au Cursus Pro 2 Ans',
            program_id: 'pro-longue-duree',
          },
        ],
      },
    },
    sections: [
      { id: 'duration', title: 'Durée du cursus', value: '2 Ans', description: 'Cursus structuré de 9 à 10 modules intensifs' },
      { id: 'hours', title: 'Volume pratique', value: '720h à 800h', description: 'Entraînement en conditions réelles de tournage' },
      { id: 'eligibility', title: "Sélection d'entrée", value: 'Stage 12 Jours', description: 'Validation obligatoire du stage découverte préalable' },
    ],
    is_published: true,
  },
  'stages-cascades-parkour-2': {
    slug: 'stages-cascades-parkour-2',
    title: 'Stages & Initiations',
    meta_title: 'Stages de Cascade & Parkour | Campus Univers Cascades',
    meta_description: 'Découvrez nos stages de cascade physique, parkour et cascades cinéma ouverts dès 16 ans. Initiations débutants et perfectionnements intensifs.',
    og_image: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg',
    hero: {
      badge: 'STAGES INTENSIFS TOUS NIVEAUX • DÈS 16 ANS',
      title: 'STAGES DE CASCADE & PARKOUR',
      subtitle: "Du stage découverte immersion 12 jours aux week-ends intensifs, vivez l'entraînement des cascadeurs du cinéma dans des conditions de sécurité absolue.",
      cta_primary_text: 'Voir les prochaines dates',
      cta_primary_link: '#dates',
      cta_secondary_text: "Modalités d'inscription",
      cta_secondary_link: '/contact-cuc',
      bg_image: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg',
    },
    layout_sections: [
      { id: 'hero', name: 'En-tête des Stages', order: 1, is_visible: true },
      { id: 'stages_list', name: 'Catalogue des Stages Thématiques', order: 2, is_visible: true },
      { id: 'sessions', name: 'Calendrier & Disponibilités', order: 3, is_visible: true },
      { id: 'faq', name: 'Questions Fréquentes & Hébergement', order: 4, is_visible: true },
    ],
    sections_data: {
      stages_catalogue: {
        badge: 'CATALOGUE DES STAGES',
        title: 'TOUS NOS FORMATS D’IMMERSION',
        description: "Stages intensifs ouverts dès 16 ans, du week-end découverte à la masterclass de perfectionnement professionnel.",
        items: [
          {
            id: 'stage-decouverte',
            title: 'Stage Découverte Immersion (12 Jours)',
            duration: '12 Jours (80h)',
            badge: 'SÉLECTION OBLIGATOIRE',
            desc: "L'immersion complète au cœur du campus CUC. Entraînement physique, combat scénique, chutes, câblerie et passage obligatoire pour intégrer le cursus pro.",
            tag: 'TOUS NIVEAUX',
          },
          {
            id: 'stage-weekend-parkour',
            title: 'Week-End Cascades & Parkour',
            duration: '2 Jours (16h)',
            badge: 'INITIATION RAPIDE',
            desc: "Découverte des franchissements urbains Yamakasi, réceptions d'impact et acrobaties au sol en toute sécurité sur nos structures intérieures.",
            tag: 'DÈS 16 ANS',
          },
          {
            id: 'masterclass-combat',
            title: 'Masterclass Combat & Action Design',
            duration: '5 Jours (35h)',
            badge: 'PERFECTIONNEMENT',
            desc: "Chorégraphies martiales pour caméras, maniement d'armes d'accessoire, timing d'impact et techniques de réaction au coup.",
            tag: 'NIVEAU AVANCÉ',
          },
          {
            id: 'stage-cablage-feu',
            title: 'Stage Rigging, Câblerie & Torche Humaine',
            duration: '5 Jours (35h)',
            badge: 'SPÉCIALISATION CINÉMA',
            desc: "Vol sur harnais, projections câblées par treuil et protocole de sécurité complet de la torche humaine encadrée par des artificiers certifiés.",
            tag: 'CASCADEURS PROS',
          },
        ],
      },
    },
    sections: [],
    is_published: true,
  },
  'stunt-workshop-cuc': {
    slug: 'stunt-workshop-cuc',
    title: 'Stunt Workshops Masterclass',
    meta_title: 'International Stunt Workshop | Campus Univers Cascades',
    meta_description: "Stage international de cascade en anglais et français. 2 semaines résidentielles d'immersion au Cateau-Cambrésis.",
    og_image: 'https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-8-scaled.jpg',
    hero: {
      badge: 'STAGE INTERNATIONAL • EN ANGLAIS & FRANÇAIS',
      title: 'INTERNATIONAL STUNT WORKSHOP',
      subtitle: "Rejoignez des cascadeurs et performeurs venus du monde entier (USA, UK, Europe, Australie) pour 2 semaines d'immersion totale au CUC.",
      cta_primary_text: 'Apply for Next Session',
      cta_primary_link: '#apply',
      cta_secondary_text: 'Inquire & Information',
      cta_secondary_link: '/contact-cuc',
      bg_image: 'https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-8-scaled.jpg',
    },
    layout_sections: [
      { id: 'hero', name: 'En-tête International Workshop', order: 1, is_visible: true },
      { id: 'highlights', name: 'Chiffres Clés du Stage (14 Jours, 21M)', order: 2, is_visible: true },
      { id: 'disciplines', name: '10 Disciplines Physiques & Cinéma', order: 3, is_visible: true },
      { id: 'boarding', name: 'Hébergement & Logistique Résidentielle', order: 4, is_visible: true },
      { id: 'pricing', name: 'Tarifs Tout Compris & Réservations', order: 5, is_visible: true },
    ],
    sections_data: {},
    sections: [],
    is_published: true,
  },
  'equipe-cascadeurs-pro': {
    slug: 'equipe-cascadeurs-pro',
    title: 'Équipe & Instructeurs',
    meta_title: 'Équipe Pédagogique & Instructeurs | Campus Univers Cascades',
    meta_description: "Découvrez les instructeurs, coordinateurs de cascades et cascadeurs professionnels qui enseignent au CUC.",
    og_image: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-equipe.jpg',
    hero: {
      badge: 'COORDINATEURS & FORMATEURS • CINÉMA INTERNATIONAL',
      title: "L'ÉQUIPE PÉDAGOGIQUE DU CUC",
      subtitle: "Une faculté d'action unique au monde. Des coordinateurs de cascades renommés, des pionniers des Yamakasi et des professionnels en exercice.",
      cta_primary_text: 'Découvrir la formation pro',
      cta_primary_link: '/formation-de-cascadeur',
      cta_secondary_text: 'Prendre contact',
      cta_secondary_link: '/contact-cuc',
      bg_image: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-equipe.jpg',
    },
    layout_sections: [
      { id: 'hero', name: 'En-tête Équipe & Instructeurs', order: 1, is_visible: true },
      { id: 'team_grid', name: 'Trombinoscope & Fiches Formateurs', order: 2, is_visible: true },
      { id: 'supervision', name: 'Encadrement Médical & Sécurité', order: 3, is_visible: true },
    ],
    sections_data: {},
    sections: [],
    is_published: true,
  },
  'cuc-team-cascadeur': {
    slug: 'cuc-team-cascadeur',
    title: 'CUC Team & Action Design',
    meta_title: 'Tournages & CUC Stunt Team | Campus Univers Cascades',
    meta_description: "La CUC Stunt Team accompagne réalisateurs et productions cinéma de la conception des cascades jusqu'au tournage en plateau.",
    og_image: 'https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-8-scaled.jpg',
    hero: {
      badge: 'COORDINATION DE CASCADES • TOURNAGES & CINÉMA',
      title: 'TOURNAGES & CUC STUNT TEAM',
      subtitle: "Le Campus Univers Cascades et la CUC Stunt Team accompagnent les productions avec un vivier de plus de 200 cascadeurs certifiés.",
      cta_primary_text: "Contacter l'Équipe de Production",
      cta_primary_link: '/contact-cuc',
      cta_secondary_text: 'Voir les affiches',
      cta_secondary_link: '#affiches',
      bg_image: 'https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-8-scaled.jpg',
    },
    layout_sections: [
      { id: 'hero', name: 'En-tête Tournages & Régie', order: 1, is_visible: true },
      { id: 'galleries', name: 'Galeries Photos des Tournages HD', order: 2, is_visible: true },
      { id: 'banners', name: 'Compétences & Atouts Techniques', order: 3, is_visible: true },
      { id: 'hall_of_fame', name: 'Affiches & Blockbusters Cinéma', order: 4, is_visible: true },
      { id: 'services', name: 'Prestations de Coordination & Devis', order: 5, is_visible: true },
    ],
    sections_data: {},
    sections: [],
    is_published: true,
  },
  'cuc-events-agence': {
    slug: 'cuc-events-agence',
    title: 'CUC Events Agence',
    meta_title: 'CUC Events | Agence de Spectacles & Cascades en Direct',
    meta_description: "Spectacles vivants, animations airbag géant et team building d'entreprise orchestrés par les cascadeurs professionnels du CUC.",
    og_image: 'https://www.campus-universcascades.com/wp-content/uploads/2025/08/Image1-scaled.jpg',
    hero: {
      badge: 'AGENCE ÉVÉNEMENTIELLE D’ACTION • SHOWS CLÉ EN MAIN',
      title: 'CUC EVENTS : SPECTACLES & ANIMATIONS',
      subtitle: "Marquez les esprits lors de vos festivals, lancements de marque, parcs à thème ou séminaires avec des shows d'action spectaculaires.",
      cta_primary_text: 'Demander un Devis Événementiel',
      cta_primary_link: '/contact-cuc',
      cta_secondary_text: 'Toutes nos vidéos de shows',
      cta_secondary_link: '/videos-cascadeur',
      bg_image: 'https://www.campus-universcascades.com/wp-content/uploads/2025/08/Image1-scaled.jpg',
    },
    layout_sections: [
      { id: 'hero', name: 'En-tête Agence CUC Events', order: 1, is_visible: true },
      { id: 'pillars', name: 'Trois Piliers Majeurs (Shows, Airbag, Team Building)', order: 2, is_visible: true },
      { id: 'partners', name: 'Partenaires & Diffuseurs Événements', order: 3, is_visible: true },
      { id: 'guarantees', name: 'Garanties Sécurité & Devis Rapide', order: 4, is_visible: true },
    ],
    sections_data: {},
    sections: [],
    is_published: true,
  },
  'team-building-cascades': {
    slug: 'team-building-cascades',
    title: 'Team Building',
    meta_title: 'Team Building Cinéma & Cascades | CUC Events',
    meta_description: "Séminaires d'entreprise et cohésion d'équipe dans les coulisses du cinéma : combat chorégraphié, doublage voix et dépassement de soi.",
    og_image: 'https://www.campus-universcascades.com/wp-content/uploads/2021/07/Team-building-combat-cinema-1.jpg',
    hero: {
      badge: 'SÉMINAIRES & ENTREPRISES • COHÉSION D’ÉQUIPE',
      title: 'TEAM BUILDING D’EXCEPTION',
      subtitle: "Offrez à vos équipes une expérience fédératrice hors du commun : cascades de cinéma, doublage vocal et cascade physique encadrées par des pros.",
      cta_primary_text: 'Demander un Devis Séminaire',
      cta_primary_link: '/contact-cuc',
      cta_secondary_text: 'Toutes les Offres CUC Events',
      cta_secondary_link: '/cuc-events-agence',
      bg_image: 'https://www.campus-universcascades.com/wp-content/uploads/2021/07/Team-building-combat-cinema-1.jpg',
    },
    layout_sections: [
      { id: 'hero', name: 'En-tête Team Building Entreprise', order: 1, is_visible: true },
      { id: 'workshops', name: 'Ateliers Pratiques (Combat, Airbag, Doublage)', order: 2, is_visible: true },
      { id: 'pedagogy', name: 'Objectifs Managériaux & Confiance', order: 3, is_visible: true },
      { id: 'quote', name: 'Demande de Devis sur Mesure', order: 4, is_visible: true },
    ],
    sections_data: {
      overview: {
        badge: 'SÉMINAIRES & ENTREPRISES',
        title: 'DES ATELIERS SUR MESURE POUR VOTRE ÉQUIPE',
        description: "Offrez à vos collaborateurs une expérience fédératrice hors du commun : cascades de cinéma, doublage vocal et cascade physique encadrées par des professionnels certifiés.",
        capacity: '10 à 300 personnes',
        location: 'Sur notre domaine de 6 hectares ou sur le lieu de votre séminaire',
        duration: 'Demi-journée, journée ou nocturne',
      },
      workshops: [
        {
          id: 'airbag',
          title: "Chute de Hauteur sur Airbag",
          category: "Adrénaline & Confiance",
          desc: "En intérieur comme en extérieur, faites goûter à vos collaborateurs les sensations de la chute libre sur coussin d'air géant de cinéma. Dépassement de soi et cohésion collective garantie.",
          img: "https://www.campus-universcascades.com/wp-content/uploads/2021/07/Team-building-chute-hauteur-1.jpg",
        },
        {
          id: 'combat',
          title: "Combats au Cinéma",
          category: "Chorégraphie & Précision",
          desc: "Initiation aux techniques de combats de films : esquives, feintes, coups scéniques et synchronisation avec les axes caméra.",
          img: "https://www.campus-universcascades.com/wp-content/uploads/2021/07/Team-building-combat-cinema-1.jpg",
        },
        {
          id: 'parkour',
          title: "Parkour & Yamakasi",
          category: "Agilité & Mouvement",
          desc: "Initiation encadrée par des cascadeurs professionnels et spécialistes du déplacement urbain : franchissements d'obstacles, sauts de précision et motricité.",
          img: "https://www.campus-universcascades.com/wp-content/uploads/2021/07/Team-building-parkour-1.jpg",
        },
        {
          id: 'sfx',
          title: "Maquillage Effets Spéciaux (SFX)",
          category: "Coulisses & Cinéma",
          desc: "Découvrez les secrets des maquilleurs de cinéma : création de blessures ultra-réalistes, fausses cicatrices, impacts de balles et prothèses d'action.",
          img: "https://www.campus-universcascades.com/wp-content/uploads/2021/07/Team-building-maquillage.jpg",
        },
        {
          id: 'doublage',
          title: "Doublage de Voix & Post-Production",
          category: "Créativité & Voix",
          desc: "Mettez-vous dans la peau d'un comédien de doublage ! Enregistrez en équipe les répliques et bruitages de séquences cultes du cinéma d'action.",
          img: "https://www.campus-universcascades.com/wp-content/uploads/2021/07/Team-building-doublage-voix.jpg",
        },
      ],
    },
    sections: [],
    is_published: true,
  },
  'spectacles-cascadeurs-yamakasi': {
    slug: 'spectacles-cascadeurs-yamakasi',
    title: 'Spectacles Yamakasi',
    meta_title: 'Spectacles de Cascadeurs & Shows Yamakasi | CUC Events',
    meta_description: "Spectacles vivants d'action, combats chorégraphiés et acrobaties urbaines Yamakasi pour vos événements, festivals et parcs.",
    og_image: 'https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-8-scaled.jpg',
    hero: {
      badge: 'LE CINÉMA S’INVITE SUR SCÈNE • SHOWS CLÉ EN MAIN',
      title: 'SPECTACLES CASCADEURS & YAMAKASI',
      subtitle: "Des performances scéniques explosives alliant voltige urbaine Yamakasi, combats chorégraphiés, pyrotechnie et cascades de haute précision.",
      cta_primary_text: 'Réserver un Spectacle',
      cta_primary_link: '/contact-cuc',
      cta_secondary_text: 'Voir les vidéos de shows',
      cta_secondary_link: '/videos-cascadeur',
      bg_image: 'https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-8-scaled.jpg',
    },
    layout_sections: [
      { id: 'hero', name: 'En-tête Spectacles & Shows Vivants', order: 1, is_visible: true },
      { id: 'shows_catalog', name: 'Formats Scéniques (Intérieur, Extérieur, Eau)', order: 2, is_visible: true },
      { id: 'technical', name: 'Régie & Fiche Technique Clé en Main', order: 3, is_visible: true },
      { id: 'booking', name: 'Bannière Réservation & Disponibilités', order: 4, is_visible: true },
    ],
    sections_data: {},
    sections: [],
    is_published: true,
  },
  'animations-airbag-parkour': {
    slug: 'animations-airbag-parkour',
    title: 'Animations Airbag',
    meta_title: 'Animation Airbag Géant de Chute Libre & Parkour | CUC Events',
    meta_description: "Faites vivre le grand frisson du saut dans le vide sur coussin d'air géant de cinéma. Animation encadrée par des cascadeurs professionnels.",
    og_image: 'https://www.campus-universcascades.com/wp-content/uploads/2021/07/xtrem-jump-1.png',
    hero: {
      badge: 'AIRBAG DE CINÉMA • ENCADREMENT PROFESSIONNEL',
      title: 'ANIMATIONS AIRBAG & PARKOUR',
      subtitle: "Faites vivre au grand public les sensations uniques de la chute libre sur coussin d'air géant de cinéma dans un cadre sécurisé.",
      cta_primary_text: 'Devis Animation Airbag',
      cta_primary_link: '/contact-cuc',
      cta_secondary_text: 'Toutes les Offres CUC Events',
      cta_secondary_link: '/cuc-events-agence',
      bg_image: 'https://www.campus-universcascades.com/wp-content/uploads/2021/07/xtrem-jump-1.png',
    },
    layout_sections: [
      { id: 'hero', name: 'En-tête Animation Airbag Géant', order: 1, is_visible: true },
      { id: 'stats', name: 'Statistiques & Record de Sauts', order: 2, is_visible: true },
      { id: 'security', name: 'Normes de Sécurité & Homologations', order: 3, is_visible: true },
      { id: 'quote', name: 'Formulaire de Devis Express', order: 4, is_visible: true },
    ],
    sections_data: {},
    sections: [],
    is_published: true,
  },
  'visite-virtuelle': {
    slug: 'visite-virtuelle',
    title: 'Visite Virtuelle 360°',
    meta_title: 'Visite Virtuelle 360° & Plan 3D du Campus | CUC',
    meta_description: "Explorez les 11 000 m² du Campus Univers Cascades en immersion 360° ou via le plan topographique 3D interactif.",
    og_image: 'https://www.campus-universcascades.com/wp-content/uploads/2020/11/img-campus-2.jpg',
    hero: {
      badge: 'IMMERSION 360° & PLAN 3D • 6 HECTARES',
      title: 'DÉCOUVRIR LE CAMPUS',
      subtitle: "Explorez nos 11 000 m² d'infrastructures de pointe : fosse de chute, dojos, hangars de câblerie et tour de saut 21 mètres.",
      cta_primary_text: 'Visite Virtuelle 360°',
      cta_primary_link: '#viewer',
      cta_secondary_text: 'Plan 3D Interactif',
      cta_secondary_link: '#plan-3d-campus',
      bg_image: 'https://www.campus-universcascades.com/wp-content/uploads/2020/11/img-campus-2.jpg',
    },
    layout_sections: [
      { id: 'hero', name: 'En-tête Visite Virtuelle', order: 1, is_visible: true },
      { id: 'viewer', name: 'Visualiseur Panoramique 360° & 3D', order: 2, is_visible: true },
      { id: 'facilities', name: 'Détails des Bâtiments & Équipements', order: 3, is_visible: true },
    ],
    sections_data: {},
    sections: [],
    is_published: true,
  },
  'visite-guidee': {
    slug: 'visite-guidee',
    title: 'Visite Guidée',
    meta_title: 'Visite Guidée des Infrastructures du Campus | CUC',
    meta_description: "Découvrez en détail les installations du CUC : tour de saut 21m, 1300 m² de hangars, dojo de combat, fosse de réception et hébergement.",
    og_image: 'https://www.campus-universcascades.com/wp-content/uploads/2020/11/img-campus-2.jpg',
    hero: {
      badge: 'INFRASTRUCTURES DE FORMATION • 6 HECTARES',
      title: 'VISITE GUIDÉE DU CAMPUS',
      subtitle: "Découvrez les 6 hectares d'infrastructures du CUC : tour de saut 21m, 1300 m² de hangars, dojos, hébergement et studio parisien.",
      cta_primary_text: 'Plan 3D du Domaine (6 Ha)',
      cta_primary_link: '#plan-3d-domaine',
      cta_secondary_text: 'Galerie Photos HD',
      cta_secondary_link: '#photos',
      bg_image: 'https://www.campus-universcascades.com/wp-content/uploads/2020/11/img-campus-2.jpg',
    },
    layout_sections: [
      { id: 'hero', name: 'En-tête Visite Guidée & Chiffres Clés', order: 1, is_visible: true },
      { id: 'plan_3d', name: 'Plan 3D Interactif du Domaine', order: 2, is_visible: true },
      { id: 'virtual_tour', name: 'Visite Virtuelle 360° (HD Media)', order: 3, is_visible: true },
      { id: 'facilities', name: 'Fiches Détaillées des Équipements', order: 4, is_visible: true },
      { id: 'photos', name: 'Galerie Photos HD du Campus', order: 5, is_visible: true },
      { id: 'access', name: 'Accès Routier, Train & Hébergement', order: 6, is_visible: true },
    ],
    sections_data: {},
    sections: [],
    is_published: true,
  },
  'videos-cascadeur': {
    slug: 'videos-cascadeur',
    title: 'Vidéothèque',
    meta_title: 'Reportages TV & Vidéos de Cascades | Campus Univers Cascades',
    meta_description: "Retrouvez les reportages diffusés aux JT de TF1 et France 2 sur le CUC ainsi que les showreels des cascadeurs du campus.",
    og_image: 'https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-5-scaled.jpg',
    hero: {
      badge: 'REPORTAGES TÉLÉVISION • TF1 JT 20H • FRANCE 2',
      title: 'LES REPORTAGES & VIDÉOS DU CUC',
      subtitle: "Découvrez les coulisses de l'entraînement des cascadeurs avec les reportages de TF1, France 2 et les showreels du Campus Univers Cascades.",
      cta_primary_text: 'Reportage TF1 (JT 20H)',
      cta_primary_link: '#tf1',
      cta_secondary_text: 'Reportage France 2',
      cta_secondary_link: '#france2',
      bg_image: 'https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-5-scaled.jpg',
    },
    layout_sections: [
      { id: 'hero', name: 'En-tête Vidéos & Émissions TV', order: 1, is_visible: true },
      { id: 'player', name: 'Lecteur Vidéo Principal (TF1 / France 2)', order: 2, is_visible: true },
      { id: 'gallery', name: 'Grille des Reportages & Démos Dailymotion', order: 3, is_visible: true },
    ],
    sections_data: {},
    sections: [],
    is_published: true,
  },
  'partenaires': {
    slug: 'partenaires',
    title: 'Partenaires',
    meta_title: 'Nos Partenaires, Studios & Équipementiers | CUC',
    meta_description: "Le Campus Univers Cascades collabore avec les plus grandes marques de protection, studios de cinéma et institutions certifiées.",
    og_image: 'https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-6-scaled.jpg',
    hero: {
      badge: 'ILS NOUS ACCOMPAGNENT • MARQUES & INSTITUTIONS',
      title: 'NOS PARTENAIRES',
      subtitle: "Le Campus Univers Cascades travaille avec des marques, fabricants et institutions reconnus dans leurs domaines : équipement, protection et formation.",
      cta_primary_text: 'Devenir Partenaire',
      cta_primary_link: '/contact-cuc',
      cta_secondary_text: 'Voir les certifications',
      cta_secondary_link: '#certifications',
      bg_image: 'https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-6-scaled.jpg',
    },
    layout_sections: [
      { id: 'hero', name: 'En-tête Partenaires', order: 1, is_visible: true },
      { id: 'partners_grid', name: 'Annuaire des Partenaires par Catégorie', order: 2, is_visible: true },
      { id: 'cta', name: 'Bannière Collaborer avec le CUC', order: 3, is_visible: true },
    ],
    sections_data: {},
    sections: [],
    is_published: true,
  },
  'contact-cuc': {
    slug: 'contact-cuc',
    title: 'Contact & Projets',
    meta_title: 'Contact & Projets | Campus Univers Cascades • Action Design & Formations',
    meta_description: "Productions cinéma, action design, formations professionnelles de cascadeurs, stages et événements : contactez l'équipe du Campus Univers Cascades.",
    og_image: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg',
    hero: {
      badge: 'CONTACT & ADMISSIONS',
      title: 'CONTACT & PROJETS',
      subtitle: "Productions cinématographiques, action design, formations professionnelles, stages ou événements d'entreprise : échangez directement avec les équipes du CUC.",
      cta_primary_text: 'Démarrer un projet',
      cta_primary_link: '#formulaire',
      cta_secondary_text: 'Venir au campus',
      cta_secondary_link: '#campus-map-hub',
      bg_image: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg',
    },
    layout_sections: [
      { id: 'hero', name: 'En-tête Contact & Plan d Accès', order: 1, is_visible: true },
      { id: 'info_cards', name: 'Coordonnées, Horaires & Téléphones', order: 2, is_visible: true },
      { id: 'contact_form', name: 'Formulaire de Message Direct', order: 3, is_visible: true },
      { id: 'map_location', name: 'Carte & Accès Campus', order: 4, is_visible: true },
    ],
    sections_data: {
      access_info: {
        badge: 'ACCÈS & TRANSPORTS',
        title: 'COMMENT VENIR AU DOMAINE CUC',
        description: 'Le Domaine CUC de 6 hectares est situé au Cateau-Cambrésis (59360), au carrefour des grandes métropoles européennes.',
        train_info: 'Gare du Cateau (10 min) ou Valenciennes / Cambrai (30 min). Liaisons directes en 1h30 depuis Paris Nord.',
        car_info: 'Autoroutes A2 et A26. À 1h15 de Lille, 1h45 de Bruxelles et 2h de Paris.',
        parking_info: 'Grand parking privé gratuit pour autocars, camions régie et véhicules individuels.',
        schedule_info: 'Secrétariat et accueil ouverts du lundi au vendredi de 9h00 à 18h30.',
      },
    },
    sections: [],
    is_published: true,
  },
};

export interface SitePartner {
  id: string;
  name: string;
  category: 'cinema' | 'institutionnel' | 'materiel' | 'media';
  logo_url: string;
  website_url?: string;
  description?: string;
  order_index?: number;
  is_published?: boolean;
}

export interface SiteEvent {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  description?: string;
  features?: string[];
  price_indicator?: string;
  cta_text?: string;
  cta_link?: string;
  image_url?: string;
  order_index?: number;
  is_published?: boolean;
}

export interface SiteSettings {
  // Identité & Campus
  school_name?: string;
  tagline?: string;
  campus_surface?: string;
  founding_year?: string;
  founder_name?: string;

  // Coordonnées Directes & Standard
  phone?: string;
  emergency_phone?: string;
  email_general?: string;
  email_admissions?: string;
  email_events?: string;
  address?: string;
  opening_hours?: string;
  campus_access_info?: string;

  // Accréditations & Certifications Officielles
  qualiopi_number?: string;
  qualiopi_url?: string;
  afdas_status?: string;
  france_travail_code?: string;

  // Boutons d'Action & Navigation Vitrine
  hero_primary_cta_text?: string;
  hero_primary_cta_url?: string;
  hero_secondary_cta_text?: string;
  hero_secondary_cta_url?: string;

  // Bandeau d'Alerte / Urgence Globale
  emergency_active?: boolean;
  emergency_badge?: string;
  emergency_message?: string;
  emergency_link_text?: string;
  emergency_link_url?: string;
  emergency_style?: 'gold' | 'alert' | 'info' | 'dark';

  // Thème & Charte Graphique
  accent_color?: string;

  // Réseaux Sociaux & Mentions Légales
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  facebook?: string;
  tiktok?: string;
  footer_copyright?: string;
}

export const DEFAULT_PARTNERS: SitePartner[] = [
  {
    id: 'qualiopi',
    name: 'Qualiopi',
    category: 'institutionnel',
    logo_url: '/images/partenaires/qualiopi.png',
    website_url: 'https://www.campus-universcascades.com/wp-content/uploads/2024/12/21452296-CHALLENGE-EUROPE-PRODUCTIONS-Qualiopi.pdf',
    description: 'Certification qualité des actions de formation (éligible AFDAS, France Travail).',
    order_index: 1,
    is_published: true,
  },
  {
    id: 'nike',
    name: 'Nike',
    category: 'materiel',
    logo_url: '/images/partenaires/nike.jpg',
    website_url: 'https://www.nike.com',
    description: "Équipementier sportif (textiles et chaussures de sport).",
    order_index: 2,
    is_published: true,
  },
  {
    id: 'rxr-protect',
    name: 'RXR Protect',
    category: 'materiel',
    logo_url: '/images/partenaires/rxr-protect.jpg',
    website_url: 'https://www.rxrprotect.com',
    description: "Gilets et équipements de protection corporelle gonflables (technologie Air Shock Absorber).",
    order_index: 3,
    is_published: true,
  },
  {
    id: 'gravity',
    name: 'Gravity',
    category: 'materiel',
    logo_url: '/images/partenaires/gravity.jpg',
    description: "Vêtements et streetwear pour le parkour et le freerunning.",
    order_index: 4,
    is_published: true,
  },
  {
    id: 'c17',
    name: 'C17 Special Effects',
    category: 'materiel',
    logo_url: '/images/partenaires/c17.jpg',
    website_url: 'https://c17sfx.com',
    description: "Effets spéciaux physiques, pyrotechnie et armurerie pour le cinéma.",
    order_index: 5,
    is_published: true,
  },
  {
    id: 'kiloutou',
    name: 'Kiloutou',
    category: 'materiel',
    logo_url: '/images/partenaires/kiloutou.jpg',
    website_url: 'https://www.kiloutou.fr',
    description: "Location de nacelles élévatrices, engins de levage et matériel de chantier.",
    order_index: 6,
    is_published: true,
  },
  {
    id: 'tm-incendie',
    name: 'TM Incendie',
    category: 'materiel',
    logo_url: '/images/partenaires/tm-incendie.jpg',
    description: "Vente et maintenance d'équipements de sécurité incendie et extincteurs.",
    order_index: 7,
    is_published: true,
  },
  {
    id: 'action-cascade',
    name: 'Action Cascade',
    category: 'cinema',
    logo_url: '/images/partenaires/action-cascade.jpg',
    website_url: 'https://www.instagram.com/actioncascade/',
    description: "Équipe de cascadeurs et coordination de cascades pour les tournages et spectacles.",
    order_index: 8,
    is_published: true,
  },
  {
    id: 'aya-catch',
    name: 'AYA Catch',
    category: 'cinema',
    logo_url: '/images/partenaires/aya-catch.jpg',
    website_url: 'https://www.youtube.com/@ayacatch',
    description: "École et association française de catch professionnel et lutte scénarisée.",
    order_index: 9,
    is_published: true,
  },
  {
    id: 'cascade-demo-team',
    name: 'Cascade Demo Team',
    category: 'cinema',
    logo_url: '/images/partenaires/cascade-demo-team.jpg',
    website_url: 'https://www.instagram.com/cascadedemoteam/',
    description: "Troupe de démonstration d'arts martiaux artistiques (XMA) et acrobaties martiales.",
    order_index: 10,
    is_published: true,
  },
  {
    id: 'xtrem-video',
    name: 'Xtrem Video',
    category: 'media',
    logo_url: '/images/partenaires/xtrem-video.jpg',
    website_url: 'https://www.youtube.com/@XtremVideo',
    description: "Production et distribution de contenus vidéo de sports d'action et extrêmes.",
    order_index: 11,
    is_published: true,
  },
  {
    id: 'taffcoeur',
    name: 'TaffCoeur',
    category: 'media',
    logo_url: '/images/partenaires/taffcoeur.jpg',
    description: "Studio de réalisation vidéo, clips et captations de spectacles.",
    order_index: 12,
    is_published: true,
  },
  {
    id: 'mfr-le-cateau',
    name: 'MFR Le Cateau-Cambrésis',
    category: 'institutionnel',
    logo_url: '/images/partenaires/mfr-le-cateau.jpg',
    website_url: 'https://www.mfr.fr/',
    description: "Hébergement et restauration des stagiaires au Cateau-Cambrésis.",
    order_index: 13,
    is_published: true,
  },
  {
    id: 'bsn',
    name: 'BSN Nutrition',
    category: 'materiel',
    logo_url: '/images/partenaires/bsn.jpg',
    website_url: 'https://www.gobsn.com',
    description: "Nutrition sportive et compléments alimentaires pour athlètes.",
    order_index: 14,
    is_published: true,
  },
];

export const DEFAULT_EVENTS: SiteEvent[] = [
  {
    id: 'spectacles-cascades',
    title: 'Spectacles de Cascades & Shows Yamakasi',
    subtitle: 'Combats chorégraphiés, voltige urbaine et pyrotechnie en direct',
    badge: 'PRESTATIONS & SHOWS EN DIRECT',
    description: 'Spectacles vivants sur-mesure pour parcs, festivals, lancements de produit et grands événements. Combats chorégraphiés, voltige Yamakasi, chutes de hauteur et torches humaines.',
    features: [
      'Cascadeurs professionnels diplômés',
      'Combats chorégraphiés (médiéval, contemporain, SFX)',
      'Torches humaines et pyrotechnie homologuée',
      'Régie technique et sécurité intégrale',
    ],
    price_indicator: 'Sur devis',
    cta_text: 'Découvrir les Spectacles',
    cta_link: '/spectacles-cascadeurs-yamakasi',
    image_url: 'https://www.campus-universcascades.com/wp-content/uploads/2021/05/Photos-Spectacle-300x200.jpg',
    order_index: 1,
    is_published: true,
  },
  {
    id: 'animations-airbag',
    title: 'Animations & FreeJump Airbag',
    subtitle: 'Sauts dans le vide sur coussin d’air géant de cinéma',
    badge: 'SENSATIONS FORTES GRAND PUBLIC',
    description: 'Faites vivre au grand public les sensations uniques de la chute libre sur coussin d’air géant (sauts de 4 à 8 mètres). Encadrement assuré par des cascadeurs professionnels certifiés.',
    features: [
      '+20 000 chutes encadrées en sécurité',
      'Airbag géant homologué cinéma & spectacle',
      'Ateliers d’initiation au parkour avec les Yamakasi',
      'Assurance professionnelle et encadrement certifié',
    ],
    price_indicator: 'Sur devis',
    cta_text: 'Découvrir les Animations',
    cta_link: '/animations-airbag-parkour',
    image_url: 'https://www.campus-universcascades.com/wp-content/uploads/2021/06/FreeJump-CCJ-Puteaux-03-300x200.jpg',
    order_index: 2,
    is_published: true,
  },
  {
    id: 'team-building-cinema',
    title: 'Team Building Cinéma d’Action',
    subtitle: 'Immersion entreprise sur le domaine de 6 hectares du CUC',
    badge: 'SÉMINAIRES & IMMERSION ENTREPRISE',
    description: 'Fédérez vos équipes lors d’un séminaire d’action inoubliable : tournage de faux trailer d’action, combat cinéma, doublage vocal et saut airbag. Accueil jusqu’à 90 personnes avec hébergement et restauration.',
    features: [
      'Ateliers cinéma indoor et cascades physiques',
      'Initiation combat cinéma et axes caméra',
      'Atelier doublage de voix & effets spéciaux (SFX)',
      'Hébergement et restauration sur site (domaine 6 Ha)',
    ],
    price_indicator: 'Sur devis',
    cta_text: 'Organiser un Team Building',
    cta_link: '/team-building-cascades',
    image_url: 'https://www.campus-universcascades.com/wp-content/uploads/2021/07/Team-building-combat-cinema-1.jpg',
    order_index: 3,
    is_published: true,
  },
];

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  school_name: "Campus Univers Cascades",
  tagline: "Le Plus Grand Centre de Formation de Cascadeurs au Monde",
  campus_surface: "11 000 m² (Domaine de 6 hectares)",
  founding_year: "2008",
  founder_name: "Lucas Dollfus",

  phone: "+33 (0)6 72 84 94 92",
  emergency_phone: "+33 (0)6 72 84 94 92",
  email_general: "contact@campus-universcascades.com",
  email_admissions: "formations@campus-universcascades.com",
  email_events: "events@campus-universcascades.com",
  address: "Domaine CUC, 70 Rue Faidherbe, 59360 Le Cateau-Cambrésis",
  opening_hours: "Lundi au Vendredi : 8h30 - 18h00 • Samedi sur sessions de stage",
  campus_access_info: "Gare SNCF Le Cateau (1h40 de Paris Gare du Nord direct) • Navette privée CUC",

  qualiopi_number: "21452296",
  qualiopi_url: "https://www.campus-universcascades.com/wp-content/uploads/2024/12/21452296-CHALLENGE-EUROPE-PRODUCTIONS-Qualiopi.pdf",
  afdas_status: "Prise en charge AFDAS certifiée pour artistes et techniciens du spectacle",
  france_travail_code: "Éligible Aide Individuelle à la Formation (AIF)",

  hero_primary_cta_text: "Contact & Projets",
  hero_primary_cta_url: "/contact-cuc",
  hero_secondary_cta_text: "Visite Guidée 3D",
  hero_secondary_cta_url: "/visite-virtuelle",

  emergency_active: false,
  emergency_badge: "CUC INFO",
  emergency_message: "Inscriptions ouvertes pour la session de formation professionnelle 2026-2027.",
  emergency_link_text: "En savoir plus",
  emergency_link_url: "/stages-cascades-parkour-2",
  emergency_style: "gold",

  accent_color: "#FFE500",

  instagram: "https://www.instagram.com/campus.univers.cascades/",
  youtube: "https://www.youtube.com/@campusuniverscascades",
  linkedin: "",
  facebook: "https://www.facebook.com/campus.univers.cascades",
  tiktok: "https://www.tiktok.com/@campus.univers.cascades",
  footer_copyright: "© 2008 - 2026 Campus Univers Cascades. Tous droits réservés."
};

/**
 * Récupère le contenu détaillé de toutes les pages configurées dans le CMS.
 */
export async function getAllPages(): Promise<SitePageContent[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('site_pages')
      .select('*')
      .order('slug', { ascending: true });

    if (error || !data) return [];
    return data as SitePageContent[];
  } catch {
    return [];
  }
}

/**
 * Récupère le contenu détaillé d'une page spécifique (Hero, sections, SEO).
 */
export async function getPageContent(slug: string): Promise<SitePageContent | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('site_pages')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) return null;
    return data as SitePageContent;
  } catch {
    return null;
  }
}

/**
 * Récupère la liste des partenaires (cinéma, institutionnels, marques).
 */
export async function getPartners(): Promise<SitePartner[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('site_partners')
      .select('*')
      .eq('is_published', true)
      .order('order_index', { ascending: true });

    if (error || !data || data.length === 0) return DEFAULT_PARTNERS;
    return data as SitePartner[];
  } catch {
    return DEFAULT_PARTNERS;
  }
}

/**
 * Récupère les prestations CUC Events (team building, shows, airbag).
 */
export async function getEvents(): Promise<SiteEvent[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('site_events')
      .select('*')
      .eq('is_published', true)
      .order('order_index', { ascending: true });

    if (error || !data || data.length === 0) return DEFAULT_EVENTS;
    return data as SiteEvent[];
  } catch {
    return DEFAULT_EVENTS;
  }
}

/**
 * Récupère les coordonnées et paramètres globaux du site.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'general')
      .maybeSingle();

    if (error || !data?.value) return DEFAULT_SITE_SETTINGS;
    return { ...DEFAULT_SITE_SETTINGS, ...(data.value as SiteSettings) };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export interface SiteInquiry {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  program_id: string;
  program_title?: string;
  age?: string;
  sport_background?: string;
  session_date?: string;
  afdas_status?: string;
  message: string;
  status: 'nouveau' | 'en_cours' | 'admis' | 'refuse' | 'archive';
  admin_notes?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at?: string;
}

export interface AuditLogEntry {
  id: string;
  user_name: string;
  action: string;
  entity: string;
  details?: string;
  created_at: string;
}

export const SAMPLE_INQUIRIES: SiteInquiry[] = [
  {
    id: 'inq-1',
    full_name: 'Maxime Lefebvre',
    email: 'm.lefebvre.gym@gmail.com',
    phone: '06 14 28 39 50',
    program_id: 'pro-longue-duree',
    program_title: 'Formation Professionnelle 2 ans',
    age: '21 ans',
    sport_background: 'Gymnastique artistique haut niveau (12 ans), Parkour & Tricking',
    session_date: 'Septembre 2026',
    afdas_status: 'Demandeur d’emploi / Financement individuel',
    message: 'Passionné de cascade physique et de cinéma d’action, je souhaite intégrer la promotion 2026. Disponible pour les auditions physiques au Cateau-Cambrésis.',
    status: 'nouveau',
    admin_notes: 'Profil physique très prometteur. Dossier de candidature complet reçu.',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'inq-2',
    full_name: 'Camille Vasseur',
    email: 'camille.vasseur.pro@outlook.fr',
    phone: '06 82 45 10 99',
    program_id: 'stage-afdas-pro',
    program_title: 'Stage Professionnel AFDAS',
    age: '27 ans',
    sport_background: 'Comédienne comédie musicale, escrime de spectacle, boxe thaï',
    session_date: 'Juillet 2026',
    afdas_status: 'Intermittent du spectacle (AFDAS accordé)',
    message: 'Comédienne intermittente, je cherche à perfectionner mes compétences en combat chorégraphié et chutes câblées pour de futurs tournages.',
    status: 'en_cours',
    admin_notes: 'Contactée par téléphone. Convention AFDAS transmise au secrétariat.',
    created_at: new Date(Date.now() - 3600000 * 26).toISOString(),
  },
  {
    id: 'inq-3',
    full_name: 'Lucas Bernard (RH Warner Bros Fr)',
    email: 'l.bernard@prod-events.fr',
    phone: '01 42 68 90 00',
    program_id: 'team-building',
    program_title: 'Team Building Cascade 45 personnes',
    age: 'N/A',
    sport_background: 'Équipe de production de 45 collaborateurs',
    session_date: '18 Juin 2026',
    afdas_status: 'Financement Entreprise / OPCO',
    message: 'Bonjour, nous souhaiterions privatiser le domaine pour une journée Team Building avec ateliers Chute Airbag et Combat Scénique pour notre équipe.',
    status: 'admis',
    admin_notes: 'Devis envoyé et signé. Accompte 30% reçu. Encadrement prévu avec 4 instructeurs.',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
];

export const SAMPLE_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-1',
    user_name: 'Lucas Dollfus (Directeur)',
    action: 'Mise à jour de page',
    entity: 'team-building-cascades',
    details: 'Mise à jour des descriptifs d’ateliers et réorganisation de grille',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'log-2',
    user_name: 'Secrétariat CUC',
    action: 'Nouvelle Session',
    entity: 'Formation Découverte',
    details: 'Session 15-26 Juillet 2026 ouverte aux inscriptions',
    created_at: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
  },
  {
    id: 'log-3',
    user_name: 'Admin Système',
    action: 'Bandeau Flash',
    entity: 'site_announcements',
    details: 'Activation de l’alerte Journée Portes Ouvertes Campus',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

const LOCAL_STORAGE_INQUIRIES_KEY = 'cuc_site_inquiries_cache';

/**
 * Récupère la liste des candidatures et demandes de contact.
 * Se synchronise en direct avec Supabase (table dédiée site_inquiries + miroir site_settings).
 */
export async function getInquiries(): Promise<SiteInquiry[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('site_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(LOCAL_STORAGE_INQUIRIES_KEY, JSON.stringify(data));
        } catch {
          // ignore
        }
      }
      return data as SiteInquiry[];
    }

    // 2. Fallback Supabase site_settings key='inquiries'
    const { data: settingRow } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'inquiries')
      .maybeSingle();

    if (settingRow?.value?.list && Array.isArray(settingRow.value.list)) {
      return settingRow.value.list as SiteInquiry[];
    }
  } catch {
    // Ignore error
  }

  // Fallback localStorage
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_INQUIRIES_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Ignore parse error
    }
  }

  return SAMPLE_INQUIRIES;
}

/**
 * Récupère l'historique d'audit des actions administratives.
 */
export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('site_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data && data.length > 0) {
      return data as AuditLogEntry[];
    }

    // Fallback Supabase site_settings key='audit_logs'
    const { data: row } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'audit_logs')
      .maybeSingle();

    if (row?.value?.list && Array.isArray(row.value.list)) {
      return row.value.list as AuditLogEntry[];
    }
  } catch {
    // Ignore
  }

  return SAMPLE_AUDIT_LOGS;
}

/**
 * Récupère les disciplines de cascade avec leurs liaisons croisées.
 * Priorité : 1. table dédiée site_disciplines, 2. miroir Supabase site_settings, 3. statique.
 */
export async function getDisciplines(): Promise<Discipline[]> {
  try {
    const supabase = createClient();

    // 1. Table dédiée site_disciplines
    const { data: tableData, error: tableError } = await supabase
      .from('site_disciplines')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (!tableError && tableData && tableData.length > 0) {
      return tableData.map((d) => ({
        id: d.id,
        number: d.number,
        name: d.name,
        category: d.category,
        level: d.level,
        duration: d.duration,
        shortDesc: d.short_desc,
        fullDesc: d.full_desc,
        iconName: d.category === 'Hauteur & Chutes' ? 'Tower' : 'Shield',
        cinemaContext: d.metadata?.cinemaContext || '',
        heroImage: d.metadata?.heroImage || '',
        objectives: d.objectives || [],
        equipment: d.equipment || [],
        safetyRules: d.safety_rules || [],
        prerequisites: d.prerequisites || [],
        instructor_ids: d.instructor_ids || [],
        film_ids: d.film_ids || [],
        program_ids: d.program_ids || [],
        order_index: d.order_index,
        is_active: d.is_active,
      })) as Discipline[];
    }

    // 2. Miroir Supabase site_settings
    const { data: settingData, error: settingError } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'disciplines')
      .maybeSingle();

    if (!settingError && settingData?.value?.list && Array.isArray(settingData.value.list) && settingData.value.list.length > 0) {
      return settingData.value.list as Discipline[];
    }
  } catch {
    // Fallback
  }

  // Fallback localStorage
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('cuc_disciplines');
      if (cached) return JSON.parse(cached);
    } catch {
      // Ignore
    }
  }

  return CUC_DISCIPLINES;
}

/**
 * Récupère les points d'intérêt et infrastructures du campus (6 hectares).
 * Priorité : 1. table dédiée site_campus_pois (avec liaison CUC Sign), 2. miroir Supabase site_settings, 3. statique.
 */
export async function getCampusPOIs(): Promise<POI[]> {
  try {
    const supabase = createClient();

    // 1. Table dédiée site_campus_pois
    const { data: tableData, error: tableError } = await supabase
      .from('site_campus_pois')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (!tableError && tableData && tableData.length > 0) {
      return tableData.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category || 'Zone Technique',
        description: p.description || '',
        specs: p.surface ? `Surface ${p.surface} • Capacité ${p.capacity || 'N/A'}` : '',
        coordinates: `${p.coords?.x || 50}% - ${p.coords?.y || 50}%`,
        badge: p.level || 'INSTALLATION CUC',
        xPercent: typeof p.coords?.x === 'number' ? p.coords.x : 50,
        yPercent: typeof p.coords?.y === 'number' ? p.coords.y : 50,
        location_id: p.location_id || null,
        surface: p.surface || undefined,
        capacity: p.capacity || undefined,
        equipment: p.equipment || [],
        features: p.features || [],
        disciplines: p.disciplines || [],
        coaches: p.coaches || [],
        is_active: p.is_active,
      })) as POI[];
    }

    // 2. Miroir Supabase site_settings
    const { data: settingData, error: settingError } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'campus_pois')
      .maybeSingle();

    if (!settingError && settingData?.value?.list && Array.isArray(settingData.value.list) && settingData.value.list.length > 0) {
      return settingData.value.list as POI[];
    }
  } catch {
    // Fallback
  }

  // Fallback localStorage
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('cuc_campus_pois');
      if (cached) return JSON.parse(cached);
    } catch {
      // Ignore
    }
  }

  return CAMPUS_POIS;
}

