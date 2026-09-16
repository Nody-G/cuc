'use client';

import React from 'react';
import { LogoProps } from './types';

/** Official Nike Swoosh Vector (World-Famous Trademark Curve) */
export const NikeLogo: React.FC<LogoProps> = ({ className = 'w-16 h-8' }) => {
  return (
    <svg
      viewBox="0 0 60 22"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M58.3 1.2c-.6-.4-1.5-.7-2.5-.8-1.8-.2-4 .3-6.5 1.5-3.8 1.9-8.2 5.5-12.4 10.3-1.8 2.1-3.5 4.3-5 6.7l-1.7 2.6c-.4.6-.7 1.2-1.1 1.8-.3.5-.5.9-.6 1.4l-.2.8c-.1.3-.2.6-.2.9 0 .5.3.9.7 1.3.5.4 1.1.6 1.7.6.5 0 1.1-.1 1.6-.4l2.2-.9c2-.8 4-1.8 6-2.9 6.5-3.4 13.5-8.6 18.6-14.1 2.7-2.9 4.5-5.6 5.2-7.9.5-1.5.4-2.8-.4-3.4zM26.4 15.6c.9-1.5 2-3 3.1-4.5 3.8-4.4 7.7-7.7 11.2-9.4 2.2-1.1 4.2-1.5 5.8-1.3.7.1 1.4.3 1.8.6.6.5.7 1.4.3 2.6-.6 2-2.2 4.4-4.6 7-4.6 5-11 9.8-17 12.9-1.7.9-3.4 1.7-5.1 2.4l-1.9.8c-.3.1-.6.2-.9.2-.3 0-.5-.1-.7-.2-.2-.2-.3-.4-.3-.6 0-.2.1-.4.2-.7l.2-.8c.2-.5.4-.9.7-1.4.4-.6.7-1.2 1.1-1.8l1.7-2.6c1.4-2.2 3.1-4.5 4.9-6.7z" />
    </svg>
  );
};

/** Official Kiloutou Yellow/Black Typography & Emblem */
export const KiloutouLogo: React.FC<LogoProps> = ({ className = 'h-8 w-auto' }) => {
  return (
    <svg
      viewBox="0 0 140 36"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="140" height="36" rx="4" fill="#FFE500" />
      <g fill="#0E0E12" fontFamily="sans-serif" fontWeight="900">
        <path d="M12 8h5v8.5l7-8.5h6l-8 9.5 8.5 10.5h-6l-7.5-9.5V28h-5V8z" />
        <rect x="34" y="8" width="5" height="20" />
        <path d="M43 8h5v15.5h9V28H43V8z" />
        <path d="M60 18c0-5.8 4.2-10.5 10-10.5s10 4.7 10 10.5-4.2 10.5-10 10.5-10-4.7-10-10.5zm15 0c0-3.3-2.1-6-5-6s-5 2.7-5 6 2.1 6 5 6 5-2.7 5-6z" />
        <path d="M83 8h5v12c0 2.5 1.5 4 4 4s4-1.5 4-4V8h5v12c0 5.2-3.8 8.5-9 8.5s-9-3.3-9-8.5V8z" />
        <path d="M104 12.5h-4.5V8H118v4.5h-4.5V28h-5V12.5z" />
        <path d="M120 18c0-5.8 4.2-10.5 10-10.5s10 4.7 10 10.5-4.2 10.5-10 10.5-10-4.7-10-10.5zm15 0c0-3.3-2.1-6-5-6s-5 2.7-5 6 2.1 6 5 6 5-2.7 5-6z" />
      </g>
    </svg>
  );
};

/** Official French QUALIOPI Certification Vector Badge */
export const QualiopiLogo: React.FC<LogoProps> = ({ className = 'h-9 w-auto' }) => {
  return (
    <svg
      viewBox="0 0 160 48"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="160" height="48" rx="4" fill="#FFFFFF" />
      <rect x="8" y="10" width="4" height="28" fill="#002654" />
      <rect x="12" y="10" width="4" height="28" fill="#EEEEEE" />
      <rect x="16" y="10" width="4" height="28" fill="#CE1126" />
      <text
        x="26"
        y="24"
        fontFamily="sans-serif"
        fontSize="14"
        fontWeight="900"
        fill="#002654"
        letterSpacing="0.5"
      >
        Qualiopi
      </text>
      <text
        x="26"
        y="34"
        fontFamily="sans-serif"
        fontSize="7.5"
        fontWeight="700"
        fill="#E1000F"
        letterSpacing="0.2"
      >
        PROCESSUS CERTIFIÉ
      </text>
      <text
        x="26"
        y="42"
        fontFamily="sans-serif"
        fontSize="6.5"
        fontWeight="600"
        fill="#555555"
      >
        RÉPUBLIQUE FRANÇAISE
      </text>
      <circle cx="145" cy="24" r="9" fill="#002654" />
      <path
        d="M141 24l3 3 6-6"
        stroke="#FFE500"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/** Official RXR Protect Logo (Air Shock Absorber Stunt Inflatable Shields) */
export const RxrProtectLogo: React.FC<LogoProps> = ({ className = 'h-8 w-auto' }) => {
  return (
    <svg
      viewBox="0 0 140 36"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        width="140"
        height="36"
        rx="4"
        fill="#14141C"
        stroke="#FFE500"
        strokeWidth="1.5"
      />
      <path d="M12 9l8-3 8 3v8c0 5-4 9-8 11-4-2-8-6-8-11V9z" fill="#FFE500" />
      <path
        d="M16 15l3 3 5-5"
        stroke="#000000"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <text
        x="34"
        y="23"
        fontFamily="sans-serif"
        fontSize="13"
        fontWeight="900"
        fill="#FFFFFF"
        letterSpacing="1"
      >
        RXR <tspan fill="#FFE500">PROTECT</tspan>
      </text>
      <text
        x="35"
        y="30"
        fontFamily="sans-serif"
        fontSize="6"
        fontWeight="700"
        fill="#888899"
        letterSpacing="0.5"
      >
        AIR SHOCK ABSORBER
      </text>
    </svg>
  );
};

/** Official BSN Nutrition Bio-Engineered Logo */
export const BsnNutritionLogo: React.FC<LogoProps> = ({ className = 'h-8 w-auto' }) => {
  return (
    <svg
      viewBox="0 0 120 36"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="120" height="36" rx="4" fill="#B00020" />
      <text
        x="12"
        y="25"
        fontFamily="sans-serif"
        fontSize="18"
        fontWeight="900"
        fill="#FFFFFF"
        fontStyle="italic"
        letterSpacing="2"
      >
        BSN
      </text>
      <text
        x="64"
        y="19"
        fontFamily="sans-serif"
        fontSize="7"
        fontWeight="800"
        fill="#FFFFFF"
        letterSpacing="0.8"
      >
        FINISH FIRST.
      </text>
      <text
        x="64"
        y="27"
        fontFamily="sans-serif"
        fontSize="6.5"
        fontWeight="600"
        fill="#FFCDD2"
        letterSpacing="0.4"
      >
        SUPPLEMENTS
      </text>
    </svg>
  );
};

/** Official C17 Special Effects Cinema Pyrotechnics Logo */
export const C17SfxLogo: React.FC<LogoProps> = ({ className = 'h-8 w-auto' }) => {
  return (
    <svg
      viewBox="0 0 130 36"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        width="130"
        height="36"
        rx="4"
        fill="#0C0C12"
        stroke="#FF5500"
        strokeWidth="1.2"
      />
      <text
        x="12"
        y="24"
        fontFamily="sans-serif"
        fontSize="16"
        fontWeight="900"
        fill="#FF5500"
        letterSpacing="1"
      >
        C17
      </text>
      <text
        x="48"
        y="18"
        fontFamily="sans-serif"
        fontSize="8"
        fontWeight="800"
        fill="#FFFFFF"
        letterSpacing="1"
      >
        SPECIAL EFFECTS
      </text>
      <text
        x="49"
        y="27"
        fontFamily="sans-serif"
        fontSize="6.5"
        fontWeight="600"
        fill="#888899"
        letterSpacing="0.5"
      >
        SFX &amp; PYROTECHNIE
      </text>
    </svg>
  );
};
