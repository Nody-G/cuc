'use client';

import React, { useId } from 'react';
import { LogoProps } from './types';

/**
 * Drapeaux officiels des langues de la vitrine (FR ⇄ EN).
 *
 * Pourquoi des SVG et NON des emoji drapeaux :
 * --------------------------------------------
 * Windows ne sait pas rendre les séquences d'indicateurs régionaux : il affiche
 * les lettres « FR » / « GB » au lieu du drapeau. Un tracé vectoriel garantit
 * donc le même rendu sur tous les systèmes.
 *
 * Couleurs officielles :
 *  - France : bleu #002395, blanc #FFFFFF, rouge #ED2939 ;
 *  - Royaume-Uni (Union Jack) : bleu #012169, rouge #C8102E, blanc #FFFFFF.
 *
 * Accessibilité :
 * ---------------
 * Les drapeaux sont marqués DÉCORATIFS (`aria-hidden`). Un drapeau ne « dit »
 * pas une langue (le Royaume-Uni porte l'Union Jack, l'anglais est parlé dans
 * des dizaines de pays) : c'est le contrôle porteur qui doit annoncer
 * « Français » ou « English » via son `aria-label` / son libellé.
 *
 * Proportions respectées : tricolore 3:2, Union Jack 2:1.
 */

/** France — tricolore officiel (3:2). */
export const FranceFlag: React.FC<LogoProps> = ({ className = '' }) => (
    <svg
        viewBox="0 0 3 2"
        xmlns="http://www.w3.org/2000/svg"
        className={`h-3.5 w-[21px] shrink-0 ${className}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
    >
        <rect width="3" height="2" fill="#FFFFFF" />
        <rect width="1" height="2" fill="#002395" />
        <rect x="2" width="1" height="2" fill="#ED2939" />
    </svg>
);

/** Royaume-Uni — Union Jack officiel (2:1). */
export const UnitedKingdomFlag: React.FC<LogoProps> = ({ className = '' }) => {
    // Deux sélecteurs coexistent dans le DOM (barre d'actions + en-tête mobile) :
    // les `clipPath` doivent donc porter des identifiants uniques.
    const clipId = `${useId()}-union-jack`;

    return (
        <svg
            viewBox="0 0 60 30"
            xmlns="http://www.w3.org/2000/svg"
            className={`h-3.5 w-[24px] shrink-0 ${className}`}
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
        >
            <clipPath id={clipId}>
                <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
            </clipPath>
            <rect width="60" height="30" fill="#012169" />
            <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" strokeWidth="6" />
            <path
                d="M0,0 L60,30 M60,0 L0,30"
                clipPath={`url(#${clipId})`}
                stroke="#C8102E"
                strokeWidth="4"
            />
            <path d="M30,0 v30 M0,15 h60" stroke="#FFFFFF" strokeWidth="10" />
            <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
        </svg>
    );
};

/**
 * Drapeau correspondant à une locale de routage.
 * Toute locale inconnue retombe sur le tricolore (défaut `fr`).
 */
export const LocaleFlag: React.FC<LogoProps & { locale: string }> = ({ locale, className }) =>
    locale === 'en' ? (
        <UnitedKingdomFlag className={className} />
    ) : (
        <FranceFlag className={className} />
    );
