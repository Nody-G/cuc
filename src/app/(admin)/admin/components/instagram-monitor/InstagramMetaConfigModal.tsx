'use client';

import React from 'react';
import { X, Key, ShieldCheck, HelpCircle } from 'lucide-react';
import type { InstagramMetaApiConfig } from '@/types/instagram-monitor';

interface InstagramMetaConfigModalProps {
    isOpen: boolean;
    config: InstagramMetaApiConfig;
    onClose: () => void;
    onSave: (config: InstagramMetaApiConfig) => void;
}

export const InstagramMetaConfigModal: React.FC<InstagramMetaConfigModalProps> = ({
    isOpen,
    config,
    onClose,
    onSave,
}) => {
    const [enabled, setEnabled] = React.useState(config.enabled);
    const [accessToken, setAccessToken] = React.useState(config.accessToken || '');
    const [instagramAccountId, setInstagramAccountId] = React.useState(config.instagramAccountId || '');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            enabled,
            accessToken: accessToken.trim(),
            instagramAccountId: instagramAccountId.trim(),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0e0e14] border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                    <Key className="w-5 h-5 text-[#FFE500]" />
                    <h3 className="text-base font-display uppercase tracking-wider text-white">
                        Configuration Meta Graph API (Instagram Pro)
                    </h3>
                </div>
                <p className="text-xs font-tech text-zinc-400 mb-6">
                    Jeton officiel Meta Graph API de Campus Univers Cascades (@campus.univers.cascades) pour des métriques 100% certifiées.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Switch actif/inactif */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#14141e] border border-zinc-800">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className={`w-4 h-4 ${enabled ? 'text-emerald-400' : 'text-zinc-500'}`} />
                            <div>
                                <div className="text-xs font-mono-tech uppercase text-white font-bold">
                                    Bascule Meta Graph API
                                </div>
                                <div className="text-[11px] text-zinc-400">
                                    {enabled
                                        ? 'Mode API Meta officiel actif (1 120 712 abonnés & vues certifiées)'
                                        : 'Mode Scraper intelligent actif (repli)'}
                                </div>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => setEnabled(e.target.checked)}
                            className="w-4 h-4 accent-[#FFE500] cursor-pointer"
                        />
                    </div>

                    {/* Instagram Account ID */}
                    <div>
                        <label className="block text-[11px] font-mono-tech uppercase text-zinc-400 mb-1">
                            Instagram User / Account ID
                        </label>
                        <input
                            type="text"
                            value={instagramAccountId}
                            onChange={(e) => setInstagramAccountId(e.target.value)}
                            placeholder="ex: 29639246745665985"
                            className="w-full bg-[#121218] border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono-tech text-white placeholder-zinc-600 focus:border-[#FFE500] focus:outline-none"
                        />
                    </div>

                    {/* Access Token */}
                    <div>
                        <label className="block text-[11px] font-mono-tech uppercase text-zinc-400 mb-1">
                            Meta User Access Token (Long-Lived 60j — auto-renouvelé)
                        </label>
                        <textarea
                            value={accessToken}
                            onChange={(e) => setAccessToken(e.target.value)}
                            placeholder="IGAA... ou EAA..."
                            rows={3}
                            className="w-full bg-[#121218] border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono-tech text-white placeholder-zinc-600 focus:border-[#FFE500] focus:outline-none resize-none"
                        />
                    </div>

                    {/* Info */}
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] leading-relaxed">
                        <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>
                            Le jeton long-lived est stocké de manière sécurisée dans Supabase et renouvelé automatiquement tous les 20 jours. Les statistiques d&apos;abonnés et les vues de Reels sont certifiées directement depuis les serveurs Meta.
                        </span>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-xs font-mono-tech text-zinc-400 hover:text-white"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 rounded-xl bg-[#FFE500] text-black font-bold text-xs font-mono-tech uppercase hover:bg-yellow-400 transition-colors cursor-pointer"
                        >
                            Enregistrer la configuration
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
