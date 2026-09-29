/**
 * Renouvellement du jeton Instagram stocké — service serveur.
 *
 * Couche « Domaine & Services » (`AGENTS.md` § 1). Extrait de
 * `actions/instagram-monitor.ts`, qui dépassait le plafond dur de 300 lignes
 * (`AGENTS.md` § 2) — l'extraction a aussi une justification propre : la décision
 * « faut-il renouveler, et que faire si Meta refuse » n'a rien à voir avec la
 * lecture d'une configuration.
 *
 * Le jeton long-lived est prolongé de 60 jours ; on le renouvelle dès qu'il a plus
 * de 20 jours (constante du service `instagram-token-refresh`). **Un refus de Meta
 * est désormais tracé** : auparavant, un renouvellement manqué était totalement
 * silencieux, puis le jeton expirait et les mesures en direct s'arrêtaient d'un
 * coup, sans que rien n'explique pourquoi.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { isTokenRefreshDue, refreshInstagramToken } from './instagram-token-refresh';
import { writeActivityLog } from '@/lib/logging/write';
import type { InstagramMetaApiConfig } from '@/types/instagram-monitor';

/** Clé de `site_settings` où vit la configuration Meta. */
const SETTINGS_KEY = 'instagram_meta_config';

/**
 * Rend le jeton à utiliser, en le renouvelant si nécessaire.
 *
 * @param adminClient client à clé de service : l'écriture dans `site_settings`
 *   échouerait avec les politiques RLS d'une session utilisateur.
 * @param saved configuration enregistrée.
 * @param updatedAt date de dernière modification de la configuration, qui sert
 *   d'horloge au renouvellement (le jeton est prolongé à chaque écriture).
 * @returns le jeton actif — le nouveau s'il a été renouvelé, l'ancien sinon.
 */
export async function resolveRefreshedInstagramToken(
    adminClient: SupabaseClient,
    saved: InstagramMetaApiConfig,
    updatedAt: string | null | undefined,
): Promise<string> {
    const current = saved.accessToken || '';

    if (!current.startsWith('IG') || !isTokenRefreshDue(updatedAt ?? undefined)) {
        return current;
    }

    const result = await refreshInstagramToken(current);

    if (result.success && result.accessToken) {
        await adminClient
            .from('site_settings')
            .update({
                value: { ...saved, accessToken: result.accessToken },
                updated_at: new Date().toISOString(),
            })
            .eq('key', SETTINGS_KEY);
        return result.accessToken;
    }

    void writeActivityLog({
        level: 'warning',
        source: 'instagram',
        category: 'instagram.token_refresh_failed',
        message:
            'Renouvellement du jeton Instagram refusé — le jeton expirera à la date prévue si cela se répète.',
        target: SETTINGS_KEY,
        context: { refreshError: result.error ?? 'cause inconnue' },
        origin: 'resolveRefreshedInstagramToken',
    });

    return current;
}
