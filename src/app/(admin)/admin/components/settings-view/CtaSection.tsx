'use client';

import React from 'react';
import { MousePointerClick } from 'lucide-react';
import type { SiteSettings } from '@/lib/data/site-service';
import { SettingsSectionCard } from './SettingsSectionCard';
import { ACCENT_COLORS, type SettingsChangeHandler } from './settings-sections';

export interface CtaSectionProps {
    settings: SiteSettings;
    onChange: SettingsChangeHandler;
}

const labelClass =
    'block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider font-mono';

/** Boutons d'action vitrine : libellés, liens cibles et teinte d'accent. */
export const CtaSection: React.FC<CtaSectionProps> = ({ settings, onChange }) => (
    <SettingsSectionCard
        icon={<MousePointerClick className="w-5 h-5" />}
        iconClassName="bg-emerald-500/10 text-emerald-400"
        title="Boutons d'Action Vitrine (CTA)"
        description="Textes et liens des boutons principaux de conversion"
    >
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label className={labelClass}>Libellé Bouton Principal</label>
                    <input
                        type="text"
                        value={settings.hero_primary_cta_text || ''}
                        onChange={(e) => onChange('hero_primary_cta_text', e.target.value)}
                        placeholder="Ex: Contact & Projets"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
                    />
                </div>
                <div>
                    <label className={labelClass}>Lien Cible Principal</label>
                    <input
                        type="text"
                        value={settings.hero_primary_cta_url || ''}
                        onChange={(e) => onChange('hero_primary_cta_url', e.target.value)}
                        placeholder="Ex: /contact-cuc"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400 font-mono text-xs"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label className={labelClass}>Libellé Bouton Secondaire</label>
                    <input
                        type="text"
                        value={settings.hero_secondary_cta_text || ''}
                        onChange={(e) => onChange('hero_secondary_cta_text', e.target.value)}
                        placeholder="Ex: Visite Guidée 3D"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
                    />
                </div>
                <div>
                    <label className={labelClass}>Lien Cible Secondaire</label>
                    <input
                        type="text"
                        value={settings.hero_secondary_cta_url || ''}
                        onChange={(e) => onChange('hero_secondary_cta_url', e.target.value)}
                        placeholder="Ex: /visite-virtuelle"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400 font-mono text-xs"
                    />
                </div>
            </div>

            <div>
                <label className={labelClass}>Teinte d'Accent Principale</label>
                <div className="flex items-center gap-3">
                    {ACCENT_COLORS.map((c) => (
                        <button
                            key={c.hex}
                            type="button"
                            onClick={() => onChange('accent_color', c.hex)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono cursor-pointer transition ${settings.accent_color === c.hex
                                ? 'border-white bg-white/10 text-white font-bold'
                                : 'border-white/10 text-zinc-400 hover:text-white'
                                }`}
                        >
                            <span className="w-3 h-3 rounded-full border border-black/50" style={{ backgroundColor: c.hex }} />
                            <span>{c.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    </SettingsSectionCard>
);
