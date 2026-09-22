'use client';

import React from 'react';
import { Sparkles, Plus } from 'lucide-react';

interface EventsHeaderProps {
    onAdd: () => void;
}

/** En-tête de l'éditeur : titre, description et bouton « Ajouter une offre ». */
export const EventsHeader: React.FC<EventsHeaderProps> = ({ onAdd }) => (
    <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" /> Prestations & Événements Professionnels
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                CUC Events & Prestations
            </h1>
            <p className="text-sm text-gray-400 mt-1">
                Gérez les offres de Team Building, Spectacles Yamakasi, cascades mobiles et animations airbag.
            </p>
        </div>

        <button
            onClick={onAdd}
            className="px-5 py-2.5 bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-black uppercase tracking-wider rounded-lg flex items-center gap-2 shadow-lg shadow-yellow-500/10 transition-transform active:scale-95 self-start md:self-auto"
        >
            <Plus className="w-4 h-4" />
            Ajouter une offre
        </button>
    </div>
);
