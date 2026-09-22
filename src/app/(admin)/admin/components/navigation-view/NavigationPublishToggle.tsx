import React from 'react';

export interface NavigationPublishToggleProps {
    isPublished: boolean;
    onChange: (value: boolean) => void;
}

export const NavigationPublishToggle: React.FC<NavigationPublishToggleProps> = ({
    isPublished,
    onChange,
}) => (
    <div className="flex items-center justify-between p-4 rounded-xl bg-[#0D0D12] border border-white/10">
        <div>
            <div className="text-sm font-bold text-white">Publier cette navigation</div>
            <div className="text-xs text-gray-400">
                Si désactivé, la vitrine conserve la navigation par défaut.
            </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => onChange(e.target.checked)}
                className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFE500]"></div>
        </label>
    </div>
);
