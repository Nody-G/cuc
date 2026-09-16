'use client';

import React from 'react';
import { LogoProps } from './types';

/** Official Instagram Camera Glyph with authentic curves & optional gradient fill */
export const InstagramLogo: React.FC<LogoProps & { variant?: 'mono' | 'color' }> = ({
  className = 'w-5 h-5',
  variant = 'mono',
}) => {
  if (variant === 'color') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <linearGradient
            id="ig-grad"
            x1="2"
            y1="22"
            x2="22"
            y2="2"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FFDC80" />
            <stop offset="0.25" stopColor="#FCAF45" />
            <stop offset="0.5" stopColor="#F77737" />
            <stop offset="0.75" stopColor="#F56040" />
            <stop offset="0.9" stopColor="#FD1D1D" />
            <stop offset="1" stopColor="#833AB4" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="20" height="20" rx="5.5" fill="url(#ig-grad)" />
        <circle cx="12" cy="12" r="4.2" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="#FFFFFF" />
        <rect
          x="3.5"
          y="3.5"
          width="17"
          height="17"
          rx="4.5"
          stroke="#FFFFFF"
          strokeWidth="1.6"
          fill="none"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
};

/** Official YouTube Red Rectangle with Equilateral White Play Button */
export const YouTubeLogo: React.FC<LogoProps & { variant?: 'mono' | 'color' }> = ({
  className = 'w-5 h-5',
  variant = 'color',
}) => {
  if (variant === 'color') {
    return (
      <svg
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path
          d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
          fill="#FF0000"
        />
        <polygon points="9.545,15.568 15.818,12 9.545,8.432" fill="#FFFFFF" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
};

/** Official TikTok Music Note with Chromatic Offset */
export const TikTokLogo: React.FC<LogoProps & { variant?: 'mono' | 'color' }> = ({
  className = 'w-5 h-5',
  variant = 'color',
}) => {
  if (variant === 'color') {
    return (
      <svg
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Cyan chromatic aberration */}
        <path
          d="M12.53 4.5v10.25a3.25 3.25 0 1 1-3.25-3.25c.38 0 .74.07 1.08.19V8.9a6.25 6.25 0 1 0 5.17 6.13V8.75a6.5 6.5 0 0 0 4-1.37v-2.88a9.45 9.45 0 0 1-4-1.5z"
          fill="#25F4EE"
          transform="translate(-0.6, -0.4)"
        />
        {/* Magenta chromatic aberration */}
        <path
          d="M12.53 4.5v10.25a3.25 3.25 0 1 1-3.25-3.25c.38 0 .74.07 1.08.19V8.9a6.25 6.25 0 1 0 5.17 6.13V8.75a6.5 6.5 0 0 0 4-1.37v-2.88a9.45 9.45 0 0 1-4-1.5z"
          fill="#FE2C55"
          transform="translate(0.6, 0.4)"
        />
        {/* White core */}
        <path
          d="M12.53 4.5v10.25a3.25 3.25 0 1 1-3.25-3.25c.38 0 .74.07 1.08.19V8.9a6.25 6.25 0 1 0 5.17 6.13V8.75a6.5 6.5 0 0 0 4-1.37v-2.88a9.45 9.45 0 0 1-4-1.5z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M12.53 4.5v10.25a3.25 3.25 0 1 1-3.25-3.25c.38 0 .74.07 1.08.19V8.9a6.25 6.25 0 1 0 5.17 6.13V8.75a6.5 6.5 0 0 0 4-1.37v-2.88a9.45 9.45 0 0 1-4-1.5z" />
    </svg>
  );
};

/** Official Facebook Circular Badge with #1877F2 */
export const FacebookLogo: React.FC<LogoProps & { variant?: 'mono' | 'color' }> = ({
  className = 'w-5 h-5',
  variant = 'color',
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="12" fill={variant === 'color' ? '#1877F2' : 'currentColor'} />
      <path
        d="M15.5 12.5l.5-3.5h-3.5V6.7c0-.9.4-1.7 1.8-1.7h1.7V2s-1.5-.2-3-.2c-3.1 0-5 1.9-5 5.3V9H8v3.5h3V21h4.5v-8.5h3z"
        fill={variant === 'color' ? '#FFFFFF' : '#000000'}
      />
    </svg>
  );
};

/** Official LinkedIn Badge #0A66C2 */
export const LinkedInLogo: React.FC<LogoProps & { variant?: 'mono' | 'color' }> = ({
  className = 'w-5 h-5',
  variant = 'color',
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="24" height="24" rx="4" fill={variant === 'color' ? '#0A66C2' : 'currentColor'} />
      <path
        d="M19 19v-5.3c0-2.8-1.5-4.1-3.5-4.1-1.6 0-2.3.9-2.7 1.5V9.8H10V19h2.8v-4.9c0-1.3.3-2.6 1.9-2.6 1.6 0 1.6 1.5 1.6 2.7V19H19zM5.5 7.7a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2zM4.1 19h2.8V9.8H4.1V19z"
        fill={variant === 'color' ? '#FFFFFF' : '#000000'}
      />
    </svg>
  );
};

/** Official WhatsApp Badge #25D366 */
export const WhatsAppLogo: React.FC<LogoProps & { variant?: 'mono' | 'color' }> = ({
  className = 'w-5 h-5',
  variant = 'color',
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.79 14.07c-.24.68-1.2 1.25-1.67 1.32-.44.07-1 .11-2.9-.68-2.42-1.01-3.99-3.48-4.11-3.64-.12-.16-.99-1.32-.99-2.52 0-1.2.63-1.79.85-2.03.22-.24.48-.3.64-.3.16 0 .32.01.46.01.15 0 .35-.06.55.42.2.49.68 1.66.74 1.78.06.12.1.26.02.42-.08.16-.12.26-.24.4-.12.14-.25.31-.36.42-.12.12-.24.25-.1.5.14.25.62 1.02 1.33 1.65.91.81 1.68 1.06 1.92 1.18.24.12.38.1.52-.06.14-.16.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.58-.18 1.26z"
        fill={variant === 'color' ? '#25D366' : 'currentColor'}
      />
    </svg>
  );
};
