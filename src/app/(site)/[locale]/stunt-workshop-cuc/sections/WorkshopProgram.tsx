import React from 'react';
import Image from 'next/image';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { CheckCircle2, Zap } from 'lucide-react';
import { WORKSHOP_MEDIA, type WorkshopCurriculumItem } from './workshop-copy';
import type { WorkshopProgramCopy } from './useWorkshopContent';

export interface WorkshopProgramProps {
    program: WorkshopProgramCopy;
    curriculum: Required<WorkshopCurriculumItem>[];
}

export const WorkshopProgram: React.FC<WorkshopProgramProps> = ({ program, curriculum }) => (
    <section className="py-16">
        <div className="page-shell">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7 space-y-6">
                    <div className="inline-flex items-center gap-2">
                        <StuntBadge variant="yellow" icon={<Zap className="w-3.5 h-3.5" />}>
                            <span data-cuc-field="sections_data.workshop.program_badge">{program.badge}</span>
                        </StuntBadge>
                        <span
                            data-cuc-field="sections_data.workshop.program_tag"
                            className="text-xs font-mono-tech text-zinc-400"
                        >
                            {program.tag}
                        </span>
                    </div>

                    <h2
                        data-cuc-field="sections_data.workshop.program_title"
                        className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white"
                    >
                        {program.title}
                    </h2>

                    <p
                        data-cuc-field="sections_data.workshop.program_intro"
                        className="text-sm font-tech text-zinc-300 leading-relaxed"
                    >
                        {program.intro}
                    </p>

                    <div className="space-y-3 text-xs font-tech text-zinc-300">
                        {curriculum.map((item, index) => (
                            <div
                                key={index}
                                className="p-3.5 bg-[#0e0e14] border border-zinc-800 flex items-start gap-3"
                            >
                                <CheckCircle2 className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                                <div>
                                    <strong
                                        data-cuc-field={`sections_data.workshop.curriculum.${index}.title`}
                                        className="text-white font-mono-tech block mb-0.5"
                                    >
                                        {item.title}
                                    </strong>
                                    <span data-cuc-field={`sections_data.workshop.curriculum.${index}.desc`}>
                                        {item.desc}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side Visual Cards — Real Workshop Photos */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="relative h-64 border border-zinc-800 overflow-hidden bg-black/40">
                        <Image
                            src={WORKSHOP_MEDIA.poster}
                            alt="International Stunt Workshop Official Poster"
                            fill
                            sizes="(max-width: 1024px) 100vw, 40vw"
                            className="object-contain"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="relative h-40 border border-zinc-800 overflow-hidden">
                            <Image
                                src={WORKSHOP_MEDIA.bri}
                                alt={program.briAlt}
                                fill
                                sizes="25vw"
                                className="object-cover object-center"
                            />
                        </div>

                        <div className="relative h-40 border border-zinc-800 overflow-hidden">
                            <Image
                                src={WORKSHOP_MEDIA.tower}
                                alt="CUC Tower Stunt Jump"
                                fill
                                sizes="25vw"
                                className="object-cover object-center"
                            />
                        </div>
                    </div>

                    <div className="relative h-48 border border-zinc-800 overflow-hidden">
                        <Image
                            src={WORKSHOP_MEDIA.crowd}
                            alt="International Performers at CUC"
                            fill
                            sizes="(max-width: 1024px) 100vw, 40vw"
                            className="object-cover object-center"
                        />
                    </div>
                </div>
            </div>
        </div>
    </section>
);
