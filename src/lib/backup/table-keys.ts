/**
 * Sauvegarde automatique du site CUC — clés primaires du périmètre.
 *
 * Couche « Domaine pur » (`AGENTS.md` § 1) : une seule responsabilité — dire
 * quelle colonne identifie une ligne d'une table de la liste blanche. Aucune
 * I/O, aucun accès base : la connaissance vient des migrations du dépôt,
 * citées ci-dessous.
 *
 * Ce module existe pour deux raisons opposées et complémentaires :
 *  1. `restore.ts` doit appeler `diffTable` avec la bonne clé primaire ;
 *  2. `io/db-restore.ts` doit n'écrire **aucun** nom de table en dur (règle
 *     vérifiée par `scripts/guard_cuc_sign_scope.mjs`) : la clé lui est donc
 *     transmise par le plan, jamais redéclarée.
 *
 * Sources : [`schema_pages_extension.sql:9`](../../../scripts/schema_pages_extension.sql:9)
 * (`site_pages.slug`), [`setup_complete_vitrine.sql:131`](../../../scripts/setup_complete_vitrine.sql:131)
 * (`site_settings.key`). Toutes les autres tables du périmètre portent `id`
 * (TEXT ou UUID) : `schema_site_vitrine.sql`, `schema_navigation_footer.sql`,
 * `migration_sync_cuc_cockpit.sql`, `schema_page_revisions.sql`,
 * `migration_apply_activity_logs.sql`, `apply_site_vitals_migration.mjs`.
 */

import { BACKUP_TABLES, assertBackupScope } from './whitelist';

/** Clé primaire par défaut de toute table du périmètre. */
const DEFAULT_PRIMARY_KEY = 'id';

/**
 * Exceptions à la clé `id` — **toute** autre table de la liste blanche utilise
 * `id`. Une seule entrée par exception, jamais deux sources de vérité.
 */
export const PRIMARY_KEY_OVERRIDES: Readonly<Record<string, string>> = {
    site_pages: 'slug',
    site_settings: 'key',
};

/** Clé primaire d'une table du périmètre. Table hors liste blanche ⇒ refus. */
export function primaryKeyOf(table: string): string {
    assertBackupScope(table);
    return PRIMARY_KEY_OVERRIDES[table] ?? DEFAULT_PRIMARY_KEY;
}

/**
 * Contrôle de dérive exécuté au chargement : toute exception doit désigner une
 * table **réellement** de la liste blanche, et une table du périmètre ne peut
 * pas être exceptionnée deux fois. Un écart fait échouer l'import — donc toute
 * restauration — plutôt que de produire un diff sur une clé fausse.
 */
export function assertPrimaryKeyIntegrity(): void {
    for (const table of BACKUP_TABLES) {
        const override = PRIMARY_KEY_OVERRIDES[table];
        if (override !== undefined && override.trim().length === 0) {
            throw new Error(`Clé primaire vide déclarée pour « ${table} ».`);
        }
    }
    for (const table of Object.keys(PRIMARY_KEY_OVERRIDES)) {
        if (!BACKUP_TABLES.includes(table)) {
            throw new Error(`Clé primaire déclarée hors périmètre pour « ${table} ».`);
        }
    }
}

assertPrimaryKeyIntegrity();
