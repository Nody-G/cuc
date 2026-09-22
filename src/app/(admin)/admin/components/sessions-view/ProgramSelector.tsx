import React from 'react';
import type { StuntProgram } from '@/types';

export interface ProgramSelectorProps {
    programs: StuntProgram[];
    currentProgramId: string | undefined;
    onSelectProgram: (id: string) => void;
}

export const ProgramSelector: React.FC<ProgramSelectorProps> = ({
    programs,
    currentProgramId,
    onSelectProgram,
}) => (
    <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {programs.map((p) => (
            <button
                key={p.id}
                onClick={() => onSelectProgram(p.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${currentProgramId === p.id
                        ? 'bg-[#FFE500] text-black shadow-md shadow-yellow-500/20'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
            >
                {p.title}
            </button>
        ))}
    </div>
);
