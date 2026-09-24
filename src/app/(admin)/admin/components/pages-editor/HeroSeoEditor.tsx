'use client';

import React from 'react';
import type { SitePageContent, SitePageHero } from '@/lib/data/site-service';
import { HeroMetadataEditor } from './hero-editor/HeroMetadataEditor';
import { HeroBannerEditor } from './hero-editor/HeroBannerEditor';
import { HeroHudEditor } from './hero-editor/HeroHudEditor';

interface HeroSeoEditorProps {
  formData: SitePageContent;
  setFormData: React.Dispatch<React.SetStateAction<SitePageContent>>;
  setMediaPickerTarget: (target: string) => void;
}

/**
 * Façade des éditeurs du haut de page : métadonnées (SEO/OpenGraph), bannière
 * d'accroche, puis bandeau technique du hero.
 *
 * Découpage SRP (`AGENTS.md` § 1 et § 2) : ce fichier ne compose que les blocs
 * et normalise les écritures ; chaque bloc vit dans `./hero-editor/**`. Une
 * seule règle d'écriture ici — **fusion immuable**, jamais de remplacement de
 * l'objet `hero` entier (sinon un champ voisin serait perdu).
 */
export const HeroSeoEditor: React.FC<HeroSeoEditorProps> = ({
  formData,
  setFormData,
  setMediaPickerTarget,
}) => {
  const updatePage = (patch: Partial<SitePageContent>) =>
    setFormData((prev) => ({ ...prev, ...patch }));

  const updateHero = (patch: Partial<SitePageHero>) =>
    setFormData((prev) => ({ ...prev, hero: { ...prev.hero, ...patch } }));

  return (
    <div className="space-y-6">
      <HeroMetadataEditor
        formData={formData}
        onChange={updatePage}
        setMediaPickerTarget={setMediaPickerTarget}
      />

      <HeroBannerEditor hero={formData.hero} onChange={updateHero} />

      <HeroHudEditor hero={formData.hero} onChange={updateHero} />
    </div>
  );
};

export default HeroSeoEditor;
