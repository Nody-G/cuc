'use client';

import React from 'react';

/**
 * Dispositifs de financement affichés sous le bandeau Qualiopi.
 *
 * Forme locale minimale : le composant ne dépend pas de `HomeQualiopiSection`
 * (aucune dépendance circulaire) et reste purement présentationnel.
 */
export interface QualiopiFundingData {
    afdas_badge?: string;
    afdas_text?: string;
    france_travail_badge?: string;
    france_travail_text?: string;
    opco_badge?: string;
    opco_text?: string;
}

interface HomeQualiopiFundingProps {
    data?: QualiopiFundingData;
}

const BADGE_CLASS =
    'block text-[11px] font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider';
const TEXT_CLASS = 'text-xs font-tech text-zinc-300 mt-1 leading-relaxed';
const CARD_CLASS = 'bg-black/40 border border-zinc-800 p-3';

/**
 * Rendu **data-first** strictement vide par défaut.
 *
 * Ces clés n'existent pas au catalogue traduit : aucun repli `t('…')` n'est
 * possible et il est interdit d'inventer une mention réglementaire ou un
 * financeur. Un dispositif sans badge **ni** texte n'affiche donc rien ;
 * si tout est vide, le bloc entier ne rend rien (ni carte, ni bordure).
 * Les annotations (`data-cuc-field`) sont écrites en littéral pour rester
 * mesurables par `audit:fields`.
 */
export const HomeQualiopiFunding: React.FC<HomeQualiopiFundingProps> = ({ data }) => {
    const hasAny = Boolean(
        data?.afdas_badge ||
        data?.afdas_text ||
        data?.france_travail_badge ||
        data?.france_travail_text ||
        data?.opco_badge ||
        data?.opco_text
    );
    if (!hasAny) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#FFE500]/20">
            {data?.afdas_badge || data?.afdas_text ? (
                <div className={CARD_CLASS}>
                    {data?.afdas_badge ? (
                        <span
                            data-cuc-field="sections_data.qualiopi.afdas_badge"
                            className={BADGE_CLASS}
                        >
                            {data.afdas_badge}
                        </span>
                    ) : null}
                    {data?.afdas_text ? (
                        <p data-cuc-field="sections_data.qualiopi.afdas_text" className={TEXT_CLASS}>
                            {data.afdas_text}
                        </p>
                    ) : null}
                </div>
            ) : null}

            {data?.france_travail_badge || data?.france_travail_text ? (
                <div className={CARD_CLASS}>
                    {data?.france_travail_badge ? (
                        <span
                            data-cuc-field="sections_data.qualiopi.france_travail_badge"
                            className={BADGE_CLASS}
                        >
                            {data.france_travail_badge}
                        </span>
                    ) : null}
                    {data?.france_travail_text ? (
                        <p
                            data-cuc-field="sections_data.qualiopi.france_travail_text"
                            className={TEXT_CLASS}
                        >
                            {data.france_travail_text}
                        </p>
                    ) : null}
                </div>
            ) : null}

            {data?.opco_badge || data?.opco_text ? (
                <div className={CARD_CLASS}>
                    {data?.opco_badge ? (
                        <span data-cuc-field="sections_data.qualiopi.opco_badge" className={BADGE_CLASS}>
                            {data.opco_badge}
                        </span>
                    ) : null}
                    {data?.opco_text ? (
                        <p data-cuc-field="sections_data.qualiopi.opco_text" className={TEXT_CLASS}>
                            {data.opco_text}
                        </p>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
};
