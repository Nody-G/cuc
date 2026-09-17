'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, CheckCircle2, Shield, Phone, Mail, MapPin, Send } from 'lucide-react';
import { TacticalButton } from '../ui/TacticalButton';
import { StuntBadge } from '../ui/StuntBadge';
import { submitInquiry } from '@/app/admin/actions';

type ProfileType = 'pro' | 'discovery' | 'weekend' | 'afdas' | 'prod';

const resolveProfileType = (progId: string): ProfileType => {
  if (progId === 'weekend-immersion') return 'weekend';
  if (progId.includes('afdas')) return 'afdas';
  if (progId.includes('decouverte') || progId.includes('discovery')) return 'discovery';
  if (progId.includes('prod') || progId.includes('tournage')) return 'prod';
  return 'pro';
};

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
  const [profileType, setProfileType] = useState<ProfileType>(() => resolveProfileType(defaultProgramId));

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    sportBackground: '',
    sessionDate: '',
    afdasStatus: 'Intermittent du spectacle',
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

    const programTitles: Record<ProfileType, string> = {
      pro: 'Formation Professionnelle Longue Durée 2 ans',
      discovery: 'Stage Découverte & Sélection (12 jours)',
      weekend: 'Week-end Immersion Cascade',
      afdas: 'Stage AFDAS Artistes-Interprètes (Paris Gennevilliers)',
      prod: 'Coordination Cascade & Tournage Production',
    };

    const res = await submitInquiry({
      full_name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      program_id: defaultProgramId || profileType,
      program_title: programTitles[profileType] || profileType,
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
      setSubmitError(res.error || 'Erreur lors de la transmission du dossier.');
    }
  };

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
          aria-label="Fermer"
        >
          <X className="w-6 h-6" />
        </button>

        {!isSubmitted ? (
          <div>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <StuntBadge variant="yellow">DOSSIER D'ADMISSION & CONTACT</StuntBadge>
                  <span className="text-xs font-mono-tech text-zinc-500">CUC-REF // 2026-2027</span>
                </div>
                <div className="relative w-10 h-10 shrink-0 hidden sm:block">
                  <Image
                    src="/images/logos/cuc-logo-yellow.png"
                    alt="Logo CUC"
                    width={40}
                    height={40}
                    className="object-contain drop-shadow-[0_0_8px_rgba(255,229,0,0.4)]"
                  />
                </div>
              </div>
              <h2 id="modal-title" className="text-3xl md:text-4xl font-display uppercase tracking-wider text-white">
                Candidater au <span className="text-[#FFE500]">Campus Univers Cascades</span>
              </h2>
              <p className="text-sm text-zinc-400 font-tech mt-1">
                Remplissez les informations ci-dessous pour postuler au cursus professionnel, réserver
                un stage ou solliciter une prise en charge AFDAS.
              </p>
            </div>

            {/* Profile Selection Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
              {[
                { id: 'pro', label: 'Cursus Pro (Long)' },
                { id: 'discovery', label: 'Stage Découverte' },
                { id: 'weekend', label: 'Week-end (250€)' },
                { id: 'afdas', label: 'Prise en charge AFDAS' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setProfileType(tab.id as ProfileType)}
                  className={`py-2 px-3 text-xs font-display tracking-wider uppercase border transition-all cursor-pointer ${
                    profileType === tab.id
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
                    Nom & Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Ex: Alexandre Dubois"
                    className="w-full bg-[#16161c] border border-zinc-700 focus:border-[#FFE500] px-3 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono-tech uppercase text-zinc-400 mb-1">
                    Âge * (Dès 16 ou 18 ans)
                  </label>
                  <input
                    type="number"
                    required
                    min="15"
                    max="65"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Ex: 22"
                    className="w-full bg-[#16161c] border border-zinc-700 focus:border-[#FFE500] px-3 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono-tech uppercase text-zinc-400 mb-1">
                    Adresse Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="alexandre@exemple.com"
                    className="w-full bg-[#16161c] border border-zinc-700 focus:border-[#FFE500] px-3 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono-tech uppercase text-zinc-400 mb-1">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="06 00 00 00 00"
                    className="w-full bg-[#16161c] border border-zinc-700 focus:border-[#FFE500] px-3 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {profileType === 'afdas' && (
                <div>
                  <label className="block text-xs font-mono-tech uppercase text-[#FFE500] mb-1">
                    Statut AFDAS / Professionnel
                  </label>
                  <select
                    value={formData.afdasStatus}
                    onChange={(e) => setFormData({ ...formData, afdasStatus: e.target.value })}
                    className="w-full bg-[#16161c] border border-[#FFE500]/50 px-3 py-2.5 text-sm text-white focus:outline-none"
                  >
                    <option value="Intermittent du spectacle">Intermittent du spectacle (Comédien, danseur, artiste)</option>
                    <option value="Cascadeur pro en activité">Cascadeur professionnel en activité</option>
                    <option value="Autre ayant droit AFDAS">Autre ayant-droit AFDAS</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono-tech uppercase text-zinc-400 mb-1">
                  Parcours Sportif / Artistique & Disciplines pratiquées
                </label>
                <input
                  type="text"
                  value={formData.sportBackground}
                  onChange={(e) => setFormData({ ...formData, sportBackground: e.target.value })}
                  placeholder="Ex: Arts martiaux (5 ans), Parkour, Gymnastique, Théâtre..."
                  className="w-full bg-[#16161c] border border-zinc-700 focus:border-[#FFE500] px-3 py-2.5 text-sm text-white focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-tech uppercase text-zinc-400 mb-1">
                  Session souhaitée / Objectifs
                </label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Précisez la date de session visée ou vos questions particulières..."
                  className="w-full bg-[#16161c] border border-zinc-700 focus:border-[#FFE500] px-3 py-2.5 text-sm text-white focus:outline-none transition-colors"
                />
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 p-3 flex items-start gap-3">
                <Shield className="w-5 h-5 text-[#FFE500] shrink-0 mt-0.5" />
                <p className="text-xs text-zinc-400">
                  <strong className="text-white">Avis de sécurité & sélection :</strong> En raison de
                  l'exigence physique et des contraintes de sécurité, chaque candidature est soumise à
                  l'examen de la commission pédagogique du CUC.
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
                  Annuler
                </button>
                <TacticalButton
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  icon={<Send className="w-4 h-4" />}
                >
                  {isSubmitting ? 'Transmission...' : 'Transmettre ma Candidature'}
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
              Dossier Transmis avec Succès !
            </h3>
            <p className="text-sm text-zinc-300 max-w-md mx-auto mb-6 font-tech">
              Votre demande a bien été enregistrée pour le compte de{' '}
              <strong className="text-[#FFE500]">{formData.fullName}</strong>. Un responsable
              pédagogique du CUC vous contactera sous 24 à 48 heures pour valider votre dossier et les
              disponibilités de session.
            </p>

            <div className="bg-[#14141a] border border-zinc-800 p-4 text-left max-w-md mx-auto mb-6 space-y-2 text-xs font-mono-tech text-zinc-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FFE500]" />
                <span>Campus CUC, 59360 Le Cateau-Cambrésis (Hauts-de-France)</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#FFE500]" />
                <span>Standard pédagogique : (+33) 06 72 84 94 92</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#FFE500]" />
                <span>contact@campus-universcascades.com</span>
              </div>
            </div>

            <TacticalButton variant="primary" onClick={onClose}>
              Fermer le Dossier
            </TacticalButton>
          </div>
        )}
      </div>
    </div>
  );
};
