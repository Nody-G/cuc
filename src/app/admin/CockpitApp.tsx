'use client';

import React, { useState, useEffect, useTransition } from 'react';
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
  Zap,
  ArrowRight,
  CheckCircle2,
  Plus,
  Trash2,
  Edit2,
  Check,
  RefreshCw,
  Eye,
  ExternalLink,
  LogOut,
  FileText,
  Image as ImageIcon,
  Handshake,
  Sparkles,
  Settings,
} from 'lucide-react';
import { InstagramLogo } from '@/components/ui/logos/SocialLogos';
import {
  getPrograms,
  getTeam,
  getFilms,
  getActiveAnnouncement,
  getAllPages,
  getPartners,
  getEvents,
  getSiteSettings,
  SiteAnnouncement,
  SitePageContent,
  SitePartner,
  SiteEvent,
  SiteSettings,
  DEFAULT_PARTNERS,
  DEFAULT_SITE_SETTINGS,
} from '@/lib/data/site-service';
import {
  updateSessionStatus,
  createSession,
  deleteSession,
  updateAnnouncement,
  upsertTeamMember,
  deleteTeamMember,
  upsertFilm,
  deleteFilm,
} from '@/app/admin/actions';
import { StuntProgram, Instructor, FilmCredit } from '@/types';
import { STUNT_PROGRAMS } from '@/data/programs';
import { CUC_TEAM } from '@/data/team';
import { FILMOGRAPHY_CREDITS } from '@/data/filmography';
import { createClient } from '@/lib/supabase/client';

// Nouveaux composants CMS modulaires
import { PagesEditorView } from './components/PagesEditorView';
import { MediaLibraryView } from './components/MediaLibraryView';
import { PartnersView } from './components/PartnersView';
import { EventsView } from './components/EventsView';
import { SettingsView } from './components/SettingsView';

export type TabType = 
  | 'dashboard' 
  | 'pages' 
  | 'sessions' 
  | 'team' 
  | 'films' 
  | 'partners' 
  | 'events' 
  | 'media' 
  | 'announcements' 
  | 'settings';

interface CockpitAppProps {
  initialTab?: TabType;
}

export const CockpitApp: React.FC<CockpitAppProps> = ({ initialTab = 'dashboard' }) => {
  const router = useRouter();
  const pathname = usePathname();

  // Déterminer l'onglet actif à partir de la prop ou de l'URL
  const getTabFromPath = (): TabType => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      if (p.includes('/pages')) return 'pages';
      if (p.includes('/media')) return 'media';
      if (p.includes('/partners')) return 'partners';
      if (p.includes('/events')) return 'events';
      if (p.includes('/settings')) return 'settings';
      if (p.includes('/sessions')) return 'sessions';
      if (p.includes('/team')) return 'team';
      if (p.includes('/films')) return 'films';
      if (p.includes('/announcements')) return 'announcements';
    }
    if (pathname.includes('/pages')) return 'pages';
    if (pathname.includes('/media')) return 'media';
    if (pathname.includes('/partners')) return 'partners';
    if (pathname.includes('/events')) return 'events';
    if (pathname.includes('/settings')) return 'settings';
    if (pathname.includes('/sessions')) return 'sessions';
    if (pathname.includes('/team')) return 'team';
    if (pathname.includes('/films')) return 'films';
    if (pathname.includes('/announcements')) return 'announcements';
    return initialTab;
  };

  const [activeTab, setActiveTab] = useState<TabType>(getTabFromPath());
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Données locales réactives pré-remplies (Affichage instantané 0 ms sans écran blanc)
  const [programs, setPrograms] = useState<StuntProgram[]>(STUNT_PROGRAMS);
  const [team, setTeam] = useState<Instructor[]>(CUC_TEAM);
  const [films, setFilms] = useState<FilmCredit[]>(FILMOGRAPHY_CREDITS);
  const [pagesList, setPagesList] = useState<SitePageContent[]>([]);
  const [partnersList, setPartnersList] = useState<SitePartner[]>(DEFAULT_PARTNERS);
  const [eventsList, setEventsList] = useState<SiteEvent[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
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
  const [loading, setLoading] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'offline'>('connecting');

  // Synchronisation des données Supabase et écoute Realtime en direct
  useEffect(() => {
    // 1. Chargement asynchrone des données
    Promise.all([
      getPrograms(),
      getTeam(),
      getFilms(),
      getActiveAnnouncement(),
      getAllPages(),
      getPartners(),
      getEvents(),
      getSiteSettings(),
    ]).then(([p, t, f, a, pages, parts, evts, st]) => {
      if (p && p.length > 0) setPrograms(p);
      if (t && t.length > 0) setTeam(t);
      if (f && f.length > 0) setFilms(f);
      if (a) setAnnouncement(a);
      if (pages && pages.length > 0) setPagesList(pages);
      if (parts && parts.length > 0) setPartnersList(parts);
      if (evts && evts.length > 0) setEventsList(evts);
      if (st) setSiteSettings(st);
    }).catch((err) => {
      console.warn('[CockpitApp] sync warning:', err);
    });

    // 2. Écoute Supabase Realtime multi-tables
    try {
      const supabase = createClient();
      const channel = supabase
        .channel('cockpit:all_changes')
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
          { event: '*', schema: 'public', table: 'site_announcements' },
          (payload) => {
            if (payload.eventType === 'DELETE') {
              setAnnouncement((prev) => ({ ...prev, is_active: false }));
            } else if (payload.new) {
              setAnnouncement(payload.new as SiteAnnouncement);
            }
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
          { event: '*', schema: 'public', table: 'site_pages' },
          () => {
            getAllPages().then((pages) => {
              if (pages && pages.length > 0) setPagesList(pages);
            });
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'site_partners' },
          () => {
            getPartners().then((parts) => {
              if (parts && parts.length > 0) setPartnersList(parts);
            });
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'site_events' },
          () => {
            getEvents().then((evts) => {
              if (evts && evts.length > 0) setEventsList(evts);
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
      setRealtimeStatus('offline');
    }
  }, []);

  // Prise en charge des boutons Précédent/Suivant du navigateur
  useEffect(() => {
    const handlePopState = () => {
      const currentPath = window.location.pathname;
      if (currentPath.includes('/pages')) setActiveTab('pages');
      else if (currentPath.includes('/media')) setActiveTab('media');
      else if (currentPath.includes('/partners')) setActiveTab('partners');
      else if (currentPath.includes('/events')) setActiveTab('events');
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

  // Changement d'onglet instantané (0 ms de latence, aucun rechargement, mise à jour propre de l'URL)
  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    const targetUrl = tab === 'dashboard' ? '/admin' : `/admin/${tab}`;
    window.history.pushState(null, '', targetUrl);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    router.push('/admin/login');
  };

  // --- ACTIONS SESSIONS (Optimistic 0ms) ---
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [newSessionDate, setNewSessionDate] = useState('');
  const [newSessionStatus, setNewSessionStatus] = useState<'ouvert' | 'dernières places' | 'complet'>('ouvert');

  const currentProgram = programs.find((p) => p.id === (selectedProgramId || programs[0]?.id)) || programs[0];

  const handleStatusChange = (progId: string, dateDisplay: string, newStat: 'ouvert' | 'dernières places' | 'complet' | 'bientôt') => {
    // 1. Mise à jour instantanée dans l'UI (0 ms)
    setPrograms((prev) =>
      prev.map((p) => {
        if (p.id !== progId) return p;
        return {
          ...p,
          nextSessions: p.nextSessions.map((s) => (s.date === dateDisplay ? { ...s, status: newStat } : s)),
        };
      })
    );
    showToast(`Statut mis à jour : ${newStat}`);

    // 2. Synchronisation en arrière-plan
    startTransition(async () => {
      await updateSessionStatus(dateDisplay, newStat);
    });
  };

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionDate.trim() || !currentProgram) return;

    const progId = currentProgram.id;
    const dateText = newSessionDate.trim();
    const stat = newSessionStatus;

    // Mise à jour instantanée
    setPrograms((prev) =>
      prev.map((p) => {
        if (p.id !== progId) return p;
        return {
          ...p,
          nextSessions: [...(p.nextSessions || []), { date: dateText, status: stat }],
        };
      })
    );
    setNewSessionDate('');
    setShowAddSessionModal(false);
    showToast('Session ajoutée avec succès !');

    // Sauvegarde en arrière-plan
    startTransition(async () => {
      await createSession({
        program_id: progId,
        date_display: dateText,
        status: stat,
      });
    });
  };

  const handleDeleteSession = (progId: string, dateDisplay: string) => {
    if (!confirm(`Supprimer la date "${dateDisplay}" ?`)) return;

    setPrograms((prev) =>
      prev.map((p) => {
        if (p.id !== progId) return p;
        return {
          ...p,
          nextSessions: p.nextSessions.filter((s) => s.date !== dateDisplay),
        };
      })
    );
    showToast('Session supprimée');

    startTransition(async () => {
      await deleteSession(dateDisplay);
    });
  };

  // --- ACTIONS TEAM ---
  const [editingMember, setEditingMember] = useState<Instructor | null>(null);

  const handleSaveTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    const updated = editingMember;
    setTeam((prev) => {
      const exists = prev.some((m) => m.id === updated.id);
      if (exists) return prev.map((m) => (m.id === updated.id ? updated : m));
      return [...prev, updated];
    });
    setEditingMember(null);
    showToast('Fiche instructeur enregistrée !');

    startTransition(async () => {
      await upsertTeamMember({
        id: updated.id,
        name: updated.name,
        role: updated.role,
        title: updated.title,
        bio: updated.bio,
        specialties: updated.specialties,
        avatar_url: updated.avatarUrl,
        instagram: updated.instagram,
        imdb: updated.imdb,
        external_url: updated.externalUrl,
      });
    });
  };

  const handleDeleteTeamMember = (id: string, name: string) => {
    if (!confirm(`Supprimer le formateur "${name}" ?`)) return;

    setTeam((prev) => prev.filter((m) => m.id !== id));
    showToast(`Formateur "${name}" supprimé`);

    startTransition(async () => {
      await deleteTeamMember(id);
    });
  };

  // --- ACTIONS FILMS ---
  const [editingFilm, setEditingFilm] = useState<FilmCredit | null>(null);

  const handleSaveFilm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFilm) return;

    const updated = editingFilm;
    setFilms((prev) => {
      const exists = prev.some((f) => f.id === updated.id);
      if (exists) return prev.map((f) => (f.id === updated.id ? updated : f));
      return [...prev, updated];
    });
    setEditingFilm(null);
    showToast('Projet enregistré au catalogue !');

    startTransition(async () => {
      await upsertFilm({
        id: updated.id,
        title: updated.title,
        year: updated.year,
        category: updated.category,
        director: updated.director,
        stunt_roles: updated.stuntRoles,
        image: updated.image,
        tag: updated.tag,
        imdb_url: updated.imdbUrl,
        trailer_url: updated.trailerUrl,
        highlight: updated.highlight,
      });
    });
  };

  const handleDeleteFilm = (id: string, title: string) => {
    if (!confirm(`Supprimer le projet "${title}" de la filmographie ?`)) return;

    setFilms((prev) => prev.filter((f) => f.id !== id));
    showToast(`Projet "${title}" supprimé`);

    startTransition(async () => {
      await deleteFilm(id);
    });
  };

  // --- ACTIONS ANNONCES ---
  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Bandeau d\'annonce mis à jour en direct !');

    startTransition(async () => {
      await updateAnnouncement({
        id: announcement.id || undefined,
        title: announcement.title,
        message: announcement.message,
        badge: announcement.badge,
        link_url: announcement.link_url,
        link_text: announcement.link_text,
        style: announcement.style,
        is_active: announcement.is_active,
      });
    });
  };

  // Statistiques dashboard
  const totalSessions = programs.reduce((acc, p) => acc + (p.nextSessions?.length || 0), 0);
  const fullSessions = programs.reduce(
    (acc, p) => acc + (p.nextSessions?.filter((s) => s.status === 'complet').length || 0),
    0
  );

  const navSections = [
    {
      title: "Vue d'ensemble",
      items: [
        { id: 'dashboard' as TabType, label: 'Tableau de Bord', icon: LayoutDashboard },
      ],
    },
    {
      title: "CMS & Vitrine",
      items: [
        { id: 'pages' as TabType, label: 'Éditeur de Pages', icon: FileText, badge: '15' },
        { id: 'media' as TabType, label: 'Médiathèque Storage', icon: ImageIcon, badge: 'CDN' },
      ],
    },
    {
      title: "Contenus Spécifiques",
      items: [
        { id: 'sessions' as TabType, label: 'Sessions & Stages', icon: Calendar },
        { id: 'team' as TabType, label: 'Équipe & Coachs', icon: Users },
        { id: 'films' as TabType, label: 'Filmographie', icon: Film },
        { id: 'events' as TabType, label: 'Prestations Events', icon: Sparkles },
        { id: 'partners' as TabType, label: 'Partenaires & Labels', icon: Handshake },
      ],
    },
    {
      title: "Configuration",
      items: [
        { id: 'announcements' as TabType, label: 'Bandeau Flash', icon: Bell, badge: announcement.is_active ? 'Live' : undefined },
        { id: 'settings' as TabType, label: 'Paramètres Globaux', icon: Settings },
      ],
    },
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

      {/* Sidebar latérale ultra-rapide */}
      <aside className="w-full md:w-64 bg-[#0D0D12] border-b md:border-b-0 md:border-r border-white/10 flex flex-col shrink-0">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <button onClick={() => switchTab('dashboard')} className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-lg bg-[#FFE500] flex items-center justify-center text-black font-black text-xl shadow-[0_0_20px_rgba(255,229,0,0.3)]">
              CUC
            </div>
            <div>
              <div className="text-sm font-bold tracking-wider text-white uppercase font-mono">COCKPIT</div>
              <div className="text-[10px] text-[#FFE500] font-semibold tracking-widest uppercase">Admin Vitrine</div>
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

        {/* Navigation catégorisée avec bascule 0 ms */}
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
          </div>
        </nav>

        {/* Footer sidebar */}
        <div className="p-4 border-t border-white/10 bg-black/20 text-xs text-gray-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#FFE500]" />
            <span className="text-[11px] font-mono">CUC Sign</span>
          </div>
          <button
            onClick={handleLogout}
            title="Se déconnecter du Cockpit"
            className="flex items-center gap-1.5 text-[11px] font-mono text-gray-400 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-white/5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Contenu principal (Switch instantané 0 ms) */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-500 font-mono text-sm gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#FFE500]" />
            Chargement instantané du cockpit...
          </div>
        ) : (
          <>
            {/* 1. TABLEAU DE BORD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div className="border-b border-white/10 pb-6">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
                    <Zap className="w-3.5 h-3.5" /> Centre de Contrôle Instantané
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                    Cockpit CUC — Administration
                  </h1>
                  <p className="text-sm text-gray-400 mt-1">
                    Pilotez l&apos;intégralité de votre site vitrine : 15 pages, médias CDN, sessions, instructeurs, films et partenaires.
                  </p>
                </div>

                {/* Grille 8 modules Cockpit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Module Pages */}
                  <button
                    onClick={() => switchTab('pages')}
                    className="bg-[#0F0F14] border border-white/10 rounded-xl p-5 text-left group hover:border-[#FFE500]/50 transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">CMS Pages</span>
                      <div className="p-2 rounded-lg bg-amber-500/10 text-[#FFE500]">
                        <FileText className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-3xl font-black text-white">15</div>
                      <div className="text-xs text-gray-400 mt-1">Pages vitrines éditables</div>
                    </div>
                    <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#FFE500] font-medium">
                      Éditer les pages <ArrowRight className="w-3 h-3" />
                    </div>
                  </button>

                  {/* Module Médiathèque */}
                  <button
                    onClick={() => switchTab('media')}
                    className="bg-[#0F0F14] border border-white/10 rounded-xl p-5 text-left group hover:border-[#FFE500]/50 transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Médiathèque</span>
                      <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-3xl font-black text-white">CDN</div>
                      <div className="text-xs text-gray-400 mt-1">Supabase Storage public</div>
                    </div>
                    <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#FFE500] font-medium">
                      Gérer les médias <ArrowRight className="w-3 h-3" />
                    </div>
                  </button>

                  {/* Module Sessions */}
                  <button
                    onClick={() => switchTab('sessions')}
                    className="bg-[#0F0F14] border border-white/10 rounded-xl p-5 text-left group hover:border-[#FFE500]/50 transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Sessions & Dates</span>
                      <div className="p-2 rounded-lg bg-yellow-500/10 text-[#FFE500]">
                        <Calendar className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-3xl font-black text-white">{totalSessions}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        dont <span className="text-red-400 font-semibold">{fullSessions} complètes</span>
                      </div>
                    </div>
                    <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#FFE500] font-medium">
                      Gérer les dates <ArrowRight className="w-3 h-3" />
                    </div>
                  </button>

                  {/* Module Instructeurs */}
                  <button
                    onClick={() => switchTab('team')}
                    className="bg-[#0F0F14] border border-white/10 rounded-xl p-5 text-left group hover:border-[#FFE500]/50 transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Instructeurs</span>
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-3xl font-black text-white">{team.length}</div>
                      <div className="text-xs text-gray-400 mt-1">Formateurs & coordinateurs</div>
                    </div>
                    <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#FFE500] font-medium">
                      Modifier l&apos;équipe <ArrowRight className="w-3 h-3" />
                    </div>
                  </button>

                  {/* Module Filmographie */}
                  <button
                    onClick={() => switchTab('films')}
                    className="bg-[#0F0F14] border border-white/10 rounded-xl p-5 text-left group hover:border-[#FFE500]/50 transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Filmographie</span>
                      <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                        <Film className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-3xl font-black text-white">{films.length}</div>
                      <div className="text-xs text-gray-400 mt-1">Films, blockbusters & séries</div>
                    </div>
                    <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#FFE500] font-medium">
                      Mettre à jour <ArrowRight className="w-3 h-3" />
                    </div>
                  </button>

                  {/* Module Prestations Events */}
                  <button
                    onClick={() => switchTab('events')}
                    className="bg-[#0F0F14] border border-white/10 rounded-xl p-5 text-left group hover:border-[#FFE500]/50 transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">CUC Events</span>
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-3xl font-black text-white">{eventsList.length || 3}</div>
                      <div className="text-xs text-gray-400 mt-1">Shows & team-building</div>
                    </div>
                    <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#FFE500] font-medium">
                      Gérer les offres <ArrowRight className="w-3 h-3" />
                    </div>
                  </button>

                  {/* Module Partenaires */}
                  <button
                    onClick={() => switchTab('partners')}
                    className="bg-[#0F0F14] border border-white/10 rounded-xl p-5 text-left group hover:border-[#FFE500]/50 transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Partenaires</span>
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                        <Handshake className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-3xl font-black text-white">{partnersList.length}</div>
                      <div className="text-xs text-gray-400 mt-1">Cinéma & institutionnels</div>
                    </div>
                    <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#FFE500] font-medium">
                      Gérer les partenaires <ArrowRight className="w-3 h-3" />
                    </div>
                  </button>

                  {/* Module Paramètres */}
                  <button
                    onClick={() => switchTab('settings')}
                    className="bg-[#0F0F14] border border-white/10 rounded-xl p-5 text-left group hover:border-[#FFE500]/50 transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Paramètres</span>
                      <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                        <Settings className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-lg font-bold text-white truncate">{siteSettings.school_name || 'CUC'}</div>
                      <div className="text-xs text-gray-400 mt-1">Coordonnées, footer, réseaux</div>
                    </div>
                    <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#FFE500] font-medium">
                      Configurer <ArrowRight className="w-3 h-3" />
                    </div>
                  </button>
                </div>

                <div className="bg-[#12121A] border border-white/10 rounded-xl p-6 relative">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-[#FFE500]/10 text-[#FFE500] shrink-0 mt-0.5">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-white uppercase tracking-wide">
                        Cockpit Ultra-Rapide & Haute Disponibilité
                      </h3>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        La navigation entre les modules s&apos;effectue désormais à <strong>0 ms de latence</strong>. Vos modifications sont prises en compte immédiatement et synchronisées en arrière-plan avec votre base de données Supabase.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. SESSIONS & STAGES */}
            {activeTab === 'sessions' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-white/10 pb-6">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
                    <Calendar className="w-3.5 h-3.5" /> Sessions & Dates de stage
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                    Gestion des Dates & Disponibilités
                  </h1>
                  <p className="text-sm text-gray-400 mt-1">
                    Basculez une session en &quot;Complet&quot; en 1 clic ou ajoutez de nouvelles sessions.
                  </p>
                </div>

                {/* Sélecteur de programme */}
                <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
                  {programs.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProgramId(p.id)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                        (currentProgram?.id === p.id)
                          ? 'bg-[#FFE500] text-black shadow-md shadow-yellow-500/20'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {p.title}
                    </button>
                  ))}
                </div>

                {currentProgram && (
                  <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
                      <div>
                        <div className="text-xs font-mono text-[#FFE500] uppercase tracking-wider">
                          {currentProgram.badge || 'Cursus CUC'}
                        </div>
                        <h2 className="text-xl font-bold text-white mt-0.5">{currentProgram.title}</h2>
                        <div className="text-xs text-gray-400 mt-1">
                          {currentProgram.duration} • {currentProgram.hours}
                        </div>
                      </div>

                      <button
                        onClick={() => setShowAddSessionModal(true)}
                        className="px-4 py-2 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-transform active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        Ajouter une session
                      </button>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                        Sessions planifiées ({currentProgram.nextSessions?.length || 0})
                      </h3>

                      {(!currentProgram.nextSessions || currentProgram.nextSessions.length === 0) ? (
                        <div className="p-8 text-center text-sm text-gray-500 border border-dashed border-white/10 rounded-lg">
                          Aucune session pour ce programme.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {currentProgram.nextSessions.map((session, index) => {
                            const statusColors = {
                              complet: 'bg-red-500/10 text-red-400 border-red-500/20',
                              'dernières places': 'bg-yellow-500/10 text-[#FFE500] border-yellow-500/20',
                              ouvert: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                              bientôt: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                            };

                            return (
                              <div
                                key={index}
                                className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between gap-4 group hover:border-white/20 transition-colors"
                              >
                                <div>
                                  <div className="text-sm font-bold text-white font-mono">{session.date}</div>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span
                                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                                        statusColors[session.status] || 'bg-white/10 text-gray-300'
                                      }`}
                                    >
                                      {session.status}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <select
                                    value={session.status}
                                    onChange={(e) =>
                                      handleStatusChange(
                                        currentProgram.id,
                                        session.date,
                                        e.target.value as 'ouvert' | 'dernières places' | 'complet' | 'bientôt'
                                      )
                                    }
                                    className="bg-black/60 border border-white/20 text-white text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-[#FFE500] cursor-pointer"
                                  >
                                    <option value="ouvert">🟢 Ouvert</option>
                                    <option value="dernières places">🟡 Dernières places</option>
                                    <option value="complet">🔴 Complet</option>
                                    <option value="bientôt">🔵 Bientôt</option>
                                  </select>

                                  <button
                                    onClick={() => handleDeleteSession(currentProgram.id, session.date)}
                                    title="Supprimer la date"
                                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Modal d'ajout de date */}
                {showAddSessionModal && (
                  <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#12121A] border border-white/10 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
                      <h3 className="text-base font-bold text-white uppercase tracking-wide">
                        Ajouter une session de stage
                      </h3>
                      <form onSubmit={handleAddSession} className="space-y-4">
                        <div>
                          <label className="block text-xs font-mono text-gray-400 mb-1">Programme</label>
                          <input
                            type="text"
                            disabled
                            value={currentProgram.title}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono text-gray-400 mb-1">Intitulé de la date</label>
                          <input
                            type="text"
                            required
                            placeholder="ex: 12 au 24 mai 2027"
                            value={newSessionDate}
                            onChange={(e) => setNewSessionDate(e.target.value)}
                            className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono text-gray-400 mb-1">Statut initial</label>
                          <select
                            value={newSessionStatus}
                            onChange={(e) => setNewSessionStatus(e.target.value as 'ouvert' | 'dernières places' | 'complet')}
                            className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                          >
                            <option value="ouvert">🟢 Ouvert aux inscriptions</option>
                            <option value="dernières places">🟡 Dernières places</option>
                            <option value="complet">🔴 Complet</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowAddSessionModal(false)}
                            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
                          >
                            Annuler
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-bold uppercase tracking-wider"
                          >
                            Enregistrer
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. ÉQUIPE & COACHS */}
            {activeTab === 'team' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-white/10 pb-6">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
                    <Users className="w-3.5 h-3.5" /> Équipe & Instructeurs
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                    Gestion des Formateurs
                  </h1>
                  <p className="text-sm text-gray-400 mt-1">
                    Mettez à jour les formateurs, leurs bios, spécialités et réseaux.
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-xs font-mono text-gray-400">{team.length} FORMATEURS</div>
                  <button
                    onClick={() =>
                      setEditingMember({
                        id: `coach-${Date.now()}`,
                        name: '',
                        role: 'Coach & Intervenant',
                        title: 'Formateur Spécialisé',
                        specialties: ['Combat', 'Acrobatie'],
                        bio: '',
                        notableCredits: [],
                      })
                    }
                    className="px-4 py-2 rounded-lg bg-[#FFE500] text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:bg-[#ffe600e6]"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter un formateur
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {team.map((member) => (
                    <div
                      key={member.id}
                      className="bg-[#0D0D12] border border-white/10 rounded-xl p-5 flex flex-col justify-between hover:border-white/20 transition-colors group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 overflow-hidden relative shrink-0">
                          {member.avatarUrl ? (
                            <Image
                              src={member.avatarUrl}
                              alt={member.name}
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 font-bold">
                              CUC
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold text-white truncate">{member.name}</div>
                          <div className="text-xs text-[#FFE500] font-medium truncate">{member.role}</div>
                          <div className="text-[11px] text-gray-400 truncate mt-0.5">{member.title}</div>
                        </div>
                      </div>

                      <p className="text-xs text-gray-300 mt-3 line-clamp-2 leading-relaxed">
                        {member.bio}
                      </p>

                      <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-400">
                          {member.instagram && (
                            <a href={member.instagram} target="_blank" rel="noreferrer" className="hover:text-[#FFE500]">
                              <InstagramLogo className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {member.imdb && (
                            <a href={member.imdb} target="_blank" rel="noreferrer" className="text-[10px] font-bold hover:text-[#FFE500]">
                              IMDb
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingMember(member)}
                            className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-white text-xs font-medium flex items-center gap-1.5"
                          >
                            <Edit2 className="w-3 h-3" />
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteTeamMember(member.id, member.name)}
                            title="Supprimer le formateur"
                            className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 text-xs transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Modal édition membre */}
                {editingMember && (
                  <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-[#12121A] border border-white/10 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl my-8">
                      <h3 className="text-base font-bold text-white uppercase tracking-wide">
                        {editingMember.name ? `Modifier : ${editingMember.name}` : 'Nouveau formateur'}
                      </h3>
                      <form onSubmit={handleSaveTeamMember} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-mono text-gray-400 mb-1">Nom</label>
                            <input
                              type="text"
                              required
                              value={editingMember.name}
                              onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                              className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-mono text-gray-400 mb-1">Rôle</label>
                            <input
                              type="text"
                              required
                              value={editingMember.role}
                              onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                              className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-mono text-gray-400 mb-1">Titre</label>
                          <input
                            type="text"
                            required
                            value={editingMember.title}
                            onChange={(e) => setEditingMember({ ...editingMember, title: e.target.value })}
                            className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono text-gray-400 mb-1">URL Photo</label>
                          <input
                            type="url"
                            value={editingMember.avatarUrl || ''}
                            onChange={(e) => setEditingMember({ ...editingMember, avatarUrl: e.target.value })}
                            className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono text-gray-400 mb-1">Bio</label>
                          <textarea
                            rows={3}
                            value={editingMember.bio}
                            onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
                            className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setEditingMember(null)}
                            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
                          >
                            Annuler
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-bold uppercase tracking-wider"
                          >
                            Enregistrer
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. FILMOGRAPHIE */}
            {activeTab === 'films' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-white/10 pb-6">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
                    <Film className="w-3.5 h-3.5" /> Filmographie CUC
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                    Projets Cinéma & Cascades
                  </h1>
                  <p className="text-sm text-gray-400 mt-1">
                    Ajoutez vos dernières sorties cinéma et séries TV.
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-xs font-mono text-gray-400">{films.length} PROJETS</div>
                  <button
                    onClick={() =>
                      setEditingFilm({
                        id: `film-${Date.now()}`,
                        title: '',
                        year: '2025',
                        category: 'Cinéma International',
                        stuntRoles: 'Cascades physiques, combats, chutes',
                        highlight: false,
                        image: '',
                        tag: 'NOUVEAU',
                        imdbUrl: '',
                        allocineUrl: '',
                        trailerUrl: '',
                      })
                    }
                    className="px-4 py-2 rounded-lg bg-[#FFE500] text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:bg-[#ffe600e6]"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter un projet
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {films.map((film) => (
                    <div
                      key={film.id}
                      className="bg-[#0D0D12] border border-white/10 rounded-xl overflow-hidden flex flex-col justify-between hover:border-white/20 transition-colors group"
                    >
                      <div className="relative aspect-[16/10] bg-black/60 overflow-hidden">
                        {film.image ? (
                          <Image
                            src={film.image}
                            alt={film.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="300px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 font-bold">
                            PAS D&apos;AFFICHE
                          </div>
                        )}
                        {film.tag && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FFE500] text-black text-[10px] font-black uppercase">
                            {film.tag}
                          </span>
                        )}
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-white text-[10px] font-mono">
                          {film.year}
                        </span>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="text-sm font-bold text-white group-hover:text-[#FFE500] transition-colors truncate">
                            {film.title}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {film.director ? `Réal : ${film.director}` : film.category}
                          </div>
                          <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                            {film.stuntRoles}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                          {film.imdbUrl ? (
                            <a
                              href={film.imdbUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-bold text-gray-400 hover:text-[#FFE500] flex items-center gap-1"
                            >
                              IMDb <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ) : (
                            <span />
                          )}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setEditingFilm(film)}
                              className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-white text-xs font-medium flex items-center gap-1.5"
                            >
                              <Edit2 className="w-3 h-3" />
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteFilm(film.id, film.title)}
                              title="Supprimer le projet"
                              className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 text-xs transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Modal édition film */}
                {editingFilm && (
                  <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-[#12121A] border border-white/10 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl my-8">
                      <h3 className="text-base font-bold text-white uppercase tracking-wide">
                        {editingFilm.title ? `Modifier : ${editingFilm.title}` : 'Ajouter un film'}
                      </h3>
                      <form onSubmit={handleSaveFilm} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-mono text-gray-400 mb-1">Titre</label>
                            <input
                              type="text"
                              required
                              value={editingFilm.title}
                              onChange={(e) => setEditingFilm({ ...editingFilm, title: e.target.value })}
                              className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-mono text-gray-400 mb-1">Année</label>
                            <input
                              type="text"
                              required
                              value={editingFilm.year}
                              onChange={(e) => setEditingFilm({ ...editingFilm, year: e.target.value })}
                              className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-mono text-gray-400 mb-1">URL Affiche</label>
                          <input
                            type="url"
                            value={editingFilm.image || ''}
                            onChange={(e) => setEditingFilm({ ...editingFilm, image: e.target.value })}
                            className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono text-gray-400 mb-1">Rôles de cascades</label>
                          <textarea
                            rows={3}
                            value={editingFilm.stuntRoles}
                            onChange={(e) => setEditingFilm({ ...editingFilm, stuntRoles: e.target.value })}
                            className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setEditingFilm(null)}
                            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
                          >
                            Annuler
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-bold uppercase tracking-wider"
                          >
                            Enregistrer
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 5. BANDEAU FLASH */}
            {activeTab === 'announcements' && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div className="border-b border-white/10 pb-6">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
                    <Bell className="w-3.5 h-3.5" /> Flash Info & Alertes
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                    Bandeau d&apos;Alerte en Ligne
                  </h1>
                  <p className="text-sm text-gray-400 mt-1">
                    Affichez ou désactivez une annonce instantanée au sommet du site vitrine.
                  </p>
                </div>

                {/* Prévisualisation dynamique */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-gray-400 uppercase tracking-wider">
                    <Eye className="w-3.5 h-3.5 text-[#FFE500]" />
                    Aperçu en direct
                  </div>
                  <div className="p-4 rounded-xl bg-black/60 border border-white/10">
                    {announcement.is_active ? (
                      <div
                        className={`w-full py-2.5 px-4 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm font-semibold border ${
                          announcement.style === 'gold'
                            ? 'bg-[#FFE500] text-black border-[#FFE500]'
                            : announcement.style === 'alert'
                            ? 'bg-red-600 text-white border-red-500'
                            : announcement.style === 'info'
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-zinc-900 text-white border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {announcement.badge && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-black/20">
                              {announcement.badge}
                            </span>
                          )}
                          <span>
                            <strong>{announcement.title}</strong> — {announcement.message}
                          </span>
                        </div>
                        {announcement.link_text && (
                          <span className="underline text-xs font-bold shrink-0">
                            {announcement.link_text} →
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-gray-500 font-mono">
                        [ Bandeau DÉSACTIVÉ — Invisible sur le site public ]
                      </div>
                    )}
                  </div>
                </div>

                {/* Formulaire */}
                <form onSubmit={handleSaveAnnouncement} className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-5">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div>
                      <div className="text-sm font-bold text-white">Activer le bandeau sur le site</div>
                      <div className="text-xs text-gray-400">
                        Visible par tous les visiteurs au sommet de chaque page.
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={announcement.is_active}
                        onChange={(e) => setAnnouncement({ ...announcement, is_active: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFE500]"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-mono text-gray-400 mb-1">Titre court</label>
                      <input
                        type="text"
                        required
                        value={announcement.title}
                        onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                        className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-gray-400 mb-1">Badge</label>
                      <input
                        type="text"
                        value={announcement.badge || ''}
                        onChange={(e) => setAnnouncement({ ...announcement, badge: e.target.value })}
                        className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Message</label>
                    <textarea
                      rows={2}
                      required
                      value={announcement.message}
                      onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
                      className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-gray-400 mb-1">Style de couleur</label>
                      <select
                        value={announcement.style}
                        onChange={(e) =>
                          setAnnouncement({
                            ...announcement,
                            style: e.target.value as 'gold' | 'info' | 'alert' | 'dark',
                          })
                        }
                        className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                      >
                        <option value="gold">🟡 Or CUC</option>
                        <option value="info">🔵 Bleu Info</option>
                        <option value="alert">🔴 Rouge Alerte</option>
                        <option value="dark">⚫ Noir Sobre</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-gray-400 mb-1">Texte du lien</label>
                      <input
                        type="text"
                        value={announcement.link_text || ''}
                        onChange={(e) => setAnnouncement({ ...announcement, link_text: e.target.value })}
                        className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-gray-400 mb-1">Lien de redirection</label>
                      <input
                        type="text"
                        value={announcement.link_url || ''}
                        onChange={(e) => setAnnouncement({ ...announcement, link_url: e.target.value })}
                        className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-black uppercase tracking-wider flex items-center gap-2"
                    >
                      Enregistrer & Mettre en ligne
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 6. CMS ÉDITEUR DE PAGES */}
            {activeTab === 'pages' && (
              <div className="animate-in fade-in duration-200">
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

            {/* 7. MÉDIATHÈQUE STORAGE CDN */}
            {activeTab === 'media' && (
              <div className="animate-in fade-in duration-200">
                <MediaLibraryView showToast={showToast} />
              </div>
            )}

            {/* 8. PRESTATIONS CUC EVENTS */}
            {activeTab === 'events' && (
              <div className="animate-in fade-in duration-200">
                <EventsView
                  events={eventsList}
                  onEventSaved={(evt) => {
                    setEventsList((prev) => {
                      const exists = prev.some((e) => e.id === evt.id);
                      if (exists) return prev.map((e) => (e.id === evt.id ? evt : e));
                      return [...prev, evt];
                    });
                  }}
                  onEventDeleted={(id) => {
                    setEventsList((prev) => prev.filter((e) => e.id !== id));
                  }}
                  showToast={showToast}
                />
              </div>
            )}

            {/* 9. PARTENAIRES CINÉMA & INSTITUTIONNELS */}
            {activeTab === 'partners' && (
              <div className="animate-in fade-in duration-200">
                <PartnersView
                  partners={partnersList}
                  onPartnerSaved={(partner) => {
                    setPartnersList((prev) => {
                      const exists = prev.some((p) => p.id === partner.id);
                      if (exists) return prev.map((p) => (p.id === partner.id ? partner : p));
                      return [...prev, partner];
                    });
                  }}
                  onPartnerDeleted={(id) => {
                    setPartnersList((prev) => prev.filter((p) => p.id !== id));
                  }}
                  showToast={showToast}
                />
              </div>
            )}

            {/* 10. PARAMÈTRES GLOBAUX DU SITE */}
            {activeTab === 'settings' && (
              <div className="animate-in fade-in duration-200">
                <SettingsView initialSettings={siteSettings} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
