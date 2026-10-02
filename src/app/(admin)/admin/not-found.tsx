import React from 'react';
import Link from 'next/link';
import { ArrowLeft, LayoutDashboard, HelpCircle, ShieldAlert } from 'lucide-react';

/**
 * Page 404 dédiée au Cockpit d'administration.
 *
 * S'affiche lorsqu'une URL sous `/admin/...` ne correspond à aucun onglet ou
 * module valide. Offre un retour rapide vers le tableau de bord ou l'aide.
 */
export default function AdminNotFound() {
    return (
        <div className="min-h-screen bg-[#070709] flex flex-col items-center justify-center p-6 text-gray-100 selection:bg-[#FFE500] selection:text-black">
            <div className="max-w-md w-full bg-[#0F0F14] border border-white/10 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
                <div className="w-14 h-14 rounded-2xl bg-[#FFE500]/10 border border-[#FFE500]/25 flex items-center justify-center mx-auto mb-5 text-[#FFE500]">
                    <ShieldAlert className="w-7 h-7" />
                </div>

                <div className="font-mono text-[11px] font-bold tracking-widest text-[#FFE500] uppercase mb-2">
                    COCKPIT • ERREUR 404
                </div>

                <h1 className="text-xl font-bold uppercase tracking-wider text-white mb-3">
                    Module ou page introuvable
                </h1>

                <p className="text-xs text-gray-400 leading-relaxed mb-6 font-mono">
                    L&apos;URL d&apos;administration demandée ne correspond à aucun module, onglet ou paramètre du Cockpit CUC.
                </p>

                <div className="flex flex-col gap-2.5">
                    <Link
                        href="/admin"
                        className="w-full py-3 px-4 rounded-xl bg-[#FFE500] hover:bg-[#FFE500]/90 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
                    >
                        <LayoutDashboard className="w-4 h-4 shrink-0" />
                        <span>Tableau de bord</span>
                    </Link>

                    <Link
                        href="/admin/aide"
                        className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                        <HelpCircle className="w-4 h-4 shrink-0 text-[#FFE500]" />
                        <span>Guide & Aide du Cockpit</span>
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
