'use client';

import React from 'react';
import type { Discipline, FilmCredit, Instructor, StuntProgram } from '@/types';
import type { POI } from '@/components/ui/campus-map/campusMap.data';
import { DisciplineCard } from './DisciplineCard';

export interface DisciplineGridProps {
    disciplines: Discipline[];
    campusPOIs: POI[];
    team: Instructor[];
    films: FilmCredit[];
    programs: StuntProgram[];
    onEdit: (discipline: Discipline) => void;
    onDelete: (id: string) => void;
}

/** Grille des modules : résout les interconnexions (zone, formateurs, films, programmes). */
export const DisciplineGrid: React.FC<DisciplineGridProps> = ({
    disciplines,
    campusPOIs,
    team,
    films,
    programs,
    onEdit,
    onDelete,
}) => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {disciplines.map((d) => {
            const zone = campusPOIs.find((p) => p.id === d.campus_zone_id);
            const linkedInstructors = team.filter((m) => d.instructor_ids?.includes(m.id));
            const linkedFilms = films.filter((f) => d.film_ids?.includes(f.id));
            const linkedProgs = programs.filter((p) => d.program_ids?.includes(p.id));

            return (
                <DisciplineCard
                    key={d.id}
                    discipline={d}
                    zone={zone}
                    linkedInstructors={linkedInstructors}
                    linkedFilms={linkedFilms}
                    linkedProgs={linkedProgs}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            );
        })}
    </div>
);
