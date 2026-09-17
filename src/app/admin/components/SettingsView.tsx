'use client';

import React, { useState, useTransition } from 'react';
import { 
  Building2, Phone, Mail, MapPin, Globe, Video,
  Share2, Save, Check, RefreshCw, Sparkles, Layers
} from 'lucide-react';
import { SiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/data/site-service';
import { updateSiteSettings } from '../actions';

interface SettingsViewProps {
  initialSettings?: SiteSettings;
}

export function SettingsView({ initialSettings }: SettingsViewProps) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings || DEFAULT_SITE_SETTINGS);
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (key: keyof SiteSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        const res = await updateSiteSettings('general', settings);
        if (res.success) {
          setStatusMessage({ type: 'success', text: 'Paramètres généraux enregistrés et appliqués en direct sur tout le site !' });
        } else {
          setStatusMessage({ type: 'error', text: res.error || 'Erreur lors de l\'enregistrement.' });
        }
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: err.message || 'Erreur inattendue.' });
      }
      setTimeout(() => setStatusMessage(null), 5000);
    });
  };

  const handleResetToDefault = () => {
    if (confirm('Voulez-vous réinitialiser le formulaire avec les valeurs standards du campus ?')) {
      setSettings(DEFAULT_SITE_SETTINGS);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-3 h-3" /> Configuration Globale
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Paramètres & Coordonnées du Site</h2>
          <p className="text-sm text-zinc-400">
            Ces informations sont injectées dynamiquement dans le footer, les pages contact, les méta-données et les mentions légales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition"
          >
            Valeurs par défaut
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 transition shadow-lg shadow-amber-500/10"
          >
            {isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Enregistrer les réglages
              </>
            )}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl text-sm border flex items-center gap-3 animate-in fade-in duration-200 ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' 
            : 'bg-red-950/30 border-red-500/30 text-red-300'
        }`}>
          {statusMessage.type === 'success' ? <Check className="w-5 h-5 shrink-0" /> : <Layers className="w-5 h-5 shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Grid sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identité & Campus */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-zinc-800/60 pb-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Identité & Infrastructure</h3>
              <p className="text-xs text-zinc-400">Nom officiel, devise et superficie</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Nom de l&apos;Établissement
              </label>
              <input
                type="text"
                value={settings.school_name || ''}
                onChange={(e) => handleChange('school_name', e.target.value)}
                placeholder="Ex: Campus Univers Cascades"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Slogan / Accroche Principale
              </label>
              <input
                type="text"
                value={settings.tagline || ''}
                onChange={(e) => handleChange('tagline', e.target.value)}
                placeholder="Ex: Le Plus Grand Centre de Formation de Cascadeurs au Monde"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Superficie Totale du Campus
              </label>
              <input
                type="text"
                value={settings.campus_surface || ''}
                onChange={(e) => handleChange('campus_surface', e.target.value)}
                placeholder="Ex: 11 000 m² (Hangar 2 500 m² couvert)"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Adresse Postale Officielle
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={settings.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Ex: Le Cateau-Cambrésis (59360), Hauts-de-France, France"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Coordonnées & Emails */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-zinc-800/60 pb-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Lignes & Contacts Directs</h3>
              <p className="text-xs text-zinc-400">Numéros et adresses emails dédiées</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Téléphone Standard
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={settings.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+33 (0)3 27 00 00 00"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Email Général & Renseignements
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  value={settings.email_general || ''}
                  onChange={(e) => handleChange('email_general', e.target.value)}
                  placeholder="contact@campus-universcascades.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Email Admissions & Stages
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  value={settings.email_admissions || ''}
                  onChange={(e) => handleChange('email_admissions', e.target.value)}
                  placeholder="formations@campus-universcascades.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Email Agence Événementielle (CUC Events)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  value={settings.email_events || ''}
                  onChange={(e) => handleChange('email_events', e.target.value)}
                  placeholder="events@campus-universcascades.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Réseaux Sociaux */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 space-y-5 lg:col-span-2">
          <div className="flex items-center gap-3 border-b border-zinc-800/60 pb-3">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Réseaux Sociaux Officiels</h3>
              <p className="text-xs text-zinc-400">Liens cliquables du header, footer et des partages</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-pink-400" /> Instagram
              </label>
              <input
                type="url"
                value={settings.instagram || ''}
                onChange={(e) => handleChange('instagram', e.target.value)}
                placeholder="https://www.instagram.com/campusuniverscascades/"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Video className="w-4 h-4 text-red-400" /> YouTube
              </label>
              <input
                type="url"
                value={settings.youtube || ''}
                onChange={(e) => handleChange('youtube', e.target.value)}
                placeholder="https://www.youtube.com/@campusuniverscascades"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-blue-400" /> LinkedIn
              </label>
              <input
                type="url"
                value={settings.linkedin || ''}
                onChange={(e) => handleChange('linkedin', e.target.value)}
                placeholder="https://www.linkedin.com/company/campus-univers-cascades/"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-indigo-400" /> Facebook
              </label>
              <input
                type="url"
                value={settings.facebook || ''}
                onChange={(e) => handleChange('facebook', e.target.value)}
                placeholder="https://www.facebook.com/campusuniverscascades/"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-purple-400" /> TikTok
              </label>
              <input
                type="url"
                value={settings.tiktok || ''}
                onChange={(e) => handleChange('tiktok', e.target.value)}
                placeholder="https://www.tiktok.com/@campusuniverscascades"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" /> Mention Copyright Pied de Page
              </label>
              <input
                type="text"
                value={settings.footer_copyright || ''}
                onChange={(e) => handleChange('footer_copyright', e.target.value)}
                placeholder="© 2008 - 2026 Campus Univers Cascades."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/80">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 transition shadow-lg shadow-amber-500/10"
        >
          {isPending ? (
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
