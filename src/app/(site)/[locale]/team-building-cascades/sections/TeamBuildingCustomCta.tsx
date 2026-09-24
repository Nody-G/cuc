'use client';

import React from 'react';
import { ChevronRight, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { cucMicro } from '@/lib/preview/cuc-micro';

/** Appel à l'action « formule personnalisée » en fin de page. */
export const TeamBuildingCustomCta: React.FC = () => {
    const t = useTranslations('teamBuilding');

    return (
        <section className="py-16 bg-[#0c0c10] border-t border-zinc-800">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <StuntBadge variant="yellow" icon={<Users className="w-3.5 h-3.5" />}>
                    <span {...cucMicro('teamBuilding.customBadge')}>{t('customBadge')}</span>
                </StuntBadge>
                <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white mt-3 mb-4">
                    <span {...cucMicro('teamBuilding.customTitle')}>{t('customTitle')}</span>
                </h2>
                <p className="text-xs sm:text-sm font-tech text-zinc-400 leading-relaxed mb-8 max-w-2xl mx-auto">
                    <span {...cucMicro('teamBuilding.customDescription')}>
                        {t('customDescription')}
                    </span>
                </p>
                <Link href="/contact-cuc?demande=cuc-events">
                    <TacticalButton
                        variant="primary"
                        size="lg"
                        icon={<ChevronRight className="w-4 h-4" />}
                    >
                        <span {...cucMicro('teamBuilding.customCta')}>{t('customCta')}</span>
                    </TacticalButton>
                </Link>
            </div>
        </section>
    );
};
