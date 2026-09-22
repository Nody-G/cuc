NDE# Plan — Rendre le « chrome » éditable dans l'aperçu (réglages + micro-textes)

> État : **canaux « réglages » et « micro-textes » livrés, durcis et déployés sur tout
> le site statique** — protocole (`settings-draft`, `microcopy-draft`, `field-commit` avec
> source), tranches chrome du `preview-store`, hooks d'affichage, `PreviewIntlProvider`
> (fusion du catalogue par la même fonction que le serveur), commit/brouillon dans le
> Cockpit et sauvegarde par clé (`updateSiteSettingField`, `updateMicrocopyOverrideField`).
> Quatre garanties serveur : clé de catalogue inconnue **refusée** (`isMicrocopyKey`),
> brouillon chrome conservé si un enregistrement partiel échoue, filet local par locale
> (`chrome-draft-storage`), micro-textes segmentés par locale d'édition.
> **Couverture** : l'audit (`audit:microcopy`) mesure **306 textes annotés**, 0 codé en
> dur ; les 14 valeurs restantes en catégorie « traduction » sont **dynamiques par
> nature** (interpolations `{digest}` / `{name}`, index `options.${id}`,
> `statuses[session.status]`, données d'entités via `localizer(partner)`), hors périmètre
> d'une surcharge statique.
> **Canal d'entité livré** : pilote complet sur la **bannière d'annonce** —
> `data-cuc-entity="<table>:<id>:<champ>"` (`entity-ref.ts`), commit `source: 'entity'`,
> brouillon poussé par `entity-draft`, écriture serveur sous **liste blanche**
> (`updateEntityField`), filet local étendu aux entités. L'extension aux autres entités
> suit la même recette (§ 4).

## 1. Le problème, tel qu'il se vit

Dans l'aperçu, l'utilisateur voit « Contact & Projets » (navbar), les accroches du pied de
page ou un libellé de bouton de formulaire et **ne peut pas** les éditer en place : ils ne
vivent pas dans le contenu de page mais dans :

| Source | Stockage | Écran actuel |
| --- | --- | --- |
| Réglages du site | `site_settings` | Paramètres Globaux |
| Navigation | `site_navigation` | Navigation & Menus |
| Pied de page | `site_settings` (footer) | Pied de Page |
| Réseaux | `site_social_links` | Réseaux Sociaux |
| Catalogue i18n | `site_settings.microcopy_overrides` | Micro-textes du site |

Deux brouillons distincts, deux boutons d'enregistrement : c'est une séparation de
**stockage** (justifiée), mais pas une séparation d'**expérience** pour l'utilisateur.

## 2. Conception experte (protocole v3, une seule couche)

### 2.1 Vocabulaire d'annotation (vitrine)

- `data-cuc-setting="<clé>"` — un texte rendu depuis `site_settings`
  (ex. `hero_primary_cta_text`, `hero_primary_cta_url`).
- `data-cuc-micro="<namespace.clé>"` — un texte rendu par `t('…')` et surchargeable
  (le namespace est celui du `useTranslations` du composant).
- `data-cuc-entity="<table>:<id>:<champ>"` — un texte rendu depuis une **entité de la
  base** (pilote : bannière d'annonce, `site_announcements`). La référence est canonique
  (`entity-ref.ts`) et l'écriture passe par la **liste blanche** serveur
  (`actions/entities.ts`).
- Les natures : `text` (défaut), `textarea`, `link` — mêmes overlays que l'existant.

**Règle d'or conservée** : un texte **donnée de page** reste `data-cuc-field` (priorité au
brouillon de page) ; on n'annote jamais deux fois le même nœud.

### 2.2 Protocole (v3, rétro-compatible)

Deux messages s'ajoutent aux fabriques de `src/lib/preview/preview-protocol.ts` :

- parent → iframe : `chrome-draft` `{ settings?: Record<string, string>; microcopy?: Record<string, string> }`
  (le sous-ensemble **localisé** de la locale active) ;
- iframe → parent : `chrome-commit` `{ source: 'setting' | 'microcopy'; key: string; value: string }`.

La normalisation des bundles hérités reste la même : un parseur qui ignore l'inconnu. Les
messages v2 continuent de fonctionner → **aucune fenêtre de panne** au déploiement.

### 2.3 Côté vitrine (iframe)

- `preview-store` gagne une seconde tranche `chrome` (mêmes abonnements, même portée
  d'aperçu). Aucun accès base : c'est un brouillon, comme le reste.
- Nouveau `PreviewChromeProvider` (client, monté **hors** iframe = inerte) :
  - `messages` : `mergeMicrocopyOverrides(messages, chrome.microcopy)` — la fusion existe
    déjà (`src/lib/i18n/microcopy.ts`), on la réutilise telle quelle ;
  - `settings` : expose `useSettingValue(key)` qui rend la surcharge si présente, sinon la
    valeur serveur. Les composants de chrome consomment ce hook **au lieu** de leur état
    local quand ils sont dans l'aperçu.
- Les composants concernés (première vague, à valeur maximale) : `NavActionsBar`
  (CTA + téléphone), `Navbar` (déjà allégé), `Footer*`, `AnnouncementBanner`,
  `ContactCoordinatesSidebar` (coordonnées), `ApplicationModal`/`ContactForm` (libellés).
- Limite assumée et documentée : un texte rendu par un **composant serveur** ne se met pas à
  jour sans rechargement ; l'aperçu push alors un `reload` ciblé (déjà supporté par
  `previewKey`) pour ces nœuds-là — jamais pour le reste.

### 2.4 Côté Cockpit (parent)

- `PagesEditorView` (ou un `useChromePreviewDraft` dédié, § SRP) tient un brouillon chrome :
  `{ settings: Map<clé, valeur>, microcopy: Map<clé, valeur> }`, avec les mêmes garanties que
  le brouillon de page :
  - **jamais de valeur vide publiée** : vider un champ microtexte **retire** la surcharge ;
    vider un réglage revient à la valeur d'usine (confirmation), jamais une chaîne vide ;
  - undo/redo et inspecteur de modifications : réutiliser `draft-diff` en l'étendant d'une
    seconde entrée de domaine ;
  - persistance locale (`chrome-draft-storage.ts`) : même filet que le contenu de page,
    **par locale** — un micro-texte appartient à une langue et n'est jamais rejoué dans
    l'autre.
- Bouton « Enregistrer » : il devient un **enregistrement composé** —
  `upsertPageContent` (si brouillon page) puis `saveSiteSettings` / `saveMicrocopyOverrides`
  (si brouillon chrome), dans cet ordre, avec un seul toast de bilan. En cas d'échec partiel,
  le brouillon chrome est conservé et l'erreur nomme la source.
- Conflit : `site_settings.updated_at` et l'`updated_at` par entité microtexte servent de
  garde (même tolérance 2 s que les pages).

### 2.5 Sécurité et invariants

- Origine vérifiée des deux côtés (inchangé) ; aucune écriture base depuis l'iframe.
- Une surcharge microtexte ne peut **corriger** qu'une clé existante du catalogue (règle
  canonique `site_microcopy.md` § 2.3). Le garde-fou est **serveur**, au moment de
  l'écriture : `updateMicrocopyOverrideField` refuse toute clé absente des catalogues via
  `isMicrocopyKey` (une valeur vidée reste permise : c'est un retrait).
- Un réglage inconnu (`key` hors `SiteSettings`) est refusé : pas de structure inventée.
- Une entité n'est éditable que si son couple `(table, champ)` figure dans la liste
  blanche de `actions/entities.ts` ; une valeur vidée est **refusée** (elle effacerait un
  texte servi publiquement — retirer une annonce se fait dans son écran dédié).
- Priorité d'affichage dans la vitrine : brouillon chrome (aperçu) > serveur ;
  contenu de page (`data-cuc-field`) reste prioritaire sur `data-cuc-micro` quand les deux
  pourraient coexister (jamais sur le même nœud).

## 3. Découpage en lots livrables

| Lot | Contenu | État |
| --- | --- | --- |
| L1 | Protocole (`settings-draft`, `field-commit` avec source) + tests parseur | ✅ livré |
| L2 | `preview-store` : tranche chrome (surcharges de réglages) + tests | ✅ livré |
| L3 | Hook d'affichage `usePreviewSettings` + surcharge appliquée dans la navbar | ✅ livré (réglages) |
| L4 | Annotations : CTA navbar, téléphone, e-mail, CTA mobile (FR/EN selon la langue), adresse carte livrés ; reste annonces et horaires | ✅ livré |
| L5 | Commit chrome → brouillon Cockpit (source respectée, valeur vidée = retour au défaut/catalogue) | ✅ livré |
| L6 | Enregistrement composé (page + chrome, un bouton, échec nommé et conservé) | ✅ livré |
| L7 | Micro-textes en place : canal livré (`microcopy-draft`, `PreviewIntlProvider`, sauvegarde par clé) + **extension achevée** sur tout le statique (pied de page, formulaires, héros, modales, pages, cartes, visionneuses) | ✅ livré |
| L8 | Garde-fou serveur : clé absente du catalogue refusée (`isMicrocopyKey` + test) | ✅ livré |
| L9 | Filet local du brouillon chrome (`chrome-draft-storage.ts`, hook, tests) + micro-textes segmentés par locale | ✅ livré |
| L10 | Canal d'entité : pilote bannière d'annonce (`data-cuc-entity`, `entity-draft`, commit `entity`, liste blanche serveur, filet local étendu) | ✅ livré |

## 4. Ce qui ne rentre pas dans ce chantier

- L'**extension** du canal d'entité aux coachs et films : la recette est en place
  (une ligne de liste blanche + annotations `cucEntity`), les traductions d'entités
  (overlays EN) restant gérées par leurs écrans dédiés.
- Les contenus purement SEO (`meta_*`) : invisibles dans la page, ils restent dans
  l'onglet SEO (c'est leur nature).

## 5. Pourquoi ce plan plutôt qu'un raccourci

Écrire les surcharges dans le brouillon de page (spread `settings.*` dans
`SitePageContent`) serait rapide mais faux : rien ne les afficherait dans la vitrine
(navbar et footer lisent `site_settings` par leur propre canal) et le payload de page
partirait en base avec des clés étrangères. Le canal dédié est la seule voie qui respecte
« une seule source par sujet » et « aucune écriture base depuis l'aperçu ».
