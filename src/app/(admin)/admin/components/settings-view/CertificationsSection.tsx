'use client';

import React from 'react';
import { Award, ShieldCheck } from 'lucide-react';
import type { SiteSettings } from '@/lib/data/site-service';
import { SettingsSectionCard } from './SettingsSectionCard';
import type { SettingsChangeHandler } from './settings-sections';

export interface CertificationsSectionProps {
    settings: SiteSettings;
    onChange: SettingsChangeHandler;
}

const labelClass =
    'block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider font-mono';

/** Accréditations & financements : Qualiopi, AFDAS, France Travail. */
export const CertificationsSection: React.FC<CertificationsSectionProps> = ({
    settings,
    onChange,
}) => (
    <SettingsSectionCard
        icon={<Award className="w-5 h-5" />}
        iconClassName="bg-purple-500/10 text-purple-400"
        title="Accréditations & Financements"
        description="Label Qualiopi N° 21452296, AFDAS et France Travail"
    >
        <div className="space-y-4">
            <div>
                <label className={labelClass}>Numéro de Certificat Qualiopi</label>
                <div className="relative">
                    <ShieldCheck className="absolute left-3.5 top-3 w-4 h-4 text-purple-400" />
                    <input
                        type="text"
                        value={settings.qualiopi_number || ''}
                        onChange={(e) => onChange('qualiopi_number', e.target.value)}
                        placeholder="Ex: 21452296"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-purple-400 font-mono"
                    />
                </div>
            </div>

            <div>
                <label className={labelClass}>Lien du Certificat Officiel (PDF)</label>
                <input
                    type="url"
                    value={settings.qualiopi_url || ''}
                    onChange={(e) => onChange('qualiopi_url', e.target.value)}
                    placeholder="https://.../Qualiopi.pdf"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-purple-400"
                />
            </div>

            <div>
                <label className={labelClass}>Mention Éligibilité AFDAS</label>
                <input
                    type="text"
                    value={settings.afdas_status || ''}
                    onChange={(e) => onChange('afdas_status', e.target.value)}
                    placeholder="Prise en charge AFDAS pour artistes et techniciens"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-purple-400"
                />
            </div>

            <div>
                <label className={labelClass}>Mention France Travail / AIF</label>
                <input
                    type="text"
                    value={settings.france_travail_code || ''}
                    onChange={(e) => onChange('france_travail_code', e.target.value)}
                    placeholder="Éligible Aide Individuelle à la Formation (AIF)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-purple-400"
                />
            </div>
        </div>
    </SettingsSectionCard>
);
