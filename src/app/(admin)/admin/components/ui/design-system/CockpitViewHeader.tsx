import React from 'react';
import { type LucideIcon } from 'lucide-react';

export interface CockpitViewHeaderProps {
    /** Libellé mono en majuscules affiché au-dessus du titre. */
    eyebrow: string;
    /** Icône lucide affichée à gauche de l'eyebrow. */
    icon?: LucideIcon;
    /** Titre principal de la vue. */
    title: string;
    /** Description courte sous le titre. */
    description?: string;
    /** Actions alignées à droite (boutons, filtres…). */
    actions?: React.ReactNode;
}

export const CockpitViewHeader: React.FC<CockpitViewHeaderProps> = ({
    eyebrow,
    icon: Icon,
    title,
    description,
    actions,
}) => (
    <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
                {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                <span className="truncate">{eyebrow}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                {title}
            </h1>
            {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
);
