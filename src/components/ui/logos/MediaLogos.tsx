'use client';

import React from 'react';
import Image from 'next/image';
import { LogoProps } from './types';

/**
 * Logos des plateformes média officielles.
 *
 * Les fichiers SVG proviennent des logos officiels publiés par chaque marque
 * (IMDb et AlloCiné) et sont servis depuis `public/images/logos/`. Aucun tracé
 * n'est dessiné « à la main ».
 */

/** IMDb — logo officiel (fichier SVG). */
export const ImdbLogo: React.FC<LogoProps> = ({ className = 'h-5 w-auto' }) => {
  return (
    <span className={`relative inline-block ${className}`} style={{ aspectRatio: '2 / 1' }}>
      <Image
        src="/images/logos/imdb.svg"
        alt="IMDb"
        fill
        className="object-contain"
        sizes="120px"
      />
    </span>
  );
};

/** AlloCiné — logo officiel (fichier SVG). */
export const AllocineLogo: React.FC<LogoProps> = ({ className = 'h-5 w-auto' }) => {
  return (
    <span className={`relative inline-block ${className}`} style={{ aspectRatio: '366.96 / 79.77' }}>
      <Image
        src="/images/logos/allocine.svg"
        alt="AlloCiné"
        fill
        className="object-contain"
        sizes="120px"
      />
    </span>
  );
};
