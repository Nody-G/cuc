'use client';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

import React from 'react';

import Image from 'next/image';
import { Calendar, ShieldCheck, Award, CheckCircle2 } from 'lucide-react';
import { TacticalButton } from '@/components/ui/TacticalButton';

interface FormationPedagogyModalitiesProps {
  onApply: (programId: string) => void;
}

export const FormationPedagogyModalities: React.FC<FormationPedagogyModalitiesProps> = ({
  onApply,
}) => {
  const t = useTranslations('formation');
  const tp = useTranslations('formation.pedagogy');

  /**
   * Sessions, statuts et financements : la copie vit dans `formation.pedagogy`
   * (les dates FR « 16 au 28 août 2026 » ne s'affichent plus en mode anglais).
   */
  const sessions = (tp.raw('sessions') as { label: string; status: string }[]) ?? [];
  const statuses = (tp.raw('statuses') as Record<string, string>) ?? {};
  const fundingItems = (tp.raw('fundingItems') as string[]) ?? [];
  const statusStyles: Record<string, string> = {
    full: 'text-red-400 bg-red-950/40 border-red-800',
    few: 'text-[#FFE500] bg-yellow-950/40 border-yellow-700',
    open: 'text-emerald-400 bg-emerald-950/40 border-emerald-800',
  };

  return (
    <section className="py-16 bg-[#07070a] border-t border-zinc-800">
      <div className="page-shell">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendrier Prochaines Sessions */}
          <div className="bg-[#0e0e14] border border-zinc-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-[#FFE500]" />
              <h3 className="font-display uppercase text-lg text-white">
                {tp('sessionsTitle')}
              </h3>
            </div>
            <div className="space-y-2.5 text-xs font-mono-tech">
              {sessions.map((session) => (
                <div
                  key={session.label}
                  className="flex items-center justify-between p-2.5 bg-[#14141c] border border-zinc-800"
                >
                  <span className="text-zinc-300">{session.label}</span>
                  <span className={`px-2 py-0.5 border ${statusStyles[session.status] ?? ''}`}>
                    {statuses[session.status] ?? ''}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-[11px] font-tech text-zinc-500">
              {tp('registrationNote')}
            </div>
          </div>

          {/* Conditions d'accès */}
          <div className="bg-[#0e0e14] border border-zinc-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-[#FFE500]" />
              <h3 className="font-display uppercase text-lg text-white">
                {tp('admissionTitle')}
              </h3>
            </div>
            <ul className="space-y-3 text-xs font-tech text-zinc-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                <span>{tp.rich('admissionAge', { b: (chunks) => <strong>{chunks}</strong> })}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                <span>
                  {tp.rich('admissionDiscovery', { b: (chunks) => <strong>{chunks}</strong> })}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                <span>
                  {tp.rich('admissionMedical', { b: (chunks) => <strong>{chunks}</strong> })}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                <span>{tp('admissionBoard')}</span>
              </li>
            </ul>
          </div>

          {/* Financement & Prise en Charge */}
          <div className="bg-[#0e0e14] border border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#FFE500]" />
                <h3 className="font-display uppercase text-lg text-white">
                  {tp('fundingTitle')}
                </h3>
              </div>
              <div className="relative w-8 h-8 opacity-75">
                <Image
                  src="/images/logos/cuc-logo-bw.png"
                  alt={tp('sealAlt')}
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
            </div>
            <div className="space-y-3 text-xs font-tech text-zinc-300">
              <p>{tp.rich('fundingQualiopi', { b: (chunks) => <strong>{chunks}</strong> })}</p>
              <p>{tp('fundingIntro')}</p>
              <div className="space-y-1 font-mono-tech text-[11px] text-[#FFE500]">
                {fundingItems.map((item) => (
                  <div key={item}>{item}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 bg-[#121218] border-2 border-[#FFE500] p-8 text-center relative">

          <h3 className="text-3xl font-display uppercase text-white mb-2">
            {t('cta.title')}
          </h3>
          <p className="text-xs font-tech text-zinc-400 max-w-xl mx-auto mb-6">
            {t('cta.text')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <TacticalButton
              variant="primary"
              size="lg"
              onClick={() => onApply('pro-longue-duree')}
            >
              {t('ctaApplyPro')}
            </TacticalButton>
            <Link href="/contact-cuc?demande=afdas-artistes-interpretes">
              <TacticalButton variant="secondary" size="lg">
                {t('cta.contact')}
              </TacticalButton>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
