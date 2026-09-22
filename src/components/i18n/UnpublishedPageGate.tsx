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
 * CUC — Garde de diffusion : une page non publiée ne se rend pas
 * ==============================================================================
 * « Publier » et « dépublier » doivent vouloir dire quelque chose : tant que la
 * garde serveur complète (route d'aperçu admin + 404, cf.
 * `plans/revue-diffusion-brouillons.md`) n'est pas posée, cette garde-ci ferme le
 * trou le plus grave — le contenu d'un brouillon n'est **jamais rendu** :
 *
 *  - décision prise au rendu serveur à partir de `page.is_published` (prop) :
 *    le HTML public ne contient donc **aucun** texte non publié ;
 *  - l'aperçu du Cockpit (`?cuc-preview=1` dans l'iframe) reste servi : sans lui,
 *    on ne pourrait plus éditer une page avant de la publier — c'était la raison
 *    pour laquelle la garde `notFound()` avait dû être retirée côté serveur ;
 *  - le visiteur, lui, voit un avis sobre et honnête plutôt qu'un contenu que le
 *    campus n'a pas publié.
 *
 * Limite assumée et documentée : la réponse HTTP reste un `200` (le contenu n'est
 * plus servi, mais la route n'est pas annoncée comme absente). Le 404 viendra avec
 * la route d'aperçu dédiée.
 */
export const UnpublishedPageGate: React.FC<{
    page?: SitePageContent | null;
    children: React.ReactNode;
}> = ({ page, children }) => {
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

    if (page?.is_published !== false || isPreview) return <>{children}</>;

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
