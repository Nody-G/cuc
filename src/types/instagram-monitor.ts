/**
 * Contrats de données pour le Monitoring Instagram du Cockpit CUC.
 * Couche « Types & Contrats » (AGENTS.md § 1).
 */

export interface InstagramAccountStat {
    id: string;
    username: string;
    displayName: string;
    followersCount: number;
    followersFormatted: string;
    followingCount?: number;
    postsCount?: number;
    avatarUrl?: string;
    isCuc?: boolean;
    lastUpdated: string;
    verified?: boolean;
    /**
     * Rang **calculé** dans le comparatif affiché (1 = premier), attribué à
     * l'affichage par `rankAccountsByFollowers`. Jamais stocké : un rang figé
     * finissait par contredire l'ordre des abonnés (défaut corrigé le
     * 2026-09-24). Aucun rang national n'est affiché faute de source mesurée.
     */
    comparativeRank?: number;
    categoryRank?: string; // Rang dans le milieu / spécialité
    category?: string; // Catégorie (Cascade & Cinéma, Média, Combat, etc.)
    country?: string; // FR, Monde, etc.
}

export type LeaderboardFilterMode = 'direct_context' | 'top_france' | 'action_stunt' | 'all';

export interface InstagramGrowthMilestone {
    currentFollowers: number;
    nextTarget: number;
    /** Borne basse du palier courant (multiple de 100 000), calculée. */
    tierFloor: number;
    progressPercent: number;
    remainingToTarget: number;
    /**
     * Cadence d'abonnés par jour. **Uniquement renseignée quand une variation a
     * été mesurée** entre deux relevés : sinon elle reste absente. Défaut corrigé
     * le 2026-09-24 — la cadence affichée était une constante codée en dur
     * (« +1 420 / jour ») qui faisait apparaître une date d'atteinte inventée.
     */
    dailyGrowthRate?: number;
    /** Dérivée de `dailyGrowthRate`, donc absente en même temps que lui. */
    estimatedDaysToTarget?: number;
}

export interface InstagramReelsAggregates {
    totalViews: number;
    totalViewsFormatted: string;
    avgViewsPerReel: number;
    avgViewsFormatted: string;
    /** Nombre de Reels pris en compte dans le cumul. */
    reelCount: number;
    /**
     * Les trois Reels les plus vus du jeu de données courant. Ce sont des
     * **repères** tant que la clé Meta n'est pas active : aucune vue n'est
     * extrapolée ici. `totalLikesEstimated` et `avgEngagementRate` ont été
     * retirés le 2026-09-24 — c'étaient deux valeurs écrites à la main.
     */
    topReels: InstagramReelMetric[];
}

export interface InstagramReelMetric {
    id: string;
    shortcode: string;
    url: string;
    title: string;
    description: string;
    coverImage: string;
    views: number;
    viewsFormatted: string;
    likes?: string;
    date?: string;
    isFeatured?: boolean;
    lastUpdated?: string;
    stuntCategory?: 'fire' | 'car' | 'height' | 'combat' | 'parkour' | 'workshop' | 'general';
}

export interface InstagramMetaApiConfig {
    enabled: boolean;
    accessToken?: string;
    instagramAccountId?: string;
    appId?: string;
    appSecret?: string;
}

export interface InstagramMonitorSummary {
    cucAccount: InstagramAccountStat;
    leaderboard: InstagramAccountStat[];
    reelsMetrics: InstagramReelMetric[];
    metaConfig: InstagramMetaApiConfig;
    isMetaApiActive: boolean;
    lastGlobalSync: string;
    milestone: InstagramGrowthMilestone;
    aggregates: InstagramReelsAggregates;
}
