import React from 'react';
import { ExternalLink } from 'lucide-react';
import type { NavigationStructure } from '@/data/navigation';
import { NAV_INPUT_CLASS } from './navigation-ui';

export interface NavigationCtaCardProps {
    cta: NavigationStructure['cta'];
    onChange: (updates: Partial<NavigationStructure['cta']>) => void;
}

export const NavigationCtaCard: React.FC<NavigationCtaCardProps> = ({ cta, onChange }) => (
    <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider">
            <ExternalLink className="w-3.5 h-3.5" /> Bouton d'appel à l'action
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Libellé du bouton</label>
                <input
                    type="text"
                    value={cta.label}
                    onChange={(e) => onChange({ label: e.target.value })}
                    className={NAV_INPUT_CLASS}
                />
            </div>
            <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">URL du bouton</label>
                <input
                    type="text"
                    value={cta.href}
                    onChange={(e) => onChange({ href: e.target.value })}
                    className={NAV_INPUT_CLASS}
                />
            </div>
        </div>
    </div>
);
