import React from 'react';
import Image from 'next/image';
import { Award, FileText } from 'lucide-react';
import type { FooterCertification } from '@/data/navigation';
import { FOOTER_INPUT_CLASS } from './footer-ui';

export interface FooterCertificationCardProps {
    certification?: FooterCertification;
    onChange: (updates: Partial<FooterCertification>) => void;
}

export const FooterCertificationCard: React.FC<FooterCertificationCardProps> = ({
    certification,
    onChange,
}) => {
    const cert = certification || {
        title: 'Organisme Certifié Qualiopi',
        subtitle: 'Actions de formation • Financements AFDAS & OPCO',
        logo_url: '/images/partenaires/qualiopi.png',
        pdf_url:
            'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/document/21452296-CHALLENGE-EUROPE-PRODUCTIONS-Qualiopi.pdf',
        is_visible: true,
    };

    return (
        <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider">
                    <Award className="w-3.5 h-3.5" /> Certification &amp; Qualiopi (Pied de page)
                </div>
                <label className="flex items-center gap-2 text-xs font-mono text-gray-300 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={cert.is_visible !== false}
                        onChange={(e) => onChange({ is_visible: e.target.checked })}
                        className="rounded border-zinc-700 text-[#FFE500] focus:ring-[#FFE500]"
                    />
                    <span>Afficher dans le pied de page</span>
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">
                        Titre du certificat (ex: Organisme Certifié Qualiopi)
                    </label>
                    <input
                        type="text"
                        value={cert.title}
                        onChange={(e) => onChange({ title: e.target.value })}
                        className={FOOTER_INPUT_CLASS}
                    />
                </div>
                <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">
                        Sous-titre (ex: Financements AFDAS &amp; OPCO)
                    </label>
                    <input
                        type="text"
                        value={cert.subtitle}
                        onChange={(e) => onChange({ subtitle: e.target.value })}
                        className={FOOTER_INPUT_CLASS}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-8">
                    <label className="block text-xs font-mono text-gray-400 mb-1">
                        URL de l&apos;image du logo (Qualiopi ou autre)
                    </label>
                    <input
                        type="text"
                        value={cert.logo_url}
                        onChange={(e) => onChange({ logo_url: e.target.value })}
                        placeholder="/images/partenaires/qualiopi.png"
                        className={FOOTER_INPUT_CLASS}
                    />
                </div>
                <div className="md:col-span-4 flex items-center gap-3 bg-black/40 border border-zinc-800 p-2 rounded-lg">
                    {cert.logo_url ? (
                        <div className="relative w-16 h-10 shrink-0 bg-white/5 rounded p-1">
                            <Image
                                src={cert.logo_url}
                                alt="Aperçu logo"
                                fill
                                className="object-contain"
                                sizes="64px"
                                unoptimized
                            />
                        </div>
                    ) : (
                        <div className="w-16 h-10 bg-zinc-800 flex items-center justify-center text-zinc-500 text-[10px]">
                            Aucun
                        </div>
                    )}
                    <span className="text-[11px] font-mono text-zinc-400">Aperçu direct</span>
                </div>
            </div>

            <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">
                    Lien vers le document PDF du certificat (téléchargement / consultation)
                </label>
                <div className="relative">
                    <input
                        type="text"
                        value={cert.pdf_url}
                        onChange={(e) => onChange({ pdf_url: e.target.value })}
                        placeholder="https://..."
                        className={FOOTER_INPUT_CLASS}
                    />
                    {cert.pdf_url && (
                        <a
                            href={cert.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute right-2 top-2 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-white rounded flex items-center gap-1"
                        >
                            <FileText className="w-3 h-3 text-[#FFE500]" /> Tester
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};
