/**
 * Contrats de données pour le Monitoring des Visites et du Trafic Web CUC.
 *
 * Couche « Types & Contrats » (AGENTS.md § 1) : isolée de tout React ou état.
 */

export type TrafficWindow = 'today' | '24h' | '7d' | '30d' | '90d' | '12m';

export interface TrafficKpis {
    uniqueVisitors: number;
    pageViews: number;
    liveVisitorsCount: number;
    avgSessionDurationSec: number;
    bounceRate: number; // 0-100%
    conversionRate: number; // 0-100%
    prevPeriodUniqueVisitors: number;
    prevPeriodPageViews: number;
    prevPeriodBounceRate: number;
}

export interface TrafficTimeSeriesPoint {
    label: string;
    timestamp: string;
    visitors: number;
    pageViews: number;
}

export type PageCategory = 'formation' | 'stages' | 'b2b' | 'experience' | 'vitrine' | 'legal';

export interface PageVisitMetric {
    path: string;
    title: string;
    category: PageCategory;
    views: number;
    uniques: number;
    avgDurationSec: number;
    bounceRate: number;
    conversionGoal?: string;
}

export type TrafficSourceCategory = 'instagram' | 'google' | 'direct' | 'youtube' | 'tiktok' | 'referral';

export interface ReferrerMetric {
    source: string;
    category: TrafficSourceCategory;
    visitors: number;
    percentage: number;
}

export interface DeviceMetric {
    device: 'mobile' | 'desktop' | 'tablet';
    visitors: number;
    percentage: number;
}

export interface BrowserMetric {
    name: string;
    visitors: number;
    percentage: number;
}

export interface GeoMetric {
    country: string;
    city: string;
    region: string;
    visitors: number;
    percentage: number;
    flag: string;
}

export interface ConversionFunnelStep {
    stepNumber: number;
    name: string;
    visitors: number;
    dropoffRate: number; // % perdus depuis l'étape précédente
}

export interface ConversionFunnel {
    id: string;
    title: string;
    category: 'formation_pro' | 'team_building' | 'immersion_campus';
    totalEntered: number;
    totalConverted: number;
    conversionRate: number;
    steps: ConversionFunnelStep[];
}

export interface RealtimeVisitor {
    id: string;
    currentPath: string;
    pageTitle: string;
    source: string;
    city: string;
    country: string;
    flag: string;
    device: 'mobile' | 'desktop' | 'tablet';
    locale: string;
    activeSeconds: number;
    lastActiveAt: string;
}

export interface SiteTrafficReport {
    window: TrafficWindow;
    generatedAt: string;
    kpis: TrafficKpis;
    timeSeries: TrafficTimeSeriesPoint[];
    topPages: PageVisitMetric[];
    referrers: ReferrerMetric[];
    devices: DeviceMetric[];
    browsers: BrowserMetric[];
    geography: GeoMetric[];
    funnels: ConversionFunnel[];
    realtimeVisitors: RealtimeVisitor[];
}

/** Événement de visite émis par le tracker vitrine. */
export interface IncomingVisitPayload {
    path: string;
    referrer?: string;
    locale?: string;
    screen?: string;
    device?: 'mobile' | 'desktop' | 'tablet';
}
