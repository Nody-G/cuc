/**
 * Journal d'activité — contrats.
 *
 * Couche « Types & Contrats » (`AGENTS.md` § 1) : aucune dépendance React, aucun
 * accès réseau. Ces types sont partagés par le service d'écriture
 * (`src/lib/logging/write.ts`), les Server Actions de lecture
 * (`src/app/(admin)/admin/actions/logs.ts`) et la vue du Cockpit.
 *
 * Deux flux distincts, deux tables (`plans/plan-journal-activite-cockpit.md` § 2) :
 *  - `site_audit_logs` — journal **métier** historique, inchangé, alimenté par
 *    `logAuditEvent()` ;
 *  - `site_activity_logs` — journal **technique** décrit ici : incidents,
 *    dégradations, jobs et synchronisations.
 */

/** Gravité d'un événement. `critical` est réservé à ce qui casse un parcours. */
export type LogLevel = 'info' | 'warning' | 'error' | 'critical';

/** Ordre croissant de gravité — sert au tri et aux seuils de rétention. */
export const LOG_LEVELS: readonly LogLevel[] = ['info', 'warning', 'error', 'critical'];

export const LOG_LEVEL_RANK: Record<LogLevel, number> = {
    info: 0,
    warning: 1,
    error: 2,
    critical: 3,
};

export const LOG_LEVEL_LABELS: Record<LogLevel, string> = {
    info: 'Information',
    warning: 'Avertissement',
    error: 'Erreur',
    critical: 'Incident critique',
};

/**
 * Domaine émetteur — l'axe de rangement principal du hub.
 *
 * Un domaine décrit **qui a échoué**, pas où l'erreur a été attrapée : une table
 * Supabase absente est `supabase`, un envoi d'e-mail refusé est `email`.
 */
export type LogSource =
    | 'cockpit'
    | 'site'
    | 'supabase'
    | 'email'
    | 'instagram'
    | 'realtime'
    | 'cron'
    | 'media';

export const LOG_SOURCES: readonly LogSource[] = [
    'cockpit',
    'site',
    'supabase',
    'email',
    'instagram',
    'realtime',
    'cron',
    'media',
];

export const LOG_SOURCE_LABELS: Record<LogSource, string> = {
    cockpit: 'Cockpit',
    site: 'Site vitrine',
    supabase: 'Base de données',
    email: 'E-mails',
    instagram: 'Instagram & Reels',
    realtime: 'Temps réel',
    cron: 'Tâches & synchronisations',
    media: 'Médias & stockage',
};

/**
 * Événement à écrire — vue « entrée » du journal.
 *
 * `category` est un identifiant **stable et filtrable** (`page.save`,
 * `db.rls_denied`, `token.expired`) : jamais une phrase. `message` porte la
 * phrase française lisible, et `context` les données structurées expurgées.
 */
export interface ActivityLogInput {
    level: LogLevel;
    source: LogSource;
    category: string;
    message: string;
    /** Ce qui est touché : slug de page, adresse, chemin Storage, identifiant. */
    target?: string | null;
    context?: Record<string, unknown> | null;
    /** Corrèle les événements d'un même geste (une requête, une synchro). */
    requestId?: string | null;
    /** Durée mesurée d'une opération, en millisecondes. */
    durationMs?: number | null;
    /** Action ou route émettrice, pour retrouver le code fautif. */
    origin?: string | null;
    actorId?: string | null;
    actorName?: string | null;
    /** Nombre d'occurrences regroupées par l'anti-inondation (`throttle`). */
    repeatCount?: number;
}

/** Événement lu depuis la base — forme exacte de `site_activity_logs`. */
export interface ActivityLogEntry {
    id: string;
    occurred_at: string;
    level: LogLevel;
    source: LogSource;
    category: string;
    message: string;
    target: string | null;
    context: Record<string, unknown> | null;
    request_id: string | null;
    duration_ms: number | null;
    origin: string | null;
    actor_id: string | null;
    actor_name: string | null;
    repeat_count: number;
}

/** Critères de lecture. Tous optionnels : l'absence de critère signifie « tout ». */
export interface LogQuery {
    levels?: LogLevel[];
    sources?: LogSource[];
    categories?: string[];
    /** Recherche plein texte sur le message, la catégorie et la cible. */
    search?: string | null;
    /** Borne basse inclusive, au format ISO. */
    since?: string | null;
    /** Filtre exact sur une cible (slug, adresse). */
    target?: string | null;
    limit?: number;
    offset?: number;
}

/** Synthèse affichée en tête du hub. */
export interface LogStats {
    total: number;
    last24h: number;
    byLevel: Record<LogLevel, number>;
    bySource: Array<{ source: LogSource; count: number }>;
    lastOccurrenceAt: string | null;
}
