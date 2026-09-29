'use client';

import React, { useMemo } from 'react';
import { publishedActorNames } from '@/lib/celebrity-match';
import { useCelebritySheet } from './celebrity-sheet/celebrity-sheet-context';

interface CoachDoubledActorsProps {
    /** Comédiens déclarés par le coach (`doubled_actors`, overlay EN compris). */
    actorNames: readonly string[];
    /** Typographie héritée de l'emplacement (carte coach ou fiche détaillée). */
    textClassName?: string;
}

/**
 * Comédiens doublés par un coach — sens inverse de la vitrine.
 *
 * Chaque nom dont la fiche existe devient un bouton qui ouvre la fiche comédien
 * (la même modale que la galerie de la page Tournage) ; les autres restent du
 * texte (rôles, prénoms seuls, entrées hors catalogue) : aucun lien n'est
 * inventé. Le catalogue est fourni par `CelebritySheetProvider`, monté une seule
 * fois par page.
 *
 * Composant de présentation pur : aucune requête réseau ici.
 */
export const CoachDoubledActors: React.FC<CoachDoubledActorsProps> = ({
    actorNames,
    textClassName,
}) => {
    const { resolve, openByName } = useCelebritySheet();
    // Les entrées qui ne sont pas des comédiens (personnages, rôles, identités
    // non établies) sont écartées : voir `NON_ACTOR_DOUBLED_ENTRIES`.
    const names = useMemo(() => publishedActorNames(actorNames), [actorNames]);

    return (
        <div className={textClassName}>
            {names.map((name, position) => {
                const celebrity = resolve(name);
                return (
                    <React.Fragment key={name}>
                        {position > 0 && ' • '}
                        {celebrity ? (
                            <button
                                type="button"
                                onClick={() => openByName(name)}
                                title={`Voir la fiche de ${celebrity.name}`}
                                className="underline decoration-dotted underline-offset-2 hover:text-[#FFE500] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#FFE500] transition-colors cursor-pointer"
                            >
                                {name}
                            </button>
                        ) : (
                            <span>{name}</span>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};
