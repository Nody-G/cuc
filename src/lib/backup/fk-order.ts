/**
 * Sauvegarde automatique du site CUC — ordre de restauration.
 *
 * Couche « Domaine pur » (`AGENTS.md` § 1) : la dépendance clé étrangère est
 * encodée en **données explicites**, sans aucune introspection de base. Aucun
 * accès `pg_constraint`, aucun accès réseau.
 *
 * Sources des dépendances internes (FK de table vitrine vers table vitrine) :
 *  - `site_sessions.program_id → site_programs.id` (`ON DELETE CASCADE`)
 *    → `scripts/schema_site_vitrine.sql:45`
 *  - `site_inquiries.program_id → site_programs.id` (`ON DELETE SET NULL`)
 *    → `scripts/migration_sync_cuc_cockpit.sql:16`
 *
 * Les autres FK relevées (`scripts/audit_supabase_state_report.json:75-118`)
 * visent des tables **hors liste blanche** (`profiles`, `formations`,
 * `locations`) : elles n'entrent pas dans l'ordre de restauration vitrine et ne
 * créent donc aucune contrainte d'ordre interne.
 */

import type { DependencyOrderResult } from './contracts';
import { BACKUP_TABLES } from './whitelist';

/**
 * Table → tables dont elle dépend (celles qui doivent être écrites avant elle).
 * Un parent doit exister avant son enfant : l'ordre retourné est donc
 * « parents avant enfants », et l'ordre de suppression son strict inverse.
 */
export const TABLE_DEPENDENCIES: Readonly<Record<string, readonly string[]>> = {
    site_sessions: ['site_programs'],
    site_inquiries: ['site_programs'],
};

/** Rang canonique d'une table : son index dans `BACKUP_TABLES`, sinon la fin. */
function canonicalRank(table: string): number {
    const index = BACKUP_TABLES.indexOf(table);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

/** Tri stable selon l'ordre canonique de la liste blanche, puis Alphabétique. */
function canonicalSort(tables: readonly string[]): string[] {
    return [...tables].sort((left, right) => {
        const rankLeft = canonicalRank(left);
        const rankRight = canonicalRank(right);
        if (rankLeft !== rankRight) return rankLeft - rankRight;
        return left < right ? -1 : left > right ? 1 : 0;
    });
}

/**
 * Extrait un cycle par composante restante, en données pures (jamais une
 * exception). Un nœud déjà attribué à un cycle n'est pas répété.
 */
function extractCycles(
    remaining: readonly string[],
    dependencies: ReadonlyMap<string, readonly string[]>,
): string[][] {
    const remainingSet = new Set(remaining);
    const visited = new Set<string>();
    const cycles: string[][] = [];

    for (const start of remaining) {
        if (visited.has(start)) continue;

        const path: string[] = [];
        let current: string | undefined = start;

        while (current !== undefined && !visited.has(current)) {
            const seenAt = path.indexOf(current);
            if (seenAt !== -1) {
                const cycle = path.slice(seenAt);
                for (const node of cycle) visited.add(node);
                cycles.push(cycle);
                current = undefined;
                break;
            }
            path.push(current);
            current = (dependencies.get(current) ?? []).find(
                (dependency) => remainingSet.has(dependency) && !visited.has(dependency),
            );
        }

        for (const node of path) visited.add(node);
    }

    return cycles;
}

/**
 * Tri topologique **stable** : à dépendances égales, l'ordre canonique de
 * `BACKUP_TABLES` est conservé, quelle que soit l'ordre d'entrée.
 * Un graphe cyclique ne lève jamais : les nœuds concernés sont absents de
 * `order` et restitués dans `cycles`.
 */
export function orderByDependencies(
    tables: readonly string[],
    graph: Readonly<Record<string, readonly string[]>> = TABLE_DEPENDENCIES,
): DependencyOrderResult {
    const nodes = canonicalSort([...new Set(tables)]);
    const nodeSet = new Set(nodes);

    const dependencies = new Map<string, string[]>();
    const dependents = new Map<string, string[]>();
    const indegree = new Map<string, number>();

    for (const node of nodes) {
        const deps = (graph[node] ?? []).filter((dependency) => nodeSet.has(dependency));
        dependencies.set(node, deps);
        indegree.set(node, deps.length);
        for (const dependency of deps) {
            const list = dependents.get(dependency);
            if (list === undefined) dependents.set(dependency, [node]);
            else list.push(node);
        }
    }

    const order: string[] = [];
    while (order.length < nodes.length) {
        const next = nodes.find((node) => !order.includes(node) && (indegree.get(node) ?? 0) === 0);
        if (next === undefined) break;
        order.push(next);
        for (const dependent of dependents.get(next) ?? []) {
            indegree.set(dependent, (indegree.get(dependent) ?? 0) - 1);
        }
    }

    const remaining = nodes.filter((node) => !order.includes(node));
    return {
        order,
        cycles: remaining.length === 0 ? [] : extractCycles(remaining, dependencies),
    };
}

/** Ordre de suppression : strict inverse de l'ordre d'écriture (enfants d'abord). */
export function computeDeleteOrder(
    tables: readonly string[],
    graph: Readonly<Record<string, readonly string[]>> = TABLE_DEPENDENCIES,
): string[] {
    return [...orderByDependencies(tables, graph).order].reverse();
}
