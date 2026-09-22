# Feuille de route — site CUC (2026)

**But** : garder le site rapide, vrai et durable. Ce document liste ce qui reste à faire,
classé par **impact réel × effort**, avec pour chaque sujet la source de vérité du code et la
vérification attendue. Rien n'est « prévu » sans un endroit précis où le constater.

## Déjà tenu (ne pas régresser)

| Sujet | Garde-fou |
| --- | --- |
| Performance publique | pages prérendues (statiques/PPR), lectures `'use cache'` + tags, un seul WebSocket par visiteur — `npm run audit:budget` |
| Édition en place | 15/15 pages couvertes, standards de saisie (typographie miroir, `Tab`, étiquette, repli visible) — `npm run audit:fields` + tests |
| Textes | 560 libellés éditables, **0 texte codé en dur** — `npm run audit:microcopy` |
| Bilingue | fusion FR + overlay unique (`localized-merge`), invariants testés |
| Panne de lecture | copie certifiée servie (jamais de page morte) |
| Édition sans perte | filet local du brouillon + garde de concurrence à l'enregistrement |
| Publication | sitemap, rendu, `robots: noindex`, aperçu — quatre points alignés |
| Tout le reste | `npm run studio:gate:full` **et** la CI ([`ci.yml`](.github/workflows/ci.yml:1)) |

## Priorité 1 — finir la publication (le seul trou connu)

**Statut HTTP 404 pour une page non publiée.** Aujourd'hui : contenu non rendu, hors sitemap,
hors index, mais réponse `200`. Deux voies chiffrées dans
[`plans/revue-diffusion-brouillons.md`](plans/revue-diffusion-brouillons.md:1).

- Recommandation : **voie A** (extraire le JSX des 15 routes en composants, puis
  `/preview/[slug]` gardé par la session admin et `notFound()` public). Elle règle le 404 *et*
  isole l'aperçu, sans dépendre d'un secret partagé.
- Effort : mécanique mais large (15 fichiers). À faire seule, sans mélange.

## Priorité 2 — sécurité des données (à instruire avant d'ouvrir l'écriture à plus de monde)

**Policy RLS publique de `site_pages`.** Elle est aujourd'hui `FOR SELECT USING (true)` : un
client anonyme peut lire un brouillon. La réserver à `is_published = true` ferme le dernier
accès direct aux brouillons… **mais attention au piège** : une ligne absente et une ligne
dépubliée deviennent indistinguables, or le code traite « absent » par un repli certifié — un
brouillon s'afficherait donc avec le contenu de référence. **La policy ne doit être posée
qu'après** le 404 de la priorité 1 (qui fera de « absent » une réponse explicite).

## Priorité 3 — qualité mesurable (impact large, effort faible)

1. **Accessibilité** : aucun audit automatisé n'existe. Ajouter `axe-core` sur 3 pages clés
   (accueil, formation, contact) en test de composant, et viser zéro violation sérieuse
   (`serious`/`critical`). C'est le seul axe de qualité non couvert par une mesure.
2. **Poids des images** : `scripts/add_image_sizes.mjs` existe ; vérifier que toute nouvelle
   image passe par `next/image` avec `sizes` (un test statique peut le garantir).
3. **Budgets chiffrés** : ajouter au gate un seuil de poids JS par route (`.next` build
   report) pour détecter une dérive silencieuse.

## Priorité 4 — contenu et acquisition

1. **JSON-LD enrichi** : `EducationalOrganization` et `WebSite` sont en place ; ajouter
   `Course` (formations) et `FAQPage` (questions réellement présentes sur la page) — jamais de
   balisage inventé.
2. **Partage social** : les images OG par route existent ; vérifier la couverture OG sur les
   fiches coach (les pages les plus partagées).
3. **Contenu** : la dette éditoriale est à zéro côté libellés ; le prochain gain est la
   **couverture EN** des pages (`audit_i18n_completeness.mjs`) — publier l'anglais au même
   niveau que le français.

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
