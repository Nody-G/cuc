import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { DoubledCelebrity } from '@/types';
import { ImdbLogo, LogoLink } from '@/components/ui/BrandLogos';
import { resolveDoubledBy, type TeamNameRef } from '@/lib/celebrity-double';

interface CelebrityCardProps {
    actor: DoubledCelebrity;
    /** Référentiel de l'équipe CUC. */
    teamMembers?: TeamNameRef[];
    /** Ouvre la fiche détaillée du comédien. */
    onSelect: () => void;
}

/**
 * Vignette d'un comédien partenaire du CUC.
 *
 * Toute la carte ouvre la fiche au clic ; le logo IMDb offre l'accès direct.
 * Affiche le nom officiel du comédien et la miniature (avatar) du/des cascadeurs CUC l'ayant doublé.
 */
export const CelebrityCard: React.FC<CelebrityCardProps> = ({ actor, teamMembers = [], onSelect }) => {
    const t = useTranslations('teamProduction');

    const doubledBy = React.useMemo(
        () => resolveDoubledBy(actor.stuntDoubles, teamMembers),
        [actor.stuntDoubles, teamMembers]
    );

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
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-black">
                <Image
                    key={actor.photo}
                    src={hasError ? '/images/actors/actor-placeholder.svg' : actor.photo}
                    alt={t('hallOfFame.photoAlt', { name: actor.name })}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                    onError={() => setHasError(true)}
                    className="object-cover object-top brightness-90 contrast-105 group-hover:scale-105 group-hover:brightness-100 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121218] via-[#121218]/25 to-transparent" />

                {/* IMDb — lien direct, hors clic de carte : logo seul */}
                {actor.imdbUrl && (
                    <LogoLink
                        href={actor.imdbUrl}
                        label={t('hallOfFame.imdbTitle', { name: actor.name })}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-2.5 right-2.5 z-10 drop-shadow-md"
                    >
                        <ImdbLogo className="h-5 w-auto" />
                    </LogoLink>
                )}
            </div>

            {/* Contenu : nom du comédien + cascadeurs CUC avec tête en miniature */}
            <div className="p-3 flex-1 flex flex-col justify-between gap-1.5">
                <h4 className="text-sm sm:text-base font-display uppercase tracking-wide text-white group-hover:text-[#FFE500] transition-colors leading-tight line-clamp-1">
                    {actor.name}
                </h4>

                {doubledBy.allMembers.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-1.5 border-t border-zinc-800/80">
                        {doubledBy.allMembers.slice(0, 2).map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center gap-1.5 min-w-0"
                                title={`Doublé par ${member.name}`}
                            >
                                <div className="relative w-5 h-5 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700">
                                    {member.avatarUrl ? (
                                        <Image
                                            src={member.avatarUrl}
                                            alt={member.name}
                                            fill
                                            sizes="20px"
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-zinc-400">
                                            {member.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <span className="text-[10px] font-mono-tech text-zinc-400 group-hover:text-zinc-200 transition-colors truncate">
                                    {member.name}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="h-[2px] w-full bg-zinc-800 group-hover:bg-[#FFE500] transition-colors" />
        </article>
    );
};
