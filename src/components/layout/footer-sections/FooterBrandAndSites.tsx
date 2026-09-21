'use client';
import { Link } from '@/i18n/navigation';

import React from 'react';

import Image from 'next/image';
import { ExternalLink, Compass, Navigation, MapPin } from 'lucide-react';
import { useFooter } from '@/lib/hooks/useNavigation';

/**
 * Bloc marque + implantations du pied de page.
 * Le nom, la signature et la description proviennent de `site_footer`
 * (fallback `DEFAULT_FOOTER`, zéro régression).
 */
export const FooterBrandAndSites: React.FC = () => {
  const { brand } = useFooter();

  return (
    <>
      {/* Brand & Mission */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
            <Image
              src="/images/logos/cuc-logo-yellow.png"
              alt="Logo Campus Univers Cascades"
              width={48}
              height={48}
              className="object-contain drop-shadow-[0_0_10px_rgba(255,229,0,0.35)]"
            />
          </div>
          <div>
            <span className="font-display text-xl font-bold text-white tracking-wider block">
              {brand.name}
            </span>
            <span className="text-[10px] font-mono-tech text-zinc-500 uppercase">
              {brand.tagline}
            </span>
          </div>
        </div>

        <p className="text-xs text-zinc-400 font-tech leading-relaxed">
          {brand.description}
        </p>

        <div className="pt-2 space-y-2">
          <a
            href="https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/document/21452296-CHALLENGE-EUROPE-PRODUCTIONS-Qualiopi.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2.5 bg-[#101017] hover:bg-[#161622] border border-zinc-800 hover:border-[#FFE500]/50 transition-colors group"
            title="Voir le certificat Qualiopi"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative w-16 h-8 shrink-0">
                <Image
                  src="/images/partenaires/qualiopi.png"
                  alt="Logo Qualiopi"
                  fill
                  className="object-contain"
                  sizes="64px"
                />
              </div>
              <div>
                <span className="text-[11px] font-mono-tech text-white group-hover:text-[#FFE500] font-bold block">
                  Organisme Certifié Qualiopi
                </span>
                <span className="text-[10px] text-zinc-500 font-tech">
                  Prise en charge AFDAS &amp; CPF 100%
                </span>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-600 group-hover:text-[#FFE500]" />
          </a>

          <Link
            href="/visite-virtuelle"
            className="flex items-center justify-between text-xs font-mono-tech text-zinc-300 hover:text-[#FFE500] bg-[#101017] p-2.5 border border-zinc-800 hover:border-[#FFE500]/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#FFE500]" />
              <span>Visite Virtuelle 360° du Campus</span>
            </div>
            <span className="text-[10px] bg-[#FFE500] text-black px-1.5 font-bold">
              360°
            </span>
          </Link>
        </div>
      </div>

      {/* Adresses & Implantations */}
      <div className="space-y-3">
        <h4 className="text-base font-display uppercase tracking-wider text-white border-b border-zinc-800 pb-2">
          Nos Implantations
        </h4>

        <div className="space-y-3 text-xs font-tech">
          <div className="p-2.5 bg-[#101016] border border-zinc-800/80 hover:border-[#FFE500]/50 transition-colors">
            <div>
              <strong className="text-[#FFE500] font-mono-tech block">
                CAMPUS PRINCIPAL :
              </strong>
            </div>
            <p className="text-zinc-300 mt-0.5">
              Domaine CUC, 59360 Le Cateau-Cambrésis
              <br />
              <span className="text-zinc-500">
                Hauts-de-France (1h40 de Paris / 1h de Lille)
              </span>
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Link
                href="/contact-cuc#campus-map-hub"
                className="text-[10px] font-mono-tech text-[#FFE500] hover:underline flex items-center gap-1"
              >
                <Compass className="w-3 h-3" />
                <span>Carte &amp; Accès</span>
              </Link>
              <span className="text-zinc-600">•</span>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=50.0909,3.5374"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono-tech text-zinc-400 hover:text-white flex items-center gap-1"
              >
                <Navigation className="w-3 h-3 text-[#FFE500]" />
                <span>Itinéraire GPS</span>
              </a>
            </div>
          </div>

          <div className="p-2.5 bg-[#101016] border border-zinc-800/80 hover:border-zinc-700 transition-colors">
            <strong className="text-[#FFE500] font-mono-tech block">
              PÔLE ÎLE-DE-FRANCE :
            </strong>
            <p className="text-zinc-300 mt-0.5">
              Studio de Répétition &amp; Préparation Comédiens
              <br />
              <span className="text-zinc-500">
                92230 Gennevilliers (Région Parisienne)
              </span>
            </p>
            <div className="mt-1.5">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Gennevilliers+92230"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono-tech text-zinc-400 hover:text-[#FFE500] flex items-center gap-1"
              >
                <MapPin className="w-3 h-3 text-[#FFE500]" />
                <span>Localiser sur Maps</span>
              </a>
            </div>
          </div>

          <div className="pt-1 text-zinc-400">
            <strong className="text-zinc-400 font-mono-tech block text-[11px]">
              AGENCE DE PRODUCTION :
            </strong>
            <p className="text-zinc-500 mt-0.5 text-[11px]">
              CUC PROD • Société de production cinéma &amp; spectacle vivant
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
