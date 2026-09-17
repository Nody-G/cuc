'use client';

import React, { useState, useEffect } from 'react';
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
  Check,
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
} from 'lucide-react';
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
import { getCurrentUserProfile } from '@/app/admin/actions';
import { StuntProgram, Instructor, FilmCredit, Discipline } from '@/types';
import { STUNT_PROGRAMS } from '@/data/programs';
import { CUC_TEAM } from '@/data/team';
import { FILMOGRAPHY_CREDITS } from '@/data/filmography';
import { CUC_DISCIPLINES } from '@/data/disciplines';
import { CAMPUS_POIS, POI } from '@/components/ui/campus-map/campusMap.data';
import { createClient } from '@/lib/supabase/client';

// Composants modulaires du Cockpit
import { DashboardView } from './components/DashboardView';
import { SessionsView } from './components/SessionsView';
import { TeamView } from './components/TeamView';
import { FilmsView } from './components/FilmsView';
import { DisciplinesView } from './components/DisciplinesView';
import { CampusZonesView } from './components/CampusZonesView';
import { AnnouncementsView } from './components/AnnouncementsView';
import { PagesEditorView } from './components/PagesEditorView';
import { MediaLibraryView } from './components/MediaLibraryView';
import { PartnersView } from './components/PartnersView';
import { EventsView } from './components/EventsView';
import { SettingsView } from './components/SettingsView';
import { UsersRolesView } from './components/UsersRolesView';
import { InquiriesView } from './components/InquiriesView';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { CommandPalette } from './components/CommandPalette';
import { SystemHealthModal } from './components/SystemHealthModal';

export type TabType =
  | 'dashboard'
  | 'inquiries'
  | 'pages'
  | 'disciplines'
  | 'campus'
  | 'sessions'
  | 'team'
  | 'films'
  | 'partners'
  | 'events'
  | 'media'
  | 'announcements'
  | 'users'
  | 'settings';

interface CockpitAppProps {
  initialTab?: TabType;
}

export const CockpitApp: React.FC<CockpitAppProps> = ({ initialTab = 'dashboard' }) => {
  const router = useRouter();
  const pathname = usePathname();

  const getTabFromPath = (): TabType => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      if (p.includes('/inquiries')) return 'inquiries';
      if (p.includes('/pages')) return 'pages';
      if (p.includes('/media')) return 'media';
      if (p.includes('/partners')) return 'partners';
      if (p.includes('/events')) return 'events';
      if (p.includes('/users')) return 'users';
      if (p.includes('/settings')) return 'settings';
      if (p.includes('/sessions')) return 'sessions';
      if (p.includes('/team')) return 'team';
      if (p.includes('/films')) return 'films';
      if (p.includes('/announcements')) return 'announcements';
    }
    if (pathname.includes('/inquiries')) return 'inquiries';
    if (pathname.includes('/pages')) return 'pages';
    if (pathname.includes('/media')) return 'media';
    if (pathname.includes('/partners')) return 'partners';
    if (pathname.includes('/events')) return 'events';
    if (pathname.includes('/users')) return 'users';
    if (pathname.includes('/settings')) return 'settings';
    if (pathname.includes('/sessions')) return 'sessions';
    if (pathname.includes('/team')) return 'team';
    if (pathname.includes('/films')) return 'films';
    if (pathname.includes('/announcements')) return 'announcements';
    return initialTab;
  };

  const [activeTab, setActiveTab] = useState<TabType>(getTabFromPath());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
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
      const channel = supabase
        .channel('cockpit:all_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'sessions' },
          () => {
            getPrograms().then((p) => {
              if (p && p.length > 0) setPrograms(p);
            });
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'team_members' },
          () => {
            getTeam().then((t) => {
              if (t && t.length > 0) setTeam(t);
            });
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'films' },
          () => {
            getFilms().then((f) => {
              if (f && f.length > 0) setFilms(f);
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
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setRealtimeStatus('connected');
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            setRealtimeStatus('offline');
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      queueMicrotask(() => setRealtimeStatus('offline'));
    }
  }, []);

  // Prise en charge des raccourcis clavier globaux (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prise en charge des boutons Précédent/Suivant du navigateur
  useEffect(() => {
    const handlePopState = () => {
      const currentPath = window.location.pathname;
      if (currentPath.includes('/pages')) setActiveTab('pages');
      else if (currentPath.includes('/media')) setActiveTab('media');
      else if (currentPath.includes('/partners')) setActiveTab('partners');
      else if (currentPath.includes('/events')) setActiveTab('events');
      else if (currentPath.includes('/users')) setActiveTab('users');
      else if (currentPath.includes('/settings')) setActiveTab('settings');
      else if (currentPath.includes('/sessions')) setActiveTab('sessions');
      else if (currentPath.includes('/team')) setActiveTab('team');
      else if (currentPath.includes('/films')) setActiveTab('films');
      else if (currentPath.includes('/announcements')) setActiveTab('announcements');
      else setActiveTab('dashboard');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    const targetUrl = tab === 'dashboard' ? '/admin' : `/admin/${tab}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState(null, '', targetUrl);
    }
  };

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
          badge: 'MOD-10',
        },
        {
          id: 'campus' as TabType,
          label: 'Infrastructures (6 Ha)',
          icon: Compass,
          badge: 'Radar',
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
                    { id: 'settings' as TabType, label: 'Paramètres Globaux', icon: Settings },
                  ]
                : []),
            ],
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-[#070709] text-gray-100 flex flex-col md:flex-row antialiased">
      {/* Toast de confirmation */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#FFE500] text-black px-4 py-2.5 rounded-lg shadow-xl font-bold text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Check className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Sidebar latérale */}
      <aside className="w-full md:w-64 bg-[#0D0D12] border-b md:border-b-0 md:border-r border-white/10 flex flex-col shrink-0">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <button onClick={() => switchTab('dashboard')} className="flex items-center gap-3 text-left group">
            <div className="relative w-10 h-10 shrink-0">
              <Image
                src="/images/logos/cuc-logo-yellow.png"
                alt="Logo Campus Univers Cascades"
                fill
                className="object-contain drop-shadow-[0_0_12px_rgba(255,229,0,0.35)] group-hover:scale-105 transition-transform"
                sizes="40px"
                priority
              />
            </div>
            <div>
              <div className="text-sm font-bold tracking-wider text-white uppercase font-mono">COCKPIT</div>
              <div className="text-[10px] text-[#FFE500] font-semibold tracking-widest uppercase">
                {userRole === 'directeur'
                  ? 'Direction Campus'
                  : userRole === 'secretaire'
                  ? 'Secrétariat'
                  : userRole === 'coach'
                  ? 'Espace Formateur'
                  : 'Admin Vitrine'}
              </div>
            </div>
          </button>
          <span
            title={
              realtimeStatus === 'connected'
                ? 'Flux Supabase Realtime actif (synchronisation instantanée)'
                : 'Connexion au flux Realtime...'
            }
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
              realtimeStatus === 'connected'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                realtimeStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-yellow-400'
              }`}
            />
            {realtimeStatus === 'connected' ? 'Realtime' : 'Syncing'}
          </span>
        </div>

        <nav className="p-3 space-y-4 flex-1 overflow-y-auto">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-semibold">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => switchTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#FFE500] text-black font-bold shadow-md shadow-yellow-500/10'
                        : 'text-zinc-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase ${
                          isActive
                            ? 'bg-black text-amber-300 font-bold'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          <div className="pt-2">
            <div className="px-3 py-1 text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-semibold">
              Raccourcis
            </div>
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-[#FFE500] hover:bg-white/5 transition-colors"
            >
              <Globe className="w-4 h-4 text-zinc-500" />
              <span>Voir le site vitrine ↗</span>
            </Link>
            <button
              type="button"
              onClick={() => setIsBackupModalOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-[#FFE500] hover:bg-white/5 transition-colors cursor-pointer text-left"
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Sauvegardes / Export ↗</span>
            </button>
          </div>
        </nav>

        {/* Footer sidebar */}
        <div className="p-4 border-t border-white/10 bg-black/40 text-xs text-gray-400 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFE500]/10 border border-[#FFE500]/30 flex items-center justify-center text-xs font-black text-[#FFE500] uppercase">
              {(currentUserProfile?.full_name || currentUserProfile?.first_name || 'A').charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">
                {currentUserProfile?.full_name ||
                  [currentUserProfile?.first_name, currentUserProfile?.last_name].filter(Boolean).join(' ') ||
                  'Admin CUC'}
              </div>
              <div className="text-[10px] font-mono text-[#FFE500] uppercase font-semibold">
                {userRole}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-white/5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500">
              <Shield className="w-3.5 h-3.5 text-[#FFE500]" />
              <span>CUC Secure</span>
            </div>
            <button
              onClick={handleLogout}
              title="Se déconnecter du Cockpit"
              className="flex items-center gap-1 text-[10px] font-mono text-gray-400 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-white/5"
            >
              <LogOut className="w-3 h-3" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Contenu principal avec Barre Supérieure d'accès rapide */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Barre Supérieure du Cockpit */}
        <header className="h-14 border-b border-white/10 bg-[#0D0D12]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 z-10">
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 text-xs transition-colors cursor-pointer w-48 sm:w-72 justify-between"
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
        </header>

        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
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

        {/* 5. BANDEAU FLASH */}
        {activeTab === 'announcements' && (
          <AnnouncementsView
            announcement={announcement}
            setAnnouncement={setAnnouncement}
            showToast={showToast}
          />
        )}

        {/* 6. CMS ÉDITEUR DE PAGES */}
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

        {/* 7. MÉDIATHÈQUE STORAGE */}
        {activeTab === 'media' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <MediaLibraryView showToast={showToast} />
          </div>
        )}

        {/* 8. PRESTATIONS EVENTS */}
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

        {/* 9. PARTENAIRES */}
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

        {/* 10. PARAMÈTRES GLOBAUX */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <SettingsView initialSettings={siteSettings} />
          </div>
        )}

        {/* 11. UTILISATEURS & RÔLES */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <UsersRolesView
              showToast={showToast}
              currentUserRole={userRole}
            />
          </div>
        )}

        {/* 12. CANDIDATURES & DEMANDES DE CONTACT */}
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
