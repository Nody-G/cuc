/**
 * VÉRIFICATION DES ENDPOINTS VITRINE (navigation / footer / social links)
 * ======================================================================
 *
 * Reproduit exactement les requêtes PostgREST que `useNavigation()`,
 * `useFooter()` et `useSocialLinks()` émettent côté navigateur, et qui
 * renvoyaient 404 en production avant la migration.
 *
 * Usage : node scripts/verify_navigation_footer_endpoints.mjs
 */
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!ANON_KEY) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY manquant dans .env.local');
    process.exit(1);
}

const CHECKS = [
    {
        label: 'site_navigation (id=main)',
        path: '/rest/v1/site_navigation?select=structure,is_published&id=eq.main',
    },
    {
        label: 'site_footer (id=main)',
        path: '/rest/v1/site_footer?select=structure,is_published&id=eq.main',
    },
    {
        label: 'site_social_links (actifs)',
        path: '/rest/v1/site_social_links?select=*&is_active=eq.true&order=order_index.asc',
    },
];

async function main() {
    console.log(`=== Vérification des endpoints vitrine — ${SUPABASE_URL}\n`);

    let failures = 0;

    for (const check of CHECKS) {
        const res = await fetch(`${SUPABASE_URL}${check.path}`, {
            headers: {
                apikey: ANON_KEY,
                Authorization: `Bearer ${ANON_KEY}`,
            },
        });

        let payload = null;
        try {
            payload = await res.json();
        } catch {
            payload = null;
        }

        const count = Array.isArray(payload) ? payload.length : 0;
        const ok = res.ok && count > 0;

        if (!ok) failures += 1;

        console.log(
            `${ok ? '✅' : '❌'} ${check.label.padEnd(34)} HTTP ${res.status} — ${count} ligne(s)`
        );

        if (!res.ok) {
            console.log(`     ↳ ${JSON.stringify(payload)}`);
        }
    }

    console.log('');
    if (failures > 0) {
        console.error(`❌ ${failures} endpoint(s) en échec.`);
        process.exit(1);
    }
    console.log('✅ Les 3 endpoints répondent avec des données. La vitrine est alimentée.');
}

main().catch((err) => {
    console.error('❌ Erreur :', err.message);
    process.exit(1);
});
