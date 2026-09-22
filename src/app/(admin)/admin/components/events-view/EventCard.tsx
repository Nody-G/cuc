'use client';

import React from 'react';
import Image from 'next/image';
import { Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import type { SiteEvent } from '@/lib/data/site-service';

interface EventCardProps {
    event: SiteEvent;
    onEdit: (event: SiteEvent) => void;
    onDelete: (id: string, title: string) => void;
}

/** Carte d'une prestation : visuel, badges, aperçu des atouts et actions. */
export const EventCard: React.FC<EventCardProps> = ({ event, onEdit, onDelete }) => (
    <div className="bg-[#0D0D12] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-white/30 transition-all group">
        <div>
            {/* Image d'illustration */}
            <div className="relative aspect-video bg-black/60 overflow-hidden">
                {event.image_url ? (
                    <Image
                        src={event.image_url}
                        alt={event.title}
                        fill
                        sizes="350px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 font-mono">
                        PAS D'IMAGE
                    </div>
                )}
                {event.badge && (
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded bg-[#FFE500] text-black text-[10px] font-black uppercase tracking-wider">
                        {event.badge}
                    </span>
                )}
            </div>

            {/* Contenu */}
            <div className="p-5 space-y-3">
                <h3 className="text-lg font-bold text-white group-hover:text-[#FFE500] transition-colors">
                    {event.title}
                </h3>
                {event.subtitle && (
                    <p className="text-xs text-gray-400 font-medium line-clamp-1">{event.subtitle}</p>
                )}
                <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">
                    {event.description}
                </p>

                {event.features && event.features.length > 0 && (
                    <div className="pt-2 space-y-1.5 border-t border-white/10">
                        {event.features.slice(0, 3).map((feat, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-gray-400">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span className="truncate">{feat}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Pied de carte */}
        <div className="p-5 pt-3 border-t border-white/10 flex items-center justify-between bg-black/20">
            <span className="text-xs font-mono font-bold text-[#FFE500]">
                {event.price_indicator || 'Sur devis'}
            </span>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onEdit(event)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                    <Edit2 className="w-3.5 h-3.5" />
                    Modifier
                </button>
                <button
                    onClick={() => onDelete(event.id, event.title)}
                    title="Supprimer"
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    </div>
);
