'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Boxes,
  Info,
  Move3d,
  RotateCw,
  Maximize2,
  Eye,
  Save,
  Database,
} from 'lucide-react';

/**
 * Chargement dynamique du plan 3D : Three.js ne doit jamais être évalué
 * côté serveur (WebGL indisponible). Le squelette de chargement reprend la
 * hauteur du viewport pour éviter tout saut de mise en page.
 */
const CampusPlan3D = dynamic(
  () => import('@/components/3d/CampusPlan3D').then((m) => m.CampusPlan3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[650px] lg:h-[750px] bg-[#050608] border border-zinc-800 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-zinc-500">
          <Boxes className="w-8 h-8 animate-pulse" />
          <span className="text-xs font-mono-tech uppercase tracking-widest">
            Chargement du moteur 3D…
          </span>
        </div>
      </div>
    ),
  }
);


/**
 * Vue Cockpit « Plan 3D ».
 *
 * Expose le studio de placement du plan 3D du campus : déplacement,
 * rotation, mise à l'échelle et ajustement de hauteur des modèles de
 * bâtiments. Les placements sont persistés dans Supabase
 * (`site_settings` key='campus_placements_3d') et partagés avec la page
 * publique — plus aucune dépendance au seul `localStorage`.
 */
export const CampusPlan3DView: React.FC = () => {
  const [showHelp, setShowHelp] = useState(true);

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              Plan 3D du Campus
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                Studio de placement
              </span>
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Positionnez, orientez et dimensionnez les modèles 3D des bâtiments. Les placements sont
              enregistrés dans Supabase et partagés avec la page publique.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowHelp((v) => !v)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors text-xs font-semibold"
        >
          <Info className="w-4 h-4" />
          {showHelp ? 'Masquer l’aide' : 'Afficher l’aide'}
        </button>
      </div>

      {/* Aide contextuelle */}
      {showHelp && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <div className="flex items-center gap-2 mb-2 text-cyan-400">
              <Move3d className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Déplacer</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Sélectionnez un bâtiment dans le panneau latéral puis glissez-le directement dans la
              scène (ou utilisez les flèches du gizmo). Les flèches du clavier déplacent l’objet sur le
              plan du sol (pas de 0,5 m ; <kbd>Maj</kbd> = 2,5 m ; <kbd>Alt</kbd> = 0,1 m).{' '}
              <kbd>F</kbd> cadre la caméra sur l’objet sélectionné.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <div className="flex items-center gap-2 mb-2 text-amber-400">
              <RotateCw className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Tourner</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Touche <kbd>2</kbd> (ou le bouton « Tourner ») puis glissez l’anneau de lacet. Les
              touches <kbd>[</kbd> / <kbd>]</kbd> pivotent de 15°, le curseur règle la rotation au
              degré près. Le bâtiment reste d’aplomb : aucune inclinaison n’est appliquée.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <div className="flex items-center gap-2 mb-2 text-emerald-400">
              <Maximize2 className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Redimensionner</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Touche <kbd>3</kbd> (ou le bouton « Redimensionner ») puis glissez un axe, ou réglez
              largeur, hauteur et profondeur séparément dans le panneau (0,05 → 12 ×). Le cadenas
              « Liée » verrouille les trois axes ensemble ; « Échelle 1:1 » revient à l’emprise réelle.
              <kbd>+</kbd> / <kbd>−</kbd> ajustent l’échelle uniforme.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 md:col-span-3">
            <div className="flex items-center gap-2 mb-2 text-zinc-300">
              <Info className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Annuler / rétablir</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              <kbd>Ctrl</kbd> + <kbd>Z</kbd> annule la dernière modification et{' '}
              <kbd>Ctrl</kbd> + <kbd>Maj</kbd> + <kbd>Z</kbd> la rétablit. Un glisser de poignée
              compte pour une seule étape ; les réglages continus d’un même curseur sont fusionnés.
            </p>
          </div>
        </div>
      )}

      {/* Bandeau de persistance */}
      <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
        <Database className="w-4 h-4 text-emerald-400 shrink-0" />
        <p className="text-xs text-emerald-200/90">
          <span className="font-semibold">Persistance Supabase active.</span> Chaque modification est
          enregistrée automatiquement dans <code className="text-emerald-300">site_settings</code> (clé{' '}
          <code className="text-emerald-300">campus_placements_3d</code>) et rechargée à l’ouverture du
          Cockpit comme de la page publique.
        </p>
      </div>

      {/* Viewport 3D en mode studio */}
      <CampusPlan3D studio persistToDatabase className="rounded-xl" />

      {/* Pied de section */}
      <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono-tech text-zinc-500">
        <span className="inline-flex items-center gap-1.5">
          <Save className="w-3.5 h-3.5" /> Sauvegarde automatique (debounce 400 ms)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" /> Visibilité par bâtiment
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Boxes className="w-3.5 h-3.5" /> Positions calibrées sur les empreintes OSM réelles
        </span>
      </div>
    </div>
  );
};
