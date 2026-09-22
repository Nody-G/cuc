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

## 2. La garde mise en place : le brouillon n'est plus rendu

Trois verrous, dans cet ordre — chacun vérifiable :

1. **Sitemap** : [`sitemap.ts`](src/app/sitemap.ts:9) ne déclare que les slugs
   `is_published = true` (lecture mise en cache sous le tag `site_pages` ; une panne de
   lecture n'ampute rien).
2. **Rendu** : [`UnpublishedPageGate`](src/components/i18n/UnpublishedPageGate.tsx:1), branché
   dans [`SiteDataProvider`](src/components/i18n/SiteDataProvider.tsx:49), remplace le contenu
   par un avis sobre **au rendu serveur** — le HTML public ne contient donc **aucun texte non
   publié**. Les 15 routes passent par ce provider (14 via `PageDataProvider` de leur layout,
   l'accueil directement) : aucune page ne peut oublier la garde.
3. **Aperçu** : dans l'iframe du Cockpit (`?cuc-preview=1`), la garde s'efface — sans quoi on
   ne pourrait plus éditer une page avant de la publier.

Pourquoi pas `notFound()` tout de suite : la lecture du contexte d'aperçu
(`searchParams`) est interdite dans les lectures mises en cache et rendrait les routes
**dynamiques** (les 93 pages prérendues passeraient en rendu à la demande). On perdrait en
performance publique ce qu'on gagnerait en confort éditorial.

## 3. Ce qu'il reste, et comment le finir proprement

**Balisage — fait** : [`buildRouteMetadata()`](src/lib/i18n/route-metadata.ts:24), source
unique des métadonnées des 14 routes, pose `robots: { index: false, follow: false }` dès que la
page est en brouillon (4 tests). Une page non publiée ne peut donc plus être indexée, et la
republication rétablit `index` sans intervention.

**Statut HTTP 404 — deux voies possibles**, à trancher :

- **Voie A — extraction des vues (la plus propre)** : sortir le JSX de chaque route dans un
  composant (`<XView/>`), créer `/preview/[slug]` (serveur, `checkIsAdmin()`, `noindex`) qui
  rend ces vues avec `allowUnpublished`, pointer [`buildPreviewUrl()`](src/lib/preview/preview-url.ts:1)
  dessus, puis appeler `notFound()` dans les routes publiques. Coût : 15 fichiers réorganisés ;
  bénéfice : vrai 404, aperçu isolé et sécurisé par la session.
- **Voie B — témoin d'aperçu signé** : le Cockpit pose un cookie `cuc_preview` **signé**
  (HMAC côté serveur, expiration courte) et la garde serveur laisse passer uniquement ce
  témoin. Coût : un aller-retour d'écriture de cookie et une vérification HMAC ; bénéfice :
  aucun fichier de vue déplacé. À préférer si l'extraction des 15 vues doit attendre.

Dans les deux cas, l'aperçu du Cockpit doit continuer de fonctionner : c'est la contrainte qui
interdit la solution naïve (`notFound()` sec), déjà testée et écartée.

## 4. État vérifié aujourd'hui

- **Panne de lecture** : `getLocalizedPageContent()` sert la **copie certifiée**
  (`DEFAULT_PAGE_CONTENTS`) au lieu d'une page morte.
- **Page absente** : `null` remonté à la route, repli client certifié (comportement explicite
  et documenté dans le code).
- **Risque éditorial** : perte de brouillon
  ([`draft-storage.ts`](src/lib/preview/draft-storage.ts:1)) et écrasement concurrent
  (`upsertPageContent`, garde `updated_at`) traités.
- **Gate** : `npm run studio:gate:full` vert — dont 4 tests dédiés à la garde
  ([`UnpublishedPageGate.test.tsx`](src/components/i18n/UnpublishedPageGate.test.tsx:1)) :
  contenu publié rendu, contenu non publié **jamais** rendu, aperçu servi, cas sans contenu.

## 5. Contrôle manuel recommandé

1. Dépublier une page dans le Cockpit → en navigation privée : avis « Cette page n'est pas
   publiée », aucun texte du brouillon dans le source HTML, page absente de `/sitemap.xml`.
2. Ouvrir l'aperçu dans le Cockpit → la page s'édite normalement (garde neutralisée).
3. Republier → la page revient immédiatement (revalidation par tags), sans redéploiement.
