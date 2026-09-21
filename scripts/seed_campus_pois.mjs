/**
 * SEED : table public.site_campus_pois
 * ====================================
 *
 * Contexte (preuve) : `node scripts/verify_interconnections.mjs` a montré
 *   site_campus_pois.location_id ↔ locations.id : 0/0
 * car la table `site_campus_pois` existe mais est VIDE (0 ligne). Conséquence :
 * [`getCampusPOIs()`](src/lib/data/site-service.ts:1733) retombait systématiquement
 * sur la constante statique `CAMPUS_POIS`, et la carte du campus n'était donc PAS
 * pilotée par la base — violation de la doctrine « Zéro Valeur Orpheline » et de
 * l'« Interconnexion Bidirectionnelle Maximale » (AGENTS.md).
 *
 * Ce script amorce les 5 POI canoniques de `CAMPUS_POIS` dans la table, en
 * conservant leur `location_id` (clé étrangère vers `locations.id`, CUC Sign).
 * Il est IDEMPOTENT : `upsert` sur la clé primaire `id`.
 *
 * Usage :
 *   node scripts/seed_campus_pois.mjs --dry-run
 *   node scripts/seed_campus_pois.mjs
 */
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DRY_RUN = process.argv.includes('--dry-run');

if (!SERVICE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
});

/**
 * Source de vérité : `src/components/ui/campus-map/campusMap.data.ts` → CAMPUS_POIS.
 * Chaque entrée porte déjà son `location_id` (UUID réel de `locations`).
 * `coords` est reconstruit depuis `xPercent`/`yPercent` (format JSONB attendu).
 */
const POIS = [
    {
        id: 'tower-21m',
        location_id: '732aad62-6c56-4329-85da-debb88be9fad', // Tour Jérome Gaspard
        name: 'Tour de Saut 21m',
        type: 'outdoor',
        category: 'Hauteur & Chutes Libres',
        coords: { x: 52, y: 32 },
        level: 'INAUGURÉE OCT. 2024',
        surface: '21m',
        capacity: null,
        equipment: ['Poutre de largage', 'Matelas d\'air géant'],
        features: ['Paliers 5/8/12/16/21m', 'Certifiée APAVE'],
        disciplines: [],
        coaches: [],
        description:
            "Inaugurée fin 2024, c'est la plus haute tour de saut d'entraînement d'Europe. Paliers à 5m, 8m, 12m, 16m et 21m pour sauts sur matelas d'air géant.",
        order_index: 1,
        is_active: true,
    },
    {
        id: 'grand-dojo',
        location_id: '0fc475db-34ae-47ce-95f2-b20b402c2859', // Dojo Malik
        name: 'Grand Dojo & Tatamis 600m²',
        type: 'indoor',
        category: 'Combat & Arts Martiaux',
        coords: { x: 35, y: 58 },
        level: 'ESPACE CHORÉGRAPHIE',
        surface: '600m²',
        capacity: null,
        equipment: ['Sacs de frappe', 'Mur de brique mobile', 'Ring'],
        features: ['Tatamis', 'Sol amortissant'],
        disciplines: [],
        coaches: [],
        description:
            'Espace couvert dédié aux chorégraphies martiales, combats cinématographiques, projections et acrobaties au sol avec sol amortissant.',
        order_index: 2,
        is_active: true,
    },
    {
        id: 'airbag-zone',
        location_id: '732aad62-6c56-4329-85da-debb88be9fad', // Tour Jérome Gaspard
        name: 'Fosse de Chute & Airbag Géant',
        type: 'outdoor',
        category: 'Sécurité Impact',
        coords: { x: 68, y: 44 },
        level: 'ZONE IMPACT',
        surface: '15x15m',
        capacity: null,
        equipment: ['Airbag gonflable 15x15m', 'Tapis de chute 60cm', 'Fosse à cubes'],
        features: ['Réception sécurisée'],
        disciplines: [],
        coaches: [],
        description:
            'Zone extérieure de réception sécurisée pour chutes de hauteur, cascades en torche humaine et éjections de véhicules.',
        order_index: 3,
        is_active: true,
    },
    {
        id: 'rigging-cables',
        location_id: 'a195f7db-e934-4605-befa-df47b35c2049', // Salle Zoé Bell
        name: 'Structure Câblage 3D & Rigging',
        type: 'indoor',
        category: 'Effets Spéciaux Câbles',
        coords: { x: 72, y: 65 },
        level: 'RIGGING 3D',
        surface: null,
        capacity: null,
        equipment: ['Treuils motorisés', 'Harnais Jerk vest', 'Lignes de vol 35m'],
        features: ['Portiques de vol'],
        disciplines: [],
        coaches: [],
        description:
            'Portiques et treuils de vol à haute vitesse pour simuler les propulsions explosives, les envolées et les cascades câblées en studio.',
        order_index: 4,
        is_active: true,
    },
    {
        id: 'mfr-residence',
        location_id: '85190227-31ee-4ee8-945a-5dbd22ad38f0', // Amphithéâtre
        name: 'Résidence Stagiaires & Réfectoire',
        type: 'indoor',
        category: 'Hébergement & Logistique',
        coords: { x: 25, y: 78 },
        level: 'PENSION COMPLÈTE',
        surface: '6 ha',
        capacity: 60,
        equipment: ['Cuisine pro', 'Foyer stagiaires'],
        features: ['Parc arboré 6 hectares', 'Salles de debriefing vidéo'],
        disciplines: [],
        coaches: [],
        description:
            'Chambres collectives, internat, réfectoire pour la pension complète et salles de debriefing vidéo sur le parc arboré de 6 hectares.',
        order_index: 5,
        is_active: true,
    },
];

async function main() {
    console.log('🌱 Seed de la table site_campus_pois\n');
    console.log(`   Projet Supabase : ${new URL(SUPABASE_URL).hostname.split('.')[0]}`);
    console.log(`   POI à insérer   : ${POIS.length}\n`);

    // 1. Vérifier l'état actuel.
    const { data: existing, error: readError } = await supabase
        .from('site_campus_pois')
        .select('id');

    if (readError) {
        console.error(`❌ Lecture site_campus_pois impossible : ${readError.message}`);
        process.exit(2);
    }
    console.log(`   Lignes existantes : ${existing?.length ?? 0}`);

    // 2. Vérifier que chaque location_id existe bien dans `locations`.
    const locationIds = [...new Set(POIS.map((p) => p.location_id).filter(Boolean))];
    const { data: locations, error: locError } = await supabase
        .from('locations')
        .select('id, name')
        .in('id', locationIds);

    if (locError) {
        console.error(`❌ Lecture locations impossible : ${locError.message}`);
        process.exit(2);
    }

    const knownLocations = new Map((locations || []).map((l) => [l.id, l.name]));
    let orphanCount = 0;
    for (const poi of POIS) {
        if (poi.location_id && !knownLocations.has(poi.location_id)) {
            console.warn(`   ⚠️  ${poi.id} → location_id ${poi.location_id} INTROUVABLE`);
            orphanCount++;
        }
    }
    if (orphanCount > 0) {
        console.error(`\n❌ ${orphanCount} location_id orphelin(s) — seed annulé.`);
        process.exit(2);
    }
    console.log(`   ✅ ${locationIds.length}/${locationIds.length} location_id résolus dans \`locations\`\n`);

    if (DRY_RUN) {
        console.log('🔎 Mode --dry-run : aucune écriture. Lignes qui seraient upsertées :\n');
        for (const poi of POIS) {
            console.log(`   • ${poi.id} — ${poi.name} → ${knownLocations.get(poi.location_id)}`);
        }
        return;
    }

    // 3. Upsert idempotent.
    const { error: upsertError } = await supabase
        .from('site_campus_pois')
        .upsert(POIS, { onConflict: 'id' });

    if (upsertError) {
        console.error(`\n❌ Échec de l'upsert : ${upsertError.message}`);
        process.exit(2);
    }

    // 4. Vérification post-écriture.
    const { data: after } = await supabase
        .from('site_campus_pois')
        .select('id, location_id, is_active');

    const linked = (after || []).filter((p) => p.location_id).length;
    console.log(`✅ Seed terminé : ${after?.length ?? 0} POI en base, ${linked} avec location_id lié.`);
}

main();
