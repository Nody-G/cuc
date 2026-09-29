'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    convertInquiryToCucSignStudent,
    deleteInquiry,
    fetchInquiriesAction,
    reclassifyInquiry,
    setDiscoveryVerdict,
    updateInquiryNotes,
    updateInquiryStage,
} from '@/app/(admin)/admin/actions';
import { getInquiries, type SiteInquiry } from '@/lib/data/site-service';

export interface PersistNotesResult {
    success: boolean;
    error?: string;
}

export interface RemoveInquiryResult {
    success: boolean;
    error?: string;
}

export interface ConvertInquiryResult {
    success: boolean;
    message?: string;
    error?: string;
    profile_id?: string;
    formation_id?: string | null;
}

export interface UseInquiriesDataArgs {
    showToast: (msg: string) => void;
    onInquiriesCountChange?: (count: number) => void;
}

/**
 * Données et mutations des candidatures : chargement, statut, notes,
 * suppression, réassignation de session et passerelle CUC Sign.
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1) — l'état de la modale vit
 * dans `useInquiryDetail`, les Server Actions restent dans `actions/**`.
 */
export function useInquiriesData({ showToast, onInquiriesCountChange }: UseInquiriesDataArgs) {
    const [inquiries, setInquiries] = useState<SiteInquiry[]>([]);
    const [loading, setLoading] = useState(true);

    const syncCount = useCallback(
        (list: SiteInquiry[]) =>
            onInquiriesCountChange?.(list.filter((i) => i.status === 'nouveau').length),
        [onInquiriesCountChange]
    );

    const loadInquiries = useCallback(async (): Promise<SiteInquiry[]> => {
        try {
            const serverData = await fetchInquiriesAction();
            if (serverData && serverData.length > 0) return serverData;
        } catch {
            // Repli sur le service client/isomorphe
        }
        return await getInquiries();
    }, []);

    const fetchInquiries = useCallback(async () => {
        setLoading(true);
        const data = await loadInquiries();
        setInquiries(data);
        setLoading(false);
        syncCount(data);
    }, [loadInquiries, syncCount]);

    // Chargement initial : drapeau `active` pour ignorer une réponse après démontage.
    useEffect(() => {
        let active = true;
        loadInquiries().then((data) => {
            if (active) {
                setInquiries(data);
                setLoading(false);
                syncCount(data);
            }
        });
        return () => {
            active = false;
        };
    }, [loadInquiries, syncCount]);

    /**
     * Change l'étape du dossier. Le refus éventuel (verrou Découverte → Cursus
     * Pro) vient du serveur : le toast explique pourquoi l'étape est refusée.
     */
    const changeStage = async (id: string, stage: string) => {
        const res = await updateInquiryStage(id, stage);
        if (res.success) {
            const next = inquiries.map((item) => (item.id === id ? { ...item, status: stage } : item));
            setInquiries(next);
            syncCount(next);
            showToast('Étape mise à jour.');
        } else {
            showToast(`Erreur : ${res.error}`);
        }
        return res;
    };

    /** Déplace un dossier vers un autre pipeline (erreur de catégorie du visiteur). */
    const reclassify = async (id: string, targetPipeline: string, reason: string) => {
        const res = await reclassifyInquiry(id, targetPipeline, reason);
        if (res.success) {
            await fetchInquiries();
            showToast('Demande re-catégorisée.');
        } else {
            showToast(`Erreur : ${res.error}`);
        }
        return res;
    };

    /** Enregistre le verdict de la session Découverte (cursus long). */
    const recordDiscoveryVerdict = async (
        id: string,
        verdict: 'en_attente' | 'favorable' | 'defavorable'
    ) => {
        const res = await setDiscoveryVerdict(id, verdict);
        if (res.success) {
            setInquiries((prev) =>
                prev.map((item) =>
                    item.id === id
                        ? { ...item, metadata: { ...(item.metadata ?? {}), discovery_verdict: verdict } }
                        : item
                )
            );
            showToast('Verdict Découverte enregistré.');
        } else {
            showToast(`Erreur : ${res.error}`);
        }
        return res;
    };

    const persistNotes = async (id: string, serialized: string): Promise<PersistNotesResult> => {
        const res: PersistNotesResult = await updateInquiryNotes(id, serialized);
        if (res.success) {
            setInquiries((prev) =>
                prev.map((item) => (item.id === id ? { ...item, admin_notes: serialized } : item))
            );
        }
        return res;
    };

    const removeInquiry = async (id: string): Promise<RemoveInquiryResult> => {
        const res: RemoveInquiryResult = await deleteInquiry(id);
        if (res.success) {
            const next = inquiries.filter((item) => item.id !== id);
            setInquiries(next);
            syncCount(next);
        }
        return res;
    };

    const convertInquiry = async (id: string): Promise<ConvertInquiryResult> => {
        try {
            const res = await convertInquiryToCucSignStudent(id);
            if (res.success) {
                setInquiries((prev) =>
                    prev.map((it) =>
                        it.id === id
                            ? {
                                ...it,
                                status: 'admis',
                                metadata: {
                                    ...(it.metadata || {}),
                                    cuc_sign_student_id: res.profile_id,
                                    cuc_sign_formation_id: res.formation_id,
                                    converted_at: new Date().toISOString(),
                                },
                            }
                            : it
                    )
                );
            }
            return res;
        } catch (e) {
            return { success: false, error: e instanceof Error ? e.message : String(e) };
        }
    };

    /** Réassignation de session : mutation locale de la liste + accusé visuel. */
    const updateSessionDate = (id: string, date: string) => {
        setInquiries((prev) => prev.map((it) => (it.id === id ? { ...it, session_date: date } : it)));
        showToast(`Session mise à jour : ${date || 'Aucune'}`);
    };

    return {
        inquiries,
        loading,
        fetchInquiries,
        changeStage,
        reclassify,
        recordDiscoveryVerdict,
        persistNotes,
        removeInquiry,
        convertInquiry,
        updateSessionDate,
    };
}
