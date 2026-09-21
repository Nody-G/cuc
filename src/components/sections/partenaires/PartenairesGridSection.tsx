'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ExternalLink, Film, Award } from 'lucide-react';
import { CUC_PARTNERS, Partner } from './partenaires.data';
import { getPartners, SitePartner } from '@/lib/data/site-service';

/**
 * Copie éditoriale d'un partenaire, appariée par NOM (les logos, sites et
 * certificats restent dans les données). Un nom absent du catalogue retombe sur
 * la donnée : jamais de champ vide.
 */
interface PartnerCopy {
  name: string;
  category?: string;
  role?: string;
  description?: string;
}

/**
 * Clés i18n des intitulés de groupes de `partenaires.data` (FR = source).
 * Le libellé FR reste la clé de repli : un groupe non répertorié s'affiche tel
 * quel plutôt que de disparaître.
 */
const CATEGORY_KEYS: Record<string, string> = {
  "Agrément & Certification d'État": 'categories.agrement',
  'Équipementiers & Protections': 'categories.equipementiers',
  'Matériel & Équipement de Tournage': 'categories.materiel',
  'Pédagogie & Cascades Professionnelles': 'categories.pedagogie',
  'Multimédia & Production': 'categories.multimedia',
  'Établissement & Nutrition': 'categories.etablissement',
};

export const PartenairesGridSection: React.FC = () => {
  const t = useTranslations('partenaires');
  const [dbPartners, setDbPartners] = useState<SitePartner[]>([]);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const partnerCopy = t.raw('partners') as PartnerCopy[];

  const copyByName = React.useMemo(
    () => new Map(partnerCopy.map((copy) => [copy.name.toLowerCase().trim(), copy])),
    [partnerCopy]
  );

  /** Rôle, catégorie et description localisés d'un partenaire (donnée en repli). */
  const localized = (partner: Partner) => {
    const copy = copyByName.get(partner.name.toLowerCase().trim());
    return {
      role: copy?.role || partner.role,
      category: copy?.category || partner.category,
      description: copy?.description || partner.description,
    };
  };

  useEffect(() => {
    getPartners().then((parts) => {
      if (parts && parts.length > 0) {
        setDbPartners(parts);
      }
    });
  }, []);

  // Dédupliquer les partenaires du CMS par rapport à CUC_PARTNERS (base certifiée)
  const staticPartnerNames = new Set(
    CUC_PARTNERS.flatMap((group) => group.partners.map((p) => p.name.toLowerCase().trim()))
  );

  const additionalCinemaPartners = dbPartners.filter(
    (p) => p.category === 'cinema' && !staticPartnerNames.has(p.name.toLowerCase().trim())
  );
  const additionalOtherPartners = dbPartners.filter(
    (p) => p.category !== 'cinema' && !staticPartnerNames.has(p.name.toLowerCase().trim())
  );

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Partenaires Cinéma additionnels configurés dans le Cockpit */}
        {additionalCinemaPartners.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <Film className="w-4 h-4 text-[#FFE500]" />
              <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white">
                {t('cinemaHeading')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {additionalCinemaPartners.map((partner) => (
                <div
                  key={partner.id}
                  className="bg-[#0e0e14] border border-zinc-800 hover:border-[#FFE500]/60 p-6 relative group transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-24 w-full bg-white border border-zinc-200 group-hover:border-[#FFE500] mb-4 p-4 flex items-center justify-center overflow-hidden transition-colors rounded-xs">
                      {partner.logo_url && !failedImages[partner.id] ? (
                        <div className="relative w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                          <Image
                            src={partner.logo_url}
                            alt={`Logo ${partner.name}`}
                            fill
                            className="object-contain p-2"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            onError={() => setFailedImages((prev) => ({ ...prev, [partner.id]: true }))}
                          />
                        </div>
                      ) : (
                        <span className="text-base font-display uppercase text-zinc-900 font-bold tracking-wider">{partner.name}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold">
                        {t('productionBadge')}
                      </span>
                    </div>

                    <h3 className="text-lg font-display uppercase text-white mb-2">
                      {partner.name}
                    </h3>

                    {partner.description && (
                      <p className="text-xs font-tech text-zinc-300 leading-relaxed">
                        {partner.description}
                      </p>
                    )}
                  </div>

                  {partner.website_url && (
                    <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-end text-[11px] font-mono-tech text-zinc-500">
                      <a
                        href={partner.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#FFE500] hover:underline flex items-center gap-1 font-bold"
                      >
                        <span>{t('officialSite')}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section Partenaires Additionnels (Équipements, Institutions, Médias) */}
        {additionalOtherPartners.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <Award className="w-4 h-4 text-[#FFE500]" />
              <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white">
                {t('specializedHeading')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {additionalOtherPartners.map((partner) => (
                <div
                  key={partner.id}
                  className="bg-[#0e0e14] border border-zinc-800 hover:border-[#FFE500]/60 p-6 relative group transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-24 w-full bg-white border border-zinc-200 group-hover:border-[#FFE500] mb-4 p-4 flex items-center justify-center overflow-hidden transition-colors rounded-xs">
                      {partner.logo_url && !failedImages[partner.id] ? (
                        <div className="relative w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                          <Image
                            src={partner.logo_url}
                            alt={`Logo ${partner.name}`}
                            fill
                            className="object-contain p-2"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            onError={() => setFailedImages((prev) => ({ ...prev, [partner.id]: true }))}
                          />
                        </div>
                      ) : (
                        <span className="text-base font-display uppercase text-zinc-900 font-bold tracking-wider">{partner.name}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold">
                        {partner.category === 'materiel'
                          ? t('roleMateriel')
                          : partner.category === 'media'
                            ? t('roleMedia')
                            : t('roleInstitutionnel')}
                      </span>
                    </div>

                    <h3 className="text-lg font-display uppercase text-white mb-2">
                      {partner.name}
                    </h3>

                    {partner.description && (
                      <p className="text-xs font-tech text-zinc-300 leading-relaxed">
                        {partner.description}
                      </p>
                    )}
                  </div>

                  {partner.website_url && (
                    <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-end text-[11px] font-mono-tech text-zinc-500">
                      <a
                        href={partner.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#FFE500] hover:underline flex items-center gap-1 font-bold"
                      >
                        <span>{t('officialSite')}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Groupes de partenaires statiques certifiés */}
        {CUC_PARTNERS.map((catGroup, idx) => (
          <div key={idx} className="space-y-6">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              {catGroup.icon}
              <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white">
                {CATEGORY_KEYS[catGroup.category]
                  ? t(CATEGORY_KEYS[catGroup.category])
                  : catGroup.category}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {catGroup.partners.map((partner, pIdx) => (
                <div
                  key={pIdx}
                  className="bg-[#0e0e14] border border-zinc-800 hover:border-[#FFE500]/60 p-6 relative group transition-all flex flex-col justify-between"
                >

                  <div>
                    {/* Logo Box */}
                    <div
                      className={`relative h-28 w-full ${partner.bgVariant === 'light'
                        ? 'bg-white border-zinc-200 shadow-sm group-hover:border-[#FFE500]'
                        : 'bg-black/90 border-zinc-800 group-hover:border-[#FFE500]/60'
                        } mb-5 p-4 flex items-center justify-center overflow-hidden transition-colors`}
                    >
                      <div className="relative w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <Image
                          src={partner.logo}
                          alt={`Logo ${partner.name}`}
                          fill
                          className="object-contain p-2"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold">
                        {localized(partner).role}
                      </span>
                      <span className="text-[10px] font-mono-tech text-zinc-500 uppercase">
                        {localized(partner).category}
                      </span>
                    </div>

                    <h3 className="text-xl font-display uppercase text-white mb-2">
                      {partner.name}
                    </h3>

                    <p className="text-xs font-tech text-zinc-300 leading-relaxed">
                      {localized(partner).description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono-tech text-zinc-500">
                    <span>{partner.featuredCertificate || ''}</span>
                    {partner.website ? (
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#FFE500] hover:underline flex items-center gap-1 font-bold"
                      >
                        <span>{t('website')}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
