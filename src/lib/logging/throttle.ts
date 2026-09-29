/**
 * Anti-inondation du journal — regroupe les événements identiques.
 *
 * Couche « Domaine & Services » (`AGENTS.md` § 1) : la classe est **déterministe**
 * et testable parce que l'horloge est injectée (`now`). Aucune dépendance à
 * `Date.now()` implicite.
 *
 * Le problème visé est concret : une table Supabase absente produit une erreur à
 * chaque lecture, soit des centaines de lignes identiques en quelques secondes.
 * Sans regroupement, le journal devient illisible et la table grossit pour rien —
 * l'inverse de la « trace bien rangée » demandée.
 *
 * Comportement : dans une fenêtre glissante, seules `maxEmitsPerWindow`
 * occurrences identiques sont écrites ; les suivantes sont comptées, et le
 * compteur est reporté sur la prochaine écriture (`repeatCount`), ce qui préserve
 * l'information « cela s'est produit N fois » sans écrire N fois.
 */

export interface LogThrottleOptions {
    /** Largeur de la fenêtre de regroupement, en millisecondes. */
    windowMs?: number;
    /** Nombre maximal d'écritures identiques autorisées dans une fenêtre. */
    maxEmitsPerWindow?: number;
    /** Horloge injectée — garantit la testabilité. */
    now?: () => number;
}

export interface ThrottleDecision {
    /** Vrai si l'événement doit être écrit en base. */
    emit: boolean;
    /** Occurrences cumulées depuis la dernière écriture (1 si première). */
    repeatCount: number;
}

interface Bucket {
    windowStart: number;
    emitted: number;
    suppressed: number;
}

/** Empreinte stable d'un événement : c'est elle qui décide du regroupement. */
export function fingerprintOf(parts: {
    source: string;
    category: string;
    message: string;
    target?: string | null;
}): string {
    return [parts.source, parts.category, parts.message, parts.target ?? ''].join('|');
}

export class LogThrottle {
    private readonly windowMs: number;
    private readonly maxEmitsPerWindow: number;
    private readonly now: () => number;
    private readonly buckets = new Map<string, Bucket>();

    constructor(options: LogThrottleOptions = {}) {
        this.windowMs = options.windowMs ?? 60_000;
        this.maxEmitsPerWindow = options.maxEmitsPerWindow ?? 3;
        this.now = options.now ?? (() => Date.now());
    }

    /**
     * Décide du sort d'un événement.
     *
     * `limit` permet de relever le plafond pour les événements critiques, qui ne
     * doivent pas être écartés aussi vite qu'un bruit d'information.
     */
    register(fingerprint: string, limit = this.maxEmitsPerWindow): ThrottleDecision {
        const at = this.now();
        const previous = this.buckets.get(fingerprint);
        let bucket: Bucket;

        if (!previous || at - previous.windowStart >= this.windowMs) {
            /**
             * Changement de fenêtre : le compteur d'écritures repart à zéro, mais
             * **pas** le compte des occurrences écartées. Les perdre ici
             * reviendrait à effacer la fréquence réelle d'un incident qui dure —
             * précisément l'information qu'un journal doit conserver.
             */
            bucket = { windowStart: at, emitted: 0, suppressed: previous?.suppressed ?? 0 };
            this.buckets.set(fingerprint, bucket);
        } else {
            bucket = previous;
        }

        if (bucket.emitted < limit) {
            bucket.emitted += 1;
            const repeatCount = 1 + bucket.suppressed;
            bucket.suppressed = 0;
            return { emit: true, repeatCount };
        }

        bucket.suppressed += 1;
        return { emit: false, repeatCount: 0 };
    }

    /** Oublie tout — utilisé entre deux requêtes dans les tests. */
    reset(): void {
        this.buckets.clear();
    }

    /** Nombre d'empreintes suivies : permet de borner la mémoire si besoin. */
    get size(): number {
        return this.buckets.size;
    }
}
