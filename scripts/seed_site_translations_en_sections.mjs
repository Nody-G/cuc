#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Semis des traductions EN du contenu de section (`sections_data`)
 * ==============================================================================
 * Complète `seed_site_translations_en.mjs`, qui ne couvrait que `title`,
 * `meta_*` et `hero` (48 % de couverture mesurée). Ici : le contenu éditorial
 * des sections (présentation, tournages, Qualiopi, catalogue de stages,
 * formules d'admission, ateliers team building, accès…).
 *
 * Méthode — les traductions sont écrites **par chemin** (« about.title ») et
 * appliquées sur la structure FR RÉELLE lue dans `site_pages` :
 *   - la structure et les clés techniques (`id` d'ancrage, clés React) sont
 *     HÉRITÉES du FR, jamais retapées — `deepMergeSectionsData` remplaçant les
 *     tableaux en bloc, un `id` oublié casserait une ancre ;
 *   - les feuilles non traduites ne sont PAS recopiées : le FR reste la source
 *     vivante (aucune divergence figée).
 *
 * Idempotent : fusion dans le payload EN existant, upsert sur
 * (entity, entity_id, locale).
 *
 * Usage :
 *   node scripts/seed_site_translations_en_sections.mjs --dry
 *   node scripts/seed_site_translations_en_sections.mjs
 * ==============================================================================
 */
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const DRY = process.argv.includes('--dry');

if (!URL_BASE || !KEY) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant.');
    process.exit(1);
}

const HEADERS = {
    apikey: KEY,
    Authorization: `Bearer ${KEY}`,
    'Content-Type': 'application/json',
};

/**
 * Traductions EN, par page puis par chemin dans `sections_data`.
 * Rédaction sobre et factuelle (doctrine « zéro AI slop ») : traduction fidèle
 * du contenu FR, sans superlatif ajouté ni promesse nouvelle.
 */
const TRANSLATIONS = {
    '/': {
        'about.tag': 'OVERVIEW',
        'about.title': 'THE REFERENCE TRAINING CENTRE FOR FILM STUNTS',
        'about.subtag': '• FILM, TV SERIES & LIVE SHOWS',
        'about.badge_year': 'SINCE 2008',
        'about.description':
            'Founded in 2008 by Lucas Dollfus, Campus Univers Cascades (CUC) is a professional training centre dedicated to physical and mechanical stunt techniques, based in Le Cateau-Cambrésis (France).',
        'about.founder_name': 'LUCAS DOLLFUS',
        'about.founder_role': 'FOUNDER & STUNT COORDINATOR',
        'about.founder_quote':
            '“Mastering risk, creating the unseen, pushing the limits of physical truth in the service of the greatest directors’ vision.”',
        'about.cta_primary_text': 'Discover the Professional Programme',
        'about.cta_secondary_text': 'The Stunt Team',

        'social.badge': 'COMMUNITY & PRODUCTIONS',
        'social.title': 'FOLLOW THE CAMPUS LIVE',
        'social.subtitle':
            'Behind the scenes of training sessions, production extracts and student work on the official CUC channels.',

        'partners.badge': 'COLLABORATIONS & STUDIOS',
        'partners.title': 'THEY TRUST THE CAMPUS',
        'partners.subtitle':
            'Leading broadcasters, film studios and international productions call on the stunt performers and coordinators trained at the CUC.',

        'qualiopi.badge': 'CERTIFIED PROFESSIONAL TRAINING',
        'qualiopi.title': 'QUALIOPI CERTIFICATION & FUNDING',
        'qualiopi.subtitle':
            'Our professional programmes meet the requirements of the French National Quality Framework and are eligible for professional training funding.',
        'qualiopi.opco_badge': 'OPCO & COMPANY SCHEMES',
        'qualiopi.opco_text': 'Funding through skills operators (OPCO) for professionals.',
        'qualiopi.afdas_badge': 'AFDAS & AFDAS PRO',
        'qualiopi.afdas_text':
            'Full or partial funding for performers and entertainment industry workers.',
        'qualiopi.france_travail_badge': 'FRANCE TRAVAIL (AIF)',
        'qualiopi.france_travail_text':
            'Support and individual training assistance for jobseekers.',

        'tournages.badge': 'ACTION DESIGN & STUNT COORDINATION',
        'tournages.title': 'FILM & TV PRODUCTIONS',
        'tournages.subtitle':
            'From 3D previsualisation to international shoots, the CUC works alongside leading directors and global platforms.',
        'tournages.cta_text': 'Discuss your production',

        'virtual_tour.badge': 'IMMERSIVE 360° EXPLORATION',
        'virtual_tour.title': 'VIRTUAL TOUR OF THE CAMPUS',
        'virtual_tour.subtitle':
            'Explore our 11,000 m² of advanced facilities: fall pit, combat dojos, rigging hangars and mechanical stunt areas.',
        'virtual_tour.cta_text': 'Start the 3D immersion',
    },

    'stages-cascades-parkour-2': {
        'stages_catalogue.badge': 'WORKSHOP CATALOGUE',
        'stages_catalogue.title': 'ALL OUR IMMERSION FORMATS',
        'stages_catalogue.description':
            'Intensive workshops open from age 16, from the discovery weekend to the professional advanced masterclass.',

        'stages_catalogue.items[0].tag': 'ALL LEVELS',
        'stages_catalogue.items[0].title': 'Discovery Immersion Workshop (12 Days)',
        'stages_catalogue.items[0].desc':
            'Full immersion at the heart of the CUC campus. Physical training, screen combat, falls, rigging and a mandatory step to join the professional programme.',
        'stages_catalogue.items[0].badge': 'MANDATORY SELECTION',
        'stages_catalogue.items[0].duration': '12 days (80 h)',

        'stages_catalogue.items[1].tag': 'FROM AGE 16',
        'stages_catalogue.items[1].title': 'Stunts & Parkour Weekend',
        'stages_catalogue.items[1].desc':
            'An introduction to Yamakasi urban movement, impact landings and ground acrobatics in full safety on our indoor structures.',
        'stages_catalogue.items[1].badge': 'SHORT INTRODUCTION',
        'stages_catalogue.items[1].duration': '2 days (16 h)',

        'stages_catalogue.items[2].tag': 'ADVANCED LEVEL',
        'stages_catalogue.items[2].title': 'Combat & Action Design Masterclass',
        'stages_catalogue.items[2].desc':
            'Martial choreography for camera, prop weapon handling, impact timing and hit-reaction techniques.',
        'stages_catalogue.items[2].badge': 'ADVANCED TRAINING',
        'stages_catalogue.items[2].duration': '5 days (35 h)',

        'stages_catalogue.items[3].tag': 'PROFESSIONAL STUNT PERFORMERS',
        'stages_catalogue.items[3].title': 'Rigging, Wire Work & Human Torch Workshop',
        'stages_catalogue.items[3].desc':
            'Harness flying, winch-driven wire pulls and the full safety protocol for the human torch, supervised by certified pyrotechnicians.',
        'stages_catalogue.items[3].badge': 'FILM SPECIALISATION',
        'stages_catalogue.items[3].duration': '5 days (35 h)',
    },

    'team-building-cascades': {
        'overview.badge': 'SEMINARS & COMPANIES',
        'overview.title': 'TAILOR-MADE WORKSHOPS FOR YOUR TEAM',
        'overview.capacity': '10 to 300 people',
        'overview.duration': 'Half-day, full day or evening',
        'overview.location': 'At our site or at your seminar venue',
        'overview.description':
            'Give your teams an outstanding unifying experience: film stunts, voice dubbing and physical stunt work supervised by certified professionals.',

        'workshops[0].category': 'Nerve & Trust',
        'workshops[0].title': 'High Fall onto the Airbag',
        'workshops[0].desc':
            'Indoors or outdoors, give your colleagues the sensation of free fall onto a giant cinema air cushion. Pushing personal limits and building cohesion as a team.',

        'workshops[1].category': 'Choreography & Precision',
        'workshops[1].title': 'Film Combat',
        'workshops[1].desc':
            'Step into the middle of an action scene: an introduction to film combat techniques — evasions, feints, screen punches and precise respect for camera axes.',

        'workshops[2].category': 'Agility & Movement',
        'workshops[2].title': 'Parkour & Yamakasi',
        'workshops[2].desc':
            'An introduction supervised by professional stunt performers and urban movement specialists: obstacle crossing, precision jumps and motor control.',

        'workshops[3].category': 'Behind the Scenes',
        'workshops[3].title': 'Special Effects Make-up (SFX)',
        'workshops[3].desc':
            'Discover the craft of film make-up artists: ultra-realistic wounds, fake scars, bullet impacts and action prosthetics.',

        'workshops[4].category': 'Creativity & Voice',
        'workshops[4].title': 'Voice Dubbing & Post-Production',
        'workshops[4].desc':
            'Step into the shoes of a dubbing actor: record lines and sound effects as a team over iconic action film sequences.',
    },

    'formation-de-cascadeur': {
        'formules.badge': 'ADMISSION PATHWAY & PROGRAMME',
        'formules.title': 'FROM THE DISCOVERY WORKSHOP TO THE PRO PROGRAMME',
        'formules.subtitle':
            'Access to the long programme requires successful completion of the discovery workshop. This selection protocol ensures everyone’s safety and the level of the cohort.',

        'formules.items[0].title': 'DISCOVERY WORKSHOP & SELECTION',
        'formules.items[0].cta_text': 'Apply for the Discovery Workshop',
        'formules.items[0].step_badge': 'STEP 01 • MANDATORY SELECTION',
        'formules.items[0].description':
            '12 consecutive days to test your physical ability, composure and adaptability before applying to the long programme.',
        'formules.items[0].boarding_text': 'Accommodation & catering on site',
        'formules.items[0].duration_text': '12 consecutive days (80 h of practice)',
        'formules.items[0].schedule_text': 'Monday to Saturday (9 am – 6 pm)',
        'formules.items[0].duration_badge': '80 HOURS',
        'formules.items[0].certification_text':
            'Personalised assessment report & workshop certificate',

        'formules.items[1].title': 'TWO-YEAR PROFESSIONAL PROGRAMME',
        'formules.items[1].cta_text': 'Apply to the Two-Year Pro Programme',
        'formules.items[1].step_badge': 'STEP 02 • PROFESSIONAL TRAINING',
        'formules.items[1].description':
            'The full pathway to becoming a certified professional stunt performer. Nine intensive modules spread over two years of physical and on-camera training.',
        'formules.items[1].boarding_text': 'Unlimited access to 11,000 m² of facilities',
        'formules.items[1].duration_text': '2 years (9 to 10 modules of 80 h)',
        'formules.items[1].schedule_text': 'Intensive training sessions + real shoot conditions',
        'formules.items[1].duration_badge': '720 H TO 800 H',
        'formules.items[1].certification_text':
            'Qualiopi certification & funding (AFDAS, France Travail)',
    },

    'contact-cuc': {
        'access_info.badge': 'ACCESS & TRANSPORT',
        'access_info.title': 'HOW TO REACH THE CUC SITE',
        'access_info.description':
            'The CUC site is located in Le Cateau-Cambrésis (59360), at the crossroads of major European cities.',
        'access_info.car_info':
            'A2 and A26 motorways. 1 h 15 from Lille, 1 h 45 from Brussels and 2 h from Paris.',
        'access_info.train_info':
            'Le Cateau station (10 min) or Valenciennes / Cambrai (30 min). Direct connections in 1 h 30 from Paris Nord.',
        'access_info.parking_info':
            'Large free private car park for coaches, production trucks and private vehicles.',
        'access_info.schedule_info':
            'Office and reception open Monday to Friday, 9 am to 6.30 pm.',
    },
};

/* ------------------------------------------------------------------ *
 * Application des traductions sur la structure FR réelle
 * ------------------------------------------------------------------ */

/** Écrit une valeur dans un clone, à un chemin « a.b[0].c ». */
function assignPath(root, pathStr, value) {
    const parts = pathStr
        .replace(/\[(\d+)\]/g, '.$1')
        .split('.')
        .filter(Boolean);
    let node = root;
    for (let i = 0; i < parts.length - 1; i += 1) {
        const key = parts[i];
        if (node[key] === undefined || node[key] === null) node[key] = {};
        node = node[key];
    }
    node[parts[parts.length - 1]] = value;
}

/**
 * Retire les feuilles non traduites : seules les valeurs réellement modifiées
 * sont écrites en base (le FR reste la source pour le reste). Les tableaux sont
 * conservés tels quels — `deepMergeSectionsData` les remplace en bloc et leurs
 * `id` d'ancrage doivent être présents dans l'overlay.
 */
function pruneUnchanged(node, frNode) {
    if (Array.isArray(node)) return node;
    if (node && typeof node === 'object') {
        const out = {};
        for (const [key, value] of Object.entries(node)) {
            const frValue = frNode?.[key];
            if (Array.isArray(value)) {
                out[key] = value;
            } else if (value && typeof value === 'object') {
                const pruned = pruneUnchanged(value, frValue);
                if (Object.keys(pruned).length > 0) out[key] = pruned;
            } else if (value !== frValue) {
                out[key] = value;
            }
        }
        return out;
    }
    return node === frNode ? undefined : node;
}

async function rest(pathname, init = {}) {
    const res = await fetch(`${URL_BASE}/rest/v1/${pathname}`, {
        ...init,
        // Les en-têtes d'API doivent être présents sur TOUS les appels
        // (y compris les GET) : sans `apikey`, PostgREST répond 401.
        headers: { ...HEADERS, ...(init.headers || {}) },
    });
    const body = await res.text();
    if (!res.ok) throw new Error(`${pathname} → ${res.status} ${body}`);
    // `Prefer: return=minimal` ⇒ corps vide sur les écritures : ne pas parser.
    return body ? JSON.parse(body) : null;
}

const pages = await rest('site_pages?select=slug,sections_data');
const bySlug = new Map(pages.map((p) => [p.slug, p.sections_data || {}]));

const existing = await rest(
    'site_translations?select=entity_id,payload&entity=eq.page&locale=eq.en'
);
const existingBySlug = new Map(existing.map((r) => [r.entity_id, r.payload || {}]));

let applied = 0;
for (const [slug, map] of Object.entries(TRANSLATIONS)) {
    const frSections = bySlug.get(slug);
    if (!frSections) {
        console.error(`❌ Page FR introuvable pour « ${slug} » — ignorée.`);
        process.exitCode = 2;
        continue;
    }

    const clone = JSON.parse(JSON.stringify(frSections));
    let count = 0;
    for (const [pathStr, value] of Object.entries(map)) {
        assignPath(clone, pathStr, value);
        count += 1;
    }
    const sectionsData = pruneUnchanged(clone, frSections);

    const payload = {
        ...(existingBySlug.get(slug) || {}),
        sections_data: {
            ...((existingBySlug.get(slug) || {}).sections_data || {}),
            ...sectionsData,
        },
    };

    console.log(
        `${DRY ? '[dry] ' : ''}page/${slug} — ${count} traduction(s), ${Object.keys(sectionsData).length} section(s)`
    );

    if (DRY) {
        applied += 1;
        continue;
    }

    await rest('site_translations?on_conflict=entity,entity_id,locale', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({
            entity: 'page',
            entity_id: slug,
            locale: 'en',
            payload,
            is_published: true,
        }),
    });
    applied += 1;
}

console.log(`\n${DRY ? 'DRY-RUN' : 'APPLIQUÉ'} — ${applied} page(s) EN complétée(s).\n`);
