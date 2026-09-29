import React from 'react';
import { cucMicro } from '@/lib/preview/cuc-micro';

/**
 * Lien externe « logo seul ».
 *
 * Couche UI pure (`AGENTS.md` § 1) : une unique ancre qui ne rend QUE le logo,
 * sans texte ni encart rempli. Le nom de la destination reste accessible
 * (`aria-label`) et révélé au survol (`title`), avec une micro-animation
 * discrète (léger zoom + opacité) pour le rendu « épuré et dynamique » demandé.
 *
 * Primitive réutilisée par la fiche film, les cartes célébrités, la fiche coach
 * et le Cockpit : une seule définition, un rendu homogène partout.
 */
export interface LogoLinkProps {
    /** URL externe de la marque. */
    href: string;
    /** Nom lisible (accessibilité + tooltip) : « Fiche IMDb », « AlloCiné »… */
    label: string;
    /** Tooltip personnalisé ; par défaut, `label`. */
    title?: string;
    /** Logo à afficher (ex. `<ImdbLogo className="h-4 w-auto" />`). */
    children: React.ReactNode;
    /**
     * Clé de micro-texte (Mode Studio) marquée sur le lien, pour garder le
     * libellé éditable même lorsque seul le logo est visible.
     */
    micro?: string;
    /** Gestionnaire de clic (ex. `stopPropagation` dans une carte cliquable). */
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
    /** Classes additionnelles de l'ancre. */
    className?: string;
}

export const LogoLink: React.FC<LogoLinkProps> = ({
    href,
    label,
    title,
    children,
    micro,
    onClick,
    className,
}) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        title={title ?? label}
        onClick={onClick}
        {...cucMicro(micro)}
        className={[
            'inline-flex items-center justify-center rounded-sm opacity-75',
            'transition-[transform,opacity] duration-200 ease-out',
            'hover:opacity-100 hover:scale-110 focus-visible:opacity-100 focus-visible:scale-110',
            'focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#FFE500]',
            className,
        ]
            .filter(Boolean)
            .join(' ')}
    >
        {children}
    </a>
);
