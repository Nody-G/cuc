'use client';

import React from 'react';
import { getHub, subTabFor, type TabType } from '../../cockpit/cockpit-nav';
import { LogsView } from '../LogsView';
import { AuditLogView } from '../AuditLogView';
import { HubSubTabs } from './HubSubTabs';

export interface JournalHubProps {
    activeTab: TabType;
    switchTab: (tab: TabType) => void;
    showToast: (msg: string) => void;
}

/**
 * Hub « Journal » — réunit l'activité applicative (`logs`) et le journal d'audit
 * (`audit`) sous deux sous-onglets désambiguïsés (« Activité » / « Journal
 * d'Audit »).
 *
 * Enveloppe fine : les vues `LogsView` et `AuditLogView` sont importées telles
 * quelles. Les URL historiques `/admin/journal`, `/admin/audit` et le `TabType`
 * `logs` continuent d'ouvrir le bon sous-onglet.
 */
export const JournalHub: React.FC<JournalHubProps> = ({ activeTab, switchTab, showToast }) => {
    const hub = getHub('journal');
    if (!hub) return null;
    const active = subTabFor(hub, activeTab);

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <HubSubTabs subTabs={hub.subTabs} activeTab={active} onSelect={switchTab} />

            {active === 'logs' && <LogsView showToast={showToast} />}

            {active === 'audit' && <AuditLogView showToast={showToast} />}
        </div>
    );
};
