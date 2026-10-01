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
import { BackupVersionsPanel } from './backup-view/BackupVersionsPanel';
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
  onOpenBackupModal,
}) => {
  const logs = useAuditLogs();

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <DashboardHeader />

      {/* Grille des modules Cockpit — 9 modules opérationnels majeurs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Contact */}
        <DashboardModuleCard
          label="Contact"
          icon={Inbox}
          iconClass="bg-amber-500/10 text-[#FFE500]"
          subtitle="Dossiers & demandes de contact"
          cta="Gérer les demandes de contact"
          overflowHidden
          onClick={() => switchTab('inquiries' as TabType)}
        >
          <div className="text-3xl font-black text-white">{inquiriesCount}</div>
        </DashboardModuleCard>

        {/* 2. Instagram & Vidéos */}
        <DashboardModuleCard
          label="Instagram & Vidéos"
          icon={Activity}
          iconClass="bg-fuchsia-500/10 text-fuchsia-400"
          subtitle="Abonnés certifiés & total des vues"
          cta="Voir les métriques"
          onClick={() => switchTab('instagram')}
        >
          <div className="text-3xl font-black text-white">1,12M</div>
        </DashboardModuleCard>

        {/* 3. Pages du Site */}
        <DashboardModuleCard
          label="Pages du Site"
          icon={FileText}
          iconClass="bg-amber-500/10 text-[#FFE500]"
          subtitle="Textes et images du site vitrine"
          cta="Modifier les pages"
          onClick={() => switchTab('pages')}
        >
          <div className="text-3xl font-black text-white">Édition</div>
        </DashboardModuleCard>

        {/* 4. Filmographie & Cascades */}
        <DashboardModuleCard
          label="Filmographie & Cascades"
          icon={Film}
          iconClass="bg-purple-500/10 text-purple-400"
          subtitle="Films, blockbusters & séries"
          cta="Gérer la filmographie"
          onClick={() => switchTab('films')}
        >
          <div className="text-3xl font-black text-white">{filmsLength}</div>
        </DashboardModuleCard>

        {/* 5. Sessions de Formation */}
        <DashboardModuleCard
          label="Sessions de Formation"
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

        {/* 6. Coachs & Formateurs */}
        <DashboardModuleCard
          label="Coachs & Formateurs"
          icon={Users}
          iconClass="bg-blue-500/10 text-blue-400"
          subtitle="20 cascadeurs professionnels"
          cta="Gérer les formateurs"
          onClick={() => switchTab('team')}
        >
          <div className="text-3xl font-black text-white">{teamLength}</div>
        </DashboardModuleCard>

        {/* 7. Campus & Lieux d'Entraînement */}
        <DashboardModuleCard
          label="Campus & Lieux d'Entraînement"
          icon={Boxes}
          iconClass="bg-cyan-500/10 text-cyan-400"
          subtitle="Plan 3D & zones d'entraînement"
          cta="Ouvrir le Campus"
          onClick={() => switchTab('campus-3d')}
        >
          <div className="text-3xl font-black text-white">3D + Zones</div>
        </DashboardModuleCard>

        {/* 8. Partenaires */}
        <DashboardModuleCard
          label="Partenaires"
          icon={Handshake}
          iconClass="bg-emerald-500/10 text-emerald-400"
          subtitle="Marques & partenaires cinéma"
          cta="Gérer les partenaires"
          onClick={() => switchTab('partners')}
        >
          <div className="text-3xl font-black text-white">{partnersLength}</div>
        </DashboardModuleCard>

        {/* 9. Coordonnées & Paramètres */}
        <DashboardModuleCard
          label="Coordonnées & Paramètres"
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

        {/* Panneau Sécurité & Sauvegardes (import/export JSON de contenu) */}
        <DashboardBackupPanel onOpenBackupModal={onOpenBackupModal} />
      </div>

      {/* État réel des sauvegardes versionnées (en veille par choix) +
          restauration versionnée. Lecture du catalogue hors projet Supabase ;
          aucune écriture tant que les trois vérifications serveur ne sont pas
          réunies. */}
      <BackupVersionsPanel />
    </div>
  );
};
