/**
 * Contrôle d'intégrité du contenu — **lecture seule**.
 *
 * Le contenu de la vitrine vit à deux endroits (doctrine CUC) : dans le code
 * (replis) et dans Supabase, édité depuis le Cockpit. Vérifier « je n'ai pas
 * modifié les textes d'origine » suppose donc de contrôler les deux, plus ce
 * qui est réellement servi au visiteur.
 *
 *   node scripts/verify_content_untouched.mjs
 *     Chronologie informative : pour chaque table `site_*`, le nombre de lignes
 *     et la dernière écriture. Aucun jugement, code de sortie 0.
 *
 *   node scripts/verify_content_untouched.mjs --baseline=8a40f78
 *   node scripts/verify_content_untouched.mjs --since=2026-09-21T10:02:09Z
 *     Assertion : liste les écritures postérieures à la fenêtre et sort en
 *     code 2 si l'une d'elles porte du texte. `--baseline` résout la date du
 *     commit avec git, ce qui évite de recopier un horodatage à la main.
 *
 *   node scripts/verify_content_untouched.mjs --live
 *     Vitrine publique : pour chaque sonde, indique si le texte d'origine est
 *     servi, si la version condensée l'est encore, ou si aucun des deux ne
 *     s'affiche (cas d'une page pilotée par le CMS). Les sondes absentes du
 *     HTML sont recherchées en base pour trancher.
 *
 *   node scripts/verify_content_untouched.mjs --dump=/stunt-workshop-cuc
 *     Affiche le texte visible réellement servi par une page.
 *   node scripts/verify_content_untouched.mjs --dump=/stages-cascades-parkour-2 --grep=internat
 *     Affiche le contexte de chaque occurrence d'un terme (± 200 caractères).
 *
 * Avertissement de méthode : une fenêtre trop large produit de **faux
 * positifs**. Un premier passage avec `--since=00:00Z` a signalé 23 écritures
 * « inattendues », toutes antérieures au commit de référence de la session :
 * elles provenaient des migrations de disciplines, de séances, de POI, de
 * navigation et de pied de page. Toujours ancrer la fenêtre sur un commit.
 *
 * Aucune écriture, aucun upsert : uniquement des `select`. Sûr en production.
 */
import { execFileSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? null;
const flag = (name) => process.argv.includes(`--${name}`);

const LIVE = flag('live');
const DUMP = arg('dump');
const GREP = arg('grep');
const LOOKBACK_HOURS = 24;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const ORIGIN = 'https://www.campus-universcascades.com';

/** Tables éditoriales de la vitrine (préfixe `site_`, cf. doctrine). */
const TABLES = [
    'site_pages',
    'site_programs',
    'site_disciplines',
    'site_team',
    'site_films',
    'site_sessions',
    'site_partners',
    'site_events',
    'site_announcements',
    'site_campus_pois',
    'site_navigation',
    'site_footer',
    'site_social_links',
    'site_settings',
    'site_page_revisions',
    'site_inquiries',
];

/**
 * Écritures légitimes : le plan 3D de l'atelier campus. Ce n'est pas du texte,
 * donc aucune ligne éditoriale ne doit apparaître dans la fenêtre contrôlée.
 */
const EXPECTED_WRITES = [{ table: 'site_settings', id: 'campus_placements_3d' }];

/** Pages publiques interrogées en mode `--live`. */
const PAGES = [
    '/',
    '/formation-de-cascadeur',
    '/stages-cascades-parkour-2',
    '/equipe-cascadeurs-pro',
    '/stunt-workshop-cuc',
    '/team-building-cascades',
    '/visite-guidee',
];

/**
 * Sondes : `origin` = texte d'origine (restauré), `cut` = texte condensé par la
 * revue. Les deux sont cherchés, afin de nommer ce qui est réellement servi.
 */
const PROBES = [
    { label: 'programs.ts — cursus long', origin: 'cursus de référence', cut: '9 à 10 stages de 12 jours' },
    { label: 'programs.ts — découverte', origin: "point d'entrée incontournable", cut: '12 jours pour éprouver le rythme' },
    { label: 'programs.ts — stage été', origin: 'semaine estivale vibrante', cut: "Une semaine d'été sur le campus" },
    { label: 'disciplines.ts — CUC Tower', origin: 'Unique en Europe, la CUC Tower', cut: null },
    { label: 'stages.data.ts — stage découverte', origin: "Vivez la vie d'un cascadeur", cut: 'Deux jours en internat' },
    { label: 'équipe — accroche', origin: 'unique au monde', cut: 'Coordinateurs de cascades, pionniers' },
    { label: 'stunt-workshop — accroche EN', origin: "world's premier", cut: null },
    { label: 'team building — accroche', origin: 'sans compromis', cut: 'de 10 à 300 personnes' },
    { label: 'accueil — visite virtuelle', origin: 'comme si vous y étiez', cut: null },
    { label: 'campus.ts — hébergement', origin: 'Domaine de 6 hectares', cut: null },
];

function report(status, message) {
    const icon = status === 'ok' ? 'OK   ' : status === 'warn' ? 'WARN ' : 'ECHEC';
    console.log(`${icon} ${message}`);
}

/** Résout la fenêtre de contrôle : `--since` prioritaire, sinon `--baseline` via git. */
function resolveWindow() {
    const explicit = arg('since');
    if (explicit) {
        const parsed = Date.parse(explicit);
        if (Number.isNaN(parsed)) {
            report('fail', `--since="${explicit}" n'est pas une date ISO exploitable.`);
            process.exit(1);
        }
        return { iso: new Date(parsed).toISOString(), source: 'option --since' };
    }

    const baseline = arg('baseline');
    if (baseline) {
        try {
            const iso = execFileSync('git', ['log', '-1', '--format=%cI', baseline], { encoding: 'utf8' }).trim();
            const parsed = Date.parse(iso);
            if (Number.isNaN(parsed)) throw new Error(`date illisible : « ${iso} »`);
            return { iso: new Date(parsed).toISOString(), source: `commit ${baseline}` };
        } catch (error) {
            report('fail', `--baseline="${baseline}" : ${error?.message ?? error}`);
            process.exit(1);
        }
    }

    return null;
}

/**
 * Normalise du HTML ou du JSON pour comparaison : entités décodées, apostrophes
 * typographiques alignées, espaces compactés, casse neutralisée.
 *
 * Sans cela, `d'un cascadeur` ne se compare pas à `d'un cascadeur` et la
 * sonde renvoie un faux « texte absent ».
 */
function normalize(input) {
    return String(input)
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
        .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
        .replace(/&nbsp;/g, ' ')
        .replace(/"/g, '"')
        .replace(/'|'|&rsquo;/g, "'")
        .replace(/&eacute;/g, 'é')
        .replace(/&agrave;/g, 'à')
        .replace(/&egrave;/g, 'è')
        .replace(/&/g, '&')
        .replace(/[\u2018\u2019\u02BC]/g, "'")
        .replace(/[\u2013\u2014]/g, '-')
        .replace(/\s+/g, ' ')
        .toLowerCase();
}

/** Clé d'identification d'une ligne, selon la table. */
function rowId(table, row) {
    if (table === 'site_settings') return row.key ?? '(sans clé)';
    return row.slug ?? row.code ?? row.id ?? row.name ?? row.title ?? '(sans identifiant)';
}

/** Horodatage d'une ligne, quelle que soit la colonne utilisée. */
function rowTimestamp(row) {
    return row.updated_at ?? row.modified_at ?? row.created_at ?? null;
}

async function fetchPage(path) {
    const res = await fetch(`${ORIGIN}${path}`, { redirect: 'follow', signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { html: await res.text() };
}

async function main() {
    console.log("=== Contrôle d'intégrité du contenu (lecture seule) ===");

    if (!supabaseUrl) {
        report('fail', 'NEXT_PUBLIC_SUPABASE_URL absente de .env.local — contrôle impossible.');
        process.exit(1);
    }

    const window = resolveWindow();
    if (window) {
        console.log(`Fenêtre contrôlée : écritures postérieures au ${window.iso} (${window.source})`);
    } else if (!DUMP || LIVE) {
        console.log(
            'Mode informatif : aucune fenêtre fournie, seule la dernière écriture de chaque table est indiquée.\n' +
            'Pour une assertion, ajouter --baseline=<commit> ou --since=<ISO>.\n'
        );
    }

    // `--dump` seul n'a pas besoin d'inventorier la base : on l'évite pour garder
    // la sortie lisible. `--live` en a besoin (recherche des sondes en base).
    const skipDatabase = Boolean(DUMP) && !LIVE && !window;

    let client = serviceKey
        ? createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
        : null;
    if (!client) {
        if (!anonKey) {
            report('fail', 'Aucune clé Supabase exploitable (ni service_role, ni publique).');
            process.exit(1);
        }
        client = createClient(supabaseUrl, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
        report('warn', 'Clé de service absente : lecture via la clé publique (tables non lisibles signalées).');
    }

    const dbText = [];
    let checked = 0;
    let expected = 0;
    let unexpected = 0;
    let unreadable = 0;
    const dbFloor = window ? Date.parse(window.iso) : null;

    if (!skipDatabase) console.log('\n--- Écritures en base');
    for (const table of skipDatabase ? [] : TABLES) {
        const { data, error } = await client.from(table).select('*').limit(1000);
        if (error) {
            unreadable += 1;
            const missing = String(error.code ?? '') === 'PGRST205';
            report('warn', `${table} : ${missing ? 'TABLE ABSENTE de la base' : 'illisible'} (${error.code ?? ''} ${error.message})`.trim());
            continue;
        }

        const rows = Array.isArray(data) ? data : [];
        checked += 1;
        dbText.push(normalize(JSON.stringify(rows)));

        const stamps = rows.map(rowTimestamp).filter(Boolean).sort();
        const latest = stamps[stamps.length - 1] ?? 'non horodatée';
        report('ok', `${table} : ${rows.length} ligne(s) — dernière écriture ${latest}`);

        // Aucune fenêtre ⇒ aucun jugement : lister des lignes « récentes » sur
        // 24 h noierait le rapport sous les écritures de migration légitimes.
        const recent = dbFloor
            ? rows.filter((row) => {
                const stamp = rowTimestamp(row);
                return stamp ? Date.parse(stamp) >= dbFloor : false;
            })
            : [];

        for (const row of recent) {
            const id = rowId(table, row);
            const isExpected = EXPECTED_WRITES.some((e) => table === e.table && e.id === id);
            if (isExpected) {
                expected += 1;
                report('ok', `  · ${id} — écriture attendue (${rowTimestamp(row)})`);
            } else {
                unexpected += 1;
                report('warn', `  · ${id} — texte modifié le ${rowTimestamp(row)}`);
            }
        }
    }

    if (!skipDatabase) {
        console.log(
            `\n${checked} table(s) lisible(s), ${unreadable ? `${unreadable} non lisible(s), ` : ''}` +
            `${expected} écriture(s) attendue(s), ${unexpected} écriture(s) de texte dans la fenêtre.`
        );

        if (!window) {
            report('ok', 'Mode informatif : aucune assertion. Fournir une fenêtre pour contrôler.');
        } else if (unexpected === 0) {
            report('ok', 'Aucune ligne éditoriale modifiée dans la fenêtre : seuls les placements 3D le sont.');
        } else {
            report('fail', 'Des lignes éditoriales ont été modifiées dans la fenêtre contrôlée.');
        }
    }

    if (LIVE) {
        console.log('\n--- Vitrine publique : textes servis');
        const corpus = new Map();

        for (const path of PAGES) {
            try {
                const { html } = await fetchPage(path);
                corpus.set(path, normalize(html));
            } catch (error) {
                report('warn', `${path} : ${error?.message ?? error}`);
            }
        }
        report('ok', `${corpus.size}/${PAGES.length} page(s) récupérée(s)`);

        const inDb = (needle) => {
            const normalized = normalize(needle);
            return dbText.some((blob) => blob.includes(normalized));
        };

        for (const probe of PROBES) {
            const originPage = [...corpus.entries()].find(([, text]) => text.includes(normalize(probe.origin)))?.[0];
            if (originPage) {
                report('ok', `${probe.label} — origine servie (${originPage})`);
                continue;
            }

            const cutPage = probe.cut
                ? [...corpus.entries()].find(([, text]) => text.includes(normalize(probe.cut)))?.[0]
                : null;
            if (cutPage) {
                report('fail', `${probe.label} — texte CONDENSÉ encore servi (${cutPage})`);
                continue;
            }

            if (inDb(probe.origin)) {
                report('ok', `${probe.label} — origine présente en base, hors des pages contrôlées`);
            } else if (probe.cut && inDb(probe.cut)) {
                report('fail', `${probe.label} — version CONDENSÉE stockée en base`);
            } else {
                report('warn', `${probe.label} — sonde absente du HTML et de la base (texte publié différent)`);
            }
        }
    }

    if (DUMP) {
        console.log(`\n--- Texte visible servi : ${DUMP}`);
        try {
            const { html } = await fetchPage(DUMP);
            const text = normalize(html);

            if (!GREP) {
                console.log(text.slice(0, 1500));
            } else {
                const needle = normalize(GREP);
                const positions = [];
                for (let i = text.indexOf(needle); i !== -1 && positions.length < 3; i = text.indexOf(needle, i + needle.length)) {
                    positions.push(i);
                }
                if (positions.length === 0) {
                    report('warn', `« ${GREP} » absent de la page servie.`);
                }
                for (const index of positions) {
                    console.log(`…${text.slice(Math.max(0, index - 200), index + needle.length + 200)}…\n`);
                }
            }
        } catch (error) {
            report('warn', `${DUMP} : ${error?.message ?? error}`);
        }
    }

    process.exit(window && unexpected > 0 ? 2 : 0);
}

main().catch((error) => {
    console.error(`ECHEC inattendu : ${error?.message ?? error}`);
    process.exit(1);
});
