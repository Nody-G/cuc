'use client';

import React from 'react';
import { Layers, Share2 } from 'lucide-react';

export interface SocialLinksRedirectSectionProps {
    onNavigateToTab?: (tab: 'social' | 'footer') => void;
}

/**
 * Renvoi vers les éditeurs canoniques (anti-doublon) : les réseaux sociaux et
 * le pied de page ont chacun leur éditeur, source unique de vérité.
 */
export const SocialLinksRedirectSection: React.FC<SocialLinksRedirectSectionProps> = ({
    onNavigateToTab,
}) => (
    <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 space-y-4 lg:col-span-2">
        <div className="flex items-center gap-3 border-b border-zinc-800/60 pb-3">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                <Share2 className="w-5 h-5" />
            </div>
            <div>
                <h3 className="text-base font-semibold text-zinc-100">Réseaux Sociaux & Pied de Page</h3>
                <p className="text-xs text-zinc-400">
                    Ces contenus disposent désormais d'un éditeur dédié, source unique de vérité.
                </p>
            </div>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
            Les liens de réseaux sociaux sont pilotés par la table{' '}
            <code className="text-amber-400">site_social_links</code> et le pied de page par{' '}
            <code className="text-amber-400">site_footer</code>. Les modifier ici créerait une
            seconde source de vérité désynchronisée de la vitrine publique.
        </p>

        <div className="flex flex-wrap gap-2">
            <button
                type="button"
                onClick={() => onNavigateToTab?.('social')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-black bg-[#FFE500] hover:bg-yellow-400 transition cursor-pointer"
            >
                <Share2 className="w-4 h-4" /> Éditer les réseaux sociaux
            </button>
            <button
                type="button"
                onClick={() => onNavigateToTab?.('footer')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-zinc-200 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition cursor-pointer"
            >
                <Layers className="w-4 h-4" /> Éditer le pied de page
            </button>
        </div>
    </div>
);
