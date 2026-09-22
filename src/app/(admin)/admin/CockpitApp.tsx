'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { CockpitThemeProvider, useCockpitTheme } from './components/ui/CockpitThemeProvider';
import { ToastProvider, useToast } from './components/ui/ToastProvider';
import { ShortcutsHelpModal } from './components/ShortcutsHelpModal';
import { CockpitSidebar } from './components/CockpitSidebar';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { CommandPalette } from './components/CommandPalette';
import { SystemHealthModal } from './components/SystemHealthModal';
import { createClient } from '@/lib/supabase/client';
import { CockpitTopbar } from './cockpit/CockpitTopbar';
import { CockpitTabContent } from './cockpit/CockpitTabContent';
import { useCockpitData } from './cockpit/useCockpitData';
import { useCockpitShortcuts } from './cockpit/useCockpitShortcuts';
import { buildNavSections, resolveTabFromPath, type TabType } from './cockpit/cockpit-nav';

export type { TabType } from './cockpit/cockpit-nav';

interface CockpitAppProps {
  initialTab?: TabType;
}

const CockpitAppInner: React.FC<CockpitAppProps> = ({ initialTab = 'dashboard' }) => {
  const { theme, toggleTheme } = useCockpitTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  const getTabFromPath = (): TabType => {
    if (typeof window !== 'undefined') {
      const resolved = resolveTabFromPath(window.location.pathname);
      if (resolved) return resolved;
    }
    return resolveTabFromPath(pathname) ?? initialTab;
  };

  const [activeTab, setActiveTab] = useState<TabType>(getTabFromPath());
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const data = useCockpitData();
  const { switchTab } = useCockpitShortcuts({
    setActiveTab,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    isShortcutsHelpOpen,
    setIsShortcutsHelpOpen,
    isBackupModalOpen,
    setIsBackupModalOpen,
    isHealthModalOpen,
    setIsHealthModalOpen,
  });

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/admin/login');
    } catch {
      router.push('/admin/login');
    }
  };

  const navSections = buildNavSections({
    userRole: data.userRole,
    newInquiriesCount: data.newInquiriesCount,
    announcementActive: data.announcement.is_active,
  });

  return (
    <div
      data-cockpit-root
      className="min-h-screen bg-[#070709] text-gray-100 flex flex-col md:flex-row antialiased"
    >
      {/* Lien d'évitement (WCAG 2.2 — 2.4.1) */}
      <a
        href="#cockpit-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[#FFE500] focus:text-black focus:text-xs focus:font-black focus:uppercase focus:tracking-wider"
      >
        Aller au contenu principal
      </a>

      {/* Sidebar latérale (groupes repliables, recherche, favoris, tiroir mobile) */}
      <CockpitSidebar
        navSections={navSections}
        activeTab={activeTab}
        onSelectTab={switchTab}
        userRole={data.userRole}
        realtimeStatus={data.realtimeStatus === 'connected' ? 'connected' : 'connecting'}
        userName={
          data.currentUserProfile?.full_name ||
          [data.currentUserProfile?.first_name, data.currentUserProfile?.last_name].filter(Boolean).join(' ') ||
          'Admin CUC'
        }
        onLogout={handleLogout}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Contenu principal avec Barre Supérieure d'accès rapide */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Barre Supérieure du Cockpit */}
        <CockpitTopbar
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenHealth={() => setIsHealthModalOpen(true)}
          onOpenBackup={() => setIsBackupModalOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <CockpitTabContent
          activeTab={activeTab}
          switchTab={switchTab}
          showToast={showToast}
          onOpenBackupModal={() => setIsBackupModalOpen(true)}
          {...data}
        />
      </div>

      {/* Modale de Sauvegarde et Restauration Intégrale */}
      <BackupRestoreModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        showToast={showToast}
        onRestored={() => {
          showToast('Données restaurées avec succès !');
          window.location.reload();
        }}
      />

      {/* Palette de Commandes Universelle (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={switchTab}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        onOpenHealth={() => setIsHealthModalOpen(true)}
      />

      {/* Diagnostic & Santé Système */}
      {/* Aide des raccourcis clavier */}
      <ShortcutsHelpModal
        isOpen={isShortcutsHelpOpen}
        onClose={() => setIsShortcutsHelpOpen(false)}
      />

      <SystemHealthModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        showToast={showToast}
        realtimeStatus={data.realtimeStatus}
        inquiriesCount={data.inquiriesCount}
        newInquiriesCount={data.newInquiriesCount}
        urgentInquiriesCount={data.newInquiriesCount}
        totalSessions={data.totalSessions}
        fullSessions={data.fullSessions}
      />
    </div>
  );
};

/**
 * Enveloppe le Cockpit dans les fournisseurs transverses :
 * - `CockpitThemeProvider` : thème clair/sombre persisté, scopé à `[data-cockpit-root]`
 *   pour ne jamais affecter la vitrine publique.
 * - `ToastProvider` : notifications unifiées consommées via `useToast()`.
 */
export const CockpitApp: React.FC<CockpitAppProps> = (props) => (
  <CockpitThemeProvider>
    <ToastProvider>
      <CockpitAppInner {...props} />
    </ToastProvider>
  </CockpitThemeProvider>
);
