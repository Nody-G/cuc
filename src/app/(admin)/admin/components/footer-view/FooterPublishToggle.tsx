import React from 'react';

export interface FooterPublishToggleProps {
    isPublished: boolean;
    onChange: (value: boolean) => void;
    /** Verrou d'édition en anglais : la publication appartient à la source FR. */
    disabled?: boolean;
}

export const FooterPublishToggle: React.FC<FooterPublishToggleProps> = ({ isPublished, onChange, disabled = false }) => (
    <div className="flex items-center justify-between p-4 rounded-xl bg-[#0D0D12] border border-white/10">
        <div>
            <div className="text-sm font-bold text-white">Publier ce pied de page</div>
            <div className="text-xs text-gray-400">
                Si désactivé, la vitrine conserve le pied de page par défaut.
            </div>
        </div>
        <label className={`relative inline-flex items-center ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
            <input
                type="checkbox"
                checked={isPublished}
                disabled={disabled}
                onChange={(e) => onChange(e.target.checked)}
                className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFE500]"></div>
        </label>
    </div>
);
