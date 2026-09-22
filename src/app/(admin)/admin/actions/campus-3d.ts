'use server';

/**
 * Placements 3D du campus — extrait de `actions.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2. Server Actions : docs Next.js (`use server`).
 */

import { createAdminClient, describeServiceRoleKey, isServiceKeyFamily } from '@/lib/supabase/admin';
import { revalidateSite } from './revalidate';

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
        `[upsertCampusPlacements3D] Écriture site_settings impossible : ${error.code ?? ''} ${error.message}`
      );
      return { success: false, error: `${error.message}${error.code ? ` (code ${error.code})` : ''}` };
    }

    // L'échec de revalidation n'est pas un échec d'écriture : les données sont
    // en base. Il est remonté comme avertissement au lieu d'être avalé, sinon
    // une page publique figée resterait inexplicable.
    const revalidation = await revalidateSite(['/', '/visite-guidee', '/visite-virtuelle']);
    if (revalidation && 'success' in revalidation && revalidation.success === false) {
      console.error(
        `[upsertCampusPlacements3D] Revalidation impossible : ${revalidation.error}`
      );
      return { success: true, warning: `Données enregistrées, revalidation en échec : ${revalidation.error}` };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error(`[upsertCampusPlacements3D] Exception : ${message}`);
    return { success: false, error: message };
  }
}

/**
 * Sonde de diagnostic de la persistance des placements 3D.
 *
 * Lecture **seule** de la ligne stockée, exécutée par le même chemin serveur
 * que l'écriture. Permet de distinguer trois causes autrement indiscernables :
 *  - l'action serveur n'est pas joignable depuis le navigateur (erreur de
 *    protocole d'action) ;
 *  - l'écriture est refusée alors que la lecture fonctionne ;
 *  - la lecture elle-même échoue (droits, schéma, réseau).
 */
export async function probeCampusPlacements3D() {
  const serviceRole = describeServiceRoleKey();
  const serviceRoleConfigured = serviceRole.configured;
  const serviceKeyUsable = isServiceKeyFamily(serviceRole.family);
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('site_settings')
      .select('value, updated_at')
      .eq('key', 'campus_placements_3d')
      .maybeSingle();

    if (error) {
      return {
        success: false,
        stage: 'read' as const,
        serviceRoleConfigured,
        serviceRoleFamily: serviceRole.family,
        serviceKeyUsable,
        serviceRoleHasWhitespace: serviceRole.hasSurroundingWhitespace,
        error: `${error.message}${error.code ? ` (code ${error.code})` : ''}`,
      };
    }

    const placements = (data?.value as { placements?: Record<string, unknown> } | undefined)
      ?.placements;
    const count = placements && typeof placements === 'object' ? Object.keys(placements).length : 0;

    return {
      success: true,
      stage: 'read' as const,
      serviceRoleConfigured,
      serviceRoleFamily: serviceRole.family,
      serviceKeyUsable,
      serviceRoleHasWhitespace: serviceRole.hasSurroundingWhitespace,
      hasRow: Boolean(data),
      count,
      updatedAt: data?.updated_at ?? null,
    };
  } catch (err: unknown) {
    return {
      success: false,
      stage: 'read' as const,
      serviceRoleConfigured,
      serviceRoleFamily: serviceRole.family,
      serviceKeyUsable,
      serviceRoleHasWhitespace: serviceRole.hasSurroundingWhitespace,
      error: err instanceof Error ? err.message : 'Erreur inconnue',
    };
  }
}
