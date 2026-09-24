'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { cucField } from '@/lib/preview/cuc-field';
import { cucMicro } from '@/lib/preview/cuc-micro';
import type { TeamBuildingWorkshop } from '../team-building-workshops.data';

interface TeamBuildingWorkshopsProps {
    workshops: TeamBuildingWorkshop[];
    /**
     * Vrai quand la liste vient des données de page : seule cette origine
     * autorise l'annotation `data-cuc-field` **indexée** (gabarit littéral, donc
     * auditable par `audit:fields` — jamais de champ fantôme sur le repli).
     */
    editable: boolean;
}

/** Grille des ateliers dynamiques et adaptatifs. */
export const TeamBuildingWorkshops: React.FC<TeamBuildingWorkshopsProps> = ({
    workshops,
    editable,
}) => (
    <section className="py-16">
        <div className="page-shell">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                {workshops.map((workshop, index) => (
                    <WorkshopCard
                        key={workshop.id || index}
                        workshop={workshop}
                        index={index}
                        editable={editable}
                    />
                ))}
            </div>
        </div>
    </section>
);

interface WorkshopCardProps {
    workshop: TeamBuildingWorkshop;
    index: number;
    editable: boolean;
}

const WorkshopCard: React.FC<WorkshopCardProps> = ({ workshop, index, editable }) => {
    const t = useTranslations('teamBuilding');

    return (
        <div className="bg-[#0e0e14] border border-zinc-800 hover:border-[#FFE500]/60 p-5 group transition-all flex flex-col justify-between">
            <div>
                <div
                    {...(editable ? cucField(`sections_data.workshops.${index}.img`, 'image') : {})}
                    className="relative h-56 w-full mb-4 border border-zinc-800 overflow-hidden bg-black"
                >
                    {workshop.img ? (
                        <Image
                            src={workshop.img}
                            alt={workshop.title || t('workshopFallbackTitle')}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-mono-tech text-zinc-500">
                            <span {...cucMicro('teamBuilding.workshopFallbackLabel')}>
                                {t('workshopFallbackLabel')}
                            </span>
                        </div>
                    )}
                    {workshop.category && (
                        <div
                            {...(editable ? cucField(`sections_data.workshops.${index}.category`) : {})}
                            className="absolute top-3 left-3 bg-black/85 px-2.5 py-0.5 text-[10px] font-mono-tech text-[#FFE500] border border-white/20"
                        >
                            {workshop.category}
                        </div>
                    )}
                </div>

                <h3
                    {...(editable ? cucField(`sections_data.workshops.${index}.title`) : {})}
                    className="text-xl font-display uppercase tracking-wide text-white group-hover:text-[#FFE500] transition-colors mb-2"
                >
                    {workshop.title}
                </h3>
                <p
                    {...(editable ? cucField(`sections_data.workshops.${index}.desc`, 'textarea') : {})}
                    className="text-xs font-tech text-zinc-400 leading-relaxed"
                >
                    {workshop.desc}
                </p>
            </div>

            <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono-tech text-zinc-500">
                <span {...cucMicro('teamBuilding.workshopChoice')}>{t('workshopChoice')}</span>
                <span className="text-[#FFE500]" {...cucMicro('teamBuilding.workshopModular')}>
                    {t('workshopModular')}
                </span>
            </div>
        </div>
    );
};
