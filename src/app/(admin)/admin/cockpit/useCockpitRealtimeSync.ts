'use client';

import React, { useEffect } from 'react';
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
    type SiteAnnouncement,
    type SitePageContent,
    type SitePartner,
    type SiteEvent,
    type SiteSettings,
    type SiteInquiry,
} from '@/lib/data/site-service';
import { syncSessionsSeatCountsFromCucSign } from '@/app/(admin)/admin/actions';
import type { StuntProgram, Instructor, FilmCredit, Discipline } from '@/types';
import type { POI } from '@/components/ui/campus-map/campusMap.data';
import { createClient } from '@/lib/supabase/client';
import { createSafeChannel, removeSafeChannel } from '@/lib/supabase/realtime';

export interface CockpitRealtimeSetters {
    setPrograms: React.Dispatch<React.SetStateAction<StuntProgram[]>>;
    setTeam: React.Dispatch<React.SetStateAction<Instructor[]>>;
    setFilms: React.Dispatch<React.SetStateAction<FilmCredit[]>>;
    setDisciplines: React.Dispatch<React.SetStateAction<Discipline[]>>;
    setCampusPOIs: React.Dispatch<React.SetStateAction<POI[]>>;
    setAnnouncement: React.Dispatch<React.SetStateAction<SiteAnnouncement>>;
    setInquiriesList: React.Dispatch<React.SetStateAction<SiteInquiry[]>>;
    setInquiriesCount: React.Dispatch<React.SetStateAction<number>>;
    setNewInquiriesCount: React.Dispatch<React.SetStateAction<number>>;
    setPagesList: React.Dispatch<React.SetStateAction<SitePageContent[]>>;
    setPartnersList: React.Dispatch<React.SetStateAction<SitePartner[]>>;
    setEventsList: React.Dispatch<React.SetStateAction<SiteEvent[]>>;
    setSiteSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
    setRealtimeStatus: React.Dispatch<React.SetStateAction<'connecting' | 'connected' | 'offline'>>;
}

/**
 * Écoute Realtime du Cockpit : un seul canal partagé `cockpit:all_changes`
 * (cf. `subscribeTable` / `createSafeChannel`) rafraîchit chaque table `site_*`
 * dans son état local, et `group_memberships` déclenche la synchronisation
 * CUC Sign des places de session.
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1) — le composant ne voit
 * ni client Supabase ni canal.
 */
export function useCockpitRealtimeSync({
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
}: CockpitRealtimeSetters) {
    useEffect(() => {
        try {
            const supabase = createClient();
            const channel = createSafeChannel(supabase, 'cockpit:all_changes', (ch) =>
                ch
                    .on(
                        'postgres_changes',
                        { event: '*', schema: 'public', table: 'site_programs' },
                        () => {
                            getPrograms().then((p) => {
                                if (p && p.length > 0) setPrograms(p);
                            });
                        }
                    )
                    .on(
                        'postgres_changes',
                        { event: '*', schema: 'public', table: 'site_sessions' },
                        () => {
                            getPrograms().then((p) => {
                                if (p && p.length > 0) setPrograms(p);
                            });
                        }
                    )
                    .on(
                        'postgres_changes',
                        { event: '*', schema: 'public', table: 'group_memberships' },
                        async () => {
                            console.log('[Realtime CUC Sign] Changement détecté dans group_memberships, auto-synchronisation...');
                            await syncSessionsSeatCountsFromCucSign();
                            const p = await getPrograms();
                            if (p && p.length > 0) setPrograms(p);
                        }
                    )
                    .on(
                        'postgres_changes',
                        { event: '*', schema: 'public', table: 'site_team' },
                        () => {
                            getTeam().then((t) => {
                                if (t && t.length > 0) setTeam(t);
                            });
                        }
                    )
                    .on(
                        'postgres_changes',
                        { event: '*', schema: 'public', table: 'site_films' },
                        () => {
                            getFilms().then((f) => {
                                if (f && f.length > 0) setFilms(f);
                            });
                        }
                    )
                    .on(
                        'postgres_changes',
                        { event: '*', schema: 'public', table: 'site_disciplines' },
                        () => {
                            getDisciplines().then((d) => {
                                if (d && d.length > 0) setDisciplines(d);
                            });
                        }
                    )
                    .on(
                        'postgres_changes',
                        { event: '*', schema: 'public', table: 'site_campus_pois' },
                        () => {
                            getCampusPOIs().then((pois) => {
                                if (pois && pois.length > 0) setCampusPOIs(pois);
                            });
                        }
                    )
                    .on(
                        'postgres_changes',
                        { event: '*', schema: 'public', table: 'site_announcements' },
                        () => {
                            getActiveAnnouncement().then((a) => {
                                if (a) setAnnouncement(a);
                            });
                        }
                    )
                    .on(
                        'postgres_changes',
                        { event: '*', schema: 'public', table: 'site_inquiries' },
                        () => {
                            getInquiries().then((inqs) => {
                                if (inqs) {
                                    setInquiriesList(inqs);
                                    setInquiriesCount(inqs.length);
                                    setNewInquiriesCount(inqs.filter((i) => i.status === 'nouveau').length);
                                }
                            });
                        }
                    )
                    .on(
                        'postgres_changes',
                        { event: '*', schema: 'public', table: 'site_pages' },
                        () => {
                            getAllPages().then((pgs) => {
                                if (pgs && pgs.length > 0) setPagesList(pgs);
                            });
                        }
                    )
                    .on(
                        'postgres_changes',
                        { event: '*', schema: 'public', table: 'site_partners' },
                        () => {
                            getPartners().then((pts) => {
                                if (pts && pts.length > 0) setPartnersList(pts);
                            });
                        }
                    )
                    .on(
                        'postgres_changes',
                        { event: '*', schema: 'public', table: 'site_events' },
                        () => {
                            getEvents().then((evs) => {
                                if (evs && evs.length > 0) setEventsList(evs);
                            });
                        }
                    )
                    .on(
                        'postgres_changes',
                        { event: '*', schema: 'public', table: 'site_settings' },
                        () => {
                            getSiteSettings().then((st) => {
                                if (st) setSiteSettings(st);
                            });
                            getDisciplines().then((d) => {
                                if (d && d.length > 0) setDisciplines(d);
                            });
                            getCampusPOIs().then((pois) => {
                                if (pois && pois.length > 0) setCampusPOIs(pois);
                            });
                        }
                    )
            );

            if (channel) {
                channel.subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        setRealtimeStatus('connected');
                    } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                        setRealtimeStatus('offline');
                    }
                });
            } else {
                queueMicrotask(() => setRealtimeStatus('offline'));
            }

            return () => {
                removeSafeChannel(supabase, channel);
            };
        } catch {
            queueMicrotask(() => setRealtimeStatus('offline'));
        }
        // Les setters d'état sont stables (useState) : la souscription ne se rejoue pas.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
