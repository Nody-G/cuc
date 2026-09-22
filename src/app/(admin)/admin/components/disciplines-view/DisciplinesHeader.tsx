'use client';

import React from 'react';
import { Plus, Shield } from 'lucide-react';

export interface DisciplinesHeaderProps {
    count: number;
    onCreate: () => void;
}

/** En-tête du catalogue : compte de modules + création. */
export const DisciplinesHeader: React.FC<DisciplinesHeaderProps> = ({ count, onCreate }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
            <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cuc-gold/10 border border-cuc-gold/20 text-cuc-gold">
                    <Shield className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                        Modules & Disciplines de Cascade
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {count} Modules
                        </span>
                    </h1>
                    <p className="text-sm text-zinc-400 mt-1">
                        Gérez le catalogue officiel des 10 modules techniques, les formateurs attitrés, les zones campus et les films de référence.
                    </p>
                </div>
            </div>
        </div>

        <button
            onClick={onCreate}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-cuc-gold text-black font-semibold rounded-xl hover:bg-yellow-400 transition shadow-lg shadow-cuc-gold/10 text-sm shrink-0"
        >
            <Plus className="w-4 h-4" />
            Ajouter un Module
        </button>
    </div>
);
