'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { probeCampusPlacements3D, upsertCampusPlacements3D } from '@/app/(admin)/admin/actions';
import { writeLocalPlacements } from './placement-storage';
import type {
    CampusSaveBackend,
    CampusSaveStatus,
    EditableFacilityItem,
} from '../types/campus3d.types';

/** Délai d'écriture différée de la persistance (moyenne les saisies continues). */
const SAVE_DEBOUNCE_MS = 400;

/** Délai avant la reprise unique d'une écriture en échec. */
const RETRY_DELAY_MS = 2500;

export interface UsePlacementPersistArgs {
    persistToDatabase: boolean;
    saveBackend: CampusSaveBackend;
    /** Source de vérité des placements (enregistrement immédiat et vidage). */
    facilitiesRef: React.MutableRefObject<Record<string, EditableFacilityItem>>;
}

/**
 * Persistance des placements 3D : Supabase (`site_settings`
 * key='campus_placements_3d') en mode Cockpit, `localStorage` en mode public.
 *
 * Écriture différée avec **une seule** reprise en cas d'échec, vidage de
 * l'écriture en attente à la fermeture d'onglet ou au démontage (le dernier
 * déplacement ne doit jamais être perdu), diagnostic des échecs par sonde de
 * lecture sur le même chemin serveur, et contrôle préalable de la clé de
 * service dès l'ouverture du studio.
 */
export function usePlacementPersist({
    persistToDatabase,
    saveBackend,
    facilitiesRef,
}: UsePlacementPersistArgs) {
    const [saveStatus, setSaveStatus] = useState<CampusSaveStatus>({
        state: 'idle',
        backend: saveBackend,
    });
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    /** Dernier état non encore écrit : sert au vidage différé et à la reprise. */
    const pendingPayloadRef = useRef<Record<string, EditableFacilityItem> | null>(null);

    /**
     * Enrichit un échec d'écriture par une **sonde de lecture** exécutée sur le
     * même chemin serveur. Trois causes se ressemblent depuis le navigateur et
     * exigent des corrections opposées :
     *  - l'action serveur n'est pas joignable (protocole d'action) ;
     *  - la lecture fonctionne mais l'écriture est refusée (droits, contrainte) ;
     *  - les deux échouent (schéma, réseau, configuration).
     */
    const diagnosePersistFailure = useCallback(async (message: string): Promise<string> => {
        try {
            const probe = await probeCampusPlacements3D();

            if (probe && 'success' in probe && probe.success) {
                if (probe.serviceRoleConfigured === false) {
                    return `${message} — sonde : lecture OK (${probe.count} installation(s) en base) mais SUPABASE_SERVICE_ROLE_KEY est absente côté serveur. L'écriture retombe sur la clé publique, refusée par RLS. Si tu viens de la renseigner : redémarre le serveur (npm run dev) ou redéploie (Vercel) — les variables ne sont lues qu'au démarrage.`;
                }
                if (probe.serviceKeyUsable === false) {
                    const nature =
                        probe.serviceRoleFamily === 'publishable' || probe.serviceRoleFamily === 'jwt-anon'
                            ? 'une clé publique'
                            : 'une clé de format non reconnu';
                    return `${message} — sonde : SUPABASE_SERVICE_ROLE_KEY contient ${nature} (famille « ${probe.serviceRoleFamily} »), qui ne peut pas écrire. Dans Supabase → Project Settings → API keys, copier la clé secrète (service_role ou sb_secret_…), pas la clé publique (anon ou sb_publishable_…).`;
                }
                if (probe.serviceRoleHasWhitespace) {
                    return `${message} — sonde : la clé de service est entourée d'espaces ou de guillemets. Supprime-les dans la variable d'environnement puis redémarre ou redéploie.`;
                }
                return `${message} — sonde : lecture OK (${probe.count} installation(s) en base), clé de service valide : la lecture passe et l'écriture est refusée (droits ou contrainte sur site_settings).`;
            }

            if (probe && 'error' in probe && probe.error) {
                return `${message} — sonde : lecture également en échec (${probe.error}), donc la cause est côté Supabase, pas côté studio.`;
            }
            return message;
        } catch {
            return `${message} — sonde : injoignable depuis ce navigateur, donc l'appel d'action serveur lui-même ne passe pas (vérifier que le déploiement est à jour et que l'onglet n'est pas resté sur un ancien bundle).`;
        }
    }, []);

    /**
     * Une tentative d'écriture : Supabase en mode Cockpit, `localStorage` en mode
     * public. Le retour de l'action serveur est **contrôlé** — une erreur
     * silencieuse est indiscernable d'un succès. Retourne `true` en cas de
     * succès, `false` sinon (l'erreur réelle est publiée dans l'état affiché).
     */
    const attemptPersist = useCallback(
        async (payload: Record<string, EditableFacilityItem>): Promise<boolean> => {
            if (!persistToDatabase) {
                if (writeLocalPlacements(payload)) {
                    pendingPayloadRef.current = null;
                    setSaveStatus({ state: 'saved', backend: saveBackend, savedAt: Date.now() });
                    return true;
                }
                setSaveStatus({
                    state: 'error',
                    backend: saveBackend,
                    error: 'Stockage local indisponible (navigation privée ou quota atteint).',
                });
                return false;
            }

            try {
                const result = await upsertCampusPlacements3D(payload);
                if (result && 'success' in result && result.success === false) {
                    const diagnosed = await diagnosePersistFailure(
                        result.error ?? 'Erreur inconnue côté Supabase'
                    );
                    throw new Error(diagnosed);
                }

                const warning =
                    result && 'warning' in result && typeof result.warning === 'string'
                        ? result.warning
                        : undefined;

                pendingPayloadRef.current = null;
                setSaveStatus({ state: 'saved', backend: saveBackend, savedAt: Date.now(), warning });
                return true;
            } catch (err: unknown) {
                const raw = err instanceof Error ? err.message : 'Erreur inconnue';
                const message = raw.includes('— sonde') ? raw : await diagnosePersistFailure(raw);
                console.error('[CampusPlan3D] Enregistrement des placements impossible :', message);
                setSaveStatus({ state: 'error', backend: saveBackend, error: message });
                return false;
            }
        },
        [persistToDatabase, saveBackend, diagnosePersistFailure]
    );

    /** Écriture avec **une seule** reprise, pour un incident réseau ponctuel. */
    const persistNow = useCallback(
        async (payload: Record<string, EditableFacilityItem>) => {
            setSaveStatus({ state: 'saving', backend: saveBackend });

            const succeeded = await attemptPersist(payload);
            if (succeeded) return;

            if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = setTimeout(() => {
                retryTimeoutRef.current = null;
                const pending = pendingPayloadRef.current;
                if (pending) void attemptPersist(pending);
            }, RETRY_DELAY_MS);
        },
        [attemptPersist, saveBackend]
    );

    /** Écriture différée : absorbe les saisies et glissers successifs. */
    const schedulePersist = useCallback(
        (next: Record<string, EditableFacilityItem>) => {
            pendingPayloadRef.current = next;
            setSaveStatus((prev) =>
                prev.state === 'error' ? prev : { state: 'saving', backend: saveBackend }
            );

            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = setTimeout(() => {
                saveTimeoutRef.current = null;
                void persistNow(next);
            }, SAVE_DEBOUNCE_MS);
        },
        [persistNow, saveBackend]
    );

    /** Enregistre immédiatement l'état courant (bouton du studio). */
    const saveNow = useCallback(() => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
        }
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }
        void persistNow(facilitiesRef.current);
    }, [persistNow, facilitiesRef]);

    /**
     * Pousse une écriture en attente avant de disparaître : le démontage
     * (changement d'onglet du Cockpit) et la fermeture de l'onglet annulaient
     * auparavant l'écriture différée — le dernier déplacement était perdu.
     */
    const flushPendingSave = useCallback(() => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
        }
        const pending = pendingPayloadRef.current;
        if (pending) void persistNow(pending);
    }, [persistNow]);

    useEffect(() => {
        const onPageHide = () => flushPendingSave();
        window.addEventListener('pagehide', onPageHide);
        return () => {
            window.removeEventListener('pagehide', onPageHide);
            // Démontage : la dernière modification doit partir, pas être jetée.
            flushPendingSave();
        };
    }, [flushPendingSave]);

    /**
     * Contrôle préalable de la configuration serveur (Cockpit uniquement).
     *
     * Sans `SUPABASE_SERVICE_ROLE_KEY`, les écritures sont refusées par RLS —
     * mais seulement **après** le geste. Mieux vaut l'annoncer dès l'ouverture
     * du studio que laisser l'opérateur découvrir le problème en perdant son
     * travail.
     */
    useEffect(() => {
        if (!persistToDatabase) return;
        let cancelled = false;

        probeCampusPlacements3D()
            .then((probe) => {
                if (cancelled || !probe) return;
                if ('serviceRoleConfigured' in probe && probe.serviceRoleConfigured === false) {
                    setSaveStatus({
                        state: 'error',
                        backend: saveBackend,
                        error:
                            'SUPABASE_SERVICE_ROLE_KEY absente sur ce serveur : les lectures passent, mais toute écriture sera refusée par les politiques RLS (code 42501). Renseigner la clé de service dans l\'environnement (Vercel → Settings → Environment Variables) puis redéployer.',
                    });
                }
            })
            .catch(() => {
                // Silencieux : le diagnostic d'échec d'écriture prendra le relais.
            });

        return () => {
            cancelled = true;
        };
    }, [persistToDatabase, saveBackend]);

    return { saveStatus, schedulePersist, saveNow, flushPendingSave };
}
