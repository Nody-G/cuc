import React from 'react';
import type { ListCommand, ListState } from './overlay-model';

export interface ListCommandOverlayProps {
    list: ListState;
    onCommand: (command: ListCommand) => void;
}

export const ListCommandOverlay: React.FC<ListCommandOverlayProps> = ({ list, onCommand }) => {
    const listCommandButton = (label: string, command: ListCommand) => (
        <button
            key={command}
            type="button"
            title={label}
            onClick={() => onCommand(command)}
            className="bg-[#FFE500] text-black font-mono-tech text-[11px] font-bold px-2.5 py-1.5 border border-black/40 hover:opacity-90 transition-opacity"
        >
            {label}
        </button>
    );

    return (
        <div
            data-cuc-list-overlay=""
            style={{
                position: 'fixed',
                left: list.layout.left,
                top: list.layout.top,
                zIndex: 2147483000,
            }}
            className="flex items-center gap-1 bg-black/85 p-1"
        >
            {listCommandButton('Monter', 'move-up')}
            {listCommandButton('Descendre', 'move-down')}
            {listCommandButton('Dupliquer', 'duplicate')}
            {listCommandButton('Ajouter', 'add')}
            {listCommandButton('Supprimer', 'remove')}
        </div>
    );
};
