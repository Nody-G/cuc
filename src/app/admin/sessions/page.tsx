import React from 'react';
import { getPrograms } from '@/lib/data/site-service';
import { SessionsManager } from './SessionsManager';
import { Calendar } from 'lucide-react';

export const instant = false;

export default async function AdminSessionsPage() {
  const programs = await getPrograms();

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto w-full">
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
          <Calendar className="w-3.5 h-3.5" /> Gestion des dates & sessions
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
          Sessions & Formations
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Basculez une session en &quot;Complet&quot;, ouvrez de nouvelles dates de stages et synchronisez la disponibilité en 1 clic.
        </p>
      </div>

      <SessionsManager programs={programs} />
    </div>
  );
}
