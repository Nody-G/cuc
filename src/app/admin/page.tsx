import React from 'react';
import Link from 'next/link';
import { Calendar, Users, Film, Bell, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { getPrograms, getTeam, getFilms, getActiveAnnouncement } from '@/lib/data/site-service';

export const instant = false;

export default async function AdminDashboardPage() {
  const [programs, team, films, activeAnnouncement] = await Promise.all([
    getPrograms(),
    getTeam(),
    getFilms(),
    getActiveAnnouncement(),
  ]);

  const totalSessions = programs.reduce((acc, p) => acc + (p.nextSessions?.length || 0), 0);
  const fullSessions = programs.reduce(
    (acc, p) => acc + (p.nextSessions?.filter((s) => s.status === 'complet').length || 0),
    0
  );

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto w-full">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
            <Zap className="w-3.5 h-3.5" /> Centre de Contrôle Autonome
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
            Cockpit CUC — Administration
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Gérez les dates de stages, l&apos;équipe, la filmographie et les alertes du site en direct.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-colors flex items-center gap-2"
          >
            <span>Prévisualiser le site</span>
            <span className="text-[#FFE500]">↗</span>
          </Link>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stages & Sessions */}
        <div className="bg-[#0F0F14] border border-white/10 rounded-xl p-5 relative overflow-hidden group hover:border-[#FFE500]/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Sessions & Dates</span>
            <div className="p-2 rounded-lg bg-yellow-500/10 text-[#FFE500]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">{totalSessions}</div>
            <div className="text-xs text-gray-400 mt-1">
              dont <span className="text-red-400 font-semibold">{fullSessions} complètes</span>
            </div>
          </div>
          <Link
            href="/admin/sessions"
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#FFE500] font-medium hover:underline"
          >
            Gérer les dates <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Équipe */}
        <div className="bg-[#0F0F14] border border-white/10 rounded-xl p-5 relative overflow-hidden group hover:border-[#FFE500]/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Instructeurs</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">{team.length}</div>
            <div className="text-xs text-gray-400 mt-1">Formateurs & coordinateurs référents</div>
          </div>
          <Link
            href="/admin/team"
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#FFE500] font-medium hover:underline"
          >
            Modifier l&apos;équipe <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Filmographie */}
        <div className="bg-[#0F0F14] border border-white/10 rounded-xl p-5 relative overflow-hidden group hover:border-[#FFE500]/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Filmographie</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">{films.length}</div>
            <div className="text-xs text-gray-400 mt-1">Films, blockbusters & séries</div>
          </div>
          <Link
            href="/admin/films"
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#FFE500] font-medium hover:underline"
          >
            Mettre à jour <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Bandeau d'alerte */}
        <div className="bg-[#0F0F14] border border-white/10 rounded-xl p-5 relative overflow-hidden group hover:border-[#FFE500]/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Bandeau Flash</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-lg font-bold text-white flex items-center gap-2">
              {activeAnnouncement ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Actif
                </span>
              ) : (
                <span className="text-gray-400">Inactif</span>
              )}
            </div>
            <div className="text-xs text-gray-400 mt-1 line-clamp-1">
              {activeAnnouncement ? activeAnnouncement.title : 'Aucune annonce en cours'}
            </div>
          </div>
          <Link
            href="/admin/announcements"
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#FFE500] font-medium hover:underline"
          >
            Configurer <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Guide & Sécurité */}
      <div className="bg-[#12121A] border border-white/10 rounded-xl p-6 relative">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-[#FFE500]/10 text-[#FFE500] shrink-0 mt-0.5">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white uppercase tracking-wide">
              Fonctionnement en direct & Sécurité
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Toute modification enregistrée dans ce cockpit met à jour le site vitrine <strong>instantanément</strong> (revalidation automatique du cache Next.js).
              Vos données sont hébergées de façon étanche sur votre base Supabase partagée avec <em>CUC Sign</em> sous les tables dédiées <code className="text-[#FFE500] px-1 bg-black/40 rounded">site_*</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
