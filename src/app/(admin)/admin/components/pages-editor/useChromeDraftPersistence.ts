'use client';

import { useEffect, useRef } from 'react';
import {
    clearChromeDraftSnapshot,
    isChromeDraftPersistable,
    readChromeDraftSnapshot,
    recoveredChromeDraftMessage,
    writeChromeDraftSnapshot,
    type ChromeDraftSnapshot,
} from '@/lib/preview/chrome-draft-storage';
import type { EditorLocaleOption } from '@/app/(admin)/admin/components/ui/LocaleToggle';

export interface UseChromeDraftPersistenceArgs {
    locale: EditorLocaleOption;
    /** Réglages modifiés dans l'aperçu (clé → valeur), brouillon en cours. */
    settings: Record<string, string>;
    /** Micro-textes de **cette** locale modifiés dans l'aperçu (clé → valeur). */
    microcopy: Record<string, string>;
    setSettings: (values: Record<string, string>) => void;
    setMicrocopy: (values: Record<string, string>) => void;
}

/**
 * Filet de sécurité du brouillon « chrome » : les réglages et micro-textes
 * saisis dans l'aperçu survivent à un rechargement d'onglet, une coupure réseau
 * ou un crash navigateur. Rien n'est écrit en base, et l'instantané disparaît de
 * lui-même dès que les deux brouillons sont vides (donc après publication).
 *
 * La récupération est proposée **une seule fois par locale** : les micro-textes
 * appartiennent à une langue, chaque locale a donc son propre instantané. La
 * récupération précède toujours l'écriture — un instantané ne doit jamais être
 * écrasé avant que l'utilisateur ait répondu à la confirmation.
 */
export function useChromeDraftPersistence({
    locale,
    settings,
    microcopy,
    setSettings,
    setMicrocopy,
}: UseChromeDraftPersistenceArgs): void {
    const recoveredLocalesRef = useRef<Set<string>>(new Set());

    /* Récupération d'abord (ordre des effets) : voir le docstring ci-dessus. */
    useEffect(() => {
        if (recoveredLocalesRef.current.has(locale)) return;
        recoveredLocalesRef.current.add(locale);

        const stored = readChromeDraftSnapshot(locale);
        if (!stored) return;

        if (!window.confirm(recoveredChromeDraftMessage(stored))) {
            clearChromeDraftSnapshot(locale);
            return;
        }

        setSettings(stored.settings);
        setMicrocopy(stored.microcopy);
    }, [locale, setSettings, setMicrocopy]);

    /* Persistance continue : un brouillon vidé (après sauvegarde) est effacé. */
    useEffect(() => {
        const snapshot: ChromeDraftSnapshot = { settings, microcopy };
        if (!isChromeDraftPersistable(snapshot)) {
            clearChromeDraftSnapshot(locale);
            return;
        }
        writeChromeDraftSnapshot(locale, snapshot);
    }, [settings, microcopy, locale]);

    /* Avertissement navigateur tant qu'il reste des textes non publiés. */
    const hasChanges = Object.keys(settings).length + Object.keys(microcopy).length > 0;
    useEffect(() => {
        if (!hasChanges) return;

        const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', warnBeforeLeaving);
        return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
    }, [hasChanges]);
}
