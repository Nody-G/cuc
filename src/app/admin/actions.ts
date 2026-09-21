'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { SiteInquiry } from '@/lib/data/site-service';

/**
 * Vérifie si l'utilisateur actuellement connecté a accès au Cockpit (admin, directeur, secretaire, coach).
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return ['admin', 'directeur', 'secretaire', 'coach'].includes(profile?.role || '');
  } catch {
    return false;
  }
}

/**
 * Récupère le profil et rôle de l'utilisateur connecté dans le Cockpit.
 */
export async function getCurrentUserProfile() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, full_name, first_name, last_name, role, avatar_url')
      .eq('id', user.id)
      .single();

    return profile;
  } catch {
    return null;
  }
}

/**
 * Revalide toutes les pages du site vitrine suite à une modification de contenu.
 */
export async function revalidateSite(paths: string[] = ['/', '/formation-de-cascadeur', '/stages-cascades-parkour-2', '/equipe-cascadeurs-pro', '/cuc-team-cascadeur']) {
  try {
    for (const path of paths) {
      revalidatePath(path);
    }
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Met à jour le statut d'une session de stage en 1 clic (avec liaison CUC Sign optionnelle).
 */
export async function updateSessionStatus(
  sessionId: string,
  newStatus: string,
  cucSignFormationId?: string | null
) {
  try {
    const adminClient = createAdminClient();
    const updateData: Record<string, any> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };
    if (cucSignFormationId !== undefined) {
      updateData.cuc_sign_formation_id = cucSignFormationId;
    }

    const { error } = await adminClient
      .from('site_sessions')
      .update(updateData)
      .or(`id.eq.${sessionId},date_display.eq.${sessionId}`);

    if (error) throw error;

    await revalidateSite(['/', '/formation-de-cascadeur', '/stages-cascades-parkour-2', '/stunt-workshop-cuc']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Crée une nouvelle session de stage (recherche automatique de correspondance CUC Sign).
 */
export async function createSession(data: {
  program_id: string;
  date_display: string;
  status: string;
  order_index?: number;
  cuc_sign_formation_id?: string | null;
}) {
  try {
    const adminClient = createAdminClient();
    let formationId = data.cuc_sign_formation_id || null;

    if (!formationId) {
      const { data: formations } = await adminClient.from('formations').select('id, name');
      const matched = (formations || []).find((f: { id: string; name: string }) =>
        f.name.toLowerCase().includes(data.date_display.toLowerCase()) ||
        data.date_display.toLowerCase().includes(f.name.toLowerCase())
      );
      if (matched) formationId = matched.id;
    }

    const { error } = await adminClient
      .from('site_sessions')
      .insert({
        program_id: data.program_id,
        date_display: data.date_display,
        status: data.status,
        cuc_sign_formation_id: formationId,
        order_index: data.order_index ?? 0,
        is_published: true,
      });

    if (error) throw error;

    await revalidateSite(['/', '/formation-de-cascadeur', '/stages-cascades-parkour-2', '/stunt-workshop-cuc']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Supprime une session de stage.
 */
export async function deleteSession(sessionIdentifier: string) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_sessions')
      .delete()
      .or(`id.eq.${sessionIdentifier},date_display.eq.${sessionIdentifier}`);

    if (error) throw error;

    await revalidateSite(['/', '/formation-de-cascadeur', '/stages-cascades-parkour-2', '/stunt-workshop-cuc']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Met à jour ou insère un programme de formation CUC (site_programs).
 */
export async function upsertProgram(program: {
  id: string;
  category?: string;
  title: string;
  badge?: string;
  highlight?: boolean;
  tagline?: string;
  duration?: string;
  hours?: string;
  location?: string;
  price?: string;
  price_note?: string;
  age_requirement?: string;
  eligibility?: string[];
  description?: string;
  objectives?: string[];
  key_modules?: string[];
  certification?: string;
  cta_text?: string;
  cta_link?: string;
  brochure_url?: string;
  image_url?: string;
  order_index?: number;
  is_published?: boolean;
}) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_programs')
      .upsert({
        ...program,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    await revalidateSite(['/', '/formation-de-cascadeur', '/stages-cascades-parkour-2', '/stunt-workshop-cuc']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur mise à jour programme';
    return { success: false, error: message };
  }
}

/**
 * Supprime un programme de formation CUC.
 */
export async function deleteProgram(id: string) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_programs')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await revalidateSite(['/', '/formation-de-cascadeur', '/stages-cascades-parkour-2']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur suppression programme';
    return { success: false, error: message };
  }
}

/**
 * Met à jour le bandeau d'alerte.
 */
export async function updateAnnouncement(data: {
  id?: string;
  title: string;
  message: string;
  badge?: string;
  link_url?: string;
  link_text?: string;
  style: 'gold' | 'info' | 'alert' | 'dark';
  is_active: boolean;
}) {
  try {
    const adminClient = createAdminClient();

    if (data.id) {
      const { error } = await adminClient
        .from('site_announcements')
        .update({
          title: data.title,
          message: data.message,
          badge: data.badge,
          link_url: data.link_url,
          link_text: data.link_text,
          style: data.style,
          is_active: data.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);
      if (error) throw error;
    } else {
      const { error } = await adminClient
        .from('site_announcements')
        .insert({
          title: data.title,
          message: data.message,
          badge: data.badge,
          link_url: data.link_url,
          link_text: data.link_text,
          style: data.style,
          is_active: data.is_active,
        });
      if (error) throw error;
    }

    await revalidateSite(['/']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Met à jour ou insère un membre de l'équipe.
 */
export async function upsertTeamMember(member: {
  id: string;
  name: string;
  role: string;
  title: string;
  bio: string;
  specialties: string[];
  avatar_url?: string;
  instagram?: string;
  imdb?: string;
  external_url?: string;
  doubled_actors?: string[];
  notable_credits?: string[];
  featured_credits?: string[];
  credits_display_limit?: number;
  profile_id?: string | null;
  metadata?: any;
}) {
  try {
    const adminClient = createAdminClient();
    const payload: Record<string, any> = {
      ...member,
      profile_id: member.profile_id || null,
      featured_credits: member.featured_credits || [],
      credits_display_limit:
        typeof member.credits_display_limit === 'number' && member.credits_display_limit > 0
          ? member.credits_display_limit
          : 8,
      metadata: member.metadata || {},
      updated_at: new Date().toISOString(),
    };

    let { error } = await adminClient.from('site_team').upsert(payload);

    // Repli si la migration `featured_credits` / `credits_display_limit`
    // n'a pas encore été appliquée : on enregistre le reste de la fiche.
    if (error && /featured_credits|credits_display_limit/.test(error.message)) {
      const { featured_credits: _f, credits_display_limit: _c, ...legacyPayload } = payload;
      const retry = await adminClient.from('site_team').upsert(legacyPayload);
      error = retry.error;
    }

    if (error) throw error;

    await revalidateSite(['/equipe-cascadeurs-pro', '/cuc-team-cascadeur', '/']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Met à jour ou insère un film dans la filmographie.
 */
export async function upsertFilm(film: {
  id: string;
  title: string;
  year?: string;
  category?: string;
  director?: string;
  stunt_roles?: string;
  image?: string;
  tag?: string;
  imdb_url?: string;
  allocine_url?: string;
  trailer_url?: string;
  doubled_actors?: string[];
  highlight?: boolean;
  cuc_team_involved?: string[];
  cuc_team_roles?: Record<string, string>;
  metadata?: any;
}) {
  try {
    const adminClient = createAdminClient();
    const mergedMetadata = {
      ...(film.metadata || {}),
      ...(film.cuc_team_roles ? { cuc_team_roles: film.cuc_team_roles } : {}),
    };

    const { error } = await adminClient
      .from('site_films')
      .upsert({
        id: film.id,
        title: film.title,
        year: film.year,
        category: film.category,
        director: film.director,
        stunt_roles: film.stunt_roles,
        image: film.image,
        tag: film.tag,
        imdb_url: film.imdb_url,
        allocine_url: film.allocine_url,
        trailer_url: film.trailer_url,
        doubled_actors: film.doubled_actors,
        highlight: film.highlight,
        cuc_team_involved: film.cuc_team_involved,
        metadata: mergedMetadata,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    // Fallback miroir site_settings (key=films)
    try {
      const { data: row } = await adminClient
        .from('site_settings')
        .select('value')
        .eq('key', 'films')
        .maybeSingle();

      const list: any[] = row?.value?.list || [];
      const idx = list.findIndex((f: any) => f.id === film.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...film, updated_at: new Date().toISOString() };
      } else {
        list.push({ ...film, updated_at: new Date().toISOString() });
      }
      await adminClient.from('site_settings').upsert({
        key: 'films',
        value: { list },
        updated_at: new Date().toISOString(),
      });
    } catch {
      // ignore
    }

    await revalidateSite(['/cuc-team-cascadeur', '/equipe-cascadeurs-pro', '/']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Supprime un membre de l'équipe.
 */
export async function deleteTeamMember(id: string) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_team')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await revalidateSite(['/equipe-cascadeurs-pro', '/']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Supprime un film de la filmographie.
 */
export async function deleteFilm(id: string) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_films')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await revalidateSite(['/cuc-team-cascadeur', '/']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Met à jour ou insère le contenu détaillé d'une page (Hero, sections, emplacements, SEO).
 */
export async function upsertPageContent(slug: string, pageData: {
  title: string;
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
  hero: Record<string, any>;
  sections?: any[];
  layout_sections?: any[];
  sections_data?: Record<string, any>;
  is_published?: boolean;
}) {
  try {
    const cleanSlug = slug === '/' ? '/' : slug.replace(/^\//, '');
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_pages')
      .upsert({
        slug: cleanSlug,
        title: pageData.title,
        meta_title: pageData.meta_title,
        meta_description: pageData.meta_description,
        og_image: pageData.og_image,
        hero: pageData.hero,
        sections: pageData.sections || [],
        layout_sections: pageData.layout_sections || [],
        sections_data: pageData.sections_data || {},
        is_published: pageData.is_published ?? true,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    const targetPath = cleanSlug === '/' ? '/' : `/${cleanSlug}`;
    await revalidateSite([targetPath, '/']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Publie ou dépublie une page (workflow brouillon → prévisualisation → publication).
 *
 * - `publish` : rend la page visible sur la vitrine (`is_published = true`).
 * - `unpublish` : repasse la page en brouillon (`is_published = false`), elle
 *   n'est alors plus servie publiquement mais reste éditable dans le Cockpit.
 *
 * Un instantané de l'état précédent est créé automatiquement par le trigger
 * SQL `trg_snapshot_site_page_revision` avant l'écriture.
 */
export async function setPagePublishState(
  slug: string,
  publish: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanSlug = slug === '/' ? '/' : slug.replace(/^\//, '');
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_pages')
      .update({
        is_published: publish,
        updated_at: new Date().toISOString(),
      })
      .eq('slug', cleanSlug);

    if (error) throw error;

    const targetPath = cleanSlug === '/' ? '/' : `/${cleanSlug}`;
    await revalidateSite([targetPath, '/']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Rétablit le contenu d'origine et la disposition par défaut validée d'une page.
 */
export async function resetPageContentToDefault(slug: string) {
  try {
    const cleanSlug = slug === '/' ? '/' : slug.replace(/^\//, '');
    const { DEFAULT_PAGE_CONTENTS } = await import('@/lib/data/site-service');
    const defaultData = DEFAULT_PAGE_CONTENTS[cleanSlug];
    if (!defaultData) {
      throw new Error(`Aucun contenu par défaut trouvé pour le slug "${slug}"`);
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_pages')
      .upsert({
        slug: defaultData.slug,
        title: defaultData.title,
        meta_title: defaultData.meta_title,
        meta_description: defaultData.meta_description,
        og_image: defaultData.og_image,
        hero: defaultData.hero,
        sections: defaultData.sections || [],
        layout_sections: defaultData.layout_sections || [],
        sections_data: defaultData.sections_data || {},
        is_published: defaultData.is_published,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    const targetPath = cleanSlug === '/' ? '/' : `/${cleanSlug}`;
    await revalidateSite([targetPath, '/']);
    return { success: true, defaultData };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur réinitialisation';
    return { success: false, error: message };
  }
}

/**
 * Met à jour ou insère un partenaire.
 */
export async function upsertPartner(partner: {
  id: string;
  name: string;
  category: string;
  logo_url: string;
  website_url?: string;
  description?: string;
  order_index?: number;
}) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_partners')
      .upsert({
        ...partner,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
    await revalidateSite(['/partenaires', '/']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Supprime un partenaire.
 */
export async function deletePartner(id: string) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_partners')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await revalidateSite(['/partenaires', '/']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Met à jour ou insère une prestation CUC Events.
 */
export async function upsertEvent(event: {
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
}) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_events')
      .upsert({
        ...event,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
    await revalidateSite(['/cuc-events-agence', '/team-building-cascades', '/spectacles-cascadeurs-yamakasi', '/animations-airbag-parkour', '/']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Supprime une prestation CUC Events.
 */
export async function deleteEvent(id: string) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_events')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await revalidateSite(['/cuc-events-agence', '/']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Met à jour les paramètres globaux (coordonnées, réseaux sociaux, footer).
 */
export async function updateSiteSettings(key: string, value: Record<string, any>) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_settings')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
    await revalidateSite(['/', '/contact-cuc']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Met à jour ou insère une discipline de cascade (site_disciplines + miroir site_settings).
 */
export async function upsertDiscipline(discipline: any) {
  try {
    const adminClient = createAdminClient();

    // 1. Tenter l'écriture dans la table dédiée site_disciplines
    try {
      await adminClient
        .from('site_disciplines')
        .upsert({
          id: discipline.id,
          number: discipline.number,
          name: discipline.name,
          category: discipline.category,
          level: discipline.level,
          duration: discipline.duration,
          short_desc: discipline.shortDesc || discipline.short_desc,
          full_desc: discipline.fullDesc || discipline.full_desc,
          objectives: discipline.objectives || [],
          equipment: discipline.equipment || [],
          safety_rules: discipline.safetyRules || discipline.safety_rules || [],
          prerequisites: discipline.prerequisites || [],
          instructor_ids: discipline.instructor_ids || [],
          film_ids: discipline.film_ids || [],
          program_ids: discipline.program_ids || [],
          order_index: discipline.order_index ?? 0,
          is_active: discipline.is_active ?? true,
          updated_at: new Date().toISOString(),
        });
    } catch {
      // Table dédiée non encore créée
    }

    // 2. Maintenir le miroir dans site_settings pour garantir zéro orphelin
    const { data: currentSettings } = await adminClient
      .from('site_settings')
      .select('value')
      .eq('key', 'disciplines')
      .maybeSingle();

    const list: any[] = currentSettings?.value?.list || [];
    const idx = list.findIndex((d: any) => d.id === discipline.id);
    if (idx >= 0) {
      list[idx] = discipline;
    } else {
      list.push(discipline);
    }

    await adminClient
      .from('site_settings')
      .upsert({
        key: 'disciplines',
        value: { list },
        updated_at: new Date().toISOString(),
      });

    await revalidateSite(['/', '/formation-de-cascadeur', '/stages-cascades-parkour-2']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Supprime une discipline de cascade.
 */
export async function deleteDiscipline(id: string) {
  try {
    const adminClient = createAdminClient();
    try {
      await adminClient.from('site_disciplines').delete().eq('id', id);
    } catch {
      // ignore
    }

    const { data: currentSettings } = await adminClient
      .from('site_settings')
      .select('value')
      .eq('key', 'disciplines')
      .maybeSingle();

    let list: any[] = currentSettings?.value?.list || [];
    list = list.filter((d: any) => d.id !== id);

    await adminClient
      .from('site_settings')
      .upsert({
        key: 'disciplines',
        value: { list },
        updated_at: new Date().toISOString(),
      });

    await revalidateSite(['/']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur suppression discipline';
    return { success: false, error: message };
  }
}

/**
 * Met à jour ou insère une infrastructure/zone du campus (site_campus_pois + miroir site_settings).
 */
export async function upsertCampusPOI(poi: any) {
  try {
    const adminClient = createAdminClient();

    // 1. Écrire dans la table dédiée site_campus_pois.
    //    Le client Supabase NE LÈVE PAS d'exception : il retourne `{ error }`.
    //    On inspecte donc explicitement le résultat pour ne pas masquer une
    //    table absente ou une colonne manquante (cf. doctrine « Zéro Valeur
    //    Orpheline » : le miroir site_settings ne doit pas devenir la source).
    const { error: tableError } = await adminClient
      .from('site_campus_pois')
      .upsert({
        id: poi.id,
        location_id: poi.location_id || null,
        name: poi.name,
        type: poi.type || 'indoor',
        category: poi.category || 'technical',
        coords: poi.coords || { x: poi.xPercent || 50, y: poi.yPercent || 50 },
        level: poi.level || 'polyvalent',
        surface: poi.surface || null,
        capacity: poi.capacity || null,
        equipment: poi.equipment || [],
        features: poi.features || [],
        disciplines: poi.disciplines || [],
        coaches: poi.coaches || [],
        description: poi.description || null,
        image_url: poi.image_url || null,
        order_index: poi.order_index ?? 0,
        is_active: poi.is_active ?? true,
        updated_at: new Date().toISOString(),
      });

    if (tableError) {
      console.error(
        `[upsertCampusPOI] Écriture site_campus_pois impossible : ${tableError.message}`
      );
    }

    // 2. Maintenir le miroir dans site_settings (résilience uniquement :
    //    il ne doit jamais être la seule source de vérité).
    const { data: currentSettings } = await adminClient
      .from('site_settings')
      .select('value')
      .eq('key', 'campus_pois')
      .maybeSingle();

    const list: any[] = currentSettings?.value?.list || [];
    const idx = list.findIndex((p: any) => p.id === poi.id);
    if (idx >= 0) {
      list[idx] = poi;
    } else {
      list.push(poi);
    }

    await adminClient
      .from('site_settings')
      .upsert({
        key: 'campus_pois',
        value: { list },
        updated_at: new Date().toISOString(),
      });

    await revalidateSite(['/', '/visite-guidee', '/visite-virtuelle']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Supprime une zone/infrastructure du campus.
 */
export async function deleteCampusPOI(id: string) {
  try {
    const adminClient = createAdminClient();

    // Le client Supabase retourne `{ error }` au lieu de lever : on inspecte.
    const { error: tableError } = await adminClient
      .from('site_campus_pois')
      .delete()
      .eq('id', id);

    if (tableError) {
      console.error(
        `[deleteCampusPOI] Suppression site_campus_pois impossible : ${tableError.message}`
      );
    }

    const { data: currentSettings } = await adminClient
      .from('site_settings')
      .select('value')
      .eq('key', 'campus_pois')
      .maybeSingle();

    let list: any[] = currentSettings?.value?.list || [];
    list = list.filter((p: any) => p.id !== id);

    await adminClient
      .from('site_settings')
      .upsert({
        key: 'campus_pois',
        value: { list },
        updated_at: new Date().toISOString(),
      });

    await revalidateSite(['/visite-guidee']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur suppression POI';
    return { success: false, error: message };
  }
}

/**
 * Enregistre les placements 3D du plan campus (studio de placement).
 *
 * Persiste l'intégralité du dictionnaire `EditableFacilityItem` dans
 * `site_settings` (key='campus_placements_3d'). C'est la source de vérité
 * partagée entre le Cockpit et la page publique : le studio n'écrit plus
 * uniquement dans le `localStorage` du navigateur (doctrine « Zéro Texte
 * Orphelin »).
 */
export async function upsertCampusPlacements3D(
  placements: Record<string, unknown>
) {
  try {
    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from('site_settings')
      .upsert({
        key: 'campus_placements_3d',
        value: { placements },
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error(
        `[upsertCampusPlacements3D] Écriture site_settings impossible : ${error.message}`
      );
      return { success: false, error: error.message };
    }

    await revalidateSite(['/', '/visite-guidee', '/visite-virtuelle']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Enregistre une action d'audit dans site_audit_logs et site_settings.
 */
export async function logAuditEvent(action: string, target: string, details?: string) {
  try {
    const adminClient = createAdminClient();
    const userProfile = await getCurrentUserProfile();

    try {
      await adminClient.from('site_audit_logs').insert({
        user_id: userProfile?.id || null,
        user_name: userProfile?.full_name || userProfile?.email || 'Administrateur',
        action,
        target,
        details: details || null,
      });
    } catch {
      // Fallback site_settings key='audit_logs'
      const { data: row } = await adminClient
        .from('site_settings')
        .select('value')
        .eq('key', 'audit_logs')
        .maybeSingle();

      const list: any[] = row?.value?.list || [];
      list.unshift({
        id: `log_${Date.now()}`,
        user_name: userProfile?.full_name || 'Admin',
        action,
        target,
        details,
        created_at: new Date().toISOString(),
      });
      if (list.length > 50) list.length = 50;

      await adminClient.from('site_settings').upsert({
        key: 'audit_logs',
        value: { list },
        updated_at: new Date().toISOString(),
      });
    }
  } catch {
    // Ignore logging failures
  }
}

/**
 * Téléverse un fichier média vers Supabase Storage (cuc-vitrine-assets).
 */
export async function uploadMediaFile(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) throw new Error('Aucun fichier fourni');

    const adminClient = createAdminClient();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    const cleanName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '_');
    const filePath = `uploads/${timestamp}_${cleanName}`;

    const { data, error } = await adminClient.storage
      .from('cuc-vitrine-assets')
      .upload(filePath, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: true,
      });

    if (error) throw error;

    const { data: publicUrlData } = adminClient.storage
      .from('cuc-vitrine-assets')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrlData.publicUrl,
      path: data.path,
      name: file.name,
      size: file.size,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur upload';
    return { success: false, error: message };
  }
}

/**
 * Liste les fichiers de la médiathèque Supabase Storage.
 */
export async function listMediaFiles() {
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient.storage
      .from('cuc-vitrine-assets')
      .list('uploads', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) throw error;

    const files = (data || [])
      .filter((f) => f.name !== '.emptyFolderPlaceholder')
      .map((f) => {
        const { data: publicUrlData } = adminClient.storage
          .from('cuc-vitrine-assets')
          .getPublicUrl(`uploads/${f.name}`);
        return {
          name: f.name,
          size: f.metadata?.size || 0,
          createdAt: f.created_at,
          url: publicUrlData.publicUrl,
        };
      });

    return { success: true, files };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur liste médias';
    return { success: false, error: message, files: [] };
  }
}

/**
 * Supprime un fichier média du stockage Supabase.
 */
export async function deleteMediaFile(filename: string) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient.storage
      .from('cuc-vitrine-assets')
      .remove([`uploads/${filename}`]);

    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur suppression média';
    return { success: false, error: message };
  }
}

/**
 * Action serveur d'authentification robuste pour le Cockpit.
 * Permet de contourner tout blocage de cookies tiers ou de réseau côté client.
 */
export async function loginAdminAction(identifier: string, pass: string) {
  try {
    const supabase = await createClient();
    let email = identifier.trim().toLowerCase();
    if (!email.includes('@')) {
      email = `${email}@cuc.fr`;
    }
    const cleanPassword = pass.trim();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: cleanPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      const adminClient = createAdminClient();
      const { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (!['admin', 'directeur', 'secretaire', 'coach'].includes(profile?.role || '')) {
        await supabase.auth.signOut();
        return { success: false, error: 'Accès refusé : ce compte ne possède pas les autorisations nécessaires pour accéder au Cockpit.' };
      }

      return { success: true, userId: data.user.id, role: profile?.role };
    }

    return { success: false, error: 'Identifiant introuvable.' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur d\'authentification serveur';
    return { success: false, error: message };
  }
}

/**
 * Liste les collaborateurs du Cockpit (Admin, Directeur, Secrétaire, Coach).
 */
export async function listCockpitUsers() {
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('profiles')
      .select('id, email, full_name, first_name, last_name, role, updated_at, created_at')
      .in('role', ['admin', 'directeur', 'secretaire', 'coach'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, users: data || [] };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur liste utilisateurs';
    return { success: false, error: message, users: [] };
  }
}

/**
 * Met à jour le rôle d'un collaborateur (Directeur, Secrétaire, Coach, Admin).
 */
export async function updateUserRole(userId: string, newRole: string) {
  try {
    const allowed = ['admin', 'directeur', 'secretaire', 'coach', 'student'];
    if (!allowed.includes(newRole)) throw new Error('Rôle non autorisé');

    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur modification rôle';
    return { success: false, error: message };
  }
}

/**
 * Enregistre une nouvelle candidature ou demande de contact depuis le site vitrine.
 */
export async function submitInquiry(data: {
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
}) {
  try {
    if (!data.full_name || !data.email || !data.phone) {
      return { success: false, error: 'Champs obligatoires manquants (Nom, Email, Téléphone)' };
    }

    const newInquiry: SiteInquiry = {
      id: `inq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      full_name: data.full_name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      program_id: data.program_id || 'general',
      program_title: data.program_title || 'Demande Générale',
      age: data.age?.trim(),
      sport_background: data.sport_background?.trim(),
      session_date: data.session_date?.trim(),
      afdas_status: data.afdas_status?.trim(),
      message: data.message?.trim() || '',
      status: 'nouveau',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const adminClient = createAdminClient();

    // 1. Tenter l'insertion dans la table dédiée site_inquiries
    try {
      await adminClient.from('site_inquiries').insert(newInquiry);
    } catch {
      // Table non encore créée
    }

    // 2. Toujours persister dans site_settings key='inquiries' pour garantir zéro orphelin
    try {
      const { data: settingRow } = await adminClient
        .from('site_settings')
        .select('value')
        .eq('key', 'inquiries')
        .maybeSingle();

      const inqs: any[] = settingRow?.value?.list || [];
      inqs.unshift(newInquiry);

      await adminClient.from('site_settings').upsert({
        key: 'inquiries',
        value: { list: inqs },
        description: 'Registre des candidatures et devis CUC',
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Erreur synchronisation site_settings inquiries:', e);
    }

    return { success: true, inquiry: newInquiry };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur soumission formulaire';
    return { success: false, error: message };
  }
}

/**
 * Met à jour le statut d'une candidature (nouveau, en_cours, admis, refuse, archive).
 */
export async function updateInquiryStatus(id: string, status: 'nouveau' | 'en_cours' | 'admis' | 'refuse' | 'archive') {
  try {
    const adminClient = createAdminClient();

    // 1. Table site_inquiries
    try {
      await adminClient
        .from('site_inquiries')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
    } catch {
      // ignore
    }

    // 2. Miroir site_settings
    try {
      const { data: settingRow } = await adminClient
        .from('site_settings')
        .select('value')
        .eq('key', 'inquiries')
        .maybeSingle();

      const inqs: any[] = settingRow?.value?.list || [];
      const item = inqs.find((i: any) => i.id === id);
      if (item) {
        item.status = status;
        item.updated_at = new Date().toISOString();
        await adminClient.from('site_settings').upsert({
          key: 'inquiries',
          value: { list: inqs },
          updated_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Erreur miroir updateInquiryStatus:', e);
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur mise à jour statut';
    return { success: false, error: message };
  }
}

/**
 * Met à jour les notes administratives privées d'une candidature.
 */
export async function updateInquiryNotes(id: string, notes: string) {
  try {
    const adminClient = createAdminClient();

    // 1. Table site_inquiries
    try {
      await adminClient
        .from('site_inquiries')
        .update({ admin_notes: notes, updated_at: new Date().toISOString() })
        .eq('id', id);
    } catch {
      // ignore
    }

    // 2. Miroir site_settings
    try {
      const { data: settingRow } = await adminClient
        .from('site_settings')
        .select('value')
        .eq('key', 'inquiries')
        .maybeSingle();

      const inqs: any[] = settingRow?.value?.list || [];
      const item = inqs.find((i: any) => i.id === id);
      if (item) {
        item.admin_notes = notes;
        item.updated_at = new Date().toISOString();
        await adminClient.from('site_settings').upsert({
          key: 'inquiries',
          value: { list: inqs },
          updated_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Erreur miroir updateInquiryNotes:', e);
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur mise à jour notes';
    return { success: false, error: message };
  }
}

/**
 * Supprime une candidature de la base de données.
 */
export async function deleteInquiry(id: string) {
  try {
    const adminClient = createAdminClient();

    // 1. Table site_inquiries
    try {
      await adminClient
        .from('site_inquiries')
        .delete()
        .eq('id', id);
    } catch {
      // ignore
    }

    // 2. Miroir site_settings
    try {
      const { data: settingRow } = await adminClient
        .from('site_settings')
        .select('value')
        .eq('key', 'inquiries')
        .maybeSingle();

      let inqs: any[] = settingRow?.value?.list || [];
      inqs = inqs.filter((i: any) => i.id !== id);
      await adminClient.from('site_settings').upsert({
        key: 'inquiries',
        value: { list: inqs },
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Erreur miroir deleteInquiry:', e);
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur suppression candidature';
    return { success: false, error: message };
  }
}

/**
 * Convertit une candidature du site vitrine en compte élève complet dans CUC Sign (Passerelle 1-Clic).
 * Crée le profil utilisateur, la fiche élève (dossier médical/urgence) et rattache l'élève à la formation dans CUC Sign.
 */
export async function convertInquiryToCucSignStudent(inquiryId: string) {
  try {
    const adminClient = createAdminClient();

    // 1. Récupération de la candidature
    let inq: any = null;
    try {
      const { data } = await adminClient
        .from('site_inquiries')
        .select('*')
        .eq('id', inquiryId)
        .maybeSingle();
      inq = data;
    } catch {
      // ignore
    }

    if (!inq) {
      const { data: settingRow } = await adminClient
        .from('site_settings')
        .select('value')
        .eq('key', 'inquiries')
        .maybeSingle();
      const inqs: any[] = settingRow?.value?.list || [];
      inq = inqs.find((i: any) => i.id === inquiryId);
    }

    if (!inq) {
      return { success: false, error: 'Candidature introuvable.' };
    }

    const email = (inq.email || '').trim().toLowerCase();
    const fullName = (inq.full_name || inq.name || 'Élève CUC').trim();
    const phone = inq.phone || '';

    if (!email) {
      return { success: false, error: 'La candidature ne contient aucune adresse email.' };
    }

    // 2. Vérification / Création dans profiles (CUC Sign)
    let profileId: string;
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('email', email)
      .maybeSingle();

    if (existingProfile) {
      profileId = existingProfile.id;
      if (!existingProfile.role) {
        await adminClient.from('profiles').update({ role: 'student' }).eq('id', profileId);
      }
    } else {
      profileId = crypto.randomUUID();
      const { error: insertProfileErr } = await adminClient.from('profiles').insert({
        id: profileId,
        email: email,
        full_name: fullName,
        role: 'student',
        created_at: new Date().toISOString(),
      });
      if (insertProfileErr) {
        throw new Error(`Erreur création profil CUC Sign: ${insertProfileErr.message}`);
      }
    }

    // 3. Vérification / Création dans students (CUC Sign)
    const { data: existingStudent } = await adminClient
      .from('students')
      .select('user_id')
      .eq('user_id', profileId)
      .maybeSingle();

    if (!existingStudent) {
      const { error: insertStudentErr } = await adminClient.from('students').insert({
        user_id: profileId,
        enrollment_date: new Date().toISOString().split('T')[0],
        emergency_contact: phone || 'Non renseigné',
        credits_left: 0,
        image_rights: true,
        updated_at: new Date().toISOString(),
      });
      if (insertStudentErr) {
        console.warn('Erreur création students CUC Sign:', insertStudentErr.message);
      }
    }

    // 4. Rattachement à la formation correspondante dans CUC Sign
    let linkedFormationId: string | null = null;
    const { data: sessions } = await adminClient
      .from('site_sessions')
      .select('id, program_id, cuc_sign_formation_id, date_display');

    if (sessions && sessions.length > 0) {
      const matchedSession = sessions.find((s: any) => {
        if (s.cuc_sign_formation_id) {
          if (inq.preferred_date && s.date_display && s.date_display.toLowerCase().includes(inq.preferred_date.toLowerCase())) return true;
          if (inq.program_id && s.program_id === inq.program_id) return true;
        }
        return false;
      });
      if (matchedSession?.cuc_sign_formation_id) {
        linkedFormationId = matchedSession.cuc_sign_formation_id;
      }
    }

    if (linkedFormationId) {
      const { data: formationGroups } = await adminClient
        .from('groups')
        .select('id')
        .eq('formation_id', linkedFormationId)
        .limit(1);

      let groupId = formationGroups?.[0]?.id;
      if (!groupId) {
        const { data: anyGroups } = await adminClient.from('groups').select('id').limit(1);
        groupId = anyGroups?.[0]?.id;
      }

      if (groupId) {
        const { data: existingMembership } = await adminClient
          .from('group_memberships')
          .select('id')
          .eq('student_id', profileId)
          .eq('formation_id', linkedFormationId)
          .maybeSingle();

        if (!existingMembership) {
          await adminClient.from('group_memberships').insert({
            student_id: profileId,
            formation_id: linkedFormationId,
            group_id: groupId,
            created_at: new Date().toISOString(),
          });
        }
      }
    }

    // 5. Mise à jour de la candidature (status = 'admis', metadata enrichi)
    const updatedMetadata = {
      ...(inq.metadata || {}),
      cuc_sign_student_id: profileId,
      cuc_sign_formation_id: linkedFormationId,
      converted_at: new Date().toISOString(),
    };

    try {
      await adminClient
        .from('site_inquiries')
        .update({
          status: 'admis',
          metadata: updatedMetadata,
          updated_at: new Date().toISOString(),
        })
        .eq('id', inquiryId);
    } catch {
      // ignore
    }

    try {
      const { data: settingRow } = await adminClient
        .from('site_settings')
        .select('value')
        .eq('key', 'inquiries')
        .maybeSingle();

      const inqs: any[] = settingRow?.value?.list || [];
      const item = inqs.find((i: any) => i.id === inquiryId);
      if (item) {
        item.status = 'admis';
        item.metadata = updatedMetadata;
        item.updated_at = new Date().toISOString();
        await adminClient.from('site_settings').upsert({
          key: 'inquiries',
          value: { list: inqs },
          updated_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Erreur miroir updateInquiry convert:', e);
    }

    // Auto-synchronisation immédiate des jauges de places dans site_sessions
    try {
      await syncSessionsSeatCountsFromCucSign();
    } catch (errSync) {
      console.warn('Erreur auto-sync jauges sessions:', errSync);
    }

    // 6. Audit Log
    await logAuditEvent(
      'convert_inquiry_to_cuc_sign',
      `site_inquiries:${inquiryId}`,
      JSON.stringify({
        full_name: fullName,
        email: email,
        profile_id: profileId,
        formation_id: linkedFormationId,
      })
    );

    await revalidateSite(['/admin']);

    return {
      success: true,
      profile_id: profileId,
      formation_id: linkedFormationId,
      message: `Élève "${fullName}" créé avec succès dans CUC Sign !`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur conversion CUC Sign';
    return { success: false, error: message };
  }
}

/**
 * Synchronise les compteurs de places et statuts des sessions CUC à partir des effectifs réels de CUC Sign.
 */
export async function syncSessionsSeatCountsFromCucSign() {
  try {
    const adminClient = createAdminClient();

    // 1. Récupérer toutes les adhésions aux formations dans CUC Sign
    const { data: memberships, error: memErr } = await adminClient
      .from('group_memberships')
      .select('student_id, formation_id');

    if (memErr) throw memErr;

    const countsByFormation: Record<string, number> = {};
    for (const m of memberships || []) {
      if (m.formation_id) {
        countsByFormation[m.formation_id] = (countsByFormation[m.formation_id] || 0) + 1;
      }
    }

    // 2. Récupérer les sessions de la vitrine
    const { data: sessions, error: sessErr } = await adminClient
      .from('site_sessions')
      .select('*');

    if (sessErr) throw sessErr;

    let updatedCount = 0;
    for (const s of sessions || []) {
      if (s.cuc_sign_formation_id) {
        const enrolled = countsByFormation[s.cuc_sign_formation_id] || 0;
        const maxSeats = s.max_seats || 15;

        let newStatus = s.status;
        if (enrolled >= maxSeats) {
          newStatus = 'complet';
        } else if (maxSeats - enrolled <= 3 && enrolled > 0) {
          newStatus = 'dernières places';
        } else if (s.status === 'complet' && enrolled < maxSeats) {
          newStatus = 'ouvert';
        }

        const { error: upErr } = await adminClient
          .from('site_sessions')
          .update({
            booked_seats: enrolled,
            max_seats: maxSeats,
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', s.id);

        if (!upErr) updatedCount++;
      }
    }

    await logAuditEvent(
      'sync_sessions_seat_counts',
      'site_sessions',
      JSON.stringify({ updated_sessions: updatedCount })
    );

    await revalidateSite(['/admin', '/', '/formation-de-cascadeur']);

    return {
      success: true,
      updatedCount,
      message: `${updatedCount} sessions synchronisées avec les effectifs de CUC Sign !`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur synchronisation effectifs';
    return { success: false, error: message };
  }
}

/**
 * Exporte un instantané JSON complet de toutes les données du site CUC.
 */
export async function exportFullSiteBackup() {
  try {
    const adminClient = createAdminClient();

    const [
      programsRes,
      pagesRes,
      teamRes,
      filmsRes,
      sessionsRes,
      partnersRes,
      eventsRes,
      settingsRes,
      disciplinesRes,
      poisRes,
      inquiriesRes
    ] = await Promise.all([
      adminClient.from('site_programs').select('*'),
      adminClient.from('site_pages').select('*'),
      adminClient.from('site_team').select('*'),
      adminClient.from('site_films').select('*'),
      adminClient.from('site_sessions').select('*'),
      adminClient.from('site_partners').select('*'),
      adminClient.from('site_events').select('*'),
      adminClient.from('site_settings').select('*'),
      adminClient.from('site_disciplines').select('*'),
      adminClient.from('site_campus_pois').select('*'),
      adminClient.from('site_inquiries').select('*'),
    ]);

    const backupPayload = {
      app: 'Campus Univers Cascades',
      version: '2.0-cockpit',
      export_date: new Date().toISOString(),
      data: {
        programs: programsRes.data || [],
        pages: pagesRes.data || [],
        team: teamRes.data || [],
        films: filmsRes.data || [],
        sessions: sessionsRes.data || [],
        partners: partnersRes.data || [],
        events: eventsRes.data || [],
        settings: settingsRes.data || [],
        disciplines: disciplinesRes.data || [],
        campus_pois: poisRes.data || [],
        inquiries: inquiriesRes.data || [],
      },
    };

    return { success: true, backup: backupPayload };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors de l’export';
    return { success: false, error: message };
  }
}

/**
 * Restaure un instantané JSON complet sur la base du site.
 */
export async function restoreFullSiteBackup(jsonData: string) {
  try {
    const parsed = JSON.parse(jsonData);
    if (!parsed.data || typeof parsed.data !== 'object') {
      return { success: false, error: 'Format de fichier JSON de sauvegarde invalide.' };
    }

    const adminClient = createAdminClient();
    const {
      programs,
      pages,
      team,
      films,
      sessions,
      partners,
      events,
      settings,
      disciplines,
      campus_pois,
      inquiries
    } = parsed.data;

    if (Array.isArray(programs) && programs.length > 0) {
      await adminClient.from('site_programs').upsert(programs);
    }
    if (Array.isArray(pages) && pages.length > 0) {
      await adminClient.from('site_pages').upsert(pages);
    }
    if (Array.isArray(team) && team.length > 0) {
      await adminClient.from('site_team').upsert(team);
    }
    if (Array.isArray(films) && films.length > 0) {
      await adminClient.from('site_films').upsert(films);
    }
    if (Array.isArray(sessions) && sessions.length > 0) {
      await adminClient.from('site_sessions').upsert(sessions);
    }
    if (Array.isArray(partners) && partners.length > 0) {
      await adminClient.from('site_partners').upsert(partners);
    }
    if (Array.isArray(events) && events.length > 0) {
      await adminClient.from('site_events').upsert(events);
    }
    if (Array.isArray(settings) && settings.length > 0) {
      await adminClient.from('site_settings').upsert(settings);
    }
    if (Array.isArray(disciplines) && disciplines.length > 0) {
      try {
        await adminClient.from('site_disciplines').upsert(disciplines);
      } catch {
        await adminClient.from('site_settings').upsert({ key: 'disciplines', value: { list: disciplines } });
      }
    }
    if (Array.isArray(campus_pois) && campus_pois.length > 0) {
      try {
        await adminClient.from('site_campus_pois').upsert(campus_pois);
      } catch {
        await adminClient.from('site_settings').upsert({ key: 'campus_pois', value: { list: campus_pois } });
      }
    }
    if (Array.isArray(inquiries) && inquiries.length > 0) {
      try {
        await adminClient.from('site_inquiries').upsert(inquiries);
      } catch {
        await adminClient.from('site_settings').upsert({ key: 'inquiries', value: { list: inquiries } });
      }
    }

    await revalidateSite(['/', '/formation-de-cascadeur', '/stages-cascades-parkour-2', '/contact-cuc', '/team-building-cascades']);

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors de la restauration';
    return { success: false, error: message };
  }
}

// ==============================================================================
// MONITEUR SYSTÈME — MESURES RÉELLES
// ==============================================================================

export type HealthState = 'ok' | 'degraded' | 'down';

export interface HealthMetric {
  /** Identifiant technique de la sonde. */
  id: string;
  /** Libellé affiché dans le Cockpit. */
  label: string;
  /** État calculé à partir de la mesure réelle. */
  state: HealthState;
  /** Valeur mesurée, déjà formatée pour l'affichage. */
  value: string;
  /** Détail factuel (pas de superlatif). */
  detail: string;
}

export interface SystemHealthReport {
  /** Horodatage ISO de la mesure. */
  measuredAt: string;
  /** Latence de la sonde Supabase en millisecondes (null si injoignable). */
  latencyMs: number | null;
  /** État global agrégé. */
  overall: HealthState;
  /** Nombre de tables du site vitrine effectivement interrogeables. */
  tablesReachable: number;
  /** Nombre total de tables sondées. */
  tablesTotal: number;
  /** Métriques détaillées. */
  metrics: HealthMetric[];
}

/**
 * Sonde la santé réelle du système : latence Supabase, accessibilité des tables
 * du site vitrine, volumétrie et dernière écriture.
 *
 * Aucune valeur n'est codée en dur : tout provient d'une mesure au moment de
 * l'appel. En cas d'échec, l'état passe à `degraded` ou `down` avec le message
 * d'erreur réel.
 */
export async function getSystemHealth(): Promise<SystemHealthReport> {
  const measuredAt = new Date().toISOString();
  const metrics: HealthMetric[] = [];

  // Tables du site vitrine à sonder (comptage réel).
  const TABLES = [
    'site_films',
    'site_team',
    'site_partners',
    'site_sessions',
    'site_inquiries',
    'site_disciplines',
    'site_events',
    'site_campus_pois',
  ] as const;

  let latencyMs: number | null = null;
  let tablesReachable = 0;
  let lastWriteAt: string | null = null;
  let lastWriteTable: string | null = null;
  let probeError: string | null = null;

  try {
    const adminClient = createAdminClient();

    // 1. Mesure de latence : requête minimale chronométrée.
    const t0 = Date.now();
    const { error: pingError } = await adminClient
      .from('site_settings')
      .select('key')
      .limit(1);
    latencyMs = Date.now() - t0;

    if (pingError) {
      probeError = pingError.message;
    } else {
      // 2. Accessibilité + volumétrie de chaque table.
      for (const table of TABLES) {
        try {
          const { count, error } = await adminClient
            .from(table)
            .select('*', { count: 'exact', head: true });
          if (!error) {
            tablesReachable += 1;
            metrics.push({
              id: `table:${table}`,
              label: table,
              state: 'ok',
              value: `${count ?? 0} ligne${(count ?? 0) > 1 ? 's' : ''}`,
              detail: 'Table interrogeable.',
            });
          } else {
            metrics.push({
              id: `table:${table}`,
              label: table,
              state: 'degraded',
              value: 'Indisponible',
              detail: error.message,
            });
          }
        } catch (err: unknown) {
          metrics.push({
            id: `table:${table}`,
            label: table,
            state: 'degraded',
            value: 'Indisponible',
            detail: err instanceof Error ? err.message : 'Erreur inconnue',
          });
        }
      }

      // 3. Dernière écriture réelle (audit log).
      try {
        const { data: lastLog } = await adminClient
          .from('site_audit_logs')
          .select('action, target, created_at')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (lastLog?.created_at) {
          lastWriteAt = lastLog.created_at;
          lastWriteTable = lastLog.target || lastLog.action || null;
        }
      } catch {
        // Table d'audit absente : non bloquant.
      }
    }
  } catch (err: unknown) {
    probeError = err instanceof Error ? err.message : 'Erreur inconnue';
  }

  // --- Métrique : latence Supabase ---
  let latencyState: HealthState = 'ok';
  if (latencyMs === null) {
    latencyState = 'down';
  } else if (latencyMs > 1500) {
    latencyState = 'down';
  } else if (latencyMs > 600) {
    latencyState = 'degraded';
  }
  metrics.unshift({
    id: 'supabase:latency',
    label: 'Latence Supabase',
    state: latencyState,
    value: latencyMs === null ? 'Injoignable' : `${latencyMs} ms`,
    detail:
      latencyMs === null
        ? probeError || 'Aucune réponse du serveur Supabase.'
        : latencyMs > 600
          ? 'Latence supérieure au seuil de confort (600 ms).'
          : 'Réponse dans le seuil nominal.',
  });

  // --- Métrique : couverture des tables ---
  const coverageState: HealthState =
    tablesReachable === TABLES.length
      ? 'ok'
      : tablesReachable === 0
        ? 'down'
        : 'degraded';
  metrics.unshift({
    id: 'supabase:tables',
    label: 'Tables vitrine',
    state: coverageState,
    value: `${tablesReachable} / ${TABLES.length}`,
    detail:
      coverageState === 'ok'
        ? 'Toutes les tables du site vitrine répondent.'
        : `${TABLES.length - tablesReachable} table(s) injoignable(s).`,
  });

  // --- Métrique : dernière écriture ---
  const writeState: HealthState = lastWriteAt ? 'ok' : 'degraded';
  metrics.unshift({
    id: 'supabase:last-write',
    label: 'Dernière écriture',
    state: writeState,
    value: lastWriteAt
      ? new Date(lastWriteAt).toLocaleString('fr-FR')
      : 'Aucune trace',
    detail: lastWriteTable
      ? `Dernière cible : ${lastWriteTable}.`
      : 'Journal d\u2019audit vide ou absent.',
  });

  // --- État global agrégé ---
  const overall: HealthState = metrics.some((m) => m.state === 'down')
    ? 'down'
    : metrics.some((m) => m.state === 'degraded')
      ? 'degraded'
      : 'ok';

  return {
    measuredAt,
    latencyMs,
    overall,
    tablesReachable,
    tablesTotal: TABLES.length,
    metrics,
  };
}

