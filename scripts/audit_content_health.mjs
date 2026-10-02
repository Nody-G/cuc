#!/usr/bin/env node
/**
 * AUDIT DE SANTÉ DU CONTENU — VITRINE CUC (lecture seule)
 * =======================================================
 *
 * Applique le moteur pur [`analyzeContentHealth`](src/lib/content-health.ts:49)
 * aux données Supabase **réelles** et restitue le rapport tel que le Cockpit
 * l'afficherait (mêmes sources, mêmes requêtes, même moteur).
 *
 * Ce script NE CORRIGE RIEN :
 *   - uniquement des `select` (via les lecteurs publics du dépôt) ;
 *   - aucune écriture, aucune migration, aucune mutation de données.
 *
 * Sources lues (identiques à `useContentHealth`) :
 *   site_pages (getAllPages), site_navigation (getNavigation),
 *   site_footer (getFooter), site_social_links (getSocialLinks),
 *   site_partners (getPartners), site_events (getEvents),
 *   site_settings (getSiteSettings), site_films (getFilms),
 *   site_team (getTeam), site_settings#celebrities (getCelebrities).
 *
 * Exécution (le moteur importé est en TypeScript) :
 *   node_modules/.bin/tsx scripts/audit_content_health.mjs
 *
 * Blocages : variables d'environnement manquantes ou connexion Supabase en
 * erreur ⇒ arrêt immédiat avec le blocage exact, sans aucune estimation.
 */

import * as dotenv from 'dotenv';

import { analyzeContentHealth } from '../src/lib/content-health.ts';
import { createPublicClient } from '../src/lib/supabase/public.ts';
import { getAllPages } from '../src/lib/data/site/pages.ts';
import { getNavigation, getFooter, getSocialLinks } from '../src/lib/data/site/navigation.ts';
import { getPartners } from '../src/lib/data/site/partners.ts';
import { getEvents } from '../src/lib/data/site/events.ts';
import { getSiteSettings } from '../src/lib/data/site/settings.ts';
import { getFilms, getCelebrities } from '../src/lib/data/site/films.ts';
import { getTeam } from '../src/lib/data/site/team.ts';

dotenv.config({ path: '.env.local' });

/** Poids de sévérité — dupliqué du moteur uniquement pour la ventilation locale. */
const SEVERITY_WEIGHT = { error: 10, warning: 4, info: 1 };
/** Familles exemptées du score (cf. `SCORE_EXEMPT_KINDS`). */
const SCORE_EXEMPT_KINDS = ['incomplete-roles'];

/** Erreur de blocage : provoque l'arrêt propre du script (code 1). */
class AuditBlocked extends Error { }

function fatal(message) {
    console.error(`\n[BLOCAGE] ${message}\n`);
    // Volontairement une exception (et non `process.exit`) : sur Windows, quitter
    // pendant des requêtes `fetch` en vol déclenche une assertion libuv.
    throw new AuditBlocked(message);
}

/** Groupe les anomalies par famille (kind) en conservant l'ordre d'apparition. */
function groupByKind(issues) {
    const groups = new Map();
    for (const issue of issues) {
        if (!groups.has(issue.kind)) groups.set(issue.kind, []);
        groups.get(issue.kind).push(issue);
    }
    return groups;
}

/** Ventile la pénalité de score par famille (hors familles exemptées). */
function penaltyByKind(issues) {
    const penalty = {};
    for (const issue of issues) {
        if (SCORE_EXEMPT_KINDS.includes(issue.kind)) continue;
        penalty[issue.kind] = (penalty[issue.kind] ?? 0) + (SEVERITY_WEIGHT[issue.severity] ?? 0);
    }
    return penalty;
}

async function assertConnection() {
    const supabase = createPublicClient();
    // Sonde factuelle de connectivité : la même table que le diagnostic.
    // `select('*')` (aucune colonne nommée) : ne présume pas du schéma réel.
    const { error, count } = await supabase
        .from('site_pages')
        .select('*', { count: 'exact', head: true });

    if (error) {
        fatal(
            `Connexion Supabase en erreur sur "site_pages" : ${error.message || '(message vide)'}` +
            (error.code ? ` (code ${error.code})` : '')
        );
    }
    return count ?? 0;
}

async function main() {
    // --- 1. Garde-fou : credentials ------------------------------------------
    const missing = [];
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    if (missing.length > 0) {
        fatal(`Variable(s) d'environnement Supabase manquante(s) dans .env.local : ${missing.join(', ')}`);
    }

    const pagesProbeCount = await assertConnection();

    // --- 2. Collecte des sources (identiques à useContentHealth) -------------
    const [pages, navigation, footer, socialLinks, partners, events, settings, films, team, celebrities] =
        await Promise.all([
            getAllPages(),
            getNavigation('main'),
            getFooter('main'),
            getSocialLinks(),
            getPartners(),
            getEvents(),
            getSiteSettings(),
            getFilms(),
            getTeam(),
            getCelebrities(),
        ]);

    // --- 3. Moteur pur -------------------------------------------------------
    const report = analyzeContentHealth({
        pages,
        navigation: navigation?.structure ?? null,
        footer: footer?.structure ?? null,
        socialLinks,
        partners,
        events,
        settings,
        films,
        team,
        celebrities,
    });

    // --- 4. Regroupement lisible --------------------------------------------
    const groups = groupByKind(report.issues);
    const issuesByKind = {};
    for (const [kind, list] of groups.entries()) {
        const bySeverity = { error: 0, warning: 0, info: 0 };
        for (const issue of list) bySeverity[issue.severity] += 1;
        issuesByKind[kind] = {
            total: list.length,
            bySeverity,
            exemptFromScore: SCORE_EXEMPT_KINDS.includes(kind),
            items: list.map((issue) => ({
                id: issue.id,
                scope: issue.scope,
                severity: issue.severity,
                label: issue.label,
                value: issue.value ?? null,
                message: issue.message,
                hint: issue.hint ?? null,
            })),
        };
    }

    // --- 5. Second passage : hors `incomplete-roles` -------------------------
    const nonExemptIssues = report.issues.filter((i) => !SCORE_EXEMPT_KINDS.includes(i.kind));
    const penalty = nonExemptIssues.reduce((sum, i) => sum + (SEVERITY_WEIGHT[i.severity] ?? 0), 0);
    const remainingByKind = {};
    for (const issue of nonExemptIssues) {
        remainingByKind[issue.kind] = (remainingByKind[issue.kind] ?? 0) + 1;
    }

    // --- 6. Rapport JSON lisible --------------------------------------------
    const output = {
        generatedAt: report.checkedAt,
        sources: {
            pagesProbeCount,
            pages: pages.length,
            navigationItems: navigation?.structure?.items?.length ?? 0,
            footerColumns: footer?.structure?.columns?.length ?? 0,
            socialLinks: socialLinks.length,
            partners: partners.length,
            events: events.length,
            films: films.length,
            team: team.length,
            celebrities: celebrities.length,
            settingsLoaded: Boolean(settings),
        },
        score: report.score,
        severityCounts: report.severityCounts,
        countsByKind: report.counts,
        totalIssues: report.issues.length,
        penaltyByKind: penaltyByKind(report.issues),
        issuesByKind,
        secondPass: {
            note: "Score théorique après retrait de la famille 'incomplete-roles' (déjà exemptée du score : le score est donc inchangé).",
            exemptKinds: SCORE_EXEMPT_KINDS,
            scoreTheoretical: Math.max(0, Math.min(100, 100 - penalty)),
            scoreActual: report.score,
            remainingIssuesByKind: remainingByKind,
            remainingIssuesTotal: nonExemptIssues.length,
        },
    };

    console.log(JSON.stringify(output, null, 2));
}

main().catch((error) => {
    if (error instanceof AuditBlocked) {
        process.exitCode = 1;
        return;
    }
    console.error(`\n[ERREUR] ${error?.stack ?? String(error)}\n`);
    process.exitCode = 1;
});
