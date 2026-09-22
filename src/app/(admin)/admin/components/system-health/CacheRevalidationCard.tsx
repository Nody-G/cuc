'use client';

import React from 'react';
import { Globe, RefreshCw } from 'lucide-react';

interface CacheRevalidationCardProps {
    isRevalidating: boolean;
    onRevalidate: () => void;
}

/** Action de purge/revalidation du cache ISR de toutes les pages vitrines. */
export const CacheRevalidationCard: React.FC<CacheRevalidationCardProps> = ({
    isRevalidating,
    onRevalidate,
}) => (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
            <div className="text-xs font-mono text-white font-bold uppercase flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#FFE500]" /> Forcer la Revalidation du Cache Vitrine
            </div>
        </div>
        <p className="text-xs text-gray-400">
            Purger et régénérer le cache Next.js ISR de toutes les pages vitrines pour refléter
            instantanément les modifications sans attendre le cycle automatique.
        </p>
        <button
            type="button"
            onClick={onRevalidate}
            disabled={isRevalidating}
            className="w-full py-2.5 px-4 rounded-xl bg-[#FFE500] hover:bg-yellow-400 text-black text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs shadow-yellow-500/20"
        >
            <RefreshCw className={`w-4 h-4 ${isRevalidating ? 'animate-spin' : ''}`} />
            <span>
                {isRevalidating ? 'Revalidation en cours...' : 'Revalider Toutes les Pages Vitrines'}
            </span>
        </button>
    </div>
);
