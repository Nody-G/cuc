import React from 'react';
import { Calendar } from 'lucide-react';

export const SessionsHeader: React.FC = () => (
    <div className="border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
            <Calendar className="w-3.5 h-3.5" /> Sessions & Dates de stage
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
            Gestion des Dates & Disponibilités
        </h1>
        <p className="text-sm text-gray-400 mt-1">
            Basculez une session en "Complet" en 1 clic ou ajoutez de nouvelles sessions.
        </p>
    </div>
);
