import type {
    TrafficWindow,
    SiteTrafficReport,
    RealtimeVisitor,
    IncomingVisitPayload,
} from '@/types/site-traffic';
import { generateReport, generateLiveVisitors, CUC_PAGES_CATALOG } from './traffic-data';

interface LiveSessionStore {
    sessions: Map<string, RealtimeVisitor>;
    lastPruned: number;
}

// Global in-memory store for active sessions on the server
const globalSessions: LiveSessionStore = {
    sessions: new Map(),
    lastPruned: Date.now(),
};

/** Nettoie les sessions inactives depuis plus de 5 minutes */
function pruneExpiredSessions() {
    const now = Date.now();
    if (now - globalSessions.lastPruned < 30000) return; // Prune max every 30s
    globalSessions.lastPruned = now;

    const expiryThreshold = now - 5 * 60 * 1000;
    for (const [id, session] of globalSessions.sessions.entries()) {
        const lastActive = new Date(session.lastActiveAt).getTime();
        if (lastActive < expiryThreshold) {
            globalSessions.sessions.delete(id);
        }
    }
}

/** Enregistre une visite envoyée par le tracker client vitrine */
export function recordSiteVisit(payload: IncomingVisitPayload): RealtimeVisitor {
    pruneExpiredSessions();

    const now = Date.now();
    const cleanPath = payload.path.replace(/^\/(fr|en)/, '') || '/';
    const catalogItem = CUC_PAGES_CATALOG.find((p) => p.path === cleanPath);
    const pageTitle = catalogItem ? catalogItem.title : `Page ${cleanPath}`;

    // Analyse de la source
    let source = 'Accès Direct';
    const ref = (payload.referrer || '').toLowerCase();
    if (ref.includes('instagram.com')) {
        source = 'Instagram (@campusuniverscascades)';
    } else if (ref.includes('google.')) {
        source = 'Google Recherche Organique';
    } else if (ref.includes('youtube.com')) {
        source = 'YouTube CUC';
    } else if (ref.includes('tiktok.com')) {
        source = 'TikTok Cascades';
    } else if (ref) {
        source = `Lien externe: ${new URL(payload.referrer!).hostname}`;
    }

    const sessionId = `vis-${Math.random().toString(36).substring(2, 9)}`;
    const visitor: RealtimeVisitor = {
        id: sessionId,
        currentPath: payload.path,
        pageTitle,
        source,
        city: 'France (En ligne)',
        country: 'France',
        flag: '🇫🇷',
        device: payload.device || 'mobile',
        locale: payload.locale || 'fr',
        activeSeconds: 1,
        lastActiveAt: new Date(now).toISOString(),
    };

    globalSessions.sessions.set(sessionId, visitor);
    return visitor;
}

/** Récupère le rapport complet pour une fenêtre donnée */
export function getSiteTrafficReport(window: TrafficWindow): SiteTrafficReport {
    pruneExpiredSessions();

    // S'il y a de vraies sessions en cours, on les combine avec les visiteurs synthétiques
    const realSessions = Array.from(globalSessions.sessions.values());
    const fallbackLive = generateLiveVisitors();

    const combinedLive = [...realSessions, ...fallbackLive].slice(0, 16);

    return generateReport(window, combinedLive);
}

/** Récupère la liste des visiteurs en direct et le nombre actif */
export function getRealtimeVisitors(): { count: number; visitors: RealtimeVisitor[] } {
    pruneExpiredSessions();
    const realSessions = Array.from(globalSessions.sessions.values());
    const fallbackLive = generateLiveVisitors();
    const list = [...realSessions, ...fallbackLive].slice(0, 14);

    return {
        count: list.length,
        visitors: list,
    };
}

/** Formate une durée en secondes en affichage lisible (ex: 3m 24s) */
export function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
}

/** Génère un export CSV du rapport d'audience */
export function exportTrafficCsv(report: SiteTrafficReport): string {
    const lines: string[] = [];

    // Header
    lines.push(`Rapport d'audience CUC - Fenêtre: ${report.window} - Généré le: ${report.generatedAt}`);
    lines.push('');

    // KPIs
    lines.push('--- INDICATEURS CLÉS (KPIS) ---');
    lines.push('Visiteurs Uniques,Pages Vues,Visiteurs en direct,Durée moyenne (sec),Taux de rebond (%),Taux de conversion (%)');
    lines.push(
        `${report.kpis.uniqueVisitors},${report.kpis.pageViews},${report.kpis.liveVisitorsCount},${report.kpis.avgSessionDurationSec},${report.kpis.bounceRate}%,${report.kpis.conversionRate}%`
    );
    lines.push('');

    // Top Pages
    lines.push('--- TOP PAGES ---');
    lines.push('Page,Chemin,Catégorie,Vues,Visiteurs Uniques,Durée moy (sec),Taux Rebond (%),Objectif');
    report.topPages.forEach((p) => {
        lines.push(`"${p.title}","${p.path}","${p.category}",${p.views},${p.uniques},${p.avgDurationSec},${p.bounceRate}%,"${p.conversionGoal || ''}"`);
    });
    lines.push('');

    // Referrers
    lines.push('--- CANAUX D\'ACQUISITION ---');
    lines.push('Source,Catégorie,Visiteurs,Part (%)');
    report.referrers.forEach((r) => {
        lines.push(`"${r.source}","${r.category}",${r.visitors},${r.percentage}%`);
    });
    lines.push('');

    // Appareils
    lines.push('--- APPAREILS ---');
    lines.push('Appareil,Visiteurs,Part (%)');
    report.devices.forEach((d) => {
        lines.push(`"${d.device}",${d.visitors},${d.percentage}%`);
    });
    lines.push('');

    // Géographie
    lines.push('--- GÉOGRAPHIE ---');
    lines.push('Pays,Ville/Région,Visiteurs,Part (%)');
    report.geography.forEach((g) => {
        lines.push(`"${g.country}","${g.city}",${g.visitors},${g.percentage}%`);
    });

    return lines.join('\n');
}
