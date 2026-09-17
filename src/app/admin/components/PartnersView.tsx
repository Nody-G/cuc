'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Handshake,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Save,
  Image as ImageIcon,
} from 'lucide-react';
import { SitePartner } from '@/lib/data/site-service';
import { upsertPartner, deletePartner } from '@/app/admin/actions';
import { MediaPickerModal } from './MediaPickerModal';

interface PartnersViewProps {
  partners: SitePartner[];
  onPartnerSaved: (partner: SitePartner) => void;
  onPartnerDeleted: (id: string) => void;
  showToast: (msg: string) => void;
}

export const PartnersView: React.FC<PartnersViewProps> = ({
  partners,
  onPartnerSaved,
  onPartnerDeleted,
  showToast,
}) => {
  const [editingPartner, setEditingPartner] = useState<SitePartner | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartner) return;

    const partnerToSave = { ...editingPartner };
    onPartnerSaved(partnerToSave);
    setEditingPartner(null);
    showToast(`Partenaire "${partnerToSave.name}" enregistré !`);

    await upsertPartner({
      id: partnerToSave.id,
      name: partnerToSave.name,
      category: partnerToSave.category,
      logo_url: partnerToSave.logo_url,
      website_url: partnerToSave.website_url,
      description: partnerToSave.description,
      order_index: partnerToSave.order_index,
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer le partenaire "${name}" ?`)) return;

    onPartnerDeleted(id);
    showToast(`Partenaire "${name}" supprimé`);
    await deletePartner(id);
  };

  const filteredPartners =
    filterCategory === 'all'
      ? partners
      : partners.filter((p) => p.category === filterCategory);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
            <Handshake className="w-3.5 h-3.5" /> Écosystème & Industrie
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
            Partenaires & Marques
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Gérez les productions de cinéma, équipementiers et partenaires institutionnels affichés sur le site.
          </p>
        </div>

        <button
          onClick={() =>
            setEditingPartner({
              id: `partner-${Date.now()}`,
              name: '',
              category: 'cinema',
              logo_url: '',
              website_url: '',
              order_index: partners.length + 1,
              is_published: true,
            })
          }
          className="px-5 py-2.5 bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-black uppercase tracking-wider rounded-lg flex items-center gap-2 shadow-lg shadow-yellow-500/10 transition-transform active:scale-95 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Ajouter un partenaire
        </button>
      </div>

      {/* Filtres de catégorie */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {[
          { id: 'all', label: 'Tous les partenaires' },
          { id: 'cinema', label: '🎬 Cinéma & Productions' },
          { id: 'institutionnel', label: '🏛️ Institutionnels & Labels' },
          { id: 'materiel', label: '🛡️ Équipements & Sécurité' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterCategory === cat.id
                ? 'bg-[#FFE500] text-black'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grille des partenaires */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPartners.map((partner) => (
          <div
            key={partner.id}
            className="bg-[#0D0D12] border border-white/10 rounded-xl p-5 flex flex-col justify-between hover:border-white/30 transition-all group"
          >
            <div>
              <div className="relative aspect-[3/2] bg-black/40 rounded-lg p-3 flex items-center justify-center border border-white/5 overflow-hidden mb-3">
                {partner.logo_url ? (
                  <Image
                    src={partner.logo_url}
                    alt={partner.name}
                    fill
                    sizes="180px"
                    className="object-contain p-2 group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <span className="text-xs text-gray-500 font-mono">PAS DE LOGO</span>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-bold text-white truncate">{partner.name}</div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-gray-300 uppercase">
                  {partner.category}
                </span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
              {partner.website_url ? (
                <a
                  href={partner.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-gray-400 hover:text-[#FFE500] flex items-center gap-1"
                >
                  <span>Site web</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setEditingPartner(partner)}
                  className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                  title="Modifier"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(partner.id, partner.name)}
                  className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal d'édition partenaire */}
      {editingPartner && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12121A] border border-white/10 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white uppercase tracking-wide">
              {editingPartner.name ? `Modifier : ${editingPartner.name}` : 'Nouveau partenaire'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Nom du partenaire</label>
                <input
                  type="text"
                  required
                  value={editingPartner.name}
                  onChange={(e) => setEditingPartner({ ...editingPartner, name: e.target.value })}
                  className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Catégorie</label>
                <select
                  value={editingPartner.category}
                  onChange={(e) =>
                    setEditingPartner({
                      ...editingPartner,
                      category: e.target.value as 'cinema' | 'institutionnel' | 'materiel' | 'media',
                    })
                  }
                  className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                >
                  <option value="cinema">🎬 Cinéma & Productions</option>
                  <option value="institutionnel">🏛️ Institutionnels & Certifications</option>
                  <option value="materiel">🛡️ Équipementiers & Sécurité</option>
                  <option value="media">📺 Médias & Presse</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">URL du Logo</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={editingPartner.logo_url}
                    onChange={(e) => setEditingPartner({ ...editingPartner, logo_url: e.target.value })}
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

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Lien vers le site web</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={editingPartner.website_url || ''}
                  onChange={(e) => setEditingPartner({ ...editingPartner, website_url: e.target.value })}
                  className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingPartner(null)}
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
            if (editingPartner) {
              setEditingPartner({ ...editingPartner, logo_url: url });
            }
            setShowMediaPicker(false);
          }}
          title="Sélectionner le logo du partenaire"
        />
      )}
    </div>
  );
};
