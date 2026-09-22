/**
 * Moteur de recherche de la palette : normalisation et score flou par
 * sous-séquence. Module pur (`AGENTS.md` § 1).
 */
import type { CommandItem, ScoredCommand } from './command-definitions';

/**
 * Normalise une chaîne pour la recherche : minuscules, sans accents,
 * ponctuation réduite à des espaces.
 */
export function normalize(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

/**
 * Correspondance floue par sous-séquence : tous les caractères de `needle`
 * doivent apparaître dans `haystack`, dans l'ordre. Retourne un score
 * (plus élevé = meilleur) ou -1 si aucun match.
 */
export function fuzzyScore(haystack: string, needle: string): number {
    if (!needle) return 0;
    if (haystack.includes(needle)) {
        // Bonus fort pour une correspondance exacte de sous-chaîne,
        // d'autant plus si elle est en début de chaîne.
        return 1000 - haystack.indexOf(needle) * 2 - (haystack.length - needle.length);
    }
    let h = 0;
    let n = 0;
    let score = 0;
    let streak = 0;
    while (h < haystack.length && n < needle.length) {
        if (haystack[h] === needle[n]) {
            streak += 1;
            score += 10 + streak * 2;
            n += 1;
        } else {
            streak = 0;
            score -= 1;
        }
        h += 1;
    }
    return n === needle.length ? score : -1;
}

/**
 * Filtre et trie les commandes pour une requête. Sans requête, toutes les
 * commandes sont renvoyées à score 0 (l'affichage reste groupé).
 */
export function scoreCommands(commands: CommandItem[], query: string): ScoredCommand[] {
    const q = normalize(query);
    if (!q) {
        return commands.map((command) => ({ command, score: 0 }));
    }
    const scored: ScoredCommand[] = [];
    for (const command of commands) {
        const labelScore = fuzzyScore(normalize(command.label), q);
        const categoryScore = fuzzyScore(normalize(command.category), q);
        const keywordScore = command.keywords?.reduce((best, k) => {
            const s = fuzzyScore(normalize(k), q);
            return s > best ? s : best;
        }, -1) ?? -1;
        const best = Math.max(labelScore, categoryScore, keywordScore);
        if (best >= 0) {
            // Priorité au libellé, puis aux mots-clés, puis à la catégorie.
            const weighted =
                labelScore >= 0 ? labelScore + 200 : keywordScore >= 0 ? keywordScore + 100 : categoryScore;
            scored.push({ command, score: weighted });
        }
    }
    return scored.sort((a, b) => b.score - a.score);
}
