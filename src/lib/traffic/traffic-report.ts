/**
 * Assemblage du rapport de trafic `modelled` : KPI, série, répartitions et
 * entonnoirs. Le flux « en direct » n'est jamais fabriqué — il ne contient que
 * les sessions réellement observées, transmises par `traffic-service`.
 */

import type {
    RealtimeVisitor,
    SiteTrafficReport,
    TrafficKpis,
    TrafficWindow,
} from '@/types/site-traffic';
import {
    buildBrowsers,
    buildDevices,
    buildGeography,
    buildReferrers,
    buildTopPages,
} from './traffic-breakdowns';
import { buildFunnels } from './traffic-funnels';
import { generateTimeSeries } from './traffic-timeseries';
import { windowVolume } from './traffic-windows';

export function generateReport(
    window: TrafficWindow,
    liveVisitorsOverride?: RealtimeVisitor[]
): SiteTrafficReport {
    const config = windowVolume(window);
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

    return {
        window,
        generatedAt: new Date().toISOString(),
        kpis,
        timeSeries: generateTimeSeries(window, totalVisitors, config.points),
        topPages: buildTopPages(pageViews, totalVisitors),
        referrers: buildReferrers(totalVisitors),
        devices: buildDevices(totalVisitors),
        browsers: buildBrowsers(totalVisitors),
        geography: buildGeography(totalVisitors),
        funnels: buildFunnels(totalVisitors),
        realtimeVisitors,
        dataSource: 'modelled',
        liveIsMeasured: true,
    };
}
