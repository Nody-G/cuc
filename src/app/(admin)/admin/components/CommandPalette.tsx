'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Search,
  LayoutDashboard,
  Inbox,
  FileText,
  Calendar,
  Users,
  Film,
  Sparkles,
  Handshake,
  Settings,
  Shield,
  Image as ImageIcon,
  Bell,
  Database,
  Globe,
  Plus,
  ArrowRight,
  Activity,
  X,
  Compass,
  Menu,
  PanelBottom,
  Share2,
  History,
  CornerDownLeft,
  BarChart3,
  Boxes,
} from 'lucide-react';
import { TabType } from '../CockpitApp';
import { useFocusTrap } from './ui/useFocusTrap';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  switchTab?: (tab: TabType) => void;
  onSelectTab?: (tab: TabType) => void;
  onOpenBackupModal?: () => void;
  onOpenBackup?: () => void;
  onOpenHealthModal?: () => void;
  onOpenHealth?: () => void;
}

type CommandCategory = 'Navigation' | 'Actions Rapides' | 'Outils Système';

interface CommandItem {
  id: string;
  label: string;
  category: CommandCategory;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  badge?: string;
  keywords?: string[];
}

interface ScoredCommand {
  command: CommandItem;
  score: number;
}

const RECENT_STORAGE_KEY = 'cuc.cockpit.commandPalette.recent';
const MAX_RECENTS = 5;

/**
 * Normalise une chaîne pour la recherche : minuscules, sans accents,
 * ponctuation réduite à des espaces.
 */
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Correspondance floue par sous-séquence : tous les caractères de `needle`
 * doivent apparaître dans `haystack`, dans l'ordre. Retourne un score
 * (plus élevé = meilleur) ou -1 si aucun match.
 */
function fuzzyScore(haystack: string, needle: string): number {
  if (!needle) return 0;
  if (haystack.includes(needle)) {
    // Bonus fort pour une correspondance exacte de sous-chaîne,
    // d'autant plus si elle est en début de chaîne.
    return 1000 - haystack.indexOf(needle) * 2 - (haystack.length - needle.length);
  }
  let h = 0;
  let n = 0;
  let score = 0;
  let streak = 0;
  while (h < haystack.length && n < needle.length) {
    if (haystack[h] === needle[n]) {
      streak += 1;
      score += 10 + streak * 2;
      n += 1;
    } else {
      streak = 0;
      score -= 1;
    }
    h += 1;
  }
  return n === needle.length ? score : -1;
}

function readRecents(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RECENT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  switchTab,
  onSelectTab,
  onOpenBackupModal,
  onOpenBackup,
  onOpenHealthModal,
  onOpenHealth,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [recentsLoaded, setRecentsLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Hydratation de l'historique des commandes récentes : ajustement pendant le
  // rendu (pattern React officiel) au lieu d'un effet, pour éviter un rendu en
  // cascade. La lecture localStorage n'a lieu qu'à la première ouverture.
  if (isOpen && !recentsLoaded) {
    setRecentsLoaded(true);
    setRecentIds(readRecents());
  }

  const handleClose = useCallback(() => {
    setQuery('');
    setSelectedIndex(0);
    onClose();
  }, [onClose]);

  const dialogRef = useFocusTrap<HTMLDivElement>(isOpen, handleClose);

  const selectTab = useCallback(
    (tab: TabType) => {
      (switchTab || onSelectTab)?.(tab);
    },
    [switchTab, onSelectTab]
  );
  const openBackup = useCallback(() => {
    (onOpenBackupModal || onOpenBackup)?.();
  }, [onOpenBackupModal, onOpenBackup]);
  const openHealth = useCallback(() => {
    (onOpenHealthModal || onOpenHealth)?.();
  }, [onOpenHealthModal, onOpenHealth]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const commands: CommandItem[] = useMemo(
    () => [
      // Navigation
      {
        id: 'nav-dashboard',
        label: 'Aller au Tableau de Bord',
        category: 'Navigation',
        icon: LayoutDashboard,
        action: () => selectTab('dashboard'),
        keywords: ['accueil', 'stats', 'kpi', 'home', 'vue ensemble'],
      },
      {
        id: 'nav-inquiries',
        label: 'Gérer les Candidatures & Demandes de Contact',
        category: 'Navigation',
        icon: Inbox,
        action: () => selectTab('inquiries'),
        badge: 'Admissions',
        keywords: ['leads', 'candidats', 'inscriptions', 'devis', 'contact', 'admission'],
      },
      {
        id: 'nav-pages',
        label: 'Éditer les Pages Vitrines & Structure',
        category: 'Navigation',
        icon: FileText,
        action: () => selectTab('pages'),
        badge: 'CMS',
        keywords: ['contenu', 'vitrine', 'textes', 'sections', 'seo', 'pages'],
      },
      {
        id: 'nav-navigation',
        label: 'Éditer la Navigation & les Menus',
        category: 'Navigation',
        icon: Menu,
        action: () => selectTab('navigation'),
        badge: 'Navbar',
        keywords: ['menu', 'navbar', 'liens', 'dropdown', 'navigation', 'entrees'],
      },
      {
        id: 'nav-footer',
        label: 'Éditer le Pied de Page',
        category: 'Navigation',
        icon: PanelBottom,
        action: () => selectTab('footer'),
        badge: 'Footer',
        keywords: ['footer', 'pied', 'bas de page', 'mentions', 'legal', 'colonnes'],
      },
      {
        id: 'nav-social',
        label: 'Gérer les Réseaux Sociaux',
        category: 'Navigation',
        icon: Share2,
        action: () => selectTab('social'),
        badge: 'Social',
        keywords: ['instagram', 'youtube', 'tiktok', 'facebook', 'linkedin', 'reseaux'],
      },
      {
        id: 'nav-sessions',
        label: 'Gérer les Sessions de Formation',
        category: 'Navigation',
        icon: Calendar,
        action: () => selectTab('sessions'),
        keywords: ['dates', 'planning', 'calendrier', 'stages', 'sessions'],
      },
      {
        id: 'nav-team',
        label: 'Gérer l\'Équipe & les Coachs',
        category: 'Navigation',
        icon: Users,
        action: () => selectTab('team'),
        keywords: ['coachs', 'formateurs', 'cascadeurs', 'equipe', 'staff'],
      },
      {
        id: 'nav-films',
        label: 'Gérer les Films & Crédits',
        category: 'Navigation',
        icon: Film,
        action: () => selectTab('films'),
        keywords: ['filmographie', 'credits', 'imdb', 'catalogue', 'tournages'],
      },
      {
        id: 'nav-disciplines',
        label: 'Gérer les Disciplines',
        category: 'Navigation',
        icon: Compass,
        action: () => selectTab('disciplines'),
        keywords: ['parkour', 'cascades', 'escalade', 'disciplines', 'modules'],
      },
      {
        id: 'nav-campus',
        label: 'Gérer les Zones du Campus',
        category: 'Navigation',
        icon: Globe,
        action: () => selectTab('campus'),
        keywords: ['lieux', 'installations', 'poi', 'carte', 'zones'],
      },
      {
        id: 'nav-campus-3d',
        label: 'Plan 3D du Campus (Studio)',
        category: 'Navigation',
        icon: Boxes,
        action: () => selectTab('campus-3d'),
        keywords: ['3d', 'plan', 'batiment', 'modele', 'placement', 'studio', 'three'],
      },
      {
        id: 'nav-announcements',
        label: 'Gérer les Annonces',
        category: 'Navigation',
        icon: Bell,
        action: () => selectTab('announcements'),
        keywords: ['bandeau', 'banniere', 'annonce', 'message', 'alerte'],
      },
      {
        id: 'nav-events',
        label: 'Gérer les Événements',
        category: 'Navigation',
        icon: Sparkles,
        action: () => selectTab('events'),
        keywords: ['agenda', 'evenements', 'portes ouvertes', 'stages'],
      },
      {
        id: 'nav-partners',
        label: 'Gérer les Partenaires',
        category: 'Navigation',
        icon: Handshake,
        action: () => selectTab('partners'),
        keywords: ['sponsors', 'logos', 'partenaires', 'marques'],
      },
      {
        id: 'nav-media',
        label: 'Ouvrir la Médiathèque',
        category: 'Navigation',
        icon: ImageIcon,
        action: () => selectTab('media'),
        keywords: ['images', 'photos', 'videos', 'fichiers', 'uploads'],
      },
      {
        id: 'nav-settings',
        label: 'Ouvrir les Réglages du Site',
        category: 'Navigation',
        icon: Settings,
        action: () => selectTab('settings'),
        keywords: ['configuration', 'parametres', 'reglages', 'identite'],
      },
      {
        id: 'nav-users',
        label: 'Gérer les Utilisateurs & Rôles',
        category: 'Navigation',
        icon: Shield,
        action: () => selectTab('users'),
        keywords: ['comptes', 'permissions', 'roles', 'acces', 'admin'],
      },
      {
        id: 'nav-audit',
        label: 'Consulter le Journal d’Audit',
        category: 'Navigation',
        icon: Activity,
        action: () => selectTab('audit'),
        keywords: ['audit', 'historique', 'journal', 'tracabilite', 'logs', 'activite'],
      },
      {
        id: 'nav-analytics',
        label: 'Ouvrir le Tableau de Bord Analytique',
        category: 'Navigation',
        icon: BarChart3,
        action: () => selectTab('analytics'),
        keywords: ['analytique', 'statistiques', 'kpi', 'metriques', 'conversion', 'entonnoir', 'tendances'],
      },

      // Actions Rapides
      {
        id: 'action-new-session',
        label: 'Créer une Nouvelle Session',
        category: 'Actions Rapides',
        icon: Plus,
        action: () => selectTab('sessions'),
        keywords: ['ajouter', 'nouvelle', 'creer', 'session', 'stage'],
      },
      {
        id: 'action-new-page',
        label: 'Créer / Éditer une Page Vitrine',
        category: 'Actions Rapides',
        icon: FileText,
        action: () => selectTab('pages'),
        keywords: ['ajouter', 'nouvelle', 'creer', 'page', 'contenu'],
      },
      {
        id: 'action-new-event',
        label: 'Créer un Nouvel Événement',
        category: 'Actions Rapides',
        icon: Sparkles,
        action: () => selectTab('events'),
        keywords: ['ajouter', 'nouvel', 'creer', 'evenement', 'agenda'],
      },
      {
        id: 'action-new-partner',
        label: 'Ajouter un Partenaire',
        category: 'Actions Rapides',
        icon: Handshake,
        action: () => selectTab('partners'),
        keywords: ['ajouter', 'nouveau', 'creer', 'partenaire', 'sponsor'],
      },
      {
        id: 'action-upload-media',
        label: 'Téléverser un Média',
        category: 'Actions Rapides',
        icon: ImageIcon,
        action: () => selectTab('media'),
        keywords: ['upload', 'ajouter', 'image', 'photo', 'video', 'fichier'],
      },

      // Outils Système
      {
        id: 'tool-backup',
        label: 'Sauvegarder / Restaurer le Site',
        category: 'Outils Système',
        icon: Database,
        action: () => openBackup(),
        keywords: ['backup', 'export', 'import', 'restauration', 'sauvegarde'],
      },
      {
        id: 'tool-health',
        label: 'Diagnostic Système & Santé',
        category: 'Outils Système',
        icon: Activity,
        action: () => openHealth(),
        keywords: ['sante', 'diagnostic', 'statut', 'monitoring', 'performance'],
      },
    ],
    [selectTab, openBackup, openHealth]
  );

  const commandById = useMemo(() => {
    const map = new Map<string, CommandItem>();
    commands.forEach((c) => map.set(c.id, c));
    return map;
  }, [commands]);

  const recentCommands = useMemo(
    () =>
      recentIds
        .map((id) => commandById.get(id))
        .filter((c): c is CommandItem => Boolean(c)),
    [recentIds, commandById]
  );

  const filteredCommands = useMemo<ScoredCommand[]>(() => {
    const q = normalize(query);
    if (!q) {
      return commands.map((command) => ({ command, score: 0 }));
    }
    const scored: ScoredCommand[] = [];
    for (const command of commands) {
      const labelScore = fuzzyScore(normalize(command.label), q);
      const categoryScore = fuzzyScore(normalize(command.category), q);
      const keywordScore = command.keywords?.reduce((best, k) => {
        const s = fuzzyScore(normalize(k), q);
        return s > best ? s : best;
      }, -1) ?? -1;
      const best = Math.max(labelScore, categoryScore, keywordScore);
      if (best >= 0) {
        // Priorité au libellé, puis aux mots-clés, puis à la catégorie.
        const weighted =
          labelScore >= 0 ? labelScore + 200 : keywordScore >= 0 ? keywordScore + 100 : categoryScore;
        scored.push({ command, score: weighted });
      }
    }
    return scored.sort((a, b) => b.score - a.score);
  }, [commands, query]);

  const activeIndex =
    filteredCommands.length > 0 ? Math.min(selectedIndex, filteredCommands.length - 1) : 0;

  const rememberCommand = useCallback((id: string) => {
    setRecentIds((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, MAX_RECENTS);
      try {
        window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* stockage indisponible : on ignore */
      }
      return next;
    });
  }, []);

  const runCommand = useCallback(
    (command: CommandItem) => {
      rememberCommand(command.id);
      command.action();
      handleClose();
    },
    [rememberCommand, handleClose]
  );

  // Défilement automatique vers l'élément actif
  useEffect(() => {
    if (!isOpen) return;
    const container = listRef.current;
    if (!container) return;
    const active = container.querySelector<HTMLElement>('[data-active="true"]');
    active?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, isOpen, filteredCommands.length]);

  // Clavier
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredCommands.length === 0) {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSelectedIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setSelectedIndex(filteredCommands.length - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = filteredCommands[activeIndex];
      if (target) runCommand(target.command);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
  };

  // Regroupement par catégorie (uniquement hors recherche)
  const grouped = useMemo(() => {
    const order: CommandCategory[] = ['Navigation', 'Actions Rapides', 'Outils Système'];
    return order
      .map((category) => ({
        category,
        items: filteredCommands.filter((s) => s.command.category === category),
      }))
      .filter((g) => g.items.length > 0);
  }, [filteredCommands]);

  // Index global pour la navigation clavier (aligné sur filteredCommands)
  const indexOfId = useMemo(() => {
    const map = new Map<string, number>();
    filteredCommands.forEach((s, i) => map.set(s.command.id, i));
    return map;
  }, [filteredCommands]);

  if (!isOpen) return null;

  const showRecents = !query.trim() && recentCommands.length > 0;
  const showGrouped = !query.trim();

  const renderRow = (command: CommandItem, idx: number) => {
    const Icon = command.icon;
    const isSelected = idx === activeIndex;
    return (
      <button
        key={command.id}
        type="button"
        data-active={isSelected ? 'true' : 'false'}
        onClick={() => runCommand(command)}
        onMouseEnter={() => setSelectedIndex(idx)}
        className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs transition-colors cursor-pointer ${isSelected ? 'bg-[#FFE500] text-black font-semibold' : 'text-gray-300 hover:bg-white/5'
          }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-black text-[#FFE500]' : 'bg-white/5 text-gray-400'
              }`}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="truncate">{command.label}</div>
            <div
              className={`text-[10px] font-mono ${isSelected ? 'text-black/70' : 'text-gray-500'
                }`}
            >
              {command.category}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-3">
          {command.badge && (
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono uppercase font-bold ${isSelected ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-400'
                }`}
            >
              {command.badge}
            </span>
          )}
          <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : 'text-gray-600'}`} />
        </div>
      </button>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Barre de commandes"
    >
      <div
        ref={dialogRef}
        className="bg-[#0D0D12] border border-white/15 rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.95)] border-t-amber-400/40"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barre de recherche */}
        <div className="flex items-center px-4 border-b border-white/10 bg-[#121218]">
          <Search className="w-5 h-5 text-[#FFE500] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Que souhaitez-vous faire ? (ex: candidatures, stages, sauvegardes...)"
            className="w-full bg-transparent px-3.5 py-4 text-sm text-white placeholder-gray-500 focus:outline-hidden"
            aria-label="Rechercher une commande"
            autoComplete="off"
            spellCheck={false}
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
              }}
              className="p-1 text-gray-400 hover:text-white cursor-pointer"
              aria-label="Effacer la recherche"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-gray-400 bg-white/5 border border-white/10 rounded-md">
              Échap
            </kbd>
          )}
        </div>

        {/* Liste des commandes */}
        <div ref={listRef} className="max-h-[420px] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400 space-y-1">
              <p>Aucun résultat pour "{query}".</p>
              <p className="text-[11px] text-gray-500">
                Essayez un autre mot-clé comme "session", "film" ou "devis".
              </p>
            </div>
          ) : (
            <>
              {showRecents && (
                <div className="mb-1">
                  <div className="flex items-center gap-2 px-3 pt-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-gray-500">
                    <History className="w-3 h-3" />
                    Récent
                  </div>
                  <div className="space-y-0.5">
                    {recentCommands.map((command) =>
                      renderRow(command, indexOfId.get(command.id) ?? 0)
                    )}
                  </div>
                </div>
              )}

              {showGrouped ? (
                grouped.map((group) => (
                  <div key={group.category} className="mb-1">
                    <div className="px-3 pt-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-gray-500">
                      {group.category}
                    </div>
                    <div className="space-y-0.5">
                      {group.items.map(({ command }) =>
                        renderRow(command, indexOfId.get(command.id) ?? 0)
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-0.5">
                  {filteredCommands.map(({ command }, idx) => renderRow(command, idx))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Pied de palette */}
        <div className="p-3 bg-[#08080C] border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded">↓</kbd>
              naviguer
            </span>
            <span className="flex items-center gap-1">
              <CornerDownLeft className="w-3 h-3" />
              exécuter
            </span>
          </div>
          <span className="text-gray-600">Spotlight CUC Pro</span>
        </div>
      </div>
    </div>
  );
};
