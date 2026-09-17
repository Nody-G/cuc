'use client';

import React from 'react';
import {
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  MoveVertical,
  Edit3,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { LayoutSection } from '@/lib/data/site-service';

interface PageLayoutManagerProps {
  layoutSections: LayoutSection[];
  onChange: (sections: LayoutSection[]) => void;
  onEditSection?: (sectionId: string) => void;
}

export const PageLayoutManager: React.FC<PageLayoutManagerProps> = ({
  layoutSections,
  onChange,
  onEditSection,
}) => {
  // Tri des sections par ordre croissant
  const sortedSections = [...(layoutSections || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...sortedSections];
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;

    // Réassigner les index d'ordre
    const updated = newItems.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));
    onChange(updated);
  };

  const moveDown = (index: number) => {
    if (index === sortedSections.length - 1) return;
    const newItems = [...sortedSections];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;

    // Réassigner les index d'ordre
    const updated = newItems.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));
    onChange(updated);
  };

  const toggleVisibility = (id: string) => {
    const updated = sortedSections.map((item) => {
      if (item.id === id) {
        return { ...item, is_visible: !item.is_visible };
      }
      return item;
    });
    onChange(updated);
  };

  if (!sortedSections || sortedSections.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-white/10 rounded-xl space-y-2 bg-[#0A0A0E]">
        <MoveVertical className="w-8 h-8 text-gray-500 mx-auto" />
        <p className="text-sm text-gray-300 font-medium">
          Aucun agencement personnalisé pour cette page.
        </p>
        <p className="text-xs text-gray-500">
          Les sections par défaut du campus s&apos;affichent automatiquement.
        </p>
      </div>
    );
  }

  const visibleCount = sortedSections.filter((s) => s.is_visible).length;

  return (
    <div className="space-y-4">
      {/* Bandeau d'aide et statut */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-[#0D0D12] border border-white/10 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-[#FFE500]/10 text-[#FFE500]">
            <MoveVertical className="w-4 h-4" />
          </span>
          <div>
            <div className="text-white font-bold uppercase tracking-wider">
              Disposition &amp; Agencement des Blocs
            </div>
            <div className="text-gray-400 text-[11px] mt-0.5">
              Utilisez les flèches pour modifier l&apos;ordre d&apos;apparition des sections sur le site.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-gray-300">
            <strong className="text-[#FFE500]">{visibleCount}</strong> / {sortedSections.length} sections actives
          </span>
        </div>
      </div>

      {/* Liste des sections ordonnées */}
      <div className="space-y-2.5">
        {sortedSections.map((section, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === sortedSections.length - 1;
          const isVisible = section.is_visible !== false;

          return (
            <div
              key={section.id}
              className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl border transition-all ${
                isVisible
                  ? 'bg-[#0D0D12] border-white/10 hover:border-white/20'
                  : 'bg-black/40 border-white/5 opacity-60'
              }`}
            >
              {/* Gauche : Numéro + Nom du bloc */}
              <div className="flex items-center gap-3.5 min-w-0">
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-black ${
                    isVisible
                      ? 'bg-[#FFE500] text-black shadow-xs shadow-yellow-500/20'
                      : 'bg-white/10 text-gray-500'
                  }`}
                >
                  #{idx + 1}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white uppercase tracking-tight truncate">
                      {section.name || section.id}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-gray-400 border border-white/5">
                      id: {section.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                    {isVisible ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3 h-3" /> Visible sur le site
                      </span>
                    ) : (
                      <span className="text-gray-500 flex items-center gap-1 font-mono">
                        <AlertCircle className="w-3 h-3" /> Masqué au public
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Droite : Actions monter/descendre, visibilité, et édition */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {onEditSection && (
                  <button
                    type="button"
                    onClick={() => onEditSection(section.id)}
                    className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-medium border border-white/10 transition-colors"
                    title="Modifier les textes de ce bloc"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#FFE500]" />
                    <span>Modifier</span>
                  </button>
                )}

                {/* Bouton Visibilité */}
                <button
                  type="button"
                  onClick={() => toggleVisibility(section.id)}
                  title={isVisible ? 'Masquer cette section' : 'Rendre visible'}
                  className={`p-2 rounded-lg text-xs font-bold transition-colors border ${
                    isVisible
                      ? 'bg-white/5 hover:bg-white/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                  }`}
                >
                  {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                {/* Bouton Monter */}
                <button
                  type="button"
                  disabled={isFirst}
                  onClick={() => moveUp(idx)}
                  title="Déplacer vers le haut"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white disabled:opacity-20 disabled:hover:bg-white/5 border border-white/10 transition-colors"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>

                {/* Bouton Descendre */}
                <button
                  type="button"
                  disabled={isLast}
                  onClick={() => moveDown(idx)}
                  title="Déplacer vers le bas"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white disabled:opacity-20 disabled:hover:bg-white/5 border border-white/10 transition-colors"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
