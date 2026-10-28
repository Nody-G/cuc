import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { Scale, ShieldCheck, Award, FileText } from 'lucide-react';
import { SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Mentions Légales & Agréments',
  description: 'Mentions légales, déclaration d’activité, certification Qualiopi et informations réglementaires du Campus Univers Cascades (CUC).',
  robots: { index: true, follow: true },
};

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      <Navbar />

      <main id="contenu-principal" className="flex-grow pt-32 pb-20">
        <div className="page-shell max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <StuntBadge variant="yellow" icon={<Scale className="w-3.5 h-3.5" />}>
              Réglementation & Transparence
            </StuntBadge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display uppercase tracking-wide text-white">
              Mentions <span className="text-[#FFE500]">Légales</span>
            </h1>
            <p className="text-xs sm:text-sm font-tech text-zinc-400 max-w-2xl mx-auto">
              Conformément aux dispositions de l’article 6-III-1 de la Loi n° 2004-575 du 21 juin 2004 pour la Confiance dans l’Économie Numérique (LCEN) et aux obligations des organismes de formation professionnelle.
            </p>
          </div>

          {/* Section 1 : Éditeur du Site */}
          <section className="bg-[#0e0e14] border border-zinc-800 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <FileText className="w-5 h-5 text-[#FFE500]" />
              <h2 className="text-lg font-display uppercase text-white">1. Éditeur de la Plateforme</h2>
            </div>
            <div className="text-xs sm:text-sm font-tech text-zinc-300 space-y-2 leading-relaxed">
              <p>
                Le site officiel du <strong>{SITE_NAME}</strong> est édité par la société <strong>CHALLENGE EUROPE PRODUCTIONS (CUC)</strong>.
              </p>
              <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
                <li><strong>Dénomination commerciale :</strong> Campus Univers Cascades (CUC)</li>
                <li><strong>Siège d'exploitation / Campus :</strong> Le Cateau-Cambrésis (Hauts-de-France)</li>
                <li><strong>Téléphone du standard :</strong> 01 30 32 38 03</li>
                <li><strong>Courrier électronique :</strong> contact@campus-universcascades.com</li>
                <li><strong>Directeur de la publication :</strong> La Direction Générale du Campus Univers Cascades</li>
              </ul>
            </div>
          </section>

          {/* Section 2 : Formation Professionnelle & Qualiopi */}
          <section className="bg-[#0e0e14] border border-zinc-800 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <Award className="w-5 h-5 text-[#FFE500]" />
              <h2 className="text-lg font-display uppercase text-white">2. Déclaration d’Activité & Certification Qualiopi</h2>
            </div>
            <div className="text-xs sm:text-sm font-tech text-zinc-300 space-y-3 leading-relaxed">
              <p>
                CHALLENGE EUROPE PRODUCTIONS est un organisme de formation professionnelle enregistré auprès de la préfecture de région Hauts-de-France.
              </p>
              <div className="p-3 bg-[#14141c] border-l-2 border-[#FFE500] text-zinc-400 text-xs font-mono-tech">
                « Déclaration d’activité de formation professionnelle enregistrée. Cet enregistrement ne vaut pas agrément de l’État. » (Art. L6352-12 du Code du travail).
              </div>
              <p>
                <strong>Certification Qualiopi :</strong> L'organisme est certifié Qualiopi au titre des <em>Actions de Formation</em>, attestant de la conformité au Référentiel National Qualité pour les financements publics et mutualisés (AFDAS, OPCO, France Travail).
              </p>
              <p>
                <strong>Accueil des Personnes en Situation de Handicap (PSH) :</strong> Le CUC étudie toute demande de formation au cas par cas afin d'adapter les modalités pédagogiques et les infrastructures. Référent handicap joignable à : <a href="mailto:contact@campus-universcascades.com" className="text-[#FFE500] underline">contact@campus-universcascades.com</a>.
              </p>
            </div>
          </section>

          {/* Section 3 : Hébergement */}
          <section className="bg-[#0e0e14] border border-zinc-800 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <ShieldCheck className="w-5 h-5 text-[#FFE500]" />
              <h2 className="text-lg font-display uppercase text-white">3. Hébergement du Site</h2>
            </div>
            <div className="text-xs sm:text-sm font-tech text-zinc-300 space-y-2 leading-relaxed">
              <p>
                Le site est hébergé sur une infrastructure cloud haute disponibilité :
              </p>
              <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
                <li><strong>Hébergeur applicatif :</strong> Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA (Téléphone : +1 559-288-7063).</li>
                <li><strong>Infrastructure de base de données & stockage média :</strong> Supabase Inc., 970 Toa Payoh North #07-04, Singapour 318992 (Datacenter UE Frankfurt, Allemagne).</li>
              </ul>
            </div>
          </section>

          {/* Section 4 : Propriété Intellectuelle & Droits */}
          <section className="bg-[#0e0e14] border border-zinc-800 p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-display uppercase text-white border-b border-zinc-800 pb-3">4. Propriété Intellectuelle</h2>
            <div className="text-xs sm:text-sm font-tech text-zinc-300 space-y-2 leading-relaxed">
              <p>
                L'ensemble des contenus (textes, photographies, vidéos, identité visuelle, structures 3D, code source) est la propriété exclusive de CHALLENGE EUROPE PRODUCTIONS ou de ses partenaires cinématographiques et audiovisuels dûment crédités. Toute reproduction, représentation ou diffusion sans accord préalable écrit est formellement interdite.
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
