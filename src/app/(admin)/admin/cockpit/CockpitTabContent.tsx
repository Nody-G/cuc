'use client';

import React from 'react';
import type {
    SiteAnnouncement,
    SiteEvent,
    SiteInquiry,
    SitePageContent,
    SitePartner,
    SiteSettings,
} from '@/lib/data/site-service';
import type { Discipline, FilmCredit, Instructor, StuntProgram } from '@/types';
import type { POI } from '@/components/ui/campus-map/campusMap.data';
import type { TabType } from './cockpit-nav';
import { CockpitCoreTabs } from './CockpitCoreTabs';
import { CockpitCmsTabs } from './CockpitCmsTabs';

export interface CockpitTabContentProps {
    activeTab: TabType;
    switchTab: (tab: TabType) => void;
    showToast: (msg: string) => void;
    userRole: string;
    totalSessions: number;
    fullSessions: number;
    /* Données du Cockpit (useCockpitData). */
    programs: StuntProgram[];
    team: Instructor[];
    films: FilmCredit[];
    disciplines: Discipline[];
    campusPOIs: POI[];
    pagesList: SitePageContent[];
    partnersList: SitePartner[];
    eventsList: SiteEvent[];
    siteSettings: SiteSettings;
    inquiriesList: SiteInquiry[];
    announcement: SiteAnnouncement;
    inquiriesCount: number;
    newInquiriesCount: number;
    /* Mutations locales (optimistes, persistées par les vues). */
    setPrograms: React.Dispatch<React.SetStateAction<StuntProgram[]>>;
    setTeam: React.Dispatch<React.SetStateAction<Instructor[]>>;
    setFilms: React.Dispatch<React.SetStateAction<FilmCredit[]>>;
    setDisciplines: React.Dispatch<React.SetStateAction<Discipline[]>>;
    setCampusPOIs: React.Dispatch<React.SetStateAction<POI[]>>;
    setPagesList: React.Dispatch<React.SetStateAction<SitePageContent[]>>;
    setPartnersList: React.Dispatch<React.SetStateAction<SitePartner[]>>;
    setEventsList: React.Dispatch<React.SetStateAction<SiteEvent[]>>;
    setAnnouncement: React.Dispatch<React.SetStateAction<SiteAnnouncement>>;
    setNewInquiriesCount: React.Dispatch<React.SetStateAction<number>>;
    onOpenBackupModal: () => void;
}

/**
 * Contenu principal du Cockpit : une vue par onglet, rendue à la demande.
 *
 * Coquille de composition — les vues sont réparties entre `CockpitCoreTabs`
 * (pédagogie & productions) et `CockpitCmsTabs` (vitrine & exploitation).
 * Aucune donnée propre : tout est piloté par `CockpitApp`.
 */
export const CockpitTabContent: React.FC<CockpitTabContentProps> = (props) => (
    <main
        id="cockpit-main"
        tabIndex={-1}
        aria-label="Contenu du Cockpit"
        className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full overflow-y-auto focus:outline-none"
    >
        <CockpitCoreTabs {...props} />
        <CockpitCmsTabs {...props} />
    </main>
);
