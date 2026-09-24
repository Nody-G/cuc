'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
    readHeroMetricOverride,
    writeHeroMetricOverride,
    type HeroMetricValue,
} from '@/lib/data/site/hero-metrics';
import { HERO_INPUT_CLASS, HERO_SUB_LABEL_CLASS } from './hero-editor.styles';

export interface HeroMetricFieldsProps {
    /** Surcharges du brouillon (`hero.metrics`), index par index. */
    metrics?: readonly HeroMetricValue[];
    /** Remplace la liste des surcharges (copie immuable, jamais une mutation). */
    onChange: (metrics: HeroMetricValue[]) => void;
}

/**
 * Cartes de métriques du hero (« DEPUIS 2008 / SAVOIR-FAIRE CUC »…).
 *
 * Le catalogue traduit fait foi pour la **structure** et le **repli** : on
 * n'édite que les positions réellement servies par la vitrine, jamais une liste
 * inventée (mêmes règles que la fusion index par index de `ParallaxHero`). Une
 * valeur vidée retire la surcharge et laisse le texte du catalogue réapparaître.
 */
export const HeroMetricFields: React.FC<HeroMetricFieldsProps> = ({ metrics, onChange }) => {
    const tHero = useTranslations('home.hero');
    const defaults = (tHero.raw('metrics') as HeroMetricValue[] | undefined) ?? [];

    if (defaults.length === 0) return null;

    return (
        <div className="space-y-2">
            {defaults.map((fallback, index) => {
                const override = readHeroMetricOverride(metrics, index);
                return (
                    <div
                        key={index}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-black/40 rounded-lg border border-white/5"
                    >
                        <div>
                            <label className={HERO_SUB_LABEL_CLASS}>
                                Carte {index + 1} — valeur
                            </label>
                            <input
                                type="text"
                                value={override?.val ?? ''}
                                placeholder={fallback?.val ?? ''}
                                onChange={(event) =>
                                    onChange(
                                        writeHeroMetricOverride(
                                            metrics,
                                            index,
                                            'val',
                                            event.target.value
                                        )
                                    )
                                }
                                className={HERO_INPUT_CLASS}
                                data-cuc-field={`hero.metrics.${index}.val`}
                            />
                        </div>
                        <div>
                            <label className={HERO_SUB_LABEL_CLASS}>
                                Carte {index + 1} — libellé
                            </label>
                            <input
                                type="text"
                                value={override?.label ?? ''}
                                placeholder={fallback?.label ?? ''}
                                onChange={(event) =>
                                    onChange(
                                        writeHeroMetricOverride(
                                            metrics,
                                            index,
                                            'label',
                                            event.target.value
                                        )
                                    )
                                }
                                className={HERO_INPUT_CLASS}
                                data-cuc-field={`hero.metrics.${index}.label`}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
