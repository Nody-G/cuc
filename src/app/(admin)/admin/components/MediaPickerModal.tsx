'use client';

import React from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { MediaExplorer } from './media/MediaExplorer';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUrl: (url: string) => void;
  title?: string;
}

/**
 * Sélecteur d'image du Cockpit.
 *
 * Il réutilise l'explorateur complet (`MediaExplorer` en mode `pick`) : même
 * navigation dans les dossiers réels du bucket, même recherche, même aperçu —
 * au lieu de la seule liste du dossier `uploads/`. Aucune de ses sept vues
 * consommatrices n'a besoin de changer d'API.
 */
export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectUrl,
  title = 'Choisir une image dans la médiathèque',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto bg-[#0A0A0E] border border-white/15 rounded-2xl shadow-2xl">
        <header className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <ImageIcon className="w-4 h-4 text-[#FFE500] shrink-0" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider truncate">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la médiathèque"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="p-4 sm:p-6">
          <MediaExplorer mode="pick" showToast={() => undefined} onSelect={onSelectUrl} />
        </div>
      </div>
    </div>
  );
};
