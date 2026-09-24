'use client';

import React from 'react';
import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';
import type { InfrastructureSpot } from '@/types';

interface FacilityDetailPanelProps {
    facility: InfrastructureSpot;
    /** Index de la fiche affichée : il porte les chemins éditables du détail. */
    index: number;
    specsLabel: string;
    complianceLabel: string;
}

/** Détail de l'installation sélectionnée (colonne droite). */
export const FacilityDetailPanel: React.FC<FacilityDetailPanelProps> = ({
    facility,
    index,
    specsLabel,
    complianceLabel,
}) => (
    <div className="lg:col-span-8 bg-[#0e0e14] border border-zinc-800 p-6 sm:p-8 relative">
        {/* Facility Image — `loading="eager"` + préchargement amont : le
            changement d'installation est instantané (aucun aller-retour
            réseau au clic). */}
        <div
            data-cuc-field={`sections_data.installations.items.${index}.image`}
            data-cuc-kind="image"
            className="relative h-72 sm:h-96 w-full mb-6 border border-zinc-800 overflow-hidden bg-black"
        >
            <Image
                key={facility.id}
                src={facility.image}
                alt={facility.name}
                fill
                loading="eager"
                sizes="(max-width: 1024px) 100vw, 70vw"
                className="object-cover object-center"
                style={{ animation: 'cuc-fade-in 300ms ease-out both' }}
            />
        </div>

        <h3
            data-cuc-field={`sections_data.installations.items.${index}.name`}
            className="text-2xl sm:text-3xl font-display uppercase text-white mb-2"
        >
            {facility.name}
        </h3>
        <p
            data-cuc-field={`sections_data.installations.items.${index}.description`}
            className="text-xs sm:text-sm font-tech text-zinc-300 leading-relaxed mb-6"
        >
            {facility.description}
        </p>

        <div className="space-y-4 pt-4 border-t border-zinc-800 text-xs font-tech">
            <div>
                <strong
                    data-cuc-field="sections_data.installations.specs_label"
                    className="text-[#FFE500] font-mono-tech block mb-2 uppercase"
                >
                    {specsLabel}
                </strong>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {facility.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-zinc-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#FFE500] shrink-0 mt-0.5" />
                            <span
                                data-cuc-field={`sections_data.installations.items.${index}.features.${idx}`}
                            >
                                {feature}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-3 bg-black/50 border border-zinc-800 text-zinc-400">
                <strong
                    data-cuc-field="sections_data.installations.compliance_label"
                    className="text-zinc-300 font-mono-tech text-[11px] block uppercase mb-0.5"
                >
                    {complianceLabel}
                </strong>
                <span
                    data-cuc-field={`sections_data.installations.items.${index}.specifications`}
                >
                    {facility.specifications}
                </span>
            </div>
        </div>
    </div>
);
