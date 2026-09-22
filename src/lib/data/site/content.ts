/**
 * Contenus vitrine (programmes, disciplines, campus, POI) — extrait de `site-service.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2.
 */

import { STUNT_PROGRAMS } from '@/data/programs';
import { CUC_DISCIPLINES } from '@/data/disciplines';
import { CAMPUS_FACILITIES } from '@/data/campus';
import { CAMPUS_POIS, POI } from '@/components/ui/campus-map/campusMap.data';
import { StuntProgram, Discipline, InfrastructureSpot } from '@/types';
import { getSupabaseClient } from './client';

/**
 * Récupère les programmes de formation avec leurs sessions associées.
 * Bascule automatiquement sur les données locales statiques si Supabase n'est pas configuré ou en cas de panne réseau.
 */
export async function getPrograms(): Promise<StuntProgram[]> {
  try {
    const supabase = getSupabaseClient();
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
 * Récupère les installations et infrastructures techniques du campus.
 * Persisté dans Supabase (site_settings key='campus_facilities').
 */
export async function getCampusFacilities(): Promise<InfrastructureSpot[]> {
  try {
    const supabase = getSupabaseClient();
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
 * Récupère les disciplines de cascade avec leurs liaisons croisées.
 * Priorité : 1. table dédiée site_disciplines, 2. miroir Supabase site_settings, 3. statique.
 */
export async function getDisciplines(): Promise<Discipline[]> {
  try {
    const supabase = getSupabaseClient();

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

  // Doctrine « Zéro Valeur Orpheline » : aucun repli sur localStorage.
  // Un cache navigateur non synchronisé pouvait masquer la base et figer des
  // disciplines obsolètes. Le dernier recours est la constante versionnée du
  // dépôt, traçable et identique pour le Cockpit comme pour la vitrine.
  return CUC_DISCIPLINES;
}

/**
 * Récupère les points d'intérêt et infrastructures du campus.
 * Priorité : 1. table dédiée site_campus_pois (avec liaison CUC Sign), 2. miroir Supabase site_settings, 3. statique.
 */
export async function getCampusPOIs(): Promise<POI[]> {
  try {
    const supabase = getSupabaseClient();

    // 1. Table dédiée site_campus_pois (source de vérité)
    const { data: tableData, error: tableError } = await supabase
      .from('site_campus_pois')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true, nullsFirst: false })
      .order('name', { ascending: true });

    if (tableError) {
      console.error(
        `[getCampusPOIs] Lecture site_campus_pois impossible : ${tableError.message}`
      );
    }

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
        image_url: p.image_url || undefined,
        order_index: typeof p.order_index === 'number' ? p.order_index : undefined,
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
  } catch (err: unknown) {
    console.error(
      `[getCampusPOIs] Échec de lecture Supabase : ${err instanceof Error ? err.message : 'Erreur inconnue'}`
    );
  }

  // Doctrine « Zéro Valeur Orpheline » : aucun repli sur localStorage.
  // Le dernier recours est la constante de référence du dépôt, qui est
  // versionnée et donc traçable — jamais un cache navigateur non synchronisé.
  return CAMPUS_POIS;
}

// ==============================================================================
// NAVIGATION, FOOTER & RÉSEAUX SOCIAUX ÉDITABLES
// ==============================================================================
// Ces services alimentent les zones historiquement codées en dur de la vitrine
// (Navbar, dropdowns, drawer mobile, Footer, réseaux sociaux).
// Résilience : fallback systématique sur les constantes de `src/data/navigation.ts`
// afin de garantir ZÉRO régression si Supabase est indisponible ou vide.
// ==============================================================================
