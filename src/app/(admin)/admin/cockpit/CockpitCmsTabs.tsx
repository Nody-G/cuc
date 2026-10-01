'use client';

import React, { useState } from 'react';
import type { CockpitTabContentProps } from './CockpitTabContent';
import { getHubForTab, type TabType } from './cockpit-nav';
import { TranslationsView } from '../components/TranslationsView';
import { MicrocopyView } from '../components/MicrocopyView';
import { PagesEditorView } from '../components/PagesEditorView';
import { NavigationView } from '../components/NavigationView';
import { MediaLibraryView } from '../components/MediaLibraryView';
import { EventsView } from '../components/EventsView';
import { PartnersView } from '../components/PartnersView';
import { UsersRolesView } from '../components/UsersRolesView';
import { ContentHealthView } from '../components/ContentHealthView';
import { InquiriesView } from '../components/InquiriesView';
import { InstagramMonitorView } from '../components/InstagramMonitorView';
import { HelpView } from '../components/HelpView';
import { ChromeHub } from '../components/cockpit-hubs/ChromeHub';
import { JournalHub } from '../components/cockpit-hubs/JournalHub';
import { AudienceHub } from '../components/cockpit-hubs/AudienceHub';

/**
 * Onglets « vitrine & exploitation » : i18n, CMS de pages, navigation,
 * médiathèque, events, partenaires, utilisateurs, santé du contenu,
 * candidatures, Instagram, aide — plus les trois hubs (Chrome, Journal,
 * Audience) qui regroupent leurs écrans sous des sous-onglets.
 */
export const CockpitCmsTabs: React.FC<CockpitTabContentProps> = (props) => {
    /**
     * Interconnexion « Pages du Site » ↔ « Menu du Site ».
     *
     * Chaque écran peut demander à l'autre d'ouvrir une page précise. Les vues
     * étant montées à la demande, la valeur mémorisée sert d'état initial au
     * moment où l'onglet visé s'ouvre — aucun couplage direct entre les deux.
     */
    const [pageToEdit, setPageToEdit] = useState<string | null>(null);
    const [pageToLocateInMenu, setPageToLocateInMenu] = useState<string | null>(null);

    const openPageEditor = (slug: string) => {
        setPageToEdit(slug);
        props.switchTab('pages');
    };

    const openPageInMenu = (pageKey: string) => {
        setPageToLocateInMenu(pageKey);
        props.switchTab('navigation');
    };

    // Hub concerné par l'onglet actif (ou `undefined`) : une entrée historique
    // (`analytics`, `traffic`, `logs`, `audit`, `announcements`, `footer`,
    // `social`, `settings`) route vers le même hub que son onglet agrégateur.
    const activeHub = getHubForTab(props.activeTab);

    return (
        <>
            {/* HUB CHROME — Bandeau, Bas de Page, Réseaux Sociaux, Coordonnées */}
            {activeHub?.id === 'chrome' && (
                <ChromeHub
                    activeTab={props.activeTab}
                    switchTab={props.switchTab}
                    showToast={props.showToast}
                    announcement={props.announcement}
                    setAnnouncement={props.setAnnouncement}
                    siteSettings={props.siteSettings}
                />
            )}

            {/* 7bis. TRADUCTIONS EN (i18n) */}
            {props.activeTab === 'translations' && <TranslationsView showToast={props.showToast} />}

            {/* 7ter. MICRO-TEXTES DU SITE (surcharges du catalogue i18n) */}
            {props.activeTab === 'microcopy' && <MicrocopyView showToast={props.showToast} />}

            {/* 8. CMS ÉDITEUR DE PAGES */}
            {props.activeTab === 'pages' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                    <PagesEditorView
                        pages={props.pagesList}
                        onPageSaved={(updated) => {
                            props.setPagesList((prev) =>
                                prev.map((p) => (p.slug === updated.slug ? updated : p))
                            );
                        }}
                        showToast={props.showToast}
                        initialSlug={pageToEdit}
                        onOpenMenu={openPageInMenu}
                    />
                </div>
            )}

            {/* 9. NAVIGATION & MENUS */}
            {props.activeTab === 'navigation' && (
                <NavigationView
                    showToast={props.showToast}
                    pages={props.pagesList}
                    focusSlug={pageToLocateInMenu}
                    onEditPage={openPageEditor}
                />
            )}

            {/* MÉDIATHÈQUE STORAGE */}
            {props.activeTab === 'media' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                    <MediaLibraryView showToast={props.showToast} />
                </div>
            )}

            {/* 13. PRESTATIONS EVENTS */}
            {props.activeTab === 'events' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                    <EventsView
                        events={props.eventsList}
                        onEventSaved={(saved) => {
                            props.setEventsList((prev) =>
                                prev.some((e) => e.id === saved.id)
                                    ? prev.map((e) => (e.id === saved.id ? saved : e))
                                    : [...prev, saved]
                            );
                        }}
                        onEventDeleted={(id) => {
                            props.setEventsList((prev) => prev.filter((e) => e.id !== id));
                        }}
                        showToast={props.showToast}
                    />
                </div>
            )}

            {/* 14. PARTENAIRES */}
            {props.activeTab === 'partners' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                    <PartnersView
                        partners={props.partnersList}
                        onPartnerSaved={(saved) => {
                            props.setPartnersList((prev) =>
                                prev.some((p) => p.id === saved.id)
                                    ? prev.map((p) => (p.id === saved.id ? saved : p))
                                    : [...prev, saved]
                            );
                        }}
                        onPartnerDeleted={(id) => {
                            props.setPartnersList((prev) => prev.filter((p) => p.id !== id));
                        }}
                        showToast={props.showToast}
                    />
                </div>
            )}

            {/* COMPTES & ACCÈS (UTILISATEURS & RÔLES) */}
            {props.activeTab === 'users' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                    <UsersRolesView
                        showToast={props.showToast}
                        currentUserRole={props.userRole}
                        currentUserId={props.currentUserId}
                    />
                </div>
            )}

            {/* HUB JOURNAL — Activité + Journal d'Audit (/admin/journal, /admin/audit) */}
            {activeHub?.id === 'journal' && (
                <JournalHub
                    activeTab={props.activeTab}
                    switchTab={props.switchTab}
                    showToast={props.showToast}
                />
            )}

            {/* 18. DIAGNOSTIC DE SANTÉ DU CONTENU */}
            {props.activeTab === 'health' && (
                <ContentHealthView
                    pages={props.pagesList}
                    showToast={props.showToast}
                    onNavigateToTab={(tab) => props.switchTab(tab as TabType)}
                />
            )}

            {/* CANDIDATURES & DEMANDES DE CONTACT */}
            {props.activeTab === 'inquiries' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                    <InquiriesView
                        showToast={props.showToast}
                        onInquiriesCountChange={(count) => props.setNewInquiriesCount(count)}
                        programs={props.programs}
                    />
                </div>
            )}

            {/* 21. MONITORING INSTAGRAM TEMPS RÉEL & LEADERBOARD */}
            {props.activeTab === 'instagram' && (
                <InstagramMonitorView showToast={props.showToast} />
            )}

            {/* HUB AUDIENCE — Statistiques & Conversion + Visites (/admin/analytics, /admin/visites) */}
            {activeHub?.id === 'audience' && (
                <AudienceHub
                    activeTab={props.activeTab}
                    switchTab={props.switchTab}
                    showToast={props.showToast}
                    programs={props.programs}
                    pages={props.pagesList}
                />
            )}

            {/* 23. AIDE & GUIDE — la pédagogie de l'application, centralisée */}
            {props.activeTab === 'help' && <HelpView />}
        </>
    );
};
