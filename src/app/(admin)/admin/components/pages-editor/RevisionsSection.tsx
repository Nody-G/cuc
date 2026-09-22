'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import type { SitePageContent } from '@/lib/data/site-service';
import type { EditorLocaleOption } from '@/app/(admin)/admin/components/ui/LocaleToggle';
import { PageRevisionsPanel } from '../PageRevisionsPanel';

export interface RevisionsSectionProps {
    editorLocale: EditorLocaleOption;
    slug: string;
    currentPage: SitePageContent;
    showToast: (msg: string) => void;
    onRestored: (restored: SitePageContent) => void;
    /** Horodatage du dernier enregistrement de la traduction EN. */
    translationUpdatedAt: string | null;
}

/**
 * Historique des versions (`site_page_revisions` — contenu français). En
 * anglais, on l'annonce sans le proposer : la traduction n'a qu'un état courant.
 */
export const RevisionsSection: React.FC<RevisionsSectionProps> = ({
    editorLocale,
    slug,
    currentPage,
    showToast,
    onRestored,
    translationUpdatedAt,
}) =>
    editorLocale === 'fr' ? (
        <PageRevisionsPanel
            slug={slug}
            currentContent={currentPage}
            showToast={showToast}
            onRestored={onRestored}
        />
    ) : (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-gray-400">
            <Globe className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
            <span>
                L'historique des versions porte sur le contenu français. La traduction anglaise n'a
                qu'un état courant
                {translationUpdatedAt
                    ? ` — dernière modification le ${new Date(translationUpdatedAt).toLocaleString('fr-FR')}.`
                    : ' — aucune traduction enregistrée pour cette page.'}
            </span>
        </div>
    );
