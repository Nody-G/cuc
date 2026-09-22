import { Link } from '@/i18n/navigation';
import React from 'react';
import Image from 'next/image';
import { TacticalButton } from '@/components/ui/TacticalButton';
import type { WorkshopCtaCopy } from './useWorkshopContent';

export interface WorkshopApplyBoxProps {
    cta: WorkshopCtaCopy;
    onApply: () => void;
}

/** Bottom Inscription Box — ancre `#apply` (CTA « Apply for Next Session »). */
export const WorkshopApplyBox: React.FC<WorkshopApplyBoxProps> = ({ cta, onApply }) => (
    <div id="apply" className="mt-12 bg-[#101016] border-2 border-[#FFE500] p-8 text-center relative scroll-mt-28">
        <div className="flex justify-center mb-4">
            <Image
                src="/images/logos/cuc-logo-yellow.png"
                alt="Campus Univers Cascades"
                width={56}
                height={56}
                className="w-14 h-14 object-contain drop-shadow-[0_0_15px_rgba(255,229,0,0.35)]"
            />
        </div>
        <h3
            data-cuc-field="sections_data.workshop.cta_title"
            className="text-3xl font-display uppercase text-white mb-2"
        >
            {cta.title}
        </h3>
        <p
            data-cuc-field="sections_data.workshop.cta_body"
            className="text-xs font-tech text-zinc-400 max-w-xl mx-auto mb-6"
        >
            {cta.body}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
            <TacticalButton variant="primary" size="lg" onClick={onApply}>
                <span data-cuc-field="sections_data.workshop.cta_primary">{cta.primary}</span>
            </TacticalButton>
            <Link href="/contact-cuc">
                <TacticalButton variant="secondary" size="lg">
                    <span data-cuc-field="sections_data.workshop.cta_secondary">{cta.secondary}</span>
                </TacticalButton>
            </Link>
        </div>
    </div>
);
