'use server';

/**
 * Disciplines & zones du campus — extrait de `actions.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2. Server Actions : docs Next.js (`use server`).
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidateSite } from './revalidate';

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
