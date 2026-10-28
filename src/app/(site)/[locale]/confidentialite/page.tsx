import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { Lock, Eye, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react';
import { SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité & RGPD',
  description: 'Politique de protection des données personnelles et respect de la vie privée du Campus Univers Cascades (CUC).',
  robots: { index: true, follow: true },
};

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      <Navbar />

      <main id="contenu-principal" className="flex-grow pt-32 pb-20">
        <div className="page-shell max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <StuntBadge variant="yellow" icon={<Lock className="w-3.5 h-3.5" />}>
              Protection de la Vie Privée
            </StuntBadge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display uppercase tracking-wide text-white">
              Politique de <span className="text-[#FFE500]">Confidentialité</span>
            </h1>
            <p className="text-xs sm:text-sm font-tech text-zinc-400 max-w-2xl mx-auto">
              Conformément au Règlement Général sur la Protection des Données (RGPD n° 2016/679) et à la loi Informatique et Libertés du 6 janvier 1978 modifiée.
            </p>
          </div>

          {/* Section 1 : Responsable & Engagement */}
          <section className="bg-[#0e0e14] border border-zinc-800 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <UserCheck className="w-5 h-5 text-[#FFE500]" />
              <h2 className="text-lg font-display uppercase text-white">1. Responsable de Traitement</h2>
            </div>
            <div className="text-xs sm:text-sm font-tech text-zinc-300 space-y-2 leading-relaxed">
              <p>
                Le responsable du traitement des données collectées sur le site du <strong>{SITE_NAME}</strong> est la société <strong>CHALLENGE EUROPE PRODUCTIONS</strong>, joignable par e-mail à l'adresse : <a href="mailto:contact@campus-universcascades.com" className="text-[#FFE500] underline">contact@campus-universcascades.com</a>.
              </p>
              <p>
                Le CUC s'engage à ce que la collecte et le traitement de vos données personnelles soient transparents, strictement limités aux finalités déclarées et sécurisés.
              </p>
            </div>
          </section>

          {/* Section 2 : Données Collectées & Finalités */}
          <section className="bg-[#0e0e14] border border-zinc-800 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <Eye className="w-5 h-5 text-[#FFE500]" />
              <h2 className="text-lg font-display uppercase text-white">2. Données Collectées, Finalités & Durées</h2>
            </div>
            <div className="text-xs sm:text-sm font-tech text-zinc-300 space-y-4 leading-relaxed">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-zinc-800">
                  <thead>
                    <tr className="bg-[#14141c] text-zinc-200 border-b border-zinc-800 font-mono-tech text-xs">
                      <th className="p-3">Traitement</th>
                      <th className="p-3">Données collectées</th>
                      <th className="p-3">Base légale</th>
                      <th className="p-3">Rétention</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80 text-xs">
                    <tr>
                      <td className="p-3 font-semibold text-white">Candidatures & Inscriptions</td>
                      <td className="p-3 text-zinc-400">Nom, prénom, e-mail, téléphone, antécédents sportifs/artistiques, message</td>
                      <td className="p-3 text-zinc-400">Mesures précontractuelles (Art. 6.1.b RGPD)</td>
                      <td className="p-3 text-zinc-400">3 ans après le dernier contact actif</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Contact & Demandes de projet</td>
                      <td className="p-3 text-zinc-400">Nom, e-mail, coordonnées, objet du projet</td>
                      <td className="p-3 text-zinc-400">Intérêt légitime (Art. 6.1.f RGPD)</td>
                      <td className="p-3 text-zinc-400">3 ans</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Mesures de performance vécue</td>
                      <td className="p-3 text-zinc-400">Métriques de vitesse d'affichage anonymes (LCP, CLS, INP, chemin) — aucune IP ni identifiant</td>
                      <td className="p-3 text-zinc-400">Intérêt légitime / Exemption CNIL</td>
                      <td className="p-3 text-zinc-400">180 jours maximum</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 3 : Destinataires & Absence de Vente */}
          <section className="bg-[#0e0e14] border border-zinc-800 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <CheckCircle2 className="w-5 h-5 text-[#FFE500]" />
              <h2 className="text-lg font-display uppercase text-white">3. Destinataires & Non-Transmission</h2>
            </div>
            <div className="text-xs sm:text-sm font-tech text-zinc-300 space-y-2 leading-relaxed">
              <p>
                Vos données sont strictement réservées à l’usage exclusif de l’équipe de direction et pédagogique du Campus Univers Cascades. 
              </p>
              <p className="text-zinc-400 font-mono-tech">
                Le CUC ne vend, ne loue et ne cède aucune donnée personnelle à des fins commerciales ou publicitaires à des tiers.
              </p>
            </div>
          </section>

          {/* Section 4 : Droits des Utilisateurs */}
          <section className="bg-[#0e0e14] border border-zinc-800 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <AlertCircle className="w-5 h-5 text-[#FFE500]" />
              <h2 className="text-lg font-display uppercase text-white">4. Vos Droits & Exercice</h2>
            </div>
            <div className="text-xs sm:text-sm font-tech text-zinc-300 space-y-3 leading-relaxed">
              <p>
                Conformément aux articles 15 à 22 du RGPD, vous disposez des droits suivants concernant vos données personnelles :
              </p>
              <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
                <li>Droit d'accès et d'obtention d'une copie de vos données ;</li>
                <li>Droit de rectification de données inexactes ou incomplètes ;</li>
                <li>Droit à l'effacement (« droit à l'oubli ») ;</li>
                <li>Droit à la limitation du traitement et droit d'opposition ;</li>
                <li>Droit à la portabilité des données fournies.</li>
              </ul>
              <p>
                Pour exercer l'un de ces droits, contactez directement l'équipe administrative par courriel à : <a href="mailto:contact@campus-universcascades.com" className="text-[#FFE500] underline">contact@campus-universcascades.com</a> en joignant un justificatif d'identité si nécessaire.
              </p>
              <p className="text-xs text-zinc-400">
                Si vous estimez après nous avoir contactés que vos droits ne sont pas respectés, vous avez le droit d’introduire une réclamation auprès de l'autorité de contrôle compétente : la <strong>CNIL</strong> (Commission Nationale de l'Informatique et des Libertés — <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-[#FFE500] underline">cnil.fr</a>).
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
