'use client';

/**
 * BrandLogos Barrel Module
 * Provides unified, modular access to official brand assets:
 * - SocialLogos: Instagram, YouTube, TikTok, Facebook, LinkedIn, WhatsApp
 *   (glyphes issus de Simple Icons)
 * - MediaLogos: IMDb, AlloCiné (fichiers SVG)
 *
 * Les logos partenaires (Nike, Kiloutou, Qualiopi, RXR Protect, etc.) sont
 * désormais servis comme fichiers images réels depuis `public/images/partenaires/`
 * et ne sont plus des composants SVG.
 */

export * from './logos/types';
export * from './logos/SocialLogos';
export * from './logos/MediaLogos';
export * from './logos/FlagLogos';
