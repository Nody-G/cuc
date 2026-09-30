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
                <div className="lg:col-span-5 space-y-4">
                    {/* Official Workshop Poster Card */}
                    <div className="relative aspect-[3/4] w-full max-w-md mx-auto border-2 border-zinc-800 hover:border-[#FFE500]/60 transition-all duration-300 overflow-hidden bg-[#0c0c10] group shadow-xl">
                        <Image
                            src={WORKSHOP_MEDIA.poster}
                            alt="International Stunt Workshop Official Poster"
                            fill
                            sizes="(max-width: 1024px) 100vw, 40vw"
                            className="object-cover object-center group-hover:scale-103 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />
                        <div className="absolute top-3 left-3">
                            <span className="text-[10px] font-mono-tech uppercase font-bold tracking-widest bg-black/80 border border-[#FFE500]/60 text-[#FFE500] px-2.5 py-1">
                                AFFICHE OFFICIELLE
                            </span>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 text-left">
                            <p className="text-xs font-mono-tech text-zinc-300 uppercase font-semibold">
                                Session Internationale CUC
                            </p>
                            <p className="text-[10px] font-mono-tech text-[#FFE500]">
                                Certification Pro Action Performer
                            </p>
                        </div>
                    </div>

                    {/* Secondary Action Grid */}
                    <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                        <div className="relative aspect-[4/3] border border-zinc-800 hover:border-zinc-600 transition-colors overflow-hidden group bg-black">
                            <Image
                                src={WORKSHOP_MEDIA.tower}
                                alt="CUC Tower Stunt Jump"
                                fill
                                sizes="(max-width: 1024px) 50vw, 20vw"
                                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                            <span className="absolute bottom-2 left-2 text-[9px] font-mono-tech uppercase font-bold text-white bg-black/70 px-1.5 py-0.5 border border-zinc-700">
                                Tour de chute 21m
                            </span>
                        </div>

                        <div className="relative aspect-[4/3] border border-zinc-800 hover:border-zinc-600 transition-colors overflow-hidden group bg-black">
                            <Image
                                src={WORKSHOP_MEDIA.bri}
                                alt={program.briAlt}
                                fill
                                sizes="(max-width: 1024px) 50vw, 20vw"
                                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                            <span className="absolute bottom-2 left-2 text-[9px] font-mono-tech uppercase font-bold text-white bg-black/70 px-1.5 py-0.5 border border-zinc-700">
                                Tactique & BRI
                            </span>
                        </div>
                    </div>

                    {/* Full Width Performer Crowd */}
                    <div className="relative aspect-[16/9] w-full max-w-md mx-auto border border-zinc-800 hover:border-zinc-600 transition-colors overflow-hidden group bg-black">
                        <Image
                            src={WORKSHOP_MEDIA.crowd}
                            alt="International Performers at CUC"
                            fill
                            sizes="(max-width: 1024px) 100vw, 40vw"
                            className="object-cover object-center group-hover:scale-103 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                        <span className="absolute bottom-2 left-2 text-[9px] font-mono-tech uppercase font-bold text-white bg-black/70 px-2 py-0.5 border border-zinc-700">
                            Performers du Monde Entier au CUC
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </section>
);
