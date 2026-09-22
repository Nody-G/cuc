'use client';

import { useEffect, useState } from 'react';
import {
    getPreviewSettings,
    subscribePreviewSettings,
    type PreviewSettingsOverrides,
} from './preview-store';

/**
 * ==============================================================================
 * CUC — Surcharges de réglages de l'aperçu (côté vitrine)
 * ==============================================================================
 * Les composants du chrome (navbar, pied de page…) lisent leurs valeurs dans
 * `site_settings`. Dans l'iframe du Cockpit, le parent pousse un brouillon de
 * réglages : ce hook rend la surcharge à appliquer **par-dessus** la valeur
 * serveur, sans rechargement ni écriture en base.
 *
 * Hors aperçu, le store est vide et l'objet rendu est stable : aucun rendu
 * supplémentaire pour la vitrine publique.
 */

const EMPTY: PreviewSettingsOverrides = {};

export function usePreviewSettings(): PreviewSettingsOverrides {
    const [overrides, setOverrides] = useState<PreviewSettingsOverrides>(getPreviewSettings);

    useEffect(() => subscribePreviewSettings(setOverrides), []);

    return overrides ?? EMPTY;
}
