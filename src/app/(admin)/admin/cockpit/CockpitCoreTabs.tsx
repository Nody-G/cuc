'use client';

import React from 'react';
import type { CockpitTabContentProps } from './CockpitTabContent';
import { DashboardView } from '../components/DashboardView';
import { DisciplinesView } from '../components/DisciplinesView';
import { CampusManagerView } from '../components/CampusManagerView';
import { SessionsView } from '../components/SessionsView';
import { TeamView } from '../components/TeamView';
import { FilmsView } from '../components/FilmsView';

/**
 * Onglets « cœur métier » : tableau de bord, disciplines, campus, sessions,
 * équipe, films. Composant de présentation — données et mutations via props.
 */
export const CockpitCoreTabs: React.FC<CockpitTabContentProps> = (props) => (
    <>
        {/* 1. TABLEAU DE BORD */}
        {props.activeTab === 'dashboard' && (
            <DashboardView
                switchTab={props.switchTab}
                teamLength={props.team.length}
                filmsLength={props.films.length}
                partnersLength={props.partnersList.length}
                totalSessions={props.totalSessions}
                fullSessions={props.fullSessions}
                siteSettings={props.siteSettings}
                inquiriesCount={props.inquiriesCount}
                onOpenBackupModal={props.onOpenBackupModal}
            />
        )}

        {/* 2. DISCIPLINES & MODULES (10 MODULES) */}
        {props.activeTab === 'disciplines' && (
            <DisciplinesView
                disciplines={props.disciplines}
                setDisciplines={props.setDisciplines}
                team={props.team}
                campusPOIs={props.campusPOIs}
                films={props.films}
                programs={props.programs}
                showToast={props.showToast}
            />
        )}

        {/* 3. CAMPUS & INSTALLATIONS (PLAN 3D + BÂTIMENTS & ZONES) */}
        {(props.activeTab === 'campus' || props.activeTab === 'campus-3d') && (
            <CampusManagerView
                activeSubTab={props.activeTab === 'campus' ? 'zones' : '3d'}
                campusPOIs={props.campusPOIs}
                setCampusPOIs={props.setCampusPOIs}
                disciplines={props.disciplines}
                showToast={props.showToast}
                onSubTabChange={(sub) => props.switchTab(sub === 'zones' ? 'campus' : 'campus-3d')}
            />
        )}

        {/* 4. SESSIONS & STAGES */}
        {props.activeTab === 'sessions' && (
            <SessionsView
                programs={props.programs}
                setPrograms={props.setPrograms}
                inquiries={props.inquiriesList}
                showToast={props.showToast}
            />
        )}

        {/* 5. ÉQUIPE & COACHS */}
        {props.activeTab === 'team' && (
            <TeamView
                team={props.team}
                setTeam={props.setTeam}
                films={props.films}
                disciplines={props.disciplines}
                showToast={props.showToast}
            />
        )}

        {/* 6. FILMOGRAPHIE */}
        {props.activeTab === 'films' && (
            <FilmsView
                films={props.films}
                setFilms={props.setFilms}
                team={props.team}
                disciplines={props.disciplines}
                showToast={props.showToast}
                initialFilmId={props.initialFilmId}
                onInitialFilmHandled={props.onInitialFilmHandled}
            />
        )}
    </>
);
