'use client';

import React from 'react';
import {
  FileText,
  Image as ImageIcon,
  Calendar,
  Users,
  Film,
  Handshake,
  Settings,
  Inbox,
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

      {/* Grille des modules Cockpit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Module Candidatures & Demandes */}
        <DashboardModuleCard
          label="Candidatures & Devis"
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

        {/* Module Pages */}
        <DashboardModuleCard
          label="CMS Pages"
          icon={FileText}
          iconClass="bg-amber-500/10 text-[#FFE500]"
          subtitle="Pages vitrines éditables"
          cta="Éditer les pages"
          onClick={() => switchTab('pages')}
        >
          <div className="text-3xl font-black text-white">15</div>
        </DashboardModuleCard>

        {/* Module Médiathèque */}
        <DashboardModuleCard
          label="Médiathèque"
          icon={ImageIcon}
          iconClass="bg-sky-500/10 text-sky-400"
          subtitle="Supabase Storage public"
          cta="Gérer les médias"
          onClick={() => switchTab('media')}
        >
          <div className="text-3xl font-black text-white">CDN</div>
        </DashboardModuleCard>

        {/* Module Sessions */}
        <DashboardModuleCard
          label="Sessions & Dates"
          icon={Calendar}
          iconClass="bg-yellow-500/10 text-[#FFE500]"
          subtitle={
            <>
              dont <span className="text-red-400 font-semibold">{fullSessions} complètes</span>
            </>
          }
          cta="Gérer les dates"
          onClick={() => switchTab('sessions')}
        >
          <div className="text-3xl font-black text-white">{totalSessions}</div>
        </DashboardModuleCard>

        {/* Module Instructeurs */}
        <DashboardModuleCard
          label="Instructeurs"
          icon={Users}
          iconClass="bg-blue-500/10 text-blue-400"
          subtitle="Formateurs & coordinateurs"
          cta="Modifier l'équipe"
          onClick={() => switchTab('team')}
        >
          <div className="text-3xl font-black text-white">{teamLength}</div>
        </DashboardModuleCard>

        {/* Module Filmographie */}
        <DashboardModuleCard
          label="Filmographie"
          icon={Film}
          iconClass="bg-purple-500/10 text-purple-400"
          subtitle="Films, blockbusters & séries"
          cta="Mettre à jour"
          onClick={() => switchTab('films')}
        >
          <div className="text-3xl font-black text-white">{filmsLength}</div>
        </DashboardModuleCard>

        {/* Module Partenaires */}
        <DashboardModuleCard
          label="Partenaires"
          icon={Handshake}
          iconClass="bg-emerald-500/10 text-emerald-400"
          subtitle="Cinéma & institutionnels"
          cta="Gérer les partenaires"
          onClick={() => switchTab('partners')}
        >
          <div className="text-3xl font-black text-white">{partnersLength}</div>
        </DashboardModuleCard>

        {/* Module Paramètres */}
        <DashboardModuleCard
          label="Paramètres"
          icon={Settings}
          iconClass="bg-rose-500/10 text-rose-400"
          subtitle="Coordonnées, footer, réseaux"
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
