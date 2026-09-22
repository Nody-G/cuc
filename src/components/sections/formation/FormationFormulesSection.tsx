'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Target, Clock, MapPin, Bed, CheckCircle2, ShieldCheck, Award } from 'lucide-react';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { cucField, findItemIndex, itemPath } from '@/lib/preview/cuc-field';

interface FormationFormulesSectionProps {
  onApply: (programId: string) => void;
  formulesData?: {
    badge?: string;
    title?: string;
    subtitle?: string;
    items?: Array<{
      id: string;
      step_badge?: string;
      duration_badge?: string;
      title: string;
      description?: string;
      duration_text?: string;
      schedule_text?: string;
      boarding_text?: string;
      certification_text?: string;
      cta_text?: string;
      program_id?: string;
    }>;
  };
}

export const FormationFormulesSection: React.FC<FormationFormulesSectionProps> = ({
  onApply,
  formulesData,
}) => {
  const t = useTranslations('formation');
  const tf = useTranslations('formation.formules');

  // Sécurité et parcours d'admission : toute la copie est dans
  // `formation.formules` (aucune chaîne FR résiduelle en anglais).
  const step1Items = (tf.raw('step1Items') as string[]) ?? [];
  const step2Items = (tf.raw('step2Items') as string[]) ?? [];

  const badge = formulesData?.badge || tf('badge');
  const title = formulesData?.title || tf('title');
  const subtitle = formulesData?.subtitle || tf('subtitle');

  /**
   * Items des deux formules, retrouvés par identifiant — jamais par position :
   * c'est leur index réel qui compose le chemin éditable, un index faux
   * écrirait la copie d'une autre formule.
   */
  const items = formulesData?.items ?? [];
  const decouverteIndex = findItemIndex(items, 'decouverte');
  const proIndex = findItemIndex(items, 'pro_longue_duree');
  const decouverte = decouverteIndex >= 0 ? items[decouverteIndex] : undefined;
  const pro = proIndex >= 0 ? items[proIndex] : undefined;

  return (
    <section className="py-16">
      <div className="page-shell">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <StuntBadge variant="yellow" icon={<Target className="w-3.5 h-3.5" />}>
            <span {...cucField('sections_data.formules.badge')}>{badge}</span>
          </StuntBadge>
          <h2
            {...cucField('sections_data.formules.title')}
            className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white mt-3 mb-3"
          >
            {title}
          </h2>
          <p
            {...cucField('sections_data.formules.subtitle', 'textarea')}
            className="text-sm font-tech text-zinc-400"
          >
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Carte 1 : Formule Découverte & Sélection */}
          <div
            id="formule-decouverte"
            className="bg-[#0e0e14] border-2 border-zinc-800 hover:border-[#FFE500]/50 transition-colors p-6 sm:p-8 relative flex flex-col justify-between scroll-mt-24"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span
                  {...cucField(itemPath('formules', decouverteIndex, 'step_badge'))}
                  className="px-2.5 py-1 bg-zinc-800 text-zinc-300 font-mono-tech text-[10px] uppercase tracking-wider"
                >
                  {decouverte?.step_badge || tf('step1Badge')}
                </span>
                <span
                  {...cucField(itemPath('formules', decouverteIndex, 'duration_badge'))}
                  className="text-xs font-mono-tech text-[#FFE500]"
                >
                  {decouverte?.duration_badge || tf('step1Hours')}
                </span>
              </div>

              <h3
                {...cucField(itemPath('formules', decouverteIndex, 'title'))}
                className="text-2xl sm:text-3xl font-display uppercase text-white mb-2"
              >
                {decouverte?.title || tf('step1Title')}
              </h3>
              <p
                {...cucField(itemPath('formules', decouverteIndex, 'description'), 'textarea')}
                className="text-xs font-tech text-zinc-400 mb-6"
              >
                {decouverte?.description || tf('step1Desc')}
              </p>

              <div className="space-y-3 mb-6 text-xs font-tech">
                <div className="flex items-center gap-3 text-zinc-300">
                  <Clock className="w-4 h-4 text-[#FFE500] shrink-0" />
                  <span>
                    <strong>{tf('labelDuration')}</strong>{' '}
                    <span {...cucField(itemPath('formules', decouverteIndex, 'duration_text'))}>
                      {decouverte?.duration_text || tf('step1Duration')}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-zinc-300">
                  <MapPin className="w-4 h-4 text-[#FFE500] shrink-0" />
                  <span>
                    <strong>{tf('labelPlace')}</strong> {tf('place')}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-zinc-300">
                  <Bed className="w-4 h-4 text-[#FFE500] shrink-0" />
                  <span>
                    <strong>{tf('labelBoarding')}</strong>{' '}
                    <span {...cucField(itemPath('formules', decouverteIndex, 'boarding_text'))}>
                      {decouverte?.boarding_text || tf('step1Boarding')}
                    </span>
                  </span>
                </div>
              </div>

              <h4 className="text-xs font-mono-tech text-[#FFE500] uppercase mb-2">
                {tf('step1ProgramTitle')}
              </h4>
              <ul className="space-y-2 text-xs font-tech text-zinc-300 mb-6">
                {step1Items.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FFE500] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <TacticalButton
                variant="secondary"
                size="md"
                className="w-full"
                onClick={() => onApply('stage-decouverte')}
              >
                <span {...cucField(itemPath('formules', decouverteIndex, 'cta_text'))}>
                  {decouverte?.cta_text || tf('step1Cta')}
                </span>
              </TacticalButton>
            </div>
          </div>

          {/* Carte 2 : Cursus Pro Longue Durée */}
          <div
            id="formation-pro"
            className="bg-[#0e0e14] border-2 border-[#FFE500] p-6 sm:p-8 relative flex flex-col justify-between shadow-[0_0_30px_rgba(255,229,0,0.1)] scroll-mt-24"
          >

            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span
                  {...cucField(itemPath('formules', proIndex, 'step_badge'))}
                  className="px-2.5 py-1 bg-[#FFE500] text-black font-mono-tech text-[10px] font-bold uppercase tracking-wider"
                >
                  {pro?.step_badge || tf('step2Badge')}
                </span>
                <span
                  {...cucField(itemPath('formules', proIndex, 'duration_badge'))}
                  className="text-xs font-mono-tech text-[#FFE500]"
                >
                  {pro?.duration_badge || tf('step2Hours')}
                </span>
              </div>

              <h3
                {...cucField(itemPath('formules', proIndex, 'title'))}
                className="text-2xl sm:text-3xl font-display uppercase text-white mb-2"
              >
                {pro?.title || tf('step2Title')}
              </h3>
              <p
                {...cucField(itemPath('formules', proIndex, 'description'), 'textarea')}
                className="text-xs font-tech text-zinc-300 mb-6"
              >
                {pro?.description || tf('step2Desc')}
              </p>

              <div className="space-y-3 mb-6 text-xs font-tech">
                <div className="flex items-center gap-3 text-zinc-300">
                  <Clock className="w-4 h-4 text-[#FFE500] shrink-0" />
                  <span>
                    <strong>{tf('labelRhythm')}</strong>{' '}
                    <span {...cucField(itemPath('formules', proIndex, 'schedule_text'))}>
                      {pro?.schedule_text || tf('step2Rhythm')}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-zinc-300">
                  <ShieldCheck className="w-4 h-4 text-[#FFE500] shrink-0" />
                  <span>
                    <strong>{tf('labelAccreditation')}</strong>{' '}
                    <span {...cucField(itemPath('formules', proIndex, 'boarding_text'))}>
                      {pro?.boarding_text || tf('step2Accreditation')}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-zinc-300">
                  <Award className="w-4 h-4 text-[#FFE500] shrink-0" />
                  <span>
                    <strong>{tf('labelCertification')}</strong>{' '}
                    <span {...cucField(itemPath('formules', proIndex, 'certification_text'))}>
                      {pro?.certification_text || tf('step2Certification')}
                    </span>
                  </span>
                </div>
              </div>

              <h4 className="text-xs font-mono-tech text-[#FFE500] uppercase mb-2">
                {tf('step2ProgramTitle')}
              </h4>
              <ul className="space-y-2 text-xs font-tech text-zinc-300 mb-6">
                {step2Items.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FFE500] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <TacticalButton
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => onApply('pro-longue-duree')}
              >
                <span {...cucField(itemPath('formules', proIndex, 'cta_text'))}>
                  {pro?.cta_text || t('ctaApplyPro')}
                </span>
              </TacticalButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
