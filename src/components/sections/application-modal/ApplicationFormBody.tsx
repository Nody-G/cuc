'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Shield, Send } from 'lucide-react';
import { TacticalButton } from '../../ui/TacticalButton';
import { StuntBadge } from '../../ui/StuntBadge';
import { ApplicationFields } from './ApplicationFields';
import { AFDAS_VALUES, type ApplicationFormData, type ProfileType } from './application-form';
import { cucMicro } from '@/lib/preview/cuc-micro';

interface ApplicationFormBodyProps {
    profileType: ProfileType;
    setProfileType: React.Dispatch<React.SetStateAction<ProfileType>>;
    formData: ApplicationFormData;
    setFormData: React.Dispatch<React.SetStateAction<ApplicationFormData>>;
    isSubmitting: boolean;
    submitError: string | null;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
}

/** Corps de la fenêtre : en-tête, sélection de profil, formulaire complet. */
export const ApplicationFormBody: React.FC<ApplicationFormBodyProps> = ({
    profileType,
    setProfileType,
    formData,
    setFormData,
    isSubmitting,
    submitError,
    onSubmit,
    onClose,
}) => {
    const t = useTranslations('applicationModal');

    const tabs: { id: ProfileType; label: string }[] = [
        { id: 'pro', label: t('tabs.pro') },
        { id: 'discovery', label: t('tabs.discovery') },
        { id: 'weekend', label: t('tabs.weekend') },
        { id: 'afdas', label: t('tabs.afdas') },
    ];
    const afdasLabels = t.raw('afdasOptions') as string[];

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                        <StuntBadge variant="yellow">{t('badge')}</StuntBadge>
                        <span className="text-xs font-mono-tech text-zinc-500">{t('session')}</span>
                    </div>
                    <div className="relative w-10 h-10 shrink-0 hidden sm:block">
                        <Image
                            src="/images/logos/cuc-logo-yellow.png"
                            alt={t('logoAlt')}
                            width={40}
                            height={40}
                            className="object-contain drop-shadow-[0_0_8px_rgba(255,229,0,0.4)]"
                        />
                    </div>
                </div>
                <h2 id="modal-title" className="text-3xl md:text-4xl font-display uppercase tracking-wider text-white">
                    <span {...cucMicro('applicationModal.titleLead')}>{t('titleLead')}</span>
                    <span className="text-[#FFE500]" {...cucMicro('applicationModal.titleAccent')}>
                        {t('titleAccent')}
                    </span>
                </h2>
                <p className="text-sm text-zinc-400 font-tech mt-1">
                    <span {...cucMicro('applicationModal.intro')}>{t('intro')}</span>
                </p>
            </div>

            {/* Profile Selection Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setProfileType(tab.id)}
                        className={`py-2 px-3 text-xs font-display tracking-wider uppercase border transition-all cursor-pointer ${profileType === tab.id
                            ? 'bg-[#FFE500] text-black border-[#FFE500] font-bold shadow-[0_0_10px_rgba(255,229,0,0.3)]'
                            : 'bg-[#141419] text-zinc-400 border-zinc-800 hover:border-zinc-600'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-4">
                <ApplicationFields formData={formData} setFormData={setFormData} />

                {profileType === 'afdas' && (
                    <div>
                        <label className="block text-xs font-mono-tech uppercase text-[#FFE500] mb-1">
                            <span {...cucMicro('applicationModal.labels.afdasStatus')}>
                                {t('labels.afdasStatus')}
                            </span>
                        </label>
                        <select
                            value={formData.afdasStatus}
                            onChange={(e) => setFormData({ ...formData, afdasStatus: e.target.value })}
                            className="w-full bg-[#16161c] border border-[#FFE500]/50 px-3 py-2.5 text-sm text-white focus:outline-none"
                        >
                            {AFDAS_VALUES.map((value, index) => (
                                <option key={value} value={value}>
                                    {afdasLabels[index] ?? value}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-xs font-mono-tech uppercase text-zinc-400 mb-1">
                        <span {...cucMicro('applicationModal.labels.sport')}>
                            {t('labels.sport')}
                        </span>
                    </label>
                    <input
                        type="text"
                        value={formData.sportBackground}
                        onChange={(e) => setFormData({ ...formData, sportBackground: e.target.value })}
                        placeholder={t('placeholders.sport')}
                        className="w-full bg-[#16161c] border border-zinc-700 focus:border-[#FFE500] px-3 py-2.5 text-sm text-white focus:outline-none transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-xs font-mono-tech uppercase text-zinc-400 mb-1">
                        <span {...cucMicro('applicationModal.labels.session')}>
                            {t('labels.session')}
                        </span>
                    </label>
                    <textarea
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder={t('placeholders.message')}
                        className="w-full bg-[#16161c] border border-zinc-700 focus:border-[#FFE500] px-3 py-2.5 text-sm text-white focus:outline-none transition-colors"
                    />
                </div>

                <div className="bg-zinc-900/80 border border-zinc-800 p-3 flex items-start gap-3">
                    <Shield className="w-5 h-5 text-[#FFE500] shrink-0 mt-0.5" />
                    <p className="text-xs text-zinc-400">
                        <strong className="text-white">
                            <span {...cucMicro('applicationModal.safetyTitle')}>
                                {t('safetyTitle')}
                            </span>
                        </strong>{' '}
                        <span {...cucMicro('applicationModal.safetyBody')}>{t('safetyBody')}</span>
                    </p>
                </div>

                {submitError && (
                    <div className="p-3 bg-red-950/40 border border-red-500/50 text-red-300 text-xs rounded-xs">
                        {submitError}
                    </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 text-xs font-mono-tech uppercase text-zinc-400 hover:text-white"
                    >
                        <span {...cucMicro('applicationModal.cancel')}>{t('cancel')}</span>
                    </button>
                    <TacticalButton
                        type="submit"
                        variant="primary"
                        disabled={isSubmitting}
                        icon={<Send className="w-4 h-4" />}
                    >
                        {isSubmitting ? (
                            <span {...cucMicro('applicationModal.submitting')}>{t('submitting')}</span>
                        ) : (
                            <span {...cucMicro('applicationModal.submit')}>{t('submit')}</span>
                        )}
                    </TacticalButton>
                </div>
            </form>
        </div>
    );
};
