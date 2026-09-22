'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { ApplicationFormData } from './application-form';

const FIELD_CLASS =
    'w-full bg-[#16161c] border border-zinc-700 focus:border-[#FFE500] px-3 py-2.5 text-sm text-white focus:outline-none transition-colors';

interface ApplicationFieldsProps {
    formData: ApplicationFormData;
    setFormData: React.Dispatch<React.SetStateAction<ApplicationFormData>>;
}

/** Champs d'identité du formulaire : nom, âge, e-mail, téléphone. */
export const ApplicationFields: React.FC<ApplicationFieldsProps> = ({ formData, setFormData }) => {
    const t = useTranslations('applicationModal');

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-mono-tech uppercase text-zinc-400 mb-1">
                        {t('labels.fullName')}
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder={t('placeholders.fullName')}
                        className={FIELD_CLASS}
                    />
                </div>
                <div>
                    <label className="block text-xs font-mono-tech uppercase text-zinc-400 mb-1">
                        {t('labels.age')}
                    </label>
                    <input
                        type="number"
                        required
                        min="15"
                        max="65"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        placeholder={t('placeholders.age')}
                        className={FIELD_CLASS}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-mono-tech uppercase text-zinc-400 mb-1">
                        {t('labels.email')}
                    </label>
                    <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={t('placeholders.email')}
                        className={FIELD_CLASS}
                    />
                </div>
                <div>
                    <label className="block text-xs font-mono-tech uppercase text-zinc-400 mb-1">
                        {t('labels.phone')}
                    </label>
                    <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder={t('placeholders.phone')}
                        className={FIELD_CLASS}
                    />
                </div>
            </div>
        </>
    );
};
