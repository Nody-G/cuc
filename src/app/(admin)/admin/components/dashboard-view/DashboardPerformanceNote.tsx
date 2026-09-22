'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

/** Note de performance : navigation instantanée et synchronisation en arrière-plan. */
export const DashboardPerformanceNote: React.FC = () => (
    <div className="bg-[#12121A] border border-white/10 rounded-xl p-6 relative">
        <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-[#FFE500]/10 text-[#FFE500] shrink-0 mt-0.5">
                <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-2">
                <h3 className="text-base font-bold text-white uppercase tracking-wide">
                    Cockpit Ultra-Rapide & Haute Disponibilité
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                    La navigation entre les modules s'effectue désormais à <strong>0 ms de latence</strong>. Vos modifications sont prises en compte immédiatement et synchronisées en arrière-plan avec votre base de données Supabase.
                </p>
            </div>
        </div>
    </div>
);
