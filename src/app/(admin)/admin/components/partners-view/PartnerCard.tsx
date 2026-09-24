'use client';

import React from 'react';
import Image from 'next/image';
import { Edit2, ExternalLink, Trash2 } from 'lucide-react';
import type { SitePartner } from '@/lib/data/site-service';

interface PartnerCardProps {
    partner: SitePartner;
    onEdit: (partner: SitePartner) => void;
    onDelete: (id: string, name: string) => void;
}

/** Carte d'un partenaire : logo (ou repli), nom, catégorie, actions. */
export const PartnerCard: React.FC<PartnerCardProps> = ({ partner, onEdit, onDelete }) => (
    <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-5 flex flex-col justify-between hover:border-white/30 transition-all group">
        <div>
            <div className="relative aspect-[3/2] bg-black/40 rounded-lg p-3 flex items-center justify-center border border-white/5 overflow-hidden mb-3">
                {partner.logo_url ? (
                    <Image
                        src={partner.logo_url}
                        alt={partner.name}
                        fill
                        sizes="180px"
                        className="object-contain p-2 group-hover:scale-105 transition-transform"
                    />
                ) : (
                    <span className="text-xs text-gray-500 font-mono">PAS DE LOGO</span>
                )}
            </div>

            <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-bold text-white truncate">{partner.name}</div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-gray-300 uppercase">
                    {partner.category}
                </span>
            </div>
        </div>

        <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
            {partner.website_url ? (
                <a
                    href={partner.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-gray-400 hover:text-[#FFE500] flex items-center gap-1"
                >
                    <span>Site web</span>
                    <ExternalLink className="w-3 h-3" />
                </a>
            ) : (
                <span />
            )}

            <div className="flex items-center gap-1.5">
                <button
                    onClick={() => onEdit(partner)}
                    className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                    title="Modifier"
                >
                    <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={() => onDelete(partner.id, partner.name)}
                    className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                    title="Supprimer"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    </div>
);
