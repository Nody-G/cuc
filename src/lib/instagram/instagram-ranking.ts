/**
 * ==============================================================================
 * CUC — Classement comparatif Instagram : rang **dérivé** de l'ordre réel
 * ==============================================================================
 * Constat (2026-09-24, relevé en usage) : le rang affiché venait de deux sources
 * différentes — une constante stockée par compte, et une **échelle codée en
 * dur** appliquée au seul compte CUC. Résultat : le classement affiché ne
 * correspondait pas à l'ordre des abonnés, et le rang du CUC sautait (138 → 122)
 * dès que son nombre d'abonnés changeait de palier, alors que les autres lignes
 * ne bougeaient pas.
 *
 * Règle retenue ici, et c'est la seule : **le rang est la position**. On trie par
 * abonnés décroissants (départage stable par identifiant de compte), puis on
 * numérote. Un rang ne se stocke pas, il se calcule — il ne peut donc jamais
 * contredire l'ordre affiché.
 *
 * Les nombres d'abonnés eux-mêmes restent des **repères** tant que la
 * synchronisation Meta n'est pas active : ce module ne prétend rien sur leur
 * exactitude, il garantit seulement la cohérence du classement.
 */

export interface RankableAccount {
    id: string;
    username: string;
    followersCount: number;
}

/** Un compte accompagné de son rang dans le comparatif (1 = premier). */
export type RankedAccount<T extends RankableAccount> = T & { comparativeRank: number };

/**
 * Compare deux comptes : abonnés décroissants, puis nom d'utilisateur croissant
 * — départage **stable**, pour que l'ordre ne dépende jamais de l'ordre du
 * tableau d'entrée.
 */
export function compareByFollowers(a: RankableAccount, b: RankableAccount): number {
    if (b.followersCount !== a.followersCount) return b.followersCount - a.followersCount;
    return a.username.localeCompare(b.username);
}

/**
 * Classe un comparatif et attribue à chaque compte son rang réel.
 * Copie immuable : le tableau reçu n'est jamais réordonné sur place.
 */
export function rankAccountsByFollowers<T extends RankableAccount>(
    accounts: readonly T[]
): Array<RankedAccount<T>> {
    return [...accounts]
        .sort(compareByFollowers)
        .map((account, index) => ({ ...account, comparativeRank: index + 1 }));
}

/**
 * Rang d'un compte repéré par son nom d'utilisateur, dans le comparatif trié.
 * `null` si le compte n'y figure pas — on n'invente jamais une position.
 */
export function findComparativeRank(
    ranked: ReadonlyArray<RankedAccount<RankableAccount>>,
    username: string
): number | null {
    return ranked.find((account) => account.username === username)?.comparativeRank ?? null;
}

/** Voisin immédiat au-dessus, et écart d'abonnés (0 s'il n'y en a pas). */
export function neighbourAbove<T extends RankableAccount>(
    ranked: ReadonlyArray<RankedAccount<T>>,
    username: string
): { account: RankedAccount<T> | null; delta: number } {
    const index = ranked.findIndex((account) => account.username === username);
    if (index <= 0) return { account: null, delta: 0 };
    const account = ranked[index - 1];
    return { account, delta: account.followersCount - ranked[index].followersCount };
}

/** Voisin immédiat en dessous, et écart d'abonnés (0 s'il n'y en a pas). */
export function neighbourBelow<T extends RankableAccount>(
    ranked: ReadonlyArray<RankedAccount<T>>,
    username: string
): { account: RankedAccount<T> | null; delta: number } {
    const index = ranked.findIndex((account) => account.username === username);
    if (index < 0 || index >= ranked.length - 1) return { account: null, delta: 0 };
    const account = ranked[index + 1];
    return { account, delta: ranked[index].followersCount - account.followersCount };
}
