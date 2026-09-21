'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import {
  Plus,
  Edit2,
  Trash2,
  Navigation,
  Shield,
  Compass,
  ImageIcon,
  Eye,
  EyeOff,
} from 'lucide-react';
import { POI } from '@/components/ui/campus-map/campusMap.data';
import { Discipline } from '@/types';
import { upsertCampusPOI, deleteCampusPOI, updateSiteSettings } from '../actions';
import { MediaPickerModal } from './MediaPickerModal';

interface CampusZonesViewProps {
  campusPOIs: POI[];
  setCampusPOIs: React.Dispatch<React.SetStateAction<POI[]>>;
  disciplines: Discipline[];
  showToast: (msg: string) => void;
}

export const CampusZonesView: React.FC<CampusZonesViewProps> = ({
  campusPOIs,
  setCampusPOIs,
  disciplines,
  showToast,
}) => {
  const [, startTransition] = useTransition();
  const [editingPOI, setEditingPOI] = useState<POI | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const categories = Array.from(new Set(campusPOIs.map((p) => p.category)));

  const filteredPOIs = campusPOIs
    .filter((p) => (selectedCategory === 'all' ? true : p.category === selectedCategory))
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPOI) return;

    let nextList: POI[] = [];
    setCampusPOIs((prev) => {
      const exists = prev.some((p) => p.id === editingPOI.id);
      nextList = exists
        ? prev.map((p) => (p.id === editingPOI.id ? editingPOI : p))
        : [...prev, editingPOI];
      return nextList;
    });

    setEditingPOI(null);
    showToast(`Zone "${editingPOI.name}" enregistrée !`);

    startTransition(async () => {
      await upsertCampusPOI(editingPOI);
      await updateSiteSettings('campus_pois', { list: nextList });
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Supprimer cet aménagement du campus ?')) return;

    const nextList = campusPOIs.filter((p) => p.id !== id);
    setCampusPOIs(nextList);

    showToast('Zone supprimée.');

    startTransition(async () => {
      await deleteCampusPOI(id);
      await updateSiteSettings('campus_pois', { list: nextList });
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                Infrastructures & Zones du Campus (6 Ha)
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {campusPOIs.length} Zones
                </span>
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                Configurez les points d’intérêt du parc de 6 hectares, leurs coordonnées et les modules associés.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingPOI({
              id: `zone-${Date.now()}`,
              name: '',
              category: 'Hauteur & Chutes Libres',
              description: '',
              specs: '',
              coordinates: '50.0910° N, 3.5375° E',
              badge: 'NOUVEL ESPACE',
              xPercent: 50,
              yPercent: 50,
              image_url: '',
              order_index: campusPOIs.length + 1,
              is_active: true,
            });
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-cuc-gold text-black font-semibold rounded-xl hover:bg-yellow-400 transition shadow-lg shadow-cuc-gold/10 text-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Ajouter une Zone
        </button>
      </div>

      {/* Aperçu cartographique du domaine */}
      <div className="relative w-full h-56 bg-zinc-950 rounded-2xl border border-zinc-800/80 overflow-hidden shadow-2xl p-4 flex flex-col justify-between">
        {/* Grille Radar */}
        <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-48 rounded-full border border-zinc-800/80 animate-pulse" />
          <div className="w-32 h-32 rounded-full border border-zinc-800/60 absolute" />
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Plan du campus • Le Cateau-Cambrésis (Nord)
          </div>
          <span className="text-[11px] font-mono text-zinc-500">60 000 m² Domaine Privé</span>
        </div>

        {/* POI Markers sur le Radar */}
        <div className="absolute inset-0 pointer-events-none">
          {campusPOIs.map((poi) => (
            <div
              key={poi.id}
              style={{ left: `${poi.xPercent}%`, top: `${poi.yPercent}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group/pin pointer-events-auto"
            >
              <div className="relative cursor-pointer" onClick={() => setEditingPOI(poi)}>
                <span className="flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cuc-gold opacity-60" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-cuc-gold border-2 border-black" />
                </span>
                <div className="absolute left-5 top-0 hidden group-hover/pin:block bg-black/90 border border-zinc-700 text-white text-[11px] px-2.5 py-1 rounded-lg whitespace-nowrap z-30 shadow-xl backdrop-blur">
                  <p className="font-bold text-cuc-gold">{poi.name}</p>
                  <p className="text-zinc-400 text-[10px]">{poi.category}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10 text-[11px] text-zinc-500">
          Cliquez sur un point pour l&apos;éditer directement sur le radar.
        </div>
      </div>

      {/* Filtres de catégorie */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${selectedCategory === 'all'
            ? 'bg-cuc-gold text-black shadow-md shadow-cuc-gold/20'
            : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
        >
          Toutes les zones ({campusPOIs.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${selectedCategory === cat
              ? 'bg-cuc-gold text-black shadow-md shadow-cuc-gold/20'
              : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grille des Zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPOIs.map((poi) => {
          const associatedDisciplines = disciplines.filter((d) => d.campus_zone_id === poi.id);

          return (
            <div
              key={poi.id}
              className="group bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800/80 rounded-2xl p-6 hover:border-cuc-gold/40 transition-all duration-300 flex flex-col justify-between shadow-xl"
            >
              <div className="space-y-4">
                {/* Visuel de la zone */}
                {poi.image_url ? (
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-zinc-800 bg-black">
                    <Image
                      src={poi.image_url}
                      alt={poi.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                ) : null}

                {/* Header Card */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                        {poi.badge || poi.category}
                      </span>
                      {poi.location_id && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                          ✓ CUC Sign lié
                        </span>
                      )}
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${poi.is_active === false
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}
                      >
                        {poi.is_active === false ? 'Brouillon' : 'Publié'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-cuc-gold transition-colors mt-2">
                      {poi.name}
                    </h3>
                    <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-1 font-mono">
                      <Navigation className="w-3.5 h-3.5 text-zinc-500" />
                      {poi.coordinates} • Radar ({poi.xPercent}%, {poi.yPercent}%)
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingPOI(poi)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-cuc-gold hover:text-black text-zinc-300 border border-zinc-700 transition"
                      title="Modifier"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(poi.id)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-500 hover:text-white text-zinc-300 border border-zinc-700 transition"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">{poi.description}</p>

                {/* Spécifications Techniques */}
                <div className="p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-xl text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                    Spécifications & Équipements
                  </span>
                  <p className="text-zinc-300 font-mono text-[11px]">{poi.specs}</p>
                </div>

                {/* Modules & Disciplines Enseignés Ici */}
                <div className="pt-2 border-t border-zinc-800/80">
                  <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5 mb-2">
                    <Shield className="w-3.5 h-3.5 text-cuc-gold" />
                    Modules de cascade pratiqués dans cette zone :
                  </span>
                  {associatedDisciplines.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {associatedDisciplines.map((d) => (
                        <span
                          key={d.id}
                          className="px-2.5 py-1 bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-lg text-xs flex items-center gap-1.5"
                        >
                          <span className="text-cuc-gold font-mono font-bold text-[10px]">
                            {d.number}
                          </span>
                          <span className="truncate max-w-[150px]">{d.name}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 italic">
                      Aucune discipline assignée à cette zone.
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal d'édition d'une zone */}
      {editingPOI && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
              <h3 className="font-bold text-lg text-white">
                {editingPOI.name || 'Nouvelle Zone du Campus'}
              </h3>
              <button
                onClick={() => setEditingPOI(null)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Nom de l&apos;Infrastructure / Spot
                </label>
                <input
                  type="text"
                  required
                  value={editingPOI.name}
                  onChange={(e) => setEditingPOI({ ...editingPOI, name: e.target.value })}
                  placeholder="ex: Tour de Saut Extrême 21m"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-cuc-gold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Catégorie
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPOI.category}
                    onChange={(e) => setEditingPOI({ ...editingPOI, category: e.target.value })}
                    placeholder="Hauteur, Combat, Câbles..."
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-cuc-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Badge Affiché (Vitrine)
                  </label>
                  <input
                    type="text"
                    value={editingPOI.badge}
                    onChange={(e) => setEditingPOI({ ...editingPOI, badge: e.target.value })}
                    placeholder="ex: HOMOLOGUÉ APAVE"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-cuc-gold"
                  />
                </div>
              </div>

              {/* Visuel de la zone (Supabase Storage) */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Visuel de la Zone (Vitrine)
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative w-24 h-16 shrink-0 rounded-xl overflow-hidden border border-zinc-800 bg-black flex items-center justify-center">
                    {editingPOI.image_url ? (
                      <Image
                        src={editingPOI.image_url}
                        alt={editingPOI.name || 'Visuel zone'}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-zinc-600" />
                    )}
                  </div>
                  <input
                    type="text"
                    value={editingPOI.image_url || ''}
                    onChange={(e) => setEditingPOI({ ...editingPOI, image_url: e.target.value })}
                    placeholder="URL Supabase Storage ou chemin local"
                    className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-cuc-gold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(true)}
                    className="px-3 py-2 rounded-xl border border-zinc-700 text-zinc-200 text-xs font-semibold hover:bg-zinc-800 transition shrink-0"
                  >
                    Médiathèque
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Description Détaillée
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingPOI.description}
                  onChange={(e) => setEditingPOI({ ...editingPOI, description: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-cuc-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Spécifications Techniques & Homologations
                </label>
                <input
                  type="text"
                  required
                  value={editingPOI.specs}
                  onChange={(e) => setEditingPOI({ ...editingPOI, specs: e.target.value })}
                  placeholder="ex: Hauteur 21m • 5 paliers • Poutre de largage"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-cuc-gold"
                />
              </div>
              {/* Liaison CUC Sign Location */}
              <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Lieu CUC Sign associé (Base Supabase &Eacute;margement) :
                  </label>
                  {editingPOI.location_id && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      Lieu Lié
                    </span>
                  )}
                </div>
                <select
                  value={editingPOI.location_id || ''}
                  onChange={(e) =>
                    setEditingPOI({ ...editingPOI, location_id: e.target.value || undefined })
                  }
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-cuc-gold"
                >
                  <option value="">-- Aucun lieu CUC Sign lié --</option>
                  <option value="0fc475db-34ae-47ce-95f2-b20b402c2859">Dojo Malik (indoor)</option>
                  <option value="732aad62-6c56-4329-85da-debb88be9fad">Tour Jérome Gaspard (outdoor)</option>
                  <option value="a195f7db-e934-4605-befa-df47b35c2049">Salle Zoé Bell (indoor)</option>
                  <option value="84b68801-d21e-4f97-8d3a-a8dd6d966fea">Dojo Maurice (indoor)</option>
                  <option value="7a64268f-54ec-4650-b364-1cb78ebb0e38">Salle Escalade (indoor)</option>
                  <option value="c5e00d0e-16c0-468b-ac13-431a6ce75c1f">Salle Tabata (indoor)</option>
                  <option value="85190227-31ee-4ee8-945a-5dbd22ad38f0">Amphithéatre (indoor)</option>
                  <option value="42d2da33-de57-4069-ab32-0467c8b3fb1d">Escaliers (outdoor)</option>
                  <option value="1f87ca78-ca18-459a-b8ec-0895ce699660">City Stade (outdoor)</option>
                </select>
                <p className="text-[11px] text-zinc-500 font-mono">
                  Permet à CUC Sign de rattacher les plannings et l&apos;émargement sur ce spot précis du campus.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Ordre d'affichage
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingPOI.order_index ?? 0}
                    onChange={(e) =>
                      setEditingPOI({ ...editingPOI, order_index: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-cuc-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Coordonnées GPS
                  </label>
                  <input
                    type="text"
                    value={editingPOI.coordinates}
                    onChange={(e) =>
                      setEditingPOI({ ...editingPOI, coordinates: e.target.value })
                    }
                    placeholder="50.0912° N, 3.5380° E"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-cuc-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Position Radar X (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editingPOI.xPercent}
                    onChange={(e) =>
                      setEditingPOI({ ...editingPOI, xPercent: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-cuc-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Position Radar Y (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editingPOI.yPercent}
                    onChange={(e) =>
                      setEditingPOI({ ...editingPOI, yPercent: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-cuc-gold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl">
                <div>
                  <p className="text-xs font-semibold text-zinc-300">
                    {editingPOI.is_active === false
                      ? 'Brouillon (masqué sur la vitrine)'
                      : 'Publié sur la vitrine'}
                  </p>
                  <p className="text-[11px] text-zinc-500 font-mono">
                    Décochez pour préparer la zone sans l'exposer publiquement.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditingPOI({ ...editingPOI, is_active: editingPOI.is_active === false })
                  }
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition shrink-0 ${editingPOI.is_active === false
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                    }`}
                >
                  {editingPOI.is_active === false ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                  {editingPOI.is_active === false ? 'Brouillon' : 'Publié'}
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingPOI(null)}
                  className="px-5 py-2.5 rounded-xl border border-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-800 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cuc-gold text-black text-xs font-bold hover:bg-yellow-400 transition shadow-lg shadow-cuc-gold/20"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MediaPickerModal
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelectUrl={(url) => {
          if (editingPOI) setEditingPOI({ ...editingPOI, image_url: url });
          setShowMediaPicker(false);
        }}
        title="Sélectionner le visuel de la zone"
      />
    </div>
  );
};
