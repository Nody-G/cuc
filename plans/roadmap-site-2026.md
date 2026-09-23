# Feuille de route — site CUC (2026)

**But** : garder le site rapide, vrai et durable. Ce document liste ce qui reste à faire,
classé par **impact réel × effort**, avec pour chaque sujet la source de vérité du code et la
vérification attendue. Rien n'est « prévu » sans un endroit précis où le constater.

## Déjà tenu (ne pas régresser)

| Sujet | Garde-fou |
| --- | --- |
| Performance publique | pages prérendues (statiques/PPR), lectures `'use cache'` + tags, un seul WebSocket par visiteur — `npm run audit:budget` |
| Édition en place | 15/15 pages couvertes, standards de saisie (typographie miroir, `Tab`, étiquette, repli visible) — `npm run audit:fields` + tests |
| Textes | **306 textes annotés, 0 texte codé en dur** (14 valeurs dynamiques assumées : interpolations, index, données d'entités) — `npm run audit:microcopy` |
| Entités éditables | annonces, coachs (rôle/titre/bio) et films (titre/année) modifiables en place sous **liste blanche serveur** (`updateEntityField`, contrôle d'existence) ; noms de coachs exclus (identité IMDb) — [`plan-preview-chrome-editable.md`](plans/plan-preview-chrome-editable.md:1) + tests |
| Bilingue | fusion FR + overlay unique (`localized-merge`), invariants testés |
| Panne de lecture | copie certifiée servie (jamais de page morte) |
| Édition sans perte | filet local du brouillon + garde de concurrence à l'enregistrement |
| Publication | sitemap, rendu, `robots: noindex`, aperçu — quatre points alignés |
| Accessibilité mesurée | 3 surfaces (accueil, formation, contact) auditées `axe-core`, seuil **0 violation `serious`/`critical`** — `npm run test` + [`a11y-harness.tsx`](src/lib/testing/a11y-harness.tsx:1). Limite assumée : jsdom ne calcule pas les couleurs, le contraste reste vérifié en navigateur |
| Poids JS par route | baseline committée ([`route-weight-baseline.json`](plans/route-weight-baseline.json:1)), contrôle automatique au gate (si build local) **et** en CI après build : échec > **+5 %**, alerte > +2 % — `npm run audit:route-weight` + [`revue-poids-routes.md`](plans/revue-poids-routes.md:1) |
| Hygiène des images | garde-fou statique [`image-usage.test.ts`](src/lib/image-usage.test.ts:1) : aucune `<img>` brute dans `src/`, toute `<Image fill>` déclare `sizes`, toute `<Image>` réserve sa place (width/height, fill, ou spread assumé) — exécuté par `npm run test`, donc par la CI |
| Tout le reste | `npm run studio:gate:full` **et** la CI ([`ci.yml`](.github/workflows/ci.yml:1)) |

## Priorité 1 — finir la publication — ✅ tenu (2026-09-23)

**Statut HTTP 404 pour une page non publiée.** Voie A livrée : porte serveur
`getPublicPageContent()` (404 réel pour un brouillon ; replis certifiés intacts), aperçu sur
route dédiée `/[locale]/preview` gardée par la session admin (+ garde de statut au proxy),
`buildPreviewUrl()` pointé dessus. Statuts ○/◐ des 15 routes conservés, mécanisme vérifié au
runtime. Détail et preuves : [`revue-diffusion-brouillons.md`](plans/revue-diffusion-brouillons.md:1) § 6.

## Priorité 2 — sécurité des données — ✅ tenu (2026-09-23)

**Policy RLS publique de `site_pages`.** Faille fermée : lecture publique = `is_published = true`
(anon + authenticated), écrite dans [`migration_site_pages_rls.sql`](scripts/migration_site_pages_rls.sql:1)
et **appliquée**. Vérifiée **sans dépendre de l'API** par une sonde Postgres qui endosse le
rôle `anon` avec une ligne brouillon témoin dans une transaction annulée : avant, le brouillon
était visible ; après, **0 brouillon / 15 publiées intactes**. La porte 404 sous RLS (état
service role) et l'aperçu client admin étaient livrés avant. Sonde REST à rejouer au
rétablissement de l'API Data (le 2026-09-23 : **402 `exceed_storage_size_quota`**, quota
d'organisation dépassé — actions : plan/spend caps + purge du stockage, `npm run media:audit`).
Détail et preuves : [`revue-rls-site-pages.md`](plans/revue-rls-site-pages.md:1).

## Priorité 3 — qualité mesurable (impact large, effort faible)

1. **Accessibilité — ✅ tenu (2026-09-23)** : audit automatisé livré sur 3 surfaces
   (accueil, formation, contact), zéro violation `serious`/`critical` — voir « Déjà tenu ».
   Reste hors couverture locale le contraste (jsdom) : à contrôler en navigateur.
2. **Poids des images — ✅ tenu (2026-09-23)** : garde-fou statique livré,
   [`image-usage.test.ts`](src/lib/image-usage.test.ts:1) — `<img>` brute interdite dans `src/`,
   `<Image fill>` sans `sizes` refusée, `<Image>` sans réserve de place refusée ; détecteur validé
   par contrôle négatif sur sources synthétiques ; **0 violation** sur le code existant
   (voir « Déjà tenu »).
3. **Budgets chiffrés — ✅ tenu (2026-09-23)** : seuil de poids JS par route livré
   (baseline + gate + CI, échec > +5 %) — voir « Déjà tenu ».

## Priorité 4 — contenu et acquisition

1. **JSON-LD enrichi — ✅ tenu (2026-09-23)** : `EducationalOrganization` + `WebSite` dans la
   coquille ([`RootShell.tsx`](src/components/layout/RootShell.tsx:26)), `Course` branché sur la page
   formation ([`formation-de-cascadeur/page.tsx`](<src/app/(site)/[locale]/formation-de-cascadeur/page.tsx:35>)),
   `VideoObject` sur la page vidéos. `FAQPage` : **sans objet** — aucune question/réponse réelle
   sur les pages à ce jour (aucun balisage inventé).
2. **Partage social — ✅ tenu (2026-09-23)** : OG dynamique des fiches coach
   ([`opengraph-image.tsx`](<src/app/(site)/[locale]/equipe-cascadeurs-pro/[slug]/opengraph-image.tsx:1>)
   — nom, fonction, spécialités, repli générique sur slug inconnu), livrée comme lot 1 du plan de
   finalisation (commit `b6668a2`). **Cartes de route bilingues** : les 14 `opengraph-image.tsx`
   des pages publiques lisaient une copie **française en dur** (une page `/en/…` partageait une
   vignette française) — elles lisent désormais `params.locale` via le catalogue unique
   [`route-og-copy.ts`](src/lib/og/route-og-copy.ts:1) (FR repris verbatim, EN reprenant les
   libellés déjà validés par les overlays `site_translations`), avec le repère géographique
   localisé dans [`renderOgImage`](src/lib/og-image.tsx:26). Garde-fou :
   [`route-og-copy.test.ts`](src/lib/og/route-og-copy.test.ts:1) (les deux langues existent, l'EN
   n'est jamais une copie du FR, chaque route reste branchée sur le catalogue). **Preuve runtime** :
   4 routes sondées sur le serveur de production local → 4/4 servent un PNG FR **et** un PNG EN
   distincts (200, `image/png`).

   *Constats de la même sonde (à traiter hors code)* :
   - `www.campus-universcascades.com` sert encore **l'ancien WordPress** (`wp-content`, WP Rocket) :
     toutes les URLs absolues (og:image, canonical, sitemap) ne seront exactes qu'après la bascule
     DNS vers le déploiement Next ;
   - `twitter:image` reste l'image générique Supabase (`slider-8-scaled.jpg`) — l'image par défaut
     masque la carte de route côté Twitter/X ; à arbitrer (la carte de route est déjà bilingue).
3. **Contenu — ✅ mesuré et complété (2026-09-23)** : couverture EN **100 % (226/226)** ;
   au passage, la coquille FR « DEPUIS 20008 » (`hero.since`, accueil) et son équivalent EN
   « SINCE 2008 » ont été corrigés. Restent **28 composants** avec copie FR en dur —
   majoritairement éditeurs 3D/admin et cas techniques (OG, erreur globale) : lot éditorial à
   ouvrir seulement si besoin ([`revue-traductions-manquantes.md`](plans/revue-traductions-manquantes.md:1)).

## Priorité 5 — outillage éditorial (confort, pas urgence)

1. **Brouillons multiples nommés** : le filet local n'en garde qu'un par page et par langue ;
   un historique local (3 versions) éviterait les regrets.
2. **Planification de publication** : `is_published` est binaire ; une date de publication
   éviterait les republications manuelles (cron + champ `publish_at`).
3. **Aperçu multi-appareils synchronisé** : le sélecteur PC/tablette/smartphone est déjà là ;
   un défilement synchronisé entre tailles serait le confort suivant.

## Règles de conduite pour la suite (non négociables)

- **Une seule source de vérité par sujet** : métadonnées (`buildRouteMetadata`), fusion
  bilingue (`localized-merge`), libellés (`microcopy`), champs éditables (`cucField`).
- **Aucun faux contrôle** : si un bouton ne fait pas ce qu'il annonce, soit on le corrige, soit
  on l'écrit — comme pour la publication.
- **Tout ce qui est mesuré est publié** : les audits écrivent leurs rapports dans `plans/`, la
  CI échoue sur les contrôles bloquants, la dette restante est chiffrée et datée.
