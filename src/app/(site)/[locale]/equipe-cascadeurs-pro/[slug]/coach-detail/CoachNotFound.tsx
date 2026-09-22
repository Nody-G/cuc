'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

import type { useTranslations } from 'next-intl';

export interface CoachNotFoundProps {
    tt: ReturnType<typeof useTranslations<'team'>>;
}

/** Fiche introuvable : garde d'affichage placée APRÈS tous les hooks. */
export const CoachNotFound: React.FC<CoachNotFoundProps> = ({ tt }) => (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col items-center justify-center p-4">
        <Navbar />
        <div className="text-center max-w-md my-auto">
            <h1 className="text-4xl font-display uppercase text-white mb-4">Coach Introuvable</h1>
            <p className="text-sm font-tech text-zinc-400 mb-6">
                {tt('coachNotFound')}
            </p>
            <Link
                href="/equipe-cascadeurs-pro"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFE500] text-black font-mono-tech text-xs uppercase font-bold"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>{tt('coachBackToTeam')}</span>
            </Link>
        </div>
        <Footer />
    </div>
);
