import React from 'react';
import Link from 'next/link';
import { Home, Compass, GraduationCap, Users, Film, Mail } from 'lucide-react';
import '@/app/globals.css';

export const metadata = {
    title: 'Page non trouvée (404) • Campus Univers Cascades',
    description: "La page que vous recherchez n'existe pas ou a été déplacée.",
    robots: { index: false, follow: false },
};

/**
 * Page 404 racine de secours pour l'ensemble du domaine CUC.
 *
 * Entièrement statique et auto-portante (rend ses propres balises <html> et <body>),
 * sans dépendance à RootShell ni à Supabase/next-intl au moment du prerendering.
 */
export default function GlobalNotFound() {
    return (
        <html lang="fr" className="dark">
            <body className="antialiased min-h-screen bg-[#060608] text-white flex flex-col items-center justify-center px-4 sm:px-6 py-20 relative overflow-hidden selection:bg-[#FFE500] selection:text-black">
                {/* Glow ambiant */}
                <div
                    className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-[#FFE500]/[0.03] rounded-full blur-3xl pointer-events-none"
                    aria-hidden="true"
                />

                <div className="max-w-2xl w-full text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#FFE500]/25 bg-[#FFE500]/5 mb-6">
                        <Compass className="w-3.5 h-3.5 text-[#FFE500] animate-pulse" />
                        <span className="font-mono text-[10px] sm:text-xs font-bold tracking-[0.25em] text-[#FFE500] uppercase">
                            ERREUR 404 • HORS PISTE
                        </span>
                    </div>

                    <h1 className="font-display text-8xl sm:text-9xl md:text-[10rem] font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-600 drop-shadow-[0_15px_35px_rgba(0,0,0,0.9)] select-none">
                        404
                    </h1>

                    <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-wider text-white mt-2 mb-3">
                        ZONE NON RÉPERTORIÉE
                    </h2>

                    <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed mb-8">
                        La page que vous cherchez n'existe pas ou a été déplacée lors d'une cascade.
                        Reprenez votre élan en choisissant l'une des destinations ci-dessous.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
                        <Link
                            href="/"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#FFE500] hover:bg-[#FFE500]/90 text-black text-xs font-black uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(255,229,0,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Home className="w-4 h-4 shrink-0" />
                            <span>Retour à l&apos;accueil</span>
                        </Link>
                        <Link
                            href="/contact-cuc"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 border border-zinc-700 hover:border-zinc-500 bg-white/[0.02] hover:bg-white/[0.06] text-zinc-200 text-xs font-bold uppercase tracking-wider rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Mail className="w-4 h-4 shrink-0 text-[#FFE500]" />
                            <span>Nous contacter</span>
                        </Link>
                    </div>

                    <div className="pt-8 border-t border-white/10 text-left">
                        <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-zinc-500 mb-3 text-center sm:text-left">
                            Pages recommandées :
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <Link
                                href="/formation-de-cascadeur"
                                className="group p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-[#FFE500]/40 transition-all flex items-center gap-2.5"
                            >
                                <GraduationCap className="w-4 h-4 text-[#FFE500] shrink-0" />
                                <span className="text-xs font-bold text-zinc-300 group-hover:text-white uppercase truncate">
                                    Formations
                                </span>
                            </Link>
                            <Link
                                href="/cuc-team-cascadeur"
                                className="group p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-[#FFE500]/40 transition-all flex items-center gap-2.5"
                            >
                                <Users className="w-4 h-4 text-[#FFE500] shrink-0" />
                                <span className="text-xs font-bold text-zinc-300 group-hover:text-white uppercase truncate">
                                    L&apos;Équipe
                                </span>
                            </Link>
                            <Link
                                href="/videos-cascadeur"
                                className="group p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-[#FFE500]/40 transition-all flex items-center gap-2.5"
                            >
                                <Film className="w-4 h-4 text-[#FFE500] shrink-0" />
                                <span className="text-xs font-bold text-zinc-300 group-hover:text-white uppercase truncate">
                                    Vidéos & Démos
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
