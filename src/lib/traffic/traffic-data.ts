import type {
    TrafficWindow,
    SiteTrafficReport,
    TrafficKpis,
    TrafficTimeSeriesPoint,
    PageVisitMetric,
    ReferrerMetric,
    DeviceMetric,
    BrowserMetric,
    GeoMetric,
    ConversionFunnel,
    RealtimeVisitor,
} from '@/types/site-traffic';

export const CUC_PAGES_CATALOG: Array<{
    path: string;
    title: string;
    category: PageVisitMetric['category'];
    weight: number;
    conversionGoal: string;
}> = [
        {
            path: '/formation-de-cascadeur',
            title: 'Formation Cascadeur Pro (Qualiopi & AFDAS)',
            category: 'formation',
            weight: 0.28,
            conversionGoal: 'Candidature Formation',
        },
        {
            path: '/videos-cascadeur',
            title: 'Vidéos & Reels Cascades CUC',
            category: 'experience',
            weight: 0.22,
            conversionGoal: 'Visionnage Reels',
        },
        {
            path: '/stages-cascades-parkour-2',
            title: 'Stages Cascades & Parkour Découverte',
            category: 'stages',
            weight: 0.14,
            conversionGoal: 'Réservation Stage',
        },
        {
            path: '/visite-virtuelle',
            title: 'Visite Virtuelle 3D du Campus',
            category: 'experience',
            weight: 0.11,
            conversionGoal: 'Exploration 3D',
        },
        {
            path: '/team-building-cascades',
            title: 'Team Building & Événements Entreprises',
            category: 'b2b',
            weight: 0.08,
            conversionGoal: 'Demande Devis B2B',
        },
        {
            path: '/stunt-workshop-cuc',
            title: 'Stunt Workshops Internationaux',
            category: 'stages',
            weight: 0.05,
            conversionGoal: 'Inscription Workshop',
        },
        {
            path: '/cuc-team-cascadeur',
            title: "L'Équipe des Cascadeurs & Coachs",
            category: 'vitrine',
            weight: 0.04,
            conversionGoal: 'Consultation Coachs',
        },
        {
            path: '/spectacles-cascadeurs-yamakasi',
            title: 'Spectacles Cascades & Yamakasi Live',
            category: 'b2b',
            weight: 0.03,
            conversionGoal: 'Booking Spectacle',
        },
        {
            path: '/contact-cuc',
            title: 'Contact & Accès Campus CUC',
            category: 'vitrine',
            weight: 0.03,
            conversionGoal: 'Formulaire Contact',
        },
        {
            path: '/visite-guidee',
            title: 'Infrastructures & 11 000 m² d’équipements',
            category: 'vitrine',
            weight: 0.02,
            conversionGoal: 'Visite Campus',
        },
    ];

/**
 * Volumes de référence par fenêtre : ce sont des **ordres de grandeur de
 * démonstration**, pas des relevés. Ils restent utiles pour montrer la forme du
 * tableau de bord avant la mise en place d'une collecte réelle, à condition de
 * le dire à l'écran (`SiteTrafficReport.dataSource === 'modelled'`).
 */
const WINDOW_MULTIPLIERS: Record<TrafficWindow, { visits: number; prevVisits: number; points: number }> = {
    today: { visits: 3820, prevVisits: 3450, points: 24 },
    '24h': { visits: 4190, prevVisits: 3890, points: 24 },
    '7d': { visits: 28450, prevVisits: 25100, points: 7 },
    '30d': { visits: 114200, prevVisits: 102400, points: 30 },
    '90d': { visits: 326000, prevVisits: 298000, points: 12 },
    '12m': { visits: 1280000, prevVisits: 1120000, points: 12 },
};

export function generateReport(window: TrafficWindow, liveVisitorsOverride?: RealtimeVisitor[]): SiteTrafficReport {
    const config = WINDOW_MULTIPLIERS[window] || WINDOW_MULTIPLIERS['30d'];
    const totalVisitors = config.visits;
    const pageViews = Math.round(totalVisitors * 3.42);
    const prevVisitors = config.prevVisits;
    const prevPageViews = Math.round(prevVisitors * 3.38);

    /**
     * Aucun visiteur n'est fabriqué ici : le flux « en direct » ne contient que
     * les sessions réellement observées, transmises par `traffic-service`.
     */
    const realtimeVisitors = liveVisitorsOverride ?? [];

    const kpis: TrafficKpis = {
        uniqueVisitors: totalVisitors,
        pageViews,
        liveVisitorsCount: realtimeVisitors.length,
        avgSessionDurationSec: 184, // 3m 04s
        bounceRate: 34.2,
        conversionRate: 6.8,
        prevPeriodUniqueVisitors: prevVisitors,
        prevPeriodPageViews: prevPageViews,
        prevPeriodBounceRate: 36.5,
    };

    const timeSeries = generateTimeSeries(window, totalVisitors, config.points);

    const topPages: PageVisitMetric[] = CUC_PAGES_CATALOG.map((p) => {
        const views = Math.round(pageViews * p.weight);
        const uniques = Math.round(totalVisitors * (p.weight * 1.15));
        return {
            path: p.path,
            title: p.title,
            category: p.category,
            views,
            uniques,
            avgDurationSec: Math.round(140 + p.weight * 200),
            bounceRate: Math.round((38 - p.weight * 30) * 10) / 10,
            conversionGoal: p.conversionGoal,
        };
    });

    const referrers: ReferrerMetric[] = [
        { source: 'Instagram (Bio, Reels, Stories)', category: 'instagram', visitors: Math.round(totalVisitors * 0.49), percentage: 49 },
        { source: 'Google Recherche Organique', category: 'google', visitors: Math.round(totalVisitors * 0.23), percentage: 23 },
        { source: 'Accès Direct & Favoris', category: 'direct', visitors: Math.round(totalVisitors * 0.14), percentage: 14 },
        { source: 'YouTube & TikTok Vidéos', category: 'youtube', visitors: Math.round(totalVisitors * 0.08), percentage: 8 },
        { source: 'Sites Partenaires & Presse', category: 'referral', visitors: Math.round(totalVisitors * 0.06), percentage: 6 },
    ];

    const devices: DeviceMetric[] = [
        { device: 'mobile', visitors: Math.round(totalVisitors * 0.69), percentage: 69 },
        { device: 'desktop', visitors: Math.round(totalVisitors * 0.26), percentage: 26 },
        { device: 'tablet', visitors: Math.round(totalVisitors * 0.05), percentage: 5 },
    ];

    const browsers: BrowserMetric[] = [
        { name: 'Safari Mobile (iOS)', visitors: Math.round(totalVisitors * 0.44), percentage: 44 },
        { name: 'Chrome Mobile (Android)', visitors: Math.round(totalVisitors * 0.25), percentage: 25 },
        { name: 'Chrome Desktop', visitors: Math.round(totalVisitors * 0.18), percentage: 18 },
        { name: 'Safari Desktop (macOS)', visitors: Math.round(totalVisitors * 0.08), percentage: 8 },
        { name: 'Firefox & Edge', visitors: Math.round(totalVisitors * 0.05), percentage: 5 },
    ];

    const geography: GeoMetric[] = [
        { country: 'France', city: 'Paris & Île-de-France', region: 'Île-de-France', visitors: Math.round(totalVisitors * 0.36), percentage: 36, flag: '🇫🇷' },
        { country: 'France', city: 'Lille & Le Cateau', region: 'Hauts-de-France', visitors: Math.round(totalVisitors * 0.24), percentage: 24, flag: '🇫🇷' },
        { country: 'France', city: 'Lyon & Auvergne-Rhône-Alpes', region: 'Auvergne-Rhône-Alpes', visitors: Math.round(totalVisitors * 0.11), percentage: 11, flag: '🇫🇷' },
        { country: 'Belgique', city: 'Bruxelles & Liège', region: 'Belgique', visitors: Math.round(totalVisitors * 0.09), percentage: 9, flag: '🇧🇪' },
        { country: 'France', city: 'Marseille & PACA', region: 'PACA', visitors: Math.round(totalVisitors * 0.08), percentage: 8, flag: '🇫🇷' },
        { country: 'Suisse', city: 'Genève & Lausanne', region: 'Suisse Romande', visitors: Math.round(totalVisitors * 0.05), percentage: 5, flag: '🇨🇭' },
        { country: 'Canada & USA', city: 'Montréal & New York', region: 'International', visitors: Math.round(totalVisitors * 0.04), percentage: 4, flag: '🌍' },
        { country: 'Autres', city: 'Europe & Monde', region: 'Monde', visitors: Math.round(totalVisitors * 0.03), percentage: 3, flag: '🌐' },
    ];

    const funnels: ConversionFunnel[] = [
        {
            id: 'formation_pro',
            title: 'Formation Cascadeur Pro (RNCP/AFDAS)',
            category: 'formation_pro',
            totalEntered: Math.round(totalVisitors * 0.28),
            totalConverted: Math.round(totalVisitors * 0.28 * 0.124),
            conversionRate: 12.4,
            steps: [
                { stepNumber: 1, name: 'Visite page Formation', visitors: Math.round(totalVisitors * 0.28), dropoffRate: 0 },
                { stepNumber: 2, name: 'Lecture programme & critères', visitors: Math.round(totalVisitors * 0.28 * 0.65), dropoffRate: 35 },
                { stepNumber: 3, name: 'Clic « Déposer candidature »', visitors: Math.round(totalVisitors * 0.28 * 0.29), dropoffRate: 55 },
                { stepNumber: 4, name: 'Dossier complet transmis', visitors: Math.round(totalVisitors * 0.28 * 0.124), dropoffRate: 57 },
            ],
        },
        {
            id: 'team_building',
            title: 'Team Building & Événements Entreprises',
            category: 'team_building',
            totalEntered: Math.round(totalVisitors * 0.08),
            totalConverted: Math.round(totalVisitors * 0.08 * 0.145),
            conversionRate: 14.5,
            steps: [
                { stepNumber: 1, name: 'Visite page Team Building', visitors: Math.round(totalVisitors * 0.08), dropoffRate: 0 },
                { stepNumber: 2, name: 'Sélection formule entreprise', visitors: Math.round(totalVisitors * 0.08 * 0.54), dropoffRate: 46 },
                { stepNumber: 3, name: 'Demande de devis initiée', visitors: Math.round(totalVisitors * 0.08 * 0.26), dropoffRate: 52 },
                { stepNumber: 4, name: 'Formulaire devis validé', visitors: Math.round(totalVisitors * 0.08 * 0.145), dropoffRate: 44 },
            ],
        },
        {
            id: 'immersion_campus',
            title: 'Immersion Vidéos Reels & Visite 3D',
            category: 'immersion_campus',
            totalEntered: Math.round(totalVisitors * 0.33),
            totalConverted: Math.round(totalVisitors * 0.33 * 0.182),
            conversionRate: 18.2,
            steps: [
                { stepNumber: 1, name: 'Entrée Vidéos / Visite 3D', visitors: Math.round(totalVisitors * 0.33), dropoffRate: 0 },
                { stepNumber: 2, name: 'Visionnage > 1 minute', visitors: Math.round(totalVisitors * 0.33 * 0.74), dropoffRate: 26 },
                { stepNumber: 3, name: 'Exploration fiches campus/reels', visitors: Math.round(totalVisitors * 0.33 * 0.38), dropoffRate: 49 },
                { stepNumber: 4, name: 'Clic vers formation ou stage', visitors: Math.round(totalVisitors * 0.33 * 0.182), dropoffRate: 52 },
            ],
        },
    ];

    return {
        window,
        generatedAt: new Date().toISOString(),
        kpis,
        timeSeries,
        topPages,
        referrers,
        devices,
        browsers,
        geography,
        funnels,
        realtimeVisitors,
        dataSource: 'modelled',
        liveIsMeasured: true,
    };
}

function generateTimeSeries(window: TrafficWindow, total: number, points: number): TrafficTimeSeriesPoint[] {
    const list: TrafficTimeSeriesPoint[] = [];
    const avgPerPoint = total / points;
    const now = new Date();

    for (let i = points - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * (window === 'today' || window === '24h' ? 3600000 : 86400000));
        let label = '';
        if (window === 'today' || window === '24h') {
            label = `${date.getHours()}h`;
        } else if (window === '7d' || window === '30d') {
            label = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
        } else {
            label = date.toLocaleDateString('fr-FR', { month: 'short' });
        }

        // Variation fluide et réaliste
        const sinus = Math.sin((points - i) / 2) * 0.25;
        const randomFactor = 0.85 + Math.random() * 0.3 + sinus;
        const visitors = Math.max(5, Math.round(avgPerPoint * randomFactor));
        const pageViews = Math.round(visitors * (3.1 + Math.random() * 0.7));

        list.push({
            label,
            timestamp: date.toISOString(),
            visitors,
            pageViews,
        });
    }

    return list;
}

/* `generateLiveVisitors` (douze faux visiteurs injectés dans le flux « en
   direct ») a été supprimé le 2026-09-24 : un tableau de bord d'audience ne
   peut pas inventer ses visiteurs. Le flux n'affiche que des sessions réelles,
   transmises par `recordSiteVisit`. */
