'use client';

import React from 'react';
import Image from 'next/image';
import { CUC_TEAM } from '@/data/team';
import { StuntBadge } from '../ui/StuntBadge';
import { Users, ExternalLink } from 'lucide-react';

export const StuntTeam: React.FC = () => {
  return (
    <section id="equipe" className="py-20 bg-[#08080a] relative border-t border-zinc-800">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <StuntBadge variant="yellow" icon={<Users className="w-3.5 h-3.5" />}>
              CORPS ENCADRANT D'ÉLITE
            </StuntBadge>
            <span className="text-xs font-mono-tech text-zinc-500">COORDINATEURS & CASCADEURS PRO</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-display uppercase tracking-tight text-white">
            L'ÉQUIPE PÉDAGOGIQUE DU CUC
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base font-tech mt-3">
            Des professionnels en activité sur les plateaux de cinéma internationaux,
            dédiés à la formation de la nouvelle génération d'action designers.
          </p>
        </div>

        {/* Team Grid with Large Portraits */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CUC_TEAM.map((member) => (
            <div
              key={member.id}
              className="bg-[#0e0e14] border-2 border-zinc-800 hover:border-[#FFE500]/70 transition-all duration-300 relative flex flex-col justify-between group overflow-hidden shadow-xl hover:shadow-[0_15px_40px_rgba(255,229,0,0.1)]"
            >
              {/* Grand Dedicated Portrait Showcase Stage */}
              <div className="relative w-full h-80 sm:h-96 bg-gradient-to-b from-[#181824] via-[#101016] to-[#0e0e14] overflow-hidden flex items-end justify-center border-b border-zinc-800/80">
                {/* Ambient Glow */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FFE500]/15 via-transparent to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Tactical HUD Corners */}

                {/* Role Badge */}
                <div className="absolute top-4 left-4 z-20">
                  <span className="px-3 py-1 bg-black/85 backdrop-blur-xs border border-zinc-700 text-[#FFE500] font-mono-tech text-[11px] uppercase font-bold tracking-wider shadow-md">
                    {member.role}
                  </span>
                </div>

                {/* Portrait */}
                {member.avatarUrl ? (
                  <div className="relative w-full h-full max-h-[96%] flex items-end justify-center">
                    <Image
                      src={member.avatarUrl}
                      alt={member.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-contain object-bottom drop-shadow-[0_20px_35px_rgba(0,0,0,0.95)] group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-display text-8xl text-zinc-800">
                    {member.name.charAt(0)}
                  </div>
                )}

                {/* Bottom shadow blend */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0e0e14] via-[#0e0e14]/60 to-transparent pointer-events-none" />
              </div>

              {/* Card Body */}
              <div className="p-6 flex flex-col justify-between flex-grow">
                <div>
                  <div className="mb-3">
                    <h3 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white group-hover:text-[#FFE500] transition-colors leading-tight">
                      {member.name}
                    </h3>
                    <div className="text-xs font-mono-tech text-[#FFE500] uppercase tracking-wider mt-1">
                      {member.title}
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 font-tech leading-relaxed mb-5">
                    {member.bio}
                  </p>

                  {/* Specialties */}
                  <div className="mb-4">
                    <span className="text-[10px] font-mono-tech uppercase text-zinc-500 block mb-1.5">
                      Spécialités d'intervention :
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {member.specialties.map((spec, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono-tech bg-zinc-900 text-zinc-300 px-2 py-0.5 border border-zinc-800"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notable Credits & Link */}
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono-tech text-zinc-400">
                  {member.notableCredits && member.notableCredits.length > 0 ? (
                    <span className="truncate max-w-[200px]">{member.notableCredits[0]}</span>
                  ) : (
                    <span>Instructeur CUC</span>
                  )}
                  {member.externalUrl && (
                    <a
                      href={member.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-zinc-500 hover:text-[#FFE500] hover:bg-white/5 border border-zinc-800 transition-colors"
                      title="Profil / Références"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
