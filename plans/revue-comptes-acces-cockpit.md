# Revue — Comptes & Accès du Cockpit

**Date :** 2026-09-29
**Périmètre :** onglet « Comptes & Accès » (`/admin/users`) du Cockpit CUC
**Doctrine :** SRP (`AGENTS.md` § 1-2), interconnexion CUC Sign (`cuc_sign_interconnection.md`), aucune écriture avalée (`durability_health.md` § 8)

---

## 1. Constat de départ

| Problème | Preuve |
| :--- | :--- |
| Onglet injoignable par URL directe | aucun fichier `src/app/(admin)/admin/users/page.tsx` — l'onglet n'existait que par `pushState` |
| Escalade de privilèges possible | `listCockpitUsers` / `updateUserRole` appelaient `createAdminClient()` (service role) **sans** garde d'autorisation, contrairement à `settings.ts` / `entities.ts` |
| Opérations incomplètes | seulement « lister » et « changer le rôle » ; aucune invitation, réinitialisation, désactivation ni suppression |
| Double chargement | l'ancienne vue appelait `listCockpitUsers()` au montage **et** dans `fetchUsers()` |
| Aucune traçabilité | les changements de rôle ne laissaient aucune trace dans `site_audit_logs` |
| Couplage vue/logique | fichier unique de 272 lignes mêlant fetch, mutations et rendu |

---

## 2. Décisions

### 2.1 Statut du compte — sans migration de `profiles`

La table `profiles` est **partagée avec CUC Sign**. Plutôt que d'y ajouter une colonne `is_active`, le statut est dérivé de Supabase Auth (`auth.admin.listUsers()` → `banned_until`). Désactivation = bannissement réversible (`ban_duration: '876000h'`), réactivation = `'none'`.

**Conséquence :** aucune migration, aucune altération du schéma CUC Sign. Fonctionne si la clé service role est configurée.

### 2.2 Suppression refusée si le profil est relié

Suppression = effacement d'identité. L'ordre est **profil d'abord, compte Auth ensuite** : si le profil est référencé par des données métier protégées, la suppression échoue et **rien** n'est détruit — le message renvoie vers la désactivation. La désactivation reste la voie normale.

### 2.3 Invitation — email, avec repli lien copiable

Si un SMTP est configuré, `inviteUserByEmail` envoie l'email. Sinon, un lien d'invitation copiable est généré (`generateLink`) et affiché à l'administrateur — jamais un faux « invitation envoyée » (cf. § 8 de `durability_health.md`). Même repli pour la réinitialisation de mot de passe.

### 2.4 Garde-fous de direction

Logique pure, testée hors cycle de vie UI :

- auto-rétrogradation interdite (on ne retire pas ses propres droits) ;
- dernier compte `admin`/`directeur` non rétrogradable, désactivable ni supprimable ;
- auto-désactivation / auto-suppression interdites.

---

## 3. Fichiers

### Contrats & logique pure
- `src/app/(admin)/admin/components/users-view/users-model.ts` — types, catalogue de rôles unique, `normalizeCockpitEmail`, `evaluateRoleChange`, `evaluateAccountRemoval`.
- `.../users-model.test.ts` — 17 tests.

### Server Actions (gardées + auditées)
- `src/app/(admin)/admin/actions/user-guards.ts` — `requireManager`, `countManagers`, `readAccountStatus`, `applyProfile`, `authRedirectTo` (module serveur interne).
- `src/app/(admin)/admin/actions/user-accounts.ts` — `listCockpitUsers`, `setCockpitUserActive`, `sendUserPasswordReset`, `deleteCockpitUser`.
- `src/app/(admin)/admin/actions/user-roles.ts` — `inviteCockpitUser`, `updateUserRole`.
- `src/app/(admin)/admin/actions/auth.ts` — ajout de `checkIsUserManager()` (admin/directeur).
- `src/app/(admin)/admin/actions.ts` — façade inchangée côté importeurs.

### Orchestration & UI
- `.../users-view/useUsersRolesEditor.ts` — chargement unique, mutations, recherche, comptage.
- `.../users-view/UsersRolesHeader.tsx`, `UserRoleLegend.tsx`, `UserRoleBadge.tsx`, `UserRoleRow.tsx`, `InviteUserModal.tsx`, `ConfirmUserActionModal.tsx`, `ActionLinkModal.tsx`, `ModalShell.tsx`.
- `src/app/(admin)/admin/components/UsersRolesView.tsx` — coquille de présentation (211 lignes).

### Routes
- `src/app/(admin)/admin/users/page.tsx` — corrige le 404.
- Segments manquants ajoutés : `analytics`, `audit`, `campus`, `disciplines`, `footer`, `health`, `microtextes`, `navigation`, `social`.
- `cockpit-nav.ts` — `routeForTab()` (source unique) ; `campus-3d` évalué avant `campus` ; `useCockpitShortcuts` ne compose plus `/admin/${tab}` à la main.

---

## 4. Gate qualité

| Contrôle | Résultat |
| :--- | :--- |
| `npm run typecheck` | ✅ exit 0 |
| `npm run lint` | ✅ exit 0 — 0 erreur, 8 avertissements préexistants (hors périmètre) |
| `npm run test` | ✅ 17/17 nouveaux tests ; **4 suites en échec préexistantes** (voir § 5) |
| `npm run build` | ✅ exit 0 — `/admin/users` et tous les segments présents |
| Plafond 300 lignes | ✅ `user-guards` 122, `user-accounts` 208, `user-roles` 126, `users-model` 200, vue 211 |

---

## 5. Dette préexistante constatée (non introduite par ce chantier)

Quatre suites échouent **à l'import** (`TypeError: Cannot read properties of undefined (reading 'config')`) et ce dès la base propre — vérifié par `git stash` puis relance :

- `src/lib/instagram/instagram-feed.test.ts`
- `src/app/(admin)/admin/actions/inquiries-fetch.test.ts`
- `src/app/(admin)/admin/components/films-view/film-doublings-domain.test.ts`
- `src/app/(admin)/admin/components/films-view/film-filters-domain.test.ts`

Point commun : `import { describe, ... } from 'vitest'` (les suites qui passent utilisent les *globals*). À traiter séparément ; ce n'est pas une régression du présent chantier.

---

## 6. Reste à faire

1. **Configurer le SMTP Supabase** pour que les invitations / réinitialisations partent par email (sinon repli lien copiable).
2. **Vérifier `SUPABASE_SERVICE_ROLE_KEY`** en production : sans elle, les écritures Auth (`ban`, `delete`, `invite`) échouent — l'action le signale désormais explicitement.
3. **Recette manuelle** dans le Cockpit : inviter un compte de test, changer son rôle, le désactiver, vérifier l'entrée dans le Journal d'audit, le réactiver, puis le supprimer.
4. **Garde de route par onglet** : les routes `/admin/*` restent accessibles à tout rôle Cockpit par URL directe (les menus masquent, la route ne filtre pas). Sujet transverse, hors périmètre.
5. Corriger les 4 suites préexistantes (§ 5).
