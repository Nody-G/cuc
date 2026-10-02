import type { HomeListBlockDef } from './home-blocks.types';
import { HERO_SLIDES, buildHeroSlideSeed } from '@/lib/data/site/hero-slides';

/**
 * ==============================================================================
 * CUC — Listes fixes de la page d'accueil (`sections_data`)
 * ==============================================================================
 * Ces blocs ne contiennent **que** des tableaux d'items : les sortir de
 * `home-blocks.ts` garde ce dernier sous le plafond de 300 lignes et sépare les
 * responsabilités (champs plats vs listes).
 *
 * Contrat de structure — la vitrine fusionne les items **index par index** avec
 * un socle local de longueur constante (`mergeSectionItems`) :
 *   - `count` reprend la longueur réellement rendue (4 piliers, 6 partenaires,
 *     3 publications) ; le formulaire affiche `max(count, items.length)` ;
 *   - aucune position n'est créée ni supprimée depuis le formulaire : on édite
 *     les emplacements existants, jamais une liste vide ou inventée.
 *
 * Les sous-champs sont nommés `fieldKey` (jamais `key`) : voir la consigne dans
 * `home-blocks.types.ts` — un littéral `{ key, liveEdit: true }` serait lu par
 * l'audit comme un champ plat du bloc, donc une promesse fantôme.
 */
export const HOME_LIST_BLOCKS: HomeListBlockDef[] = [
    {
        id: 'hero',
        title: 'Accueil — Visuels du hero',
        desc: 'Les photos qui défilent en fond de bannière. Modifiez, réordonnez ou ajoutez des visuels au-delà des 4 historiques.',
        tag: 'hero',
        lists: [
            {
                arrayKey: 'slides',
                label: 'Visuels qui défilent',
                desc: 'Le bouton ouvre la médiathèque. Tant qu’aucune surcharge n’est enregistrée, les 4 visuels historiques servent de repli (aperçus grisés).',
                count: HERO_SLIDES.length,
                canEditStructure: true,
                seed: buildHeroSlideSeed(),
                fields: [
                    { fieldKey: 'url', label: 'Image', media: true },
                    { fieldKey: 'alt', label: 'Texte alternatif (visuels ajoutés)' },
                ],
            },
        ],
    },
    {
        id: 'about',
        title: 'Présentation — Piliers éditoriaux',
        desc: 'Les quatre piliers, fusionnés index par index avec les libellés traduits.',
        tag: 'about',
        lists: [
            {
                arrayKey: 'pillars',
                label: 'Piliers',
                desc: 'Titre, étiquette et description de chaque pilier.',
                count: 4,
                fields: [
                    { fieldKey: 'title', label: 'Titre du pilier' },
                    { fieldKey: 'tag', label: 'Étiquette du pilier' },
                    {
                        fieldKey: 'desc',
                        label: 'Description du pilier',
                        kind: 'textarea',
                        rows: 2,
                    },
                ],
            },
        ],
    },
    {
        id: 'partners',
        title: 'Partenaires — Cartes',
        desc: 'Nom, rôle et logo de chaque partenaire affiché.',
        tag: 'partners',
        lists: [
            {
                arrayKey: 'items',
                label: 'Partenaires',
                desc: 'Le logo ouvre la médiathèque ; le rôle saisi prime sur le libellé traduit.',
                count: 6,
                fields: [
                    { fieldKey: 'name', label: 'Nom du partenaire' },
                    { fieldKey: 'role', label: 'Rôle (libre, sinon traduit)' },
                    { fieldKey: 'logo', label: 'Logo', media: true },
                ],
            },
        ],
    },
    {
        id: 'social',
        title: 'Réseaux sociaux — Publications',
        desc: 'Copie éditoriale et visuels des publications affichées sans Reel live.',
        tag: 'social',
        lists: [
            {
                arrayKey: 'posts',
                label: 'Publications',
                desc: 'Aligne la copie de repli affichée quand aucun Reel en direct n’est disponible.',
                count: 3,
                fields: [
                    { fieldKey: 'title', label: 'Titre' },
                    { fieldKey: 'tag', label: 'Étiquette' },
                    { fieldKey: 'desc', label: 'Description', kind: 'textarea', rows: 2 },
                    { fieldKey: 'image', label: 'Visuel', media: true },
                    { fieldKey: 'link', label: 'Lien (URL)' },
                ],
            },
        ],
    },
];
