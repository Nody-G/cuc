/**
 * Expurgation — dernière barrière avant persistance.
 *
 * Couche « Domaine & Services » (`AGENTS.md` § 1) : fonctions **pures**, sans
 * horloge ni accès réseau, testables telles quelles.
 *
 * Un journal qui fuit est pire qu'un journal absent : il transforme une
 * commodité d'exploitation en incident de sécurité. Ces fonctions retirent donc
 * tout ce qui ressemble à un jeton ou à une clé, et masquent la partie locale des
 * adresses e-mail en conservant le domaine (utile pour diagnostiquer un envoi
 * refusé, sans exposer l'identité du destinataire).
 */

import type { ActivityLogInput } from './types';

/** Marqueur unique, pour repérer ce qui a été retiré et auditer l'expurgation. */
export const REDACTED = '[expurgé]';

/** Clés dont la valeur n'est jamais journalisée, quelle qu'elle soit. */
const SECRET_KEY = /(token|secret|password|passwd|pwd|apikey|api_key|api-key|authorization|cookie|jwt|bearer|service_role|private_key|refresh)/i;

/** Adresses e-mail : on garde le domaine, on masque la boîte. */
const EMAIL = /([A-Za-z0-9._%+-]+)@([A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+)/g;

/** Jetons reconnaissables (Supabase, OpenAI, GitHub, JWT). */
const TOKEN_LIKE =
    /\b(?:sb_[a-z]+_[A-Za-z0-9_-]{8,}|sbp_[A-Za-z0-9]{8,}|eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}(?:\.[A-Za-z0-9_-]+)?|sk-[A-Za-z0-9_-]{8,}|ghp_[A-Za-z0-9]{8,})\b/g;

/** En-tête d'autorisation recopié dans un message d'erreur. */
const BEARER_HEADER = /\bbearer\s+[A-Za-z0-9._~+/=-]{6,}/gi;

/** Empreintes longues : clés hexadécimales, hachages, identifiants de session. */
const LONG_HEX = /\b[a-f0-9]{32,}\b/gi;

/** Profondeur maximale explorée dans `context` — au-delà, on résume. */
const MAX_DEPTH = 4;
/** Longueur maximale d'une chaîne conservée. */
const MAX_STRING_LENGTH = 500;

/** Expurge une chaîne : jetons, en-têtes, empreintes, adresses e-mail. */
export function redactText(value: string): string {
    const cleaned = value
        .replace(BEARER_HEADER, `Bearer ${REDACTED}`)
        .replace(TOKEN_LIKE, REDACTED)
        .replace(LONG_HEX, REDACTED)
        .replace(EMAIL, (_match, _box: string, domain: string) => `${REDACTED}@${domain}`);

    return cleaned.length > MAX_STRING_LENGTH
        ? `${cleaned.slice(0, MAX_STRING_LENGTH)}…`
        : cleaned;
}

/**
 * Expurge une valeur arbitraire.
 *
 * Les clés sensibles sont remplacées **avant** toute descente : une clé
 * `access_token` dont la valeur est un objet ne doit pas être explorée, elle doit
 * disparaître.
 */
export function redactValue(value: unknown, depth = 0): unknown {
    if (value === null || value === undefined) return null;
    if (typeof value === 'string') return redactText(value);
    if (typeof value === 'number' || typeof value === 'boolean') return value;
    if (typeof value === 'bigint') return value.toString();
    if (typeof value === 'function' || typeof value === 'symbol') return REDACTED;
    if (value instanceof Date) return value.toISOString();
    if (value instanceof Error) {
        return { name: value.name, message: redactText(value.message) };
    }
    if (depth >= MAX_DEPTH) return REDACTED;

    if (Array.isArray(value)) {
        return value.slice(0, 50).map((item) => redactValue(item, depth + 1));
    }

    if (typeof value === 'object') {
        const out: Record<string, unknown> = {};
        for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
            out[key] = SECRET_KEY.test(key) ? REDACTED : redactValue(item, depth + 1);
        }
        return out;
    }

    return REDACTED;
}

/** Expurge un `context` complet ; `null` si rien d'exploitable. */
export function redactContext(
    context: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null {
    if (!context) return null;
    const redacted = redactValue(context);
    if (!redacted || typeof redacted !== 'object' || Array.isArray(redacted)) return null;
    const entries = Object.entries(redacted as Record<string, unknown>);
    return entries.length > 0 ? (redacted as Record<string, unknown>) : null;
}

/**
 * Applique l'expurgation à un événement complet — point d'entrée utilisé par
 * `writeActivityLog()`, pour qu'aucune écriture ne contourne la barrière.
 */
export function redactEntry(input: ActivityLogInput): ActivityLogInput {
    return {
        ...input,
        message: redactText(input.message),
        target: input.target ? redactText(input.target) : null,
        origin: input.origin ? redactText(input.origin) : null,
        actorName: input.actorName ? redactText(input.actorName) : input.actorName ?? null,
        context: redactContext(input.context),
    };
}
