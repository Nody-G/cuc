'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { SiteSettings } from '@/lib/data/site-service';
import { SettingsSectionCard } from './SettingsSectionCard';
import type { SettingsChangeHandler } from './settings-sections';

export interface EmergencySectionProps {
    settings: SiteSettings;
    onChange: SettingsChangeHandler;
}

const labelClass =
    'block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider font-mono';

/** Bandeau d'alerte / urgence globale affiché en haut de la vitrine. */
export const EmergencySection: React.FC<EmergencySectionProps> = ({ settings, onChange }) => (
    <SettingsSectionCard
        icon={<AlertTriangle className="w-5 h-5" />}
        iconClassName="bg-red-500/10 text-red-400"
        title="Bandeau d'Alerte / Urgence Globale"
        description="Affiché tout en haut du site vitrine"
        headerExtra={
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    checked={!!settings.emergency_active}
                    onChange={(e) => onChange('emergency_active', e.target.checked)}
                    className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
            </label>
        }
    >
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelClass}>Badge de l'Alerte</label>
                    <input
                        type="text"
                        value={settings.emergency_badge || ''}
                        onChange={(e) => onChange('emergency_badge', e.target.value)}
                        placeholder="Ex: URGENT AUDITIONS"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-red-400 font-mono text-xs"
                    />
                </div>
                <div>
                    <label className={labelClass}>Style Graphique</label>
                    <select
                        value={settings.emergency_style || 'gold'}
                        onChange={(e) => onChange('emergency_style', e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-red-400 cursor-pointer"
                    >
                        <option value="gold">🟡 Gold Prestige</option>
                        <option value="alert">🔴 Alerte Rouge</option>
                        <option value="info">🔵 Information Bleue</option>
                        <option value="dark">⚫ Sombre</option>
                    </select>
                </div>
            </div>

            <div>
                <label className={labelClass}>Message d'Urgence</label>
                <textarea
                    rows={2}
                    value={settings.emergency_message || ''}
                    onChange={(e) => onChange('emergency_message', e.target.value)}
                    placeholder="Ex: Dernières places disponibles pour la session d'octobre 2026..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 focus:outline-none focus:border-red-400"
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelClass}>Texte du Lien</label>
                    <input
                        type="text"
                        value={settings.emergency_link_text || ''}
                        onChange={(e) => onChange('emergency_link_text', e.target.value)}
                        placeholder="Ex: Réserver ma place"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-red-400"
                    />
                </div>
                <div>
                    <label className={labelClass}>URL du Lien</label>
                    <input
                        type="text"
                        value={settings.emergency_link_url || ''}
                        onChange={(e) => onChange('emergency_link_url', e.target.value)}
                        placeholder="Ex: /stages-cascades-parkour-2"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-red-400 font-mono text-xs"
                    />
                </div>
            </div>
        </div>
    </SettingsSectionCard>
);
