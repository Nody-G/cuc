import React, { type CSSProperties, type KeyboardEvent, type RefObject } from 'react';
import type { OverlayState } from './overlay-model';

export interface TextEditOverlayProps {
    overlay: OverlayState;
    inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
    onBlur: () => void;
    onKeyDown: (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const TextEditOverlay: React.FC<TextEditOverlayProps> = ({
    overlay,
    inputRef,
    onBlur,
    onKeyDown,
}) => {
    const { layout, selection, value, typography, chip, placeholder } = overlay;
    const isTextarea = selection.kind === 'textarea';
    const hint = isTextarea
        ? 'Ctrl+Entrée valider · Tab champ suivant · Échap annuler'
        : 'Entrée valider · Tab champ suivant · Échap annuler';

    // La typographie vient de l'élément édité : la saisie se superpose au rendu
    // réel sans le trahir (mêmes police, corps, graisse, casse, alignement).
    const fieldStyle = typography as CSSProperties;

    return (
        <div
            data-cuc-edit-overlay=""
            style={{
                position: 'fixed',
                left: layout.left,
                top: layout.top,
                width: Math.max(layout.width, 180),
                zIndex: 2147483000,
            }}
        >
            <div className="mb-1.5 inline-flex items-center gap-2 bg-black/90 border border-[#FFE500]/60 px-2 py-1 font-mono text-[10px] uppercase tracking-wider">
                <span className="text-[#FFE500]">{chip}</span>
                <span className="text-zinc-500">{selection.kind}</span>
            </div>

            <div className="relative border-2 border-[#FFE500] bg-[#0D0D12]/95 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
                {isTextarea ? (
                    <textarea
                        ref={(node) => {
                            inputRef.current = node;
                        }}
                        defaultValue={value}
                        placeholder={placeholder}
                        onBlur={onBlur}
                        onKeyDown={onKeyDown}
                        rows={3}
                        style={fieldStyle}
                        className="block min-h-[4.5rem] w-full"
                    />
                ) : (
                    <input
                        ref={(node) => {
                            inputRef.current = node;
                        }}
                        defaultValue={value}
                        placeholder={placeholder}
                        onBlur={onBlur}
                        onKeyDown={onKeyDown}
                        style={fieldStyle}
                        className="block w-full"
                    />
                )}
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {value.length === 0 && (
                    <span className="inline-flex bg-[#FFE500]/15 border border-[#FFE500]/50 text-[10px] font-mono text-[#FFE500] px-2 py-1">
                        vide → repli traduit affiché
                    </span>
                )}
                <span className="inline-flex bg-black/85 border border-white/15 text-[10px] font-mono text-zinc-300 px-2 py-1">
                    {hint}
                </span>
            </div>
        </div>
    );
};
