'use client';

import React, { useState, useTransition } from 'react';
import {
  Building2, Phone, MapPin, Share2,
  Save, Check, RefreshCw, Sparkles, Layers,
  Award, AlertTriangle, MousePointerClick, Clock, ShieldCheck
} from 'lucide-react';
import { SiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/data/site-service';
import { updateSiteSettings } from '../actions';

interface SettingsViewProps {
  initialSettings?: SiteSettings;
  onNavigateToTab?: (tab: 'social' | 'footer') => void;
}

export function SettingsView({ initialSettings, onNavigateToTab }: SettingsViewProps) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings || DEFAULT_SITE_SETTINGS);
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeSection, setActiveSection] = useState<'all' | 'identity' | 'certifs' | 'cta' | 'emergency' | 'contact' | 'social'>('all');

  const handleChange = (key: keyof SiteSettings, value: any) => {
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
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
              <Sparkles className="w-3 h-3" /> Configuration Globale & Interconnexion
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white uppercase">Paramètres Généraux du Campus</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Personnalisez l'identité, les accréditations Qualiopi, les boutons d'action CTA, les alertes d'urgence et les coordonnées vitrine.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition cursor-pointer"
          >
            Valeurs par défaut
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-black bg-[#FFE500] hover:bg-yellow-400 disabled:opacity-50 transition shadow-lg shadow-yellow-500/10 cursor-pointer"
          >
            {isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Enregistrer
              </>
            )}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl text-sm border flex items-center gap-3 animate-in fade-in duration-200 ${statusMessage.type === 'success'
          ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
          : 'bg-red-950/30 border-red-500/30 text-red-300'
          }`}>
          {statusMessage.type === 'success' ? <Check className="w-5 h-5 shrink-0" /> : <Layers className="w-5 h-5 shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Filtres de sections */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-800">
        {[
          { id: 'all' as const, label: 'Tous les réglages' },
          { id: 'identity' as const, label: 'Identité & Campus' },
          { id: 'certifs' as const, label: 'Qualiopi & Financements' },
          { id: 'cta' as const, label: 'Actions Vitrine (CTA)' },
          { id: 'emergency' as const, label: 'Alerte Urgence' },
          { id: 'contact' as const, label: 'Standard & Horaires' },
          { id: 'social' as const, label: 'Réseaux Sociaux' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSection(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${activeSection === tab.id
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
        {(activeSection === 'all' || activeSection === 'identity') && (
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-zinc-800/60 pb-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-100">Identité & Infrastructure</h3>
                <p className="text-xs text-zinc-400">Nom officiel, devise et superficie du domaine</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider font-mono">
                  Nom de l'Établissement
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
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider font-mono">
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider font-mono">
                    Superficie du Campus
                  </label>
                  <input
                    type="text"
                    value={settings.campus_surface || ''}
                    onChange={(e) => handleChange('campus_surface', e.target.value)}
                    placeholder="Ex: 11 000 m²"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider font-mono">
                    Année de Fondation
                  </label>
                  <input
                    type="text"
                    value={settings.founding_year || ''}
                    onChange={(e) => handleChange('founding_year', e.target.value)}
                    placeholder="Ex: 2008"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider font-mono">
                  Fondateur & Direction Pédagogique
                </label>
                <input
                  type="text"
                  value={settings.founder_name || ''}
                  onChange={(e) => handleChange('founder_name', e.target.value)}
                  placeholder="Ex: Lucas Dollfus"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. Accréditations & Financements */}
        {(activeSection === 'all' || activeSection === 'certifs') && (
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-zinc-800/60 pb-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-100">Accréditations & Financements</h3>
                <p className="text-xs text-zinc-400">Label Qualiopi N° 21452296, AFDAS et France Travail</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider font-mono">
                  Numéro de Certificat Qualiopi
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-3 w-4 h-4 text-purple-400" />
                  <input
                    type="text"
                    value={settings.qualiopi_number || ''}
                    onChange={(e) => handleChange('qualiopi_number', e.target.value)}
                    placeholder="Ex: 21452296"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-purple-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider font-mono">
                  Lien du Certificat Officiel (PDF)
                </label>
                <input
                  type="url"
                  value={settings.qualiopi_url || ''}
                  onChange={(e) => handleChange('qualiopi_url', e.target.value)}
                  placeholder="https://.../Qualiopi.pdf"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider font-mono">
                  Mention Éligibilité AFDAS
                </label>
                <input
                  type="text"
                  value={settings.afdas_status || ''}
                  onChange={(e) => handleChange('afdas_status', e.target.value)}
                  placeholder="Prise en charge AFDAS pour artistes et techniciens"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider font-mono">
                  Mention France Travail / AIF
                </label>
                <input
                  type="text"
                  value={settings.france_travail_code || ''}
                  onChange={(e) => handleChange('france_travail_code', e.target.value)}
                  placeholder="Éligible Aide Individuelle à la Formation (AIF)"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. Boutons d'Action & Navigation Vitrine (CTA) */}
        {(activeSection === 'all' || activeSection === 'cta') && (
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-zinc-800/60 pb-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <MousePointerClick className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-100">Boutons d'Action Vitrine (CTA)</h3>
                <p className="text-xs text-zinc-400">Textes et liens des boutons principaux de conversion</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider font-mono">
                    Libellé Bouton Principal
                  </label>
                  <input
                    type="text"
                    value={settings.hero_primary_cta_text || ''}
                    onChange={(e) => handleChange('hero_primary_cta_text', e.target.value)}
                    placeholder="Ex: Contact & Projets"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider font-mono">
                    Lien Cible Principal
                  </label>
                  <input
                    type="text"
                    value={settings.hero_primary_cta_url || ''}
                    onChange={(e) => handleChange('hero_primary_cta_url', e.target.value)}
                    placeholder="Ex: /contact-cuc"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider font-mono">
                    Libellé Bouton Secondaire
                  </label>
                  <input
                    type="text"
                    value={settings.hero_secondary_cta_text || ''}
                    onChange={(e) => handleChange('hero_secondary_cta_text', e.target.value)}
                    placeholder="Ex: Visite Guidée 3D"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider font-mono">
                    Lien Cible Secondaire
                  </label>
                  <input
                    type="text"
                    value={settings.hero_secondary_cta_url || ''}
                    onChange={(e) => handleChange('hero_secondary_cta_url', e.target.value)}
                    placeholder="Ex: /visite-virtuelle"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider font-mono">
                  Teinte d'Accent Principale
                </label>
                <div className="flex items-center gap-3">
                  {[
                    { hex: '#FFE500', name: 'Gold CUC' },
                    { hex: '#F59E0B', name: 'Ambre' },
                    { hex: '#EF4444', name: 'Stunt Red' },
                    { hex: '#10B981', name: 'Émeraude' },
                    { hex: '#38BDF8', name: 'Sky Blue' },
                  ].map(c => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => handleChange('accent_color', c.hex)}
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
          </div>
        )}

        {/* 4. Bandeau d'Urgence / Alertes Globales */}
        {(activeSection === 'all' || activeSection === 'emergency') && (
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-zinc-800/60 pb-3">
              <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-zinc-100">Bandeau d'Alerte / Urgence Globale</h3>
                  <p className="text-xs text-zinc-400">Affiché tout en haut du site vitrine</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!settings.emergency_active}
                    onChange={(e) => handleChange('emergency_active', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider font-mono">
                    Badge de l'Alerte
                  </label>
                  <input
                    type="text"
                    value={settings.emergency_badge || ''}
                    onChange={(e) => handleChange('emergency_badge', e.target.value)}
                    placeholder="Ex: URGENT AUDITIONS"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-red-400 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider font-mono">
                    Style Graphique
                  </label>
                  <select
                    value={settings.emergency_style || 'gold'}
                    onChange={(e) => handleChange('emergency_style', e.target.value)}
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
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider font-mono">
                  Message d'Urgence
                </label>
                <textarea
                  rows={2}
                  value={settings.emergency_message || ''}
                  onChange={(e) => handleChange('emergency_message', e.target.value)}
                  placeholder="Ex: Dernières places disponibles pour la session d'octobre 2026..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 focus:outline-none focus:border-red-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider font-mono">
                    Texte du Lien
                  </label>
                  <input
                    type="text"
                    value={settings.emergency_link_text || ''}
                    onChange={(e) => handleChange('emergency_link_text', e.target.value)}
                    placeholder="Ex: Réserver ma place"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-red-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider font-mono">
                    URL du Lien
                  </label>
                  <input
                    type="text"
                    value={settings.emergency_link_url || ''}
                    onChange={(e) => handleChange('emergency_link_url', e.target.value)}
                    placeholder="Ex: /stages-cascades-parkour-2"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-red-400 font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Standard, Horaires & Accès */}
        {(activeSection === 'all' || activeSection === 'contact') && (
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-zinc-800/60 pb-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-100">Standard, Horaires & Accès</h3>
                <p className="text-xs text-zinc-400">Coordonnées et informations pratiques aux candidats</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider font-mono">
                    Téléphone Standard
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      value={settings.phone || ''}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="+33 (0)6 72 84 94 92"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400 font-mono text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider font-mono">
                    Téléphone Urgence Régie
                  </label>
                  <input
                    type="text"
                    value={settings.emergency_phone || ''}
                    onChange={(e) => handleChange('emergency_phone', e.target.value)}
                    placeholder="+33 (0)6 72 84 94 92"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider font-mono">
                  Horaires d'Ouverture Standard
                </label>
                <input
                  type="text"
                  value={settings.opening_hours || ''}
                  onChange={(e) => handleChange('opening_hours', e.target.value)}
                  placeholder="Lundi au Vendredi : 8h30 - 18h00 • Samedi sur sessions"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider font-mono">
                  Adresse Postale Officielle
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={settings.address || ''}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Domaine CUC, 70 Rue Faidherbe, 59360 Le Cateau-Cambrésis"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider font-mono">
                  Accès & Transports (Gare, Navette)
                </label>
                <input
                  type="text"
                  value={settings.campus_access_info || ''}
                  onChange={(e) => handleChange('campus_access_info', e.target.value)}
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
                    onChange={(e) => handleChange('email_general', e.target.value)}
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
                    onChange={(e) => handleChange('email_admissions', e.target.value)}
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
                    onChange={(e) => handleChange('email_events', e.target.value)}
                    placeholder="events@..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. Renvoi vers les éditeurs canoniques (anti-doublon) */}
        {(activeSection === 'all' || activeSection === 'social') && (
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 space-y-4 lg:col-span-2">
            <div className="flex items-center gap-3 border-b border-zinc-800/60 pb-3">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-100">Réseaux Sociaux & Pied de Page</h3>
                <p className="text-xs text-zinc-400">
                  Ces contenus disposent désormais d'un éditeur dédié, source unique de vérité.
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Les liens de réseaux sociaux sont pilotés par la table{' '}
              <code className="text-amber-400">site_social_links</code> et le pied de page par{' '}
              <code className="text-amber-400">site_footer</code>. Les modifier ici créerait une
              seconde source de vérité désynchronisée de la vitrine publique.
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onNavigateToTab?.('social')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-black bg-[#FFE500] hover:bg-yellow-400 transition cursor-pointer"
              >
                <Share2 className="w-4 h-4" /> Éditer les réseaux sociaux
              </button>
              <button
                type="button"
                onClick={() => onNavigateToTab?.('footer')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-zinc-200 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition cursor-pointer"
              >
                <Layers className="w-4 h-4" /> Éditer le pied de page
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/80">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-black bg-[#FFE500] hover:bg-yellow-400 disabled:opacity-50 transition shadow-lg shadow-yellow-500/10 cursor-pointer"
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
