'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { CockpitSkeletonList } from './ui';
import { useSocialLinksEditor } from './social-links-view/useSocialLinksEditor';
import { SocialLinksHeader } from './social-links-view/SocialLinksHeader';
import { SocialLinkRow } from './social-links-view/SocialLinkRow';

interface SocialLinksViewProps {
    showToast: (msg: string) => void;
}

/**
 * Éditeur des réseaux sociaux officiels.
 *
 * Source unique de vérité partagée par la Navbar, le drawer mobile et le Footer.
 * Chaque réseau peut être activé/désactivé globalement et affiché sélectivement
 * dans la navbar, le footer et le menu mobile. Persistance dans `site_social_links`.
 *
 * L'orchestration vit dans `useSocialLinksEditor` ; les blocs visuels dans
 * `social-links-view/**`.
 */
export const SocialLinksView: React.FC<SocialLinksViewProps> = ({ showToast }) => {
    const editor = useSocialLinksEditor(showToast);

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <SocialLinksHeader
                isPending={editor.isPending}
                onReset={editor.handleReset}
                onSave={editor.handleSave}
            />

            {editor.isLoading ? (
                <CockpitSkeletonList rows={4} />
            ) : (
                <div className="space-y-3">
                    {editor.sorted.map((link, index) => (
                        <SocialLinkRow
                            key={link.id}
                            link={link}
                            index={index}
                            total={editor.sorted.length}
                            onMove={editor.move}
                            onUpdate={editor.update}
                            onDelete={editor.handleDelete}
                        />
                    ))}

                    <button
                        onClick={editor.addLink}
                        className="w-full py-3 border border-dashed border-white/20 hover:border-[#FFE500]/60 hover:bg-white/5 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white flex items-center justify-center gap-2 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Ajouter un réseau social
                    </button>
                </div>
            )}
        </div>
    );
};
