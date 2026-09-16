'use client';

import React, { useState } from 'react';
import { Code, Copy, Check, Download, X } from 'lucide-react';
import { EditableFacilityItem } from '../types/campus3d.types';

interface CampusJsonStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  facilities: Record<string, EditableFacilityItem>;
  tab: 'export' | 'import';
  onSetTab: (tab: 'export' | 'import') => void;
  onApplyImport: (jsonString: string) => string | null; // returns error message if any
  copiedFeedback: boolean;
  onCopyConfiguration: () => void;
  onDownloadJson: () => void;
}

export const CampusJsonStudioModal: React.FC<CampusJsonStudioModalProps> = ({
  isOpen,
  onClose,
  facilities,
  tab,
  onSetTab,
  onApplyImport,
  copiedFeedback,
  onCopyConfiguration,
  onDownloadJson,
}) => {
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApply = () => {
    const error = onApplyImport(importJsonText);
    if (error) {
      setImportError(error);
    } else {
      setImportError(null);
      setImportJsonText('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0e0e14] border-2 border-[#00e5ff] w-full max-w-2xl max-h-[85vh] flex flex-col shadow-[0_0_40px_rgba(0,229,255,0.3)]">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-[#12141c]">
          <div className="flex items-center gap-3">
            <Code className="w-5 h-5 text-[#00e5ff]" />
            <div className="flex border border-zinc-700 bg-black text-xs font-mono-tech">
              <button
                onClick={() => onSetTab('export')}
                className={`px-3 py-1 cursor-pointer transition-colors ${
                  tab === 'export' ? 'bg-[#00e5ff] text-black font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Exporter / Copier
              </button>
              <button
                onClick={() => onSetTab('import')}
                className={`px-3 py-1 cursor-pointer transition-colors ${
                  tab === 'import' ? 'bg-[#FFE500] text-black font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Importer / Coller
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-grow overflow-y-auto space-y-3">
          {tab === 'export' ? (
            <>
              <p className="text-xs text-zinc-400 font-tech">
                Copiez le bloc JSON ci-dessous et collez-le directement dans notre conversation pour enregistrer définitivement vos positions exactes :
              </p>
              <textarea
                readOnly
                value={JSON.stringify(facilities, null, 2)}
                className="w-full h-72 bg-black border border-zinc-700 p-3 font-mono-tech text-xs text-[#00e5ff] focus:outline-none select-all"
              />
            </>
          ) : (
            <>
              <p className="text-xs text-zinc-400 font-tech">
                Collez votre code JSON ci-dessous puis cliquez sur &quot;Appliquer la configuration&quot; pour charger immédiatement vos positions :
              </p>
              <textarea
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='{"cuc-tower": { "x": 7, "z": 14, "rotationY": 0, "scale": 1.0, ... }}'
                className="w-full h-72 bg-black border border-zinc-700 p-3 font-mono-tech text-xs text-[#FFE500] focus:outline-none placeholder:text-zinc-600"
              />
              {importError && (
                <div className="p-2.5 bg-red-950/60 border border-red-700 text-red-300 text-xs font-mono-tech">
                  {importError}
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-4 border-t border-zinc-800 flex items-center justify-between gap-3 bg-[#12141c]">
          {tab === 'export' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onCopyConfiguration}
                className="py-2.5 px-4 bg-[#FFE500] hover:bg-white text-black font-bold font-mono-tech text-xs uppercase flex items-center gap-2 cursor-pointer shadow"
              >
                {copiedFeedback ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedFeedback ? 'COPIÉ !' : 'TOUT COPIER'}</span>
              </button>
              <button
                onClick={onDownloadJson}
                className="py-2.5 px-3 bg-[#181a24] hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono-tech text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#00e5ff]" />
                <span>Fichier .json</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleApply}
              className="py-2.5 px-5 bg-[#00e5ff] hover:bg-white text-black font-bold font-mono-tech text-xs uppercase flex items-center gap-2 cursor-pointer shadow"
            >
              <Check className="w-4 h-4" />
              <span>Appliquer la configuration</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white font-mono-tech text-xs cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
