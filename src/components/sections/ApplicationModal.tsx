'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { X, CheckCircle2, Shield, Phone, Mail, MapPin, Send } from 'lucide-react';
import { TacticalButton } from '../ui/TacticalButton';
import { StuntBadge } from '../ui/StuntBadge';
import { submitInquiry } from '@/app/(admin)/admin/actions';

type ProfileType = 'pro' | 'discovery' | 'weekend' | 'afdas' | 'prod';

const resolveProfileType = (progId: string): ProfileType => {
  if (progId === 'weekend-immersion') return 'weekend';
  if (progId.includes('afdas')) return 'afdas';
  if (progId.includes('decouverte') || progId.includes('discovery')) return 'discovery';
  if (progId.includes('prod') || progId.includes('tournage')) return 'prod';
  return 'pro';
};

/**
 * Titres de programmes ENVOYÉS EN BASE (`site_inquiries.program_title`).
 * Ce sont des références de cockpit (français = langue de travail interne), pas
 * de la copie d'interface : la fenêtre n'affiche que des libellés du catalogue.
 */
const PROGRAM_TITLES: Record<ProfileType, string> = {
  pro: 'Formation Professionnelle Longue Durée 2 ans',
  discovery: 'Stage Découverte & Sélection (12 jours)',
  weekend: 'Week-end Immersion Cascade',
  afdas: 'Stage AFDAS Artistes-Interprètes (Paris Gennevilliers)',
  prod: 'Coordination Cascade & Tournage Production',
};

/** Valeurs AFDAS envoyées en base (références) — l'affichage vient du catalogue. */
const AFDAS_VALUES = ['Intermittent du spectacle', 'Cascadeur pro en activité', 'Autre ayant droit AFDAS'];

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProgramId?: string;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  defaultProgramId = 'pro-longue-duree',
}) => {
  const t = useTranslations('applicationModal');
  const [profileType, setProfileType] = useState<ProfileType>(() => resolveProfileType(defaultProgramId));

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    sportBackground: '',
    sessionDate: '',
    afdasStatus: AFDAS_VALUES[0],
    message: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Synchronize profileType when defaultProgramId changes
  const [prevDefaultProgramId, setPrevDefaultProgramId] = useState(defaultProgramId);
  if (prevDefaultProgramId !== defaultProgramId) {
    setPrevDefaultProgramId(defaultProgramId);
    setProfileType(resolveProfileType(defaultProgramId));
  }

  // UX & Accessibility: Close on Escape key and lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const res = await submitInquiry({
      full_name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      program_id: defaultProgramId || profileType,
      program_title: PROGRAM_TITLES[profileType] || profileType,
      age: formData.age,
      sport_background: formData.sportBackground,
      session_date: formData.sessionDate,
      afdas_status: formData.afdasStatus,
      message: formData.message,
    });

    setIsSubmitting(false);
    if (res.success) {
      setIsSubmitted(true);
    } else {
      setSubmitError(res.error || t('submitError'));
    }
  };

  const tabs: { id: ProfileType; label: string }[] = [
    { id: 'pro', label: t('tabs.pro') },
    { id: 'discovery', label: t('tabs.discovery') },
    { id: 'weekend', label: t('tabs.weekend') },
    { id: 'afdas', label: t('tabs.afdas') },
  ];
  const afdasLabels = t.raw('afdasOptions') as string[];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-2xl bg-[#0e0e12] border-2 border-[#FFE500]/60 p-6 md:p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] my-8">
        {/* Tactical Crosshair Corners */}

        {/* Top Warning Bar */}
        <div className="h-1.5 w-full hazard-stripes mb-6" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-[#FFE500] hover:bg-white/5 transition-colors cursor-pointer"
          aria-label={t('closeAria')}
        >
          <X className="w-6 h-6" />
        </button>

        {!isSubmitted ? (
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
                {t('titleLead')}
                <span className="text-[#FFE500]">{t('titleAccent')}</span>
              </h2>
              <p className="text-sm text-zinc-400 font-tech mt-1">
                {t('intro')}
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
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    className="w-full bg-[#16161c] border border-zinc-700 focus:border-[#FFE500] px-3 py-2.5 text-sm text-white focus:outline-none transition-colors"
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
                    className="w-full bg-[#16161c] border border-zinc-700 focus:border-[#FFE500] px-3 py-2.5 text-sm text-white focus:outline-none transition-colors"
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
                    className="w-full bg-[#16161c] border border-zinc-700 focus:border-[#FFE500] px-3 py-2.5 text-sm text-white focus:outline-none transition-colors"
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
                    className="w-full bg-[#16161c] border border-zinc-700 focus:border-[#FFE500] px-3 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {profileType === 'afdas' && (
                <div>
                  <label className="block text-xs font-mono-tech uppercase text-[#FFE500] mb-1">
                    {t('labels.afdasStatus')}
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
                  {t('labels.sport')}
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
                  {t('labels.session')}
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
                  <strong className="text-white">{t('safetyTitle')}</strong> {t('safetyBody')}
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
                  {t('cancel')}
                </button>
                <TacticalButton
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  icon={<Send className="w-4 h-4" />}
                >
                  {isSubmitting ? t('submitting') : t('submit')}
                </TacticalButton>
              </div>
            </form>
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-[#FFE500]/10 border-2 border-[#FFE500] rounded-full flex items-center justify-center mx-auto mb-4 text-[#FFE500]">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-3xl font-display uppercase tracking-wider text-white mb-2">
              {t('successTitle')}
            </h3>
            <p className="text-sm text-zinc-300 max-w-md mx-auto mb-6 font-tech">
              {t.rich('successBody', {
                name: formData.fullName,
                strong: (chunks) => <strong className="text-[#FFE500]">{chunks}</strong>,
              })}
            </p>

            <div className="bg-[#14141a] border border-zinc-800 p-4 text-left max-w-md mx-auto mb-6 space-y-2 text-xs font-mono-tech text-zinc-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FFE500]" />
                <span>{t('contactAddress')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#FFE500]" />
                <span>{t('contactPhone')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#FFE500]" />
                <span>contact@campus-universcascades.com</span>
              </div>
            </div>

            <TacticalButton variant="primary" onClick={onClose}>
              {t('closeCase')}
            </TacticalButton>
          </div>
        )}
      </div>
    </div>
  );
};
