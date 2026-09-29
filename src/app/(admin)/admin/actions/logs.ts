'use server';

/**
 * Journal d'activité — lecture et synthèse.
 *
 * Règle SRP : `AGENTS.md` § 1-2. Server Actions : docs Next.js (`use server`).
 * La logique pure vit dans `src/lib/logging/` (classement, expurgation,
 * rétention, conversion des lignes) ; ce fichier ne porte que l'accès base et les
 * gardes de rôle. L'ingestion est dans `./logs-ingest` et la rétention dans
 * `./logs-retention` — trois responsabilités, trois fichiers, chacun sous le
 * plafond dur de 300 lignes (`AGENTS.md` § 2).
 *
 * Un principe de lecture, hérité du §8 de `durability_health.md` : une lecture
 * refusée se **distingue** d'une lecture vide. `refused` existe pour que l'écran
 * ne présente jamais un refus comme une absence de données.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { clampLogLimit, sanitizeSearchTerm } from '@/lib/logging/query';
import { LOG_SELECTED_COLUMNS, toActivityLogEntries } from '@/lib/logging/mappers';
import { LOG_LEVELS, LOG_SOURCES, type LogLevel, type LogQuery, type LogStats } from '@/lib/logging/types';
import { requireManager } from './user-guards';

const TABLE = 'site_activity_logs';
const DAY_MS = 24 * 60 * 60 * 1000;

/** Page de journal, avec l'état de la lecture — jamais un tableau nu ambigu. */
export interface ActivityLogPage {
    entries: ReturnType<typeof toActivityLogEntries>;
    /** Nombre d'entrées correspondant aux filtres, indépendamment de la pagination. */
    total: number;
    refused: boolean;
    error: string | null;
}

export interface ActivityLogOverview {
    stats: LogStats;
    refused: boolean;
    error: string | null;
}

/** Synthèse vide — sert de repli quand la lecture est refusée ou impossible. */
function emptyStats(): LogStats {
    return {
        total: 0,
        last24h: 0,
        byLevel: { info: 0, warning: 0, error: 0, critical: 0 },
        bySource: [],
        lastOccurrenceAt: null,
    };
}

/** Lecture d'une page du journal, filtrée. Réservée à la Direction. */
export async function listActivityLogs(query: LogQuery = {}): Promise<ActivityLogPage> {
    const guard = await requireManager();
    if (!guard.ok) {
        return { entries: [], total: 0, refused: true, error: guard.error };
    }

    const limit = clampLogLimit(query.limit);
    const offset = query.offset && query.offset > 0 ? Math.floor(query.offset) : 0;

    try {
        const admin = createAdminClient();
        let request = admin
            .from(TABLE)
            .select(LOG_SELECTED_COLUMNS, { count: 'exact' })
            .order('occurred_at', { ascending: false });

        if (query.levels && query.levels.length > 0) request = request.in('level', query.levels);
        if (query.sources && query.sources.length > 0) request = request.in('source', query.sources);
        if (query.categories && query.categories.length > 0) {
            request = request.in('category', query.categories);
        }
        if (query.since) request = request.gte('occurred_at', query.since);
        if (query.target) request = request.eq('target', query.target);

        const search = query.search ? sanitizeSearchTerm(query.search) : '';
        if (search) {
            request = request.or(
                `message.ilike.%${search}%,category.ilike.%${search}%,target.ilike.%${search}%`,
            );
        }

        const { data, error, count } = await request.range(offset, offset + limit - 1);

        if (error) {
            console.warn(`[activity-log] Lecture impossible : ${error.message}`);
            return { entries: [], total: 0, refused: false, error: error.message };
        }

        return {
            entries: toActivityLogEntries(data),
            total: count ?? 0,
            refused: false,
            error: null,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur inconnue';
        console.warn(`[activity-log] Lecture interrompue : ${message}`);
        return { entries: [], total: 0, refused: false, error: message };
    }
}

/**
 * Synthèse du hub : volumétrie par gravité et par domaine.
 *
 * Les compteurs sont **exacts** : quinze requêtes `head` sans données, lancées en
 * parallèle — une seule latence perçue. Le choix est assumé : un chiffre
 * approximatif affiché dans un tableau de bord est précisément ce que le §8 de
 * `durability_health.md` interdit (« un chiffre sans source mesurée s'affiche
 * comme un repère, ou ne s'affiche pas »).
 */
export async function getActivityLogOverview(): Promise<ActivityLogOverview> {
    const guard = await requireManager();
    if (!guard.ok) {
        return { stats: emptyStats(), refused: true, error: guard.error };
    }

    try {
        const admin = createAdminClient();
        const since = new Date(Date.now() - DAY_MS).toISOString();

        const countHead = () => admin.from(TABLE).select('id', { count: 'exact', head: true });

        const [total, last24h, levelCounts, sourceCounts, latest] = await Promise.all([
            countHead(),
            countHead().gte('occurred_at', since),
            Promise.all(LOG_LEVELS.map((level) => countHead().eq('level', level))),
            Promise.all(LOG_SOURCES.map((source) => countHead().eq('source', source))),
            admin
                .from(TABLE)
                .select('occurred_at')
                .order('occurred_at', { ascending: false })
                .limit(1)
                .maybeSingle(),
        ]);

        const failure = [total, last24h, ...levelCounts, ...sourceCounts].find(
            (result) => result.error,
        );
        if (failure?.error) {
            console.warn(`[activity-log] Synthèse partielle : ${failure.error.message}`);
        }

        const byLevel = LOG_LEVELS.reduce<Record<LogLevel, number>>(
            (accumulator, level, index) => {
                accumulator[level] = levelCounts[index]?.count ?? 0;
                return accumulator;
            },
            { info: 0, warning: 0, error: 0, critical: 0 },
        );

        const bySource = LOG_SOURCES.map((source, index) => ({
            source,
            count: sourceCounts[index]?.count ?? 0,
        })).filter((entry) => entry.count > 0);

        return {
            stats: {
                total: total.count ?? 0,
                last24h: last24h.count ?? 0,
                byLevel,
                bySource,
                lastOccurrenceAt: latest.data?.occurred_at ?? null,
            },
            refused: false,
            error: failure?.error?.message ?? null,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur inconnue';
        console.warn(`[activity-log] Synthèse impossible : ${message}`);
        return { stats: emptyStats(), refused: false, error: message };
    }
}
