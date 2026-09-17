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
  is_published: boolean;
  updated_at?: string;
}

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

