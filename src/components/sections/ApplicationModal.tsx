'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { useApplicationForm } from './application-modal/useApplicationForm';
import { ApplicationFormBody } from './application-modal/ApplicationFormBody';
import { ApplicationSuccessView } from './application-modal/ApplicationSuccessView';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProgramId?: string;
}

/**
 * Fenêtre de candidature — façade de composition.
 *
 * L'orchestration (profil, verrou de scroll, envoi `site_inquiries`) vit dans
 * `useApplicationForm` ; les vues dans `application-modal/**` (formulaire,
 * confirmation).
 */
export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  defaultProgramId = 'pro-longue-duree',
}) => {
  const t = useTranslations('applicationModal');
  const form = useApplicationForm({ isOpen, onClose, defaultProgramId });

  if (!isOpen) return null;

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

        {!form.isSubmitted ? (
          <ApplicationFormBody
            profileType={form.profileType}
            setProfileType={form.setProfileType}
            formData={form.formData}
            setFormData={form.setFormData}
            isSubmitting={form.isSubmitting}
            submitError={form.submitError}
            onSubmit={form.handleSubmit}
            onClose={onClose}
          />
        ) : (
          <ApplicationSuccessView fullName={form.formData.fullName} onClose={onClose} />
        )}
      </div>
    </div>
  );
};
