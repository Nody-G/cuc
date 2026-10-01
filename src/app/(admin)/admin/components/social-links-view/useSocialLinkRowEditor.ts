'use client';

/**
 * ==============================================================================
 * CUC — Orchestration bilingue d'UNE ligne de réseau social (overlay `social_link`)
 * ==============================================================================
 * Un réseau est une entité à part entière : son anglais vit dans sa propre ligne
 * `site_translations` (`entity = social_link`, `entity_id = link.id`). Pour ce
 * type de liste, l'édition EN est donc **par ligne** — un seul overlay par réseau
 * — tandis que le français reste enregistré en lot (`upsertSocialLink`).
 *
 * Le codec `SOCIAL_CODEC` verrouille la surface traduisible à `label` et
 * `display_hint` : `handle`, `url`, `brand_color`, `platform` et l'ensemble des
 * bascules ne peuvent, par construction, jamais entrer dans l'overlay.
 */

import { useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { SiteSocialLink } from '@/data/navigation';
import type { EditorLocaleOption } from '../ui/LocaleToggle';
import { SOCIAL_CODEC } from '../entity-translation/entity-codec';
import { useEntityEditorLocale } from '../entity-translation/useEntityEditorLocale';
import type {
    EntityEditorLocale,
    TranslationRow,
} from '../entity-translation/entity-translation.contract';

export interface UseSocialLinkRowEditorArgs {
    /** Réseau source français (propriété de la liste, enregistrée en lot). */
    link: SiteSocialLink;
    /** Écriture de la liste française (fusion partielle par identifiant). */
    onUpdate: (id: string, updates: Partial<SiteSocialLink>) => void;
}

export interface SocialLinkRowEditor {
    /** Réseau affiché : français en FR, contenu localisé en EN. */
    active: SiteSocialLink;
    /** Écriture du réseau affiché (mêmes champs, locale courante). */
    setActive: Dispatch<SetStateAction<SiteSocialLink>>;
    isEnglish: boolean;
    locale: EditorLocaleOption;
    /** Bascule de langue avec garde-fou sur un brouillon anglais non enregistré. */
    changeLocale: (next: EditorLocaleOption) => void;
    /** État bilingue complet, consommé par la barre de la ligne. */
    editor: EntityEditorLocale<SiteSocialLink>;
}

export function useSocialLinkRowEditor({
    link,
    onUpdate,
}: UseSocialLinkRowEditorArgs): SocialLinkRowEditor {
    /**
     * Point d'écriture de la source française : le brouillon résolu est recopié
     * dans la liste par identifiant (§ fusion partielle du parent).
     */
    const setSourceLink = useCallback<Dispatch<SetStateAction<SiteSocialLink>>>(
        (value) => {
            const next =
                typeof value === 'function'
                    ? (value as (prev: SiteSocialLink) => SiteSocialLink)(link)
                    : value;
            onUpdate(link.id, next);
        },
        [link, onUpdate]
    );

    const editor = useEntityEditorLocale<SiteSocialLink, TranslationRow>({
        codec: SOCIAL_CODEC,
        entityId: link.id,
        draft: link,
        setDraft: setSourceLink,
    });

    /**
     * Bascule de langue. En français, réaligner la base avant d'ouvrir l'anglais
     * évite de servir du français comme traduction ; quitter l'anglais avec une
     * saisie non enregistrée demande confirmation.
     */
    const changeLocale = useCallback(
        (next: EditorLocaleOption) => {
            if (next === editor.locale) return;
            if (
                editor.isEnglish &&
                editor.dirty &&
                !window.confirm(
                    'Des modifications anglaises ne sont pas enregistrées. Changer de langue les abandonnera.\n\nContinuer sans enregistrer ?'
                )
            ) {
                return;
            }
            if (next === 'en') editor.revertTranslation();
            editor.setLocale(next);
        },
        [editor]
    );

    return {
        active: editor.active,
        setActive: editor.setActive,
        isEnglish: editor.isEnglish,
        locale: editor.locale,
        changeLocale,
        editor,
    };
}
