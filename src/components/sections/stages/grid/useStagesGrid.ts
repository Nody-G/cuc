'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { STAGES_LIST, type StageData } from '../stages.data';
import { usePageSectionData } from '@/lib/hooks/usePageSectionData';
import { pickCopy, type StageCopy, type StageOverride } from './stage-render';

export interface StagesGridController {
    /** Liste affichée : catalogue/localisée avec correctifs Studio appliqués. */
    localizedList: StageData[];
}

/**
 * Forme minimale d'un stage CMS `site_pages` (les champs absents retombent sur
 * le catalogue `stages.data.ts` — jamais de vide).
 */
interface CustomStageInput {
    id?: string;
    title?: string;
    description?: string;
    level?: string;
    subtitle?: string;
    price?: string;
    duration?: string;
    image?: { src?: string; alt?: string };
}

/**
 * Orchestration de la grille des stages : liste CMS éventuelle, copie
 * traduite appariée par `id`, correctifs saisis en place en Mode Studio.
 */
export function useStagesGrid(customStages?: unknown[]): StagesGridController {
    const t = useTranslations('stages');
    const cardCopy = t.raw('cards') as StageCopy[];
    /**
     * Correctifs saisis en place : `sections_data.stages_cards.items.<index>`
     * prime sur la copie traduite — qui reste le repli si rien n'est saisi.
     */
    const overrides = usePageSectionData<{ items?: StageOverride[] }>('stages_cards');
    const overrideItems = overrides?.items;

    const customList = (customStages ?? []) as CustomStageInput[];

    const displayList: StageData[] = (customList.length > 0)
        ? customList.map((cs, idx: number) => {
            const match = STAGES_LIST.find((s) => s.id === cs.id) || STAGES_LIST[idx % STAGES_LIST.length];
            return {
                ...match,
                id: cs.id || match?.id || `stage-${idx}`,
                title: cs.title || match?.title,
                description: cs.description || match?.description,
                badge: cs.level
                    ? { text: cs.level, variant: 'yellow' as const }
                    : (match?.badge || { text: t('fallbackBadge'), variant: 'yellow' as const }),
                subBadge: cs.subtitle || match?.subBadge,
                buttonLabel: cs.price
                    ? t('bookWithPrice', { price: cs.price })
                    : (match?.buttonLabel || t('fallbackCta')),
                details: cs.duration
                    ? [
                        { icon: 'clock' as const, text: cs.duration },
                        ...(match?.details?.slice(1) || [
                            { icon: 'map' as const, text: t('fallbackLocation') },
                        ]),
                    ]
                    : (match?.details || []),
                image: cs.image?.src
                    ? ({ ...cs.image, src: cs.image.src } as StageData['image'])
                    : (match?.image || {
                        src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Stage-WE-Immersion.png',
                        alt: cs.title || t('fallbackBadge'),
                    }),
            };
        })
        : STAGES_LIST;

    /**
     * Copie localisée : chaque stage est apparié par `id` avec le catalogue. Un
     * `id` absent (stage créé en base) retombe sur la donnée — jamais de vide.
     */
    const localizedList = React.useMemo(
        () =>
            displayList.map((stage, index) => {
                const copy = cardCopy.find((entry) => entry.id === stage.id);
                const over = overrideItems?.[index];

                return {
                    ...stage,
                    badge: {
                        ...stage.badge,
                        text: pickCopy(over?.badge_text ?? copy?.badgeText, stage.badge.text),
                    },
                    subBadge: stage.subBadge
                        ? pickCopy(over?.sub_badge ?? copy?.subBadge, stage.subBadge)
                        : stage.subBadge,
                    highlightText: stage.highlightText
                        ? pickCopy(over?.highlight_text ?? copy?.highlightText, stage.highlightText)
                        : stage.highlightText,
                    title: pickCopy(over?.title ?? copy?.title, stage.title),
                    description: pickCopy(over?.description ?? copy?.description, stage.description),
                    details: stage.details.map((detail, detailIndex) => ({
                        ...detail,
                        text: pickCopy(
                            over?.details?.[detailIndex] ?? copy?.details?.[detailIndex],
                            detail.text
                        ),
                    })),
                    buttonLabel: pickCopy(over?.button_label ?? copy?.buttonLabel, stage.buttonLabel),
                    pdfLink: stage.pdfLink
                        ? {
                            ...stage.pdfLink,
                            label: pickCopy(over?.pdf_label ?? copy?.pdfLabel, stage.pdfLink.label),
                        }
                        : stage.pdfLink,
                    image: {
                        ...stage.image,
                        src: pickCopy(over?.image, stage.image.src),
                        alt: pickCopy(over?.image_alt ?? copy?.imageAlt, stage.image.alt),
                    },
                };
            }),
        [displayList, cardCopy, overrideItems]
    );

    return { localizedList };
}
