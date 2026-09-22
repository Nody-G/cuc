import React from 'react';

export interface ZoneCategoryFiltersProps {
    categories: string[];
    selectedCategory: string;
    totalCount: number;
    onSelectCategory: (category: string) => void;
}

export const ZoneCategoryFilters: React.FC<ZoneCategoryFiltersProps> = ({
    categories,
    selectedCategory,
    totalCount,
    onSelectCategory,
}) => (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
            onClick={() => onSelectCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${selectedCategory === 'all'
                ? 'bg-cuc-gold text-black shadow-md shadow-cuc-gold/20'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
        >
            Toutes les zones ({totalCount})
        </button>
        {categories.map((cat) => (
            <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${selectedCategory === cat
                    ? 'bg-cuc-gold text-black shadow-md shadow-cuc-gold/20'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
            >
                {cat}
            </button>
        ))}
    </div>
);
