import React from 'react';
import { Search } from 'lucide-react';

export interface SidebarSearchProps {
    query: string;
    onQueryChange: (value: string) => void;
}

export const SidebarSearch: React.FC<SidebarSearchProps> = ({ query, onQueryChange }) => (
    <div className="px-3 pt-3">
        <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
            <input
                type="search"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Rechercher un menu…"
                aria-label="Rechercher un menu"
                className="w-full bg-black/50 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#FFE500] transition-colors"
            />
        </div>
    </div>
);
