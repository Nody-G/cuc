'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Briefcase,
  GraduationCap,
  KeyRound,
  RefreshCw,
  Copy,
} from 'lucide-react';
import { listCockpitUsers, updateUserRole } from '@/app/admin/actions';

interface CockpitUser {
  id: string;
  email: string;
  full_name: string | null;
  first_name?: string | null;
  last_name?: string | null;
  role: string;
  created_at: string;
  updated_at?: string;
}

interface UsersRolesViewProps {
  showToast: (msg: string) => void;
  currentUserRole?: string;
}

export const UsersRolesView: React.FC<UsersRolesViewProps> = ({
  showToast,
  currentUserRole = 'admin',
}) => {
  const [users, setUsers] = useState<CockpitUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await listCockpitUsers();
    setLoading(false);
    if (res.success && res.users) {
      setUsers(res.users as CockpitUser[]);
    } else {
      showToast(`Erreur chargement utilisateurs: ${res.error}`);
    }
  };

  useEffect(() => {
    let isMounted = true;
    listCockpitUsers().then((res) => {
      if (!isMounted) return;
      setLoading(false);
      if (res.success && res.users) {
        setUsers(res.users as CockpitUser[]);
      } else {
        showToast(`Erreur chargement utilisateurs: ${res.error}`);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [showToast]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingUserId(userId);
    const res = await updateUserRole(userId, newRole);
    setUpdatingUserId(null);

    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      showToast(`Rôle mis à jour avec succès (${newRole})`);
    } else {
      showToast(`Erreur : ${res.error}`);
    }
  };

  const copyLoginLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/admin/login`;
      navigator.clipboard.writeText(url);
      showToast("Lien d'accès au Cockpit copié dans le presse-papier !");
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'directeur':
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase font-black bg-[#FFE500] text-black shadow-xs shadow-yellow-500/20">
            Directeur
          </span>
        );
      case 'admin':
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Admin Système
          </span>
        );
      case 'secretaire':
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Secrétariat
          </span>
        );
      case 'coach':
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Coach / Formateur
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase font-black bg-white/10 text-gray-400">
            {role}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
            <Shield className="w-3.5 h-3.5" /> Sécurité &amp; Droits d&apos;Accès
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
            Gestion des Utilisateurs &amp; Rôles
          </h1>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <p className="text-sm text-gray-400">
              Contrôlez les accès accordés à chaque membre de l&apos;équipe du campus (Direction, Secrétariat, Formateurs).
            </p>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span>Votre session :</span>
              {getRoleBadge(currentUserRole)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyLoginLink}
            className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 flex items-center gap-2 transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-[#FFE500]" />
            <span>Copier l&apos;URL de connexion</span>
          </button>

          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#FFE500]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Explication synthétique des Rôles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#0D0D12] border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase font-bold">
            <KeyRound className="w-4 h-4" /> Direction &amp; Administration
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Contrôle total du site vitrine, réorganisation des sections, paramètres globaux, gestion des collaborateurs et audit.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0D0D12] border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-blue-400 uppercase font-bold">
            <Briefcase className="w-4 h-4" /> Secrétariat
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Gestion simplifiée du quotidien : sessions de stages, quotas de places, bandeaux d&apos;alertes urgentes et textes de présentation.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0D0D12] border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase font-bold">
            <GraduationCap className="w-4 h-4" /> Coachs &amp; Formateurs
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Accès ciblé à leur propre fiche biographique, filmographie associée et suivi des sessions encadrées.
          </p>
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="bg-[#0D0D12] border border-white/10 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="text-xs font-mono text-gray-400 uppercase tracking-wider">
            Collaborateurs enregistrés ({users.length})
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#FFE500] mx-auto" />
            <p>Chargement des utilisateurs...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400">
            Aucun collaborateur trouvé.
          </div>
        ) : (
          <div className="divide-y divide-white/5 overflow-x-auto">
            {users.map((u) => {
              const displayName = u.full_name || [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Utilisateur CUC';
              const isUpdating = updatingUserId === u.id;

              return (
                <div
                  key={u.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center text-sm font-black text-[#FFE500] uppercase">
                      {displayName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white uppercase tracking-tight">
                          {displayName}
                        </span>
                        {getRoleBadge(u.role)}
                      </div>
                      <div className="text-xs font-mono text-gray-400 mt-0.5">
                        {u.email}
                      </div>
                    </div>
                  </div>

                  {/* Sélecteur de rôle */}
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-gray-400 hidden md:block">
                      Changer le rôle :
                    </div>
                    <select
                      value={u.role}
                      disabled={isUpdating}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="bg-black/80 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFE500] disabled:opacity-50"
                    >
                      <option value="directeur">Directeur</option>
                      <option value="admin">Administrateur</option>
                      <option value="secretaire">Secrétariat</option>
                      <option value="coach">Coach / Instructeur</option>
                      <option value="student">Élève (sans accès cockpit)</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
