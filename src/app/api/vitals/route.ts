import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizeVitalsBatch } from '@/lib/perf/vitals-validation';

/**
 * ==============================================================================
 * CUC — Réception des mesures de performance vécue (vitrine publique)
 * ==============================================================================
 * Seul point d'écriture du chemin public, et il est **borné par construction** :
 * une requête = un petit tableau de mesures validées, une insertion, aucune
 * lecture. Le serveur **recalcule la note** et **rejette** toute entrée douteuse
 * (`normalizeVitalsBatch`) : un endpoint ouvert ne doit ni remplir une table ni
 * produire des chiffres faux.
 *
 * Réponses : `204` accepté, `400` charge utile invalide, `413` trop volumineuse,
 * `202` accepté mais non stocké (base indisponible) — jamais une erreur qui
 * remonterait au visiteur, qui n'attend rien de cet envoi.
 */

/**
 * Aucune configuration de cache n'est nécessaire : les Route Handlers ne sont
 * jamais mis en cache par défaut, et **un `POST` n'est jamais mis en cache**
 * (doc Next 16, `01-getting-started/15-route-handlers.md` § Caching). La mention
 * `dynamic = 'force-dynamic'` est en revanche **interdite** avec
 * `cacheComponents` : le build la refuse, ce qui est préférable à une intention
 * silencieusement ignorée.
 */

/** Taille maximale acceptée avant même de lire le corps. */
const MAX_BODY_BYTES = 4096;

export async function POST(request: NextRequest) {
    try {
        const declaredLength = Number(request.headers.get('content-length') ?? '0');
        if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
            return new NextResponse(null, { status: 413 });
        }

        const payload = await request.json();
        const samples = normalizeVitalsBatch(payload);
        if (!samples) return new NextResponse(null, { status: 400 });

        const client = createAdminClient();
        const { error } = await client.from('site_vitals').insert(samples);

        if (error) {
            console.warn(`[/api/vitals] Mesures non stockées : ${error.message}`);
            return new NextResponse(null, { status: 202 });
        }

        return new NextResponse(null, { status: 204 });
    } catch {
        return new NextResponse(null, { status: 400 });
    }
}
