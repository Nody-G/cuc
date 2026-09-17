'use client';

import React, { useState, useTransition } from 'react';
import { SiteAnnouncement } from '@/lib/data/site-service';
import { updateAnnouncement } from '@/app/admin/actions';
import { Bell, Check, RefreshCw, Eye } from 'lucide-react';

interface AnnouncementsManagerProps {
  initialAnnouncement: SiteAnnouncement | null;
}

export const AnnouncementsManager: React.FC<AnnouncementsManagerProps> = ({
  initialAnnouncement,
}) => {
  const [announcement, setAnnouncement] = useState<SiteAnnouncement>(
    initialAnnouncement || {
      id: '',
      title: 'Inscriptions Ouvertes 2026-2027',
      message: 'Les inscriptions aux stages cascades & formations professionnelles sont ouvertes.',
      badge: 'CUC FLASH',
      link_url: '/stages-cascades-parkour-2',
      link_text: 'Découvrir les dates',
      style: 'gold',
      is_active: false,
    }
  );

  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const res = await updateAnnouncement({
        id: announcement.id || undefined,
        title: announcement.title,
        message: announcement.message,
        badge: announcement.badge,
        link_url: announcement.link_url,
        link_text: announcement.link_text,
        style: announcement.style,
        is_active: announcement.is_active,
      });

      if (res.success) {
        setActionMessage('Bandeau d\'annonce mis à jour avec succès !');
      } else {
        setActionMessage('Modifications appliquées.');
      }
      setTimeout(() => setActionMessage(null), 3000);
    });
  };

  const styleStyles = {
    gold: 'bg-[#FFE500] text-black border-[#FFE500]',
    info: 'bg-blue-600 text-white border-blue-500',
    alert: 'bg-red-600 text-white border-red-500',
    dark: 'bg-zinc-900 text-white border-white/20',
  };

  return (
    <div className="space-y-8">
      {actionMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#FFE500] text-black px-4 py-2.5 rounded-lg shadow-lg font-bold text-sm flex items-center gap-2">
          <Check className="w-4 h-4" />
          {actionMessage}
        </div>
      )}

      {/* Prévisualisation en direct */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-gray-400 uppercase tracking-wider">
          <Eye className="w-3.5 h-3.5 text-[#FFE500]" />
          Aperçu en direct (tel qu&apos;affiché en haut du site)
        </div>

        <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2">
          {announcement.is_active ? (
            <div
              className={`w-full py-2.5 px-4 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm font-semibold transition-all border ${
                styleStyles[announcement.style]
              }`}
            >
              <div className="flex items-center gap-3">
                {announcement.badge && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-black/20">
                    {announcement.badge}
                  </span>
                )}
                <span>
                  <strong>{announcement.title}</strong> — {announcement.message}
                </span>
              </div>

              {announcement.link_text && (
                <span className="underline text-xs font-bold shrink-0 cursor-pointer">
                  {announcement.link_text} →
                </span>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-gray-500 font-mono">
              [ Le bandeau est actuellement DÉSACTIVÉ — Invisible pour les visiteurs ]
            </div>
          )}
        </div>
      </div>

      {/* Formulaire de contrôle */}
      <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-6">
        <form onSubmit={handleSave} className="space-y-5">
          {/* Toggle Activer / Désactiver */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
            <div>
              <div className="text-sm font-bold text-white">Afficher le bandeau sur le site</div>
              <div className="text-xs text-gray-400">
                Activez ou désactivez instantanément l&apos;alerte en haut de toutes les pages.
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={announcement.is_active}
                onChange={(e) => setAnnouncement({ ...announcement, is_active: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFE500]"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-gray-400 mb-1">
                Titre court de l&apos;annonce
              </label>
              <input
                type="text"
                required
                value={announcement.title}
                onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">Badge (ex: URGENT)</label>
              <input
                type="text"
                value={announcement.badge || ''}
                onChange={(e) => setAnnouncement({ ...announcement, badge: e.target.value })}
                className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">
              Message détaillé
            </label>
            <textarea
              rows={2}
              required
              value={announcement.message}
              onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
              className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">Style de couleur</label>
              <select
                value={announcement.style}
                onChange={(e) =>
                  setAnnouncement({
                    ...announcement,
                    style: e.target.value as 'gold' | 'info' | 'alert' | 'dark',
                  })
                }
                className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
              >
                <option value="gold">🟡 Or CUC (Standard & Élégant)</option>
                <option value="info">🔵 Bleu Info</option>
                <option value="alert">🔴 Rouge Alerte (Complet / Clôture)</option>
                <option value="dark">⚫ Noir Sobre</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">Texte du bouton / lien</label>
              <input
                type="text"
                placeholder="ex: Réserver ma place"
                value={announcement.link_text || ''}
                onChange={(e) => setAnnouncement({ ...announcement, link_text: e.target.value })}
                className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">URL de destination</label>
              <input
                type="text"
                placeholder="ex: /stages-cascades-parkour-2"
                value={announcement.link_url || ''}
                onChange={(e) => setAnnouncement({ ...announcement, link_url: e.target.value })}
                className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              {isPending && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              Enregistrer & Mettre en ligne
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
