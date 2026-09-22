'use client';

import React from 'react';
import type { CockpitSidebarProps } from './cockpit-sidebar/sidebar-types';
import { useCockpitSidebar } from './cockpit-sidebar/useCockpitSidebar';
import { SidebarHeader } from './cockpit-sidebar/SidebarHeader';
import { SidebarSearch } from './cockpit-sidebar/SidebarSearch';
import { SidebarNav } from './cockpit-sidebar/SidebarNav';
import { SidebarFooter } from './cockpit-sidebar/SidebarFooter';
import { SidebarShell } from './cockpit-sidebar/SidebarShell';

export type { CockpitNavItem, CockpitNavSection, CockpitSidebarProps } from './cockpit-sidebar/sidebar-types';
export { TOGGLE_SIDEBAR_EVENT } from './cockpit-sidebar/sidebar-storage';

/**
 * Navigation latérale du Cockpit.
 *
 * Améliorations UX :
 *  - Groupes repliables (état persisté dans localStorage).
 *  - Recherche instantanée filtrant les entrées par libellé.
 *  - Épinglage de favoris remontés en tête de liste.
 *  - Repli automatique en tiroir sur mobile.
 *
 * Implémentation découpée dans `./cockpit-sidebar/**` (persistance, hook
 * d'orchestration, en-tête, recherche, navigation, pied, shell desktop/mobile).
 */
export const CockpitSidebar: React.FC<CockpitSidebarProps> = ({
    navSections,
    activeTab,
    onSelectTab,
    userRole,
    realtimeStatus,
    userName,
    onLogout,
    onOpenBackup,
    isMobileOpen,
    onCloseMobile,
}) => {
    const sidebar = useCockpitSidebar({ navSections, userRole });

    const content = (
        <>
            <SidebarHeader
                roleLabel={sidebar.roleLabel}
                realtimeStatus={realtimeStatus}
                onSelectDashboard={() => {
                    onSelectTab('dashboard');
                    onCloseMobile();
                }}
                onCloseMobile={onCloseMobile}
            />
            <SidebarSearch query={sidebar.query} onQueryChange={sidebar.setQuery} />
            <SidebarNav
                activeTab={activeTab}
                onSelectTab={onSelectTab}
                onCloseMobile={onCloseMobile}
                onOpenBackup={onOpenBackup}
                query={sidebar.query}
                normalizedQuery={sidebar.normalizedQuery}
                pins={sidebar.pins}
                pinnedItems={sidebar.pinnedItems}
                filteredSections={sidebar.filteredSections}
                isGroupCollapsed={sidebar.isGroupCollapsed}
                onToggleGroup={sidebar.toggleGroup}
                onTogglePin={sidebar.togglePin}
            />
            <SidebarFooter userName={userName} userRole={userRole} onLogout={onLogout} />
        </>
    );

    return (
        <SidebarShell isRail={sidebar.isRail} isMobileOpen={isMobileOpen} onCloseMobile={onCloseMobile}>
            {content}
        </SidebarShell>
    );
};
