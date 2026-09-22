'use client';

import React from 'react';
import Image from 'next/image';
import { FileText } from 'lucide-react';
import { TacticalButton } from '@/components/ui/TacticalButton';
import type { StageData } from '../stages.data';
import { renderBadge, renderIcon } from './stage-render';

interface StageGridCardProps {
    stage: StageData;
    stageIndex: number;
    onOpenApplication: (programId: string) => void;
}

/** Carte d'un stage : badges, texte, détails, CTA + PDF, affiche. */
export const StageGridCard: React.FC<StageGridCardProps> = ({
    stage,
    stageIndex,
    onOpenApplication,
}) => {
    const isHighlight = stage.isPopular;

    return (
        <div
            id={stage.id}
            className={`p-6 sm:p-10 relative transition-colors scroll-mt-24 ${isHighlight
                ? 'bg-[#0e0e14] border-2 border-[#FFE500] shadow-[0_0_30px_rgba(255,229,0,0.08)]'
                : 'bg-[#0e0e14] border-2 border-zinc-800 hover:border-zinc-700'
                }`}
        >
            {isHighlight && (
                <>
                </>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        {renderBadge(
                            stage.badge,
                            `sections_data.stages_cards.items.${stageIndex}.badge_text`
                        )}
                        {stage.subBadge && (
                            <span
                                data-cuc-field={`sections_data.stages_cards.items.${stageIndex}.sub_badge`}
                                className="px-2 py-0.5 bg-zinc-800 text-zinc-300 font-mono-tech text-xs uppercase"
                            >
                                {stage.subBadge}
                            </span>
                        )}
                        {stage.highlightText && (
                            <span
                                data-cuc-field={`sections_data.stages_cards.items.${stageIndex}.highlight_text`}
                                className="text-emerald-400 text-xs font-mono-tech font-bold"
                            >
                                {stage.highlightText}
                            </span>
                        )}
                    </div>

                    <h2
                        data-cuc-field={`sections_data.stages_cards.items.${stageIndex}.title`}
                        className="text-3xl sm:text-4xl font-display uppercase text-white mb-3"
                    >
                        {stage.title}
                    </h2>
                    <p
                        data-cuc-field={`sections_data.stages_cards.items.${stageIndex}.description`}
                        className="text-xs sm:text-sm font-tech text-zinc-300 leading-relaxed mb-6"
                    >
                        {stage.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-tech text-zinc-300 mb-6">
                        {stage.details.map((detail, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                {renderIcon(detail.icon)}
                                <span
                                    data-cuc-field={`sections_data.stages_cards.items.${stageIndex}.details.${idx}`}
                                >
                                    {detail.text}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <TacticalButton
                            variant="primary"
                            size="md"
                            onClick={() => onOpenApplication(stage.id)}
                        >
                            <span
                                data-cuc-field={`sections_data.stages_cards.items.${stageIndex}.button_label`}
                            >
                                {stage.buttonLabel}
                            </span>
                        </TacticalButton>
                        {stage.pdfLink && (
                            <a
                                href={stage.pdfLink.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-xs font-mono-tech text-zinc-400 hover:text-[#FFE500] transition-colors"
                            >
                                <FileText className="w-4 h-4 text-[#FFE500]" />
                                <span
                                    data-cuc-field={`sections_data.stages_cards.items.${stageIndex}.pdf_label`}
                                >
                                    {stage.pdfLink.label}
                                </span>
                            </a>
                        )}
                    </div>
                </div>

                {/* Right Photo Preview */}
                <div
                    data-cuc-field={`sections_data.stages_cards.items.${stageIndex}.image`}
                    data-cuc-kind="image"
                    className="lg:col-span-5 relative h-72 sm:h-96 border border-zinc-800 overflow-hidden flex items-center justify-center bg-black/40"
                >
                    <Image
                        src={stage.image.src}
                        alt={stage.image.alt}
                        fill
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        className="object-contain"
                    />
                </div>
            </div>
        </div>
    );
};
