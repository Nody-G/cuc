'use client';

import React from 'react';
import Image from 'next/image';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { SpectacleTypeItem } from './spectacles-types.data';
import { CheckCircle2 } from 'lucide-react';

interface SpectacleTypeCardProps {
  item: SpectacleTypeItem;
  reversed?: boolean;
}

export const SpectacleTypeCard: React.FC<SpectacleTypeCardProps> = ({
  item,
  reversed = false,
}) => {
  return (
    <article className="bg-[#0e0e14] border-2 border-zinc-800 hover:border-zinc-700 transition-colors p-6 sm:p-8 lg:p-10 relative">
      <div
        className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
          reversed ? 'lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1' : ''
        }`}
      >
        {/* Left or Right Content */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-3">
            <StuntBadge variant="yellow">
              <span>{item.badge}</span>
            </StuntBadge>
            <span className="text-xs font-mono-tech text-zinc-400 uppercase tracking-wider">
              {item.subtitle}
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white">
            {item.title}
          </h3>

          <p className="text-sm font-tech text-zinc-300 leading-relaxed">
            {item.description}
          </p>

          <div className="p-4 bg-[#14141c] border border-zinc-800/80 space-y-2.5 text-xs font-tech">
            <div className="text-[#FFE500] font-mono-tech font-bold uppercase tracking-wider text-[11px]">
              Spécifications &amp; Logistique
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-300">
              {item.specs.map((spec) => (
                <li key={spec.label} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FFE500] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">{spec.label}</strong> {spec.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Visual */}
        <div className="lg:col-span-5 relative">
          <div className="relative h-64 sm:h-80 w-full border border-zinc-700/80 overflow-hidden bg-black shadow-xl group">
            <Image
              src={item.image}
              alt={item.imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
          </div>
        </div>
      </div>
    </article>
  );
};
