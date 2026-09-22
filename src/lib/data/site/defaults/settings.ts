/**
 * Données par défaut — réglages — extrait de `site-service.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2.
 */

import { SiteSettings } from '../types';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  school_name: "Campus Univers Cascades",
  tagline: "Le Plus Grand Centre de Formation de Cascadeurs au Monde",
  campus_surface: "11 000 m²",
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
  qualiopi_url: "https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/document/21452296-CHALLENGE-EUROPE-PRODUCTIONS-Qualiopi.pdf",
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
};
