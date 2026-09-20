# Revue — Migration `site_campus_pois` + `site_audit_logs`

## 1. Origine de la découverte

La sonde du Moniteur Système (`node scripts/probe_system_health.mjs`) a été créée
pour prouver que les mesures affichées dans le Cockpit sont réelles. Elle a
immédiatement révélé un écart de schéma :

```
⚠️  site_audit_logs injoignable — Could not find the table 'public.site_audit_logs' in the schema cache
⚠️  Colonnes POI manquantes : Could not find the table 'public.site_campus_pois' in the schema cache
📊 Tables joignables : 8 / 8
```

Les 8 tables sondées existent bien. En revanche, **deux tables déclarées dans le
dépôt n'ont jamais été créées dans l'instance Supabase** :

| Table | Déclarée dans | État réel |
| --- | --- | --- |
| `site_campus_pois` | [`migration_sync_cuc_cockpit.sql`](scripts/migration_sync_cuc_cockpit.sql:63) | ❌ Absente |
| `site_audit_logs` | [`migration_sync_cuc_cockpit.sql`](scripts/migration_sync_cuc_cockpit.sql:89) | ❌ Absente |

## 2. Conséquences réelles (avant correctif)

### 2.1 Écritures silencieusement perdues

[`upsertCampusPOI()`](src/app/admin/actions.ts:818) et
[`deleteCampusPOI()`](src/app/admin/actions.ts:884) enveloppaient l'appel
Supabase dans un `try/catch` :

```ts
try {
  await adminClient.from('site_campus_pois').upsert({ ... });
} catch {
  // Table dédiée non encore créée
}
```

**Ce `try/catch` ne pouvait jamais se déclencher.** Le client
`@supabase/supabase-js` ne lève pas d'exception sur une erreur PostgREST : il
retourne un objet `{ data, error }`. L'erreur « table introuvable » était donc
totalement ignorée, sans aucune trace dans les logs.

### 2.2 Repli `localStorage` contraire à la doctrine

[`getCampusPOIs()`](src/lib/data/site-service.ts:1733) terminait par :

```ts
if (typeof window !== 'undefined') {
  const cached = localStorage.getItem('cuc_campus_pois');
  if (cached) return JSON.parse(cached);
}
```

C'est une violation directe de la doctrine **« Zéro Valeur Orpheline »** : un
cache navigateur non synchronisé pouvait devenir la source d'affichage de la
vitrine, sans aucun lien avec Supabase.

### 2.3 Moniteur Système amputé

[`getSystemHealth()`](src/app/admin/actions.ts:1837) lit
`site_audit_logs` pour produire la métrique « dernière écriture ». Table absente
⇒ métrique systématiquement en état dégradé.

## 3. Correctifs appliqués

### 3.1 Détection d'erreur explicite (code)

Le `try/catch` inopérant est remplacé par une inspection du champ `error` :

- [`upsertCampusPOI()`](src/app/admin/actions.ts:818) — `const { error: tableError } = await ...upsert(...)` puis `console.error` si `tableError`.
- [`deleteCampusPOI()`](src/app/admin/actions.ts:884) — même traitement sur le `delete()`.
- [`getCampusPOIs()`](src/lib/data/site-service.ts:1733) — `console.error` si `tableError`.

Une table absente est désormais **visible dans les logs serveur** au lieu d'être
avalée.

### 3.2 Suppression du repli `localStorage`

[`getCampusPOIs()`](src/lib/data/site-service.ts:1733) ne consulte plus
`localStorage`. La chaîne de résolution est désormais :

1. `site_campus_pois` (source de vérité)
2. miroir `site_settings.campus_pois` (résilience)
3. constante `CAMPUS_POIS` du dépôt (versionnée, donc traçable)

### 3.3 Migration idempotente

Nouveau fichier [`migration_apply_campus_pois_audit_logs.sql`](scripts/migration_apply_campus_pois_audit_logs.sql:1) :

- `CREATE TABLE IF NOT EXISTS` pour les deux tables.
- `ALTER TABLE ... ADD COLUMN IF NOT EXISTS image_url TEXT` et
  `order_index INTEGER DEFAULT 0` sur `site_campus_pois` — colonnes requises par
  [`upsertCampusPOI()`](src/app/admin/actions.ts:818) et absentes du SQL
  d'origine.
- Politiques RLS : lecture publique des POI (vitrine), écriture réservée aux
  rôles `admin`, `directeur`, `secretaire`, `coach` ; insertion authentifiée et
  lecture administrateur pour les logs d'audit.
- Ajout à la publication `supabase_realtime` (diffusion vers le Cockpit).

### 3.4 Script d'application

Nouveau fichier [`apply_campus_pois_audit_logs_migration.mjs`](scripts/apply_campus_pois_audit_logs_migration.mjs:1) :
applique le SQL via l'API Management Supabase
(`POST /v1/projects/{ref}/database/query`), avec mode `--dry-run`.

## 4. Action requise (blocage actuel)

L'application de la migration est **bloquée par une absence de credential**.
Le dépôt ne contient que :

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_PUBLISHABLE_KEY
```

Aucun de ces secrets ne permet d'exécuter du DDL. Les endpoints testés
(`/pg/query`, `/database/query`, `/rest/v1/rpc/exec`, `/rest/v1/rpc/execute`,
`/rest/v1/rpc/run_sql`) répondent tous **404** avec la clé service role.

### Deux voies possibles

**Voie A — Dashboard Supabase (immédiate, sans credential supplémentaire)**

1. Ouvrir <https://supabase.com/dashboard/project/xkbkcsypftvspmkfnrfm/sql/new>
2. Coller l'intégralité de [`migration_apply_campus_pois_audit_logs.sql`](scripts/migration_apply_campus_pois_audit_logs.sql:1)
3. Exécuter, puis vérifier avec `node scripts/probe_system_health.mjs`

**Voie B — Personal Access Token (automatisable)**

1. Créer un token sur <https://supabase.com/dashboard/account/tokens>
2. Ajouter `SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxx` dans `.env.local`
3. Lancer `node scripts/apply_campus_pois_audit_logs_migration.mjs`

## 5. Vérification attendue après application

```bash
node scripts/probe_system_health.mjs
```

Résultat cible :

```
✅ Latence Supabase : < 600 ms
📊 Tables joignables : 10 / 10
✅ site_audit_logs joignable
✅ Colonnes POI présentes : id, image_url, order_index, is_active
```

Le script sort en **code 2** si l'une des tables sondées redevient
injoignable — la régression de schéma est donc détectable automatiquement.

## 6. Portée de la doctrine « Zéro Valeur Orpheline »

Cet incident illustre le point 1 de la doctrine : *« Aucun contenu critique ne
doit dépendre uniquement du `localStorage` ou de constantes locales sans
synchronisation base de données. »* Le repli `localStorage` de
[`getCampusPOIs()`](src/lib/data/site-service.ts:1733) rendait la vitrine
capable d'afficher des zones de campus qui n'existaient dans aucune table — un
cas d'école de valeur orpheline. Il est supprimé.
