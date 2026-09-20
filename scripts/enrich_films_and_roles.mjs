/**
 * Enrichissement des fiches films (site_films) + normalisation des rôles coachs.
 *
 * DOCTRINE « ZÉRO INVENTION » :
 *  - Les descriptions sont COMPOSÉES uniquement à partir de données déjà
 *    vérifiées et présentes en base (titre, année, réalisateur, cascadeurs,
 *    équipe CUC engagée). Aucun fait nouveau n'est inventé.
 *  - Les rôles coachs sont ramenés à 5 libellés canoniques lisibles :
 *    Coordinateur des cascades · Doublure de X · Cascadeur · Parkour · Câblage.
 *    Le libellé détaillé d'origine est conservé dans metadata.cuc_team_roles_detail.
 *
 * Usage :
 *   node scripts/enrich_films_and_roles.mjs            → dry-run (aperçu)
 *   node scripts/enrich_films_and_roles.mjs --write    → applique en base
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';

const WRITE = process.argv.includes('--write');

const env = fs.readFileSync('.env.local', 'utf8');
const get = (k) => {
    const m = env.match(new RegExp(`^${k}=(.*)$`, 'm'));
    return m ? m[1].trim().replace(/^["']|["']$/g, '') : '';
};

const url = get('NEXT_PUBLIC_SUPABASE_URL') || get('SUPABASE_URL');
const key = get('SUPABASE_SECRET_KEY') || get('SUPABASE_SERVICE_ROLE_KEY');
const supabase = createClient(url, key, { auth: { persistSession: false } });

/* ------------------------------------------------------------------ */
/* Normalisation des rôles (miroir de src/lib/credit-role.ts)          */
/* ------------------------------------------------------------------ */

const CANONICAL_ORDER = [
    'Coordinateur des cascades',
    'Doublure',
    'Cascadeur',
    'Parkour',
    'Câblage',
];

const fold = (v) =>
    String(v || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

const STOP_WORDS = new Set([
    'combats', 'combat', 'cascades', 'cascade', 'action', 'physique',
    'rapproches', 'tactiques', 'scene', 'generale', 'partielle',
    'specialiste', 'escrime', 'arts', 'martiaux', 'chutes', 'impacts',
]);

function extractDoubledActors(role) {
    const raw = String(role || '');
    const matches = raw.matchAll(
        /doublure\s*(?:de\s+|d'|:)?\s*([A-ZÀ-Ý][\p{L}'-]+(?:\s+[A-ZÀ-Ý][\p{L}'-]+){0,3})/gu
    );
    const found = [];
    for (const m of matches) {
        const candidate = m[1].trim();
        if (!candidate) continue;
        if (STOP_WORDS.has(fold(candidate))) continue;
        if (!found.includes(candidate)) found.push(candidate);
    }
    return found;
}

function normalizeRole(role) {
    const detail = String(role || '').trim();
    const f = fold(detail);
    const roles = [];
    const has = (...n) => n.some((x) => f.includes(x));

    if (has('coordinat', 'regleur', 'supervis', 'action designer', 'chef cascade')) {
        roles.push('Coordinateur des cascades');
    }
    if (has('doublure', 'double lumiere', 'doubleur')) {
        roles.push('Doublure');
    }
    if (has('parkour', 'freerun', 'free run', 'yamakasi', 'franchissement')) {
        roles.push('Parkour');
    }
    if (has('cablage', 'cable', 'rigger', 'rigging', 'wire')) {
        roles.push('Câblage');
    }
    if (has('cascadeur', 'cascade', 'stunt', 'chute', 'combat', 'acrobat', 'choregraphe', 'escrime', 'arts martiaux')) {
        if (!roles.includes('Cascadeur')) roles.push('Cascadeur');
    }
    if (roles.length === 0 && f.length > 0) roles.push('Cascadeur');

    roles.sort((a, b) => CANONICAL_ORDER.indexOf(a) - CANONICAL_ORDER.indexOf(b));

    const doubledActors = extractDoubledActors(detail);
    const label = roles
        .map((r) => (r === 'Doublure' && doubledActors.length ? `Doublure de ${doubledActors.join(', ')}` : r))
        .join(' · ');

    return { roles, label, doubledActors, detail };
}

/* ------------------------------------------------------------------ */
/* Composition des descriptions (aucune invention)                     */
/* ------------------------------------------------------------------ */

/**
 * Assainit un texte selon la doctrine éditoriale :
 *  - « gun-fu » → « combats rapprochés »
 *  - « Art du Déplacement (ADD) » → « Parkour »
 *  - « ADD » → « Parkour »
 */
function sanitize(text) {
    return String(text || '')
        .replace(/gun-?fu/gi, 'combats rapprochés')
        .replace(/l['’]?Art du Déplacement\s*\(ADD\)/gi, 'Parkour')
        .replace(/Art du Déplacement/gi, 'Parkour')
        .replace(/\bADD\b/g, 'Parkour')
        // Évite les redondances créées par la substitution (« parkour et Parkour »)
        .replace(/parkour\s+et\s+(?:de\s+)?Parkour/gi, 'Parkour')
        .replace(/Parkour\s+et\s+(?:de\s+)?parkour/gi, 'Parkour')
        // Accord : « combats rapprochés cartoonesque » → « cartoonesques »
        .replace(/combats rapprochés cartoonesque/gi, 'combats rapprochés cartoonesques');
}

/** Nettoie une liste de rôles détaillés en une phrase de cascades factuelle. */
function stuntSentence(stuntRoles) {
    const raw = sanitize(stuntRoles).trim();
    if (!raw) return '';
    // On garde la formulation existante (déjà factuelle) en la ponctuant.
    const cleaned = raw.replace(/\s+/g, ' ').replace(/[.;,]\s*$/, '');
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1) + '.';
}

/**
 * Construit une description factuelle à partir des seuls champs vérifiés.
 * Structure : [Nature du film] réalisé(e) par X (année). [Cascades]. [Équipe CUC].
 */
function buildDescription(film, teamNames) {
    const parts = [];

    const isSeries = /Série/i.test(film.category || '');
    const kind = isSeries ? 'Série' : 'Film';
    const dir = film.director
        ? ` ${isSeries ? 'réalisée' : 'réalisé'} par ${film.director}`
        : '';
    const year = film.year ? ` (${film.year})` : '';
    parts.push(`${kind}${dir}${year}.`);

    const stunts = stuntSentence(film.stunt_roles);
    if (stunts) parts.push(stunts);

    if (teamNames.length > 0) {
        const list =
            teamNames.length === 1
                ? teamNames[0]
                : teamNames.slice(0, -1).join(', ') + ' et ' + teamNames[teamNames.length - 1];
        parts.push(
            `Interventions CUC sur ce tournage : ${list}.`
        );
    }

    return parts.join(' ').replace(/\s+/g, ' ').trim();
}

/* ------------------------------------------------------------------ */
/* Exécution                                                           */
/* ------------------------------------------------------------------ */

const { data: films, error } = await supabase
    .from('site_films')
    .select('*')
    .order('order_index', { ascending: true });

if (error) {
    console.error('ERREUR lecture site_films:', error.message);
    process.exit(1);
}

const { data: team } = await supabase.from('site_team').select('id, name');
const nameById = new Map((team || []).map((t) => [t.id, t.name]));

console.log(`Films à traiter : ${films.length}`);
console.log(`Mode : ${WRITE ? 'ÉCRITURE' : 'DRY-RUN (aperçu)'}\n`);

let updated = 0;
let rolesNormalized = 0;

for (const film of films) {
    const patch = {};

    // 1) Description — uniquement si absente (on n'écrase jamais un texte humain)
    const hasDesc = film.description && String(film.description).trim().length > 0;
    if (!hasDesc) {
        const teamNames = (film.cuc_team_involved || [])
            .map((id) => nameById.get(id))
            .filter(Boolean);
        const desc = buildDescription(film, teamNames);
        if (desc) patch.description = desc;
    }

    // 2) Rôles coachs normalisés
    const rawRoles = film.metadata?.cuc_team_roles || {};
    const rawKeys = Object.keys(rawRoles);
    if (rawKeys.length > 0) {
        const normalized = {};
        const detail = {};
        let changed = false;
        for (const [coachId, role] of Object.entries(rawRoles)) {
            const n = normalizeRole(role);
            normalized[coachId] = n.label;
            detail[coachId] = n.detail;
            if (n.label !== role) changed = true;
        }
        if (changed) {
            patch.metadata = {
                ...(film.metadata || {}),
                cuc_team_roles: normalized,
                cuc_team_roles_detail: detail,
            };
            rolesNormalized++;
        }
    }

    if (Object.keys(patch).length === 0) continue;

    console.log(`• ${film.title} (${film.year || '????'})`);
    if (patch.description) console.log(`    desc → ${patch.description}`);
    if (patch.metadata) {
        for (const [id, label] of Object.entries(patch.metadata.cuc_team_roles)) {
            const before = rawRoles[id];
            if (before !== label) {
                console.log(`    rôle ${nameById.get(id) || id} : "${before}" → "${label}"`);
            }
        }
    }

    if (WRITE) {
        const { error: upErr } = await supabase
            .from('site_films')
            .update(patch)
            .eq('id', film.id);
        if (upErr) {
            console.error(`    ✗ Échec : ${upErr.message}`);
            continue;
        }
    }
    updated++;
}

console.log(`\n${WRITE ? 'Mis à jour' : 'À mettre à jour'} : ${updated} fiches`);
console.log(`Rôles normalisés : ${rolesNormalized} fiches`);
if (!WRITE) console.log('\nRelancer avec --write pour appliquer.');
