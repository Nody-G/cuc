import React from 'react';
import { getTeam } from '@/lib/data/site-service';
import { TeamManager } from './TeamManager';
import { Users } from 'lucide-react';

export const instant = false;

export default async function AdminTeamPage() {
  const team = await getTeam();

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto w-full">
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
          <Users className="w-3.5 h-3.5" /> Gestion des instructeurs & formateurs
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
          Équipe CUC
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Gérez le trombinoscope de l&apos;école, les spécialités, biographies et profils des coordinateurs cascades.
        </p>
      </div>

      <TeamManager team={team} />
    </div>
  );
}
