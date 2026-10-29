import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StuntBadge } from '@/components/ui/StuntBadge';
import {
  ShieldAlert,
  Flame,
  AlertTriangle,
  Clock,
  FileCheck2,
  HeartPulse,
} from 'lucide-react';
import { SITE_NAME } from '@/lib/seo';
import { CUC_TRAINING_ORG } from '@/lib/legal/legal-data';

export async function generateMetadata({
  params,
}: {
  params?: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale = 'fr' } = (await params) ?? { locale: 'fr' };
  const isEn = locale === 'en';

  return {
    title: isEn
      ? 'Internal Regulations, Safety & Stunt Training Terms'
      : 'Règlement Intérieur, Sécurité & Conditions de Formation',
    description: isEn
      ? 'Internal regulations, physical safety rules, and admission terms of Campus Univers Cascades (CUC).'
      : 'Règlement intérieur, règles d’hygiène et de sécurité physique, discipline et conditions d’admission du Campus Univers Cascades (CUC).',
    robots: { index: true, follow: true },
  };
}

export default async function ReglementInterieurPage({
  params,
}: {
  params?: Promise<{ locale: string }>;
}) {
  const { locale = 'fr' } = (await params) ?? { locale: 'fr' };
  const isEn = locale === 'en';

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      <Navbar />

      <main id="contenu-principal" className="flex-grow pt-32 pb-20">
        <div className="page-shell max-w-4xl mx-auto space-y-12">
          {/* En-tête */}
          <div className="text-center space-y-4">
            <StuntBadge variant="yellow" icon={<ShieldAlert className="w-3.5 h-3.5" />}>
              {isEn ? 'Safety & Professional Framework' : 'Sécurité & Cadre Professionnel'}
            </StuntBadge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display uppercase tracking-wide text-white">
              {isEn ? (
                <>
                  Internal <span className="text-[#FFE500]">Regulations</span> & Safety
                </>
              ) : (
                <>
                  Règlement <span className="text-[#FFE500]">Intérieur</span> & Sécurité
                </>
              )}
            </h1>
            <p className="text-xs sm:text-sm font-tech text-zinc-400 max-w-2xl mx-auto">
              {isEn
                ? 'Pursuant to Articles L.6352-3 to L.6352-5 and R.6352-1 to R.6352-15 of the French Labour Code, applicable to all trainees of Campus Univers Cascades.'
                : 'Établi en application des articles L.6352-3 à L.6352-5 et R.6352-1 à R.6352-15 du Code du travail, applicable à l’ensemble des stagiaires et apprenants du Campus Univers Cascades.'}
            </p>
          </div>

          {/* Section 1 : Champ d’application & Aptitude Médicale */}
          <section className="bg-[#0e0e14] border border-zinc-800 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <HeartPulse className="w-5 h-5 text-[#FFE500]" />
              <h2 className="text-lg font-display uppercase text-white">
                {isEn ? '1. Scope & Medical Fitness' : '1. Champ d’Application & Aptitude Médicale'}
              </h2>
            </div>
            <div className="text-xs sm:text-sm font-tech text-zinc-300 space-y-3 leading-relaxed">
              <p>
                {isEn ? (
                  <>
                    These regulations govern life on campus and all training sessions organised by <strong>{SITE_NAME}</strong> (NDA : {CUC_TRAINING_ORG.nda}).
                  </>
                ) : (
                  <>
                    Le présent règlement s’applique à toute personne inscrite à une session de formation ou stage au sein du <strong>{SITE_NAME}</strong> (Organisme certifié Qualiopi, NDA : {CUC_TRAINING_ORG.nda}).
                  </>
                )}
              </p>
              <div className="p-3 bg-[#14141c] border-l-2 border-[#FFE500] text-zinc-300 text-xs font-mono-tech space-y-1">
                <p className="font-bold text-white">
                  {isEn ? 'MANDATORY MEDICAL FITNESS:' : 'OBLIGATION MÉDICALE PRÉALABLE :'}
                </p>
                <p>
                  {isEn
                    ? 'Given the physical demands of stunt training, every trainee must provide a valid medical certificate with no contraindications to high-intensity stunt and martial activities before starting.'
                    : 'Compte tenu de l’intensité physique des métiers de la cascade, chaque stagiaire doit impérativement fournir avant le début de la session un certificat médical de non contre-indication à la pratique des cascades physiques, chutes et combats chorégraphiés datant de moins de 3 mois.'}
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 : Règles de Sécurité Physique & Équipements */}
          <section className="bg-[#0e0e14] border border-zinc-800 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <AlertTriangle className="w-5 h-5 text-[#FFE500]" />
              <h2 className="text-lg font-display uppercase text-white">
                {isEn ? '2. Stunt Safety Rules & Personal Protective Equipment (PPE)' : '2. Sécurité des Cascades & Équipements de Protection'}
              </h2>
            </div>
            <div className="text-xs sm:text-sm font-tech text-zinc-300 space-y-2 leading-relaxed">
              <ul className="list-disc list-inside space-y-2 text-zinc-400 pl-2">
                <li>
                  <strong className="text-white">{isEn ? 'Absolute authority of instructors:' : 'Autorité absolue des instructeurs :'}</strong>{' '}
                  {isEn
                    ? 'No stunt, jump, fall, wirework, or weapon handling may be performed without explicit order and active supervision of the assigned stunt coordinator.'
                    : 'Aucune cascade, chute, voltige câblée ou manipulation d’armes scéniques ne peut être engagée sans l’ordre exprès et la présence active du régleur ou instructeur référent.'}
                </li>
                <li>
                  <strong className="text-white">{isEn ? 'Mandatory PPE:' : 'Port obligatoire des protections (EPI) :'}</strong>{' '}
                  {isEn
                    ? 'Joint pads (knees, elbows), spine guards, certified helmets and harnesses must be worn systematically according to workshop safety guidelines.'
                    : 'Le port des protections individuelles (coudières, genouillères, protège-dents, dorsales, casques ou harnais certifiés) est obligatoire lors des ateliers techniques.'}
                </li>
                <li>
                  <strong className="text-white">{isEn ? 'Reception zones integrity:' : 'Zones de réception & matériels :'}</strong>{' '}
                  {isEn
                    ? 'Airbags, crash mats and safety devices are inspected daily. Entering a landing zone without clearance is strictly forbidden.'
                    : 'Les airbags géants, crash mats et tapis de réception sont réservés aux trajectoires balisées. Il est interdit d’encombrer ou de traverser une zone d’atterrissage sans autorisation.'}
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 : Hygiène & Discipline */}
          <section className="bg-[#0e0e14] border border-zinc-800 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <Flame className="w-5 h-5 text-[#FFE500]" />
              <h2 className="text-lg font-display uppercase text-white">
                {isEn ? '3. Health, Substances & Campus Discipline' : '3. Hygiène, Alcool, Substances & Discipline'}
              </h2>
            </div>
            <div className="text-xs sm:text-sm font-tech text-zinc-300 space-y-2 leading-relaxed">
              <ul className="list-disc list-inside space-y-2 text-zinc-400 pl-2">
                <li>
                  <strong className="text-white">{isEn ? 'Zero tolerance for substances:' : 'Tolérance zéro substances & alcool :'}</strong>{' '}
                  {isEn
                    ? 'The introduction or consumption of alcoholic beverages, illicit substances, or medications altering vigilance is strictly forbidden on campus. Any infringement results in immediate exclusion.'
                    : 'L’introduction ou la consommation d’alcool, de stupéfiants ou de substances altérant la vigilance et les réflexes est formellement interdite. Tout manquement entraîne l’exclusion immédiate.'}
                </li>
                <li>
                  <strong className="text-white">{isEn ? 'Mandatory warm-up:' : 'Échauffement obligatoire & assiduité :'}</strong>{' '}
                  {isEn
                    ? 'Punctuality is crucial. Trainees missing the mandatory warm-up will not be allowed to practice physical workshops for injury-prevention reasons.'
                    : 'La ponctualité conditionne la sécurité. Tout stagiaire manquant l’échauffement collectif obligatoire se verra refuser l’accès aux ateliers physiques pour prévenir tout accident.'}
                </li>
                <li>
                  <strong className="text-white">{isEn ? 'Respect and safety of others:' : 'Respect mutuel & esprit d’équipe :'}</strong>{' '}
                  {isEn
                    ? 'Stunt work requires absolute trust. Any deliberate endangering of partners or lack of mutual respect is sanctionable.'
                    : 'Le métier de cascadeur repose sur une confiance totale entre partenaires. Tout comportement violent, dénigrant ou mettant autrui en péril fait l’objet de sanctions disciplinaires immédiates.'}
                </li>
              </ul>
            </div>
          </section>

          {/* Section 4 : Sanctions & Procédure Disciplinaire */}
          <section className="bg-[#0e0e14] border border-zinc-800 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <FileCheck2 className="w-5 h-5 text-[#FFE500]" />
              <h2 className="text-lg font-display uppercase text-white">
                {isEn ? '4. Sanctions Scale & Due Process' : '4. Échelle des Sanctions & Droits de la Défense'}
              </h2>
            </div>
            <div className="text-xs sm:text-sm font-tech text-zinc-300 space-y-2 leading-relaxed">
              <p>
                {isEn
                  ? 'In accordance with Article R.6352-3 of the French Labour Code, infractions may lead to: 1) Formal warning, 2) Temporary suspension, 3) Permanent expulsion from the course for gross negligence or security violation, following an adversarial hearing.'
                  : 'Conformément aux articles R.6352-3 et suivants du Code du travail, tout manquement aux règles de sécurité ou de discipline peut faire l’objet : 1) D’un avertissement écrit, 2) D’une exclusion temporaire, 3) D’une exclusion définitive de la formation après entretien préalable garantissant les droits de la défense.'}
              </p>
            </div>
          </section>

          {/* Section 5 : Inscriptions, Financements & Droit de Rétractation */}
          <section className="bg-[#0e0e14] border border-zinc-800 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <Clock className="w-5 h-5 text-[#FFE500]" />
              <h2 className="text-lg font-display uppercase text-white">
                {isEn ? '5. Registration, Funding & Withdrawal Rights' : '5. Inscription, Financements & Rétractation'}
              </h2>
            </div>
            <div className="text-xs sm:text-sm font-tech text-zinc-300 space-y-3 leading-relaxed">
              <p>
                {isEn
                  ? 'All admissions are formalized via a professional training contract or agreement, detailing educational goals, schedule, cost, and funding sources (AFDAS, OPCO, France Travail).'
                  : 'Toute admission fait l’objet d’un contrat ou d’une convention de formation professionnelle précisant le programme pédagogique, le calendrier, le coût et les modalités de prise en charge (AFDAS, OPCO, France Travail ou financement individuel).'}
              </p>
              <div className="p-3 bg-[#14141c] border-l-2 border-[#FFE500] text-zinc-300 text-xs font-mono-tech space-y-1">
                <p className="font-bold text-white">
                  {isEn ? '14-DAY RIGHT OF WITHDRAWAL:' : 'DÉLAI LÉGAL DE RÉTRACTATION (14 JOURS) :'}
                </p>
                <p>
                  {isEn
                    ? 'For individual consumers enrolling remotely, a 14-day statutory withdrawal period applies from the date of contract signing (Article L.221-18 of the French Consumer Code).'
                    : 'Pour les stagiaires particuliers finançant leur formation à titre individuel et ayant souscrit à distance, un délai légal de rétractation de 14 jours francs s’applique à compter de la signature du contrat, sans pénalité (Article L.221-18 du Code de la consommation).'}
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
