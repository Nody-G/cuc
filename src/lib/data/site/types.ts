/**
 * Types & contrats du service vitrine — extrait de `site-service.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2.
 */

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

export interface LayoutSection {
  id: string;
  name: string;
  order: number;
  is_visible: boolean;
}

/**
 * Contenu de sections d'une page (`site_pages.sections_data`).
 *
 * La forme **varie d'une page à l'autre** (blocs `about`, `tournages`,
 * `virtual_tour`, `qualiopi`, `partners`, `social`, `formules`,
 * `stages_catalogue`, `workshops`, `overview`, `reels`…) et aucun schéma
 * exhaustif n'existe à ce jour. Le type reste donc volontairement permissif :
 * chaque consommateur narrow au point d'usage (`sections_data?.about?.title`),
 * ce que 25 sites de lecture exploitent déjà. Le typer strictement sans contrat
 * global casserait ces lectures — un alias unique et documenté vaut mieux que
 * des `any` dispersés.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- JSON CMS de forme libre (cf. justification ci-dessus)
export type SitePageSectionsData = any;

export interface SitePageHero {
  badge?: string;
  /** Ligne de métadonnées du hero (« AFDAS 100% • FRANCE TRAVAIL », « TF1 • FRANCE 2 »…). */
  meta?: string;
  title: string;
  subtitle: string;
  cta_primary_text?: string;
  cta_primary_link?: string;
  cta_secondary_text?: string;
  cta_secondary_link?: string;
  cta_tertiary_text?: string;
  cta_tertiary_link?: string;
  bg_image?: string;
  video_url?: string;
  /** Micro-textes du HUD (localisation, domaine privé, libellé et cible de la carte). */
  hud_location?: string;
  hud_private_domain?: string;
  hud_map_label?: string;
  hud_map_url?: string;
  /** Mention « depuis » du badge ; métriques rapides fusionnées par index. */
  since?: string;
  metrics?: Array<{ val?: string; label?: string }>;
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
  sections_data?: SitePageSectionsData;
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
  /** Libellé du CTA principal de la barre de navigation (desktop + mobile). */
  navbar_cta_text?: string;
  /** URL du CTA principal de la barre de navigation. */
  navbar_cta_url?: string;
  /** Libellé du bouton d'appel de la barre collante mobile. */
  mobile_sticky_call_label?: string;
  /** Libellé du CTA principal de la barre collante mobile. */
  mobile_sticky_cta_text?: string;
  /** URL du CTA principal de la barre collante mobile. */
  mobile_sticky_cta_url?: string;
  /** Libellé du bouton « Haut de page » du pied de page. */
  footer_back_to_top_label?: string;
  /** Libellé du badge de certification affiché dans le pied de page. */
  footer_certification_badge?: string;

  // Identité Visuelle & Métadonnées Globales
  /** URL du logo principal (navbar, footer, favicon fallback). */
  logo_url?: string;
  /** URL du favicon. */
  favicon_url?: string;
  /** Titre SEO global par défaut (balise `<title>`). */
  meta_title?: string;
  /** Description SEO globale par défaut. */
  meta_description?: string;
  /** Image Open Graph globale par défaut. */
  og_image_url?: string;

  // Bandeau d'Alerte / Urgence Globale
  emergency_active?: boolean;
  emergency_badge?: string;
  emergency_message?: string;
  emergency_link_text?: string;
  emergency_link_url?: string;
  emergency_style?: 'gold' | 'alert' | 'info' | 'dark';

  // Thème & Charte Graphique
  accent_color?: string;

  // NOTE : les réseaux sociaux et le copyright du pied de page ne sont plus
  // stockés ici. Ils sont pilotés par les tables canoniques `site_social_links`
  // et `site_footer` (éditeurs dédiés du Cockpit), afin d'éviter toute seconde
  // source de vérité désynchronisée de la vitrine publique.
}

/**
 * Les surcharges de micro-textes sont portées par `getMicrocopyOverrides()` de
 * `@/lib/i18n/server` (lecture mise en cache et étiquetée `site_settings`) :
 * elles ne sont pas dupliquées ici pour éviter deux chemins de lecture.
 */

/**
 * Métadonnées libres d'une candidature (`site_inquiries.metadata`).
 * Les clés réellement exploitées par l'application sont typées ; toute clé
 * inconnue reste `unknown` (jamais `any`) et exige un narrowing au point d'usage.
 */
export interface SiteInquiryMetadata {
  /** Identifiant du profil CUC Sign créé à l'admission. */
  cuc_sign_student_id?: string;
  /** Identifiant de la promotion CUC Sign rattachée (`null` si CUC Sign n'en renvoie aucune). */
  cuc_sign_formation_id?: string | null;
  /** Horodatage ISO de la conversion de la candidature en élève. */
  converted_at?: string;
  [key: string]: unknown;
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
  metadata?: SiteInquiryMetadata;
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

/* ============================================================================
 * HISTORIQUE DE VERSIONS DES PAGES (site_page_revisions)
 * ----------------------------------------------------------------------------
 * Chaque révision est un instantané immuable du contenu d'une page. Le trigger
 * SQL `trg_snapshot_site_page_revision` crée automatiquement un instantané
 * avant chaque UPDATE de `site_pages`. Les fonctions ci-dessous permettent au
 * Cockpit de lister, comparer et restaurer ces versions.
 * ========================================================================== */

export type PageRevisionStatus = 'draft' | 'published' | 'archived';

export interface SitePageRevision {
  id: string;
  page_slug: string;
  revision_number: number;
  snapshot: Partial<SitePageContent>;
  status: PageRevisionStatus;
  label: string | null;
  author_id: string | null;
  author_name: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}
