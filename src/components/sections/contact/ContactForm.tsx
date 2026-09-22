'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Send, CheckCircle2 } from 'lucide-react';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { submitInquiry } from '@/app/(admin)/admin/actions';
import { cucMicro } from '@/lib/preview/cuc-micro';

/** Identifiants valides du sélecteur « Votre Demande Concerne ». */
const VALID_PROGRAMS = [
  'pro-longue-duree',
  'stage-decouverte',
  'weekend-immersion',
  'afdas-artistes-interpretes',
  'stunt-summer-camp',
  'workshop-international',
  'tournage-production',
  'cuc-events',
  'autre',
] as const;

/**
 * Lit le paramètre d'URL `?demande=<id>` pour préremplir le sélecteur
 * « Votre Demande Concerne » depuis un call-to-action contextuel.
 */
const resolveInitialProgram = (): string => {
  if (typeof window === 'undefined') return 'pro-longue-duree';
  const requested = new URLSearchParams(window.location.search).get('demande');
  if (requested && (VALID_PROGRAMS as readonly string[]).includes(requested)) {
    return requested;
  }
  return 'pro-longue-duree';
};

export const ContactForm: React.FC = () => {
  const t = useTranslations('contact.form');

  // Préremplissage depuis le paramètre d'URL `?demande=...` : résolu une seule
  // fois via l'initialiseur paresseux (côté client), sans effet ni rendu en
  // cascade. Le rendu serveur retombe sur la valeur par défaut.
  const [formData, setFormData] = useState(() => ({
    name: '',
    email: '',
    phone: '',
    program: resolveInitialProgram(),
    sportExperience: '',
    message: '',
  }));

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    // Libellé de la demande : une seule source (catalogue), donc la même
    // formulation à l'affichage et dans la fiche reçue par le Cockpit.
    const programTitle = t(`options.${formData.program}`);

    const res = await submitInquiry({
      full_name: formData.name,
      email: formData.email,
      phone: formData.phone,
      program_id: formData.program,
      program_title: programTitle,
      sport_background: formData.sportExperience,
      message: formData.message,
    });

    setIsSubmitting(false);
    if (res.success) {
      setSubmitted(true);
    } else {
      setErrorMessage(res.error || t('errorFallback'));
    }
  };

  return (
    <div className="lg:col-span-7 bg-[#0e0e14] border-2 border-zinc-800 p-6 sm:p-8 relative">

      <h2 className="text-2xl sm:text-3xl font-display uppercase text-white mb-2">
        {t('title')}
      </h2>
      <p className="text-xs font-tech text-zinc-400 mb-6">
        {t('intro')}
      </p>

      {submitted ? (
        <div className="p-8 bg-[#121218] border border-emerald-500/50 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-display uppercase text-white">
            {t('successTitle')}
          </h3>
          <p className="text-xs font-tech text-zinc-300 max-w-md mx-auto">
            {t('successText')}
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-4 py-2 bg-zinc-800 text-xs font-mono-tech uppercase text-zinc-300 hover:text-white cursor-pointer"
          >
            {t('sendAnother')}
          </button>
        </div>
      ) : (
        <form id="formulaire" onSubmit={handleSubmit} className="space-y-4 text-xs font-tech scroll-mt-28">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="contact-name"
                className="block font-mono-tech uppercase text-zinc-300 mb-1 cursor-pointer"
              >
                {t('labelName')}
              </label>
              <input
                id="contact-name"
                type="text"
                required
                autoComplete="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={t('placeholderName')}
                className="w-full bg-[#14141c] border border-zinc-800 p-3 text-white focus:border-[#FFE500] focus:outline-hidden"
              />
            </div>

            <div>
              <label
                htmlFor="contact-phone"
                className="block font-mono-tech uppercase text-zinc-300 mb-1 cursor-pointer"
              >
                {t('labelPhone')}
              </label>
              <input
                id="contact-phone"
                type="tel"
                required
                autoComplete="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder={t('placeholderPhone')}
                className="w-full bg-[#14141c] border border-zinc-800 p-3 text-white focus:border-[#FFE500] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="contact-email"
              className="block font-mono-tech uppercase text-zinc-300 mb-1 cursor-pointer"
            >
              {t('labelEmail')}
            </label>
            <input
              id="contact-email"
              type="email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder={t('placeholderEmail')}
              className="w-full bg-[#14141c] border border-zinc-800 p-3 text-white focus:border-[#FFE500] focus:outline-hidden"
            />
          </div>

          <div>
            <label
              htmlFor="contact-program"
              className="block font-mono-tech uppercase text-zinc-300 mb-1 cursor-pointer"
            >
              {t('labelProgram')}
            </label>
            <select
              id="contact-program"
              value={formData.program}
              onChange={(e) =>
                setFormData({ ...formData, program: e.target.value })
              }
              className="w-full bg-[#14141c] border border-zinc-800 p-3 text-white focus:border-[#FFE500] focus:outline-hidden"
            >
              {VALID_PROGRAMS.map((programId) => (
                <option key={programId} value={programId}>
                  {t(`options.${programId}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="contact-sportExperience"
              className="block font-mono-tech uppercase text-zinc-300 mb-1 cursor-pointer"
            >
              {t('labelExperience')}
            </label>
            <input
              id="contact-sportExperience"
              type="text"
              value={formData.sportExperience}
              onChange={(e) =>
                setFormData({ ...formData, sportExperience: e.target.value })
              }
              placeholder={t('placeholderExperience')}
              className="w-full bg-[#14141c] border border-zinc-800 p-3 text-white focus:border-[#FFE500] focus:outline-hidden"
            />
          </div>

          <div>
            <label
              htmlFor="contact-message"
              className="block font-mono-tech uppercase text-zinc-300 mb-1 cursor-pointer"
            >
              {t('labelMessage')}
            </label>
            <textarea
              id="contact-message"
              required
              rows={4}
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder={t('placeholderMessage')}
              className="w-full bg-[#14141c] border border-zinc-800 p-3 text-white focus:border-[#FFE500] focus:outline-hidden"
            />
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-950/40 border border-red-500/50 text-red-300 text-xs rounded-xs">
              {errorMessage}
            </div>
          )}

          <div className="pt-2">
            <TacticalButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
              icon={<Send className="w-4 h-4" />}
            >
              {isSubmitting ? (
                t('submitting')
              ) : (
                /* Libellé du catalogue : éditable en place dans l'aperçu. */
                <span {...cucMicro('contact.form.submit')}>{t('submit')}</span>
              )}
            </TacticalButton>
          </div>

          <div className="text-[10px] font-mono-tech text-zinc-500 pt-1 text-center">
            {t('consent')}
          </div>
        </form>
      )}
    </div>
  );
};
