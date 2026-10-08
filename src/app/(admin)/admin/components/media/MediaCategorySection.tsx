'use client';

import React, { useState } from 'react';
import {
    ChevronDown,
    ChevronRight,
    Building2,
    Clapperboard,
    FileText,
    Film,
    GraduationCap,
    Handshake,
    Home,
    LayoutGrid,
    Sparkles,
    Users,
    Video,
} from 'lucide-react';
import type { MediaCategoryMeta, MediaObject } from '@/app/(admin)/admin/media-shared';
import { MediaTile } from './MediaTile';
import type { MediaUsageIndex } from '@/lib/media-library/media-usage';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    Home,
    Building2,
    GraduationCap,
    Clapperboard,
    Users,
    Sparkles,
    Film,
    Handshake,
    Video,
    FileText,
    LayoutGrid,
};

export interface MediaCategorySectionProps {
    meta: MediaCategoryMeta;
    files: MediaObject[];
    mode: 'manage' | 'pick';
    selectionSet: Set<string>;
    onToggleSelect: (file: MediaObject, event: React.MouseEvent) => void;
    onOpenDetail: (file: MediaObject) => void;
    onPick: (url: string) => void;
    usageIndex?: MediaUsageIndex | null;
    references: Record<string, string[]> | null;
    categoryOf: (file: MediaObject) => string;
}

export const MediaCategorySection: React.FC<MediaCategorySectionProps> = ({
    meta,
    files,
    mode,
    selectionSet,
    onToggleSelect,
    onOpenDetail,
    onPick,
    usageIndex,
    references,
    categoryOf,
}) => {
    const [collapsed, setCollapsed] = useState(false);

    if (files.length === 0) return null;

    const Icon = ICONS[meta.iconName] || LayoutGrid;

    return (
        <div className="border border-white/10 rounded-xl bg-[#0D0D12] overflow-hidden transition-colors hover:border-white/20">
            <button
                type="button"
                onClick={() => setCollapsed((prev) => !prev)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-left"
            >
                <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${meta.dotClass}`} />
                    <Icon className="w-4 h-4 text-gray-200" />
                    <span className="text-xs font-bold text-white tracking-wide uppercase">
                        {meta.label}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                        {files.length} {files.length > 1 ? 'médias' : 'média'}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                    <span className="text-[11px] font-mono hidden sm:inline text-gray-500">
                        {meta.description}
                    </span>
                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            </button>

            {!collapsed && (
                <div className="p-3 border-t border-white/5">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {files.map((file) => {
                            const usageCount =
                                usageIndex?.[file.path]?.count ?? references?.[file.path]?.length ?? 0;
                            return (
                                <MediaTile
                                    key={file.path}
                                    file={file}
                                    selected={selectionSet.has(file.path)}
                                    onToggle={onToggleSelect}
                                    onOpen={onOpenDetail}
                                    referenceCount={usageCount}
                                    mode={mode}
                                    onPick={onPick}
                                    category={categoryOf(file)}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
