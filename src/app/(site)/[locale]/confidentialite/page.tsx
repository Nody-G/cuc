import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { Lock, Eye, CheckCircle2, UserCheck, AlertCircle, Cookie, ExternalLink } from 'lucide-react';
import { SITE_NAME } from '@/lib/seo';
import { CUC_LEGAL_ENTITY } from '@/lib/legal/legal-data';

export async function generateMetadata({
  params,
}: {
  params?: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale = 'fr' } = (await params) ?? { locale: 'fr' };
  const isEn = locale === 'en';

  return {
    title: isEn ? 'Privacy Policy & Cookies (GDPR)' : 'Politique de Confidentialité & RGPD',
    description: isEn
      ? 'Privacy policy, zero-cookie stance, and personal data protection of Campus Univers Cascades (CUC).'
      : 'Politique de protection des données personnelles, politique cookies et respect de la vie privée du Campus Univers Cascades (CUC).',
    robots: { index: true, follow: true },
  };
}

export default async function ConfidentialitePage({
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
          {/* Header */}
          <div className="text-center space-y-4">
            <StuntBadge variant="yellow" icon={<Lock className="w-3.5 h-3.5" />}>
              {isEn ? 'Privacy & Data Protection' : 'Protection de la Vie Privée'}
            </StuntBadge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display uppercase tracking-wide text-white">
              {isEn ? (
                <>
                  Privacy <span className="text-[#FFE500]">Policy</span>
                </>
              ) : (
                <>
                  Politique de <span className="text-[#FFE500]">Confidentialité</span>
                </>
              )}
            </h1>
            <p className="text-xs sm:text-sm font-tech text-zinc-400 max-w-2xl mx-auto">
              {isEn
                ? 'In accordance with the General Data Protection Regulation (GDPR No. 2016/679) and the French Data Protection Act (Loi Informatique et Libertés).'
                : 'Conformément au Règlement Général sur la Protection des Données (RGPD n° 2016/679) et à la loi Informatique et Libertés du 6 janvier 1978 modifiée.'}
            </p>
          </div>

          {/* Section 1 : Responsable de Traitement */}
          <section className="bg-[#0e0e14] border border-zinc-800 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <UserCheck className="w-5 h-5 text-[#FFE500]" />
              <h2 className="text-lg font-display uppercase text-white">
                {isEn ? '1. Data Controller' : '1. Responsable de Traitement'}
              </h2>
            </div>
            <div className="text-xs sm:text-sm font-tech text-zinc-300 space-y-2 leading-relaxed">
              <p>
                {isEn ? (
                  <>
                    The data controller for personal data collected on the <strong>{SITE_NAME}</strong> website is{' '}
                    <strong>{CUC_LEGAL_ENTITY.legalName}</strong> (SIREN : {CUC_LEGAL_ENTITY.siren}), with headquarters at {CUC_LEGAL_ENTITY.headquartersAddress}.
                  </>
                ) : (
                  <>
                    Le responsable du traitement des données collectées sur le site du <strong>{SITE_NAME}</strong> est la structure{' '}
                    <strong>{CUC_LEGAL_ENTITY.legalName}</strong> (SIREN : {CUC_LEGAL_ENTITY.siren}), dont le siège social est situé au {CUC_LEGAL_ENTITY.headquartersAddress}.
                  </>
                )}
              </p>
              <p>
                {isEn ? 'Official contact email:' : 'Courriel du délégué / contact administratif :'}{' '}
                <a href={`mailto:${CUC_LEGAL_ENTITY.email}`} className="text-[#FFE500] underline">
                  {CUC_LEGAL_ENTITY.email}
                </a>.
              </p>
            </div>
          </section>

          {/* Section 2 : Traitements & Finalités */}
          <section className="bg-[#0e0e14] border border-zinc-800 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <Eye className="w-5 h-5 text-[#FFE500]" />
              <h2 className="text-lg font-display uppercase text-white">
                {isEn ? '2. Data Collected, Purposes & Retention' : '2. Données Collectées, Finalités & Durées'}
              </h2>
            </div>
            <div className="text-xs sm:text-sm font-tech text-zinc-300 space-y-4 leading-relaxed">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-zinc-800">
                  <thead>
                    <tr className="bg-[#14141c] text-zinc-200 border-b border-zinc-800 font-mono-tech text-xs">
                      <th className="p-3">{isEn ? 'Activity' : 'Traitement'}</th>
                      <th className="p-3">{isEn ? 'Data collected' : 'Données collectées'}</th>
                      <th className="p-3">{isEn ? 'Legal basis' : 'Base légale'}</th>
                      <th className="p-3">{isEn ? 'Retention' : 'Rétention'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80 text-xs">
                    <tr>
                      <td className="p-3 font-semibold text-white">{isEn ? 'Applications & Admissions' : 'Candidatures & Inscriptions'}</td>
                      <td className="p-3 text-zinc-400">{isEn ? 'Name, email, phone, age, athletic background, motivation' : 'Nom, prénom, e-mail, téléphone, âge, antécédents sportifs/artistiques, message'}</td>
                      <td className="p-3 text-zinc-400">{isEn ? 'Pre-contractual measures (Art. 6.1.b)' : 'Mesures précontractuelles (Art. 6.1.b RGPD)'}</td>
                      <td className="p-3 text-zinc-400">{isEn ? '3 years / 10 years for enrolled students' : '3 ans après dernier contact / 10 ans pour stagiaires inscrits'}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">{isEn ? 'Contact & Project Inquiries' : 'Contact & Demandes de projet'}</td>
                      <td className="p-3 text-zinc-400">{isEn ? 'Name, email, phone, project scope' : 'Nom, e-mail, coordonnées, objet du projet'}</td>
                      <td className="p-3 text-zinc-400">{isEn ? 'Legitimate interest (Art. 6.1.f)' : 'Intérêt légitime (Art. 6.1.f RGPD)'}</td>
                      <td className="p-3 text-zinc-400">3 ans</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">{isEn ? 'Technical Web Vitals' : 'Mesures de vitesse d’affichage'}</td>
                      <td className="p-3 text-zinc-400">{isEn ? 'Anonymous speed metrics (LCP, CLS, INP) — no IP' : 'Métriques anonymes (LCP, CLS, INP) — aucune IP ni identifiant'}</td>
                      <td className="p-3 text-zinc-400">{isEn ? 'CNIL exemption' : 'Intérêt légitime / Exemption CNIL'}</td>
                      <td className="p-3 text-zinc-400">180 jours</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 3 : Politique Cookies & Traceurs */}
          <section className="bg-[#0e0e14] border border-zinc-800 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <Cookie className="w-5 h-5 text-[#FFE500]" />
              <h2 className="text-lg font-display uppercase text-white">
                {isEn ? '3. Cookies & Tracking Policy (« Privacy by Design »)' : '3. Politique Cookies & Traceurs (« Privacy by Design »)'}
              </h2>
            </div>
            <div className="text-xs sm:text-sm font-tech text-zinc-300 space-y-3 leading-relaxed">
              <p>
                {isEn
                  ? 'Campus Univers Cascades strictly respects your digital privacy. Our public showcase operates under an uncompromising "zero advertising tracking" doctrine:'
                  : 'Le Campus Univers Cascades applique une politique stricte de respect de la vie privée. Notre site public applique une doctrine « zéro traceur publicitaire » :'}
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-2">
                <li>
                  <strong className="text-white">{isEn ? 'Zero advertising cookies:' : 'Aucun cookie publicitaire :'}</strong>{' '}
                  {isEn ? 'No profiling, marketing trackers or third-party advertising cookies are used.' : 'Aucun cookie marketing, de profilage ou de re-ciblage tiers n’est déposé.'}
                </li>
                <li>
                  <strong className="text-white">{isEn ? 'No-cookie video embeds:' : 'Vidéos intégrées sans cookies :'}</strong>{' '}
                  {isEn
                    ? 'All video players use the official YouTube no-cookie domain (youtube-nocookie.com), preventing YouTube from tracking your visit.'
                    : 'Les vidéos intégrées utilisent systématiquement le domaine YouTube sans cookie (youtube-nocookie.com), empêchant le suivi de votre navigation.'}
                </li>
                <li>
                  <strong className="text-white">{isEn ? 'Essential technical cookies only:' : 'Cookies techniques indispensables :'}</strong>{' '}
                  {isEn
                    ? 'Limited strictly to language selection (NEXT_LOCALE) and administration session cookies for authenticated staff.'
                    : 'Strictement limités à la mémorisation de votre choix de langue (NEXT_LOCALE) et aux sessions authentifiées du Cockpit d’administration.'}
                </li>
              </ul>
            </div>
          </section>

          {/* Section 4 : Destinataires & Non-Transmission */}
          <section className="bg-[#0e0e14] border border-zinc-800 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <CheckCircle2 className="w-5 h-5 text-[#FFE500]" />
              <h2 className="text-lg font-display uppercase text-white">
                {isEn ? '4. Recipients & No Sale of Data' : '4. Destinataires & Non-Transmission'}
              </h2>
            </div>
            <div className="text-xs sm:text-sm font-tech text-zinc-300 space-y-2 leading-relaxed">
              <p>
                {isEn
                  ? 'Your data is strictly reserved for the management and pedagogical team of Campus Univers Cascades.'
                  : 'Vos données sont strictement réservées à l’usage exclusif de l’équipe de direction et pédagogique du Campus Univers Cascades.'}
              </p>
              <p className="text-zinc-400 font-mono-tech">
                {isEn
                  ? 'CUC never sells, rents or shares any personal data with commercial third parties.'
                  : 'Le CUC ne vend, ne loue et ne cède aucune donnée personnelle à des tiers à des fins commerciales ou publicitaires.'}
              </p>
            </div>
          </section>

          {/* Section 5 : Droits & Recours CNIL */}
          <section className="bg-[#0e0e14] border border-zinc-800 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <AlertCircle className="w-5 h-5 text-[#FFE500]" />
              <h2 className="text-lg font-display uppercase text-white">
                {isEn ? '5. Your Rights & Recourse' : '5. Vos Droits & Exercice'}
              </h2>
            </div>
            <div className="text-xs sm:text-sm font-tech text-zinc-300 space-y-3 leading-relaxed">
              <p>
                {isEn
                  ? 'Pursuant to Articles 15 to 22 of the GDPR, you have the right to access, rectify, delete, restrict, and object to the processing of your personal data.'
                  : 'Conformément aux articles 15 à 22 du RGPD, vous disposez des droits d’accès, de rectification, d’effacement (« droit à l’oubli »), de limitation, d’opposition et de portabilité de vos données.'}
              </p>
              <p>
                {isEn ? 'To exercise these rights, contact:' : 'Pour exercer vos droits, écrivez directement à :'}{' '}
                <a href={`mailto:${CUC_LEGAL_ENTITY.email}`} className="text-[#FFE500] underline">
                  {CUC_LEGAL_ENTITY.email}
                </a>.
              </p>
              <p className="text-xs text-zinc-400 pt-2 border-t border-zinc-800/80">
                {isEn ? (
                  <>
                    If you consider that your rights are not being respected after contacting us, you may lodge a complaint with the French supervisory authority:{' '}
                    <strong>CNIL</strong> (Commission Nationale de l’Informatique et des Libertés —{' '}
                    <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-[#FFE500] underline inline-flex items-center gap-0.5">
                      cnil.fr <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    ).
                  </>
                ) : (
                  <>
                    Si vous estimez que vos droits ne sont pas respectés après nous avoir contactés, vous disposez du droit d’introduire une réclamation auprès de la{' '}
                    <strong>CNIL</strong> (Commission Nationale de l’Informatique et des Libertés —{' '}
                    <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-[#FFE500] underline inline-flex items-center gap-0.5">
                      cnil.fr <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    ).
                  </>
                )}
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
