/**
 * Contrats de la fiche film publique : champs éditables en place et liaisons
 * d'aperçu réutilisées par les sous-composants.
 */

import type { cucEntity } from '@/lib/preview/cuc-entity';
import type { FilmCredit } from '@/types';

/** Champs de `site_films` ouverts à l'édition en place. */
export type FilmField = 'title' | 'year';

/** Attributs d'aperçu (`data-cuc-entity…`) posés sur un élément. */
export type FilmAttr = (field: FilmField) => ReturnType<typeof cucEntity>;

/** Valeur affichée : overlay d'édition prioritaire, sinon la donnée d'origine. */
export type FilmValue = (field: FilmField, base: string) => string;

/** Props communes à tout bloc de la fiche. */
export interface FilmBindingProps {
    movie: FilmCredit;
    filmAttr: FilmAttr;
    filmValue: FilmValue;
}
