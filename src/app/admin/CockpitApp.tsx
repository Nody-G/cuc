'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Users,
  Film,
  Bell,
  LayoutDashboard,
  Globe,
  Shield,
  LogOut,
  FileText,
  Image as ImageIcon,
  Handshake,
  Sparkles,
  Settings,
  Inbox,
  Database,
  Search,
  Activity,
  Command,
  Compass,
  Menu,
  PanelBottom,
  Share2,
  Sun,
  Moon,
  Stethoscope,
  BarChart3,
  Boxes,
} from 'lucide-react';
import { CockpitThemeProvider, useCockpitTheme } from './components/ui/CockpitThemeProvider';
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
import { getCurrentUserProfile, syncSessionsSeatCountsFromCucSign } from '@/app/admin/actions';
import { StuntProgram, Instructor, FilmCredit, Discipline } from '@/types';
import { STUNT_PROGRAMS } from '@/data/programs';
import { CUC_TEAM } from '@/data/team';
import { FILMOGRAPHY_CREDITS } from '@/data/filmography';
import { CUC_DISCIPLINES } from '@/data/disciplines';
import { CAMPUS_POIS, POI } from '@/components/ui/campus-map/campusMap.data';
import { ToastProvider, useToast } from './components/ui/ToastProvider';
import { ShortcutsHelpModal } from './components/ShortcutsHelpModal';
import { createClient } from '@/lib/supabase/client';
import { createSafeChannel, removeSafeChannel } from '@/lib/supabase/realtime';

// Composants modulaires du Cockpit
import { DashboardView } from './components/DashboardView';
import { SessionsView } from './components/SessionsView';
import { TeamView } from './components/TeamView';
import { FilmsView } from './components/FilmsView';
import { DisciplinesView } from './components/DisciplinesView';
import { CampusZonesView } from './components/CampusZonesView';
import { CampusPlan3DView } from './components/CampusPlan3DView';
import { AnnouncementsView } from './components/AnnouncementsView';
import { PagesEditorView } from './components/PagesEditorView';
import { MediaLibraryView } from './components/MediaLibraryView';
import { PartnersView } from './components/PartnersView';
import { EventsView } from './components/EventsView';
import { SettingsView } from './components/SettingsView';
import { UsersRolesView } from './components/UsersRolesView';
import { InquiriesView } from './components/InquiriesView';
import { NavigationView } from './components/NavigationView';
import { FooterView } from './components/FooterView';
import { SocialLinksView } from './components/SocialLinksView';
import { AuditLogView } from './components/AuditLogView';
import { ContentHealthView } from './components/ContentHealthView';
import { AnalyticsView } from './components/AnalyticsView';
import { CockpitSidebar } from './components/CockpitSidebar';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { CommandPalette } from './components/CommandPalette';
import { SystemHealthModal } from './components/SystemHealthModal';

export type TabType =
  | 'dashboard'
  | 'inquiries'
  | 'pages'
  | 'navigation'
  | 'footer'
  | 'social'
  | 'disciplines'
  | 'campus'
  | 'campus-3d'
  | 'sessions'
  | 'team'
  | 'films'
  | 'partners'
  | 'events'
  | 'media'
  | 'announcements'
  | 'users'
  | 'audit'
  | 'health'
  | 'analytics'
  | 'settings';

interface CockpitAppProps {
  initialTab?: TabType;
}

/**
 * Source de vérité unique de la correspondance onglet ↔ segment d'URL.
 * Toute vue du Cockpit doit y figurer afin que le deep-linking, le bouton
 * Précédent/Suivant et le rafraîchissement direct d'une URL restent cohérents.
 */
const TAB_ROUTES: ReadonlyArray<{ tab: TabType; segment: string }> = [
  { tab: 'inquiries', segment: 'inquiries' },
  { tab: 'pages', segment: 'pages' },
  { tab: 'navigation', segment: 'navigation' },
  { tab: 'footer', segment: 'footer' },
  { tab: 'social', segment: 'social' },
  { tab: 'disciplines', segment: 'disciplines' },
  { tab: 'campus', segment: 'campus' },
  { tab: 'campus-3d', segment: 'campus-3d' },
  { tab: 'sessions', segment: 'sessions' },
  { tab: 'team', segment: 'team' },
  { tab: 'films', segment: 'films' },
  { tab: 'partners', segment: 'partners' },
  { tab: 'events', segment: 'events' },
  { tab: 'media', segment: 'media' },
  { tab: 'announcements', segment: 'announcements' },
  { tab: 'users', segment: 'users' },
  { tab: 'audit', segment: 'audit' },
  { tab: 'health', segment: 'health' },
  { tab: 'analytics', segment: 'analytics' },
  { tab: 'settings', segment: 'settings' },
];

/** Résout un chemin d'URL vers l'onglet correspondant (ou `null` si inconnu). */
function resolveTabFromPath(path: string): TabType | null {
  const match = TAB_ROUTES.find(({ segment }) => path.includes(`/${segment}`));
  return match ? match.tab : null;
}

const CockpitAppInner: React.FC<CockpitAppProps> = ({ initialTab = 'dashboard' }) => {
  const { theme, toggleTheme } = useCockpitTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  const getTabFromPath = (): TabType => {
    if (typeof window !== 'undefined') {
      const resolved = resolveTabFromPath(window.location.pathname);
      if (resolved) return resolved;
    }
    return resolveTabFromPath(pathname) ?? initialTab;
  };

  const [activeTab, setActiveTab] = useState<TabType>(getTabFromPath());
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
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
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

  // Synchronisation des données Supabase et écoute Realtime en direct
  useEffect(() => {
    getCurrentUserProfile().then((prof) => {
      if (prof) setCurrentUserProfile(prof);
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
  }, []);

  // Prise en charge des raccourcis clavier globaux
  const switchTab = useCallback((tab: TabType) => {
    setActiveTab(tab);
    const targetUrl = tab === 'dashboard' ? '/admin' : `/admin/${tab}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState(null, '', targetUrl);
    }
  }, []);

  useEffect(() => {
    const QUICK_TABS: TabType[] = [
      'dashboard',
      'inquiries',
      'pages',
      'sessions',
      'team',
      'films',
    ];

    const isTypingTarget = (target: EventTarget | null): boolean => {
      const el = target as HTMLElement | null;
      if (!el) return false;
      const tag = el.tagName;
      return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        el.isContentEditable === true
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // Ctrl/Cmd + K : palette de commandes
      if (mod && key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Ctrl/Cmd + / : aide des raccourcis
      if (mod && (e.key === '/' || e.key === '?')) {
        e.preventDefault();
        setIsShortcutsHelpOpen((prev) => !prev);
        return;
      }

      // Ctrl/Cmd + B : replier/déplier la navigation latérale
      if (mod && key === 'b' && !e.shiftKey) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('cuc:cockpit:toggle-sidebar'));
        return;
      }

      // Ctrl/Cmd + Shift + B : sauvegarde / restauration
      if (mod && e.shiftKey && key === 'b') {
        e.preventDefault();
        setIsBackupModalOpen(true);
        return;
      }

      // Ctrl/Cmd + Shift + H : diagnostic système
      if (mod && e.shiftKey && key === 'h') {
        e.preventDefault();
        setIsHealthModalOpen(true);
        return;
      }

      // Alt + 1..6 : navigation rapide entre les onglets principaux
      if (e.altKey && !mod && !e.shiftKey) {
        const digit = Number.parseInt(e.key, 10);
        if (!Number.isNaN(digit) && digit >= 1 && digit <= QUICK_TABS.length) {
          e.preventDefault();
          switchTab(QUICK_TABS[digit - 1]);
          return;
        }
      }

      // Échap : fermer la fenêtre active (hors saisie de texte)
      if (e.key === 'Escape' && !isTypingTarget(e.target)) {
        if (isCommandPaletteOpen) {
          setIsCommandPaletteOpen(false);
        } else if (isShortcutsHelpOpen) {
          setIsShortcutsHelpOpen(false);
        } else if (isBackupModalOpen) {
          setIsBackupModalOpen(false);
        } else if (isHealthModalOpen) {
          setIsHealthModalOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, isShortcutsHelpOpen, isBackupModalOpen, isHealthModalOpen, switchTab]);

  // Prise en charge des boutons Précédent/Suivant du navigateur
  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(resolveTabFromPath(window.location.pathname) ?? 'dashboard');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/admin/login');
    } catch {
      router.push('/admin/login');
    }
  };

  const totalSessions = programs.reduce((acc, p) => acc + (p.nextSessions?.length || 0), 0);
  const fullSessions = programs.reduce(
    (acc, p) => acc + (p.nextSessions?.filter((s) => s.status === 'complet').length || 0),
    0
  );

  const userRole = currentUserProfile?.role || 'admin';
  const isDirecteurOrAdmin = ['directeur', 'admin'].includes(userRole);
  const isSecretaire = userRole === 'secretaire';
  const isCoach = userRole === 'coach';

  const navSections = [
    {
      title: "Vue d'ensemble",
      items: [
        { id: 'dashboard' as TabType, label: 'Tableau de Bord', icon: LayoutDashboard },
        {
          id: 'inquiries' as TabType,
          label: 'Candidatures & Devis',
          icon: Inbox,
          badge: newInquiriesCount > 0 ? `${newInquiriesCount} new` : undefined,
        },
        ...(isDirecteurOrAdmin
          ? [{ id: 'analytics' as TabType, label: 'Analytique', icon: BarChart3 }]
          : []),
      ],
    },
    ...(!isCoach
      ? [
        {
          title: "CMS & Vitrine",
          items: [
            {
              id: 'pages' as TabType,
              label: 'Éditeur de Pages & Structure',
              icon: FileText,
              badge: '15',
            },
            {
              id: 'navigation' as TabType,
              label: 'Navigation & Menus',
              icon: Menu,
            },
            {
              id: 'footer' as TabType,
              label: 'Pied de Page',
              icon: PanelBottom,
            },
            {
              id: 'social' as TabType,
              label: 'Réseaux Sociaux',
              icon: Share2,
            },
            {
              id: 'media' as TabType,
              label: 'Médiathèque Storage',
              icon: ImageIcon,
              badge: 'CDN',
            },
          ],
        },
      ]
      : []),
    {
      title: "Pédagogie & Campus",
      items: [
        {
          id: 'disciplines' as TabType,
          label: 'Modules & Disciplines',
          icon: Shield,
          badge: '10 Disciplines',
        },
        {
          id: 'campus' as TabType,
          label: 'Infrastructures (6 Ha)',
          icon: Compass,
          badge: 'Radar',
        },
        {
          id: 'campus-3d' as TabType,
          label: 'Plan 3D du Campus',
          icon: Boxes,
          badge: 'Studio',
        },
      ],
    },
    {
      title: isCoach ? "Mes Activités" : "Contenus Spécifiques",
      items: [
        {
          id: 'sessions' as TabType,
          label: isCoach ? 'Sessions Encadrées' : 'Sessions & Stages',
          icon: Calendar,
        },
        ...(!isSecretaire
          ? [
            {
              id: 'team' as TabType,
              label: isCoach ? 'Ma Fiche Formateur' : 'Équipe & Coachs',
              icon: Users,
            },
            {
              id: 'films' as TabType,
              label: isCoach ? 'Mes Films & Crédits' : 'Filmographie',
              icon: Film,
            },
          ]
          : []),
        ...(isDirecteurOrAdmin
          ? [
            { id: 'events' as TabType, label: 'Prestations Events', icon: Sparkles },
            { id: 'partners' as TabType, label: 'Partenaires & Labels', icon: Handshake },
          ]
          : []),
      ],
    },
    ...(!isCoach
      ? [
        {
          title: "Configuration",
          items: [
            {
              id: 'announcements' as TabType,
              label: 'Bandeau Flash',
              icon: Bell,
              badge: announcement.is_active ? 'Live' : undefined,
            },
            ...(isDirecteurOrAdmin
              ? [
                { id: 'users' as TabType, label: 'Utilisateurs & Rôles', icon: Shield },
                { id: 'audit' as TabType, label: 'Journal d’Audit', icon: Activity },
                { id: 'health' as TabType, label: 'Diagnostic de Contenu', icon: Stethoscope },
                { id: 'settings' as TabType, label: 'Paramètres Globaux', icon: Settings },
              ]
              : []),
          ],
        },
      ]
      : []),
  ];

  return (
    <div
      data-cockpit-root
      className="min-h-screen bg-[#070709] text-gray-100 flex flex-col md:flex-row antialiased"
    >
      {/* Lien d'évitement (WCAG 2.2 — 2.4.1) */}
      <a
        href="#cockpit-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[#FFE500] focus:text-black focus:text-xs focus:font-black focus:uppercase focus:tracking-wider"
      >
        Aller au contenu principal
      </a>

      {/* Sidebar latérale (groupes repliables, recherche, favoris, tiroir mobile) */}
      <CockpitSidebar
        navSections={navSections}
        activeTab={activeTab}
        onSelectTab={switchTab}
        userRole={userRole}
        realtimeStatus={realtimeStatus === 'connected' ? 'connected' : 'connecting'}
        userName={
          currentUserProfile?.full_name ||
          [currentUserProfile?.first_name, currentUserProfile?.last_name].filter(Boolean).join(' ') ||
          'Admin CUC'
        }
        onLogout={handleLogout}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Contenu principal avec Barre Supérieure d'accès rapide */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Barre Supérieure du Cockpit */}
        <header className="h-14 border-b border-white/10 bg-[#0D0D12]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 z-10">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Ouvrir le menu du Cockpit"
              className="md:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors shrink-0"
            >
              <Menu className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 text-xs transition-colors cursor-pointer w-full sm:w-72 justify-between"
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 text-[#FFE500]" />
                <span className="truncate">Recherche rapide...</span>
              </div>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[10px] font-mono text-gray-400">
                <Command className="w-2.5 h-2.5" /> K
              </kbd>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsHealthModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-gray-300 hover:text-white transition-colors cursor-pointer"
                title="Ouvrir le Diagnostic Système"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="hidden sm:inline text-[11px]">Système</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </button>

              <button
                type="button"
                onClick={() => setIsBackupModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-gray-300 hover:text-white transition-colors cursor-pointer"
                title="Sauvegardes & Restauration"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px]">Backups</span>
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                title={theme === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre'}
                aria-label={theme === 'dark' ? 'Activer le thème clair' : 'Activer le thème sombre'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-3.5 h-3.5" />
                ) : (
                  <Moon className="w-3.5 h-3.5" />
                )}
              </button>

              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FFE500]/10 hover:bg-[#FFE500]/20 border border-[#FFE500]/30 text-xs font-medium text-[#FFE500] transition-colors"
                title="Voir le site vitrine en direct"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Site vitrine ↗</span>
              </Link>
            </div>
          </div>
        </header>

        <main
          id="cockpit-main"
          tabIndex={-1}
          aria-label="Contenu du Cockpit"
          className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full overflow-y-auto focus:outline-none"
        >
          {/* 1. TABLEAU DE BORD */}
          {activeTab === 'dashboard' && (
            <DashboardView
              switchTab={switchTab}
              teamLength={team.length}
              filmsLength={films.length}
              eventsLength={eventsList.length}
              partnersLength={partnersList.length}
              totalSessions={totalSessions}
              fullSessions={fullSessions}
              siteSettings={siteSettings}
              inquiriesCount={inquiriesCount}
              newInquiriesCount={newInquiriesCount}
              onOpenBackupModal={() => setIsBackupModalOpen(true)}
            />
          )}

          {/* 2. DISCIPLINES & MODULES (10 MODULES) */}
          {activeTab === 'disciplines' && (
            <DisciplinesView
              disciplines={disciplines}
              setDisciplines={setDisciplines}
              team={team}
              campusPOIs={campusPOIs}
              films={films}
              programs={programs}
              showToast={showToast}
            />
          )}

          {/* 3. INFRASTRUCTURES & ZONES CAMPUS (6 HA) */}
          {activeTab === 'campus' && (
            <CampusZonesView
              campusPOIs={campusPOIs}
              setCampusPOIs={setCampusPOIs}
              disciplines={disciplines}
              showToast={showToast}
            />
          )}

          {/* 3bis. PLAN 3D DU CAMPUS (STUDIO DE PLACEMENT) */}
          {activeTab === 'campus-3d' && (
            <CampusPlan3DView />
          )}

          {/* 4. SESSIONS & STAGES */}
          {activeTab === 'sessions' && (
            <SessionsView
              programs={programs}
              setPrograms={setPrograms}
              inquiries={inquiriesList}
              showToast={showToast}
            />
          )}

          {/* 5. ÉQUIPE & COACHS */}
          {activeTab === 'team' && (
            <TeamView
              team={team}
              setTeam={setTeam}
              films={films}
              disciplines={disciplines}
              showToast={showToast}
            />
          )}

          {/* 6. FILMOGRAPHIE */}
          {activeTab === 'films' && (
            <FilmsView
              films={films}
              setFilms={setFilms}
              team={team}
              disciplines={disciplines}
              showToast={showToast}
            />
          )}

          {/* 7. BANDEAU FLASH */}
          {activeTab === 'announcements' && (
            <AnnouncementsView
              announcement={announcement}
              setAnnouncement={setAnnouncement}
              showToast={showToast}
            />
          )}

          {/* 8. CMS ÉDITEUR DE PAGES */}
          {activeTab === 'pages' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <PagesEditorView
                pages={pagesList}
                onPageSaved={(updated) => {
                  setPagesList((prev) =>
                    prev.map((p) => (p.slug === updated.slug ? updated : p))
                  );
                }}
                showToast={showToast}
              />
            </div>
          )}

          {/* 9. NAVIGATION & MENUS */}
          {activeTab === 'navigation' && <NavigationView showToast={showToast} />}

          {/* 10. PIED DE PAGE */}
          {activeTab === 'footer' && <FooterView showToast={showToast} />}

          {/* 11. RÉSEAUX SOCIAUX */}
          {activeTab === 'social' && <SocialLinksView showToast={showToast} />}

          {/* 12. MÉDIATHÈQUE STORAGE */}
          {activeTab === 'media' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <MediaLibraryView showToast={showToast} />
            </div>
          )}

          {/* 13. PRESTATIONS EVENTS */}
          {activeTab === 'events' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <EventsView
                events={eventsList}
                onEventSaved={(saved) => {
                  setEventsList((prev) =>
                    prev.some((e) => e.id === saved.id)
                      ? prev.map((e) => (e.id === saved.id ? saved : e))
                      : [...prev, saved]
                  );
                }}
                onEventDeleted={(id) => {
                  setEventsList((prev) => prev.filter((e) => e.id !== id));
                }}
                showToast={showToast}
              />
            </div>
          )}

          {/* 14. PARTENAIRES */}
          {activeTab === 'partners' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <PartnersView
                partners={partnersList}
                onPartnerSaved={(saved) => {
                  setPartnersList((prev) =>
                    prev.some((p) => p.id === saved.id)
                      ? prev.map((p) => (p.id === saved.id ? saved : p))
                      : [...prev, saved]
                  );
                }}
                onPartnerDeleted={(id) => {
                  setPartnersList((prev) => prev.filter((p) => p.id !== id));
                }}
                showToast={showToast}
              />
            </div>
          )}

          {/* 15. PARAMÈTRES GLOBAUX */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <SettingsView initialSettings={siteSettings} onNavigateToTab={switchTab} />
            </div>
          )}

          {/* 16. UTILISATEURS & RÔLES */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <UsersRolesView
                showToast={showToast}
                currentUserRole={userRole}
              />
            </div>
          )}

          {/* 17. JOURNAL D'AUDIT */}
          {activeTab === 'audit' && (
            <AuditLogView showToast={showToast} />
          )}

          {/* 18. DIAGNOSTIC DE SANTÉ DU CONTENU */}
          {activeTab === 'health' && (
            <ContentHealthView
              pages={pagesList}
              showToast={showToast}
              onNavigateToTab={(tab) => switchTab(tab as TabType)}
            />
          )}

          {/* 19. TABLEAU DE BORD ANALYTIQUE */}
          {activeTab === 'analytics' && (
            <AnalyticsView programs={programs} pages={pagesList} showToast={showToast} />
          )}

          {/* 20. CANDIDATURES & DEMANDES DE CONTACT */}
          {activeTab === 'inquiries' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <InquiriesView
                showToast={showToast}
                onInquiriesCountChange={(count) => setNewInquiriesCount(count)}
                programs={programs}
              />
            </div>
          )}
        </main>
      </div>

      {/* Modale de Sauvegarde et Restauration Intégrale */}
      <BackupRestoreModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        showToast={showToast}
        onRestored={() => {
          showToast('Données restaurées avec succès !');
          window.location.reload();
        }}
      />

      {/* Palette de Commandes Universelle (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={switchTab}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        onOpenHealth={() => setIsHealthModalOpen(true)}
      />

      {/* Diagnostic & Santé Système */}
      {/* Aide des raccourcis clavier */}
      <ShortcutsHelpModal
        isOpen={isShortcutsHelpOpen}
        onClose={() => setIsShortcutsHelpOpen(false)}
      />

      <SystemHealthModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        showToast={showToast}
        realtimeStatus={realtimeStatus}
        inquiriesCount={inquiriesCount}
        newInquiriesCount={newInquiriesCount}
        urgentInquiriesCount={newInquiriesCount}
        totalSessions={totalSessions}
        fullSessions={fullSessions}
      />
    </div>
  );
};

/**
 * Enveloppe le Cockpit dans les fournisseurs transverses :
 * - `CockpitThemeProvider` : thème clair/sombre persisté, scopé à `[data-cockpit-root]`
 *   pour ne jamais affecter la vitrine publique.
 * - `ToastProvider` : notifications unifiées consommées via `useToast()`.
 */
export const CockpitApp: React.FC<CockpitAppProps> = (props) => (
  <CockpitThemeProvider>
    <ToastProvider>
      <CockpitAppInner {...props} />
    </ToastProvider>
  </CockpitThemeProvider>
);
