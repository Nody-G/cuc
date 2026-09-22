'use client';

import React, { useRef } from 'react';
import { CornerDownLeft, History, Search, X } from 'lucide-react';
import { TabType } from '../CockpitApp';
import { useFocusTrap } from './ui/useFocusTrap';
import { CommandRow } from './command-palette/CommandRow';
import { useCommandPalette } from './command-palette/useCommandPalette';

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

/**
 * Palette de commandes du Cockpit — façade de composition (`AGENTS.md` § 1).
 *
 * Recherche floue, historique des récentes, navigation clavier et scroll vivent
 * dans `useCommandPalette` ; le catalogue dans
 * `command-palette/command-definitions.ts`, le scoring dans
 * `command-palette/command-search.ts`. Les refs (input, liste, piège de focus)
 * restent dans la façade : elles ne transitent jamais par un hook.
 */
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
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const palette = useCommandPalette({
    isOpen,
    onClose,
    switchTab,
    onSelectTab,
    onOpenBackupModal,
    onOpenBackup,
    onOpenHealthModal,
    onOpenHealth,
    inputRef,
    listRef,
  });

  const dialogRef = useFocusTrap<HTMLDivElement>(isOpen, palette.handleClose);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={palette.handleClose}
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
            value={palette.query}
            onChange={(e) => {
              palette.setQuery(e.target.value);
              palette.setSelectedIndex(0);
            }}
            onKeyDown={palette.handleKeyDown}
            placeholder="Que souhaitez-vous faire ? (ex: candidatures, stages, sauvegardes...)"
            className="w-full bg-transparent px-3.5 py-4 text-sm text-white placeholder-gray-500 focus:outline-hidden"
            aria-label="Rechercher une commande"
            autoComplete="off"
            spellCheck={false}
          />
          {palette.query ? (
            <button
              type="button"
              onClick={() => {
                palette.setQuery('');
                palette.setSelectedIndex(0);
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
          {palette.filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400 space-y-1">
              <p>Aucun résultat pour "{palette.query}".</p>
              <p className="text-[11px] text-gray-500">
                Essayez un autre mot-clé comme "session", "film" ou "devis".
              </p>
            </div>
          ) : (
            <>
              {palette.showRecents && (
                <div className="mb-1">
                  <div className="flex items-center gap-2 px-3 pt-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-gray-500">
                    <History className="w-3 h-3" />
                    Récent
                  </div>
                  <div className="space-y-0.5">
                    {palette.recentCommands.map((command) => (
                      <CommandRow
                        key={command.id}
                        command={command}
                        isSelected={palette.indexOfId.get(command.id) === palette.activeIndex}
                        onRun={() => palette.runCommand(command)}
                        onHover={() => palette.setSelectedIndex(palette.indexOfId.get(command.id) ?? 0)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {palette.showGrouped ? (
                palette.grouped.map((group) => (
                  <div key={group.category} className="mb-1">
                    <div className="px-3 pt-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-gray-500">
                      {group.category}
                    </div>
                    <div className="space-y-0.5">
                      {group.items.map(({ command }) => (
                        <CommandRow
                          key={command.id}
                          command={command}
                          isSelected={palette.indexOfId.get(command.id) === palette.activeIndex}
                          onRun={() => palette.runCommand(command)}
                          onHover={() => palette.setSelectedIndex(palette.indexOfId.get(command.id) ?? 0)}
                        />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-0.5">
                  {palette.filteredCommands.map(({ command }, idx) => (
                    <CommandRow
                      key={command.id}
                      command={command}
                      isSelected={idx === palette.activeIndex}
                      onRun={() => palette.runCommand(command)}
                      onHover={() => palette.setSelectedIndex(idx)}
                    />
                  ))}
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
