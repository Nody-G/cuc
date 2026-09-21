'use client';

import React from 'react';
import { HardDrive } from 'lucide-react';
import { MediaExplorer } from './media/MediaExplorer';

interface MediaLibraryViewProps {
  showToast: (msg: string) => void;
}

/**
 * Onglet « Médiathèque Storage » du Cockpit.
 *
 * L'explorateur lui-même est partagé avec le sélecteur d'image des vues
 * éditoriales (`MediaExplorer`) : navigation réelle dans tout le bucket
 * (`media/cuc-visual`, `media/document`, `media/partner-logo`, `uploads`…),
 * recherche globale, filtres, sélection multiple, panneau détail et
 * suppression réversible.
 */
export const MediaLibraryView: React.FC<MediaLibraryViewProps> = ({ showToast }) => {
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
          <HardDrive className="w-3.5 h-3.5" /> Supabase Storage — Bucket Public CUC
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
          Médiathèque & Fichiers
        </h1>
        <p className="text-sm text-gray-400 mt-1 max-w-3xl">
          Tout le bucket, dossier par dossier : recherche globale, filtres par type, tri, aperçu
          détaillé, sélection multiple, déplacement, copie d'URL et suppression réversible
          (corbeille <code className="text-[#FFE500]">_trash</code>).
        </p>
      </div>

      <MediaExplorer mode="manage" showToast={showToast} />
    </div>
  );
};
