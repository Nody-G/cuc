'use client';

import React from 'react';
import { Eye, Globe, Sliders, Sparkles } from 'lucide-react';
import type { PageEditorTab } from './pages-options';

export interface EditorTabsBarProps {
    activeTab: PageEditorTab;
    onTabChange: (tab: PageEditorTab) => void;
    layoutCount: number;
}

/** Onglets de l'éditeur : contenu, mise en page, aperçu live, référencement. */
export const EditorTabsBar: React.FC<EditorTabsBarProps> = ({
    activeTab,
    onTabChange,
    layoutCount,
}) => (
    <div className="flex border-b border-white/10 gap-1">
        <button
            type="button"
            onClick={() => onTabChange('content')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'content'
                ? 'border-[#FFE500] text-[#FFE500] bg-white/5'
                : 'border-transparent text-gray-400 hover:text-white'
                }`}
        >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Contenu & Textes</span>
        </button>

        <button
            type="button"
            onClick={() => onTabChange('layout')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'layout'
                ? 'border-[#FFE500] text-[#FFE500] bg-white/5'
                : 'border-transparent text-gray-400 hover:text-white'
                }`}
        >
            <Sliders className="w-3.5 h-3.5" />
            <span>Mise en Page ({layoutCount})</span>
        </button>

        <button
            type="button"
            onClick={() => onTabChange('preview')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'preview'
                ? 'border-[#FFE500] text-[#FFE500] bg-white/5'
                : 'border-transparent text-gray-400 hover:text-white'
                }`}
        >
            <Eye className="w-3.5 h-3.5" />
            <span>Aperçu en Direct</span>
        </button>

        <button
            type="button"
            onClick={() => onTabChange('seo')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'seo'
                ? 'border-[#FFE500] text-[#FFE500] bg-white/5'
                : 'border-transparent text-gray-400 hover:text-white'
                }`}
        >
            <Globe className="w-3.5 h-3.5" />
            <span>Référencement (SEO)</span>
        </button>
    </div>
);
