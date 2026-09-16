'use client';

import React from 'react';
import { LogoProps } from './types';

/** Official IMDb Brand Emblem with Black Bold Type on Golden #F5C518 */
export const ImdbLogo: React.FC<LogoProps> = ({ className = 'h-5 w-auto' }) => {
  return (
    <svg
      viewBox="0 0 64 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="64" height="32" rx="4" fill="#F5C518" />
      <g fill="#000000" fontWeight="900" fontFamily="sans-serif">
        {/* I */}
        <rect x="7" y="6" width="6" height="20" rx="0.5" />
        {/* M */}
        <path d="M16 6h5.2l3 9.5L27.2 6H32v20h-5.2v-11l-2.6 8.5h-2.4L19.2 15V26H16V6z" />
        {/* D */}
        <path d="M35 6h6.5c4.5 0 7.5 3.2 7.5 10s-3 10-7.5 10H35V6zm5.5 15.5c2 0 3.2-1.8 3.2-5.5s-1.2-5.5-3.2-5.5h-1.3v11h1.3z" />
        {/* b */}
        <path d="M52 6h4.8v6.2c1.2-1.3 2.8-1.8 4.2-1.8 3.5 0 6 2.8 6 7.8 0 5-2.5 7.8-6 7.8-1.4 0-3-.5-4.2-1.8V26H52V6zm5.8 15.8c1.8 0 3-1.6 3-4.2s-1.2-4.2-3-4.2c-1.8 0-3 1.6-3 4.2s1.2 4.2 3 4.2z" />
      </g>
    </svg>
  );
};

/** Official AlloCiné Yellow/Amber Clapperboard Emblem */
export const AllocineLogo: React.FC<LogoProps> = ({ className = 'h-5 w-auto' }) => {
  return (
    <svg
      viewBox="0 0 100 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="100" height="32" rx="4" fill="#FECC00" />
      {/* Film clapper stripes */}
      <path d="M6 5h16l-4 6H2zM26 5h16l-4 6H22zM46 5h16l-4 6H42z" fill="#111111" />
      <text
        x="50"
        y="23"
        fontFamily="sans-serif"
        fontSize="14"
        fontWeight="900"
        fill="#111111"
        textAnchor="middle"
        letterSpacing="-0.5"
      >
        allociné
      </text>
    </svg>
  );
};
