'use client';

/**
 * Onglet « Comptes & Accès » — coquille de présentation.
 *
 * Couche `UI / Présentation` (`AGENTS.md` § 1) : aucune requête réseau ici.
 * Données et mutations viennent de `useUsersRolesEditor`, l'affichage des
 * atomes de `users-view/`.
 */

import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { CockpitCard, CockpitEmptyState, CockpitSkeletonList } from './ui';
import {
  isUserManagerRole,
  type CockpitRole,
  type CockpitUser,
  type InviteUserResult,
} from './users-view/users-model';
import { useUsersRolesEditor } from './users-view/useUsersRolesEditor';
import { UsersRolesHeader } from './users-view/UsersRolesHeader';
import { UserRoleLegend } from './users-view/UserRoleLegend';
import { UserRoleRow } from './users-view/UserRoleRow';
import { InviteUserModal } from './users-view/InviteUserModal';
import { ConfirmUserActionModal } from './users-view/ConfirmUserActionModal';
import { ActionLinkModal } from './users-view/ActionLinkModal';

interface UsersRolesViewProps {
  showToast: (msg: string) => void;
  currentUserRole?: string;
  currentUserId?: string;
}

type PendingAction = { kind: 'deactivate' | 'delete'; user: CockpitUser } | null;

interface LinkModalState {
  title: string;
  description?: string;
  link: string;
}

export const UsersRolesView: React.FC<UsersRolesViewProps> = ({
  showToast,
  currentUserRole = 'admin',
  currentUserId = '',
}) => {
  const canManage = isUserManagerRole(currentUserRole);
  const editor = useUsersRolesEditor({ showToast, canManage });
  const [inviteOpen, setInviteOpen] = useState(false);
  const [pending, setPending] = useState<PendingAction>(null);
  const [linkModal, setLinkModal] = useState<LinkModalState | null>(null);

  if (!canManage) {
    return (
      <CockpitEmptyState
        icon={Shield}
        title="Accès réservé à la Direction"
        description="La gestion des comptes et des accès est réservée aux rôles Directeur et Administrateur."
      />
    );
  }

  const handleInviteResult = (result: InviteUserResult) => {
    if (result.emailSent) {
      showToast('Invitation envoyée par email.');
      return;
    }
    if (result.inviteLink) {
      setLinkModal({
        title: 'Lien d’invitation',
        description: 'SMTP indisponible : transmettez ce lien au collaborateur.',
        link: result.inviteLink,
      });
      return;
    }
    if (result.warning) showToast(result.warning);
  };

  const handleResetPassword = async (user: CockpitUser) => {
    const link = await editor.resetPassword(user);
    if (link) {
      setLinkModal({
        title: 'Lien de réinitialisation',
        description: `À transmettre à ${user.email}.`,
        link,
      });
    }
  };

  const confirmPending = async () => {
    if (!pending) return;
    const { kind, user } = pending;
    setPending(null);
    if (kind === 'delete') {
      await editor.remove(user);
    } else {
      await editor.toggleActive(user);
    }
  };

  const handleRoleChange = (user: CockpitUser, role: CockpitRole) => {
    void editor.changeRole(user, role);
  };

  return (
    <div className="space-y-6">
      <UsersRolesHeader
        total={editor.users.length}
        search={editor.query}
        onSearchChange={editor.setQuery}
        onRefresh={editor.refresh}
        onInvite={() => setInviteOpen(true)}
        loading={editor.loading}
      />

      <UserRoleLegend />

      <CockpitCard padding="none" className="overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10">
          <div className="text-xs font-mono text-gray-400 uppercase tracking-wider">
            Collaborateurs enregistrés ({editor.users.length})
          </div>
        </div>

        {editor.loading ? (
          <div className="p-4">
            <CockpitSkeletonList rows={4} />
          </div>
        ) : editor.error ? (
          <CockpitEmptyState
            icon={Shield}
            title="Chargement impossible"
            description={editor.error}
            className="border-0 bg-transparent"
          />
        ) : editor.visibleUsers.length === 0 ? (
          <CockpitEmptyState
            icon={Shield}
            title={editor.users.length === 0 ? 'Aucun collaborateur trouvé' : 'Aucun résultat'}
            description={
              editor.users.length === 0
                ? 'Invitez un premier collaborateur pour lui ouvrir l’accès au Cockpit.'
                : 'Aucun collaborateur ne correspond à cette recherche.'
            }
            className="border-0 bg-transparent"
          />
        ) : (
          <div className="divide-y divide-white/5">
            {editor.visibleUsers.map((user) => (
              <UserRoleRow
                key={user.id}
                user={user}
                isSelf={Boolean(currentUserId) && user.id === currentUserId}
                busy={editor.mutatingId === user.id}
                onChangeRole={(role) => handleRoleChange(user, role)}
                onToggleActive={() =>
                  user.isActive ? setPending({ kind: 'deactivate', user }) : void editor.toggleActive(user)
                }
                onResetPassword={() => void handleResetPassword(user)}
                onDelete={() => setPending({ kind: 'delete', user })}
              />
            ))}
          </div>
        )}
      </CockpitCard>

      <InviteUserModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvite={editor.invite}
        onResult={handleInviteResult}
      />

      <ConfirmUserActionModal
        isOpen={pending?.kind === 'delete'}
        title="Supprimer ce compte"
        message={
          pending
            ? `Le compte ${pending.user.email} sera supprimé définitivement. La suppression est refusée si le profil est relié à des données métier (CUC Sign) — utilisez alors la désactivation.`
            : ''
        }
        confirmLabel="Supprimer"
        busy={editor.mutatingId === pending?.user.id}
        onConfirm={() => void confirmPending()}
        onClose={() => setPending(null)}
      />

      <ConfirmUserActionModal
        isOpen={pending?.kind === 'deactivate'}
        title="Désactiver cet accès"
        message={
          pending
            ? `${pending.user.email} ne pourra plus se connecter au Cockpit. Sa fiche et ses données sont conservées.`
            : ''
        }
        confirmLabel="Désactiver"
        onConfirm={() => void confirmPending()}
        onClose={() => setPending(null)}
      />

      <ActionLinkModal
        isOpen={Boolean(linkModal)}
        title={linkModal?.title ?? ''}
        description={linkModal?.description}
        link={linkModal?.link ?? ''}
        onClose={() => setLinkModal(null)}
      />
    </div>
  );
};
