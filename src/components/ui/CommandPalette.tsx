'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { soundFX } from '@/lib/soundFx';
import {
  X,
  ChevronRight,
} from 'lucide-react';
import { COMMAND_ITEMS, type CommandItem } from './command-palette/commandPalette.data';

export type { CommandItem };

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter items by search query
  const filteredItems = COMMAND_ITEMS.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  // Reset search when palette opens
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }

  const executeItem = useCallback((item: CommandItem) => {
    soundFX.playTacticalClick();
    onClose();
    if (item.action) {
      item.action();
    } else if (item.href) {
      if (item.href.startsWith('http') || item.href.startsWith('tel:')) {
        window.location.href = item.href;
      } else {
        router.push(item.href);
      }
    }
  }, [onClose, router]);

  // Focus input and play sound when modal opens
  useEffect(() => {
    if (isOpen) {
      soundFX.playClapper();
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Global Keyboard Listener: Cmd+K / Ctrl+K & Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
        soundFX.playTacticalClick();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
        soundFX.playTacticalClick();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          executeItem(filteredItems[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose, executeItem]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 p-4 selection:bg-[#FFE500] selection:text-black">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Tactical Palette Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative w-full max-w-2xl bg-[#0b0b10] border-2 border-[#FFE500] shadow-[0_0_50px_rgba(255,229,0,0.25)] flex flex-col overflow-hidden z-10"
          >
            {/* Corner HUD Markers */}

            {/* Input Search Field Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-800 bg-[#0e0e14]">
              <div className="relative w-6 h-6 shrink-0">
                <Image
                  src="/images/logos/cuc-logo-yellow.png"
                  alt="CUC"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Rechercher une installation, formation, cascadeur, plan 3D, simulateur..."
                className="w-full bg-transparent text-sm sm:text-base font-mono-tech text-white placeholder-zinc-500 focus:outline-none tracking-wide"
              />
              <button
                onClick={onClose}
                className="p-1.5 text-zinc-400 hover:text-white border border-zinc-800 bg-black cursor-pointer"
                title="Fermer (Échap)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results List */}
            <div
              ref={listRef}
              className="max-h-[380px] sm:max-h-[460px] overflow-y-auto p-2 space-y-1 divide-y divide-zinc-900/50"
            >
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 font-mono-tech text-xs">
                  Aucun résultat trouvé pour "{query}". Essayez : "3D", "Chutes", "AFDAS", "Tour", "Lucas".
                </div>
              ) : (
                filteredItems.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => executeItem(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full text-left p-3 flex items-center justify-between gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#181824] border-l-4 border-[#FFE500] text-white pl-4'
                          : 'bg-transparent text-zinc-300 hover:bg-[#121218]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 truncate">
                        <div
                          className={`w-8 h-8 rounded-none border flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-[#FFE500]/10 border-[#FFE500]' : 'bg-[#121218] border-zinc-800'
                          }`}
                        >
                          {item.icon}
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <span className="font-display uppercase text-sm sm:text-base tracking-wide text-white truncate">
                              {item.title}
                            </span>
                            <span className="text-[9px] font-mono-tech px-1.5 py-0.2 bg-zinc-800 text-zinc-400">
                              {item.category}
                            </span>
                          </div>
                          <span className="text-xs font-tech text-zinc-400 block truncate mt-0.5">
                            {item.subtitle}
                          </span>
                        </div>
                      </div>

                      <ChevronRight
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isSelected ? 'text-[#FFE500] translate-x-1' : 'text-zinc-600'
                        }`}
                      />
                    </button>
                  );
                })
              )}
            </div>

            {/* Tactical Footer Keys Legend */}
            <div className="px-4 py-2.5 bg-[#08080c] border-t border-zinc-800 flex flex-wrap items-center justify-between text-[10px] font-mono-tech text-zinc-500">
              <div className="flex items-center gap-3">
                <span>
                  <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-300 border border-zinc-700">↑</kbd>{' '}
                  <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-300 border border-zinc-700">↓</kbd> Naviguer
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-300 border border-zinc-700">ENTRÉE</kbd> Ouvrir
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-300 border border-zinc-700">ÉCHAP</kbd> Quitter
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-[#FFE500]">
                <div className="relative w-4 h-4 shrink-0">
                  <Image
                    src="/images/logos/cuc-logo-yellow.png"
                    alt="CUC"
                    width={16}
                    height={16}
                    className="object-contain"
                  />
                </div>
                <span>CAMPUS UNIVERS CASCADES // HUD 2026</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
