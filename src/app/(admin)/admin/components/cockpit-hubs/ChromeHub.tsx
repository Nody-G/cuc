'use client';

import React from 'react';
import type { SiteAnnouncement, SiteSettings } from '@/lib/data/site-service';
import { getHub, subTabFor, type TabType } from '../../cockpit/cockpit-nav';
import { AnnouncementsView } from '../AnnouncementsView';
import { FooterView } from '../FooterView';
import { SocialLinksView } from '../SocialLinksView';
import { SettingsView } from '../SettingsView';
import { HubSubTabs } from './HubSubTabs';

export interface ChromeHubProps {
    activeTab: TabType;
    switchTab: (tab: TabType) => void;
    showToast: (msg: string) => void;
    announcement: SiteAnnouncement;
    setAnnouncement: React.Dispatch<React.SetStateAction<SiteAnnouncement>>;
    siteSettings: SiteSettings;
}

/**
 * Hub « Chrome du Site » — regroupe le bandeau, le pied de page, les réseaux
 * sociaux et les coordonnées sous un seul point d'entrée de menu.
 *
 * Enveloppe **fine** (`AGENTS.md` § 1) : elle ne possède que la bascule de
 * sous-onglet et délègue le rendu aux vues existantes, importées telles quelles.
 * Les deep-links historiques (`announcements`, `footer`, `social`, `settings`)
 * restent valides : `subTabFor` sélectionne le bon sous-onglet d'après l'onglet
 * actif, sans état interne.
 */
export const ChromeHub: React.FC<ChromeHubProps> = ({
    activeTab,
    switchTab,
    showToast,
    announcement,
    setAnnouncement,
    siteSettings,
}) => {
    const hub = getHub('chrome');
    if (!hub) return null;
    const active = subTabFor(hub, activeTab);

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <HubSubTabs subTabs={hub.subTabs} activeTab={active} onSelect={switchTab} />

            {active === 'announcements' && (
                <AnnouncementsView
                    announcement={announcement}
                    setAnnouncement={setAnnouncement}
                    showToast={showToast}
                />
            )}

            {active === 'footer' && <FooterView showToast={showToast} />}

            {active === 'social' && <SocialLinksView showToast={showToast} />}

            {active === 'settings' && (
                <SettingsView initialSettings={siteSettings} onNavigateToTab={switchTab} />
            )}
        </div>
    );
};
