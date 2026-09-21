'use client';

import React, { useState } from 'react';
import {
  Download,
  Upload,
  Database,
  X,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileJson,
  ShieldAlert,
} from 'lucide-react';
import { exportFullSiteBackup, restoreFullSiteBackup } from '@/app/(admin)/admin/actions';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
  onRestored?: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  showToast,
  onRestored,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [previewSummary, setPreviewSummary] = useState<{
    pages?: number;
    team?: number;
    films?: number;
    sessions?: number;
    partners?: number;
    events?: number;
    date?: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setErrorMsg(null);
    const res = await exportFullSiteBackup();
    setIsExporting(false);

    if (res.success && res.backup) {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.backup, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `cuc-sauvegarde-complete-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Sauvegarde intégrale du site exportée avec succès !');
    } else {
      setErrorMsg(res.error || 'Erreur lors de l’export');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed.data) {
          throw new Error('Structure du fichier JSON de sauvegarde invalide (champ data manquant).');
        }
        setFileContent(text);
        setPreviewSummary({
          pages: parsed.data.pages?.length || 0,
          team: parsed.data.team?.length || 0,
          films: parsed.data.films?.length || 0,
          sessions: parsed.data.sessions?.length || 0,
          partners: parsed.data.partners?.length || 0,
          events: parsed.data.events?.length || 0,
          date: parsed.export_date ? new Date(parsed.export_date).toLocaleString('fr-FR') : undefined,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Fichier JSON corrompu';
        setErrorMsg(msg);
        setFileContent(null);
        setPreviewSummary(null);
      }
    };
    reader.readAsText(file);
  };

  const handleRestore = async () => {
    if (!fileContent) return;
    if (!confirm('ATTENTION : La restauration écrasera les données actuelles par celles de la sauvegarde. Souhaitez-vous continuer ?')) {
      return;
    }

    setIsRestoring(true);
    setErrorMsg(null);
    const res = await restoreFullSiteBackup(fileContent);
    setIsRestoring(false);

    if (res.success) {
      showToast('Restauration intégrale effectuée avec succès !');
      onRestored?.();
      onClose();
    } else {
      setErrorMsg(res.error || 'Erreur lors de la restauration');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-[#0D0D12] border border-white/10 rounded-2xl w-full max-w-xl p-6 space-y-6 shadow-2xl animate-in fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase mb-1">
              <Database className="w-3.5 h-3.5" /> Sécurité &amp; Sauvegardes
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">
              Export &amp; Restauration du Site
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Sauvegardez l&apos;intégralité des configurations (pages, sessions, équipe, films, partenaires).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Section 1 : Exporter */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono text-white font-bold uppercase flex items-center gap-1.5">
              <Download className="w-4 h-4 text-[#FFE500]" /> Exporter un Instantané Complet
            </div>
            <span className="text-[10px] font-mono text-gray-400">Format .JSON</span>
          </div>
          <p className="text-xs text-gray-400">
            Télécharge un fichier contenant la configuration de toutes les pages vitrine, ateliers, membres de l&apos;équipe, dates de stages et métadonnées.
          </p>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="w-full py-2.5 px-4 rounded-xl bg-[#FFE500] hover:bg-yellow-400 text-black text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs shadow-yellow-500/20"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Génération de l&apos;instantané...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Télécharger la Sauvegarde Complète (.json)
              </>
            )}
          </button>
        </div>

        {/* Section 2 : Restaurer */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono text-white font-bold uppercase flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-emerald-400" /> Restaurer à partir d&apos;un Fichier
            </div>
            <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Écrasement
            </span>
          </div>

          <label className="block border-2 border-dashed border-white/10 hover:border-[#FFE500]/50 rounded-xl p-4 text-center cursor-pointer transition-colors bg-[#08080C]">
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <FileJson className="w-6 h-6 text-gray-400 mx-auto mb-1.5" />
            <div className="text-xs text-white font-medium">
              Cliquez pour sélectionner un fichier .json de sauvegarde CUC
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">
              Vérification préalable de structure automatique
            </div>
          </label>

          {previewSummary && (
            <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-2 text-xs">
              <div className="text-emerald-300 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Fichier validé avec succès
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-gray-300">
                <div>Pages : {previewSummary.pages}</div>
                <div>Équipe : {previewSummary.team}</div>
                <div>Films : {previewSummary.films}</div>
                <div>Sessions : {previewSummary.sessions}</div>
                <div>Partenaires : {previewSummary.partners}</div>
                <div>Événements : {previewSummary.events}</div>
              </div>
              {previewSummary.date && (
                <div className="text-[10px] text-gray-400 pt-1 border-t border-emerald-500/20">
                  Date d&apos;export : {previewSummary.date}
                </div>
              )}

              <button
                type="button"
                onClick={handleRestore}
                disabled={isRestoring}
                className="w-full mt-2 py-2 px-3 rounded-lg bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isRestoring ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Restauration en cours...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    Appliquer cette restauration sur le site
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
