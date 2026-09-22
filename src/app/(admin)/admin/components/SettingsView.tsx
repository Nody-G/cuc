'use client';

import React from 'react';
import { Check, Layers, RefreshCw, Save } from 'lucide-react';
import type { SiteSettings } from '@/lib/data/site-service';
import { CertificationsSection } from './settings-view/CertificationsSection';
import { ContactSection } from './settings-view/ContactSection';
import { CtaSection } from './settings-view/CtaSection';
import { EmergencySection } from './settings-view/EmergencySection';
import { IdentitySection } from './settings-view/IdentitySection';
import { SettingsHeader } from './settings-view/SettingsHeader';
import { SocialLinksRedirectSection } from './settings-view/SocialLinksRedirectSection';
import { SETTINGS_SECTIONS } from './settings-view/settings-sections';
import { useSettingsForm } from './settings-view/useSettingsForm';

interface SettingsViewProps {
  initialSettings?: SiteSettings;
  onNavigateToTab?: (tab: 'social' | 'footer') => void;
}

/**
 * Paramètres Généraux du Campus — façade de composition (`AGENTS.md` § 1).
 *
 * État du formulaire et écriture serveur dans `useSettingsForm` ; le rendu est
 * réparti dans `settings-view/**` (une section par sujet, en-tête partagé).
 */
export function SettingsView({ initialSettings, onNavigateToTab }: SettingsViewProps) {
  const form = useSettingsForm({ initialSettings });

  return (
    <div className="space-y-8 max-w-5xl">
      <SettingsHeader
        isPending={form.isPending}
        onSave={form.handleSave}
        onReset={form.handleResetToDefault}
      />

      {form.statusMessage && (
        <div className={`p-4 rounded-xl text-sm border flex items-center gap-3 animate-in fade-in duration-200 ${form.statusMessage.type === 'success'
          ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
          : 'bg-red-950/30 border-red-500/30 text-red-300'
          }`}>
          {form.statusMessage.type === 'success' ? <Check className="w-5 h-5 shrink-0" /> : <Layers className="w-5 h-5 shrink-0" />}
          <span>{form.statusMessage.text}</span>
        </div>
      )}

      {/* Filtres de sections */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-800">
        {SETTINGS_SECTIONS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => form.setActiveSection(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${form.activeSection === tab.id
              ? 'bg-white text-black font-bold'
              : 'text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grille des réglages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Identité & Campus */}
        {(form.activeSection === 'all' || form.activeSection === 'identity') && (
          <IdentitySection settings={form.settings} onChange={form.handleChange} />
        )}

        {/* 2. Accréditations & Financements */}
        {(form.activeSection === 'all' || form.activeSection === 'certifs') && (
          <CertificationsSection settings={form.settings} onChange={form.handleChange} />
        )}

        {/* 3. Boutons d'Action & Navigation Vitrine (CTA) */}
        {(form.activeSection === 'all' || form.activeSection === 'cta') && (
          <CtaSection settings={form.settings} onChange={form.handleChange} />
        )}

        {/* 4. Bandeau d'Urgence / Alertes Globales */}
        {(form.activeSection === 'all' || form.activeSection === 'emergency') && (
          <EmergencySection settings={form.settings} onChange={form.handleChange} />
        )}

        {/* 5. Standard, Horaires & Accès */}
        {(form.activeSection === 'all' || form.activeSection === 'contact') && (
          <ContactSection settings={form.settings} onChange={form.handleChange} />
        )}

        {/* 6. Renvoi vers les éditeurs canoniques (anti-doublon) */}
        {(form.activeSection === 'all' || form.activeSection === 'social') && (
          <SocialLinksRedirectSection onNavigateToTab={onNavigateToTab} />
        )}
      </div>

      {/* Action footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/80">
        <button
          type="button"
          onClick={form.handleSave}
          disabled={form.isPending}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-black bg-[#FFE500] hover:bg-yellow-400 disabled:opacity-50 transition shadow-lg shadow-yellow-500/10 cursor-pointer"
        >
          {form.isPending ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Enregistrement...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Enregistrer tous les réglages
            </>
          )}
        </button>
      </div>
    </div>
  );
}
