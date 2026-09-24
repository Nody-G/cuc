'use client';

import { useEffect, useState } from 'react';
import {
    getPrograms,
    getTeam,
    getFilms,
    getActiveAnnouncement,
    getAllPages,
    getPartners,
    getEvents,
    getSiteSettings,
    getInquiries,
    getDisciplines,
    getCampusPOIs,
    SiteAnnouncement,
    SitePageContent,
    SitePartner,
    SiteEvent,
    SiteSettings,
    SiteInquiry,
    DEFAULT_PARTNERS,
    DEFAULT_SITE_SETTINGS,
    DEFAULT_EVENTS,
} from '@/lib/data/site-service';
import { getCurrentUserProfile } from '@/app/(admin)/admin/actions';
import { StuntProgram, Instructor, FilmCredit, Discipline } from '@/types';
import { STUNT_PROGRAMS } from '@/data/programs';
import { CUC_TEAM } from '@/data/team';
import { FILMOGRAPHY_CREDITS } from '@/data/filmography';
import { CUC_DISCIPLINES } from '@/data/disciplines';
import { CAMPUS_POIS, POI } from '@/components/ui/campus-map/campusMap.data';
import { useCockpitRealtimeSync } from './useCockpitRealtimeSync';

/**
 * Données du Cockpit : état local réactif, chargement initial Supabase
 * (copie certifiée en repli) et délégation de l'écoute Realtime au hook dédié.
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1) : la vue ne fait que
 * consommer ce contrat — plus aucun client Supabase dans le composant.
 */
export function useCockpitData() {
    const [currentUserProfile, setCurrentUserProfile] = useState<{
        id?: string;
        email?: string;
        full_name?: string | null;
        first_name?: string | null;
        last_name?: string | null;
        role?: string;
    } | null>(null);

    // Données locales réactives
    const [programs, setPrograms] = useState<StuntProgram[]>(STUNT_PROGRAMS);
    const [team, setTeam] = useState<Instructor[]>(CUC_TEAM);
    const [films, setFilms] = useState<FilmCredit[]>(FILMOGRAPHY_CREDITS);
    const [disciplines, setDisciplines] = useState<Discipline[]>(CUC_DISCIPLINES);
    const [campusPOIs, setCampusPOIs] = useState<POI[]>(CAMPUS_POIS);
    const [pagesList, setPagesList] = useState<SitePageContent[]>([]);
    const [partnersList, setPartnersList] = useState<SitePartner[]>(DEFAULT_PARTNERS);
    const [eventsList, setEventsList] = useState<SiteEvent[]>(DEFAULT_EVENTS);
    const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
    const [inquiriesList, setInquiriesList] = useState<SiteInquiry[]>([]);
    const [inquiriesCount, setInquiriesCount] = useState(3);
    const [newInquiriesCount, setNewInquiriesCount] = useState(1);
    const [announcement, setAnnouncement] = useState<SiteAnnouncement>({
        id: '',
        title: 'Inscriptions Ouvertes 2026-2027',
        message: 'Les inscriptions aux stages cascades & formations professionnelles sont ouvertes.',
        badge: 'CUC FLASH',
        link_url: '/stages-cascades-parkour-2',
        link_text: 'Découvrir les dates',
        style: 'gold',
        is_active: false,
    });
    const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'offline'>('connecting');

    // Chargement initial : profil + catalogue complet (repli : copie certifiée locale).
    useEffect(() => {
        getCurrentUserProfile().then((prof) => {
            if (prof) {
                setCurrentUserProfile(prof);
            } else if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin/login')) {
                const currentPath = window.location.pathname + window.location.search;
                const nextParam = currentPath && currentPath !== '/admin' ? `?next=${encodeURIComponent(currentPath)}` : '';
                window.location.href = `/admin/login${nextParam}`;
            }
        });

        Promise.all([
            getPrograms(),
            getTeam(),
            getFilms(),
            getActiveAnnouncement(),
            getAllPages(),
            getPartners(),
            getEvents(),
            getSiteSettings(),
            getInquiries(),
            getDisciplines(),
            getCampusPOIs(),
        ])
            .then(([p, t, f, a, pages, parts, evts, st, inqs, discs, pois]) => {
                if (p && p.length > 0) setPrograms(p);
                if (t && t.length > 0) setTeam(t);
                if (f && f.length > 0) setFilms(f);
                if (a) setAnnouncement(a);
                if (pages && pages.length > 0) setPagesList(pages);
                if (parts && parts.length > 0) setPartnersList(parts);
                if (evts && evts.length > 0) setEventsList(evts);
                if (st) setSiteSettings(st);
                if (discs && discs.length > 0) setDisciplines(discs);
                if (pois && pois.length > 0) setCampusPOIs(pois);
                if (inqs) {
                    setInquiriesList(inqs);
                    setInquiriesCount(inqs.length);
                    setNewInquiriesCount(inqs.filter((i) => i.status === 'nouveau').length);
                }
            })
            .catch((err) => {
                console.warn('[CockpitApp] sync warning:', err);
            });
    }, []);

    // Écoute Realtime (canal partagé `cockpit:all_changes`) — hook dédié.
    useCockpitRealtimeSync({
        setPrograms,
        setTeam,
        setFilms,
        setDisciplines,
        setCampusPOIs,
        setAnnouncement,
        setInquiriesList,
        setInquiriesCount,
        setNewInquiriesCount,
        setPagesList,
        setPartnersList,
        setEventsList,
        setSiteSettings,
        setRealtimeStatus,
    });

    const totalSessions = programs.reduce((acc, p) => acc + (p.nextSessions?.length || 0), 0);
    const fullSessions = programs.reduce(
        (acc, p) => acc + (p.nextSessions?.filter((s) => s.status === 'complet').length || 0),
        0
    );

    return {
        currentUserProfile,
        userRole: currentUserProfile?.role || 'admin',
        programs,
        setPrograms,
        team,
        setTeam,
        films,
        setFilms,
        disciplines,
        setDisciplines,
        campusPOIs,
        setCampusPOIs,
        pagesList,
        setPagesList,
        partnersList,
        setPartnersList,
        eventsList,
        setEventsList,
        siteSettings,
        inquiriesList,
        inquiriesCount,
        newInquiriesCount,
        setNewInquiriesCount,
        announcement,
        setAnnouncement,
        realtimeStatus,
        totalSessions,
        fullSessions,
    };
}
