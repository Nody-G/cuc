'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertOctagon, RefreshCw, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { reportClientError } from '@/app/(admin)/admin/actions/logs-ingest';

/**
 * Frontière d'erreur du Cockpit d'administration.
 *
 * Intercepte les erreurs inattendues dans les modules d'administration sans
 * jamais casser l'ensemble de l'interface ni afficher d'écran noir.
 * Journalise automatiquement l'incident dans les logs techniques du site.
 */
export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[Cockpit] Erreur module interceptée :', error);
        void reportClientError({
            message: `[Cockpit] ${error.message || 'Erreur inconnue'}`,
            digest: error.digest,
            path: typeof window === 'undefined' ? '/admin' : window.location.pathname,
        }).catch(() => {
            /* Silencieux pour ne pas dégrader l'écran d'erreur */
        });
    }, [error]);

    return (
        <div className="min-h-screen bg-[#070709] flex flex-col items-center justify-center p-6 text-gray-100 selection:bg-[#FFE500] selection:text-black">
            <div className="max-w-md w-full bg-[#0F0F14] border border-red-500/20 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center mx-auto mb-5 text-red-400">
                    <AlertOctagon className="w-7 h-7" />
                </div>

                <div className="font-mono text-[11px] font-bold tracking-widest text-red-400 uppercase mb-2">
                    COCKPIT • INCIDENT TECHNIQUE
                </div>

                <h1 className="text-xl font-bold uppercase tracking-wider text-white mb-3">
                    Une erreur est survenue dans le module
                </h1>

                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                    Le module n&apos;a pas pu s&apos;afficher correctement. L&apos;incident a été consigné dans le journal technique. Vous pouvez relancer le module ou revenir au tableau de bord.
                </p>

                {error.digest && (
                    <div className="mb-6 p-2.5 rounded-lg bg-black/50 border border-white/10 font-mono text-[11px] text-zinc-500 truncate">
                        ID incident : {error.digest}
                    </div>
                )}

                <div className="flex flex-col gap-2.5">
                    <button
                        type="button"
                        onClick={() => reset()}
                        className="w-full py-3 px-4 rounded-xl bg-[#FFE500] hover:bg-[#FFE500]/90 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
                    >
                        <RefreshCw className="w-4 h-4 shrink-0" />
                        <span>Réessayer le chargement</span>
                    </button>

                    <Link
                        href="/admin"
                        className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                        <LayoutDashboard className="w-4 h-4 shrink-0 text-[#FFE500]" />
                        <span>Tableau de bord</span>
                    </Link>
                </div>

                <div className="mt-6 pt-5 border-t border-white/10">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#FFE500] transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Retourner au site vitrine</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
