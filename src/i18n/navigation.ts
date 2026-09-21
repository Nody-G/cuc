import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * Wrappers de navigation locale-aware (next-intl 4).
 *
 * IMPORTANT — tout `next/link`, `useRouter`, `usePathname` de la vitrine doit
 * passer par ces exports afin de conserver le préfixe de locale (`/en/...`).
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
    createNavigation(routing);
