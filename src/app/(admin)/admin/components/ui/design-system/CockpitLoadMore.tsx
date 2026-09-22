import React from 'react';
import { cx } from './cockpit-classes';

export interface CockpitLoadMoreProps {
    /** Nombre d'éléments actuellement montés. */
    visibleCount: number;
    /** Nombre total d'éléments dans la liste source. */
    total: number;
    /** Étend la fenêtre de rendu. */
    onLoadMore: () => void;
    /** Libellé du bouton (défaut : « Afficher plus »). */
    label?: string;
    className?: string;
}

/**
 * Pied de liste pour le rendu progressif (`useProgressiveList`).
 *
 * Affiche un compteur sobre « X sur Y » et un bouton d'extension. Ne rend rien
 * lorsque tous les éléments sont déjà montés, afin de ne pas ajouter de bruit
 * visuel sur les listes courtes.
 */
export const CockpitLoadMore: React.FC<CockpitLoadMoreProps> = ({
    visibleCount,
    total,
    onLoadMore,
    label = 'Afficher plus',
    className,
}) => {
    if (visibleCount >= total) return null;
    return (
        <div className={cx('flex flex-col items-center gap-2 pt-2', className)}>
            <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
                {visibleCount} sur {total} affichés
            </span>
            <button
                type="button"
                onClick={onLoadMore}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 hover:text-white text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
                {label}
            </button>
        </div>
    );
};
