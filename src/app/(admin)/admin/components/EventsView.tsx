'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Save,
  Image as ImageIcon,
} from 'lucide-react';
import { SiteEvent } from '@/lib/data/site-service';
import { upsertEvent, deleteEvent } from '@/app/(admin)/admin/actions';
import { MediaPickerModal } from './MediaPickerModal';

interface EventsViewProps {
  events: SiteEvent[];
  onEventSaved: (event: SiteEvent) => void;
  onEventDeleted: (id: string) => void;
  showToast: (msg: string) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  events,
  onEventSaved,
  onEventDeleted,
  showToast,
}) => {
  const [editingEvent, setEditingEvent] = useState<SiteEvent | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [featureInput, setFeatureInput] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    const eventToSave = { ...editingEvent };
    onEventSaved(eventToSave);
    setEditingEvent(null);
    showToast(`Prestation "${eventToSave.title}" enregistrée !`);

    await upsertEvent({
      id: eventToSave.id,
      title: eventToSave.title,
      subtitle: eventToSave.subtitle,
      badge: eventToSave.badge,
      description: eventToSave.description,
      features: eventToSave.features,
      price_indicator: eventToSave.price_indicator,
      cta_text: eventToSave.cta_text,
      cta_link: eventToSave.cta_link,
      image_url: eventToSave.image_url,
      order_index: eventToSave.order_index,
    });
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Supprimer la prestation "${title}" ?`)) return;

    onEventDeleted(id);
    showToast(`Prestation "${title}" supprimée`);
    await deleteEvent(id);
  };

  const handleAddFeature = () => {
    if (!featureInput.trim() || !editingEvent) return;
    setEditingEvent({
      ...editingEvent,
      features: [...(editingEvent.features || []), featureInput.trim()],
    });
    setFeatureInput('');
  };

  const handleRemoveFeature = (index: number) => {
    if (!editingEvent) return;
    setEditingEvent({
      ...editingEvent,
      features: (editingEvent.features || []).filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Prestations & Événements Professionnels
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
            CUC Events & Prestations
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Gérez les offres de Team Building, Spectacles Yamakasi, cascades mobiles et animations airbag.
          </p>
        </div>

        <button
          onClick={() =>
            setEditingEvent({
              id: `event-${Date.now()}`,
              title: '',
              subtitle: '',
              badge: 'NOUVELLE PRESTATION',
              description: '',
              features: ['Encadrement professionnel', 'Sécurité homologuée'],
              price_indicator: 'Sur devis',
              cta_text: 'Demander un devis',
              cta_link: '/contact-cuc',
              image_url: '',
              order_index: events.length + 1,
              is_published: true,
            })
          }
          className="px-5 py-2.5 bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-black uppercase tracking-wider rounded-lg flex items-center gap-2 shadow-lg shadow-yellow-500/10 transition-transform active:scale-95 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Ajouter une offre
        </button>
      </div>

      {/* Grille des prestations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-[#0D0D12] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-white/30 transition-all group"
          >
            <div>
              {/* Image d'illustration */}
              <div className="relative aspect-video bg-black/60 overflow-hidden">
                {event.image_url ? (
                  <Image
                    src={event.image_url}
                    alt={event.title}
                    fill
                    sizes="350px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 font-mono">
                    PAS D&apos;IMAGE
                  </div>
                )}
                {event.badge && (
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded bg-[#FFE500] text-black text-[10px] font-black uppercase tracking-wider">
                    {event.badge}
                  </span>
                )}
              </div>

              {/* Contenu */}
              <div className="p-5 space-y-3">
                <h3 className="text-lg font-bold text-white group-hover:text-[#FFE500] transition-colors">
                  {event.title}
                </h3>
                {event.subtitle && (
                  <p className="text-xs text-gray-400 font-medium line-clamp-1">{event.subtitle}</p>
                )}
                <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">
                  {event.description}
                </p>

                {event.features && event.features.length > 0 && (
                  <div className="pt-2 space-y-1.5 border-t border-white/10">
                    {event.features.slice(0, 3).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Pied de carte */}
            <div className="p-5 pt-3 border-t border-white/10 flex items-center justify-between bg-black/20">
              <span className="text-xs font-mono font-bold text-[#FFE500]">
                {event.price_indicator || 'Sur devis'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingEvent(event)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(event.id, event.title)}
                  title="Supprimer"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal d'édition de prestation */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#12121A] border border-white/10 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl my-8">
            <h3 className="text-base font-bold text-white uppercase tracking-wide">
              {editingEvent.title ? `Modifier : ${editingEvent.title}` : 'Nouvelle offre'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Titre de la prestation</label>
                <input
                  type="text"
                  required
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Sous-titre court</label>
                  <input
                    type="text"
                    value={editingEvent.subtitle || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, subtitle: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Badge</label>
                  <input
                    type="text"
                    value={editingEvent.badge || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, badge: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Description commerciale</label>
                <textarea
                  rows={3}
                  required
                  value={editingEvent.description || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">URL Image</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="/images/... ou https://..."
                    value={editingEvent.image_url || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, image_url: e.target.value })}
                    className="flex-1 bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(true)}
                    className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#FFE500]" />
                  </button>
                </div>
              </div>

              {/* Atouts & points forts */}
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Atouts inclus</label>
                <div className="space-y-1.5 mb-2">
                  {(editingEvent.features || []).map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/10 text-xs text-white"
                    >
                      <span>{feat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-gray-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: Matériel professionnel fourni..."
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    className="flex-1 bg-black/60 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white"
                  >
                    Ajouter
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Indication tarifaire</label>
                  <input
                    type="text"
                    value={editingEvent.price_indicator || ''}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, price_indicator: e.target.value })
                    }
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Texte bouton CTA</label>
                  <input
                    type="text"
                    value={editingEvent.cta_text || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, cta_text: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <MediaPickerModal
          isOpen={true}
          onClose={() => setShowMediaPicker(false)}
          onSelectUrl={(url) => {
            if (editingEvent) {
              setEditingEvent({ ...editingEvent, image_url: url });
            }
            setShowMediaPicker(false);
          }}
          title="Sélectionner l'image de la prestation"
        />
      )}
    </div>
  );
};
