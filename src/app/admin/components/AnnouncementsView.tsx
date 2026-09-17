'use client';

import React, { useTransition } from 'react';
import { Bell, Eye } from 'lucide-react';
import { SiteAnnouncement } from '@/lib/data/site-service';
import { updateAnnouncement } from '@/app/admin/actions';

interface AnnouncementsViewProps {
  announcement: SiteAnnouncement;
  setAnnouncement: React.Dispatch<React.SetStateAction<SiteAnnouncement>>;
  showToast: (msg: string) => void;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  announcement,
  setAnnouncement,
  showToast,
}) => {
  const [, startTransition] = useTransition();

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Bandeau d\'annonce mis à jour en direct !');

    startTransition(async () => {
      await updateAnnouncement({
        id: announcement.id || undefined,
        title: announcement.title,
        message: announcement.message,
        badge: announcement.badge,
        link_url: announcement.link_url,
        link_text: announcement.link_text,
        style: announcement.style,
        is_active: announcement.is_active,
      });
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
          <Bell className="w-3.5 h-3.5" /> Flash Info &amp; Alertes
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
          Bandeau d&apos;Alerte en Ligne
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Affichez ou désactivez une annonce instantanée au sommet du site vitrine.
        </p>
      </div>

      {/* Prévisualisation dynamique */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-gray-400 uppercase tracking-wider">
          <Eye className="w-3.5 h-3.5 text-[#FFE500]" />
          Aperçu en direct
        </div>
        <div className="p-4 rounded-xl bg-black/60 border border-white/10">
          {announcement.is_active ? (
            <div
              className={`w-full py-2.5 px-4 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm font-semibold border ${
                announcement.style === 'gold'
                  ? 'bg-[#FFE500] text-black border-[#FFE500]'
                  : announcement.style === 'alert'
                  ? 'bg-red-600 text-white border-red-500'
                  : announcement.style === 'info'
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-zinc-900 text-white border-white/20'
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
                <span className="underline text-xs font-bold shrink-0">
                  {announcement.link_text} →
                </span>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-gray-500 font-mono">
              [ Bandeau DÉSACTIVÉ — Invisible sur le site public ]
            </div>
          )}
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSaveAnnouncement} className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
          <div>
            <div className="text-sm font-bold text-white">Activer le bandeau sur le site</div>
            <div className="text-xs text-gray-400">
              Visible par tous les visiteurs au sommet de chaque page.
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
            <label className="block text-xs font-mono text-gray-400 mb-1">Titre court</label>
            <input
              type="text"
              required
              value={announcement.title}
              onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
              className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">Badge</label>
            <input
              type="text"
              value={announcement.badge || ''}
              onChange={(e) => setAnnouncement({ ...announcement, badge: e.target.value })}
              className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-gray-400 mb-1">Message</label>
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
              <option value="gold">🟡 Or CUC</option>
              <option value="info">🔵 Bleu Info</option>
              <option value="alert">🔴 Rouge Alerte</option>
              <option value="dark">⚫ Noir Sobre</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">Texte du lien</label>
            <input
              type="text"
              value={announcement.link_text || ''}
              onChange={(e) => setAnnouncement({ ...announcement, link_text: e.target.value })}
              className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">Lien de redirection</label>
            <input
              type="text"
              value={announcement.link_url || ''}
              onChange={(e) => setAnnouncement({ ...announcement, link_url: e.target.value })}
              className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-black uppercase tracking-wider flex items-center gap-2"
          >
            Enregistrer &amp; Mettre en ligne
          </button>
        </div>
      </form>
    </div>
  );
};
