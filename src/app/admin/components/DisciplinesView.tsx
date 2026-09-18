'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Users,
  Film,
  GraduationCap,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import { Discipline, Instructor, FilmCredit, StuntProgram } from '@/types';
import { POI } from '@/components/ui/campus-map/campusMap.data';
import { upsertDiscipline, deleteDiscipline, updateSiteSettings } from '../actions';
import { MediaPickerModal } from './MediaPickerModal';

interface DisciplinesViewProps {
  disciplines: Discipline[];
  setDisciplines: React.Dispatch<React.SetStateAction<Discipline[]>>;
  team: Instructor[];
  campusPOIs: POI[];
  films: FilmCredit[];
  programs: StuntProgram[];
  showToast: (msg: string) => void;
}

export const DisciplinesView: React.FC<DisciplinesViewProps> = ({
  disciplines,
  setDisciplines,
  team,
  campusPOIs,
  films,
  programs,
  showToast,
}) => {
  const [, startTransition] = useTransition();
  const [editingDiscipline, setEditingDiscipline] = useState<Discipline | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDisciplines = disciplines.filter((d) => {
    const matchesLevel = filterLevel === 'all' || d.level === filterLevel;
    const matchesQuery =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesQuery;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDiscipline) return;

    const updated: Discipline = {
      ...editingDiscipline,
      equipment: Array.isArray(editingDiscipline.equipment)
        ? editingDiscipline.equipment
        : typeof (editingDiscipline as any).equipment === 'string'
        ? (editingDiscipline as any).equipment
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],
    };

    let nextList: Discipline[] = [];
    setDisciplines((prev) => {
      const exists = prev.some((d) => d.id === updated.id);
      nextList = exists ? prev.map((d) => (d.id === updated.id ? updated : d)) : [...prev, updated];
      return nextList;
    });

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cuc_disciplines', JSON.stringify(nextList));
      } catch {
        // ignore
      }
    }

    setEditingDiscipline(null);
    showToast(`Discipline ${updated.number} enregistrée !`);

    startTransition(async () => {
      await upsertDiscipline(updated);
      await updateSiteSettings('disciplines', { list: nextList });
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Supprimer définitivement ce module de cascade ?')) return;

    const nextList = disciplines.filter((d) => d.id !== id);
    setDisciplines(nextList);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cuc_disciplines', JSON.stringify(nextList));
      } catch {
        // ignore
      }
    }

    showToast('Module supprimé.');

    startTransition(async () => {
      await deleteDiscipline(id);
      await updateSiteSettings('disciplines', { list: nextList });
    });
  };

  const toggleArrayItem = (field: 'instructor_ids' | 'film_ids' | 'program_ids', id: string) => {
    if (!editingDiscipline) return;
    const current = editingDiscipline[field] || [];
    const exists = current.includes(id);
    const updated = exists ? current.filter((x) => x !== id) : [...current, id];
    setEditingDiscipline({ ...editingDiscipline, [field]: updated });
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cuc-gold/10 border border-cuc-gold/20 text-cuc-gold">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                Modules & Disciplines de Cascade
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {disciplines.length} Modules
                </span>
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                Gérez le catalogue officiel des 10 modules techniques, les formateurs attitrés, les zones campus et les films de référence.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            const nextNum = disciplines.length + 1;
            setEditingDiscipline({
              id: `module-${Date.now()}`,
              number: `MOD-${nextNum < 10 ? '0' + nextNum : nextNum}`,
              name: '',
              shortDesc: '',
              fullDesc: '',
              iconName: 'Shield',
              level: 'Fondamental',
              equipment: [],
              cinemaContext: '',
              heroImage: '',
              instructor_ids: [],
              campus_zone_id: '',
              program_ids: [],
              film_ids: [],
            });
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-cuc-gold text-black font-semibold rounded-xl hover:bg-yellow-400 transition shadow-lg shadow-cuc-gold/10 text-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Ajouter un Module
        </button>
      </div>

      {/* Barre de filtre & recherche */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800/80">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['all', 'Fondamental', 'Avancé', 'Extrême', 'Tactique'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                filterLevel === lvl
                  ? 'bg-cuc-gold text-black shadow-md shadow-cuc-gold/20'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700'
              }`}
            >
              {lvl === 'all' ? 'Tous les niveaux' : lvl}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Rechercher un module, code MOD..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-72 px-4 py-2 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cuc-gold"
        />
      </div>

      {/* Grille des modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDisciplines.map((d) => {
          const zone = campusPOIs.find((p) => p.id === d.campus_zone_id);
          const linkedInstructors = team.filter((m) => d.instructor_ids?.includes(m.id));
          const linkedFilms = films.filter((f) => d.film_ids?.includes(f.id));
          const linkedProgs = programs.filter((p) => d.program_ids?.includes(p.id));

          return (
            <div
              key={d.id}
              className="group relative bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-cuc-gold/40 transition-all duration-300 flex flex-col justify-between shadow-xl"
            >
              {/* Header Image & Badge */}
              <div>
                <div className="relative h-44 w-full bg-zinc-950 overflow-hidden">
                  {d.heroImage ? (
                    <Image
                      src={d.heroImage}
                      alt={d.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 bg-zinc-950/80">
                      <ImageIcon className="w-10 h-10 mb-2 opacity-40" />
                      <span className="text-xs">Aucune image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

                  {/* Badges Flottants */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-cuc-gold/40 text-cuc-gold font-mono font-bold text-xs shadow-lg">
                      {d.number}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        d.level === 'Extrême'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : d.level === 'Tactique'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : d.level === 'Avancé'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {d.level}
                    </span>
                  </div>

                  {/* Actions Rapides */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition">
                    <button
                      onClick={() => setEditingDiscipline(d)}
                      className="p-1.5 rounded-lg bg-black/70 hover:bg-cuc-gold hover:text-black text-zinc-300 border border-zinc-700/50 transition backdrop-blur"
                      title="Modifier"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="p-1.5 rounded-lg bg-black/70 hover:bg-rose-500 hover:text-white text-zinc-300 border border-zinc-700/50 transition backdrop-blur"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-cuc-gold transition-colors line-clamp-1">
                      {d.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {d.shortDesc}
                    </p>
                  </div>

                  {/* Interconnexions Actives */}
                  <div className="space-y-2 pt-2 border-t border-zinc-800/60 text-xs">
                    {/* Zone Campus */}
                    <div className="flex items-center gap-2 text-zinc-300">
                      <MapPin className="w-3.5 h-3.5 text-cuc-gold shrink-0" />
                      <span className="text-zinc-500">Zone Campus :</span>
                      {zone ? (
                        <span className="font-medium text-amber-300 truncate">{zone.name}</span>
                      ) : (
                        <span className="text-zinc-600 italic">Non assignée</span>
                      )}
                    </div>

                    {/* Formateurs Référents */}
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Users className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="text-zinc-500">Formateurs :</span>
                      {linkedInstructors.length > 0 ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {linkedInstructors.slice(0, 2).map((inst) => (
                            <span
                              key={inst.id}
                              className="px-2 py-0.5 bg-zinc-800/80 rounded-md text-[11px] text-zinc-200 border border-zinc-700/50"
                            >
                              {inst.name.split(' ')[0]}
                            </span>
                          ))}
                          {linkedInstructors.length > 2 && (
                            <span className="text-[10px] text-zinc-400 font-mono">
                              +{linkedInstructors.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-zinc-600 italic">Aucun formateur lié</span>
                      )}
                    </div>

                    {/* Films Phares Liés */}
                    {linkedFilms.length > 0 && (
                      <div className="flex items-center gap-2 text-zinc-300">
                        <Film className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="text-zinc-500">Films phares :</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {linkedFilms.slice(0, 2).map((f) => (
                            <span
                              key={f.id}
                              className="px-2 py-0.5 bg-purple-950/40 text-purple-200 rounded-md text-[11px] border border-purple-800/40 truncate max-w-[130px]"
                            >
                              {f.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Formations Associées */}
                    {linkedProgs.length > 0 && (
                      <div className="flex items-center gap-2 text-zinc-300">
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-zinc-500">Programmes :</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {linkedProgs.map((p) => (
                            <span
                              key={p.id}
                              className="px-2 py-0.5 bg-emerald-950/40 text-emerald-300 rounded-md text-[10px] border border-emerald-800/30"
                            >
                              {p.badge || p.title.slice(0, 15)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Matériel Clé */}
                  {d.equipment && d.equipment.length > 0 && (
                    <div className="pt-2">
                      <div className="flex flex-wrap gap-1">
                        {d.equipment.slice(0, 3).map((eq, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 rounded"
                          >
                            {eq}
                          </span>
                        ))}
                        {d.equipment.length > 3 && (
                          <span className="text-[10px] text-zinc-500 self-center">
                            +{d.equipment.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal d'édition / création ultra-complète */}
      {editingDiscipline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-md bg-cuc-gold/10 border border-cuc-gold/30 text-cuc-gold font-mono font-bold text-xs">
                  {editingDiscipline.number}
                </span>
                <h3 className="font-bold text-lg text-white">
                  {editingDiscipline.name || 'Nouveau Module de Cascade'}
                </h3>
              </div>
              <button
                onClick={() => setEditingDiscipline(null)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Infos Clés */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Code Module (ex: MOD-01)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingDiscipline.number}
                    onChange={(e) =>
                      setEditingDiscipline({ ...editingDiscipline, number: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-cuc-gold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Nom du Module
                  </label>
                  <input
                    type="text"
                    required
                    value={editingDiscipline.name}
                    onChange={(e) =>
                      setEditingDiscipline({ ...editingDiscipline, name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-cuc-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Niveau Technique
                  </label>
                  <select
                    value={editingDiscipline.level}
                    onChange={(e) =>
                      setEditingDiscipline({
                        ...editingDiscipline,
                        level: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-cuc-gold"
                  >
                    <option value="Fondamental">Fondamental</option>
                    <option value="Avancé">Avancé</option>
                    <option value="Extrême">Extrême</option>
                    <option value="Tactique">Tactique</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Zone du Campus (Lieu d'Entraînement)
                  </label>
                  <select
                    value={editingDiscipline.campus_zone_id || ''}
                    onChange={(e) =>
                      setEditingDiscipline({
                        ...editingDiscipline,
                        campus_zone_id: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-cuc-gold"
                  >
                    <option value="">Sélectionner une infrastructure...</option>
                    {campusPOIs.map((poi) => (
                      <option key={poi.id} value={poi.id}>
                        {poi.name} ({poi.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Accroche Courte (Vitrine)
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingDiscipline.shortDesc}
                  onChange={(e) =>
                    setEditingDiscipline({ ...editingDiscipline, shortDesc: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-cuc-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Description Pédagogique Détaillée
                </label>
                <textarea
                  rows={4}
                  value={editingDiscipline.fullDesc}
                  onChange={(e) =>
                    setEditingDiscipline({ ...editingDiscipline, fullDesc: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-cuc-gold"
                />
              </div>

              {/* Contexte Cinéma & Matériel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Exemples de Scènes Cinéma
                  </label>
                  <input
                    type="text"
                    value={editingDiscipline.cinemaContext}
                    onChange={(e) =>
                      setEditingDiscipline({
                        ...editingDiscipline,
                        cinemaContext: e.target.value,
                      })
                    }
                    placeholder="ex: John Wick, cascades sur les toits..."
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-cuc-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Matériel Spécifique (séparé par des virgules)
                  </label>
                  <input
                    type="text"
                    value={
                      Array.isArray(editingDiscipline.equipment)
                        ? editingDiscipline.equipment.join(', ')
                        : editingDiscipline.equipment || ''
                    }
                    onChange={(e) =>
                      setEditingDiscipline({
                        ...editingDiscipline,
                        equipment: e.target.value.split(',').map((s) => s.trim()),
                      })
                    }
                    placeholder="Airbag géant, Harnais, Nomex..."
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-cuc-gold"
                  />
                </div>
              </div>

              {/* Visuel */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Image Illustrative (URL ou Médiathèque)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={editingDiscipline.heroImage}
                    onChange={(e) =>
                      setEditingDiscipline({
                        ...editingDiscipline,
                        heroImage: e.target.value,
                      })
                    }
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-cuc-gold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(true)}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
                  >
                    <ImageIcon className="w-4 h-4 text-cuc-gold" />
                    Médiathèque
                  </button>
                </div>
              </div>

              {/* ================= SECTION INTERCONNEXIONS ================= */}
              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cuc-gold flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Interconnexions & Liaisons Croisées
                </h4>

                {/* Formateurs Référents */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">
                    Formateurs Référents de ce Module ({team.length} instructeurs au staff) :
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {team.map((inst) => {
                      const isChecked = editingDiscipline.instructor_ids?.includes(inst.id);
                      return (
                        <button
                          type="button"
                          key={inst.id}
                          onClick={() => toggleArrayItem('instructor_ids', inst.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs transition border ${
                            isChecked
                              ? 'bg-cuc-gold/15 border-cuc-gold text-white font-semibold'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                              isChecked ? 'bg-cuc-gold border-cuc-gold text-black' : 'border-zinc-700'
                            }`}
                          >
                            {isChecked && '✓'}
                          </div>
                          <span className="truncate">{inst.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Formations Associées */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">
                    Programmes de Formation qui intègrent ce module :
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {programs.map((prog) => {
                      const isChecked = editingDiscipline.program_ids?.includes(prog.id);
                      return (
                        <button
                          type="button"
                          key={prog.id}
                          onClick={() => toggleArrayItem('program_ids', prog.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs transition border ${
                            isChecked
                              ? 'bg-emerald-500/15 border-emerald-500 text-white font-semibold'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                              isChecked ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-zinc-700'
                            }`}
                          >
                            {isChecked && '✓'}
                          </div>
                          <span className="truncate">{prog.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Films Phares de Référence */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">
                    Films & Œuvres illustrant cette discipline (sélection du catalogue CUC) :
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {films.slice(0, 12).map((film) => {
                      const isChecked = editingDiscipline.film_ids?.includes(film.id);
                      return (
                        <button
                          type="button"
                          key={film.id}
                          onClick={() => toggleArrayItem('film_ids', film.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs transition border ${
                            isChecked
                              ? 'bg-purple-500/15 border-purple-500 text-white font-semibold'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                              isChecked ? 'bg-purple-500 border-purple-500 text-white' : 'border-zinc-700'
                            }`}
                          >
                            {isChecked && '✓'}
                          </div>
                          <span className="truncate">{film.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Boutons Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingDiscipline(null)}
                  className="px-5 py-2.5 rounded-xl border border-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-800 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cuc-gold text-black text-xs font-bold hover:bg-yellow-400 transition shadow-lg shadow-cuc-gold/20"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Médiathèque */}
      <MediaPickerModal
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelectUrl={(url: string) => {
          if (editingDiscipline) {
            setEditingDiscipline({ ...editingDiscipline, heroImage: url });
          }
          setShowMediaPicker(false);
          showToast('Image appliquée avec succès !');
        }}
      />
    </div>
  );
};
