'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { SitePageHero } from '@/lib/data/site-service';
import { LinkField } from '../LinkField';
import { HeroMetricFields } from './HeroMetricFields';
import {
    HERO_CARD_CLASS,
    HERO_CARD_HEADER_CLASS,
    HERO_CARD_HINT_CLASS,
    HERO_CARD_TITLE_CLASS,
    HERO_CTA_BOX_CLASS,
    HERO_INPUT_CLASS,
    HERO_LABEL_CLASS,
    HERO_SUB_LABEL_CLASS,
    HERO_TAG_CLASS,
} from './hero-editor.styles';

export interface HeroBannerEditorProps {
    /** Hero courant (source française ou contenu localisé). */
    hero: SitePageHero;
    /** Fusion immuable d'un ou plusieurs champs du hero. */
    onChange: (patch: Partial<SitePageHero>) => void;
}

/**
 * Bannière d'accroche : badge, mention « depuis », titre, sous-titre, métriques
 * et les trois appels à l'action.
 *
 * Chaque contrôle porte le chemin canonique de l'aperçu (`data-cuc-field` ou
 * `field` du sélecteur de lien) : cliquer un texte de la page en mode inspection
 * fait défiler et focalise **cette** saisie. Les valeurs vides retombent sur le
 * catalogue traduit — le champ en affiche le contenu réel en `placeholder`.
 */
export const HeroBannerEditor: React.FC<HeroBannerEditorProps> = ({ hero, onChange }) => {
    const tHero = useTranslations('home.hero');

    return (
        <div className={HERO_CARD_CLASS}>
            <div className={HERO_CARD_HEADER_CLASS}>
                <div>
                    <h3 className={HERO_CARD_TITLE_CLASS}>
                        Bannière d'Accroche (Hero Principal)
                    </h3>
                    <p className={HERO_CARD_HINT_CLASS}>
                        Premier bloc vu par l'utilisateur lors de son arrivée sur la page.
                    </p>
                </div>
                <span className={HERO_TAG_CLASS}>Haut de Page</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label className={HERO_LABEL_CLASS}>Badge Surtitre (Capsule Dorée)</label>
                    <input
                        type="text"
                        value={hero.badge || ''}
                        onChange={(event) => onChange({ badge: event.target.value })}
                        placeholder={tHero('badge')}
                        className={`${HERO_INPUT_CLASS} text-[#FFE500] font-mono`}
                        data-cuc-field="hero.badge"
                    />
                </div>
                <div>
                    <label className={HERO_LABEL_CLASS}>Mention « depuis » (fin de badge)</label>
                    <input
                        type="text"
                        value={hero.since || ''}
                        onChange={(event) => onChange({ since: event.target.value })}
                        placeholder={tHero('since')}
                        className={`${HERO_INPUT_CLASS} font-mono`}
                        data-cuc-field="hero.since"
                    />
                </div>
            </div>

            <div>
                <label className={HERO_LABEL_CLASS}>Titre Principal (H1)</label>
                <input
                    type="text"
                    value={hero.title}
                    onChange={(event) => onChange({ title: event.target.value })}
                    placeholder="ex: FORMATION DE CASCADEUR PROFESSIONNEL"
                    className={`${HERO_INPUT_CLASS} uppercase font-bold`}
                    data-cuc-field="hero.title"
                />
            </div>

            <div>
                <label className={HERO_LABEL_CLASS}>
                    Sous-titre / Paragraphe d'Accroche
                </label>
                <textarea
                    rows={3}
                    value={hero.subtitle || ''}
                    onChange={(event) => onChange({ subtitle: event.target.value })}
                    placeholder="Texte introductif détaillé affiché sous le grand titre..."
                    className={HERO_INPUT_CLASS}
                    data-cuc-field="hero.subtitle"
                />
            </div>

            <div className="pt-2 border-t border-white/5 space-y-2">
                <span className={HERO_SUB_LABEL_CLASS}>
                    Cartes de métriques — une valeur, un libellé
                </span>
                <HeroMetricFields
                    metrics={hero.metrics}
                    onChange={(metrics) => onChange({ metrics })}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                <div className={HERO_CTA_BOX_CLASS}>
                    <span className={`${HERO_SUB_LABEL_CLASS} text-[#FFE500] uppercase font-bold`}>
                        Bouton d'Action Principal (CTA Jaune)
                    </span>
                    <div>
                        <label className={HERO_SUB_LABEL_CLASS}>Libellé</label>
                        <input
                            type="text"
                            value={hero.cta_primary_text || ''}
                            onChange={(event) => onChange({ cta_primary_text: event.target.value })}
                            placeholder={tHero('ctaFormation')}
                            className={HERO_INPUT_CLASS}
                            data-cuc-field="hero.cta_primary_text"
                        />
                    </div>
                    <LinkField
                        label="Lien de destination"
                        field="hero.cta_primary_link"
                        value={hero.cta_primary_link || ''}
                        onChange={(value) => onChange({ cta_primary_link: value })}
                    />
                </div>

                <div className={HERO_CTA_BOX_CLASS}>
                    <span className={`${HERO_SUB_LABEL_CLASS} text-gray-300 uppercase font-bold`}>
                        Bouton d'Action Secondaire (Contour)
                    </span>
                    <div>
                        <label className={HERO_SUB_LABEL_CLASS}>Libellé</label>
                        <input
                            type="text"
                            value={hero.cta_secondary_text || ''}
                            onChange={(event) =>
                                onChange({ cta_secondary_text: event.target.value })
                            }
                            placeholder={tHero('ctaVisit')}
                            className={HERO_INPUT_CLASS}
                            data-cuc-field="hero.cta_secondary_text"
                        />
                    </div>
                    <LinkField
                        label="Lien de destination"
                        field="hero.cta_secondary_link"
                        value={hero.cta_secondary_link || ''}
                        onChange={(value) => onChange({ cta_secondary_link: value })}
                    />
                </div>

                <div className={`${HERO_CTA_BOX_CLASS} sm:col-span-2`}>
                    <span className={`${HERO_SUB_LABEL_CLASS} text-gray-300 uppercase font-bold`}>
                        Bouton d'Action Tertiaire (Ligne)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className={HERO_SUB_LABEL_CLASS}>Libellé</label>
                            <input
                                type="text"
                                value={hero.cta_tertiary_text || ''}
                                onChange={(event) =>
                                    onChange({ cta_tertiary_text: event.target.value })
                                }
                                placeholder={tHero('ctaStuntTeam')}
                                className={HERO_INPUT_CLASS}
                                data-cuc-field="hero.cta_tertiary_text"
                            />
                        </div>
                        <LinkField
                            label="Lien de destination"
                            field="hero.cta_tertiary_link"
                            value={hero.cta_tertiary_link || ''}
                            onChange={(value) => onChange({ cta_tertiary_link: value })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
