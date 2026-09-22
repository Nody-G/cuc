'use client';

import { useEffect, useState } from 'react';
import {
    getPreviewMicrocopy,
    subscribePreviewMicrocopy,
    type PreviewMicrocopyOverrides,
} from './preview-store';

/**
 * ==============================================================================
 * CUC — Surcharges de micro-textes de l'aperçu (côté vitrine)
 * ==============================================================================
 * Le Cockpit pousse un brouillon de micro-textes (`microcopy-draft`) : clés
 * plates → valeur, pour la locale active. Ce hook rend la carte à fusionner
 * dans le catalogue i18n ; hors aperçu, elle est stable et vide (aucun rendu
 * supplémentaire pour la vitrine publique).
 */

const EMPTY: PreviewMicrocopyOverrides = {};

export function usePreviewMicrocopy(): PreviewMicrocopyOverrides {
    const [overrides, setOverrides] = useState<PreviewMicrocopyOverrides>(getPreviewMicrocopy);

    useEffect(() => subscribePreviewMicrocopy(setOverrides), []);

    return overrides ?? EMPTY;
}
