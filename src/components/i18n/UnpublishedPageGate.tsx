'use client';

import React, { useSyncExternalStore } from 'react';
import Link from 'next/link';
import type { SitePageContent } from '@/lib/data/site-service';
import { isPreviewFrame } from '@/lib/preview/preview-context';

/** Abonnement vide : la valeur d'aperçu est constante pour une page donnée. */
const subscribePreview = () => () => { };
const getPreviewSnapshot = () => isPreviewFrame();
const getServerPreviewSnapshot = () => false;

/**
 * ==============================================================================
 * CUC — Garde de diffusion (dernier recours)
 * ==============================================================================
 * Depuis le lot « 404 des brouillons », la diffusion se décide **côté serveur** :
 * l'accueil et les 14 layouts de route appellent `getPublicPageContent()` et une
 * page définitivement non publiée y répond `404` — plus de « 200 avec avis ».
 *
 * Cette garde reste le **dernier recours** : si un écran s'affichait un jour sans
 * passer par la porte serveur, le HTML public ne contiendrait toujours aucun
 * texte non publié :
 *
 *  - décision prise au rendu à partir de `page.is_published` (prop) ;
 *  - `allowUnpublished` : réservé à la route d'aperçu admin (`/preview/...`) —
 *    le brouillon est servi SANS flash, la décision d'accès est prise par le
 *    serveur (`checkIsAdmin()`), pas par le navigateur ;
 *  - `isPreviewFrame()` reste couvert en défense en profondeur (ancien aperçu
 *    `?cuc-preview=1`).
 */
export const UnpublishedPageGate: React.FC<{
    page?: SitePageContent | null;
    /** Réservé à la route d'aperçu admin : sert le brouillon sans le masquer. */
    allowUnpublished?: boolean;
    children: React.ReactNode;
}> = ({ page, allowUnpublished = false, children }) => {
    /**
     * `false` au rendu serveur (aucun `window`) : le brouillon n'est jamais rendu.
     * Lecture sans `setState` dans un effet (`react-hooks/set-state-in-effect`) :
     * l'hydratation démarre sur le snapshot serveur puis bascule sur le client.
     */
    const isPreview = useSyncExternalStore(
        subscribePreview,
        getPreviewSnapshot,
        getServerPreviewSnapshot
    );

    if (page?.is_published !== false || allowUnpublished || isPreview) {
        return <>{children}</>;
    }

    return (
        <main
            id="contenu-principal"
            className="flex-grow flex items-center justify-center px-4 py-32"
        >
            <div className="max-w-xl w-full border-2 border-amber-500/40 bg-[#0e0e14] p-8 text-center">
                <p className="font-mono-tech text-[11px] uppercase tracking-[0.3em] text-amber-400">
                    Brouillon
                </p>
                <h1 className="mt-4 font-display text-2xl sm:text-3xl uppercase tracking-wide text-white">
                    Cette page n’est pas publiée
                </h1>
                <p className="mt-3 text-xs sm:text-sm font-tech text-zinc-400 leading-relaxed">
                    Elle existe dans le Cockpit du campus mais n’a pas été publiée sur la vitrine.
                    Les équipes peuvent la prévisualiser et la publier depuis l’éditeur de pages.
                </p>
                <Link
                    href="/"
                    className="mt-6 inline-flex items-center gap-2 text-xs font-mono-tech font-bold uppercase text-[#FFE500] hover:text-white transition-colors"
                >
                    Retour à l’accueil
                </Link>
            </div>
        </main>
    );
};
