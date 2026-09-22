'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { CommandItem } from './command-definitions';

export interface CommandRowProps {
    command: CommandItem;
    isSelected: boolean;
    onRun: () => void;
    onHover: () => void;
}

/** Rangée de commande : icône, libellé, catégorie, badge et chevron. */
export const CommandRow: React.FC<CommandRowProps> = ({
    command,
    isSelected,
    onRun,
    onHover,
}) => {
    const Icon = command.icon;
    return (
        <button
            type="button"
            data-active={isSelected ? 'true' : 'false'}
            onClick={onRun}
            onMouseEnter={onHover}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs transition-colors cursor-pointer ${isSelected ? 'bg-[#FFE500] text-black font-semibold' : 'text-gray-300 hover:bg-white/5'
                }`}
        >
            <div className="flex items-center gap-3 min-w-0">
                <div
                    className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-black text-[#FFE500]' : 'bg-white/5 text-gray-400'
                        }`}
                >
                    <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                    <div className="truncate">{command.label}</div>
                    <div
                        className={`text-[10px] font-mono ${isSelected ? 'text-black/70' : 'text-gray-500'
                            }`}
                    >
                        {command.category}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-3">
                {command.badge && (
                    <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono uppercase font-bold ${isSelected ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-400'
                            }`}
                    >
                        {command.badge}
                    </span>
                )}
                <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : 'text-gray-600'}`} />
            </div>
        </button>
    );
};
