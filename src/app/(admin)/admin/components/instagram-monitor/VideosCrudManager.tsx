'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Plus, Video } from 'lucide-react';
import type { ProgrammeTvItem } from '@/data/videos';
import { getVideos } from '@/lib/data/site-service';
import { updateSiteSettings } from '../../actions';
import { VideoRowItem } from './VideoRowItem';
import { StickySaveBar } from '../ui/StickySaveBar';

interface VideosCrudManagerProps {
  showToast: (msg: string) => void;
}

export const VideosCrudManager: React.FC<VideosCrudManagerProps> = ({ showToast }) => {
  const [videos, setVideos] = useState<ProgrammeTvItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Modal or inline add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSub, setNewSub] = useState('');
  const [newImg, setNewImg] = useState('');
  const [newDmId, setNewDmId] = useState('');

  useEffect(() => {
    let cancelled = false;
    getVideos().then((data) => {
      if (!cancelled) {
        setVideos(data || []);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDmId.trim()) {
      showToast('Le titre et le lien/ID vidéo sont obligatoires.');
      return;
    }

    const newItem: ProgrammeTvItem = {
      title: newTitle.trim(),
      sub: newSub.trim() || 'Reportage officiel CUC',
      img: newImg.trim() || 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/ReportageBFMTV-Alecoledescascadeurs.webp',
      dmId: newDmId.trim(),
    };

    setVideos((prev) => [newItem, ...prev]);
    setIsDirty(true);
    setNewTitle('');
    setNewSub('');
    setNewImg('');
    setNewDmId('');
    setShowAddForm(false);
    showToast('Vidéo ajoutée à la liste (pensez à enregistrer).');
  };

  const handleUpdate = (index: number, updates: Partial<ProgrammeTvItem>) => {
    setVideos((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
    setIsDirty(true);
  };

  const handleDelete = (index: number) => {
    if (!confirm('Supprimer cette vidéo de la page ?')) return;
    setVideos((prev) => prev.filter((_, i) => i !== index));
    setIsDirty(true);
    showToast('Vidéo supprimée.');
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= videos.length) return;
    setVideos((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
    setIsDirty(true);
  };

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateSiteSettings('videos', { list: videos });
      if (res.success) {
        setIsDirty(false);
        showToast('Vidéos enregistrées et mises à jour en direct sur la page Vidéos !');
      } else {
        showToast(res.error || 'Erreur lors de l’enregistrement.');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#0b0b10] border border-zinc-800 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-tech uppercase font-bold text-[#FFE500]">
            <Video className="w-4 h-4" />
            <span>Gestion des Vidéos &amp; Reportages TV (Page /videos-cascadeur)</span>
          </div>
          <p className="text-xs font-tech text-zinc-400 mt-1">
            Gérez la liste des documentaires et reportages. Compatible avec les URL et identifiants YouTube, Dailymotion ou fichiers MP4.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFE500] hover:bg-yellow-400 text-black text-xs font-mono-tech uppercase font-bold rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Fermer' : 'Ajouter une vidéo'}</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddVideo} className="p-6 bg-[#121218] border-2 border-[#FFE500]/50 rounded-xl space-y-4 animate-in fade-in duration-200">
          <h3 className="text-sm font-mono-tech uppercase text-white font-bold flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#FFE500]" /> Nouvelle Vidéo / Reportage
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono-tech text-zinc-400 mb-1">Titre de la vidéo *</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex : Reportage TF1 — Au cœur du campus"
                className="w-full bg-black/60 border border-zinc-700 rounded p-2.5 text-xs text-white focus:border-[#FFE500] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-mono-tech text-zinc-400 mb-1">Sous-titre / Chaîne / Année</label>
              <input
                type="text"
                value={newSub}
                onChange={(e) => setNewSub(e.target.value)}
                placeholder="Ex : Série TV France 2 & CUC"
                className="w-full bg-black/60 border border-zinc-700 rounded p-2.5 text-xs text-white focus:border-[#FFE500] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono-tech text-zinc-400 mb-1">
                Lien ou ID vidéo (YouTube, Dailymotion ou MP4) *
              </label>
              <input
                type="text"
                required
                value={newDmId}
                onChange={(e) => setNewDmId(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... ou x9uewe0"
                className="w-full bg-black/60 border border-zinc-700 rounded p-2.5 text-xs text-white focus:border-[#FFE500] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-mono-tech text-zinc-400 mb-1">URL de l&apos;image de vignette (poster)</label>
              <input
                type="text"
                value={newImg}
                onChange={(e) => setNewImg(e.target.value)}
                placeholder="https://... ou /images/..."
                className="w-full bg-black/60 border border-zinc-700 rounded p-2.5 text-xs text-white focus:border-[#FFE500] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-zinc-700 text-xs font-mono-tech text-zinc-300 hover:text-white rounded"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#FFE500] text-black font-bold text-xs font-mono-tech uppercase rounded hover:bg-yellow-400"
            >
              Ajouter
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-zinc-500 font-mono-tech text-xs">
          Chargement des vidéos...
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 font-mono-tech text-xs bg-[#0b0b10] border border-zinc-800 rounded-xl">
          Aucune vidéo enregistrée pour le moment.
        </div>
      ) : (
        <div className="space-y-3">
          {videos.map((vid, idx) => (
            <VideoRowItem
              key={idx}
              video={vid}
              index={idx}
              isFirst={idx === 0}
              isLast={idx === videos.length - 1}
              onMove={(dir) => handleMove(idx, dir)}
              onUpdate={(updates) => handleUpdate(idx, updates)}
              onDelete={() => handleDelete(idx)}
            />
          ))}
        </div>
      )}

      {/* Barre de sauvegarde flottante */}
      <StickySaveBar
        isDirty={isDirty}
        isPending={isPending}
        onSave={handleSave}
        label="Modifications des vidéos non enregistrées"
      />
    </div>
  );
};
