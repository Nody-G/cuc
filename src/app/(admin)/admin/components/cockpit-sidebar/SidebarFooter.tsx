import React from 'react';
import { LogOut, KeyRound } from 'lucide-react';

export interface SidebarFooterProps {
    userName: string;
    userRole: string;
    onLogout: () => void;
    onOpenChangePassword?: () => void;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
    userName,
    userRole,
    onLogout,
    onOpenChangePassword,
}) => (
    <div className="p-4 border-t border-white/10 bg-black/40 text-xs text-gray-400 space-y-3">
        <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFE500]/10 border border-[#FFE500]/30 flex items-center justify-center text-xs font-black text-[#FFE500] uppercase">
                {userName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">{userName}</div>
                <div className="text-[10px] font-mono text-[#FFE500] uppercase font-semibold">
                    {userRole}
                </div>
            </div>
        </div>

        <div className="pt-1 border-t border-white/5 space-y-1">
            {onOpenChangePassword && (
                <button
                    type="button"
                    onClick={onOpenChangePassword}
                    title="Changer mon mot de passe"
                    className="w-full flex items-center justify-center gap-1.5 text-[11px] font-mono text-gray-400 hover:text-[#FFE500] transition-colors py-1 px-2 rounded hover:bg-white/5"
                >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Mot de passe</span>
                </button>
            )}
            <button
                type="button"
                onClick={onLogout}
                title="Se déconnecter du Cockpit"
                className="w-full flex items-center justify-center gap-1.5 text-[11px] font-mono text-gray-400 hover:text-red-400 transition-colors py-1 px-2 rounded hover:bg-white/5"
            >
                <LogOut className="w-3.5 h-3.5" />
                <span>Déconnexion</span>
            </button>
        </div>
    </div>
);
