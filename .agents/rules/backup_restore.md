# RÈGLE PERMANENTE : SAUVEGARDE & RESTAURATION DU SITE

> Source canonique du sujet — ne pas recopier ce contenu ailleurs (ni dans
> `AGENTS.md`, ni dans `durability_health.md`). Plan d'origine :
> `plans/plan-backups-automatiques-2026.md` (document daté, non réécrit).

## 1. État actuel — aucune sauvegarde automatique (2026-10-01)

**Décision explicite du propriétaire du site, qui prime sur les plans précédents : aucune
sauvegarde automatique.** Le geste retenu est un **export manuel, à la demande**, depuis le
Cockpit. Ce qui a été retiré le 2026-10-01 :

- Le cron Vercel `/api/cron/backup` : la route a été **supprimée** et la clé `crons` de
  `vercel.json` aussi — le fichier ne contenait que cela, il n'existe plus.
- Les déclencheurs `schedule` des workflows `.github/workflows/backup.yml` et
  `backup-health.yml`, qui ne tournent plus que sur `workflow_dispatch` (déclenchement
  manuel).
- `CRON_SECRET` n'est plus lu nulle part : la variable d'environnement devient inutile.

## 2. Le geste manuel — export / import JSON du Cockpit

Une seule porte, déjà en place : `src/app/(admin)/admin/actions/backup.ts`.

- **Export** : `exportFullSiteBackup()` lit les tables et renvoie un fichier JSON
  téléchargé. C'est le seul moyen de fabriquer une sauvegarde aujourd'hui.
- **Import** : `restoreFullSiteBackup()` applique un `upsert` par clé primaire, **sans
  aucun `DELETE`**, et **uniquement sur les 14 tables `site_*`** listées dans
  `LEGACY_EXPORTED_TABLES` (`src/lib/backup/whitelist.ts`).
- **Sémantique exacte de l'import** : il ramène à l'état de l'export et **recrée** les
  lignes supprimées depuis, mais **ne retire pas** les lignes créées depuis l'export. Ce
  n'est **pas** un retour arrière strict de version.
- **CUC Sign structurellement hors d'atteinte** : aucune des 14 tables `site_*` ne
  recouvre une table CUC Sign, et aucune table CUC Sign ni du schéma `auth` n'est lue ou
  écrite. L'import est donc **sans risque** pour CUC Sign.
- Une **garde de rôle serveur** (admin/directeur) précède toute écriture.

## 3. La limite opérationnelle à connaître

La fraîcheur d'une sauvegarde, c'est la date du dernier export. **Si personne n'exporte
pendant un mois, on ne peut revenir que d'un mois.** Règle courte : exporter le plus
souvent possible, et toujours avant une opération sensible.

## 4. Le moteur versionné existe mais est en veille

Le moteur complet (NDJSON par table, gzip puis AES-256-GCM, catalogue `index.json` sur un
stockage objet **hors du projet Supabase**, rétention GFS 7/4/12, restauration versionnée
avec pré-instantané obligatoire, tables append-only préservées, CUC Sign structurellement
hors d'atteinte — cf. `src/lib/backup/**`) **reste fonctionnel et testé**. Il n'est
simplement **plus déclenché automatiquement**.

- **Procédure d'activation plus tard** : définir les secrets côté CI
  (`DATABASE_URL`, `BACKUP_ENCRYPTION_KEY`, `BACKUP_ENCRYPTION_KEY_ID`,
  `BACKUP_STORAGE_KIND`, `BACKUP_S3_ENDPOINT`, `BACKUP_S3_BUCKET`,
  `BACKUP_S3_ACCESS_KEY_ID`, `BACKUP_S3_SECRET_ACCESS_KEY`), puis déclencher
  manuellement le workflow de sauvegarde, ou réintroduire un `schedule` si une reprise
  automatique est décidée.
- **Commandes inchangées** : `npm run backup:run:write`, `backup:list`,
  `backup:restore[:write]`, `backup:health`.

## 5. Garde-fous actifs même en veille

Ces contrôles ne dépendent d'aucun déclencheur : ils s'exécutent à chaque CI et à chaque
import/restauration.

- **Liste blanche** `BACKUP_TABLES` (20 tables `site_*`) : seule source du périmètre.
- **`assertBackupScope`** (`src/lib/backup/whitelist.ts`) : appelé sur **chaque** table
  **avant** toute instruction et toute connexion ; une table hors liste blanche échoue.
- **Garde statique en CI** : `node scripts/guard_cuc_sign_scope.mjs` (job
  `cuc-sign-scope-guard` de `.github/workflows/ci.yml`) — écriture SQL hors liste blanche,
  référence à CUC Sign ou `auth`, FK interdite, DDL : toute violation fait échouer la CI.
- **Test de non-recouvrement** : `src/lib/backup/whitelist.test.ts` prouve qu'aucune table
  CUC Sign ne peut entrer dans la liste blanche.

## 6. Ajouter une table au périmètre

Ajouter le nom **exact** (préfixe `site_`) à `BACKUP_TABLES` dans
`src/lib/backup/whitelist.ts`, **et** à la liste recopiée du garde
`scripts/guard_cuc_sign_scope.mjs` (le garde ne doit pas importer la constante qu'il
surveille — c'est la seconde paire d'yeux). Aucune table CUC Sign ni `auth` n'entre jamais
dans cette liste.
