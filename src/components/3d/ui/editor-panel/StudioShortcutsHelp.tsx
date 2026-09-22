'use client';

import React from 'react';

/** Aide contextuelle sobre : gestes et raccourcis réellement disponibles. */
export const StudioShortcutsHelp: React.FC = () => (
    <div className="pt-2 border-t border-zinc-800 text-[9px] text-zinc-500 leading-relaxed">
        <div className="text-zinc-400 uppercase font-bold mb-1">Raccourcis studio</div>
        <div>
            L'anneau jaune tourne l'objet : il est affiché dans <span className="text-zinc-300">tous</span>{' '}
            les outils. Le saisir bascule automatiquement l'outil sur « Tourner ».
        </div>
        <div>Flèches (déplacer) et cubes d'axe (redimensionner) suivent l'outil sélectionné.</div>
        <div>Maj + glisser : réglage fin. Aimantation : voir « Aimantation grille ».</div>
        <div>1 / 2 / 3 : Déplacer · Tourner · Redimensionner.</div>
        <div>Flèches : X / Z — [ / ] : rotation — + / − : échelle uniforme.</div>
        <div>Ctrl+Z / Ctrl+Maj+Z : annuler / rétablir — F : cadrer.</div>
    </div>
);
