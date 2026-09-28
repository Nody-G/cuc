'use client';

import React from 'react';
import {
  Activity,
  Boxes,
  Calendar,
  FileText,
  Film,
  Handshake,
  Inbox,
  Settings,
  Users,
} from 'lucide-react';
import type { SiteSettings } from '@/lib/data/site-service';
import type { TabType } from '../CockpitApp';
import { DashboardHeader } from './dashboard-view/DashboardHeader';
import { DashboardModuleCard } from './dashboard-view/DashboardModuleCard';
import { DashboardActivityLog } from './dashboard-view/DashboardActivityLog';
import { DashboardBackupPanel } from './dashboard-view/DashboardBackupPanel';
import { DashboardPerformanceNote } from './dashboard-view/DashboardPerformanceNote';
import { useAuditLogs } from './dashboard-view/useAuditLogs';

interface DashboardViewProps {
  switchTab: (tab: TabType) => void;
  teamLength: number;
  filmsLength: number;
  partnersLength: number;
  totalSessions: number;
  fullSessions: number;
  siteSettings: SiteSettings;
  inquiriesCount?: number;
  newInquiriesCount?: number;
  onOpenBackupModal?: () => void;
}

/**
 * Tableau de bord du Cockpit — façade de composition.
 *
 * Les cartes de module, le journal d'activités et les panneaux vivent dans
 * `dashboard-view/**` ; les données arrivent par props (compteurs du Cockpit).
 */
export const DashboardView: React.FC<DashboardViewProps> = ({
  switchTab,
  teamLength,
  filmsLength,
  partnersLength,
  totalSessions,
  fullSessions,
  siteSettings,
  inquiriesCount = 3,
  newInquiriesCount = 1,
  onOpenBackupModal,
}) => {
  const logs = useAuditLogs();

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <DashboardHeader />

      {/* Grille des modules Cockpit — 9 modules opérationnels majeurs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Candidatures & Demandes */}
        <DashboardModuleCard
          label="Candidatures & Contacts"
          icon={Inbox}
          iconClass="bg-amber-500/10 text-[#FFE500]"
          subtitle="Dossiers & demandes de contact"
          cta="Gérer les candidatures"
          overflowHidden
          onClick={() => switchTab('inquiries' as TabType)}
        >
          <div className="text-3xl font-black text-white flex items-center gap-2">
            {inquiriesCount}
            {newInquiriesCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFE500] text-black font-mono font-bold animate-pulse">
                {newInquiriesCount} new
              </span>
            )}
          </div>
        </DashboardModuleCard>

        {/* 2. Instagram Live Certifié Meta */}
        <DashboardModuleCard
          label="Instagram Live"
          icon={Activity}
          iconClass="bg-fuchsia-500/10 text-fuchsia-400"
          subtitle="706M+ vues cumulées réelles"
          cta="Superviser les métriques"
          onClick={() => switchTab('instagram')}
        >
          <div className="text-3xl font-black text-white flex items-center gap-2">
            1,12M
            <span className="text-xs px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 font-mono font-bold border border-fuchsia-500/30">
              Certifié
            </span>
          </div>
        </DashboardModuleCard>

        {/* 3. Éditeur Mode Studio */}
        <DashboardModuleCard
          label="Éditeur Mode Studio"
          icon={FileText}
          iconClass="bg-amber-500/10 text-[#FFE500]"
          subtitle="15 pages vitrines éditables"
          cta="Éditer en direct"
          onClick={() => switchTab('pages')}
        >
          <div className="text-3xl font-black text-white">Studio</div>
        </DashboardModuleCard>

        {/* 4. Filmographie Cascades */}
        <DashboardModuleCard
          label="Filmographie Cascades"
          icon={Film}
          iconClass="bg-purple-500/10 text-purple-400"
          subtitle="Films, blockbusters & séries"
          cta="Mettre à jour"
          onClick={() => switchTab('films')}
        >
          <div className="text-3xl font-black text-white">{filmsLength}</div>
        </DashboardModuleCard>

        {/* 5. Sessions & Calendrier */}
        <DashboardModuleCard
          label="Sessions & Calendrier"
          icon={Calendar}
          iconClass="bg-yellow-500/10 text-[#FFE500]"
          subtitle={
            <>
              dont <span className="text-red-400 font-semibold">{fullSessions} complètes</span>
            </>
          }
          cta="Gérer le calendrier"
          onClick={() => switchTab('sessions')}
        >
          <div className="text-3xl font-black text-white">{totalSessions}</div>
        </DashboardModuleCard>

        {/* 6. Équipe & Coachs */}
        <DashboardModuleCard
          label="Équipe & Coachs"
          icon={Users}
          iconClass="bg-blue-500/10 text-blue-400"
          subtitle="20 instructeurs professionnels"
          cta="Gérer les formateurs"
          onClick={() => switchTab('team')}
        >
          <div className="text-3xl font-black text-white">{teamLength}</div>
        </DashboardModuleCard>

        {/* 7. Campus & Installations */}
        <DashboardModuleCard
          label="Campus & Installations"
          icon={Boxes}
          iconClass="bg-cyan-500/10 text-cyan-400"
          subtitle="Studio Plan 3D & zones POI"
          cta="Ouvrir le Campus"
          onClick={() => switchTab('campus-3d')}
        >
          <div className="text-3xl font-black text-white">3D + POI</div>
        </DashboardModuleCard>

        {/* 8. Partenaires & Marques */}
        <DashboardModuleCard
          label="Partenaires & Marques"
          icon={Handshake}
          iconClass="bg-emerald-500/10 text-emerald-400"
          subtitle="Partenaires cinéma & agence"
          cta="Gérer les partenaires"
          onClick={() => switchTab('partners')}
        >
          <div className="text-3xl font-black text-white">{partnersLength}</div>
        </DashboardModuleCard>

        {/* 9. Paramètres Globaux */}
        <DashboardModuleCard
          label="Paramètres Globaux"
          icon={Settings}
          iconClass="bg-rose-500/10 text-rose-400"
          subtitle="Standard, adresse, Qualiopi"
          cta="Configurer"
          onClick={() => switchTab('settings')}
        >
          <div className="text-lg font-bold text-white truncate">
            {siteSettings.school_name || 'CUC'}
          </div>
        </DashboardModuleCard>
      </div>

      {/* Section Raccourcis & Journal d'Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Journal d'activités récentes */}
        <DashboardActivityLog logs={logs} />

        {/* Panneau Sécurité & Sauvegardes */}
        <DashboardBackupPanel onOpenBackupModal={onOpenBackupModal} />
      </div>

      <DashboardPerformanceNote />
    </div>
  );
};
