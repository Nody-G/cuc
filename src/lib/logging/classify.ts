/**
 * Classification des erreurs — traduit un échec technique en événement lisible.
 *
 * Couche « Domaine & Services » (`AGENTS.md` § 1) : logique **pure**, aucune
 * dépendance à Supabase ni à React. C'est le cœur de la valeur du journal : sans
 * cette traduction, la page ne montrerait que des `{"code":"42P01"}` que personne
 * ne lit, et le §8 de `durability_health.md` (« aucune écriture avalée »)
 * resterait théorique.
 *
 * La classification retient le **code** autant que le message : `supabase-js` ne
 * lève pas, il renvoie `{ error }` — le code est donc la seule information fiable
 * sur la cause réelle.
 */

import type { LogLevel, LogSource } from './types';

export interface ClassifyFallback {
    /** Domaine par défaut, quand l'erreur ne dit rien de son origine. */
    source: LogSource;
    /** Catégorie par défaut, construite par l'appelant (`page.save`, `media.move`). */
    category: string;
    /** Gravité par défaut. `error` si non précisée. */
    level?: LogLevel;
}

export interface ClassifiedError {
    level: LogLevel;
    source: LogSource;
    category: string;
    message: string;
    context: Record<string, unknown>;
}

interface Rule {
    test: RegExp;
    level: LogLevel;
    source: LogSource;
    category: string;
    message: string;
}

/**
 * Règles ordonnées du plus spécifique au plus générique.
 *
 * Les codes PostgREST (`42P01`, `42501`, `PGRST301`…) sont testés en premier :
 * leur message est parfois traduit ou enveloppé, le code ne l'est jamais.
 */
const RULES: Rule[] = [
    {
        test: /(42P01|Could not find the table|relation .* does not exist)/i,
        level: 'error',
        source: 'supabase',
        category: 'db.table_missing',
        message: 'Table absente en base — une migration n’a pas été appliquée.',
    },
    {
        test: /(42501|permission denied|row-level security)/i,
        level: 'error',
        source: 'supabase',
        category: 'db.rls_denied',
        message: 'Écriture refusée par les politiques RLS.',
    },
    {
        test: /(42703|PGRST204|column .* does not exist)/i,
        level: 'error',
        source: 'supabase',
        category: 'db.column_missing',
        message: 'Colonne absente en base — schéma désynchronisé du code.',
    },
    {
        test: /(23505|duplicate key)/i,
        level: 'warning',
        source: 'supabase',
        category: 'db.unique_violation',
        message: 'Doublon refusé par une contrainte d’unicité.',
    },
    {
        test: /(23503|violates foreign key)/i,
        level: 'error',
        source: 'supabase',
        category: 'db.foreign_key_violation',
        message: 'Référence inexistante — la ligne liée a été supprimée ou n’a jamais existé.',
    },
    {
        test: /(23502|null value in column)/i,
        level: 'error',
        source: 'supabase',
        category: 'db.not_null_violation',
        message: 'Champ obligatoire vide refusé par la base.',
    },
    {
        test: /(57014|statement timeout|canceling statement)/i,
        level: 'error',
        source: 'supabase',
        category: 'db.timeout',
        message: 'Requête interrompue : délai d’exécution dépassé.',
    },
    {
        test: /(53300|too many connections)/i,
        level: 'error',
        source: 'supabase',
        category: 'db.connection_limit',
        message: 'Limite de connexions atteinte sur la base.',
    },
    {
        test: /(PGRST301|JWT expired|invalid claim|token is expired)/i,
        level: 'warning',
        source: 'supabase',
        category: 'auth.jwt_expired',
        message: 'Jeton expiré — la session doit être renouvelée.',
    },
    {
        test: /(bucket not found|BucketNotFound)/i,
        level: 'error',
        source: 'media',
        category: 'media.bucket_missing',
        message: 'Bucket de stockage introuvable.',
    },
    {
        test: /(payload too large|entity too large|exceeded the maximum allowed size|413)/i,
        level: 'error',
        source: 'media',
        category: 'media.payload_too_large',
        message: 'Fichier refusé : taille supérieure à la limite du stockage.',
    },
    {
        test: /(SMTP|smtp|Error sending invite|Error sending recovery)/i,
        level: 'warning',
        source: 'email',
        category: 'email.smtp_failed',
        message: 'Envoi d’e-mail refusé par le serveur SMTP.',
    },
    {
        test: /(OAuthException|Session has expired|code[\s:]+190|access token has expired)/i,
        level: 'warning',
        source: 'instagram',
        category: 'instagram.token_expired',
        message: 'Jeton Instagram expiré — les mesures en direct sont suspendues.',
    },
    {
        test: /(rate limit|too many requests|429)/i,
        level: 'warning',
        source: 'supabase',
        category: 'http.rate_limited',
        message: 'Trop de requêtes : l’API a temporisé la demande.',
    },
    {
        test: /(fetch failed|ETIMEDOUT|ECONNREFUSED|ENOTFOUND|EAI_AGAIN|network|socket hang up)/i,
        level: 'error',
        source: 'supabase',
        category: 'network.unreachable',
        message: 'Service injoignable depuis le serveur.',
    },
];

/** Lit un message exploitable depuis n'importe quelle forme d'erreur. */
export function extractErrorMessage(error: unknown): string {
    if (!error) return '';
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    if (typeof error === 'object') {
        const candidate = error as { message?: unknown; error_description?: unknown; error?: unknown };
        if (typeof candidate.message === 'string') return candidate.message;
        if (typeof candidate.error_description === 'string') return candidate.error_description;
        if (typeof candidate.error === 'string') return candidate.error;
    }
    return '';
}

/** Lit un code structuré (`code`, `status`, `statusCode`) quand il existe. */
export function extractErrorCode(error: unknown): string | null {
    if (!error || typeof error !== 'object') return null;
    const candidate = error as { code?: unknown; status?: unknown; statusCode?: unknown };
    for (const value of [candidate.code, candidate.status, candidate.statusCode]) {
        if (typeof value === 'string' && value.length > 0) return value;
        if (typeof value === 'number') return String(value);
    }
    return null;
}

/** Traduit un statut HTTP seul (sans message) en classement exploitable. */
export function classifyStatus(status: number): { level: LogLevel; category: string; message: string } {
    if (status === 401 || status === 403) {
        return { level: 'error', category: `http.${status}`, message: 'Accès refusé par le service distant.' };
    }
    if (status === 404) {
        return { level: 'warning', category: 'http.404', message: 'Ressource introuvable côté service distant.' };
    }
    if (status === 429) {
        return { level: 'warning', category: 'http.rate_limited', message: 'Trop de requêtes : l’API a temporisé la demande.' };
    }
    if (status >= 500) {
        return { level: 'error', category: `http.${status}`, message: 'Le service distant a renvoyé une erreur serveur.' };
    }
    if (status >= 400) {
        return { level: 'warning', category: `http.${status}`, message: 'La requête a été refusée par le service distant.' };
    }
    return { level: 'info', category: `http.${status}`, message: 'Réponse HTTP inhabituelle.' };
}

/**
 * Classe une erreur quelconque.
 *
 * `fallback` décrit le contexte d'appel : c'est lui qui décide qu'une erreur
 * non reconnue est un `media.move` dans le domaine `media`, plutôt qu'un
 * « supabase » générique. La classification ne devine jamais l'intention.
 */
export function classifyError(error: unknown, fallback: ClassifyFallback): ClassifiedError {
    const raw = extractErrorMessage(error);
    const code = extractErrorCode(error);
    const context: Record<string, unknown> = {};
    if (code) context.code = code;
    const statusMatch = raw.match(/\b([1-5]\d{2})\b/);
    if (statusMatch) context.status = Number(statusMatch[1]);

    for (const rule of RULES) {
        if (rule.test.test(raw) || (code !== null && rule.test.test(code))) {
            return {
                level: rule.level,
                source: rule.source,
                category: rule.category,
                message: rule.message,
                context,
            };
        }
    }

    const status = typeof context.status === 'number' ? context.status : null;
    if (status !== null) {
        const byStatus = classifyStatus(status);
        return {
            level: fallback.level ?? byStatus.level,
            source: fallback.source,
            category: byStatus.category,
            message: byStatus.message,
            context,
        };
    }

    return {
        level: fallback.level ?? 'error',
        source: fallback.source,
        category: fallback.category,
        message: raw || 'Échec sans message exploitable.',
        context,
    };
}
