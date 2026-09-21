'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';
import { useFocusTrap } from './ui/useFocusTrap';

interface ShortcutsHelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ShortcutGroup {
    title: string;
    shortcuts: { keys: string[]; label: string }[];
}

const IS_MAC =
    typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform || '');
const MOD = IS_MAC ? '⌘' : 'Ctrl';

const GROUPS: ShortcutGroup[] = [
    {
        title: 'Général',
        shortcuts: [
            { keys: [MOD, 'K'], label: 'Ouvrir la barre de commandes' },
            { keys: [MOD, 'B'], label: 'Replier / déplier la navigation latérale' },
            { keys: [MOD, '/'], label: 'Afficher cette aide' },
            { keys: ['Échap'], label: 'Fermer la fenêtre active' },
        ],
    },
    {
        title: 'Navigation rapide',
        shortcuts: [
            { keys: ['Alt', '1'], label: 'Tableau de bord' },
            { keys: ['Alt', '2'], label: 'Candidatures' },
            { keys: ['Alt', '3'], label: 'Pages vitrines' },
            { keys: ['Alt', '4'], label: 'Sessions' },
            { keys: ['Alt', '5'], label: 'Équipe & coachs' },
            { keys: ['Alt', '6'], label: 'Films & crédits' },
        ],
    },
    {
        title: 'Outils système',
        shortcuts: [
            { keys: [MOD, 'Shift', 'B'], label: 'Sauvegarde / restauration' },
            { keys: [MOD, 'Shift', 'H'], label: 'Diagnostic système' },
        ],
    },
];

export const ShortcutsHelpModal: React.FC<ShortcutsHelpModalProps> = ({ isOpen, onClose }) => {
    const dialogRef = useFocusTrap<HTMLDivElement>(isOpen, onClose);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
                    onClick={onClose}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Raccourcis clavier"
                >
                    <motion.div
                        ref={dialogRef}
                        initial={{ opacity: 0, scale: 0.96, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 8 }}
                        transition={{ duration: 0.18 }}
                        className="bg-[#0D0D12] border border-white/15 rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.95)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#121218]">
                            <div className="flex items-center gap-2.5">
                                <Keyboard className="w-4 h-4 text-[#FFE500]" />
                                <h2 className="text-sm font-black uppercase tracking-wider text-white">
                                    Raccourcis clavier
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Fermer"
                                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
                            {GROUPS.map((group) => (
                                <div key={group.title}>
                                    <div className="text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-2">
                                        {group.title}
                                    </div>
                                    <div className="space-y-1">
                                        {group.shortcuts.map((shortcut) => (
                                            <div
                                                key={shortcut.label}
                                                className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors"
                                            >
                                                <span className="text-xs text-gray-300">{shortcut.label}</span>
                                                <span className="flex items-center gap-1 shrink-0 ml-3">
                                                    {shortcut.keys.map((key, idx) => (
                                                        <React.Fragment key={`${shortcut.label}-${key}-${idx}`}>
                                                            {idx > 0 && <span className="text-gray-600 text-[10px]">+</span>}
                                                            <kbd className="px-2 py-0.5 text-[10px] font-mono text-gray-200 bg-white/5 border border-white/15 rounded-md min-w-[24px] text-center">
                                                                {key}
                                                            </kbd>
                                                        </React.Fragment>
                                                    ))}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="px-5 py-3 bg-[#08080C] border-t border-white/10 text-[11px] font-mono text-gray-500">
                            Les raccourcis sont désactivés lorsque vous saisissez du texte dans un champ.
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
