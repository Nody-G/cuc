'use client';

import React from 'react';
import { Clock, MapPin, Phone } from 'lucide-react';
import type { SiteSettings } from '@/lib/data/site-service';
import { SettingsSectionCard } from './SettingsSectionCard';
import type { SettingsChangeHandler } from './settings-sections';

export interface ContactSectionProps {
    settings: SiteSettings;
    onChange: SettingsChangeHandler;
}

const labelClass =
    'block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider font-mono';

/** Standard, horaires & accès : coordonnées et informations pratiques. */
export const ContactSection: React.FC<ContactSectionProps> = ({ settings, onChange }) => (
    <SettingsSectionCard
        icon={<Clock className="w-5 h-5" />}
        iconClassName="bg-emerald-500/10 text-emerald-400"
        title="Standard, Horaires & Accès"
        description="Coordonnées et informations pratiques aux candidats"
    >
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelClass}>Téléphone Standard</label>
                    <div className="relative">
                        <Phone className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            value={settings.phone || ''}
                            onChange={(e) => onChange('phone', e.target.value)}
                            placeholder="+33 (0)6 72 84 94 92"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400 font-mono text-xs"
                        />
                    </div>
                </div>
                <div>
                    <label className={labelClass}>Téléphone Urgence Régie</label>
                    <input
                        type="text"
                        value={settings.emergency_phone || ''}
                        onChange={(e) => onChange('emergency_phone', e.target.value)}
                        placeholder="+33 (0)6 72 84 94 92"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400 font-mono text-xs"
                    />
                </div>
            </div>

            <div>
                <label className={labelClass}>Horaires d'Ouverture Standard</label>
                <input
                    type="text"
                    value={settings.opening_hours || ''}
                    onChange={(e) => onChange('opening_hours', e.target.value)}
                    placeholder="Lundi au Vendredi : 8h30 - 18h00 • Samedi sur sessions"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
                />
            </div>

            <div>
                <label className={labelClass}>Adresse Postale Officielle</label>
                <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        value={settings.address || ''}
                        onChange={(e) => onChange('address', e.target.value)}
                        placeholder="Domaine CUC, 70 Rue Faidherbe, 59360 Le Cateau-Cambrésis"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
                    />
                </div>
            </div>

            <div>
                <label className={labelClass}>Accès & Transports (Gare, Navette)</label>
                <input
                    type="text"
                    value={settings.campus_access_info || ''}
                    onChange={(e) => onChange('campus_access_info', e.target.value)}
                    placeholder="Gare SNCF Le Cateau (1h40 Paris Gare du Nord direct)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1 font-mono">
                        Email Renseignements
                    </label>
                    <input
                        type="email"
                        value={settings.email_general || ''}
                        onChange={(e) => onChange('email_general', e.target.value)}
                        placeholder="contact@..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100"
                    />
                </div>
                <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1 font-mono">
                        Email Admissions
                    </label>
                    <input
                        type="email"
                        value={settings.email_admissions || ''}
                        onChange={(e) => onChange('email_admissions', e.target.value)}
                        placeholder="formations@..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100"
                    />
                </div>
                <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1 font-mono">
                        Email Événements
                    </label>
                    <input
                        type="email"
                        value={settings.email_events || ''}
                        onChange={(e) => onChange('email_events', e.target.value)}
                        placeholder="events@..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100"
                    />
                </div>
            </div>
        </div>
    </SettingsSectionCard>
);
