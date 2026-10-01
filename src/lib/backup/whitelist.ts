/**
 * Sauvegarde automatique du site CUC — périmètre de sauvegarde.
 *
 * **LE point de sécurité du système.** Responsabilité unique : définir et
 * garder le périmètre. Aucune entrée/sortie, aucun accès base : ce module
 * décide *ce qui a le droit d'exister* dans une sauvegarde ou une restauration.
 *
 * Stratégie (`plans/plan-backups-automatiques-2026.md` § 2) : on ne protège pas
 * CUC Sign en ajoutant des précautions, on le protège en rendant l'écriture
 * hors périmètre **structurellement impossible** — toute table hors liste
 * blanche fait échouer l'appel avant toute I/O (G1, G2, G3).
 *
 * Convention : le préfixe `site_` est la règle canonique
 * (`.agents/rules/cuc_sign_interconnection.md`, § 3).
 */

/** Préfixe obligatoire des tables de la vitrine (G1). */
export const BACKUP_TABLE_PREFIX = 'site_';

/**
 * Liste noire explicite et exhaustive (G3) : tables du produit « CUC Sign ».
 * Elles ne sont **jamais lues, jamais écrites, jamais supprimées** par ce
 * système (`plans/plan-backups-automatiques-2026.md` § 1.1 et § 2).
 */
export const CUC_SIGN_TABLES: readonly string[] = [
    'formations',
    'profiles',
    'students',
    'locations',
    'groups',
    'group_memberships',
    'slots',
    'signatures',
    'evaluation_disciplines',
    'evaluation_sessions',
];

/** Schémas interdits (G4) : l'export et le SQL généré restent dans `public`. */
export const FORBIDDEN_SCHEMAS: readonly string[] = ['auth', 'storage', 'extensions'];

/**
 * Cibles de clé étrangère formellement interdites (G5).
 * `evaluation_disciplines` est une table d'**instance** de CUC Sign : aucun
 * appariement avec `site_disciplines` n'est possible
 * (`.agents/rules/cuc_sign_interconnection.md`, § 2).
 */
export const FORBIDDEN_FK_TARGETS: readonly string[] = ['evaluation_disciplines'];

/**
 * Les 14 tables réellement exportées aujourd'hui par
 * `src/app/(admin)/admin/actions/backup.ts` (relevées telles quelles, dans
 * l'ordre du fichier, lignes 50 à 63). Ce sous-ensemble existe pour **tracer
 * l'écart à combler** sans dupliquer la connaissance du périmètre : il est un
 * préfixe strict de `BACKUP_TABLES`.
 */
export const LEGACY_EXPORTED_TABLES: readonly string[] = [
    'site_programs',
    'site_pages',
    'site_team',
    'site_films',
    'site_sessions',
    'site_partners',
    'site_events',
    'site_settings',
    'site_disciplines',
    'site_campus_pois',
    'site_inquiries',
    'site_navigation',
    'site_footer',
    'site_translations',
];

/**
 * Liste blanche canonique : **exactement** les tables `site_*` réellement
 * présentes dans le schéma `public` — ni plus, ni moins.
 *
 * Source de vérité : **l'inventaire réel de `public`**, relevé en lecture
 * seule le 2026-10-01 (`SELECT table_name FROM information_schema.tables
 * WHERE table_schema = 'public'`) : 42 tables au total, dont les **20**
 * tables `site_*` ci-dessous. Les migrations du dépôt corroborent ces noms ;
 * aucune entrée n'est déduite d'un fichier, d'un commentaire ou d'une
 * intention.
 *
 * Correctif d'un défaut critique : `site_campus_facilities` figurait ici
 * alors que la table **n'existe pas** en base — chaque sauvegarde avortait
 * donc avant de produire quoi que ce soit. Elle est **retirée**.
 * `site_media` et `site_videos`, autrefois « écartés faute de nom prouvé »,
 * sont **confirmés absents** par le même relevé : ils ne sont **pas** ajoutés.
 * Aucun nom appartenant à un autre produit (CUC Sign) — ni `site_identity`,
 * absent de l'inventaire — n'entre dans cette liste.
 *
 * Les 14 tables historiques (`LEGACY_EXPORTED_TABLES`) forment un préfixe
 * strict de cette liste.
 */
export const BACKUP_TABLES: readonly string[] = [
    ...LEGACY_EXPORTED_TABLES,
    'site_social_links',
    'site_announcements',
    'site_page_revisions',
    'site_audit_logs',
    'site_activity_logs',
    'site_vitals',
];

/**
 * Colonnes de pont vers CUC Sign (matrice documentée en
 * `.agents/rules/cuc_sign_interconnection.md`, § 2) : les seules liaisons
 * site → CUC Sign. Elles ne sont **jamais écrasées** par une restauration.
 */
export const BRIDGE_COLUMNS: Readonly<Record<string, readonly string[]>> = {
    site_sessions: ['cuc_sign_formation_id'],
    site_team: ['profile_id'],
    site_campus_pois: ['location_id'],
};

/** Forme canonique d'un nom de table de la vitrine (G1). */
const TABLE_NAME_PATTERN = /^site_[a-z_]+$/;

const BACKUP_TABLE_SET = new Set<string>(BACKUP_TABLES);
const CUC_SIGN_TABLE_SET = new Set<string>(CUC_SIGN_TABLES);

/**
 * Erreur de périmètre : **fail-fast**, nommée et testable. Aucun mode
 * « continuer quand même » n'existe.
 */
export class BackupScopeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'BackupScopeError';
    }
}

/** Vrai si la table appartient à la liste blanche canonique. */
export function isBackupTable(table: string): boolean {
    return BACKUP_TABLE_SET.has(table);
}

/** Colonnes de pont d'une table (`[]` si la table n'en porte pas). */
export function getBridgeColumns(table: string): readonly string[] {
    return BRIDGE_COLUMNS[table] ?? [];
}

/**
 * Garde-fou central : refuse un nom de table hors périmètre **avant toute
 * I/O**. Utilisable telle quelle par les scripts CLI et par `diff.ts`.
 *
 * Refuse : nom schéma-qualifié (contient un point), table CUC Sign, table
 * hors liste blanche, nom ne respectant pas `^site_[a-z_]+$`.
 */
export function assertBackupScope(table: string): void {
    if (typeof table !== 'string' || table.length === 0) {
        throw new BackupScopeError('Périmètre refusé — nom de table vide ou non textuel.');
    }
    if (table.includes('.')) {
        throw new BackupScopeError(
            `Périmètre refusé — « ${table} » est schéma-qualifié : aucun schéma n'est jamais ciblé.`,
        );
    }
    if (CUC_SIGN_TABLE_SET.has(table)) {
        throw new BackupScopeError(
            `Périmètre refusé — « ${table} » est une table CUC Sign : hors d'atteinte par construction.`,
        );
    }
    if (!BACKUP_TABLE_SET.has(table)) {
        throw new BackupScopeError(
            `Périmètre refusé — « ${table} » n'appartient pas à la liste blanche de sauvegarde.`,
        );
    }
    if (!TABLE_NAME_PATTERN.test(table)) {
        throw new BackupScopeError(
            `Périmètre refusé — « ${table} » ne respecte pas le préfixe « ${BACKUP_TABLE_PREFIX} ».`,
        );
    }
}

/**
 * Garde documentant l'interdiction de clé étrangère vers CUC Sign (G5) :
 * aucune FK vers une table CUC Sign, et **jamais** vers
 * `evaluation_disciplines`.
 */
export function assertNoFkToCucSign(targets: readonly string[]): void {
    for (const target of targets) {
        if (CUC_SIGN_TABLE_SET.has(target)) {
            throw new BackupScopeError(
                `FK interdite — « ${target} » appartient à CUC Sign : aucune liaison ne doit y mener.`,
            );
        }
        if (FORBIDDEN_FK_TARGETS.includes(target)) {
            throw new BackupScopeError(
                `FK interdite — « ${target} » est une table d'instance sans appariement possible.`,
            );
        }
        const [schema] = target.split('.');
        if (target.includes('.') && FORBIDDEN_SCHEMAS.includes(schema)) {
            throw new BackupScopeError(`FK interdite — schéma « ${schema} » hors périmètre.`);
        }
    }
}

/**
 * Contrôle de dérive (G2) exécuté au chargement du module : toute entrée de
 * liste blanche non préfixée `site_`, tout doublon, ou tout recouvrement avec
 * la liste noire CUC Sign fait échouer l'import — donc **toute** sauvegarde et
 * **toute** restauration, sans exception.
 */
export function assertWhitelistIntegrity(): void {
    const seen = new Set<string>();
    for (const table of BACKUP_TABLES) {
        if (seen.has(table)) {
            throw new BackupScopeError(`Liste blanche incohérente — doublon « ${table} ».`);
        }
        seen.add(table);
        if (!TABLE_NAME_PATTERN.test(table)) {
            throw new BackupScopeError(
                `Liste blanche incohérente — « ${table} » ne respecte pas le préfixe « ${BACKUP_TABLE_PREFIX} ».`,
            );
        }
        if (CUC_SIGN_TABLE_SET.has(table)) {
            throw new BackupScopeError(
                `Liste blanche incohérente — « ${table} » recouvre la liste noire CUC Sign.`,
            );
        }
    }
}

assertWhitelistIntegrity();
