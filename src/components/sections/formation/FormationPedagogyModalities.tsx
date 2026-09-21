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

  return (
    <section className="py-16 bg-[#07070a] border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendrier Prochaines Sessions */}
          <div className="bg-[#0e0e14] border border-zinc-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-[#FFE500]" />
              <h3 className="font-display uppercase text-lg text-white">
                PROCHAINES SESSIONS
              </h3>
            </div>
            <div className="space-y-2.5 text-xs font-mono-tech">
              <div className="flex items-center justify-between p-2.5 bg-[#14141c] border border-zinc-800">
                <span className="text-zinc-300">16 au 28 août 2026</span>
                <span className="text-red-400 bg-red-950/40 px-2 py-0.5 border border-red-800">
                  COMPLET
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#14141c] border border-zinc-800">
                <span className="text-zinc-300">18 au 30 octobre 2026</span>
                <span className="text-red-400 bg-red-950/40 px-2 py-0.5 border border-red-800">
                  COMPLET
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#14141c] border border-zinc-800">
                <span className="text-zinc-300">21 fév. au 05 mars 2027</span>
                <span className="text-red-400 bg-red-950/40 px-2 py-0.5 border border-red-800">
                  COMPLET
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#14141c] border border-zinc-800">
                <span className="text-zinc-300">18 au 30 avril 2027</span>
                <span className="text-[#FFE500] bg-yellow-950/40 px-2 py-0.5 border border-yellow-700">
                  DERNIÈRES PLACES
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#14141c] border border-zinc-800">
                <span className="text-zinc-300">27 juin au 09 juillet 2027</span>
                <span className="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 border border-emerald-800">
                  OUVERT
                </span>
              </div>
            </div>
            <div className="mt-4 text-[11px] font-tech text-zinc-500">
              * Les inscriptions se font par ordre de validation du dossier médical et du stage découverte.
            </div>
          </div>

          {/* Conditions d'accès */}
          <div className="bg-[#0e0e14] border border-zinc-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-[#FFE500]" />
              <h3 className="font-display uppercase text-lg text-white">
                CONDITIONS D'ADMISSION
              </h3>
            </div>
            <ul className="space-y-3 text-xs font-tech text-zinc-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                <span>
                  Être âgé de <strong>18 ans révolus</strong> au début du cursus.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                <span>
                  Avoir validé avec succès le <strong>stage découverte de 12 jours</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                <span>
                  Fournir un <strong>certificat médical d'aptitude poussée</strong> à la cascade physique.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                <span>
                  Validation du dossier par la commission pédagogique CUC.
                </span>
              </li>
            </ul>
          </div>

          {/* Financement & Prise en Charge */}
          <div className="bg-[#0e0e14] border border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#FFE500]" />
                <h3 className="font-display uppercase text-lg text-white">
                  PRISE EN CHARGE
                </h3>
              </div>
              <div className="relative w-8 h-8 opacity-75">
                <Image
                  src="/images/logos/cuc-logo-bw.png"
                  alt="Sceau CUC"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
            </div>
            <div className="space-y-3 text-xs font-tech text-zinc-300">
              <p>
                Le Campus Univers Cascades est un organisme certifié <strong>QUALIOPI</strong>.
              </p>
              <p>
                Les formations peuvent faire l'objet d'une prise en charge intégrale ou partielle par :
              </p>
              <div className="space-y-1 font-mono-tech text-[11px] text-[#FFE500]">
                <div>• AFDAS (Intermittents du spectacle)</div>
                <div>• FRANCE TRAVAIL (AIF demandeurs d'emploi)</div>
                <div>• OPCO &amp; Entreprises du spectacle</div>
                <div>• Échéanciers sans frais (fonds propres)</div>
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
