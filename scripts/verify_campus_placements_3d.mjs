/**
 * Diagnostic de la persistance des placements 3D du campus.
 *
 * Objectif : répondre par des faits, et non par supposition, à la question
 * « pourquoi mes déplacements de bâtiments ne sont-ils pas sauvegardés ? ».
 *
 *   node scripts/verify_campus_placements_3d.mjs
 *
 * Le script est strictement **non destructif** : l'écriture de contrôle
 * réécrit la valeur déjà présente, à l'identique.
 *
 * Ce qu'il vérifie :
 *  1. présence des variables d'environnement Supabase (URL + clé de service) ;
 *  2. lecture de `site_settings` clé `campus_placements_3d` ;
 *  3. forme de la valeur stockée (`value.placements`) et liste des
 *     installations, comparée aux identifiants attendus du plan ;
 *  4. écriture de contrôle (upsert de la valeur inchangée) — c'est le chemin
 *     exactement utilisé par le studio du Cockpit.
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const SETTINGS_KEY = 'campus_placements_3d';

/** Identifiants attendus du plan (voir `realFacilities.ts`). */
const EXPECTED_IDS = [
    'cuc-tower',
    'zoe-bell-hall',
    'manege-equestre',
    'hangar-wirework',
    'dojos-sceniques',
    'espace-mecanique',
    'qg-staff-hebergement',
    'site-tournage',
    'city-stade-exterieur',
];

const TRANSFORM_KEYS = ['x', 'z', 'rotationY', 'scaleX', 'scaleY', 'scaleZ'];
const LEGACY_KEYS = ['scale', 'heightScale'];

function report(status, message) {
    const icon = status === 'ok' ? 'OK   ' : status === 'warn' ? 'WARN ' : 'ECHEC';
    console.log(`${icon} ${message}`);
}

/**
 * Famille d'une clé Supabase, sans exposer le jeton.
 *
 * Deux générations coexistent et les confondre mène à un faux diagnostic :
 *  - JWT historiques `eyJ…` → rôle dans la revendication `role` ;
 *  - clés récentes `sb_secret_…` (secrète) et `sb_publishable_…` (publique),
 *    qui ne sont pas des JWT.
 *
 * Une clé publique collée dans la variable de service produit exactement le
 * même échec RLS que l'absence de clé : d'où cette distinction.
 */
function readKeyFamily(token) {
    if (!token) return 'absente';
    const normalized = token.trim().replace(/^["']|["']$/g, '');
    if (normalized.startsWith('sb_secret_')) return 'secret (récente)';
    if (normalized.startsWith('sb_publishable_')) return 'publishable (publique)';

    const parts = normalized.split('.');
    if (parts.length === 3) {
        try {
            const role = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')).role;
            if (role === 'service_role') return 'jwt service_role';
            if (role === 'anon') return 'jwt anon (publique)';
            return `jwt role=${role ?? 'inconnu'}`;
        } catch {
            return 'jwt illisible';
        }
    }
    return 'format inconnu';
}

/** Une clé de service est-elle réellement capable d'écrire ? */
function canWriteFile(family) {
    return family === 'secret (récente)' || family === 'jwt service_role';
}

async function main() {
    console.log('=== Diagnostic persistance — site_settings/campus_placements_3d ===\n');

    report(supabaseUrl ? 'ok' : 'fail', `NEXT_PUBLIC_SUPABASE_URL : ${supabaseUrl || '(absente)'}`);
    report(anonKey ? 'ok' : 'warn', `NEXT_PUBLIC_SUPABASE_ANON_KEY : ${anonKey ? 'présente' : '(absente)'}`);
    const serviceFamily = readKeyFamily(serviceKey);
    report(
        serviceKey ? 'ok' : 'fail',
        `SUPABASE_SERVICE_ROLE_KEY : ${serviceKey ? 'présente' : '(absente)'} — famille « ${serviceFamily} »`
    );
    if (serviceKey && !canWriteFile(serviceFamily)) {
        report(
            'fail',
            `Cette clé ne peut PAS écrire : famille « ${serviceFamily} ». ` +
            'Dans Supabase → Project Settings → API keys, copier la clé secrète (service_role ou sb_secret_…), ' +
            'jamais la clé publique (anon ou sb_publishable_…).'
        );
    }
    if (serviceKey && serviceKey !== serviceKey.trim()) {
        report('warn', 'La clé de service est entourée d’espaces ou de guillemets : à supprimer.');
    }

    if (!supabaseUrl || !serviceKey) {
        console.log(
            '\nSans URL ni clé de service, il est impossible de lire ou d\'écrire site_settings.\n' +
            'C\'est déjà une cause suffisante pour que le studio ne sauvegarde rien :\n' +
            'les écritures échouent côté serveur (elles étaient auparavant avalées en silence).'
        );
        process.exit(1);
    }

    const admin = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });

    // --- 2. Lecture de la ligne ---
    const { data: row, error: readError } = await admin
        .from('site_settings')
        .select('key, value, updated_at')
        .eq('key', SETTINGS_KEY)
        .maybeSingle();

    if (readError) {
        report('fail', `Lecture impossible : ${readError.message}`);
        process.exit(1);
    }

    if (!row) {
        report(
            'warn',
            `Aucune ligne « ${SETTINGS_KEY} » en base : le plan affiche donc les positions par défaut. ` +
            'La première modification dans le studio doit créer cette ligne.'
        );
    } else {
        report('ok', `Ligne trouvée (updated_at = ${row.updated_at ?? 'inconnu'})`);
    }

    const placements = row?.value?.placements;
    const ids = placements && typeof placements === 'object' ? Object.keys(placements) : [];
    report(ids.length > 0 ? 'ok' : 'warn', `Installations enregistrées : ${ids.length}`);

    if (ids.length > 0) {
        const missing = EXPECTED_IDS.filter((id) => !ids.includes(id));
        if (missing.length > 0) {
            report(
                'warn',
                `Installations absentes de l'enregistrement : ${missing.join(', ')} ` +
                '(elles retomberont sur les positions par défaut au chargement).'
            );
        }

        const sampleId = ids[0];
        const sample = placements[sampleId] ?? {};
        const presentTransform = TRANSFORM_KEYS.filter((k) => k in sample);
        const presentLegacy = LEGACY_KEYS.filter((k) => k in sample);

        report(
            presentTransform.length > 0 ? 'ok' : 'warn',
            `Forme d'une entrée (${sampleId}) : ${Object.keys(sample).join(', ') || '(vide)'}`
        );
        if (presentLegacy.length > 0 && presentTransform.length === 0) {
            report(
                'warn',
                'Enregistrement au format v1 (scale/heightScale) : il sera migré au chargement, ' +
                'puis réécrit au format v3 (scaleX/scaleY/scaleZ) à la première modification.'
            );
        }
    }

    // --- 3. Écriture de contrôle, non destructive ---
    const payload = { placements: placements ?? {} };
    const { error: writeError } = await admin
        .from('site_settings')
        .upsert({ key: SETTINGS_KEY, value: payload, updated_at: new Date().toISOString() });

    if (writeError) {
        report('fail', `Écriture refusée : ${writeError.message}`);
        console.log(
            '\nCause identifiée : le studio ne peut pas enregistrer. ' +
            'Vérifier les droits de la clé de service et l\'existence de la contrainte unique sur site_settings.key.'
        );
        process.exit(1);
    }

    report('ok', 'Écriture de contrôle réussie (valeur réécrite à l\'identique)');

    // --- 4. Contrôle du repli sur clé publique ---
    //
    // `createAdminClient()` retombe sur la clé publique quand
    // SUPABASE_SERVICE_ROLE_KEY est absente. Les politiques RLS laissent alors
    // passer les lectures mais refusent les écritures : le studio affiche un
    // échec alors que la lecture du plan fonctionne. Ce test reproduit ce
    // scénario. Il réécrit la valeur **à l'identique** : aucune donnée n'est
    // modifiée, seul `updated_at` peut l'être.
    if (anonKey) {
        console.log('\n--- Contrôle du repli sur clé publique (scénario sans clé de service) ---');
        const anon = createClient(supabaseUrl, anonKey, {
            auth: { persistSession: false, autoRefreshToken: false },
        });

        const { error: anonWriteError } = await anon
            .from('site_settings')
            .upsert({ key: SETTINGS_KEY, value: payload, updated_at: new Date().toISOString() });

        if (anonWriteError) {
            report(
                'warn',
                `Écriture avec la clé publique REFUSÉE : ${anonWriteError.message}` +
                (anonWriteError.code ? ` (code ${anonWriteError.code})` : '')
            );
            console.log(
                'Ce refus est attendu et pédagogique : tout environnement dont la clé de service est\n' +
                'absente écrira ainsi — lecture OK, écriture refusée. Le studio affichera donc\n' +
                '« Échec de l\'enregistrement » avec la mention « clé de service absente ».'
            );
        } else {
            report(
                'warn',
                'Écriture avec la clé publique ACCEPTÉE : les politiques RLS de site_settings autorisent l\'écriture anonyme. À restreindre.'
            );
        }
    }

    // --- 5. Lecture publique : ce que verra réellement le site vitrine ---
    //
    // Le plan public lit désormais `site_settings` avec la clé publique. Sans
    // politique de lecture publique, le Cockpit enregistrerait correctement
    // tandis que la vitrine continuerait d'afficher les positions par défaut.
    if (anonKey) {
        console.log('\n--- Lecture publique (ce que verra le site vitrine) ---');
        const anonReader = createClient(supabaseUrl, anonKey, {
            auth: { persistSession: false, autoRefreshToken: false },
        });

        const { data: anonRead, error: anonReadError } = await anonReader
            .from('site_settings')
            .select('value, updated_at')
            .eq('key', SETTINGS_KEY)
            .maybeSingle();

        if (anonReadError) {
            report(
                'fail',
                `Lecture publique REFUSÉE : ${anonReadError.message}` +
                (anonReadError.code ? ` (code ${anonReadError.code})` : '')
            );
            console.log(
                'Conséquence : le site vitrine ne peut pas lire les placements enregistrés\n' +
                'et affichera les positions par défaut. Ajouter une politique RLS de lecture\n' +
                'publique (SELECT) sur site_settings, ou lire cette clé côté serveur.'
            );
        } else {
            const anonPlacements = anonRead?.value?.placements;
            const anonCount =
                anonPlacements && typeof anonPlacements === 'object'
                    ? Object.keys(anonPlacements).length
                    : 0;
            report(
                anonCount > 0 ? 'ok' : 'warn',
                `Lecture publique OK — ${anonCount} installation(s) visibles côté vitrine` +
                (anonRead?.updated_at ? ` (modifié le ${anonRead.updated_at})` : '')
            );
        }
    }

    console.log('\nConclusion : le chemin d\'écriture Supabase fonctionne depuis cet environnement.');
    console.log('Si le studio ne sauvegarde toujours rien, l\'état affiché dans sa barre d\'outils');
    console.log('donne désormais le message d\'erreur exact remonté par l\'action serveur.');
}

main().catch((err) => {
    console.error('Erreur inattendue :', err);
    process.exit(1);
});
