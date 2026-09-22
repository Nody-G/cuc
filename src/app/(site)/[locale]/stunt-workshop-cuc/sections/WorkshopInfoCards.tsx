import React from 'react';
import { Award, Bed, MapPin } from 'lucide-react';
import type { WorkshopInfoCopy } from './useWorkshopContent';

export interface WorkshopInfoCardsProps {
    location: WorkshopInfoCopy;
    housing: WorkshopInfoCopy;
    certificate: WorkshopInfoCopy;
}

export const WorkshopInfoCards: React.FC<WorkshopInfoCardsProps> = ({
    location,
    housing,
    certificate,
}) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-[#121218] border border-zinc-800 p-6">
            <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-[#FFE500]" />
                <h3
                    data-cuc-field="sections_data.workshop.location_title"
                    className="font-display uppercase text-lg text-white"
                >
                    {location.title}
                </h3>
            </div>
            <p
                data-cuc-field="sections_data.workshop.location_body"
                className="text-xs font-tech text-zinc-300 leading-relaxed mb-4"
            >
                {location.body}
            </p>
            <div
                data-cuc-field="sections_data.workshop.location_note"
                className="text-[11px] font-mono-tech text-zinc-500"
            >
                {location.note}
            </div>
        </div>

        <div className="bg-[#121218] border border-zinc-800 p-6">
            <div className="flex items-center gap-2 mb-3">
                <Bed className="w-4 h-4 text-[#FFE500]" />
                <h3
                    data-cuc-field="sections_data.workshop.housing_title"
                    className="font-display uppercase text-lg text-white"
                >
                    {housing.title}
                </h3>
            </div>
            <p
                data-cuc-field="sections_data.workshop.housing_body"
                className="text-xs font-tech text-zinc-300 leading-relaxed mb-4"
            >
                {housing.body}
            </p>
            <div
                data-cuc-field="sections_data.workshop.housing_note"
                className="text-[11px] font-mono-tech text-zinc-500"
            >
                {housing.note}
            </div>
        </div>

        <div className="bg-[#121218] border border-zinc-800 p-6">
            <div className="flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-[#FFE500]" />
                <h3
                    data-cuc-field="sections_data.workshop.certificate_title"
                    className="font-display uppercase text-lg text-white"
                >
                    {certificate.title}
                </h3>
            </div>
            <p
                data-cuc-field="sections_data.workshop.certificate_body"
                className="text-xs font-tech text-zinc-300 leading-relaxed mb-4"
            >
                {certificate.body}
            </p>
            <div
                data-cuc-field="sections_data.workshop.certificate_note"
                className="text-[11px] font-mono-tech text-zinc-500"
            >
                {certificate.note}
            </div>
        </div>
    </div>
);
