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
    nationalRank?: number; // Vrai rang national français tous instagrameurs confondus
    categoryRank?: string; // Rang dans le milieu / spécialité
    category?: string; // Catégorie (Cascade & Cinéma, Média, Combat, etc.)
    country?: string; // FR, Monde, etc.
}

export type LeaderboardFilterMode = 'direct_context' | 'top_france' | 'action_stunt' | 'all';

export interface InstagramGrowthMilestone {
    currentFollowers: number;
    nextTarget: number;
    progressPercent: number;
    remainingToTarget: number;
    dailyGrowthRate: number;
    estimatedDaysToTarget: number;
}

export interface InstagramReelsAggregates {
    totalViews: number;
    totalViewsFormatted: string;
    avgViewsPerReel: number;
    avgViewsFormatted: string;
    totalLikesEstimated: string;
    avgEngagementRate: number; // en % (ex: 5.4%)
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
    stuntCategory?: 'fire' | 'car' | 'height' | 'combat' | 'parkour' | 'general';
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
