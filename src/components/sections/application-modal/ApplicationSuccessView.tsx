'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle2, Phone, Mail, MapPin } from 'lucide-react';
import { TacticalButton } from '../../ui/TacticalButton';

interface ApplicationSuccessViewProps {
    fullName: string;
    onClose: () => void;
}

/** Confirmation d'envoi : accusé de réception et coordonnées du campus. */
export const ApplicationSuccessView: React.FC<ApplicationSuccessViewProps> = ({ fullName, onClose }) => {
    const t = useTranslations('applicationModal');

    return (
        <div className="py-8 text-center">
            <div className="w-16 h-16 bg-[#FFE500]/10 border-2 border-[#FFE500] rounded-full flex items-center justify-center mx-auto mb-4 text-[#FFE500]">
                <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-3xl font-display uppercase tracking-wider text-white mb-2">
                {t('successTitle')}
            </h3>
            <p className="text-sm text-zinc-300 max-w-md mx-auto mb-6 font-tech">
                {t.rich('successBody', {
                    name: fullName,
                    strong: (chunks) => <strong className="text-[#FFE500]">{chunks}</strong>,
                })}
            </p>

            <div className="bg-[#14141a] border border-zinc-800 p-4 text-left max-w-md mx-auto mb-6 space-y-2 text-xs font-mono-tech text-zinc-400">
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#FFE500]" />
                    <span>{t('contactAddress')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#FFE500]" />
                    <span>{t('contactPhone')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#FFE500]" />
                    <span>contact@campus-universcascades.com</span>
                </div>
            </div>

            <TacticalButton variant="primary" onClick={onClose}>
                {t('closeCase')}
            </TacticalButton>
        </div>
    );
};
