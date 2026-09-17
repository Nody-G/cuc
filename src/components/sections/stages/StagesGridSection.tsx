'use client';

import React from 'react';
import Image from 'next/image';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { STAGES_LIST, StageData } from './stages.data';
import {
  Clock,
  MapPin,
  FileText,
  ShieldCheck,
  Bed,
  Utensils,
  Users,
  Sparkles,
} from 'lucide-react';

interface StagesGridSectionProps {
  onOpenApplication: (programId: string) => void;
  customStages?: any[];
}

const renderIcon = (type: string) => {
  switch (type) {
    case 'clock':
      return <Clock className="w-4 h-4 text-[#FFE500] shrink-0" />;
    case 'bed':
      return <Bed className="w-4 h-4 text-[#FFE500] shrink-0" />;
    case 'utensils':
      return <Utensils className="w-4 h-4 text-[#FFE500] shrink-0" />;
    case 'map':
      return <MapPin className="w-4 h-4 text-[#FFE500] shrink-0" />;
    case 'shield':
      return <ShieldCheck className="w-4 h-4 text-[#FFE500] shrink-0" />;
    case 'sparkles':
      return <Sparkles className="w-4 h-4 text-[#FFE500] shrink-0" />;
    case 'users':
      return <Users className="w-4 h-4 text-[#FFE500] shrink-0" />;
    default:
      return <Clock className="w-4 h-4 text-[#FFE500] shrink-0" />;
  }
};

const renderBadge = (badge: StageData['badge']) => {
  switch (badge.variant) {
    case 'yellow':
      return (
        <span className="px-2.5 py-0.5 bg-[#FFE500] text-black font-mono-tech text-xs font-bold uppercase">
          {badge.text}
        </span>
      );
    case 'emerald':
      return (
        <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono-tech text-xs font-bold uppercase">
          {badge.text}
        </span>
      );
    case 'red':
      return (
        <span className="px-2.5 py-0.5 bg-red-500/20 text-red-400 border border-red-500/40 font-mono-tech text-xs font-bold uppercase">
          {badge.text}
        </span>
      );
    default:
      return null;
  }
};

export const StagesGridSection: React.FC<StagesGridSectionProps> = ({
  onOpenApplication,
  customStages,
}) => {
  const displayList: StageData[] = (customStages && customStages.length > 0)
    ? customStages.map((cs: any, idx: number) => {
        const match = STAGES_LIST.find((s) => s.id === cs.id) || STAGES_LIST[idx % STAGES_LIST.length];
        return {
          ...match,
          id: cs.id || match?.id || `stage-${idx}`,
          title: cs.title || match?.title,
          description: cs.description || match?.description,
          badge: cs.level
            ? { text: cs.level, variant: 'yellow' as const }
            : (match?.badge || { text: 'STAGE CUC', variant: 'yellow' as const }),
          subBadge: cs.subtitle || match?.subBadge,
          buttonLabel: cs.price
            ? `Réserver (${cs.price})`
            : (match?.buttonLabel || 'Réserver mon stage'),
          details: cs.duration
            ? [
                { icon: 'clock' as const, text: cs.duration },
                ...(match?.details?.slice(1) || [
                  { icon: 'map' as const, text: 'Campus CUC, Le Cateau-Cambrésis (59)' },
                ]),
              ]
            : (match?.details || []),
          image: cs.image?.src
            ? cs.image
            : (match?.image || {
                src: 'https://www.campus-universcascades.com/wp-content/uploads/2021/05/Stage-WE-Immersion.png',
                alt: cs.title || 'Stage CUC',
              }),
        };
      })
    : STAGES_LIST;

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {displayList.map((stage) => {
          const isHighlight = stage.isPopular;
          return (
            <div
              key={stage.id}
              className={`p-6 sm:p-10 relative transition-colors ${
                isHighlight
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
                    {renderBadge(stage.badge)}
                    {stage.subBadge && (
                      <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 font-mono-tech text-xs uppercase">
                        {stage.subBadge}
                      </span>
                    )}
                    {stage.highlightText && (
                      <span className="text-emerald-400 text-xs font-mono-tech font-bold">
                        {stage.highlightText}
                      </span>
                    )}
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-display uppercase text-white mb-3">
                    {stage.title}
                  </h2>
                  <p className="text-xs sm:text-sm font-tech text-zinc-300 leading-relaxed mb-6">
                    {stage.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-tech text-zinc-300 mb-6">
                    {stage.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        {renderIcon(detail.icon)}
                        <span>{detail.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <TacticalButton
                      variant="primary"
                      size="md"
                      onClick={() => onOpenApplication(stage.id)}
                    >
                      {stage.buttonLabel}
                    </TacticalButton>
                    {stage.pdfLink && (
                      <a
                        href={stage.pdfLink.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-mono-tech text-zinc-400 hover:text-[#FFE500] transition-colors"
                      >
                        <FileText className="w-4 h-4 text-[#FFE500]" />
                        <span>{stage.pdfLink.label}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Right Photo Preview */}
                <div className="lg:col-span-5 relative h-72 sm:h-96 border border-zinc-800 overflow-hidden flex items-center justify-center bg-black/40">
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
        })}
      </div>
    </section>
  );
};
