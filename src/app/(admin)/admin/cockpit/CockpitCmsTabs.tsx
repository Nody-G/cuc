'use client';

import React from 'react';
import type { CockpitTabContentProps } from './CockpitTabContent';
import type { TabType } from './cockpit-nav';
import { AnnouncementsView } from '../components/AnnouncementsView';
import { TranslationsView } from '../components/TranslationsView';
import { MicrocopyView } from '../components/MicrocopyView';
import { PagesEditorView } from '../components/PagesEditorView';
import { NavigationView } from '../components/NavigationView';
import { FooterView } from '../components/FooterView';
import { SocialLinksView } from '../components/SocialLinksView';
import { MediaLibraryView } from '../components/MediaLibraryView';
import { EventsView } from '../components/EventsView';
import { PartnersView } from '../components/PartnersView';
import { SettingsView } from '../components/SettingsView';
import { UsersRolesView } from '../components/UsersRolesView';
import { AuditLogView } from '../components/AuditLogView';
import { ContentHealthView } from '../components/ContentHealthView';
import { AnalyticsView } from '../components/AnalyticsView';
import { InquiriesView } from '../components/InquiriesView';

/**
 * Onglets « vitrine & exploitation » : bandeau flash, i18n, CMS de pages,
 * navigation, réseaux, médiathèque, events, partenaires, réglages,
 * utilisateurs, audit, santé, analytique, candidatures.
 */
export const CockpitCmsTabs: React.FC<CockpitTabContentProps> = (props) => (
    <>
        {/* 7. BANDEAU FLASH */}
        {props.activeTab === 'announcements' && (
            <AnnouncementsView
                announcement={props.announcement}
                setAnnouncement={props.setAnnouncement}
                showToast={props.showToast}
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
                />
            </div>
        )}

        {/* 9. NAVIGATION & MENUS */}
        {props.activeTab === 'navigation' && <NavigationView showToast={props.showToast} />}

        {/* 10. PIED DE PAGE */}
        {props.activeTab === 'footer' && <FooterView showToast={props.showToast} />}

        {/* 11. RÉSEAUX SOCIAUX */}
        {props.activeTab === 'social' && <SocialLinksView showToast={props.showToast} />}

        {/* 12. MÉDIATHÈQUE STORAGE */}
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

        {/* 15. PARAMÈTRES GLOBAUX */}
        {props.activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-200">
                <SettingsView initialSettings={props.siteSettings} onNavigateToTab={props.switchTab} />
            </div>
        )}

        {/* 16. UTILISATEURS & RÔLES */}
        {props.activeTab === 'users' && (
            <div className="space-y-6 animate-in fade-in duration-200">
                <UsersRolesView
                    showToast={props.showToast}
                    currentUserRole={props.userRole}
                />
            </div>
        )}

        {/* 17. JOURNAL D'AUDIT */}
        {props.activeTab === 'audit' && <AuditLogView showToast={props.showToast} />}

        {/* 18. DIAGNOSTIC DE SANTÉ DU CONTENU */}
        {props.activeTab === 'health' && (
            <ContentHealthView
                pages={props.pagesList}
                showToast={props.showToast}
                onNavigateToTab={(tab) => props.switchTab(tab as TabType)}
            />
        )}

        {/* 19. TABLEAU DE BORD ANALYTIQUE */}
        {props.activeTab === 'analytics' && (
            <AnalyticsView programs={props.programs} pages={props.pagesList} showToast={props.showToast} />
        )}

        {/* 20. CANDIDATURES & DEMANDES DE CONTACT */}
        {props.activeTab === 'inquiries' && (
            <div className="space-y-6 animate-in fade-in duration-200">
                <InquiriesView
                    showToast={props.showToast}
                    onInquiriesCountChange={(count) => props.setNewInquiriesCount(count)}
                    programs={props.programs}
                />
            </div>
        )}
    </>
);
