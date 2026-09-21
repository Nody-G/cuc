'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { soundFX } from '@/lib/soundFx';
import {
  PlanMode,
  CameraPreset,
  EditableFacilityItem,
  GizmoMode,
  CampusSaveBackend,
  CampusSaveStatus,
  CampusPlan3DProps,
} from './types/campus3d.types';
import { DEFAULT_FACILITIES } from './data/defaultFacilities';
import {
  clampPosition,
  clampScale,
  normalizeAngle360,
  normalizeFacilityItem,
  normalizeFacilityRecord,
} from './data/facilityTransform';
import { useCampusScene } from './engine/useCampusScene';
import { CampusViewerHUD } from './ui/CampusViewerHUD';
import { CampusEditorPanel } from './ui/CampusEditorPanel';
import { CampusStudioToolbar } from './ui/CampusStudioToolbar';
import { CampusJsonStudioModal } from './ui/CampusJsonStudioModal';
import { getCampusPlacements3D } from '@/lib/data/site-service';
import { probeCampusPlacements3D, upsertCampusPlacements3D } from '@/app/admin/actions';

export type { PlanMode, CameraPreset, EditableFacilityItem, GizmoMode, CampusPlan3DProps };

/** Délai d'écriture différée de la persistance (moyenne les saisies continues). */
const SAVE_DEBOUNCE_MS = 400;

/**
 * Fenêtre de fusion de l'historique : deux modifications du **même champ** sur
 * la **même installation** dans cet intervalle forment une seule étape
 * annulable. Sans cette fusion, glisser un curseur produirait des dizaines
 * d'entrées d'historique et « Annuler » deviendrait inutilisable.
 */
const HISTORY_COALESCE_MS = 700;

/** Profondeur maximale de l'historique (au-delà, les plus anciennes sont perdues). */
const HISTORY_LIMIT = 60;

/** Délai avant la reprise unique d'une écriture en échec. */
const RETRY_DELAY_MS = 2500;

interface HistoryStore {
  past: Array<Record<string, EditableFacilityItem>>;
  future: Array<Record<string, EditableFacilityItem>>;
  lastKey: string;
  lastAt: number;
}

/**
 * Plan 3D interactif du domaine CUC.
 *
 * Version publique épurée : l'utilisateur explore le campus (vues caméra,
 * ambiances, sélection d'installations, fiche d'information). L'outil
 * d'édition de placement (« studio ») reste disponible uniquement pour
 * l'équipe technique, via le paramètre d'URL `?studio=1` ou la prop `studio`
 * (Cockpit) — il n'est jamais exposé dans l'interface grand public.
 *
 * Le studio permet de **déplacer** (X / Z), **tourner** (lacet autour de l'axe
 * vertical) et **redimensionner** (largeur X, hauteur Y, profondeur Z, avec
 * verrou d'échelle uniforme) chaque bâtiment, au gizmo ou en saisie numérique,
 * avec annulation / rétablissement.
 *
 * Persistance : par défaut le studio écrit dans le `localStorage` du
 * navigateur. Lorsque `persistToDatabase` est activé (Cockpit), les
 * placements sont enregistrés dans Supabase (`site_settings`
 * key='campus_placements_3d') et rechargés au montage, ce qui garantit une
 * source de vérité partagée entre le Cockpit et la page publique.
 */
export const CampusPlan3D: React.FC<CampusPlan3DProps> = ({
  initialMode = 'satellite',
  className = '',
  studio,
  persistToDatabase = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /** Destination réelle des écritures : Supabase (Cockpit) ou navigateur. */
  const saveBackend: CampusSaveBackend = persistToDatabase ? 'database' : 'local';

  const [mode, setMode] = useState<PlanMode>(initialMode);
  const [facilities, setFacilities] = useState<Record<string, EditableFacilityItem>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cuc_campus_placements_v2');
      if (saved) {
        try {
          // Migration transparente des placements v1 (`scale` / `heightScale`).
          return normalizeFacilityRecord(JSON.parse(saved), DEFAULT_FACILITIES);
        } catch {
          // Fallback to default
        }
      }
    }
    return DEFAULT_FACILITIES;
  });

  const [selectedObjectId, setSelectedObjectId] = useState<string>('cuc-tower');
  // Le studio d'édition n'est accessible qu'aux techniciens via `?studio=1`
  // ou via la prop `studio` (Cockpit). Il n'apparaît jamais dans l'interface
  // publique.
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(() => {
    if (typeof studio === 'boolean') return studio;
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('studio') === '1';
  });
  const [snapGrid, setSnapGrid] = useState<number>(0.5);
  const [dragMode, setDragMode] = useState<'gizmo' | 'orbit'>('gizmo');
  const [gizmoMode, setGizmoMode] = useState<GizmoMode>('translate');
  const [isCardVisible, setIsCardVisible] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copiedFeedback, setCopiedFeedback] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportModalTab, setExportModalTab] = useState<'export' | 'import'>('export');
  const [historyFlags, setHistoryFlags] = useState({ canUndo: false, canRedo: false });
  const [saveStatus, setSaveStatus] = useState<CampusSaveStatus>({
    state: 'idle',
    backend: saveBackend,
  });
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  /** Dernier état non encore écrit : sert au vidage différé et à la reprise. */
  const pendingPayloadRef = useRef<Record<string, EditableFacilityItem> | null>(null);

  // Source de vérité synchrone pour les mutations et l'historique : évite
  // toute écriture d'effet de bord à l'intérieur d'un updater React (double
  // invocation en mode strict = entrées d'historique dupliquées).
  const facilitiesRef = useRef(facilities);
  const historyRef = useRef<HistoryStore>({ past: [], future: [], lastKey: '', lastAt: 0 });

  useEffect(() => {
    facilitiesRef.current = facilities;
  }, [facilities]);

  const syncHistoryFlags = useCallback(() => {
    const history = historyRef.current;
    setHistoryFlags({ canUndo: history.past.length > 0, canRedo: history.future.length > 0 });
  }, []);

  /**
   * Enrichit un échec d'écriture par une **sonde de lecture** exécutée sur le
   * même chemin serveur. Trois causes se ressemblent depuis le navigateur et
   * exigent des corrections opposées :
   *  - l'action serveur n'est pas joignable (protocole d'action) ;
   *  - la lecture fonctionne mais l'écriture est refusée (droits, contrainte) ;
   *  - les deux échouent (schéma, réseau, configuration).
   */
  const diagnosePersistFailure = useCallback(async (message: string): Promise<string> => {
    try {
      const probe = await probeCampusPlacements3D();

      if (probe && 'success' in probe && probe.success) {
        if (probe.serviceRoleConfigured === false) {
          return `${message} — sonde : lecture OK (${probe.count} installation(s) en base) mais SUPABASE_SERVICE_ROLE_KEY absente sur ce serveur. L'écriture retombe donc sur la clé publique, que les politiques RLS refusent. Renseigner la clé de service dans l'environnement (Vercel → Settings → Environment Variables) puis redéployer.`;
        }
        return `${message} — sonde : lecture OK (${probe.count} installation(s) en base) avec clé de service configurée, donc la lecture passe et c'est l'écriture qui est refusée (droits ou contrainte sur site_settings).`;
      }

      if (probe && 'error' in probe && probe.error) {
        return `${message} — sonde : lecture également en échec (${probe.error}), donc la cause est côté Supabase, pas côté studio.`;
      }
      return message;
    } catch {
      return `${message} — sonde : injoignable depuis ce navigateur, donc l'appel d'action serveur lui-même ne passe pas (vérifier que le déploiement est à jour et que l'onglet n'est pas resté sur un ancien bundle).`;
    }
  }, []);

  /**
   * Une tentative d'écriture : Supabase en mode Cockpit (`site_settings`
   * key='campus_placements_3d'), `localStorage` en mode public.
   *
   * L'action serveur renvoie `{ success, error }` : ce retour est **contrôlé**.
   * Une erreur d'écriture silencieuse est indiscernable d'un succès — la
   * documentation de la revue le détaille (`plans/revue-transformations-3d-flexibles.md`).
   * Retourne `true` en cas de succès, `false` sinon (l'erreur réelle est
   * publiée dans l'état affiché à l'opérateur).
   */
  const attemptPersist = useCallback(
    async (payload: Record<string, EditableFacilityItem>): Promise<boolean> => {
      if (!persistToDatabase) {
        try {
          localStorage.setItem('cuc_campus_placements_v2', JSON.stringify(payload));
          pendingPayloadRef.current = null;
          setSaveStatus({ state: 'saved', backend: saveBackend, savedAt: Date.now() });
          return true;
        } catch {
          setSaveStatus({
            state: 'error',
            backend: saveBackend,
            error: 'Stockage local indisponible (navigation privée ou quota atteint).',
          });
          return false;
        }
      }

      try {
        const result = await upsertCampusPlacements3D(payload);
        if (result && 'success' in result && result.success === false) {
          const diagnosed = await diagnosePersistFailure(
            result.error ?? 'Erreur inconnue côté Supabase'
          );
          throw new Error(diagnosed);
        }

        const warning =
          result && 'warning' in result && typeof result.warning === 'string'
            ? result.warning
            : undefined;

        pendingPayloadRef.current = null;
        setSaveStatus({ state: 'saved', backend: saveBackend, savedAt: Date.now(), warning });
        return true;
      } catch (err: unknown) {
        const raw = err instanceof Error ? err.message : 'Erreur inconnue';
        const message = raw.includes('— sonde') ? raw : await diagnosePersistFailure(raw);
        console.error('[CampusPlan3D] Enregistrement des placements impossible :', message);
        setSaveStatus({ state: 'error', backend: saveBackend, error: message });
        return false;
      }
    },
    [persistToDatabase, saveBackend, diagnosePersistFailure]
  );

  /**
   * Écriture avec **une seule** reprise, pour absorber un incident réseau
   * ponctuel sans jamais boucler.
   */
  const persistNow = useCallback(
    async (payload: Record<string, EditableFacilityItem>) => {
      setSaveStatus({ state: 'saving', backend: saveBackend });

      const succeeded = await attemptPersist(payload);
      if (succeeded) return;

      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = setTimeout(() => {
        retryTimeoutRef.current = null;
        const pending = pendingPayloadRef.current;
        if (pending) void attemptPersist(pending);
      }, RETRY_DELAY_MS);
    },
    [attemptPersist, saveBackend]
  );

  /** Écriture différée : absorbe les saisies et glissers successifs. */
  const schedulePersist = useCallback(
    (next: Record<string, EditableFacilityItem>) => {
      pendingPayloadRef.current = next;
      setSaveStatus((prev) =>
        prev.state === 'error' ? prev : { state: 'saving', backend: saveBackend }
      );

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveTimeoutRef.current = null;
        void persistNow(next);
      }, SAVE_DEBOUNCE_MS);
    },
    [persistNow, saveBackend]
  );

  /** Enregistre immédiatement l'état courant (bouton du studio). */
  const saveNow = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    void persistNow(facilitiesRef.current);
  }, [persistNow]);

  /**
   * Pousse une écriture en attente avant de disparaître.
   *
   * Le démontage du composant (changement d'onglet du Cockpit) et la fermeture
   * de l'onglet annulaient auparavant l'écriture différée : le dernier
   * déplacement était **perdu sans trace**. On écrit désormais au lieu
   * d'abandonner.
   */
  const flushPendingSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    const pending = pendingPayloadRef.current;
    if (pending) void persistNow(pending);
  }, [persistNow]);

  useEffect(() => {
    const onPageHide = () => flushPendingSave();
    window.addEventListener('pagehide', onPageHide);
    return () => {
      window.removeEventListener('pagehide', onPageHide);
      // Démontage : la dernière modification doit partir, pas être jetée.
      flushPendingSave();
    };
  }, [flushPendingSave]);

  const pushHistory = useCallback(
    (snapshot: Record<string, EditableFacilityItem>, key: string) => {
      const history = historyRef.current;
      const now = Date.now();
      const coalesced =
        history.lastKey === key &&
        history.past.length > 0 &&
        now - history.lastAt < HISTORY_COALESCE_MS;

      if (!coalesced) {
        history.past.push(snapshot);
        if (history.past.length > HISTORY_LIMIT) history.past.shift();
      }
      history.future = [];
      history.lastKey = key;
      history.lastAt = now;
      syncHistoryFlags();
    },
    [syncHistoryFlags]
  );

  /** Applique un nouvel état complet, en l'inscrivant dans l'historique. */
  const commitFacilities = useCallback(
    (next: Record<string, EditableFacilityItem>, key: string) => {
      pushHistory(facilitiesRef.current, key);
      facilitiesRef.current = next;
      setFacilities(next);
      schedulePersist(next);
    },
    [pushHistory, schedulePersist]
  );

  /**
   * Contrôle préalable de la configuration serveur (Cockpit uniquement).
   *
   * Sans `SUPABASE_SERVICE_ROLE_KEY`, les écritures sont refusées par RLS et
   * chaque déplacement échouerait — mais seulement **après** le geste. Mieux
   * vaut l'annoncer dès l'ouverture du studio que laisser l'opérateur
   * découvrir le problème en perdant son travail.
   */
  useEffect(() => {
    if (!persistToDatabase) return;
    let cancelled = false;

    probeCampusPlacements3D()
      .then((probe) => {
        if (cancelled || !probe) return;
        if ('serviceRoleConfigured' in probe && probe.serviceRoleConfigured === false) {
          setSaveStatus({
            state: 'error',
            backend: saveBackend,
            error:
              'SUPABASE_SERVICE_ROLE_KEY absente sur ce serveur : les lectures passent, mais toute écriture sera refusée par les politiques RLS (code 42501). Renseigner la clé de service dans l\'environnement (Vercel → Settings → Environment Variables) puis redéployer.',
          });
        }
      })
      .catch(() => {
        // Silencieux : le diagnostic d'échec d'écriture prendra le relais.
      });

    return () => {
      cancelled = true;
    };
  }, [persistToDatabase, saveBackend]);

  // Chargement initial depuis Supabase (Cockpit uniquement).
  // Priorité : placements enregistrés en base > placements locaux > défauts
  // calibrés sur les empreintes OSM réelles.
  useEffect(() => {
    if (!persistToDatabase) return;
    let cancelled = false;

    getCampusPlacements3D()
      .then((placements) => {
        if (cancelled || !placements) return;
        const merged = normalizeFacilityRecord(placements, DEFAULT_FACILITIES);
        facilitiesRef.current = merged;
        setFacilities(merged);
      })
      .catch(() => {
        // Silencieux : on conserve les placements locaux/défauts.
      });

    return () => {
      cancelled = true;
    };
  }, [persistToDatabase]);

  /**
   * Mutation d'une installation avec persistance différée et inscription dans
   * l'historique. Toute valeur est normalisée (bornes, axes manquants, champs
   * hérités) avant d'entrer dans l'état.
   */
  const updateFacility = useCallback(
    (id: string, updates: Partial<EditableFacilityItem>) => {
      const current = facilitiesRef.current[id] ?? DEFAULT_FACILITIES[id];
      if (!current) return;

      const normalized = normalizeFacilityItem(id, { ...current, ...updates }, current);
      const next = { ...facilitiesRef.current, [id]: normalized };
      const historyKey = `${id}:${Object.keys(updates).sort().join(',')}`;
      commitFacilities(next, historyKey);
    },
    [commitFacilities]
  );

  const undo = useCallback(() => {
    const history = historyRef.current;
    const previous = history.past.pop();
    if (!previous) return;

    history.future.push(facilitiesRef.current);
    history.lastKey = '';
    facilitiesRef.current = previous;
    setFacilities(previous);
    schedulePersist(previous);
    syncHistoryFlags();
    soundFX.playTacticalClick();
  }, [schedulePersist, syncHistoryFlags]);

  const redo = useCallback(() => {
    const history = historyRef.current;
    const next = history.future.pop();
    if (!next) return;

    history.past.push(facilitiesRef.current);
    history.lastKey = '';
    facilitiesRef.current = next;
    setFacilities(next);
    schedulePersist(next);
    syncHistoryFlags();
    soundFX.playTacticalClick();
  }, [schedulePersist, syncHistoryFlags]);

  const handleSelectObjectId = useCallback((id: string) => {
    setSelectedObjectId(id);
    setIsCardVisible(true);
  }, []);

  // Use Scene Hook
  const {
    bearing,
    cameraDistance,
    activePreset,
    focusFacility,
    applyPreset,
    handleZoom,
    handleReset,
  } = useCampusScene({
    canvasRef,
    containerRef,
    facilities,
    selectedObjectId,
    isEditorOpen,
    snapGrid,
    dragMode,
    gizmoMode,
    mode,
    onUpdateFacility: updateFacility,
    onSelectObjectId: handleSelectObjectId,
    onGizmoModeChange: setGizmoMode,
  });

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => { });
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => { });
    }
  }, []);

  // Copy JSON configuration to clipboard
  const copyConfiguration = useCallback(() => {
    const jsonStr = JSON.stringify(facilitiesRef.current, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      setCopiedFeedback(true);
      soundFX.playTacticalClick();
      setTimeout(() => setCopiedFeedback(false), 2500);
    }).catch(() => { });
  }, []);

  // Download JSON configuration file
  const downloadJsonFile = useCallback(() => {
    const blob = new Blob([JSON.stringify(facilitiesRef.current, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cuc-campus-placements-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    soundFX.playTacticalClick();
  }, []);

  // Apply imported JSON text (normalisé : bornes et migration des anciens champs)
  const applyImportedJson = useCallback(
    (jsonString: string): string | null => {
      try {
        const parsed = JSON.parse(jsonString);
        if (typeof parsed !== 'object' || parsed === null) {
          return 'Format JSON invalide : un objet clé/valeur est attendu.';
        }
        const normalized = normalizeFacilityRecord(parsed);
        if (Object.keys(normalized).length === 0) {
          return 'Aucune installation exploitable dans ce JSON.';
        }
        commitFacilities(normalized, `import:${Date.now()}`);
        soundFX.playTacticalClick();
        return null;
      } catch {
        return 'Erreur de syntaxe JSON. Veuillez vérifier le format de votre code.';
      }
    },
    [commitFacilities]
  );

  // Reset all facilities to calibrated default
  const resetToDefault = useCallback(() => {
    if (confirm('Voulez-vous réinitialiser tous les emplacements par défaut ?')) {
      commitFacilities(DEFAULT_FACILITIES, `reset:${Date.now()}`);
      soundFX.playTacticalClick();
    }
  }, [commitFacilities]);

  // Add custom marker
  const addCustomMarker = useCallback(() => {
    const customId = `zone-${Date.now()}`;
    const newFacility: EditableFacilityItem = {
      id: customId,
      name: `Repère ${Object.keys(facilitiesRef.current).length + 1}`,
      code: `ZON-${String(Object.keys(facilitiesRef.current).length + 1).padStart(2, '0')}`,
      x: 0,
      z: 0,
      rotationY: 0,
      scaleX: 1,
      scaleY: 1,
      scaleZ: 1,
      uniformScale: true,
      visible: true,
    };
    commitFacilities({ ...facilitiesRef.current, [customId]: newFacility }, `add:${customId}`);
    setSelectedObjectId(customId);
    focusFacility(customId);
    soundFX.playTacticalClick();
  }, [commitFacilities, focusFacility]);

  // Keyboard Navigation & Shortcuts (studio uniquement)
  useEffect(() => {
    if (!isEditorOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

      // Historique : disponible quel que soit l'état de l'élément sélectionné.
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'z') {
          e.preventDefault();
          if (e.shiftKey) redo();
          else undo();
          return;
        }
      }

      const item = facilitiesRef.current[selectedObjectId];
      if (!item) return;

      const step = e.shiftKey ? 2.5 : e.altKey ? 0.1 : 0.5;
      const scaleFactor = e.altKey ? 1.01 : 1.1;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          updateFacility(selectedObjectId, { x: clampPosition(Number((item.x - step).toFixed(2))) });
          break;
        case 'ArrowRight':
          e.preventDefault();
          updateFacility(selectedObjectId, { x: clampPosition(Number((item.x + step).toFixed(2))) });
          break;
        case 'ArrowUp':
          e.preventDefault();
          updateFacility(selectedObjectId, { z: clampPosition(Number((item.z - step).toFixed(2))) });
          break;
        case 'ArrowDown':
          e.preventDefault();
          updateFacility(selectedObjectId, { z: clampPosition(Number((item.z + step).toFixed(2))) });
          break;
        case '[':
          e.preventDefault();
          updateFacility(selectedObjectId, {
            rotationY: normalizeAngle360(item.rotationY - 15),
          });
          break;
        case ']':
          e.preventDefault();
          updateFacility(selectedObjectId, {
            rotationY: normalizeAngle360(item.rotationY + 15),
          });
          break;
        case '+':
        case '=':
          e.preventDefault();
          updateFacility(selectedObjectId, {
            scaleX: clampScale(item.scaleX * scaleFactor),
            scaleY: clampScale(item.scaleY * scaleFactor),
            scaleZ: clampScale(item.scaleZ * scaleFactor),
          });
          break;
        case '-':
        case '_':
          e.preventDefault();
          updateFacility(selectedObjectId, {
            scaleX: clampScale(item.scaleX / scaleFactor),
            scaleY: clampScale(item.scaleY / scaleFactor),
            scaleZ: clampScale(item.scaleZ / scaleFactor),
          });
          break;
        case '1':
          e.preventDefault();
          setGizmoMode('translate');
          break;
        case '2':
          e.preventDefault();
          setGizmoMode('rotate');
          break;
        case '3':
          e.preventDefault();
          setGizmoMode('scale');
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          focusFacility(selectedObjectId);
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isEditorOpen, selectedObjectId, updateFacility, focusFacility, undo, redo]);

  const activeFacility = facilities[selectedObjectId] || null;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[650px] lg:h-[750px] bg-[#050608] border border-zinc-800 overflow-hidden flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 h-screen! w-screen! border-0' : ''
        } ${className}`}
    >
      {/* Barre de contrôle, aide contextuelle et sélecteur d'installations */}
      <CampusViewerHUD
        mode={mode}
        onModeChange={setMode}
        activePreset={activePreset}
        onApplyPreset={applyPreset}
        onZoom={handleZoom}
        onReset={handleReset}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        bearing={bearing}
        cameraDistance={cameraDistance}
        facilities={facilities}
        selectedObjectId={selectedObjectId}
        onFocusFacility={(id) => {
          setSelectedObjectId(id);
          focusFacility(id);
          setIsCardVisible(true);
        }}
        activeFacility={activeFacility}
        isCardVisible={isCardVisible}
        onCloseCard={() => setIsCardVisible(false)}
      />

      {/* Viewport WebGL */}
      <div className="relative flex-grow w-full h-full bg-black flex overflow-hidden">
        <div className="relative flex-grow w-full h-full cursor-grab active:cursor-grabbing">
          <canvas ref={canvasRef} className="w-full h-full block" />

          {/* Outil de manipulation accessible dans le viewport : la rotation
              reste trouvable même si le panneau latéral est hors champ. */}
          {isEditorOpen && (
            <CampusStudioToolbar
              gizmoMode={gizmoMode}
              onSetGizmoMode={setGizmoMode}
              canUndo={historyFlags.canUndo}
              canRedo={historyFlags.canRedo}
              onUndo={undo}
              onRedo={redo}
              saveStatus={saveStatus}
              onSaveNow={saveNow}
            />
          )}
        </div>

        {/* Studio de placement — techniciens uniquement (?studio=1) */}
        <CampusEditorPanel
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          facilities={facilities}
          selectedObjectId={selectedObjectId}
          onSelectObjectId={setSelectedObjectId}
          onFocusFacility={focusFacility}
          snapGrid={snapGrid}
          onSetSnapGrid={setSnapGrid}
          dragMode={dragMode}
          onSetDragMode={setDragMode}
          gizmoMode={gizmoMode}
          onSetGizmoMode={setGizmoMode}
          canUndo={historyFlags.canUndo}
          canRedo={historyFlags.canRedo}
          onUndo={undo}
          onRedo={redo}
          saveStatus={saveStatus}
          onSaveNow={saveNow}
          onUpdateFacility={updateFacility}
          onAddCustomMarker={addCustomMarker}
          onCopyConfiguration={copyConfiguration}
          copiedFeedback={copiedFeedback}
          onDownloadJson={downloadJsonFile}
          onOpenJsonStudio={(tab) => {
            setExportModalTab(tab);
            setShowExportModal(true);
          }}
          onResetToDefault={resetToDefault}
        />
      </div>

      {/* JSON Import/Export Modal — techniciens uniquement */}
      <CampusJsonStudioModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        facilities={facilities}
        tab={exportModalTab}
        onSetTab={setExportModalTab}
        onApplyImport={applyImportedJson}
        copiedFeedback={copiedFeedback}
        onCopyConfiguration={copyConfiguration}
        onDownloadJson={downloadJsonFile}
      />
    </div>
  );
};

export default CampusPlan3D;
