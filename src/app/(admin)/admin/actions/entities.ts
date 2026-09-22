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
import { parseEntityRef } from '@/lib/preview/entity-ref';

/** Table → champs autorisés. Ajouter une entité = une ligne ici, rien d'autre. */
const EDITABLE_ENTITIES: Readonly<Record<string, readonly string[]>> = {
    site_announcements: ['title', 'message', 'badge', 'link_text'],
};

/** Pages où une entité de la liste blanche est rendue : republication ciblée. */
const ENTITY_PAGE_PATHS = ['/', '/contact-cuc'];

/**
 * Met à jour **un seul champ** d'une entité éditable (bannière d'annonce).
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
                error: 'Une valeur vide effacerait ce texte : saisissez un contenu (ou retirez l’annonce depuis son écran).',
            };
        }

        const adminClient = createAdminClient();
        const { error } = await adminClient
            .from(parts.table)
            .update({ [parts.field]: clean, updated_at: new Date().toISOString() })
            .eq('id', parts.id);
        if (error) throw error;

        await revalidateSite(ENTITY_PAGE_PATHS);
        await logAuditEvent('entity.field', ref, 'modifié dans l’aperçu');

        return { success: true as const };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erreur inconnue';
        return { success: false as const, error: message };
    }
}
