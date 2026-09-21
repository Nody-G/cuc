'use client';

import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { SitePageContent } from '@/lib/data/site-service';

interface HomePageEditorProps {
    formData: SitePageContent;
    setFormData: React.Dispatch<React.SetStateAction<SitePageContent>>;
    setMediaPickerTarget: (target: string) => void;
}

/** En-tête de bloc réutilisable (défini hors rendu pour rester stable). */
const BlockHeader: React.FC<{ title: string; desc: string; tag: string }> = ({
    title,
    desc,
    tag,
}) => (
    <div className="border-b border-white/10 pb-3 flex items-center justify-between">
        <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
            <p className="text-xs text-gray-400">{desc}</p>
        </div>
        <span className="text-[10px] font-mono text-[#FFE500] px-2 py-0.5 rounded bg-white/5 border border-white/10">
            {tag}
        </span>
    </div>
);

/**
 * Éditeur des blocs de contenu de la page d'accueil.
 *
 * Couvre les six blocs `sections_data` historiquement codés en dur :
 * `about`, `tournages`, `virtual_tour`, `qualiopi`, `partners`, `social`.
 * Chaque champ est persisté dans `site_pages.sections_data` via le
 * formulaire parent (`PagesEditorView`).
 */
export const HomePageEditor: React.FC<HomePageEditorProps> = ({
    formData,
    setFormData,
    setMediaPickerTarget,
}) => {
    const data = formData.sections_data || {};

    /** Met à jour une clé d'un bloc `sections_data` donné. */
    const updateBlock = (block: string, key: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            sections_data: {
                ...(prev.sections_data || {}),
                [block]: {
                    ...((prev.sections_data || {})[block] || {}),
                    [key]: value,
                },
            },
        }));
    };

    const inputClass =
        'w-full bg-black/60 border border-white/20 rounded px-3 py-2 text-xs text-white focus:border-[#FFE500] focus:outline-none';
    const labelClass = 'block text-xs font-mono text-gray-400 mb-1';

    /**
     * Attribut d'édition inline : permet à l'aperçu live de retrouver l'input
     * correspondant lorsqu'un élément est cliqué dans l'iframe.
     */
    const fieldAttr = (block: string, key: string) => ({
        'data-cuc-field': `sections_data.${block}.${key}`,
    });

    return (
        <div className="space-y-6">
            {/* BLOC 1 : PRÉSENTATION & FONDATEUR */}
            <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-4">
                <BlockHeader
                    title="Présentation & Fondateur"
                    desc="Dossier de présentation, citation du fondateur et visuel du campus."
                    tag="about"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Surtitre (Tag)</label>
                        <input
                            type="text"
                            value={data.about?.tag || ''}
                            onChange={(e) => updateBlock('about', 'tag', e.target.value)}
                            className={inputClass}
                            {...fieldAttr('about', 'tag')}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Sous-titre (Subtag)</label>
                        <input
                            type="text"
                            value={data.about?.subtag || ''}
                            onChange={(e) => updateBlock('about', 'subtag', e.target.value)}
                            className={inputClass}
                            {...fieldAttr('about', 'subtag')}
                        />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Titre de section</label>
                    <input
                        type="text"
                        value={data.about?.title || ''}
                        onChange={(e) => updateBlock('about', 'title', e.target.value)}
                        className={inputClass}
                        {...fieldAttr('about', 'title')}
                    />
                </div>

                <div>
                    <label className={labelClass}>Description</label>
                    <textarea
                        rows={3}
                        value={data.about?.description || ''}
                        onChange={(e) => updateBlock('about', 'description', e.target.value)}
                        className={inputClass}
                        {...fieldAttr('about', 'description')}
                    />
                </div>

                <div>
                    <label className={labelClass}>Citation du fondateur</label>
                    <textarea
                        rows={2}
                        value={data.about?.founder_quote || ''}
                        onChange={(e) => updateBlock('about', 'founder_quote', e.target.value)}
                        className={inputClass}
                        {...fieldAttr('about', 'founder_quote')}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className={labelClass}>Nom du fondateur</label>
                        <input
                            type="text"
                            value={data.about?.founder_name || ''}
                            onChange={(e) => updateBlock('about', 'founder_name', e.target.value)}
                            className={inputClass}
                            {...fieldAttr('about', 'founder_name')}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Rôle du fondateur</label>
                        <input
                            type="text"
                            value={data.about?.founder_role || ''}
                            onChange={(e) => updateBlock('about', 'founder_role', e.target.value)}
                            className={inputClass}
                            {...fieldAttr('about', 'founder_role')}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Badge année</label>
                        <input
                            type="text"
                            value={data.about?.badge_year || ''}
                            onChange={(e) => updateBlock('about', 'badge_year', e.target.value)}
                            className={inputClass}
                            {...fieldAttr('about', 'badge_year')}
                        />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Image de présentation</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={data.about?.image_url || ''}
                            onChange={(e) => updateBlock('about', 'image_url', e.target.value)}
                            className={inputClass}
                        />
                        <button
                            type="button"
                            onClick={() => setMediaPickerTarget('sections_data.about.image_url')}
                            className="shrink-0 p-2 rounded bg-white/10 text-white hover:bg-white/20"
                            title="Choisir dans la médiathèque"
                        >
                            <ImageIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Bouton principal — libellé</label>
                        <input
                            type="text"
                            value={data.about?.cta_primary_text || ''}
                            onChange={(e) => updateBlock('about', 'cta_primary_text', e.target.value)}
                            className={inputClass}
                            {...fieldAttr('about', 'cta_primary_text')}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Bouton principal — lien</label>
                        <input
                            type="text"
                            value={data.about?.cta_primary_link || ''}
                            onChange={(e) => updateBlock('about', 'cta_primary_link', e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Bouton secondaire — libellé</label>
                        <input
                            type="text"
                            value={data.about?.cta_secondary_text || ''}
                            onChange={(e) => updateBlock('about', 'cta_secondary_text', e.target.value)}
                            className={inputClass}
                            {...fieldAttr('about', 'cta_secondary_text')}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Bouton secondaire — lien</label>
                        <input
                            type="text"
                            value={data.about?.cta_secondary_link || ''}
                            onChange={(e) => updateBlock('about', 'cta_secondary_link', e.target.value)}
                            className={inputClass}
                        />
                    </div>
                </div>
            </div>

            {/* BLOC 2 : TOURNAGES & PRODUCTIONS */}
            <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-4">
                <BlockHeader
                    title="Tournages & Productions Cinéma"
                    desc="Bandeau de présentation de l'activité de coordination de cascades."
                    tag="tournages"
                />

                <div>
                    <label className={labelClass}>Badge</label>
                    <input
                        type="text"
                        value={data.tournages?.badge || ''}
                        onChange={(e) => updateBlock('tournages', 'badge', e.target.value)}
                        className={inputClass}
                        {...fieldAttr('tournages', 'badge')}
                    />
                </div>
                <div>
                    <label className={labelClass}>Titre</label>
                    <input
                        type="text"
                        value={data.tournages?.title || ''}
                        onChange={(e) => updateBlock('tournages', 'title', e.target.value)}
                        className={inputClass}
                        {...fieldAttr('tournages', 'title')}
                    />
                </div>
                <div>
                    <label className={labelClass}>Sous-titre</label>
                    <textarea
                        rows={2}
                        value={data.tournages?.subtitle || ''}
                        onChange={(e) => updateBlock('tournages', 'subtitle', e.target.value)}
                        className={inputClass}
                        {...fieldAttr('tournages', 'subtitle')}
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Bouton — libellé</label>
                        <input
                            type="text"
                            value={data.tournages?.cta_text || ''}
                            onChange={(e) => updateBlock('tournages', 'cta_text', e.target.value)}
                            className={inputClass}
                            {...fieldAttr('tournages', 'cta_text')}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Bouton — lien</label>
                        <input
                            type="text"
                            value={data.tournages?.cta_link || ''}
                            onChange={(e) => updateBlock('tournages', 'cta_link', e.target.value)}
                            className={inputClass}
                        />
                    </div>
                </div>
            </div>

            {/* BLOC 3 : VISITE VIRTUELLE */}
            <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-4">
                <BlockHeader
                    title="Visite Virtuelle 360°"
                    desc="Bloc d'appel à l'exploration immersive du campus."
                    tag="virtual_tour"
                />

                <div>
                    <label className={labelClass}>Badge</label>
                    <input
                        type="text"
                        value={data.virtual_tour?.badge || ''}
                        onChange={(e) => updateBlock('virtual_tour', 'badge', e.target.value)}
                        className={inputClass}
                        {...fieldAttr('virtual_tour', 'badge')}
                    />
                </div>
                <div>
                    <label className={labelClass}>Titre</label>
                    <input
                        type="text"
                        value={data.virtual_tour?.title || ''}
                        onChange={(e) => updateBlock('virtual_tour', 'title', e.target.value)}
                        className={inputClass}
                        {...fieldAttr('virtual_tour', 'title')}
                    />
                </div>
                <div>
                    <label className={labelClass}>Sous-titre</label>
                    <textarea
                        rows={2}
                        value={data.virtual_tour?.subtitle || ''}
                        onChange={(e) => updateBlock('virtual_tour', 'subtitle', e.target.value)}
                        className={inputClass}
                        {...fieldAttr('virtual_tour', 'subtitle')}
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Bouton — libellé</label>
                        <input
                            type="text"
                            value={data.virtual_tour?.cta_text || ''}
                            onChange={(e) => updateBlock('virtual_tour', 'cta_text', e.target.value)}
                            className={inputClass}
                            {...fieldAttr('virtual_tour', 'cta_text')}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Bouton — lien</label>
                        <input
                            type="text"
                            value={data.virtual_tour?.cta_link || ''}
                            onChange={(e) => updateBlock('virtual_tour', 'cta_link', e.target.value)}
                            className={inputClass}
                        />
                    </div>
                </div>
            </div>

            {/* BLOC 4 : QUALIOPI & FINANCEMENTS */}
            <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-4">
                <BlockHeader
                    title="Certification Qualiopi & Financements"
                    desc="Bandeau d'information sur les dispositifs de prise en charge."
                    tag="qualiopi"
                />

                <div>
                    <label className={labelClass}>Badge</label>
                    <input
                        type="text"
                        value={data.qualiopi?.badge || ''}
                        onChange={(e) => updateBlock('qualiopi', 'badge', e.target.value)}
                        className={inputClass}
                        {...fieldAttr('qualiopi', 'badge')}
                    />
                </div>
                <div>
                    <label className={labelClass}>Titre</label>
                    <input
                        type="text"
                        value={data.qualiopi?.title || ''}
                        onChange={(e) => updateBlock('qualiopi', 'title', e.target.value)}
                        className={inputClass}
                        {...fieldAttr('qualiopi', 'title')}
                    />
                </div>
                <div>
                    <label className={labelClass}>Sous-titre</label>
                    <textarea
                        rows={2}
                        value={data.qualiopi?.subtitle || ''}
                        onChange={(e) => updateBlock('qualiopi', 'subtitle', e.target.value)}
                        className={inputClass}
                        {...fieldAttr('qualiopi', 'subtitle')}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>AFDAS — badge</label>
                        <input
                            type="text"
                            value={data.qualiopi?.afdas_badge || ''}
                            onChange={(e) => updateBlock('qualiopi', 'afdas_badge', e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>AFDAS — texte</label>
                        <input
                            type="text"
                            value={data.qualiopi?.afdas_text || ''}
                            onChange={(e) => updateBlock('qualiopi', 'afdas_text', e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>France Travail — badge</label>
                        <input
                            type="text"
                            value={data.qualiopi?.france_travail_badge || ''}
                            onChange={(e) => updateBlock('qualiopi', 'france_travail_badge', e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>France Travail — texte</label>
                        <input
                            type="text"
                            value={data.qualiopi?.france_travail_text || ''}
                            onChange={(e) => updateBlock('qualiopi', 'france_travail_text', e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>OPCO — badge</label>
                        <input
                            type="text"
                            value={data.qualiopi?.opco_badge || ''}
                            onChange={(e) => updateBlock('qualiopi', 'opco_badge', e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>OPCO — texte</label>
                        <input
                            type="text"
                            value={data.qualiopi?.opco_text || ''}
                            onChange={(e) => updateBlock('qualiopi', 'opco_text', e.target.value)}
                            className={inputClass}
                        />
                    </div>
                </div>
            </div>

            {/* BLOC 5 : PARTENAIRES */}
            <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-4">
                <BlockHeader
                    title="Partenaires & Studios"
                    desc="Bandeau de confiance affichant les collaborations du campus."
                    tag="partners"
                />

                <div>
                    <label className={labelClass}>Badge</label>
                    <input
                        type="text"
                        value={data.partners?.badge || ''}
                        onChange={(e) => updateBlock('partners', 'badge', e.target.value)}
                        className={inputClass}
                        {...fieldAttr('partners', 'badge')}
                    />
                </div>
                <div>
                    <label className={labelClass}>Titre</label>
                    <input
                        type="text"
                        value={data.partners?.title || ''}
                        onChange={(e) => updateBlock('partners', 'title', e.target.value)}
                        className={inputClass}
                        {...fieldAttr('partners', 'title')}
                    />
                </div>
                <div>
                    <label className={labelClass}>Sous-titre</label>
                    <textarea
                        rows={2}
                        value={data.partners?.subtitle || ''}
                        onChange={(e) => updateBlock('partners', 'subtitle', e.target.value)}
                        className={inputClass}
                        {...fieldAttr('partners', 'subtitle')}
                    />
                </div>
            </div>

            {/* BLOC 6 : RÉSEAUX SOCIAUX */}
            <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-4">
                <BlockHeader
                    title="Réseaux Sociaux & Communauté"
                    desc="Textes du bloc de communauté. Les liens eux-mêmes se gèrent dans « Réseaux Sociaux »."
                    tag="social"
                />

                <div>
                    <label className={labelClass}>Badge</label>
                    <input
                        type="text"
                        value={data.social?.badge || ''}
                        onChange={(e) => updateBlock('social', 'badge', e.target.value)}
                        className={inputClass}
                        {...fieldAttr('social', 'badge')}
                    />
                </div>
                <div>
                    <label className={labelClass}>Titre</label>
                    <input
                        type="text"
                        value={data.social?.title || ''}
                        onChange={(e) => updateBlock('social', 'title', e.target.value)}
                        className={inputClass}
                        {...fieldAttr('social', 'title')}
                    />
                </div>
                <div>
                    <label className={labelClass}>Sous-titre</label>
                    <textarea
                        rows={2}
                        value={data.social?.subtitle || ''}
                        onChange={(e) => updateBlock('social', 'subtitle', e.target.value)}
                        className={inputClass}
                        {...fieldAttr('social', 'subtitle')}
                    />
                </div>
            </div>
        </div>
    );
};
