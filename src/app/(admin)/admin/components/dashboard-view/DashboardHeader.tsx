'use client';

import React from 'react';
import { Zap } from 'lucide-react';

/** En-tête du tableau de bord : accroche, titre et description. */
export const DashboardHeader: React.FC = () => (
    <div className="border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
            <Zap className="w-3.5 h-3.5" /> Centre de Contrôle Instantané
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
            Cockpit CUC — Administration
        </h1>
        <p className="text-sm text-gray-400 mt-1">
            Pilotez l'intégralité de votre site vitrine : 15 pages, médias CDN, sessions, instructeurs, films et partenaires.
        </p>
    </div>
);
