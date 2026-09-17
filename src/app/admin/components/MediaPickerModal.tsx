'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Check, Image as ImageIcon, Upload, RefreshCw } from 'lucide-react';
import { listMediaFiles, uploadMediaFile } from '@/app/admin/actions';

interface MediaFile {
  name: string;
  size: number;
  createdAt: string | null;
  url: string;
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUrl: (url: string) => void;
  title?: string;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectUrl,
  title = 'Sélectionner une image dans la médiathèque',
}) => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

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
    if (isOpen) {
      listMediaFiles().then((res) => {
        if (active) {
          if (res.success && res.files) {
            setFiles(res.files);
          }
          setLoading(false);
        }
      });
    }
    return () => {
      active = false;
    };
  }, [isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', fileList[0]);

    const res = await uploadMediaFile(formData);
    if (res.success && res.url) {
      setSelectedUrl(res.url);
      await loadFiles();
    }
    setUploading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12121A] border border-white/10 rounded-2xl max-w-3xl w-full flex flex-col max-h-[85vh] shadow-2xl overflow-hidden">
        {/* En-tête modal */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <ImageIcon className="w-5 h-5 text-[#FFE500]" />
            <span>{title}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barre d'action : Upload rapide */}
        <div className="p-4 bg-white/[0.02] border-b border-white/10 flex items-center justify-between gap-4">
          <label className="px-4 py-2 bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer flex items-center gap-2 transition-transform active:scale-95 shrink-0">
            {uploading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Upload en cours...
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                Téléverser une image
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={handleFileUpload}
            />
          </label>
          <div className="text-xs text-gray-400 truncate">
            Bucket public CUC : formats JPG, PNG, WebP acceptés
          </div>
        </div>

        {/* Grille des médias */}
        <div className="p-6 overflow-y-auto flex-1 min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-xs font-mono text-gray-400 gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#FFE500]" />
              Chargement des images...
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-white/10 rounded-xl space-y-2">
              <ImageIcon className="w-8 h-8 text-gray-600 mx-auto" />
              <p className="text-sm text-gray-400">Aucune image téléversée pour le moment.</p>
              <p className="text-xs text-gray-500">Utilisez le bouton ci-dessus pour ajouter des photos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {files.map((file) => {
                const isSelected = selectedUrl === file.url;
                return (
                  <button
                    key={file.url}
                    type="button"
                    onClick={() => setSelectedUrl(file.url)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 text-left transition-all group ${
                      isSelected
                        ? 'border-[#FFE500] ring-2 ring-[#FFE500]/30 scale-[1.02]'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <Image
                      src={file.url}
                      alt={file.name}
                      fill
                      sizes="150px"
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#FFE500] text-black flex items-center justify-center shadow-lg">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2">
                      <div className="text-[10px] text-white font-mono truncate">{file.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer avec sélection */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-black/30">
          <div className="text-xs text-gray-400 truncate max-w-sm">
            {selectedUrl ? (
              <span className="text-[#FFE500] font-mono truncate">{selectedUrl}</span>
            ) : (
              'Cliquez sur une image pour la sélectionner'
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={!selectedUrl}
              onClick={() => {
                if (selectedUrl) {
                  onSelectUrl(selectedUrl);
                  onClose();
                }
              }}
              className="px-5 py-2 rounded-lg bg-[#FFE500] disabled:opacity-40 disabled:pointer-events-none hover:bg-[#ffe600e6] text-black text-xs font-bold uppercase tracking-wider transition-all"
            >
              Insérer cette image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
