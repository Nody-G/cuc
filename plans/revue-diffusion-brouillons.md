# Revue — Diffusion des brouillons de page (point ouvert, assumé)

**Date** : 2026-09-22
**Contexte** : audit des risques d'expérience liés au « tout en base de données » (Mode Studio).

## 1. Le constat, vérifié dans le code

`site_pages.is_published` existe, le Cockpit expose « Publier / Repasser en brouillon »
(`setPagePublishState`), et la colonne est écrite — **mais aucune lecture publique ne la
respecte** :

- [`getLocalizedPageContent()`](src/lib/i18n/server.ts:93) lit `site_pages` **sans filtre**
  (`select('*').eq('slug', …)`), la policy RLS est `FOR SELECT USING (true)`
  ([`schema_pages_extension.sql`](scripts/schema_pages_extension.sql:69)) ;
- [`usePageDynamicContent()`](src/lib/hooks/usePageDynamicContent.ts:52) fait de même côté client.

Conséquence : **dépublier une page ne la retire pas de la vitrine.** Le bouton donne
l'illusion d'un contrôle qui n'existe pas. C'est un écart de vérité, pas un détail cosmétique.

## 2. Pourquoi la garde évidente a été écartée (et non oubliée)

La correction « naturelle » — `if (is_published === false) notFound()` — a été implémentée,
puis **retirée volontairement** après vérification, car elle casse deux choses :

1. **L'aperçu du Cockpit** : l'iframe de l'éditeur charge l'URL **publique** de la page
   (`buildPreviewUrl`). Un brouillon répondrait 404 : on ne pourrait plus éditer une page
   avant de la publier — c'est-à-dire dans le cas d'usage normal.
2. **La performance** : contourner la garde en lisant `searchParams` (le `?cuc-preview=1`
   déjà présent) rendrait les routes **dynamiques**. Aujourd'hui elles sont prérendues
   (`93/93` pages statiques ou PPR) ; on échangerait une page en trop contre un site plus lent
   pour tout le monde — mauvais marché.

## 3. La parade complète (à faire, dans cet ordre)

1. **Route d'aperçu dédiée, réservée au Cockpit** : `/preview/[slug]` (non mise en cache,
   vérifiant la session admin via `checkIsAdmin()`), qui rend la page **même non publiée** et
   pose `robots: noindex`.
2. **`buildPreviewUrl()`** pointe vers cette route (`?cuc-preview=1` conservé pour couper le
   Realtime et les effets lourds). L'ifra­me reste sur la même origine.
3. **Garde serveur publique** : `getLocalizedPageContent()` filtre `is_published = true` et
   `notFound()` si la ligne est absente ou dépubliée — la page disparaît réellement de la
   vitrine, du sitemap et des moteurs.
4. **Test d'invariant** : un brouillon répond 404 en public et 200 dans `/preview`, la copie
   certifiée restant servie en cas de panne Supabase (comportement déjà en place ici).

## 4. Ce qui a été livré en attendant

- **Panne de lecture** : `getLocalizedPageContent()` sert la **copie certifiée**
  (`DEFAULT_PAGE_CONTENTS`) au lieu de laisser une page morte — le visiteur garde un site
  cohérent même si Supabase est injoignable.
- **Page absente** : `null` remonté à la route, qui applique son repli (comportement inchangé,
  désormais explicite et documenté dans le code).
- **Le reste du risque éditorial est traité** : perte de brouillon
  ([`draft-storage.ts`](src/lib/preview/draft-storage.ts:1)) et écrasement concurrent
  (`upsertPageContent`, garde `updated_at`).

## 5. Vérification attendue après la parade

- `npm run studio:gate:full` vert (champs, budget, micro-textes, TypeScript, tests).
- `npm run build` : **93 pages** toujours prérendues (aucune route passée en dynamique).
- Contrôle manuel : dépublier une page → 404 en public, aperçu éditable dans le Cockpit,
  republication → la page revient sans redéploiement.
