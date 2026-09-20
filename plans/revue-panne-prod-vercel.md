# Revue de panne — Site vitrine inaccessible en production

**Date :** 2026-09-20
**Symptôme :** `https://cuc-new.vercel.app/` affiche « This page couldn't load / Reload to try again, or go back. » sur toutes les pages sauf le Cockpit, quel que soit le cache ou la navigation privée.
**Statut :** ✅ Corrigé, déployé et **vérifié en production** (commit 4efff33).

---

## 1. Diagnostic — ce que ce n'était PAS

L'hypothèse initiale d'un **échec de build Vercel** a été écartée. Les logs fournis par l'utilisateur étaient des **logs console navigateur**, pas des logs de build.

Le message exact « Reload to try again, or go back. » correspond à la variante **CLIENT** du composant [`global-error.js`](../node_modules/next/dist/client/components/builtin/global-error.js:19) de Next.js — celle qui s'affiche **sans digest**. Un échec serveur produirait « A server error occurred. Reload to try again. » **avec** un digest.

Conclusion : le serveur répondait bien (HTTP 200, HTML complet), mais une **exception JavaScript non capturée** remplaçait la page entière côté navigateur.

---

## 2. Cause racine

### 2.1 Le mécanisme Supabase Realtime

`supabase.channel(name)` **retourne le canal EXISTANT** si un canal portant le même nom est déjà enregistré sur le client. Or `@supabase/supabase-js` **lève une exception synchrone non capturée** lorsqu'on appelle `.on('postgres_changes', ...)` sur un canal **déjà souscrit** :

```
Uncaught Error: cannot add postgres_changes callbacks for realtime:site_social_links:all after subscribe()
    at e$.on (18szcayxskp4p.js:6:38935)
    at 2gj-w27vymzk3.js:1:5375
```

Cette exception remontait jusqu'à la frontière `global-error` de Next.js et **remplaçait toute la page**.

### 2.2 Le code fautif

Dans [`useNavigation.ts`](../src/lib/hooks/useNavigation.ts:211), le canal `site_social_links:all` était créé avec un **nom statique**, ce qui provoquait une collision dès le second montage (React StrictMode en dev, remontages de navigation en prod) :

```ts
// AVANT — nom statique → collision au 2ᵉ montage
const channel = supabase
    .channel('site_social_links:all')
    .on('postgres_changes', { ... }, () => { fetchLinks(); })
    .subscribe();
```

Le Cockpit était épargné car il ne consomme pas `useNavigation()` / `useSocialLinks()`.

---

## 3. Causes secondaires

| # | Cause | Impact | Correctif |
|---|-------|--------|-----------|
| 1 | `remotePatterns` de [`next.config.ts`](../next.config.ts:74) n'incluait pas `xkbkcsypftvspmkfnrfm.supabase.co` | Tous les `/_next/image` des médias Supabase renvoyaient **400 Bad Request** | Ajout du host + wildcard `**.supabase.co` |
| 2 | CSP `connect-src 'self' https:` n'autorisait pas `wss:` | WebSocket Realtime Supabase **bloqué** | `connect-src 'self' https: wss: wss://*.supabase.co` |
| 3 | Tables `site_navigation`, `site_footer`, `site_social_links` **absentes** de Supabase | **404** sur les 3 endpoints, vitrine non alimentée | Migration appliquée + seed |
| 4 | `createBrowserClient` instancié à chaque appel de hook | `Multiple GoTrueClient instances detected` | Singleton mémoïsé dans [`client.ts`](../src/lib/supabase/client.ts:41) |

---

## 4. Correctifs appliqués

### 4.1 Helper centralisé — [`src/lib/supabase/realtime.ts`](../src/lib/supabase/realtime.ts:1) (nouveau)

Trois fonctions qui garantissent l'unicité du nom de canal et l'absence de throw :

- `uniqueChannelName(base)` — suffixe un compteur monotone (`base#1`, `base#2`, …).
- `createSafeChannel(supabase, baseName, configure)` — construit le canal, applique la configuration, souscrit, le tout en `try/catch`. Retourne `RealtimeChannel | null`.
- `removeSafeChannel(supabase, channel)` — désabonnement défensif.

### 4.2 Sites d'appel refactorés (7 fichiers)

| Fichier | Canal |
|---------|-------|
| [`useNavigation.ts`](../src/lib/hooks/useNavigation.ts:62) | `site_navigation:${id}`, `site_footer:${id}`, `site_social_links:all` |
| [`usePageDynamicContent.ts`](../src/lib/hooks/usePageDynamicContent.ts:130) | `realtime_page_${slug}` |
| [`CockpitApp.tsx`](../src/app/admin/CockpitApp.tsx:250) | `cockpit:all_changes` (12 listeners) |
| [`HallOfFame.tsx`](../src/components/sections/HallOfFame.tsx:47) | `realtime:site_films` |
| [`AnnouncementBanner.tsx`](../src/components/layout/AnnouncementBanner.tsx:38) | `realtime:site_announcements` |
| [`equipe-cascadeurs-pro/page.tsx`](../src/app/equipe-cascadeurs-pro/page.tsx:73) | `realtime:site_team_films` |

### 4.3 Frontières d'erreur (nouvelles)

- [`src/app/error.tsx`](../src/app/error.tsx:1) — frontière de route : journalise, propose « Réessayer » et « Retour à l'accueil ».
- [`src/app/global-error.tsx`](../src/app/global-error.tsx:1) — frontière racine : remplace définitivement la page d'erreur brute de Next.js.

### 4.4 Migration Supabase

- [`scripts/apply_navigation_footer_migration.mjs`](../scripts/apply_navigation_footer_migration.mjs:1) (nouveau) — applique [`schema_navigation_footer.sql`](../scripts/schema_navigation_footer.sql:1) via l'API Management, idempotent, avec vérification post-migration.
- [`scripts/verify_navigation_footer_endpoints.mjs`](../scripts/verify_navigation_footer_endpoints.mjs:1) (nouveau) — reproduit les requêtes PostgREST exactes des 3 hooks.

### 4.5 Garde-fou de production

- [`scripts/probe_production_guard.mjs`](../scripts/probe_production_guard.mjs:1) (nouveau) — sonde 15 routes publiques, détecte les signatures d'erreur (`This page couldn`, `Application error`, `Une erreur est survenue`) et l'absence du marqueur de contenu. **Sort en code 2** en cas de régression.

### 4.6 CI

- [`.github/workflows/ci.yml`](../.github/workflows/ci.yml:3) — déclencheurs étendus à `master` (le push allait sur `master`, la CI ne se déclenchait jamais).

---

## 5. Vérifications

| Contrôle | Résultat |
|----------|----------|
| `npx tsc --noEmit` | ✅ 0 erreur |
| `npx eslint` (fichiers modifiés) | ✅ 0 erreur (9 warnings préexistants) |
| `npx vitest run` | ✅ 76/76 tests |
| `npm run build` | ✅ 63/63 pages générées |
| `node scripts/probe_public_routes.mjs` | ✅ 16/16 routes saines |
| `node scripts/verify_navigation_footer_endpoints.mjs` | ✅ 3/3 endpoints HTTP 200 avec données |

---

## 6. Commandes de maintenance

```bash
# Migration du schéma navigation/footer/social links (idempotent)
npm run cms:migrate:navigation

# Seed des données vitrine
npm run cms:seed:navigation

# Vérification des endpoints Supabase
npm run cms:verify:navigation

# Sonde locale (dev server sur :3100)
npm run probe:local

# Sonde de production (garde-fou post-déploiement)
npm run probe:prod
```

---

## 7. Règle permanente à retenir

> **Tout canal Supabase Realtime doit passer par `createSafeChannel()`.**
> Jamais de `.channel('nom-statique')` en dur, jamais de `.on()` après `.subscribe()`.
> Le nom doit être unique par instance de composant.

---

## 8. Vérification post-déploiement (production réelle)

**Commit déployé :** 4efff33 — poussé sur origin/master.

| Contrôle | Commande | Résultat |
|----------|----------|----------|
| Routes publiques | npm run probe:prod | ✅ 15/15 routes HTTP 200 + marqueur de contenu |
| Bundle JS (correctif Realtime) | npm run probe:prod:bundle | ✅ createSafeChannel + removeSafeChannel présents dans 3 chunks |
| En-tête CSP | inspection manuelle | ✅ connect-src inclut wss: et wss://*.supabase.co |
| Optimiseur d images Supabase | npm run probe:prod:images | ✅ /_next/image renvoie HTTP 200 (image/jpeg) |

### 8.1 Piège de vérification à connaître

Le template literal de uniqueChannelName() est compilé en **concaténation** :
la chaîne littérale site_social_links# n existe **jamais** dans le bundle.
Chercher ce motif produit un **faux négatif**. Le marqueur fiable est le nom
des helpers importés nommément (createSafeChannel / removeSafeChannel), qui
survit à la minification. C est ce que fait verify_prod_bundle_fix.mjs.

De même, tester /_next/image avec un **PDF** renvoie 400 légitimement.
verify_prod_image_optimizer.mjs filtre donc sur les extensions d image.

### 8.2 Commandes de vérification production

```bash
npm run probe:prod          # 15 routes publiques
npm run probe:prod:bundle   # correctif Realtime dans le bundle
npm run probe:prod:images   # optimiseur d images Supabase
```
