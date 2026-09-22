'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
    clearDraftSnapshot,
    isDraftPersistable,
    readDraftSnapshot,
    recoveredDraftMessage,
    writeDraftSnapshot,
} from '@/lib/preview/draft-storage';
import type { SitePageContent } from '@/lib/data/site-service';
import type { EditorLocaleOption } from '@/app/(admin)/admin/components/ui/LocaleToggle';

export interface UseDraftPersistenceArgs {
    slug: string;
    locale: EditorLocaleOption;
    /** Nombre de champs modifiés par rapport au contenu enregistré. */
    draftCount: number;
    activeData: SitePageContent;
    applyDraftChange: (mutate: (prev: SitePageContent) => SitePageContent) => void;
}

/**
 * Filet de sécurité du poste de travail : le brouillon survit à un rechargement
 * d'onglet, une coupure réseau ou un crash navigateur. Rien n'est écrit en base,
 * et tout est effacé dès que la page est enregistrée. Un brouillon retrouvé est
 * proposé une seule fois par page et par langue ; le navigateur avertit tant
 * qu'il reste des modifications non enregistrées.
 */
export function useDraftPersistence({
    slug,
    locale,
    draftCount,
    activeData,
    applyDraftChange,
}: UseDraftPersistenceArgs) {
    useEffect(() => {
        if (!isDraftPersistable(draftCount)) {
            clearDraftSnapshot(slug, locale);
            return;
        }
        writeDraftSnapshot(slug, locale, activeData);
    }, [activeData, slug, locale, draftCount]);

    /** Récupération proposée une seule fois par page et par langue. */
    const recoveredDraftsRef = useRef<Set<string>>(new Set());
    useEffect(() => {
        const key = `${slug}:${locale}`;
        if (recoveredDraftsRef.current.has(key)) return;
        recoveredDraftsRef.current.add(key);

        const stored = readDraftSnapshot(slug, locale);
        if (!stored) return;

        if (!window.confirm(recoveredDraftMessage(stored))) {
            clearDraftSnapshot(slug, locale);
            return;
        }

        applyDraftChange(() => stored.draft as SitePageContent);
    }, [applyDraftChange, slug, locale]);

    /** Avertissement navigateur tant qu'il reste des modifications non enregistrées. */
    useEffect(() => {
        if (draftCount === 0) return;

        const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', warnBeforeLeaving);
        return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
    }, [draftCount]);

    /** Efface le brouillon local de la page et de la langue courantes (après enregistrement). */
    const clearCurrentSnapshot = useCallback(() => clearDraftSnapshot(slug, locale), [slug, locale]);

    return { clearCurrentSnapshot };
}
