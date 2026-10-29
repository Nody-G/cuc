import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { Scale, ShieldCheck, Award, FileText, ExternalLink, HelpCircle } from 'lucide-react';
import { SITE_NAME } from '@/lib/seo';
import {
  CUC_LEGAL_ENTITY,
  CUC_TRAINING_ORG,
  CUC_CONSUMER_MEDIATION,
  CUC_HOSTING_PROVIDERS,
} from '@/lib/legal/legal-data';

export async function generateMetadata({
  params,
}: {
  params?: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale = 'fr' } = (await params) ?? { locale: 'fr' };
  const isEn = locale === 'en';

  return {
    title: isEn ? 'Legal Notice & Regulatory Approvals' : 'Mentions Légales & Agréments',
    description: isEn
      ? 'Legal notice, declaration of activity, Qualiopi certification and consumer mediation of Campus Univers Cascades (CUC).'
      : 'Mentions légales, déclaration d’activité, certification Qualiopi et informations réglementaires du Campus Univers Cascades (CUC).',
    robots: { index: true, follow: true },
  };
}

export default async function MentionsLegalesPage({
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
            <StuntBadge variant="yellow" icon={<Scale className="w-3.5 h-3.5" />}>
              {isEn ? 'Regulation & Transparency' : 'Réglementation & Transparence'}
            </StuntBadge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display uppercase tracking-wide text-white">
              {isEn ? (
                <>
                  Legal <span className="text-[#FFE500]">Notice</span>
                </>
              ) : (
                <>
                  Mentions <span className="text-[#FFE500]">Légales</span>
                </>
              )}
            </h1>
            <p className="text-xs sm:text-sm font-tech text-zinc-400 max-w-2xl mx-auto">
              {isEn
                ? 'In accordance with Article 6-III-1 of French Law No. 2004-575 of June 21, 2004 (LCEN), the French Consumer Code, and vocational training obligations.'
                : 'Conformément aux dispositions de l’article 6-III-1 de la Loi n° 2004-575 du 21 juin 2004 pour la Confiance dans l’Économie Numérique (LCEN), du Code de la consommation et aux obligations des organismes de formation professionnelle.'}
            </p>
          </div>

          {/* Section 1 : Éditeur du Site */}
          <section className="bg-[#0e0e14] border border-zinc-800 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <FileText className="w-5 h-5 text-[#FFE500]" />
              <h2 className="text-lg font-display uppercase text-white">
                {isEn ? '1. Platform Publisher' : '1. Éditeur de la Plateforme'}
              </h2>
            </div>
            <div className="text-xs sm:text-sm font-tech text-zinc-300 space-y-2 leading-relaxed">
              <p>
                {isEn ? (
                  <>
                    The official website of <strong>{SITE_NAME}</strong> is published by{' '}
                    <strong>{CUC_LEGAL_ENTITY.legalName}</strong>.
                  </>
                ) : (
                  <>
                    Le site officiel du <strong>{SITE_NAME}</strong> est édité par la structure{' '}
                    <strong>{CUC_LEGAL_ENTITY.legalName}</strong>.
                  </>
                )}
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-2">
                <li>
                  <strong className="text-zinc-300">{isEn ? 'Trade name:' : 'Dénomination commerciale :'}</strong>{' '}
                  {CUC_LEGAL_ENTITY.tradeName}
                </li>
                <li>
                  <strong className="text-zinc-300">{isEn ? 'Legal form:' : 'Forme juridique :'}</strong>{' '}
                  {CUC_LEGAL_ENTITY.legalForm}
                </li>
                <li>
                  <strong className="text-zinc-300">SIREN :</strong> {CUC_LEGAL_ENTITY.siren} •{' '}
                  <strong className="text-zinc-300">SIRET (siège) :</strong> {CUC_LEGAL_ENTITY.siret}
                </li>
                <li>
                  <strong className="text-zinc-300">Code APE / NAF :</strong> {CUC_LEGAL_ENTITY.apeNaf}
                </li>
                <li>
                  <strong className="text-zinc-300">Numéro RNA :</strong> {CUC_LEGAL_ENTITY.rna}
                </li>
                <li>
                  <strong className="text-zinc-300">{isEn ? 'Headquarters:' : 'Siège social :'}</strong>{' '}
                  {CUC_LEGAL_ENTITY.headquartersAddress}
                </li>
                <li>
                  <strong className="text-zinc-300">{isEn ? 'Main campus:' : 'Campus principal & ateliers :'}</strong>{' '}
                  {CUC_LEGAL_ENTITY.campusAddress}
                </li>
                <li>
                  <strong className="text-zinc-300">{isEn ? 'Paris studio (rehearsals & actors):' : 'Studio Paris (répétitions & comédiens) :'}</strong>{' '}
                  {CUC_LEGAL_ENTITY.parisStudioAddress}
                </li>
                <li>
                  <strong className="text-zinc-300">{isEn ? 'Phone:' : 'Téléphone standard :'}</strong>{' '}
                  <a href={`tel:${CUC_LEGAL_ENTITY.phone.replace(/\s+/g, '')}`} className="text-white hover:text-[#FFE500]">
                    {CUC_LEGAL_ENTITY.phone}
                  </a>
                </li>
                <li>
                  <strong className="text-zinc-300">{isEn ? 'Email:' : 'Courriel officiel :'}</strong>{' '}
                  <a href={`mailto:${CUC_LEGAL_ENTITY.email}`} className="text-[#FFE500] underline">
                    {CUC_LEGAL_ENTITY.email}
                  </a>
                </li>
                <li>
                  <strong className="text-zinc-300">{isEn ? 'Publication director:' : 'Directeur de la publication :'}</strong>{' '}
                  {CUC_LEGAL_ENTITY.publicationDirector}
                </li>
                <li>
                  <strong className="text-zinc-300">Régime TVA :</strong> {CUC_LEGAL_ENTITY.vatStatus}
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2 : Organisme de Formation & Qualiopi */}
          <section className="bg-[#0e0e14] border border-zinc-800 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <Award className="w-5 h-5 text-[#FFE500]" />
              <h2 className="text-lg font-display uppercase text-white">
                {isEn ? '2. Vocational Training & Qualiopi Certification' : '2. Formation Professionnelle & Certification Qualiopi'}
              </h2>
            </div>
            <div className="text-xs sm:text-sm font-tech text-zinc-300 space-y-3 leading-relaxed">
              <p>
                {CUC_LEGAL_ENTITY.legalName} est enregistré en qualité d’organisme de formation professionnelle sous le numéro{' '}
                <strong className="text-white">{CUC_TRAINING_ORG.nda}</strong> auprès du {CUC_TRAINING_ORG.ndaPrefecture}.
              </p>
              <div className="p-3 bg-[#14141c] border-l-2 border-[#FFE500] text-zinc-300 text-xs font-mono-tech">
                {CUC_TRAINING_ORG.legalDisclaimer}
              </div>
              <p>
                <strong className="text-white">{isEn ? 'Qualiopi Certification:' : 'Certification Qualiopi :'}</strong>{' '}
                {isEn
                  ? 'Certified under the "Training Actions" category (Article L.6313-1 - 1° of the French Labour Code), attesting to compliance with the National Quality Framework (RNQ) for public and mutualized funding (AFDAS, OPCO, France Travail).'
                  : 'L’organisme est certifié Qualiopi au titre de la catégorie des « Actions de formation » (Article L.6313-1 - 1° du Code du travail), attestant de la conformité au Référentiel National Qualité (RNQ) pour les financements publics et mutualisés (AFDAS, OPCO, France Travail).'}
              </p>
              <p>
                <strong className="text-white">{isEn ? 'Accessibility & Special Needs (PSH):' : 'Accueil des Personnes en Situation de Handicap (PSH) :'}</strong>{' '}
                {isEn
                  ? 'CUC studies each application on a case-by-case basis to adapt educational and physical modalities where possible. Disability referent:'
                  : 'Le CUC étudie chaque candidature au cas par cas afin d’adapter les modalités pédagogiques et logistiques. Référent handicap :'}{' '}
                <a href={`mailto:${CUC_TRAINING_ORG.disabilityContact}`} className="text-[#FFE500] underline">
                  {CUC_TRAINING_ORG.disabilityContact}
                </a>.
              </p>
            </div>
          </section>

          {/* Section 3 : Médiation de la Consommation */}
          <section className="bg-[#0e0e14] border border-zinc-800 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <HelpCircle className="w-5 h-5 text-[#FFE500]" />
              <h2 className="text-lg font-display uppercase text-white">
                {isEn ? '3. Consumer Mediation' : '3. Médiation de la Consommation'}
              </h2>
            </div>
            <div className="text-xs sm:text-sm font-tech text-zinc-300 space-y-3 leading-relaxed">
              <p>
                {isEn
                  ? 'In accordance with Article L.612-1 of the French Consumer Code, any individual trainee or consumer has the right to use a consumer mediator free of charge with a view to the amicable resolution of any dispute.'
                  : 'Conformément aux articles L.612-1 et suivants du Code de la consommation, tout stagiaire particulier ou consommateur a le droit de recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable d’un litige non résolu par réclamation écrite préalable auprès de nos services.'}
              </p>
              <div className="p-4 bg-[#14141c] border border-zinc-800 text-zinc-300 space-y-1 text-xs font-mono-tech">
                <p className="font-bold text-white">{CUC_CONSUMER_MEDIATION.name}</p>
                <p>{CUC_CONSUMER_MEDIATION.address}</p>
                <p>
                  {isEn ? 'Online submission:' : 'Saisine en ligne :'}{' '}
                  <a
                    href={CUC_CONSUMER_MEDIATION.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FFE500] underline inline-flex items-center gap-1"
                  >
                    {CUC_CONSUMER_MEDIATION.website} <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>
              <p className="text-xs text-zinc-400">
                {isEn ? 'European Online Dispute Resolution (ODR) platform:' : 'Plateforme européenne de Règlement en Ligne des Litiges (RLL) :'}{' '}
                <a
                  href={CUC_CONSUMER_MEDIATION.odrPlatform}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FFE500] underline inline-flex items-center gap-1"
                >
                  ec.europa.eu/consumers/odr <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </section>

          {/* Section 4 : Hébergement */}
          <section className="bg-[#0e0e14] border border-zinc-800 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <ShieldCheck className="w-5 h-5 text-[#FFE500]" />
              <h2 className="text-lg font-display uppercase text-white">
                {isEn ? '4. Web Hosting & Infrastructure' : '4. Hébergement du Site'}
              </h2>
            </div>
            <div className="text-xs sm:text-sm font-tech text-zinc-300 space-y-2 leading-relaxed">
              <p>{isEn ? 'The site is hosted on high-availability cloud infrastructure:' : 'Le site est hébergé sur des infrastructures haute disponibilité :'}</p>
              <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-2">
                <li>
                  <strong className="text-zinc-300">{isEn ? 'Application hosting:' : 'Hébergeur applicatif :'}</strong>{' '}
                  {CUC_HOSTING_PROVIDERS.applicationHost.name}, {CUC_HOSTING_PROVIDERS.applicationHost.address} (
                  <a href={CUC_HOSTING_PROVIDERS.applicationHost.url} target="_blank" rel="noopener noreferrer" className="text-[#FFE500] underline">
                    vercel.com
                  </a>
                  ).
                </li>
                <li>
                  <strong className="text-zinc-300">{isEn ? 'Database & storage:' : 'Base de données & médias :'}</strong>{' '}
                  {CUC_HOSTING_PROVIDERS.databaseHost.name}, {CUC_HOSTING_PROVIDERS.databaseHost.address} — Datacenter :{' '}
                  <span className="text-white">{CUC_HOSTING_PROVIDERS.databaseHost.region}</span> (
                  <a href={CUC_HOSTING_PROVIDERS.databaseHost.url} target="_blank" rel="noopener noreferrer" className="text-[#FFE500] underline">
                    supabase.com
                  </a>
                  ).
                </li>
              </ul>
            </div>
          </section>

          {/* Section 5 : Propriété Intellectuelle & Juridiction */}
          <section className="bg-[#0e0e14] border border-zinc-800 p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-display uppercase text-white border-b border-zinc-800 pb-3">
              {isEn ? '5. Intellectual Property & Applicable Law' : '5. Propriété Intellectuelle & Droit Applicable'}
            </h2>
            <div className="text-xs sm:text-sm font-tech text-zinc-300 space-y-3 leading-relaxed">
              <p>
                {isEn
                  ? 'All content (texts, trademarks, photographs, stunt choreographies, demo videos, 3D structures, source code) is the exclusive property of CHALLENGE EUROPE PRODUCTIONS or duly credited film and audiovisual partners. Any reproduction or representation without prior written consent is strictly prohibited.'
                  : 'L’ensemble des contenus (textes, marques, photographies, chorégraphies d’action, vidéos de démonstration, structures 3D, code source) est la propriété exclusive de CHALLENGE EUROPE PRODUCTIONS ou de ses partenaires cinématographiques et audiovisuels dûment crédités. Toute reproduction, représentation ou diffusion sans accord préalable écrit est formellement interdite.'}
              </p>
              <p className="text-zinc-400">
                {isEn
                  ? 'These notices and any disputes relating to the site are governed by French law. Exclusive jurisdiction is conferred upon the competent courts within the jurisdiction of the registered office.'
                  : 'Les présentes mentions et tout litige relatif au site sont régis par le droit français. Compétence expresse est attribuée aux tribunaux compétents du ressort du siège social, sous réserve des dispositions d’ordre public.'}
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
