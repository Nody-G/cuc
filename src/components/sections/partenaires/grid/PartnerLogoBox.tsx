'use client';

import React from 'react';
import Image from 'next/image';

interface PartnerLogoBoxProps {
    name: string;
    logoUrl?: string | null;
    /** Passé à `true` après un échec de chargement : bascule sur le nom en texte. */
    failed: boolean;
    onError: () => void;
}

/** Boîte logo d'un partenaire CMS : image sur fond blanc, repli sur le nom. */
export const PartnerLogoBox: React.FC<PartnerLogoBoxProps> = ({
    name,
    logoUrl,
    failed,
    onError,
}) => (
    <div className="relative h-24 w-full bg-white border border-zinc-200 group-hover:border-[#FFE500] mb-4 p-4 flex items-center justify-center overflow-hidden transition-colors rounded-xs">
        {logoUrl && !failed ? (
            <div className="relative w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Image
                    src={logoUrl}
                    alt={`Logo ${name}`}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    onError={onError}
                />
            </div>
        ) : (
            <span className="text-base font-display uppercase text-zinc-900 font-bold tracking-wider">{name}</span>
        )}
    </div>
);
