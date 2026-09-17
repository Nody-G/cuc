'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  ArrowRight,
  FileText,
  Image as ImageIcon,
  Calendar,
  Users,
  Film,
  Sparkles,
  Handshake,
  Settings,
  CheckCircle2,
  Inbox,
  Database,
  Clock,
} from 'lucide-react';
import { SiteSettings, AuditLogEntry, getAuditLogs } from '@/lib/data/site-service';
import { TabType } from '../CockpitApp';

interface DashboardViewProps {
  switchTab: (tab: TabType) => void;
  teamLength: number;
  filmsLength: number;
  eventsLength: number;
  partnersLength: number;
  totalSessions: number;
  fullSessions: number;
  siteSettings: SiteSettings;
  inquiriesCount?: number;
  newInquiriesCount?: number;
  onOpenBackupModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  switchTab,
  teamLength,
  filmsLength,
  eventsLength,
  partnersLength,
  totalSessions,
  fullSessions,
  siteSettings,
  inquiriesCount = 3,
  newInquiriesCount = 1,
  onOpenBackupModal,
}) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    getAuditLogs().then(setLogs);
  }, []);
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
          <Zap className="w-3.5 h-3.5" /> Centre de Contrôle Instantané
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
          Cockpit CUC — Administration
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Pilotez l&apos;intégralité de votre site vitrine : 15 pages, médias CDN, sessions, instructeurs, films et partenaires.
        </p>
      </div>

      {/* Grille des modules Cockpit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Module Candidatures & Demandes */}
        <button
          type="button"
          onClick={() => switchTab('inquiries' as TabType)}
          className="bg-[#0F0F14] border border-white/10 rounded-xl p-5 text-left group hover:border-[#FFE500]/50 transition-all hover:scale-[1.01] relative overflow-hidden cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Candidatures &amp; Devis</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-[#FFE500]">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white flex items-center gap-2">
              {inquiriesCount}
              {newInquiriesCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFE500] text-black font-mono font-bold animate-pulse">
                  {newInquiriesCount} new
                </span>
              )}
            </div>
            <div className="text-xs text-gray-400 mt-1">Dossiers &amp; demandes de contact</div>
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#FFE500] font-medium">
            Gérer les candidatures <ArrowRight className="w-3 h-3" />
          </div>
        </button>

        {/* Module Pages */}
        <button
          type="button"
          onClick={() => switchTab('pages')}
          className="bg-[#0F0F14] border border-white/10 rounded-xl p-5 text-left group hover:border-[#FFE500]/50 transition-all hover:scale-[1.01] cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">CMS Pages</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-[#FFE500]">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">15</div>
            <div className="text-xs text-gray-400 mt-1">Pages vitrines éditables</div>
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#FFE500] font-medium">
            Éditer les pages <ArrowRight className="w-3 h-3" />
          </div>
        </button>

        {/* Module Médiathèque */}
        <button
          type="button"
          onClick={() => switchTab('media')}
          className="bg-[#0F0F14] border border-white/10 rounded-xl p-5 text-left group hover:border-[#FFE500]/50 transition-all hover:scale-[1.01] cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Médiathèque</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">CDN</div>
            <div className="text-xs text-gray-400 mt-1">Supabase Storage public</div>
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#FFE500] font-medium">
            Gérer les médias <ArrowRight className="w-3 h-3" />
          </div>
        </button>

        {/* Module Sessions */}
        <button
          type="button"
          onClick={() => switchTab('sessions')}
          className="bg-[#0F0F14] border border-white/10 rounded-xl p-5 text-left group hover:border-[#FFE500]/50 transition-all hover:scale-[1.01] cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Sessions &amp; Dates</span>
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
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#FFE500] font-medium">
            Gérer les dates <ArrowRight className="w-3 h-3" />
          </div>
        </button>

        {/* Module Instructeurs */}
        <button
          type="button"
          onClick={() => switchTab('team')}
          className="bg-[#0F0F14] border border-white/10 rounded-xl p-5 text-left group hover:border-[#FFE500]/50 transition-all hover:scale-[1.01] cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Instructeurs</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">{teamLength}</div>
            <div className="text-xs text-gray-400 mt-1">Formateurs &amp; coordinateurs</div>
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#FFE500] font-medium">
            Modifier l&apos;équipe <ArrowRight className="w-3 h-3" />
          </div>
        </button>

        {/* Module Filmographie */}
        <button
          type="button"
          onClick={() => switchTab('films')}
          className="bg-[#0F0F14] border border-white/10 rounded-xl p-5 text-left group hover:border-[#FFE500]/50 transition-all hover:scale-[1.01] cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Filmographie</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">{filmsLength}</div>
            <div className="text-xs text-gray-400 mt-1">Films, blockbusters &amp; séries</div>
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#FFE500] font-medium">
            Mettre à jour <ArrowRight className="w-3 h-3" />
          </div>
        </button>

        {/* Module Prestations Events */}
        <button
          type="button"
          onClick={() => switchTab('events')}
          className="bg-[#0F0F14] border border-white/10 rounded-xl p-5 text-left group hover:border-[#FFE500]/50 transition-all hover:scale-[1.01] cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">CUC Events</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">{eventsLength || 3}</div>
            <div className="text-xs text-gray-400 mt-1">Shows &amp; team-building</div>
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#FFE500] font-medium">
            Gérer les offres <ArrowRight className="w-3 h-3" />
          </div>
        </button>

        {/* Module Partenaires */}
        <button
          type="button"
          onClick={() => switchTab('partners')}
          className="bg-[#0F0F14] border border-white/10 rounded-xl p-5 text-left group hover:border-[#FFE500]/50 transition-all hover:scale-[1.01] cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Partenaires</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Handshake className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">{partnersLength}</div>
            <div className="text-xs text-gray-400 mt-1">Cinéma &amp; institutionnels</div>
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#FFE500] font-medium">
            Gérer les partenaires <ArrowRight className="w-3 h-3" />
          </div>
        </button>

        {/* Module Paramètres */}
        <button
          type="button"
          onClick={() => switchTab('settings')}
          className="bg-[#0F0F14] border border-white/10 rounded-xl p-5 text-left group hover:border-[#FFE500]/50 transition-all hover:scale-[1.01] cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Paramètres</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <Settings className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-lg font-bold text-white truncate">{siteSettings.school_name || 'CUC'}</div>
            <div className="text-xs text-gray-400 mt-1">Coordonnées, footer, réseaux</div>
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#FFE500] font-medium">
            Configurer <ArrowRight className="w-3 h-3" />
          </div>
        </button>
      </div>

      {/* Section Raccourcis & Journal d'Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Journal d'activités récentes */}
        <div className="lg:col-span-2 bg-[#0D0D12] border border-white/10 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="text-xs font-mono text-white font-bold uppercase flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FFE500]" /> Historique d&apos;Activités Récentes
            </div>
            <span className="text-[10px] font-mono text-gray-400">Temps réel</span>
          </div>

          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-white/5 border border-white/5 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-white flex items-center gap-2">
                    <span>{log.action}</span>
                    <span className="text-[10px] font-mono text-[#FFE500] bg-[#FFE500]/10 px-1.5 py-0.5 rounded-sm">
                      {log.entity}
                    </span>
                  </div>
                  {log.details && (
                    <div className="text-gray-400 text-[11px]">{log.details}</div>
                  )}
                  <div className="text-[10px] text-gray-500">Par {log.user_name}</div>
                </div>

                <span className="text-[10px] font-mono text-gray-500 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Panneau Sécurité & Sauvegardes */}
        <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="text-xs font-mono text-white font-bold uppercase flex items-center gap-2 border-b border-white/10 pb-3">
              <Database className="w-4 h-4 text-emerald-400" /> Sauvegarde Intégrale
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Téléchargez un instantané complet de votre site CUC (15 pages, ateliers, dates, instructeurs et partenaires) ou restaurez une configuration précédente.
            </p>
          </div>

          {onOpenBackupModal && (
            <button
              type="button"
              onClick={onOpenBackupModal}
              className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Database className="w-4 h-4 text-[#FFE500]" />
              <span>Ouvrir l&apos;outil Sauvegarde &amp; Restauration</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-[#12121A] border border-white/10 rounded-xl p-6 relative">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-[#FFE500]/10 text-[#FFE500] shrink-0 mt-0.5">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white uppercase tracking-wide">
              Cockpit Ultra-Rapide &amp; Haute Disponibilité
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              La navigation entre les modules s&apos;effectue désormais à <strong>0 ms de latence</strong>. Vos modifications sont prises en compte immédiatement et synchronisées en arrière-plan avec votre base de données Supabase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
