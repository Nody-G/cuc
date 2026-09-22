'use client';

import React, { useRef } from 'react';
import { usePreviewEditLayer } from './preview-edit-layer/usePreviewEditLayer';
import { ListCommandOverlay } from './preview-edit-layer/ListCommandOverlay';
import { MediaReplaceOverlay } from './preview-edit-layer/MediaReplaceOverlay';
import { TextEditOverlay } from './preview-edit-layer/TextEditOverlay';

/**
 * ==============================================================================
 * CUC — Couche d'édition en place (Mode Studio, côté vitrine)
 * ==============================================================================
 * Quand le Cockpit est en mode `edit`, le clic sur un élément `[data-cuc-field]`
 * ouvre **sur place** une saisie posée au-dessus de l'élément cible :
 *  - `input` pour `text` et `link`, `textarea` pour `textarea` ;
 *  - Entrée valide (mono-ligne) ; Ctrl/Cmd+Entrée ou clic ailleurs valide
 *    (multi-lignes) ; Échap annule ;
 *  - aucune valeur inchangée n'est transmise (aucun message inutile) ;
 *  - le texte reste brut (sauts de ligne autorisés) : pas de HTML, donc pas de
 *    sanitisation et aucune mise en forme inventée.
 *
 * Primitive volontairement **non destructive** : on ne rend jamais l'élément
 * React `contentEditable` — la réconciliation écraserait le DOM. La saisie est
 * superposée, l'aperçu reste le vrai rendu public.
 *
 * Inerte hors iframe du Cockpit : rien n'est monté, rien n'est écouté.
 *
 * Implémentation découpée dans `./preview-edit-layer/**` (modèle de couche,
 * hook d'orchestration, overlays liste/média/texte).
 */
export const PreviewEditLayer: React.FC = () => {
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
    const layer = usePreviewEditLayer({ inputRef });

    if (!layer.embedded || (!layer.overlay && !layer.media && !layer.list)) return null;

    if (layer.list) {
        return <ListCommandOverlay list={layer.list} onCommand={layer.runListCommand} />;
    }

    if (layer.media) {
        return <MediaReplaceOverlay media={layer.media} onReplace={layer.requestMediaReplace} />;
    }

    if (!layer.overlay) return null;

    return (
        <TextEditOverlay
            overlay={layer.overlay}
            inputRef={inputRef}
            onBlur={layer.handleBlur}
            onKeyDown={layer.handleKeyDown}
        />
    );
};
