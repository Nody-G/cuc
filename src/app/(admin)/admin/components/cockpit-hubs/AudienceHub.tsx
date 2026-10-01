'use client';

import React from 'react';
import type { SitePageContent } from '@/lib/data/site-service';
import type { StuntProgram } from '@/types';
import { getHub, subTabFor, type TabType } from '../../cockpit/cockpit-nav';
import { AnalyticsView } from '../AnalyticsView';
import { TrafficMonitorView } from '../TrafficMonitorView';
import { HubSubTabs } from './HubSubTabs';

export interface AudienceHubProps {
    activeTab: TabType;
    switchTab: (tab: TabType) => void;
    showToast: (msg: string) => void;
    programs: StuntProgram[];
    pages: SitePageContent[];
}

/**
 * Hub « Statistiques & Audience » — réunit le rapport analytique (`analytics`)
 * et le monitoring de fréquentation (`traffic`) sous deux sous-onglets.
 *
 * Enveloppe fine : `AnalyticsView` et `TrafficMonitorView` sont importées telles
 * quelles. Les URL historiques `/admin/analytics` et `/admin/visites` (onglet
 * `traffic`) continuent d'ouvrir le bon sous-onglet.
 */
export const AudienceHub: React.FC<AudienceHubProps> = ({
    activeTab,
    switchTab,
    showToast,
    programs,
    pages,
}) => {
    const hub = getHub('audience');
    if (!hub) return null;
    const active = subTabFor(hub, activeTab);

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <HubSubTabs subTabs={hub.subTabs} activeTab={active} onSelect={switchTab} />

            {active === 'analytics' && (
                <AnalyticsView programs={programs} pages={pages} showToast={showToast} />
            )}

            {active === 'traffic' && <TrafficMonitorView showToast={showToast} />}
        </div>
    );
};
