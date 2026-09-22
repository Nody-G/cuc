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
    /** Correctifs saisis en place (mêmes clés que `StageOverride`). */
    badge_text?: string;
    sub_badge?: string;
    highlight_text?: string;
    details?: string[];
    button_label?: string;
    pdf_label?: string;
    image_alt?: string;
}

/**
 * Orchestration de la grille des stages : liste CMS éventuelle, copie
 * traduite appariée par `id`, correctifs saisis en place en Mode Studio.
 */
export function useStagesGrid(customStages?: unknown[]): StagesGridController {
    const t = useTranslations('stages');
    const cardCopy = t.raw('cards') as StageCopy[];
    /**
     * Ancien bloc d'overrides du Mode Studio : lu en **repli** pour ne pas
     * perdre une saisie antérieure à l'alignement. La source canonique est
     * désormais `stages_catalogue.items` — le même bloc que le formulaire du
     * Cockpit, donc une seule vérité par champ.
     */
    const legacyOverrides = usePageSectionData<{ items?: StageOverride[] }>('stages_cards')?.items;

    // Mémoïsée : les correctifs entrent dans les dépendances du rendu localisé.
    const customList = React.useMemo(
        () => (customStages ?? []) as CustomStageInput[],
        [customStages]
    );

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
                /**
                 * Correctifs : l'item `stages_catalogue` (source unique, écrite
                 * par le formulaire comme par l'édition en place) ; l'ancien
                 * bloc `stages_cards` ne sert que de repli hérité.
                 */
                const catalogueItem = customList[index];
                const legacy = legacyOverrides?.[index];
                const over: StageOverride | undefined =
                    catalogueItem || legacy
                        ? {
                            badge_text: catalogueItem?.badge_text ?? legacy?.badge_text,
                            sub_badge: catalogueItem?.sub_badge ?? legacy?.sub_badge,
                            highlight_text:
                                catalogueItem?.highlight_text ?? legacy?.highlight_text,
                            title: catalogueItem?.title ?? legacy?.title,
                            description: catalogueItem?.description ?? legacy?.description,
                            details: catalogueItem?.details ?? legacy?.details,
                            button_label: catalogueItem?.button_label ?? legacy?.button_label,
                            pdf_label: catalogueItem?.pdf_label ?? legacy?.pdf_label,
                            image: catalogueItem?.image?.src ?? legacy?.image,
                            image_alt: catalogueItem?.image_alt ?? legacy?.image_alt,
                        }
                        : undefined;

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
        [displayList, cardCopy, customList, legacyOverrides]
    );

    return { localizedList };
}
