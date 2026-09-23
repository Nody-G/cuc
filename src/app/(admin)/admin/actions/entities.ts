'use server';

/**
 * Entités éditables **en place** dans l'aperçu (canal d'entité du Mode Studio).
 *
 * Une seule voie d'écriture, volontairement étroite :
 *  - l'admin est vérifié ;
 *  - la référence `table:id:champ` (`entity-ref.ts`) est décomposée ;
 *  - la table et le champ doivent figurer dans la **liste blanche** ci-dessous —
 *    aucune autre entité n'est modifiable par ce canal ;
 *  - une valeur vidée est refusée : elle effacerait un texte servi publiquement
 *    (retirer une annonce se fait dans son écran dédié, pas par effacement).
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { checkIsAdmin } from './auth';
import { revalidateSite } from './revalidate';
import { logAuditEvent } from './audit';
import { parseEntityRef, type EntityRefParts } from '@/lib/preview/entity-ref';
import { CHROME_PAGE_PATHS } from './chrome-paths';

/**
 * Table → champs autorisés. Ajouter une entité = une ligne ici, rien d'autre.
 * Les **noms** des coachs restent hors canal : leur identité est vérifiée
 * (règle `coach_identity_verification.md`) et se corrige dans l'écran Équipe.
 */
const EDITABLE_ENTITIES: Readonly<Record<string, readonly string[]>> = {
    site_announcements: ['title', 'message', 'badge', 'link_text'],
    site_team: ['role', 'title', 'bio'],
    site_films: ['title', 'year'],
};

/** Pages spécifiques à republier en plus du chrome (aucune n'est générique). */
function extraPathsFor(ref: EntityRefParts): string[] {
    // L'identifiant d'un coach est son slug : sa fiche vit sous ce chemin.
    if (ref.table === 'site_team') return [`/equipe-cascadeurs-pro/${ref.id}`];
    // Une jaquette film est rendue par le showcase et les fiches coachs.
    if (ref.table === 'site_films') return ['/cuc-team-cascadeur', '/equipe-cascadeurs-pro'];
    return [];
}

/**
 * Met à jour **un seul champ** d'une entité de la liste blanche
 * (bannière d'annonce, fiche coach, fiche film).
 */
export async function updateEntityField(ref: string, value: string) {
    try {
        const isAdmin = await checkIsAdmin();
        if (!isAdmin) return { success: false as const, error: 'Accès refusé' };

        const parts = parseEntityRef(ref);
        if (!parts) return { success: false as const, error: `Référence d'entité invalide : ${ref}` };

        const allowedFields = EDITABLE_ENTITIES[parts.table];
        if (!allowedFields || !allowedFields.includes(parts.field)) {
            return { success: false as const, error: `Champ non éditable en place : ${ref}` };
        }

        const clean = value.trim();
        if (clean.length === 0) {
            return {
                success: false as const,
                error: 'Une valeur vide effacerait ce texte : saisissez un contenu (ou retirez l’élément depuis son écran).',
            };
        }

        const adminClient = createAdminClient();
        /*
         * `select('id')` n'est pas décoratif : une fiche absente du catalogue
         * (jaquette statique pas encore migrée) ne doit pas produire un succès
         * silencieux — l'aperçu dirait « publié » sans qu'aucune ligne ne change.
         */
        const { data, error } = await adminClient
            .from(parts.table)
            .update({ [parts.field]: clean, updated_at: new Date().toISOString() })
            .eq('id', parts.id)
            .select('id');
        if (error) throw error;
        if (!data || data.length === 0) {
            return {
                success: false as const,
                error: `Fiche introuvable au catalogue : ${parts.table}:${parts.id}`,
            };
        }

        // Le chrome est rendu par la navbar (15 pages) ; les fiches, en plus.
        await revalidateSite([...CHROME_PAGE_PATHS, ...extraPathsFor(parts)]);
        await logAuditEvent('entity.field', ref, 'modifié dans l’aperçu');

        return { success: true as const };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erreur inconnue';
        return { success: false as const, error: message };
    }
}
