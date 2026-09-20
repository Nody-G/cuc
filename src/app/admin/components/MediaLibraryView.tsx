'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Upload,
  Image as ImageIcon,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  Search,
  HardDrive,
} from 'lucide-react';
import { listMediaFiles, uploadMediaFile, deleteMediaFile } from '@/app/admin/actions';
import { CockpitSkeletonList, CockpitEmptyState } from './ui';

interface MediaFile {
  name: string;
  size: number;
  createdAt: string | null;
  url: string;
}

interface MediaLibraryViewProps {
  showToast: (msg: string) => void;
}

export const MediaLibraryView: React.FC<MediaLibraryViewProps> = ({ showToast }) => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);

  const loadFiles = React.useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await listMediaFiles();
      if (res.success && res.files) {
        setFiles(res.files);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    listMediaFiles().then((res) => {
      if (active) {
        if (res.success && res.files) {
          setFiles(res.files);
        }
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setUploading(true);
    let successCount = 0;

    for (let i = 0; i < fileList.length; i++) {
      const formData = new FormData();
      formData.append('file', fileList[i]);
      const res = await uploadMediaFile(formData);
      if (res.success) {
        successCount++;
      }
    }

    setUploading(false);
    showToast(`${successCount} fichier(s) téléversé(s) dans le bucket !`);
    await loadFiles();
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    showToast('URL publique copiée dans le presse-papier !');
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Supprimer définitivement "${filename}" du stockage ?`)) return;

    setFiles((prev) => prev.filter((f) => f.name !== filename));
    showToast('Fichier supprimé');

    const res = await deleteMediaFile(filename);
    if (!res.success) {
      showToast('Erreur lors de la suppression sur Supabase');
      await loadFiles();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
            <HardDrive className="w-3.5 h-3.5" /> Supabase Storage — Bucket Public CUC
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
            Médiathèque & Fichiers
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Téléversez et gérez les affiches, logos et photos hébergés sur votre infrastructure de stockage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="px-5 py-2.5 bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-black uppercase tracking-wider rounded-lg cursor-pointer flex items-center gap-2 shadow-lg shadow-yellow-500/10 transition-transform active:scale-95">
            {uploading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Téléversement...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Ajouter des images</span>
              </>
            )}
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0D0D12] border border-white/10 rounded-xl p-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Rechercher par nom de fichier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/60 border border-white/20 rounded-lg pl-10 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFE500]"
          />
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-gray-400 w-full sm:w-auto justify-between">
          <span>{filteredFiles.length} FICHIER(S) DISPONIBLE(S)</span>
          <button
            type="button"
            onClick={() => loadFiles(true)}
            title="Rafraîchir la liste"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-[#FFE500] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grille des médias */}
      {loading ? (
        <CockpitSkeletonList rows={5} />
      ) : filteredFiles.length === 0 ? (
        <CockpitEmptyState
          icon={ImageIcon}
          title="Aucun fichier trouvé"
          description={'Glissez-déposez ou cliquez sur "Ajouter des images" pour téléverser vos premières photos dans Supabase Storage.'}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.url}
              className="bg-[#0D0D12] border border-white/10 rounded-xl overflow-hidden group hover:border-white/30 transition-all flex flex-col justify-between"
            >
              {/* Vignette image */}
              <div
                onClick={() => setPreviewFile(file)}
                className="relative aspect-square bg-black/60 cursor-pointer overflow-hidden"
              >
                <Image
                  src={file.url}
                  alt={file.name}
                  fill
                  sizes="200px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-3 py-1 rounded bg-black/80 text-white text-[10px] font-mono">
                    Aperçu
                  </span>
                </div>
              </div>

              {/* Détails et actions */}
              <div className="p-3 space-y-2">
                <div className="text-[11px] font-bold text-white truncate" title={file.name}>
                  {file.name}
                </div>
                <div className="text-[10px] font-mono text-gray-400 flex items-center justify-between">
                  <span>{formatFileSize(file.size)}</span>
                  <span>{file.createdAt ? new Date(file.createdAt).toLocaleDateString('fr-FR') : ''}</span>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-1">
                  <button
                    onClick={() => handleCopyUrl(file.url)}
                    className="flex-1 px-2 py-1.5 rounded bg-white/5 hover:bg-[#FFE500] hover:text-black text-gray-300 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors"
                  >
                    {copiedUrl === file.url ? (
                      <>
                        <Check className="w-3 h-3" />
                        Copié !
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Lien CDN
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(file.name)}
                    title="Supprimer définitivement"
                    className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal d'aperçu d'une image */}
      {previewFile && (
        <div
          onClick={() => setPreviewFile(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center space-y-4">
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/20">
              <Image
                src={previewFile.url}
                alt={previewFile.name}
                fill
                className="object-contain"
                sizes="1000px"
              />
            </div>
            <div className="bg-[#12121A] border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-mono flex items-center gap-4">
              <span>{previewFile.name}</span>
              <span className="text-gray-400">•</span>
              <span className="text-[#FFE500]">{formatFileSize(previewFile.size)}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyUrl(previewFile.url);
                }}
                className="px-3 py-1 rounded bg-[#FFE500] text-black text-[10px] font-bold uppercase"
              >
                Copier l'URL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
