import React from 'react';
import { LogOut, Shield } from 'lucide-react';

export interface SidebarFooterProps {
    userName: string;
    userRole: string;
    onLogout: () => void;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({ userName, userRole, onLogout }) => (
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

        <div className="flex items-center justify-between pt-1 border-t border-white/5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500">
                <Shield className="w-3.5 h-3.5 text-[#FFE500]" />
                <span>CUC Secure</span>
            </div>
            <button
                type="button"
                onClick={onLogout}
                title="Se déconnecter du Cockpit"
                className="flex items-center gap-1 text-[10px] font-mono text-gray-400 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-white/5"
            >
                <LogOut className="w-3 h-3" />
                <span>Déconnexion</span>
            </button>
        </div>
    </div>
);
