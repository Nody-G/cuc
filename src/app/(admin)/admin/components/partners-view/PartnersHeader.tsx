'use client';

import React from 'react';
import { Handshake, Plus } from 'lucide-react';

interface PartnersHeaderProps {
    onCreate: () => void;
}

/** En-tête de l'onglet : identité de la section + création d'une fiche. */
export const PartnersHeader: React.FC<PartnersHeaderProps> = ({ onCreate }) => (
    <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
                <Handshake className="w-3.5 h-3.5" /> Écosystème & Industrie
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                Partenaires & Marques
            </h1>
            <p className="text-sm text-gray-400 mt-1">
                Gérez les productions de cinéma, équipementiers et partenaires institutionnels affichés sur le site.
            </p>
        </div>

        <button
            onClick={onCreate}
            className="px-5 py-2.5 bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-black uppercase tracking-wider rounded-lg flex items-center gap-2 shadow-lg shadow-yellow-500/10 transition-transform active:scale-95 self-start md:self-auto"
        >
            <Plus className="w-4 h-4" />
            Ajouter un partenaire
        </button>
    </div>
);
