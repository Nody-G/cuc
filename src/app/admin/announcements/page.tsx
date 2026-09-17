import React from 'react';
import { getActiveAnnouncement } from '@/lib/data/site-service';
import { AnnouncementsManager } from './AnnouncementsManager';
import { Bell } from 'lucide-react';

export const instant = false;

export default async function AdminAnnouncementsPage() {
  const activeAnnouncement = await getActiveAnnouncement();

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto w-full">
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
          <Bell className="w-3.5 h-3.5" /> Bandeau d&apos;annonce & alertes
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
          Flash Info & Alertes
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Affichez un message urgent ou une actualité en haut de tout le site vitrine (inscriptions, fermetures, portes ouvertes).
        </p>
      </div>

      <AnnouncementsManager initialAnnouncement={activeAnnouncement} />
    </div>
  );
}
