'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
} from 'lucide-react';
import { TabType } from '../CockpitApp';

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

interface CommandItem {
  id: string;
  label: string;
  category: 'Navigation' | 'Actions Rapides' | 'Outils Système';
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  badge?: string;
  keywords?: string[];
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
  const inputRef = useRef<HTMLInputElement>(null);

  const selectTab = (tab: TabType) => {
    (switchTab || onSelectTab)?.(tab);
  };
  const openBackup = () => {
    (onOpenBackupModal || onOpenBackup)?.();
  };
  const openHealth = () => {
    (onOpenHealthModal || onOpenHealth)?.();
  };

  const handleClose = () => {
    setQuery('');
    setSelectedIndex(0);
    onClose();
  };

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
        keywords: ['accueil', 'stats', 'kpi', 'home'],
      },
      {
        id: 'nav-inquiries',
        label: 'Gérer les Candidatures & Demandes de Contact',
        category: 'Navigation',
        icon: Inbox,
        action: () => selectTab('inquiries'),
        badge: 'Admissions',
        keywords: ['leads', 'candidats', 'inscriptions', 'devis', 'contact'],
      },
      {
        id: 'nav-pages',
        label: 'Éditer les Pages Vitrines & Structure',
        category: 'Navigation',
        icon: FileText,
        action: () => selectTab('pages'),
        badge: 'CMS',
        keywords: ['contenu', 'vitrine', 'textes', 'sections', 'seo'],
      },
      {
        id: 'nav-disciplines',
        label: 'Modules & Disciplines de Cascade (10 Modules)',
        category: 'Navigation',
        icon: Shield,
        action: () => selectTab('disciplines'),
        badge: 'MOD-01 à 10',
        keywords: ['combat', 'chute', 'torche', 'câblage', 'parkour', 'armes', 'escalier', 'acrobatie', 'disciplines', 'modules'],
      },
      {
        id: 'nav-campus',
        label: 'Infrastructures & Zones du Campus (6 Ha)',
        category: 'Navigation',
        icon: Compass,
        action: () => selectTab('campus'),
        badge: 'Radar 6 Ha',
        keywords: ['campus', 'tour 21m', 'dojo', 'airbag', 'rigging', 'mfr', 'infrastructures', 'plan', 'radar'],
      },
      {
        id: 'nav-sessions',
        label: 'Gérer les Sessions de Stages & Formations',
        category: 'Navigation',
        icon: Calendar,
        action: () => selectTab('sessions'),
        keywords: ['dates', 'planning', 'calendrier', 'places', 'complet'],
      },
      {
        id: 'nav-team',
        label: 'Équipe Pédagogique & Instructeurs',
        category: 'Navigation',
        icon: Users,
        action: () => selectTab('team'),
        keywords: ['coachs', 'formateurs', 'lucas dollfus', 'instructeurs'],
      },
      {
        id: 'nav-films',
        label: 'Filmographie & Crédits Cascades',
        category: 'Navigation',
        icon: Film,
        action: () => selectTab('films'),
        keywords: ['films', 'crédits', 'cinéma', 'netflix', 'tournages'],
      },
      {
        id: 'nav-media',
        label: 'Médiathèque Storage CDN',
        category: 'Navigation',
        icon: ImageIcon,
        action: () => selectTab('media'),
        keywords: ['photos', 'images', 'storage', 'upload', 'visuels'],
      },
      {
        id: 'nav-events',
        label: 'Prestations Événementielles & Spectacles',
        category: 'Navigation',
        icon: Sparkles,
        action: () => selectTab('events'),
        keywords: ['shows', 'team building', 'entreprises', 'spectacles'],
      },
      {
        id: 'nav-partners',
        label: 'Partenaires, Labels & Équipementiers',
        category: 'Navigation',
        icon: Handshake,
        action: () => selectTab('partners'),
        keywords: ['sponsors', 'marques', 'labels', 'partenariats'],
      },
      {
        id: 'nav-announcements',
        label: 'Bandeau Flash & Alertes Vitrine',
        category: 'Navigation',
        icon: Bell,
        action: () => selectTab('announcements'),
        keywords: ['bannière', 'promo', 'message', 'flash'],
      },
      {
        id: 'nav-users',
        label: 'Gestion des Utilisateurs & Rôles Admin',
        category: 'Navigation',
        icon: Shield,
        action: () => selectTab('users'),
        keywords: ['droits', 'permissions', 'comptes', 'coach', 'secretaire'],
      },
      {
        id: 'nav-settings',
        label: 'Paramètres Globaux du Site Vitrine',
        category: 'Navigation',
        icon: Settings,
        action: () => selectTab('settings'),
        keywords: ['coordonnées', 'téléphone', 'adresse', 'réseaux'],
      },

      // Actions Rapides
      {
        id: 'act-new-session',
        label: 'Programmer une nouvelle date de stage',
        category: 'Actions Rapides',
        icon: Plus,
        action: () => {
          selectTab('sessions');
        },
        badge: 'Action',
        keywords: ['créer session', 'ajouter date'],
      },
      {
        id: 'act-health',
        label: 'Lancer l’Audit de Santé & Diagnostic Système',
        category: 'Outils Système',
        icon: Activity,
        action: () => openHealth(),
        badge: 'Santé',
        keywords: ['diagnostic', 'test', 'cache', 'revalidation'],
      },
      {
        id: 'act-backup',
        label: 'Exporter une Sauvegarde Intégrale (.json)',
        category: 'Outils Système',
        icon: Database,
        action: () => openBackup(),
        badge: 'Sécurité',
        keywords: ['export', 'sauvegarde', 'restauration', 'json'],
      },
      {
        id: 'act-vitrine',
        label: 'Ouvrir le Site Vitrine Public',
        category: 'Actions Rapides',
        icon: Globe,
        action: () => window.open('/', '_blank'),
        badge: 'Vitrine ↗',
        keywords: ['voir site', 'front'],
      },
    ],
    [switchTab, onSelectTab, onOpenBackupModal, onOpenBackup, onOpenHealthModal, onOpenHealth]
  );

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase().trim();
    return commands.filter((cmd) => {
      const matchLabel = cmd.label.toLowerCase().includes(q);
      const matchCategory = cmd.category.toLowerCase().includes(q);
      const matchKeywords = cmd.keywords?.some((k) => k.toLowerCase().includes(q));
      return matchLabel || matchCategory || matchKeywords;
    });
  }, [commands, query]);

  const activeIndex =
    filteredCommands.length > 0 ? Math.min(selectedIndex, filteredCommands.length - 1) : 0;

  // Clavier
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[activeIndex]) {
        filteredCommands[activeIndex].action();
        handleClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div
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
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
              }}
              className="p-1 text-gray-400 hover:text-white cursor-pointer"
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
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-white/5">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400 space-y-1">
              <p>Aucun résultat pour &quot;{query}&quot;.</p>
              <p className="text-[11px] text-gray-500">Essayez un autre mot-clé comme &quot;session&quot;, &quot;film&quot; ou &quot;devis&quot;.</p>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={() => {
                    cmd.action();
                    handleClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#FFE500] text-black font-semibold'
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected ? 'bg-black text-[#FFE500]' : 'bg-white/5 text-gray-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="truncate">{cmd.label}</div>
                      <div
                        className={`text-[10px] font-mono ${
                          isSelected ? 'text-black/70' : 'text-gray-500'
                        }`}
                      >
                        {cmd.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {cmd.badge && (
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono uppercase font-bold ${
                          isSelected
                            ? 'bg-black/20 text-black'
                            : 'bg-white/10 text-gray-400'
                        }`}
                      >
                        {cmd.badge}
                      </span>
                    )}
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : 'text-gray-600'}`} />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Pied de palette */}
        <div className="p-3 bg-[#08080C] border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-gray-500">
          <div className="flex items-center gap-3">
            <span>↑↓ pour naviguer</span>
            <span>↵ pour exécuter</span>
          </div>
          <span>Spotlight CUC Pro</span>
        </div>
      </div>
    </div>
  );
};
