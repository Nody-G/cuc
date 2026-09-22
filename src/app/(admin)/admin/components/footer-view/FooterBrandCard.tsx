import React from 'react';
import { Building2 } from 'lucide-react';
import type { FooterBrand } from '@/data/navigation';
import { FOOTER_INPUT_CLASS } from './footer-ui';

export interface FooterBrandCardProps {
    brand: FooterBrand;
    onChange: (updates: Partial<FooterBrand>) => void;
}

export const FooterBrandCard: React.FC<FooterBrandCardProps> = ({ brand, onChange }) => (
    <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" /> Identité de marque
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Nom affiché</label>
                <input
                    type="text"
                    value={brand.name}
                    onChange={(e) => onChange({ name: e.target.value })}
                    className={FOOTER_INPUT_CLASS}
                />
            </div>
            <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Accroche</label>
                <input
                    type="text"
                    value={brand.tagline}
                    onChange={(e) => onChange({ tagline: e.target.value })}
                    className={FOOTER_INPUT_CLASS}
                />
            </div>
        </div>
        <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">Description</label>
            <textarea
                rows={3}
                value={brand.description}
                onChange={(e) => onChange({ description: e.target.value })}
                className={FOOTER_INPUT_CLASS}
            />
        </div>
    </div>
);
