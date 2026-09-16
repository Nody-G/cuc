'use client';

import React from 'react';
import { LogoProps } from './types';

/** Official Action Cascade Team Logo */
export const ActionCascadeLogo: React.FC<LogoProps> = ({ className = 'h-8 w-auto' }) => {
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
        fill="#121218"
        stroke="#00E5FF"
        strokeWidth="1.2"
      />
      <text
        x="10"
        y="23"
        fontFamily="sans-serif"
        fontSize="12"
        fontWeight="900"
        fill="#FFFFFF"
        letterSpacing="1"
      >
        ACTION <tspan fill="#00E5FF">CASCADE</tspan>
      </text>
      <text
        x="11"
        y="30"
        fontFamily="sans-serif"
        fontSize="6"
        fontWeight="700"
        fill="#778899"
        letterSpacing="0.6"
      >
        STUNT &amp; RIGGING SERVICES
      </text>
    </svg>
  );
};

/** Official MFR Le Cateau-Cambrésis Emblem */
export const MfrLogo: React.FC<LogoProps> = ({ className = 'h-8 w-auto' }) => {
  return (
    <svg
      viewBox="0 0 140 36"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="140" height="36" rx="4" fill="#0F2D1F" stroke="#25D366" strokeWidth="1" />
      <circle cx="18" cy="18" r="9" fill="#25D366" />
      <text
        x="18"
        y="22"
        fontFamily="sans-serif"
        fontSize="9"
        fontWeight="900"
        fill="#0F2D1F"
        textAnchor="middle"
      >
        MFR
      </text>
      <text
        x="34"
        y="19"
        fontFamily="sans-serif"
        fontSize="9"
        fontWeight="900"
        fill="#FFFFFF"
        letterSpacing="0.5"
      >
        MFR LE CATEAU
      </text>
      <text
        x="35"
        y="28"
        fontFamily="sans-serif"
        fontSize="6.5"
        fontWeight="600"
        fill="#A7F3D0"
        letterSpacing="0.2"
      >
        CAMPUS &amp; HÉBERGEMENT 6 HA
      </text>
    </svg>
  );
};

/** Official Gravity Parkour & Movement Wear Logo */
export const GravityLogo: React.FC<LogoProps> = ({ className = 'h-8 w-auto' }) => {
  return (
    <svg
      viewBox="0 0 120 36"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="120" height="36" rx="4" fill="#141419" stroke="#FFE500" strokeWidth="1" />
      <text
        x="12"
        y="24"
        fontFamily="sans-serif"
        fontSize="14"
        fontWeight="900"
        fill="#FFFFFF"
        letterSpacing="2"
      >
        GRAVITY
      </text>
      <text
        x="80"
        y="18"
        fontFamily="sans-serif"
        fontSize="7"
        fontWeight="800"
        fill="#FFE500"
        letterSpacing="1"
      >
        PARKOUR
      </text>
      <text
        x="80"
        y="26"
        fontFamily="sans-serif"
        fontSize="6"
        fontWeight="600"
        fill="#777788"
      >
        GEAR
      </text>
    </svg>
  );
};

/** Official OTM Incendie Fire Stunt Logo */
export const OtmIncendieLogo: React.FC<LogoProps> = ({ className = 'h-8 w-auto' }) => {
  return (
    <svg
      viewBox="0 0 130 36"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="130" height="36" rx="4" fill="#200A0A" stroke="#EF4444" strokeWidth="1" />
      <path
        d="M16 8c2 4-1 6 2 10 2-3 4-4 4-7 3 4 5 7 2 12-2 3-5 5-8 5s-7-3-7-8c0-5 4-8 7-12z"
        fill="#EF4444"
      />
      <text
        x="32"
        y="22"
        fontFamily="sans-serif"
        fontSize="12"
        fontWeight="900"
        fill="#FFFFFF"
        letterSpacing="1"
      >
        OTM <tspan fill="#EF4444">INCENDIE</tspan>
      </text>
      <text
        x="33"
        y="29"
        fontFamily="sans-serif"
        fontSize="6.5"
        fontWeight="600"
        fill="#FCA5A5"
      >
        SÉCURITÉ FEU &amp; TORCHES
      </text>
    </svg>
  );
};

/** Official Xtrem Video Action Sports Network Logo */
export const XtremVideoLogo: React.FC<LogoProps> = ({ className = 'h-8 w-auto' }) => {
  return (
    <svg
      viewBox="0 0 130 36"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="130" height="36" rx="4" fill="#0A101C" stroke="#3B82F6" strokeWidth="1" />
      <text
        x="12"
        y="23"
        fontFamily="sans-serif"
        fontSize="13"
        fontWeight="900"
        fill="#FFFFFF"
        fontStyle="italic"
      >
        XTREM<tspan fill="#3B82F6">VIDEO</tspan>
      </text>
      <text
        x="13"
        y="30"
        fontFamily="sans-serif"
        fontSize="6.5"
        fontWeight="700"
        fill="#93C5FD"
      >
        ACTION MEDIA NETWORK
      </text>
    </svg>
  );
};

/** Official AYA Catch Pro Wrestling Academy Logo */
export const AyaCatchLogo: React.FC<LogoProps> = ({ className = 'h-8 w-auto' }) => {
  return (
    <svg
      viewBox="0 0 120 36"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="120" height="36" rx="4" fill="#181408" stroke="#FFE500" strokeWidth="1" />
      <text
        x="12"
        y="24"
        fontFamily="sans-serif"
        fontSize="14"
        fontWeight="900"
        fill="#FFE500"
        letterSpacing="1.5"
      >
        AYA <tspan fill="#FFFFFF">CATCH</tspan>
      </text>
      <text
        x="13"
        y="30"
        fontFamily="sans-serif"
        fontSize="6"
        fontWeight="600"
        fill="#A1A1AA"
      >
        PROJECTIONS THÉÂTRALES
      </text>
    </svg>
  );
};

/** Official Cascade Demo Team (CDT) Logo */
export const CascadeDemoTeamLogo: React.FC<LogoProps> = ({ className = 'h-8 w-auto' }) => {
  return (
    <svg
      viewBox="0 0 140 36"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="140" height="36" rx="4" fill="#141419" stroke="#E5E7EB" strokeWidth="1" />
      <text
        x="10"
        y="22"
        fontFamily="sans-serif"
        fontSize="11"
        fontWeight="900"
        fill="#FFFFFF"
        letterSpacing="1"
      >
        CASCADE <tspan fill="#FFE500">DEMO TEAM</tspan>
      </text>
      <text
        x="11"
        y="29"
        fontFamily="sans-serif"
        fontSize="6.5"
        fontWeight="700"
        fill="#9CA3AF"
      >
        XMA &amp; COMBATS CHORÉGRAPHIÉS
      </text>
    </svg>
  );
};

/** Official TaffCoeur Visual & Media Studio Logo */
export const TaffCoeurLogo: React.FC<LogoProps> = ({ className = 'h-8 w-auto' }) => {
  return (
    <svg
      viewBox="0 0 140 36"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="140" height="36" rx="4" fill="#181822" stroke="#E11D48" strokeWidth="1" />
      <path
        d="M17 12c-2.5-3-6.5-1-6.5 2.5 0 4.5 6.5 9.5 6.5 9.5s6.5-5 6.5-9.5c0-3.5-4-5.5-6.5-2.5z"
        fill="#E11D48"
      />
      <text
        x="28"
        y="22"
        fontFamily="sans-serif"
        fontSize="12"
        fontWeight="900"
        fill="#FFFFFF"
        letterSpacing="0.8"
      >
        TAFF<tspan fill="#E11D48">COEUR</tspan>
      </text>
      <text
        x="29"
        y="29"
        fontFamily="sans-serif"
        fontSize="6"
        fontWeight="600"
        fill="#FDA4AF"
        letterSpacing="0.5"
      >
        PRODUCTION &amp; CRÉATION
      </text>
    </svg>
  );
};

