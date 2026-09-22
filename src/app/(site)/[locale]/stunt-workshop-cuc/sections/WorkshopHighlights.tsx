import React from 'react';
import type { WorkshopHighlight } from './workshop-copy';

export interface WorkshopHighlightsProps {
    highlights: Required<WorkshopHighlight>[];
}

export const WorkshopHighlights: React.FC<WorkshopHighlightsProps> = ({ highlights }) => (
    <section className="py-8 bg-[#0c0c10] border-b border-zinc-800">
        <div className="page-shell">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-mono-tech text-xs">
                {highlights.map((highlight, index) => (
                    <div key={index} className="border-l-2 border-[#FFE500] pl-4">
                        <div
                            data-cuc-field={`sections_data.workshop.highlights.${index}.value`}
                            className={`text-3xl sm:text-4xl font-display ${index % 2 === 0 ? 'text-white' : 'text-[#FFE500]'
                                }`}
                        >
                            {highlight.value}
                        </div>
                        <div
                            data-cuc-field={`sections_data.workshop.highlights.${index}.label`}
                            className="text-zinc-400 uppercase"
                        >
                            {highlight.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);
