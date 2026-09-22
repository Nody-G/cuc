'use client';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

import { useEffect } from 'react';


/**
 * Frontière d'erreur applicative (route-level).
 *
 * Objectif : ne plus JAMAIS afficher la page d'erreur brute de Next.js
 * (« This page couldn't load / Reload to try again, or go back. »).
 *
 * Contexte : la panne de production du site vitrine provenait d'une exception
 * client non capturée dans `useNavigation.ts` (appel `.on('postgres_changes')`
 * après `.subscribe()` sur un canal Realtime déjà souscrit). L'exception
 * remontait jusqu'à la frontière `global-error` de Next et remplaçait toute
 * la page. Cette frontière intercepte désormais l'erreur, la journalise et
 * propose une reprise propre sans perdre l'utilisateur.
 */
export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const t = useTranslations('common');
    /** Chrome commun : nom du campus — éditable via « Micro-textes du site ». */
    const chrome = useTranslations('commonChrome');

    useEffect(() => {
        // Journalisation exploitable pour le diagnostic (console navigateur + Vercel).
        console.error('[CUC] Erreur applicative interceptée :', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#060608] text-white flex flex-col items-center justify-center px-6 selection:bg-[#FFE500] selection:text-black">
            <div className="max-w-lg w-full text-center">
                <p className="font-mono-tech text-[11px] uppercase tracking-[0.3em] text-[#FFE500] mb-4">
                    {chrome('campusNameTitle')}
                </p>
                <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-wide mb-4">
                    {t('errorTitle')}
                </h1>
                <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                    {t('errorText')}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => reset()}
                        className="w-full sm:w-auto px-6 py-3 bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-black uppercase tracking-wider rounded-lg transition-transform active:scale-95"
                    >
                        {t('retry')}
                    </button>
                    <Link
                        href="/"
                        className="w-full sm:w-auto px-6 py-3 border border-zinc-700 hover:border-zinc-500 text-zinc-200 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors text-center"
                    >
                        {t('backHome')}
                    </Link>
                </div>

                {error.digest && (
                    <p className="mt-8 font-mono-tech text-[10px] text-zinc-600">
                        {t('errorReference', { digest: error.digest })}
                    </p>
                )}
            </div>
        </div>
    );
}
