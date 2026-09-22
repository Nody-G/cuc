'use client';

import React from 'react';
import type { Discipline, FilmCredit, Instructor } from '@/types';
import { FilmCard } from './FilmCard';

export interface FilmGridProps {
    films: FilmCredit[];
    team: Instructor[];
    disciplines: Discipline[];
    onEdit: (film: FilmCredit) => void;
    onDelete: (id: string, title: string) => void;
}

/** Grille du catalogue : résout les interconnexions (staff CUC, modules de cascade). */
export const FilmGrid: React.FC<FilmGridProps> = ({
    films,
    team,
    disciplines,
    onEdit,
    onDelete,
}) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {films.map((film) => {
            const linkedStaff = team.filter(
                (t) =>
                    film.cuc_team_involved?.includes(t.id) ||
                    film.instructor_ids?.includes(t.id) ||
                    t.film_ids?.includes(film.id)
            );
            const linkedDisc = disciplines.filter((d) => d.film_ids?.includes(film.id));

            return (
                <FilmCard
                    key={film.id}
                    film={film}
                    linkedStaff={linkedStaff}
                    linkedDisc={linkedDisc}
                    onEdit={() => onEdit(film)}
                    onDelete={() => onDelete(film.id, film.title)}
                />
            );
        })}
    </div>
);
