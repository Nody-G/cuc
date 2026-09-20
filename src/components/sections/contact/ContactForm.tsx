'use client';

import React, { useEffect, useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { submitInquiry } from '@/app/admin/actions';

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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    program: 'pro-longue-duree',
    sportExperience: '',
    message: '',
  });

  // Préremplissage depuis le paramètre d'URL `?demande=...`
  useEffect(() => {
    const initial = resolveInitialProgram();
    if (initial !== 'pro-longue-duree') {
      setFormData((prev) => ({ ...prev, program: initial }));
    }
  }, []);

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const programLabels: Record<string, string> = {
      'pro-longue-duree': 'Formation Pro Longue Durée (2 ans)',
      'stage-decouverte': 'Stage Découverte & Sélection (12j / 80h)',
      'weekend-immersion': 'Formule Week-end Immersion',
      'afdas-artistes-interpretes': 'Stage AFDAS Artistes Interprètes',
      'stunt-summer-camp': 'Stunt Summer Camp',
      'workshop-international': 'International Stunt Workshop',
      'tournage-production': 'Production & Tournage Cinéma',
      'cuc-events': 'CUC Events & Prestations',
      'autre': 'Question Générale',
    };

    const res = await submitInquiry({
      full_name: formData.name,
      email: formData.email,
      phone: formData.phone,
      program_id: formData.program,
      program_title: programLabels[formData.program] || formData.program,
      sport_background: formData.sportExperience,
      message: formData.message,
    });

    setIsSubmitting(false);
    if (res.success) {
      setSubmitted(true);
    } else {
      setErrorMessage(res.error || 'Une erreur est survenue lors de l’envoi. Veuillez réessayer.');
    }
  };

  return (
    <div className="lg:col-span-7 bg-[#0e0e14] border-2 border-zinc-800 p-6 sm:p-8 relative">

      <h2 className="text-2xl sm:text-3xl font-display uppercase text-white mb-2">
        DÉMARRER UN PROJET OU ÉCHANGER
      </h2>
      <p className="text-xs font-tech text-zinc-400 mb-6">
        Transmettez-nous les détails de votre demande. Notre équipe opérationnelle vous répondra sous 24 à
        48 heures ouvrées.
      </p>

      {submitted ? (
        <div className="p-8 bg-[#121218] border border-emerald-500/50 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-display uppercase text-white">
            MESSAGE TRANSMIS AVEC SUCCÈS
          </h3>
          <p className="text-xs font-tech text-zinc-300 max-w-md mx-auto">
            Merci pour votre prise de contact avec le Campus Univers Cascades. Notre équipe
            examinera votre projet et reviendra vers vous avec réactivité.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-4 py-2 bg-zinc-800 text-xs font-mono-tech uppercase text-zinc-300 hover:text-white cursor-pointer"
          >
            Envoyer un autre message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-tech">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="contact-name"
                className="block font-mono-tech uppercase text-zinc-300 mb-1 cursor-pointer"
              >
                Nom &amp; Prénom *
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
                placeholder="Ex: Alexandre Dubois"
                className="w-full bg-[#14141c] border border-zinc-800 p-3 text-white focus:border-[#FFE500] focus:outline-hidden"
              />
            </div>

            <div>
              <label
                htmlFor="contact-phone"
                className="block font-mono-tech uppercase text-zinc-300 mb-1 cursor-pointer"
              >
                Téléphone *
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
                placeholder="Ex: 06 12 34 56 78"
                className="w-full bg-[#14141c] border border-zinc-800 p-3 text-white focus:border-[#FFE500] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="contact-email"
              className="block font-mono-tech uppercase text-zinc-300 mb-1 cursor-pointer"
            >
              Adresse Email *
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
              placeholder="Ex: alexandre@exemple.com"
              className="w-full bg-[#14141c] border border-zinc-800 p-3 text-white focus:border-[#FFE500] focus:outline-hidden"
            />
          </div>

          <div>
            <label
              htmlFor="contact-program"
              className="block font-mono-tech uppercase text-zinc-300 mb-1 cursor-pointer"
            >
              Votre Demande Concerne *
            </label>
            <select
              id="contact-program"
              value={formData.program}
              onChange={(e) =>
                setFormData({ ...formData, program: e.target.value })
              }
              className="w-full bg-[#14141c] border border-zinc-800 p-3 text-white focus:border-[#FFE500] focus:outline-hidden"
            >
              <option value="pro-longue-duree">
                Formation Professionnelle Longue Durée (2 ans / 720h)
              </option>
              <option value="stage-decouverte">
                Stage Découverte &amp; Sélection (12 jours / 80h)
              </option>
              <option value="weekend-immersion">
                Formule Week-end Immersion (250€ pension complète)
              </option>
              <option value="afdas-artistes-interpretes">
                Stage AFDAS Artistes Interprètes (Gennevilliers)
              </option>
              <option value="stunt-summer-camp">
                Stunt Summer Camp (Séjour d'été)
              </option>
              <option value="workshop-international">
                International Stunt Workshop (Worldwide)
              </option>
              <option value="tournage-production">
                Production de Cinéma / Tournage / Coordination
              </option>
              <option value="cuc-events">
                CUC Events / Spectacles &amp; Animations Live
              </option>
              <option value="autre">Autre question générale</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="contact-sportExperience"
              className="block font-mono-tech uppercase text-zinc-300 mb-1 cursor-pointer"
            >
              Expérience Sportive / Artistique (Arts martiaux, gymnastique,
              parkour...)
            </label>
            <input
              id="contact-sportExperience"
              type="text"
              value={formData.sportExperience}
              onChange={(e) =>
                setFormData({ ...formData, sportExperience: e.target.value })
              }
              placeholder="Ex: 5 ans de judo, pratique du parkour..."
              className="w-full bg-[#14141c] border border-zinc-800 p-3 text-white focus:border-[#FFE500] focus:outline-hidden"
            />
          </div>

          <div>
            <label
              htmlFor="contact-message"
              className="block font-mono-tech uppercase text-zinc-300 mb-1 cursor-pointer"
            >
              Votre Message / Précisions *
            </label>
            <textarea
              id="contact-message"
              required
              rows={4}
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="Indiquez vos objectifs, questions ou financements envisagés (AFDAS, etc.)..."
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
              {isSubmitting
                ? 'Transmission en cours...'
                : 'Envoyer ma Candidature / Message'}
            </TacticalButton>
          </div>

          <div className="text-[10px] font-mono-tech text-zinc-500 pt-1 text-center">
            En soumettant ce formulaire, vous acceptez que les informations saisies
            soient exploitées dans le cadre strict de votre demande d'admission ou
            de contact CUC.
          </div>
        </form>
      )}
    </div>
  );
};
