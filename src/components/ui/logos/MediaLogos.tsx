'use client';

import React from 'react';
import Image from 'next/image';
import { LogoProps } from './types';

/**
 * Logos des plateformes média.
 *
 * Les fichiers SVG proviennent des logos publiés par chaque marque
 * (IMDb et AlloCiné) et sont servis depuis `public/images/logos/`. Aucun tracé
 * n'est dessiné « à la main ».
 *
 * Les dimensions intrinsèques correspondent au `viewBox` réel des SVG
 * (IMDb `300×150`, AlloCiné `366.96×79.77`) : le ratio est donc exact et
 * `h-*` + `w-auto` suffisent à un rendu net, sans déformation.
 */

/** IMDb — logo (fichier SVG, ratio 2:1). */
export const ImdbLogo: React.FC<LogoProps> = ({ className = 'h-5 w-auto' }) => (
  <Image
    src="/images/logos/imdb.svg"
    alt="IMDb"
    width={300}
    height={150}
    className={`object-contain ${className}`}
  />
);

/** AlloCiné — logo (fichier SVG). */
export const AllocineLogo: React.FC<LogoProps> = ({ className = 'h-5 w-auto' }) => (
  <Image
    src="/images/logos/allocine.svg"
    alt="AlloCiné"
    width={367}
    height={80}
    className={`object-contain ${className}`}
  />
);
