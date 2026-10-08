'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Home, GraduationCap, Users, Film, Mail, Compass } from 'lucide-react';
import { cucMicro } from '@/lib/preview/cuc-micro';

/**
 * Page 404 personnalisée pour le site vitrine CUC (bilingue FR/EN).
 *
 * S'affiche automatiquement lors de la navigation vers une URL inexistante.
 * Esthétique cinématique sombre, typographie signature CUC et suggestions de
 * redirection vers les rubriques clés de l'école de cascadeurs.
 */
export default function NotFoundPage() {
    const t = useTranslations('common');
    const chrome = useTranslations('commonChrome');

    const suggestedLinks = [
        {
            href: '/formation-de-cascadeur',
            labelKey: 'exploreFormations',
            defaultLabel: 'Formations & Stages',
            descFr: 'Cursus pro, stages intensifs & certifications',
            descEn: 'Pro curriculum, intensive workshops & certifications',
            icon: GraduationCap,
        },
        {
            href: '/cuc-team-cascadeur',
            labelKey: 'exploreTeam',
            defaultLabel: "L'Équipe CUC",
            descFr: 'Coachs, cascadeurs & coordinateurs de combat',
            descEn: 'Coaches, stunt performers & fight coordinators',
            icon: Users,
        },
        {
            href: '/videos-cascadeur',
            labelKey: 'exploreVideos',
            defaultLabel: 'Vidéos & Démos',
            descFr: 'Chorégraphies, chutes & scènes de tournage',
            descEn: 'Fight choreography, high falls & stunt reels',
            icon: Film,
        },
        {
            href: '/contact-cuc',
            labelKey: 'contactUs',
            defaultLabel: 'Nous contacter',
            descFr: 'Questions, candidatures & projets de production',
            descEn: 'Inquiries, applications & production projects',
            icon: Mail,
        },
    ];

    return (
        <main className="min-h-screen bg-[#060608] text-white flex flex-col items-center justify-center px-4 sm:px-6 py-24 relative overflow-hidden selection:bg-[#FFE500] selection:text-black">
            {/* Effet lumineux d'ambiance en arrière-plan */}
            <div
                className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] bg-[#FFE500]/[0.035] rounded-full blur-3xl pointer-events-none"
                aria-hidden="true"
            />

            <div className="max-w-3xl w-full text-center relative z-10">
                {/* Badge cinématique */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#FFE500]/25 bg-[#FFE500]/5 mb-6">
                    <Compass className="w-3.5 h-3.5 text-[#FFE500] animate-pulse" />
                    <span
                        className="font-mono text-[10px] sm:text-xs font-bold tracking-[0.25em] text-[#FFE500] uppercase"
                        {...cucMicro('common.notFoundBadge')}
                    >
                        {t('notFoundBadge')}
                    </span>
                </div>

                {/* Monumental 404 */}
                <h1 className="font-display text-8xl sm:text-9xl md:text-[11rem] font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-600 drop-shadow-[0_15px_35px_rgba(0,0,0,0.9)] select-none">
                    404
                </h1>

                {/* Titre & Sous-titre */}
                <h2
                    className="font-display text-2xl sm:text-3xl md:text-4xl uppercase tracking-wider text-white mt-2 mb-4"
                    {...cucMicro('common.notFoundTitle')}
                >
                    {t('notFoundTitle')}
                </h2>

                <p
                    className="text-zinc-300 text-sm sm:text-base font-medium max-w-xl mx-auto leading-relaxed mb-3"
                    {...cucMicro('common.notFoundSubtitle')}
                >
                    {t('notFoundSubtitle')}
                </p>

                <p
                    className="text-zinc-500 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed mb-10"
                    {...cucMicro('common.notFoundDescription')}
                >
                    {t('notFoundDescription')}
                </p>

                {/* Boutons d'action principaux */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
                    <Link
                        href="/"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#FFE500] hover:bg-[#FFE500]/90 text-black text-xs font-black uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(255,229,0,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Home className="w-4 h-4 shrink-0" />
                        <span {...cucMicro('common.backHome')}>{t('backHome')}</span>
                    </Link>
                    <Link
                        href="/contact-cuc"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 border border-zinc-700 hover:border-zinc-500 bg-white/[0.02] hover:bg-white/[0.06] text-zinc-200 text-xs font-bold uppercase tracking-wider rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Mail className="w-4 h-4 shrink-0 text-[#FFE500]" />
                        <span {...cucMicro('common.contactUs')}>{t('contactUs')}</span>
                    </Link>
                </div>

                {/* Grille de suggestions de pages */}
                <div className="text-left pt-8 border-t border-white/10">
                    <p
                        className="font-mono text-[11px] font-semibold tracking-widest uppercase text-zinc-400 mb-4 text-center sm:text-left"
                        {...cucMicro('common.suggestedPages')}
                    >
                        {t('suggestedPages')}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {suggestedLinks.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="group p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-[#FFE500]/40 transition-all flex items-start gap-3.5"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-[#FFE500]/10 border border-[#FFE500]/20 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-[#FFE500] group-hover:text-black transition-all">
                                        <IconComponent className="w-4 h-4 text-[#FFE500] group-hover:text-black transition-colors" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs font-bold text-white uppercase tracking-wider group-hover:text-[#FFE500] transition-colors truncate">
                                            {t(item.labelKey)}
                                        </div>
                                        <div className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                                            {t('language') === 'Langue' ? item.descFr : item.descEn}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Signature CUC */}
                <div className="mt-12 text-center">
                    <p className="font-mono text-[10px] tracking-widest uppercase text-zinc-600">
                        {chrome('campusNameTitle')} • {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </main>
    );
}
