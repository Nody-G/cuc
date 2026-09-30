'use client';

import React from 'react';
import { Save, AlertCircle, RotateCcw, Loader2 } from 'lucide-react';

export interface StickySaveBarProps {
  show?: boolean;
  isDirty?: boolean;
  isPending?: boolean;
  onSave: () => void | Promise<void>;
  onReset?: () => void;
  label?: string;
  saveLabel?: string;
  resetLabel?: string;
  className?: string;
}

/**
 * Barre d'enregistrement persistante et flottante pour le Cockpit.
 * Reste visible au défilement pour valider les modifications sans devoir
 * remonter ou descendre dans les longs formulaires.
 */
export const StickySaveBar: React.FC<StickySaveBarProps> = ({
  show,
  isDirty,
  isPending = false,
  onSave,
  onReset,
  label = 'Modifications en attente d’enregistrement',
  saveLabel = 'Enregistrer',
  resetLabel = 'Annuler',
  className = '',
}) => {
  const isVisible = show ?? isDirty ?? false;
  if (!isVisible) return null;

  return (
    <aside
      aria-label="Barre d'action d'enregistrement"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-2xl bg-[#0D0D12]/95 backdrop-blur-lg border-2 border-[#FFE500] rounded-xl px-4 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(255,229,0,0.18)] flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300 ${className}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFE500] opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FFE500]" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold text-white uppercase tracking-wider truncate flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-[#FFE500] shrink-0" />
            <span className="truncate">{label}</span>
          </p>
          <p className="text-[10px] font-mono text-zinc-400 hidden sm:block">
            Pensez à valider pour synchroniser le site vitrine.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onReset && (
          <button
            type="button"
            disabled={isPending}
            onClick={onReset}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">{resetLabel}</span>
          </button>
        )}

        <button
          type="button"
          disabled={isPending}
          onClick={onSave}
          className="px-4 py-2 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-black uppercase tracking-wider transition-all shadow-md hover:scale-[1.02] active:scale-98 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin text-black" />
          ) : (
            <Save className="w-4 h-4 text-black" />
          )}
          <span>{saveLabel}</span>
        </button>
      </div>
    </aside>
  );
};
