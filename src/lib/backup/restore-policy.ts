/**
 * Sauvegarde automatique du site CUC — politique de suppression d'une restauration.
 *
 * Couche « Domaine pur » (`AGENTS.md` § 1) : aucune I/O, aucun accès base.
 * Responsabilité unique : dire **quelle table a le droit de perdre des lignes**
 * lors d'un retour arrière.
 *
 * Pourquoi c'est le point le plus important du Lot 4 : une restauration est une
 * projection de l'instantané. Supprimer « ce qui n'existe pas dans l'instantané »
 * est légitime pour du **contenu éditorial** piloté par le Cockpit — mais c'est
 * un dégât commercial pour une **donnée de vie réelle** qui n'existait pas
 * encore au moment de l'instantané. Restaurer l'instantané d'hier ne doit
 * jamais effacer les candidatures reçues aujourd'hui.
 *
 * Convention : la liste blanche fait autorité (`whitelist.ts`). Toute table hors
 * liste blanche est refusée ici, avant tout calcul.
 */

import { BACKUP_TABLES, assertBackupScope } from './whitelist';

/**
 * **Contenu éditorial** piloté par le Cockpit. Une restauration peut
 * légitimement y supprimer une ligne apparue après l'instantané : c'est
 * exactement l'effet attendu d'un « revenir à cette version ».
 */
export const CONTENT_TABLES: readonly string[] = [
    // Pages et publication
    'site_pages',
    'site_translations',
    // Référentiels éditoriaux
    'site_programs',
    'site_films',
    'site_disciplines',
    'site_partners',
    'site_events',
    'site_team',
    'site_sessions',
    'site_campus_pois',
    // Coquille et configuration
    'site_navigation',
    'site_footer',
    'site_social_links',
    'site_settings',
    'site_announcements',
];

/**
 * **Données de vie réelle** : elles naissent de l'activité (visiteurs,
 * candidats, coéquipiers), pas d'une édition. Elles n'existaient pas encore au
 * moment de l'instantané, donc un retour arrière ne doit **jamais** les
 * supprimer. Justification table par table :
 *
 * - `site_inquiries` — candidatures et leads reçus : les effacer détruit une
 *   opportunité commerciale et une preuve de consentement. Défaut = jamais.
 * - `site_activity_logs` — journal d'activité : une entrée est une observation
 *   datée, jamais un brouillon ; la supprimer est une falsification.
 * - `site_audit_logs` — journal d'audit : même raison, avec une portée probante.
 * - `site_vitals` — télémétrie Core Web Vitals : mesure du vécu réel des
 *   visiteurs, irremplaçable après coup (on ne « remesure » pas hier).
 * - `site_page_revisions` — historique des révisions de page : c'est la trace
 *   des éditions. **Hésitation assumée** : ces lignes sont *produites* par le
 *   Cockpit, donc un retour arrière « cohérent » pourrait les purger. On ne le
 *   fait pas, car détruire l'historique d'édition est exactement le genre de
 *   perte que la restauration est censée empêcher ; l'option explicite
 *   `--allow-delete=site_page_revisions` reste disponible pour l'opérateur.
 */
export const APPEND_ONLY_TABLES: readonly string[] = [
    'site_inquiries',
    'site_activity_logs',
    'site_audit_logs',
    'site_vitals',
    'site_page_revisions',
];

/**
 * Tables pour lesquelles la classification a été **hésitante**, documentées
 * explicitement plutôt que tranchées au hasard. L'opérateur peut lever la
 * restriction table par table (`--allow-delete`), cas par cas.
 */
export const DELETE_POLICY_HESITATIONS: Readonly<Record<string, string>> = {
    site_page_revisions:
        'Produite par le Cockpit mais porteuse de l’historique d’édition : classée append-only, levée possible via --allow-delete.',
    site_translations:
        'Overlay massif (579 lignes au 2026-10-01) régénérable depuis l’éditeur, mais il reste du contenu éditorial : classé contenu, donc supprimable.',
    site_announcements:
        'Annonces publiées manuellement : contenu éditorial daté, pas une donnée de vie réelle.',
};

/** Entrée de la politique : la table et l'autorisation explicite éventuelle. */
export interface DeletePolicyInput {
    table: string;
    /** Autorisation explicite de l'opérateur pour une table append-only. */
    allowDelete?: boolean;
}

/** Décision motivée : jamais un simple booléen sans justification. */
export interface DeletePolicyDecision {
    table: string;
    appendOnly: boolean;
    allowed: boolean;
    reason: string;
}

/** Vrai si la table porte du contenu éditorial piloté par le Cockpit. */
export function isContentTable(table: string): boolean {
    return CONTENT_TABLES.includes(table);
}

/** Vrai si la table ne doit jamais perdre de ligne par défaut. */
export function isAppendOnly(table: string): boolean {
    return APPEND_ONLY_TABLES.includes(table);
}

/**
 * Décision de suppression pour une table. Table hors liste blanche ⇒ refus
 * immédiat (`BackupScopeError`). Une table append-only n'est supprimable que si
 * l'opérateur l'a explicitement autorisée ; le défaut est **jamais**.
 */
export function resolveDeletePolicy(input: DeletePolicyInput): DeletePolicyDecision {
    const table = input?.table;
    assertBackupScope(table);

    if (!isContentTable(table) && !isAppendOnly(table)) {
        throw new Error(`Politique de suppression indécise pour « ${table} » — classification absente.`);
    }

    if (isContentTable(table)) {
        return {
            table,
            appendOnly: false,
            allowed: true,
            reason: 'Table de contenu éditorial : une restauration peut légitimement retirer la ligne.',
        };
    }

    const allowed = input?.allowDelete === true;
    return {
        table,
        appendOnly: true,
        allowed,
        reason: allowed
            ? 'Table append-only : suppression autorisée explicitement par l’opérateur (--allow-delete).'
            : 'Table append-only : suppression refusée par défaut — la ligne a été préservée.',
    };
}

/**
 * Contrôle de dérive exécuté au chargement : les deux familles doivent couvrir
 * **exactement** la liste blanche, sans doublon ni recouvrement. Un oubli ferait
 * échouer toute restauration plutôt que de supprimer par inadvertance.
 */
export function assertDeletePolicyIntegrity(): void {
    for (const table of BACKUP_TABLES) {
        const content = isContentTable(table);
        const appendOnly = isAppendOnly(table);
        if (content === appendOnly) {
            throw new Error(
                `Politique de suppression incomplète pour « ${table} » — contenu=${content}, append-only=${appendOnly}.`,
            );
        }
    }
    const declared = [...CONTENT_TABLES, ...APPEND_ONLY_TABLES];
    if (new Set(declared).size !== declared.length) {
        throw new Error('Politique de suppression incohérente — une table est classée deux fois.');
    }
    if (declared.length !== BACKUP_TABLES.length) {
        throw new Error('Politique de suppression incohérente — toutes les tables du périmètre ne sont pas classées.');
    }
}

assertDeletePolicyIntegrity();
