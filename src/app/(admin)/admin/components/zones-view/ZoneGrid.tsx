import React from 'react';
import { POI } from '@/components/ui/campus-map/campusMap.data';
import { Discipline } from '@/types';
import { ZoneCard } from './ZoneCard';

export interface ZoneGridProps {
    pois: POI[];
    disciplines: Discipline[];
    onEditPoi: (poi: POI) => void;
    onDeletePoi: (id: string) => void;
}

export const ZoneGrid: React.FC<ZoneGridProps> = ({
    pois,
    disciplines,
    onEditPoi,
    onDeletePoi,
}) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pois.map((poi) => (
            <ZoneCard
                key={poi.id}
                poi={poi}
                associatedDisciplines={disciplines.filter((d) => d.campus_zone_id === poi.id)}
                onEditPoi={onEditPoi}
                onDeletePoi={onDeletePoi}
            />
        ))}
    </div>
);
