import { createClient } from '@/lib/supabase/client';
import { STUNT_PROGRAMS } from '@/data/programs';
import { CUC_TEAM } from '@/data/team';
import { FILMOGRAPHY_CREDITS } from '@/data/filmography';
import { StuntProgram, Instructor, FilmCredit } from '@/types';

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
          date: s.date_display,
          status: s.status as 'complet' | 'ouvert' | 'dernières places' | 'bientôt',
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
    const { data, error } = await supabase
      .from('site_team')
      .select('*')
      .eq('is_published', true)
      .order('order_index', { ascending: true });

    if (error || !data || data.length === 0) {
      return CUC_TEAM;
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
      externalUrl: t.external_url,
      avatarUrl: t.avatar_url,
      instagram: t.instagram,
      imdb: t.imdb,
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
      return FILMOGRAPHY_CREDITS;
    }

    return data.map((f) => ({
      id: f.id,
      title: f.title,
      year: f.year || '',
      category: f.category || 'Cinéma',
      director: f.director,
      stuntRoles: f.stunt_roles || '',
      doubledActors: f.doubled_actors,
      highlight: !!f.highlight,
      image: f.image || '',
      tag: f.tag || '',
      imdbUrl: f.imdb_url || '',
      allocineUrl: f.allocine_url || '',
      trailerUrl: f.trailer_url || '',
    }));
  } catch {
    return FILMOGRAPHY_CREDITS;
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
      { id: 'virtual_tour', name: 'Visite Virtuelle 360°', order: 3, is_visible: true },
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
      badge: 'CURSUS ÉLITE DIPLÔMANT • 2 ANS',
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
    sections_data: {},
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
    sections_data: {},
    sections: [],
    is_published: true,
  },
  'stunt-workshop-cuc': {
    slug: 'stunt-workshop-cuc',
    title: 'Stunt Workshops Masterclass',
    meta_title: 'International Stunt Workshop | Campus Univers Cascades',
    meta_description: "Stage international d'élite en anglais et français. 2 semaines résidentielles d'immersion au Cateau-Cambrésis.",
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
    sections_data: {},
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
    meta_description: "Faites vivre le grand frisson du saut dans le vide sur coussin d'air géant de cinéma. Animation 100% sécurisée encadrée par des cascadeurs.",
    og_image: 'https://www.campus-universcascades.com/wp-content/uploads/2021/07/Animation-airbag-chute-libre.jpg',
    hero: {
      badge: 'XTREM JUMP AIRBAG • +20 000 CHUTES ENCADRÉES',
      title: 'ANIMATIONS AIRBAG & PARKOUR',
      subtitle: "Faites vivre au grand public les sensations uniques de la chute libre sur coussin d'air géant de cinéma dans une sécurité absolue.",
      cta_primary_text: 'Devis Animation Airbag',
      cta_primary_link: '/contact-cuc',
      cta_secondary_text: 'Toutes les Offres CUC Events',
      cta_secondary_link: '/cuc-events-agence',
      bg_image: 'https://www.campus-universcascades.com/wp-content/uploads/2021/07/Animation-airbag-chute-libre.jpg',
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
      subtitle: "Plongez au cœur de l'entraînement des cascadeurs avec les reportages exclusifs de TF1, France 2 et les showreels de la CUC Stunt Team.",
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
    title: 'Contact & Accès',
    meta_title: 'Contact & Plan d’Accès | Campus Univers Cascades',
    meta_description: 'Prenez contact avec le Campus Univers Cascades : secrétariat, candidatures formations, devis événements et plan d’accès au Cateau-Cambrésis.',
    og_image: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg',
    hero: {
      badge: 'NOUS CONTACTER & PLAN D’ACCÈS',
      title: 'CONTACTEZ LE CAMPUS',
      subtitle: 'Notre équipe pédagogique et administrative est à votre disposition pour vous orienter vers le programme adapté à votre projet.',
      cta_primary_text: 'Envoyer un message',
      cta_primary_link: '#formulaire',
      cta_secondary_text: 'Venir au campus',
      cta_secondary_link: '#plan',
      bg_image: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg',
    },
    layout_sections: [
      { id: 'hero', name: 'En-tête Contact & Plan d Accès', order: 1, is_visible: true },
      { id: 'info_cards', name: 'Coordonnées, Horaires & Téléphones', order: 2, is_visible: true },
      { id: 'contact_form', name: 'Formulaire de Message Direct', order: 3, is_visible: true },
      { id: 'map_location', name: 'Carte & Accès Campus', order: 4, is_visible: true },
    ],
    sections_data: {},
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
  school_name?: string;
  tagline?: string;
  phone?: string;
  email_general?: string;
  email_admissions?: string;
  email_events?: string;
  address?: string;
  campus_surface?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  facebook?: string;
  tiktok?: string;
  footer_copyright?: string;
}

export const DEFAULT_PARTNERS: SitePartner[] = [
  { id: 'europacorp', name: 'EuropaCorp', category: 'cinema', logo_url: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/logo-europacorp.png', website_url: 'https://www.europacorp.com' },
  { id: 'gaumont', name: 'Gaumont', category: 'cinema', logo_url: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/logo-gaumont.png', website_url: 'https://www.gaumont.fr' },
  { id: 'pathe', name: 'Pathé', category: 'cinema', logo_url: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/logo-pathe.png', website_url: 'https://www.pathe.fr' },
  { id: 'studiocanal', name: 'StudioCanal', category: 'cinema', logo_url: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/logo-studiocanal.png', website_url: 'https://www.studiocanal.com' },
  { id: 'qualiopi', name: 'Certification Qualiopi', category: 'institutionnel', logo_url: 'https://www.campus-universcascades.com/wp-content/uploads/2021/04/qualiopi.png', website_url: 'https://travail-emploi.gouv.fr' },
  { id: 'afdas', name: 'AFDAS', category: 'institutionnel', logo_url: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/logo-afdas.png', website_url: 'https://www.afdas.com' },
  { id: 'france-travail', name: 'France Travail', category: 'institutionnel', logo_url: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/logo-pole-emploi.png', website_url: 'https://www.francetravail.fr' },
];

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  school_name: "Campus Univers Cascades",
  tagline: "Le Plus Grand Centre de Formation de Cascadeurs au Monde",
  phone: "+33 (0)3 27 00 00 00",
  email_general: "contact@campus-universcascades.com",
  email_admissions: "formations@campus-universcascades.com",
  email_events: "events@campus-universcascades.com",
  address: "Le Cateau-Cambrésis (59360), Hauts-de-France, France",
  campus_surface: "11 000 m²",
  instagram: "https://www.instagram.com/campusuniverscascades/",
  youtube: "https://www.youtube.com/@campusuniverscascades",
  linkedin: "https://www.linkedin.com/company/campus-univers-cascades/",
  facebook: "https://www.facebook.com/campusuniverscascades/",
  tiktok: "https://www.tiktok.com/@campusuniverscascades",
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

    if (error || !data || data.length === 0) return [];
    return data as SiteEvent[];
  } catch {
    return [];
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

