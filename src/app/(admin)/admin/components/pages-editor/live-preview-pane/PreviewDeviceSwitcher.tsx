'use client';

import React from 'react';
import { cx } from '@/app/(admin)/admin/components/ui';
import { DEVICE_ICONS, DEVICE_LABELS, DEVICE_WIDTHS, type PreviewDevice } from './preview-devices';

interface PreviewDeviceSwitcherProps {
    device: PreviewDevice;
    onSelectDevice: (device: PreviewDevice) => void;
}

/** Sélecteur d'appareil — seul contrôle conservé en plein écran. */
export const PreviewDeviceSwitcher: React.FC<PreviewDeviceSwitcherProps> = ({
    device,
    onSelectDevice,
}) => (
    <div className="flex items-center gap-1.5">
        {(Object.keys(DEVICE_WIDTHS) as PreviewDevice[]).map((key) => {
            const Icon = DEVICE_ICONS[key];
            const active = device === key;
            return (
                <button
                    key={key}
                    type="button"
                    onClick={() => onSelectDevice(key)}
                    aria-label={`Aperçu ${DEVICE_LABELS[key]}`}
                    aria-pressed={active}
                    title={DEVICE_LABELS[key]}
                    className={cx(
                        'p-2 rounded-lg border transition-colors',
                        active
                            ? 'bg-[#FFE500] text-black border-[#FFE500]'
                            : 'bg-black/40 text-zinc-400 border-white/10 hover:text-white hover:border-white/25'
                    )}
                >
                    <Icon className="w-4 h-4" />
                </button>
            );
        })}
    </div>
);
