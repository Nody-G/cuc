'use client';

import React from 'react';
import type { SitePageContent } from '@/lib/data/site-service';
import { ReelEditorCard } from './videos-page/ReelEditorCard';
import { VideosSectionSettingsPanel } from './videos-page/VideosSectionSettingsPanel';
import { useVideosPageEditor } from './videos-page/useVideosPageEditor';

interface VideosPageEditorProps {
    formData: SitePageContent;
    setFormData: React.Dispatch<React.SetStateAction<SitePageContent>>;
    setMediaPickerTarget: (target: string) => void;
}

/**
 * Éditeur Cockpit de la page Vidéos (/videos-cascadeur) — **façade de
 * composition**.
 *
 * Permet de gérer la liste des Reels Instagram avec import automatique des
 * légendes réelles. Domaine et orchestration dans `videos-page/` :
 * `videos-reels-model.ts` (lecture de section, opérations pures),
 * `useVideosPageEditor` (brouillon, import, ordre), puis les blocs UI
 * (`VideosSectionSettingsPanel`, `ReelEditorCard`).
 */
export const VideosPageEditor: React.FC<VideosPageEditorProps> = ({
    formData,
    setFormData,
    setMediaPickerTarget,
}) => {
    const editor = useVideosPageEditor({ formData, setFormData });

    return (
        <div className="space-y-6">
            <VideosSectionSettingsPanel
                section={editor.reelsSection}
                reelCount={editor.reelsList.length}
                totalViews={editor.totalViews}
                newUrl={editor.newUrl}
                isImporting={editor.isImporting}
                importError={editor.importError}
                onSectionChange={editor.updateReelsSection}
                onUrlChange={editor.setNewUrl}
                onImport={editor.importReel}
            />

            {/* Liste des Reels enregistrés */}
            <div className="space-y-4">
                {editor.reelsList.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-[#0D0D12] border border-dashed border-white/10 text-gray-500 text-xs">
                        Aucun Reel Instagram configuré. La section sera automatiquement masquée sur la vitrine.
                    </div>
                ) : (
                    editor.reelsList.map((reel, idx) => (
                        <ReelEditorCard
                            key={reel.id || idx}
                            reel={reel}
                            index={idx}
                            isFirst={idx === 0}
                            isLast={idx === editor.reelsList.length - 1}
                            onMove={editor.handleMoveReel}
                            onRemove={editor.handleRemoveReel}
                            onFieldChange={editor.handleUpdateReelField}
                            onPickCover={(reelIndex) =>
                                setMediaPickerTarget(
                                    `sections_data.reels.items.${reelIndex}.coverImage`
                                )
                            }
                        />
                    ))
                )}
            </div>
        </div>
    );
};
