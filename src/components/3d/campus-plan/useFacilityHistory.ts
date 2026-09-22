'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { soundFX } from '@/lib/soundFx';
import { DEFAULT_FACILITIES } from '../data/defaultFacilities';
import { normalizeFacilityItem, normalizeFacilityRecord } from '../data/facilityTransform';
import type { EditableFacilityItem } from '../types/campus3d.types';
import { readLocalPlacements } from './placement-storage';
import { getCampusPlacements3D } from '@/lib/data/site-service';

/**
 * Fenêtre de fusion de l'historique : deux modifications du **même champ** sur
 * la **même installation** dans cet intervalle forment une seule étape
 * annulable. Sans cette fusion, glisser un curseur produirait des dizaines
 * d'entrées d'historique et « Annuler » deviendrait inutilisable.
 */
const HISTORY_COALESCE_MS = 700;

/** Profondeur maximale de l'historique (au-delà, les plus anciennes sont perdues). */
const HISTORY_LIMIT = 60;

interface HistoryStore {
    past: Array<Record<string, EditableFacilityItem>>;
    future: Array<Record<string, EditableFacilityItem>>;
    lastKey: string;
    lastAt: number;
}

export interface UseFacilityHistoryArgs {
    /** Source de vérité synchrone (mutations + historique). */
    facilitiesRef: React.MutableRefObject<Record<string, EditableFacilityItem>>;
    /** État initial (repli navigateur ou défauts calibrés). */
    initialFacilities: Record<string, EditableFacilityItem>;
    /** Persistance différée appelée à chaque mutation. */
    schedulePersist: (next: Record<string, EditableFacilityItem>) => void;
}

/**
 * État des installations + historique annulable/rétablissable, avec chargement
 * des placements.
 *
 * La source de vérité synchrone (`facilitiesRef`) évite toute écriture d'effet
 * de bord à l'intérieur d'un updater React (double invocation en mode strict =
 * entrées d'historique dupliquées).
 *
 * La lecture depuis Supabase est **inconditionnelle**, y compris sur le site
 * public : un enregistrement réussi dans le Cockpit doit être visible côté
 * vitrine. Priorité : Supabase > `localStorage` > défauts OSM.
 */
export function useFacilityHistory({
    facilitiesRef,
    initialFacilities,
    schedulePersist,
}: UseFacilityHistoryArgs) {
    const [facilities, setFacilities] =
        useState<Record<string, EditableFacilityItem>>(initialFacilities);
    const [historyFlags, setHistoryFlags] = useState({ canUndo: false, canRedo: false });
    const historyRef = useRef<HistoryStore>({ past: [], future: [], lastKey: '', lastAt: 0 });

    useEffect(() => {
        facilitiesRef.current = facilities;
    }, [facilities, facilitiesRef]);

    const syncHistoryFlags = useCallback(() => {
        const history = historyRef.current;
        setHistoryFlags({ canUndo: history.past.length > 0, canRedo: history.future.length > 0 });
    }, []);

    const pushHistory = useCallback(
        (snapshot: Record<string, EditableFacilityItem>, key: string) => {
            const history = historyRef.current;
            const now = Date.now();
            const coalesced =
                history.lastKey === key &&
                history.past.length > 0 &&
                now - history.lastAt < HISTORY_COALESCE_MS;

            if (!coalesced) {
                history.past.push(snapshot);
                if (history.past.length > HISTORY_LIMIT) history.past.shift();
            }
            history.future = [];
            history.lastKey = key;
            history.lastAt = now;
            syncHistoryFlags();
        },
        [syncHistoryFlags]
    );

    /** Applique un nouvel état complet, en l'inscrivant dans l'historique. */
    const commitFacilities = useCallback(
        (next: Record<string, EditableFacilityItem>, key: string) => {
            pushHistory(facilitiesRef.current, key);
            facilitiesRef.current = next;
            setFacilities(next);
            schedulePersist(next);
        },
        [pushHistory, facilitiesRef, schedulePersist]
    );

    /**
     * Chargement des placements : Supabase d'abord, repli navigateur ensuite
     * (les défauts sont déjà appliqués à l'initialisation de l'état).
     */
    useEffect(() => {
        let cancelled = false;

        getCampusPlacements3D()
            .then((placements) => {
                if (cancelled) return;

                if (placements && Object.keys(placements).length > 0) {
                    const merged = normalizeFacilityRecord(placements, DEFAULT_FACILITIES);
                    facilitiesRef.current = merged;
                    setFacilities(merged);
                    return;
                }

                const local = readLocalPlacements();
                if (local) {
                    facilitiesRef.current = local;
                    setFacilities(local);
                }
            })
            .catch(() => {
                // Lecture indisponible (hors ligne, droits) : on conserve l'état
                // local ou les défauts, sans bloquer l'affichage du plan.
            });

        return () => {
            cancelled = true;
        };
    }, [facilitiesRef]);

    /**
     * Mutation d'une installation avec persistance différée et inscription dans
     * l'historique. Toute valeur est normalisée (bornes, axes manquants, champs
     * hérités) avant d'entrer dans l'état.
     */
    const updateFacility = useCallback(
        (id: string, updates: Partial<EditableFacilityItem>) => {
            const current = facilitiesRef.current[id] ?? DEFAULT_FACILITIES[id];
            if (!current) return;

            const normalized = normalizeFacilityItem(id, { ...current, ...updates }, current);
            const next = { ...facilitiesRef.current, [id]: normalized };
            const historyKey = `${id}:${Object.keys(updates).sort().join(',')}`;
            commitFacilities(next, historyKey);
        },
        [commitFacilities, facilitiesRef]
    );

    const undo = useCallback(() => {
        const history = historyRef.current;
        const previous = history.past.pop();
        if (!previous) return;

        history.future.push(facilitiesRef.current);
        history.lastKey = '';
        facilitiesRef.current = previous;
        setFacilities(previous);
        schedulePersist(previous);
        syncHistoryFlags();
        soundFX.playTacticalClick();
    }, [facilitiesRef, schedulePersist, syncHistoryFlags]);

    const redo = useCallback(() => {
        const history = historyRef.current;
        const next = history.future.pop();
        if (!next) return;

        history.past.push(facilitiesRef.current);
        history.lastKey = '';
        facilitiesRef.current = next;
        setFacilities(next);
        schedulePersist(next);
        syncHistoryFlags();
        soundFX.playTacticalClick();
    }, [facilitiesRef, schedulePersist, syncHistoryFlags]);

    return { facilities, historyFlags, commitFacilities, updateFacility, undo, redo };
}
