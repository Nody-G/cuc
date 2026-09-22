import type { LucideIcon } from 'lucide-react';
import type { TabType } from '../../CockpitApp';

export interface CockpitNavItem {
    id: TabType;
    label: string;
    icon: LucideIcon;
    badge?: string;
}

export interface CockpitNavSection {
    title: string;
    items: CockpitNavItem[];
}

export interface CockpitSidebarProps {
    navSections: CockpitNavSection[];
    activeTab: TabType;
    onSelectTab: (tab: TabType) => void;
    userRole: string;
    realtimeStatus: 'connected' | 'connecting';
    userName: string;
    onLogout: () => void;
    onOpenBackup: () => void;
    /** Contrôle l'ouverture du tiroir sur mobile. */
    isMobileOpen: boolean;
    onCloseMobile: () => void;
}
