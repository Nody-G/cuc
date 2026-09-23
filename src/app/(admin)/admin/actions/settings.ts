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

import { CHROME_PAGE_PATHS } from './chrome-paths';

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
 * Met à jour **un seul** champ des réglages généraux (`site_settings.general`).
 *
 * L'édition en place dans l'aperçu ne connaît qu'une clé à la fois : réécrire
 * tout l'objet écraserait les champs non chargés. On fusionne donc la clé dans
 * la valeur existante ; une valeur vide **retire** la clé (retour au réglage
 * servi) — aucun texte blanc n'est jamais publié.
 */
export async function updateSiteSettingField(field: string, value: string) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) return { success: false as const, error: 'Accès refusé' };

    const adminClient = createAdminClient();
    const { data, error: readError } = await adminClient
      .from('site_settings')
      .select('value')
      .eq('key', 'general')
      .maybeSingle();
    if (readError) throw readError;

    const current = (data?.value as Record<string, unknown> | undefined) ?? {};
    const next: Record<string, unknown> = { ...current };
    const clean = value.trim();
    if (clean.length === 0) {
      delete next[field];
    } else {
      next[field] = value;
    }

    const { error } = await adminClient.from('site_settings').upsert({
      key: 'general',
      value: next,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;

    updateTag('site_settings');
    await revalidateSite(CHROME_PAGE_PATHS);
    await logAuditEvent(
      'settings.field',
      field,
      clean.length === 0 ? 'retour au réglage par défaut' : 'modifié dans l’aperçu'
    );

    return { success: true as const };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false as const, error: message };
  }
}

/**
 * Met à jour **un seul** micro-texte de la surcharge (`microcopy_overrides`).
 *
 * L'édition en place ne connaît qu'une clé à la fois : la surcharge complète est
 * relue, mise à jour puis nettoyée par la **même** sanitisation que l'écran
 * « Micro-textes » ; une valeur vide **retire** la surcharge (retour au
 * catalogue) — jamais un libellé blanc publié.
 */
export async function updateMicrocopyOverrideField(locale: string, key: string, value: string) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) return { success: false as const, error: 'Accès refusé' };

    const { MICROCOPY_SETTINGS_KEY, MICROCOPY_LOCALES, sanitizeMicrocopyOverlay, isMicrocopyKey } =
      await import('@/lib/i18n/microcopy');
    if (!(MICROCOPY_LOCALES as readonly string[]).includes(locale)) {
      return { success: false as const, error: 'Locale inconnue' };
    }
    const localeKey = locale as 'fr' | 'en';

    const adminClient = createAdminClient();
    const { data, error: readError } = await adminClient
      .from('site_settings')
      .select('value')
      .eq('key', MICROCOPY_SETTINGS_KEY)
      .maybeSingle();
    if (readError) throw readError;

    const current = sanitizeMicrocopyOverlay(data?.value);
    const values = { ...(current[localeKey] ?? {}) };
    const clean = value.trim();
    if (clean.length === 0) {
      delete values[key];
    } else {
      /* Invariant : jamais de clé orpheline — la surcharge ne peut viser qu'un
         texte déjà présent dans un catalogue (FR source ou EN traduit). */
      const [fr, en] = await Promise.all([
        import('../../../../../messages/fr.json'),
        import('../../../../../messages/en.json'),
      ]);
      if (!isMicrocopyKey(fr.default, key) && !isMicrocopyKey(en.default, key)) {
        return { success: false as const, error: `Clé absente du catalogue : ${key}` };
      }
      values[key] = clean;
    }

    const sanitized = sanitizeMicrocopyOverlay({ ...current, [localeKey]: values });
    const { error } = await adminClient.from('site_settings').upsert({
      key: MICROCOPY_SETTINGS_KEY,
      value: sanitized,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;

    updateTag('site_settings');
    await revalidateSite(CHROME_PAGE_PATHS);
    await logAuditEvent(
      'settings.microcopy',
      `${localeKey}:${key}`,
      clean.length === 0 ? 'retour au catalogue' : 'modifié dans l’aperçu'
    );

    return { success: true as const };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false as const, error: message };
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

    await revalidateSite(CHROME_PAGE_PATHS);

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
