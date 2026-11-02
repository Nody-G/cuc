import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { DoubledCelebrity } from '@/types';
import { ImdbLogo, LogoLink } from '@/components/ui/BrandLogos';
import type { TeamNameRef } from '@/lib/celebrity-double';

interface CelebrityCardProps {
    actor: DoubledCelebrity;
    /** Référentiel de l'équipe CUC (conservé pour rétro-compatibilité). */
    teamMembers?: TeamNameRef[];
    /** Ouvre la fiche détaillée du comédien. */
    onSelect: () => void;
}

/**
 * Vignette d'un comédien partenaire du CUC.
 *
 * Toute la carte ouvre la fiche au clic ; le logo IMDb offre l'accès direct.
 * Affiche la photo officielle du comédien, son nom et ses films de collaboration avec le CUC.
 */
export const CelebrityCard: React.FC<CelebrityCardProps> = ({ actor, onSelect }) => {
    const t = useTranslations('teamProduction');

    const openFromKeyboard = (event: React.KeyboardEvent) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        onSelect();
    };

    const [hasError, setHasError] = React.useState(false);

    return (
        <article
            role="button"
            tabIndex={0}
            aria-label={actor.name}
            onClick={onSelect}
            onKeyDown={openFromKeyboard}
            className="group bg-[#121218] border border-zinc-800 hover:border-[#FFE500] focus-visible:border-[#FFE500] transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative hover:shadow-[0_12px_35px_rgba(255,229,0,0.18)] luxury-metric-card"
        >
            {/* Portrait — ratio 3/4 harmonisé avec la grille 6 colonnes */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-black isolate">
                <Image
                    key={actor.photo}
                    src={hasError ? '/images/actors/actor-placeholder.svg' : actor.photo}
                    alt={t('hallOfFame.photoAlt', { name: actor.name })}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                    onError={() => setHasError(true)}
                    className="object-cover object-top brightness-90 contrast-105 group-hover:scale-105 group-hover:brightness-100 transition-all duration-500"
                />
                <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-[#121218] via-[#121218]/30 to-transparent" />

                {/* IMDb — lien direct, hors clic de carte : logo seul */}
                {actor.imdbUrl && (
                    <LogoLink
                        href={actor.imdbUrl}
                        label={t('hallOfFame.imdbTitle', { name: actor.name })}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-2.5 right-2.5 z-20 drop-shadow-md"
                    >
                        <ImdbLogo className="h-5 w-auto" />
                    </LogoLink>
                )}
            </div>

            {/* Contenu : nom du comédien + films collaborés (-mt-px et z-10 pour masquer tout artefact au survol) */}
            <div className="-mt-px relative z-10 bg-[#121218] p-3 flex-1 flex flex-col justify-between gap-1.5">
                <h4 className="text-sm sm:text-base font-display uppercase tracking-wide text-white group-hover:text-[#FFE500] transition-colors leading-tight line-clamp-1">
                    {actor.name}
                </h4>

                {actor.productions && actor.productions.length > 0 && (
                    <p className="text-[11px] font-mono-tech text-zinc-400 group-hover:text-zinc-300 transition-colors truncate">
                        {actor.productions.join(' • ')}
                    </p>
                )}
            </div>

            <div className="h-[2px] w-full bg-zinc-800 group-hover:bg-[#FFE500] transition-colors" />
        </article>
    );
};
