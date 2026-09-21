'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    diffTranslation,
    hydrateLocalized,
    translationCoverage,
    type TranslationCoverage,
} from '@/lib/i18n/localized-merge';
import {
    deleteSiteTranslation,
    getSiteTranslation,
    upsertSiteTranslation,
} from '@/app/(admin)/admin/actions';

/**
 * ==============================================================================
 * Édition bilingue EN PLACE — état partagé du Cockpit
 * ==============================================================================
 * Un contenu éditorial existe en français (la source) et son anglais vit dans
 * `site_translations` sous forme d'**overlay partiel**. Ce hook fait le pont :
 *
 *   - `base` (contenu FR) n'est jamais modifié : aucun texte anglais ne peut
 *     écraser la source ;
 *   - `localized` est le contenu tel que le public le verra dans la locale
 *     traduite (FR fusionné avec l'overlay en cours d'édition) : le formulaire du
 *     Cockpit affiche donc le français tant qu'un champ n'est pas traduit ;
 *   - `coverage` mesure la traduction feuille par feuille ;
 *   - `save()` n'écrit **que le diff** : aucune valeur vide, tableaux complets,
 *     clés techniques et structure reprises du français.
 *
 * Le chargement est paresseux : rien n'est demandé tant que l'éditeur reste en
 * français. Il est volontairement générique (entité + identifiant) : les fiches
 * films, coachs, événements, POIs, programmes… pourront s'y brancher sans
 * nouvelle logique de fusion.
 */

/** Locale d'édition du Cockpit : le français est la source, l'anglais la cible. */
export type EditorLocale = 'fr' | 'en';

/**
 * Le contenu édité est un objet JSON métier (`SitePageContent`, `FilmCredit`…) :
 * la contrainte reste volontairement large (`object`), sinon une interface sans
 * index signature — le cas de tous les types du domaine — serait refusée.
 */
export interface UseEntityTranslationOptions<T extends object> {
    /** Entité de `site_translations` (`page`, `film`, `team`, …). */
    entity: string;
    /** Identifiant de l'entité (slug de page, id de fiche…). */
    entityId: string;
    /** Locale active dans l'interface d'édition. */
    locale: EditorLocale;
    /** Contenu source français : jamais modifié par ce hook. */
    base: T;
    /** Locale traduite visée. Défaut : `en`. */
    targetLocale?: string;
}

export interface UseEntityTranslationResult<T> {
    /** Contenu localisé édité (français + surcharges) pour la locale traduite. */
    localized: T;
    setLocalized: React.Dispatch<React.SetStateAction<T>>;
    /** Overlay qui serait écrit à l'instant présent. */
    payload: Record<string, unknown>;
    /** Mesure de couverture de la traduction en cours d'édition. */
    coverage: TranslationCoverage;
    /** Overlay réellement persisté (dernier enregistrement connu). */
    savedPayload: Record<string, unknown>;
    loading: boolean;
    /** Le brouillon affiché correspond bien à l'entité et à la locale courantes. */
    ready: boolean;
    saving: boolean;
    /** Des modifications anglaises ne sont pas enregistrées. */
    dirty: boolean;
    /** Horodatage du dernier enregistrement de la traduction en base. */
    updatedAt: string | null;
    /** Message d'erreur du dernier échange avec la base, s'il y en a un. */
    error: string | null;
    save: () => Promise<{ success: boolean; error?: string }>;
    /** Abandonne les modifications non enregistrées (retour à la base + overlay). */
    revert: () => void;
    /** Supprime l'overlay : le contenu repasse intégralement en français. */
    remove: () => Promise<{ success: boolean; error?: string }>;
    reload: () => Promise<void>;
}

/** Sérialisation stable : le diff suit l'ordre des clés du français. */
function serialize(payload: Record<string, unknown>): string {
    return JSON.stringify(payload ?? {});
}

export function useEntityTranslation<T extends object>({
    entity,
    entityId,
    locale,
    base,
    targetLocale = 'en',
}: UseEntityTranslationOptions<T>): UseEntityTranslationResult<T> {
    /** L'édition anglaise n'est active que hors français : rien n'est chargé avant. */
    const shouldLoad = locale !== 'fr';

    const [savedPayload, setSavedPayload] = useState<Record<string, unknown>>({});
    const [localized, setLocalized] = useState<T>(() => hydrateLocalized<T>(base, {}));
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [updatedAt, setUpdatedAt] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loadedKey, setLoadedKey] = useState<string | null>(null);

    /** Clé du contenu affiché : changer de page rend le brouillon obsolète. */
    const translationKey = `${entity}::${entityId}::${targetLocale}`;
    /** `false` = la traduction affichée ne correspond pas encore à l'entité courante. */
    const ready = loadedKey === translationKey;

    // Le brouillon anglais en cours d'édition ne doit jamais être écrasé par un
    // rafraîchissement du contenu français.
    const dirtyRef = useRef(false);

    // Overlay en cours d'édition : ce qui serait écrit si l'on enregistrait.
    const payload = useMemo(() => diffTranslation(base, localized), [base, localized]);

    const savedJson = useMemo(() => serialize(savedPayload), [savedPayload]);
    const dirty = useMemo(() => serialize(payload) !== savedJson, [payload, savedJson]);

    // La référence est mise à jour dans un effet (jamais pendant le rendu) : elle
    // sert aux chargements différés, qui doivent savoir si une saisie est en cours.
    useEffect(() => {
        dirtyRef.current = dirty;
    }, [dirty]);

    const coverage = useMemo(() => translationCoverage(base, payload), [base, payload]);

    /** Charge l'overlay depuis la base et réaligne le brouillon. */
    const load = useCallback(
        async (options: { keepDraft?: boolean } = {}) => {
            setLoading(true);
            const res = await getSiteTranslation(entity, entityId, targetLocale);
            setLoading(false);

            if (!res.success) {
                setError(res.error);
                return;
            }

            setError(null);
            setSavedPayload(res.payload);
            setUpdatedAt(res.updatedAt);
            setLoadedKey(translationKey);
            // On ne réaligne que si l'utilisateur n'a rien en cours : sa saisie
            // anglaise est plus précieuse que la fraîcheur technique.
            if (!options.keepDraft) {
                setLocalized(hydrateLocalized<T>(base, res.payload));
            }
        },
        [entity, entityId, targetLocale, base, translationKey]
    );

    // Chargement à l'entrée en édition anglaise, et à chaque changement d'entité.
    // `base` n'est pas une dépendance : il est lu au moment du chargement, et une
    // évolution du français est traitée plus bas sans écraser une saisie en cours.
    useEffect(() => {
        if (!shouldLoad) return;
        void load({ keepDraft: dirtyRef.current });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldLoad, entity, entityId, targetLocale]);

    // Le contenu français a changé (édition FR enregistrée) : on réaligne le
    // brouillon anglais sur le nouveau français, sauf saisie en cours.
    const previousBase = useRef(base);
    useEffect(() => {
        if (previousBase.current === base) return;
        previousBase.current = base;
        if (dirtyRef.current) return;
        setLocalized(hydrateLocalized<T>(base, savedPayload));
    }, [base, savedPayload]);

    const save = useCallback(async () => {
        // Garde-fou : en édition française, l'overlay anglais n'est pas chargé.
        // Enregistrer depuis cet état écraserait la traduction existante.
        if (!shouldLoad) {
            return { success: false, error: 'Enregistrement anglais indisponible en édition française.' };
        }

        setSaving(true);
        // Un overlay vide n'a aucune raison d'exister : on le supprime pour que
        // la vitrine serve proprement le français plutôt qu'une ligne morte.
        const isEmpty = Object.keys(payload).length === 0;
        const res = isEmpty
            ? await deleteSiteTranslation(entity, entityId, targetLocale)
            : await upsertSiteTranslation({
                entity,
                entity_id: entityId,
                locale: targetLocale,
                payload,
                is_published: true,
            });
        setSaving(false);

        if (!res.success) {
            setError(res.error ?? 'Enregistrement impossible');
            return { success: false, error: res.error };
        }

        setError(null);
        // On retient ce que la base a réellement conservé (payload nettoyé).
        const persisted =
            !isEmpty && 'payload' in res && res.payload ? res.payload : {};
        setSavedPayload(persisted);
        setLocalized(hydrateLocalized<T>(base, persisted));
        setUpdatedAt(new Date().toISOString());
        return { success: true };
    }, [shouldLoad, payload, entity, entityId, targetLocale, base]);

    const revert = useCallback(() => {
        setLocalized(hydrateLocalized<T>(base, savedPayload));
    }, [base, savedPayload]);

    const remove = useCallback(async () => {
        if (!shouldLoad) {
            return { success: false, error: 'Suppression indisponible en édition française.' };
        }

        setSaving(true);
        const res = await deleteSiteTranslation(entity, entityId, targetLocale);
        setSaving(false);

        if (!res.success) {
            setError(res.error ?? 'Suppression impossible');
            return { success: false, error: res.error };
        }

        setError(null);
        setSavedPayload({});
        setLocalized(hydrateLocalized<T>(base, {}));
        setUpdatedAt(null);
        return { success: true };
    }, [shouldLoad, entity, entityId, targetLocale, base]);

    const reload = useCallback(async () => {
        await load({ keepDraft: false });
    }, [load]);

    return {
        localized,
        setLocalized,
        payload,
        coverage,
        savedPayload,
        loading,
        ready,
        saving,
        dirty,
        updatedAt,
        error,
        save,
        revert,
        remove,
        reload,
    };
}
