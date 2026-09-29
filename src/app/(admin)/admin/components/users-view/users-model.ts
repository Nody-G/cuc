/**
 * Contrats de la vue « Comptes & Accès » du Cockpit.
 *
 * Couche « Types & Contrats » (`AGENTS.md` § 1) : aucune React, aucun import
 * client. Ce module est consommé à la fois par les Server Actions
 * (`actions/users.ts`) et par les composants de présentation.
 */

export const COCKPIT_ROLES = ['directeur', 'admin', 'secretaire', 'coach', 'student'] as const;
export type CockpitRole = (typeof COCKPIT_ROLES)[number];

/** Rôles qui ouvrent l'accès au Cockpit (cf. `checkIsAdmin`). */
export const COCKPIT_ACCESS_ROLES = ['admin', 'directeur', 'secretaire', 'coach'] as const;

/**
 * Rôles habilités à gérer les comptes — appliqué côté serveur
 * (`checkIsUserManager`) **et** côté affichage. Une seule liste, jamais
 * dupliquée.
 */
export const USER_MANAGER_ROLES = ['admin', 'directeur'] as const;

export type RoleTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

export interface RoleDescriptor {
    value: CockpitRole;
    label: string;
    description: string;
    tone: RoleTone;
}

/** Catalogue de rôles — source unique des libellés et des tons de badge. */
export const ROLE_CATALOG: readonly RoleDescriptor[] = [
    {
        value: 'directeur',
        label: 'Directeur',
        description:
            'Contrôle total du site vitrine, des paramètres globaux et des collaborateurs.',
        tone: 'accent',
    },
    {
        value: 'admin',
        label: 'Administrateur',
        description:
            'Administration système du Cockpit : réglages, comptes et outils d’exploitation.',
        tone: 'warning',
    },
    {
        value: 'secretaire',
        label: 'Secrétariat',
        description:
            'Gestion du quotidien : sessions, quotas de places, bandeaux d’alerte et textes.',
        tone: 'neutral',
    },
    {
        value: 'coach',
        label: 'Coach / Formateur',
        description:
            'Accès ciblé à sa fiche biographique, sa filmographie et ses sessions encadrées.',
        tone: 'success',
    },
    {
        value: 'student',
        label: 'Élève (sans accès Cockpit)',
        description: 'Aucun accès au Cockpit. Compte conservé pour CUC Sign.',
        tone: 'neutral',
    },
];

export function isCockpitRole(value: string): value is CockpitRole {
    return (COCKPIT_ROLES as readonly string[]).includes(value);
}

export function isUserManagerRole(value: string | null | undefined): boolean {
    return typeof value === 'string' && (USER_MANAGER_ROLES as readonly string[]).includes(value);
}

export function roleDescriptor(role: string): RoleDescriptor {
    const found = ROLE_CATALOG.find((descriptor) => descriptor.value === role);
    if (found) return found;
    return { value: 'student', label: role, description: '', tone: 'neutral' };
}

export interface CockpitUser {
    id: string;
    email: string;
    fullName: string | null;
    role: CockpitRole;
    /** Compte autorisé à se connecter (non banni côté Supabase Auth). */
    isActive: boolean;
    lastSignInAt: string | null;
    createdAt: string;
}

export interface UsersListResult {
    success: boolean;
    users: CockpitUser[];
    error?: string;
}

export interface UserMutationResult {
    success: boolean;
    error?: string;
    /** Avertissement non bloquant (ex. profil conservé car relié à des données métier). */
    warning?: string;
}

export interface InviteUserResult extends UserMutationResult {
    /** `true` si Supabase a réellement envoyé l'email d'invitation. */
    emailSent?: boolean;
    /** Lien d'invitation de repli à transmettre manuellement (SMTP indisponible). */
    inviteLink?: string;
}

export interface PasswordResetResult extends UserMutationResult {
    emailSent?: boolean;
    /** Lien de réinitialisation de repli à transmettre manuellement. */
    resetLink?: string;
}

/* ------------------------------------------------------------------ */
/* Logique pure — testable hors du cycle de vie UI                     */
/* ------------------------------------------------------------------ */

/**
 * Normalise un identifiant saisi en adresse email.
 *
 * Reprend la convention de connexion du Cockpit (`loginAdminAction`,
 * `AdminLoginPage`) : un identifiant sans `@` est suffixé `@cuc.fr`.
 */
export function normalizeCockpitEmail(input: string): string {
    const value = input.trim().toLowerCase();
    if (!value) return '';
    return value.includes('@') ? value : `${value}@cuc.fr`;
}

export interface RoleChangeInput {
    actorId: string;
    targetId: string;
    targetRole: CockpitRole;
    nextRole: CockpitRole;
    /** Nombre de comptes de direction **y compris** la cible. */
    managerCount: number;
}

export type GuardDecision = { allowed: true } | { allowed: false; reason: string };

/** Garde-fou d'un changement de rôle (auto-rétrogradation, dernier dirigeant). */
export function evaluateRoleChange({
    actorId,
    targetId,
    targetRole,
    nextRole,
    managerCount,
}: RoleChangeInput): GuardDecision {
    if (targetRole === nextRole) return { allowed: true };
    if (actorId === targetId && !isUserManagerRole(nextRole)) {
        return {
            allowed: false,
            reason: 'Impossible de retirer vos propres droits d’administration.',
        };
    }
    if (isUserManagerRole(targetRole) && !isUserManagerRole(nextRole) && managerCount <= 1) {
        return {
            allowed: false,
            reason: 'Impossible de retirer le dernier compte de direction du Cockpit.',
        };
    }
    return { allowed: true };
}

export interface AccountRemovalInput {
    actorId: string;
    targetId: string;
    targetRole: CockpitRole;
    /** Nombre de comptes de direction **hors** la cible. */
    remainingManagerCount: number;
}

/** Garde-fou de désactivation / suppression d'un compte. */
export function evaluateAccountRemoval({
    actorId,
    targetId,
    targetRole,
    remainingManagerCount,
}: AccountRemovalInput): GuardDecision {
    if (actorId === targetId) {
        return {
            allowed: false,
            reason: 'Vous ne pouvez pas désactiver ou supprimer votre propre compte.',
        };
    }
    if (isUserManagerRole(targetRole) && remainingManagerCount <= 0) {
        return {
            allowed: false,
            reason: 'Impossible de désactiver ou supprimer le dernier compte de direction du Cockpit.',
        };
    }
    return { allowed: true };
}
