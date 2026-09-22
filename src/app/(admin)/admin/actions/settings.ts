'use server';

/**
 * Réglages du site & micro-textes — extrait de `actions.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2. Server Actions : docs Next.js (`use server`).
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { updateTag } from 'next/cache';
import { checkIsAdmin } from './auth';
import { revalidateSite } from './revalidate';
import { logAuditEvent } from './audit';

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
 * Catalogue des micro-textes d'interface (FR = source, EN = repli) et surcharges
 * déjà enregistrées.
 *
 * Les catalogues `messages/*.json` ne sont **jamais** embarqués dans le bundle
 * du Cockpit : ils sont lus côté serveur, aplatis et renvoyés sous forme de
 * table éditable (clé → FR/EN).
 */
export async function loadMicrocopyCatalog() {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) return { success: false as const, error: 'Accès refusé' };

    const [{ buildMicrocopyEntries, groupMicrocopyEntries }, { getMicrocopyOverrides }] =
      await Promise.all([
        import('@/lib/i18n/microcopy'),
        import('@/lib/i18n/server'),
      ]);

    const [fr, en, overrides] = await Promise.all([
      import('../../../../../messages/fr.json'),
      import('../../../../../messages/en.json'),
      getMicrocopyOverrides(),
    ]);

    const entries = buildMicrocopyEntries(fr.default, en.default);

    return {
      success: true as const,
      entries,
      groups: groupMicrocopyEntries(entries).map((group) => group.group),
      overrides,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false as const, error: message };
  }
}

/**
 * Enregistre les surcharges de micro-textes (`site_settings.microcopy_overrides`).
 *
 * Invariants : une valeur vide est **retirée** (vider un champ ramène au
 * catalogue, jamais un texte blanc publié) et seules les locales connues sont
 * conservées. La republication couvre les 15 pages, en FR **et** en EN : un
 * libellé d'interface peut apparaître n'importe où sur la vitrine.
 */
export async function saveMicrocopyOverrides(overlay: unknown) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) return { success: false as const, error: 'Accès refusé' };

    const { MICROCOPY_SETTINGS_KEY, sanitizeMicrocopyOverlay } = await import(
      '@/lib/i18n/microcopy'
    );
    const sanitized = sanitizeMicrocopyOverlay(overlay);

    const { error } = await createAdminClient()
      .from('site_settings')
      .upsert({
        key: MICROCOPY_SETTINGS_KEY,
        value: sanitized,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    /* Le catalogue i18n est lu sous tag `site_settings` : on l'invalide d'abord. */
    updateTag('site_settings');

    await revalidateSite([
      '/',
      '/formation-de-cascadeur',
      '/stages-cascades-parkour-2',
      '/equipe-cascadeurs-pro',
      '/cuc-team-cascadeur',
      '/partenaires',
      '/team-building-cascades',
      '/animations-airbag-parkour',
      '/spectacles-cascadeurs-yamakasi',
      '/stunt-workshop-cuc',
      '/videos-cascadeur',
      '/visite-guidee',
      '/visite-virtuelle',
      '/contact-cuc',
    ]);

    const frCount = Object.keys(sanitized.fr ?? {}).length;
    const enCount = Object.keys(sanitized.en ?? {}).length;
    await logAuditEvent(
      'settings.microcopy',
      MICROCOPY_SETTINGS_KEY,
      `${frCount} micro-texte(s) FR / ${enCount} EN`
    );

    return { success: true as const, overrides: sanitized };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false as const, error: message };
  }
}
