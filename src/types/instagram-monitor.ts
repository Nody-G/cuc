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
}
