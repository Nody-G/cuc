'use client';

import React from 'react';
import { Building2 } from 'lucide-react';
import type { SiteSettings } from '@/lib/data/site-service';
import { SettingsSectionCard } from './SettingsSectionCard';
import type { SettingsChangeHandler } from './settings-sections';

export interface IdentitySectionProps {
    settings: SiteSettings;
    onChange: SettingsChangeHandler;
}

const labelClass =
    'block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider font-mono';
const inputClass =
    'w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400';

/** Identité & infrastructure : nom officiel, devise, superficie, fondation. */
export const IdentitySection: React.FC<IdentitySectionProps> = ({ settings, onChange }) => (
    <SettingsSectionCard
        icon={<Building2 className="w-5 h-5" />}
        iconClassName="bg-amber-500/10 text-amber-400"
        title="Identité & Infrastructure"
        description="Nom officiel, devise et superficie du domaine"
    >
        <div className="space-y-4">
            <div>
                <label className={labelClass}>Nom de l'Établissement</label>
                <input
                    type="text"
                    value={settings.school_name || ''}
                    onChange={(e) => onChange('school_name', e.target.value)}
                    placeholder="Ex: Campus Univers Cascades"
                    className={inputClass}
                />
            </div>

            <div>
                <label className={labelClass}>Slogan / Accroche Principale</label>
                <input
                    type="text"
                    value={settings.tagline || ''}
                    onChange={(e) => onChange('tagline', e.target.value)}
                    placeholder="Ex: Le Plus Grand Centre de Formation de Cascadeurs au Monde"
                    className={inputClass}
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelClass}>Superficie du Campus</label>
                    <input
                        type="text"
                        value={settings.campus_surface || ''}
                        onChange={(e) => onChange('campus_surface', e.target.value)}
                        placeholder="Ex: 11 000 m²"
                        className={inputClass}
                    />
                </div>
                <div>
                    <label className={labelClass}>Année de Fondation</label>
                    <input
                        type="text"
                        value={settings.founding_year || ''}
                        onChange={(e) => onChange('founding_year', e.target.value)}
                        placeholder="Ex: 2008"
                        className={inputClass}
                    />
                </div>
            </div>

            <div>
                <label className={labelClass}>Fondateur & Direction Pédagogique</label>
                <input
                    type="text"
                    value={settings.founder_name || ''}
                    onChange={(e) => onChange('founder_name', e.target.value)}
                    placeholder="Ex: Lucas Dollfus"
                    className={inputClass}
                />
            </div>
        </div>
    </SettingsSectionCard>
);
