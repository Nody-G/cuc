'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { TacticalButton } from '@/components/ui/TacticalButton';

/** Appel à l'action de bas de page : inscription à la formation. */
export const EquipeCallout: React.FC = () => {
    const t = useTranslations('team');

    return (
        <div className="mt-16 bg-[#121218] border-2 border-zinc-800 p-8 text-center relative">
            <h3 className="text-2xl sm:text-3xl font-display uppercase text-white mb-2">
                {t('ctaBlockTitle')}
            </h3>
            <p className="text-xs font-tech text-zinc-400 max-w-xl mx-auto mb-6">
                {t('ctaBlockBody')}
            </p>
            <Link href="/formation-de-cascadeur">
                <TacticalButton variant="primary" size="md">
                    {t('ctaBlockButton')}
                </TacticalButton>
            </Link>
        </div>
    );
};
