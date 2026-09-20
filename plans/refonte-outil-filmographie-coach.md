# Refonte de l'outil Filmographie du formateur (Cockpit)

## 1. Le problème constaté

L'outil actuel est **inutilisable** pour trois raisons structurelles :

### A. La liste complète des crédits est invisible

La colonne de droite n'affiche que trois choses :

1. Une barre de recherche (vide tant qu'on ne tape rien)
2. Le **Catalogue** = uniquement les films **étoilés**
3. Les **Crédits hors catalogue** = uniquement les crédits **absents** du catalogue

**Trou béant** : un crédit qui **est** dans le catalogue mais **n'est pas** étoilé
n'apparaît **nulle part**. Pour Michel Bouis, 17 crédits sont dans ce cas : ils
sont comptés (« 202 crédits ») mais impossibles à voir, à cocher ou à étoiler.

### B. Aucun moyen clair de retirer un film du Catalogue

L'étoile du Catalogue appelle `toggleFeatured()`, mais rien n'indique visuellement
qu'elle **retire**. L'utilisateur ne trouve pas comment dé-étoiler.

### C. Impossible d'ajouter une référence absente du catalogue

La recherche « Ajouter un crédit » ne cherche que dans `site_films`. Si un film
manque au catalogue, on ne peut pas l'ajouter comme crédit du coach.

## 2. Objectif cible

Un **outil unique, lisible et complet** où l'utilisateur peut, pour un formateur :

- **Voir la totalité de ses crédits** (catalogue + hors catalogue), sans trou
- **Cocher/décocher** un film pour l'ajouter/retirer de sa filmographie
- **Étoiler/dé-étoiler** un film pour le mettre en avant sur la fiche publique
- **Réordonner** les films mis en avant (monter/descendre, ou glisser-déposer)
- **Ajouter une référence manquante** au catalogue directement depuis l'outil
- **Préciser le rôle** de chaque crédit (Cascadeur / Doublure / Coordinateur)

## 3. Architecture cible de l'interface

Trois zones verticales claires, dans la colonne droite :

```
┌─────────────────────────────────────────────────────────────┐
│  FILMOGRAPHIE DU FORMATEUR          [ 44 crédits · 6 en avant ]│
├─────────────────────────────────────────────────────────────┤
│  🔍 [ Rechercher un film du catalogue...            ]  [ + ] │  ← recherche + bouton "Créer la fiche"
├─────────────────────────────────────────────────────────────┤
│  ★ CATALOGUE — films mis en avant (ordre public)             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 1  Lupin (2021)          Cascadeur   [↑][↓][★ retirer]│  │
│  │ 2  Taxi 4 (2007)         Cascadeur   [↑][↓][★ retirer]│  │
│  └───────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ☑ TOUS LES CRÉDITS DU FORMATEUR (44)                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ ☑ Lupin (2021)        Cascadeur    [★] [🗑]           │  │  ← coché + étoilé
│  │ ☑ Taxi 4 (2007)       Cascadeur    [★] [🗑]           │  │
│  │ ☐ Mea Culpa (2014)    Cascadeur    [☆] [🗑]           │  │  ← coché, non étoilé
│  │ ☐ Angélique (2013)    Cascadeur    [☆] [🗑]           │  │  ← hors catalogue
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Principe clé** : la liste « TOUS LES CRÉDITS » est la **source unique de
vérité**. Elle contient *tous* les `notableCredits`, qu'ils soient dans le
catalogue ou non. Le Catalogue n'est qu'une **vue filtrée** (les étoilés).

## 4. Modèle de données (inchangé, doctrine respectée)

- `site_team.notable_credits` : `string[]` — **tous** les crédits du formateur,
  format `"Titre (Année) — Rôle"` ou `"Titre — Rôle"`.
- `site_team.featured_credits` : `string[]` — sous-ensemble ordonné, mis en avant.
- `site_team.credits_display_limit` : nombre affiché avant « voir plus ».
- Appariement **toujours** par titre normalisé via `creditTitleKey()`.

Aucune nouvelle table n'est nécessaire. Aucune migration SQL requise.

## 5. Détail des changements

### 5.1 Nouvelle liste unifiée « Tous les crédits »

Remplacer les deux blocs actuels (Catalogue + Crédits hors catalogue) par :

- **Catalogue** (haut) : les étoilés, ordonnés, avec ↑ ↓ et « retirer ».
- **Tous les crédits** (bas) : *tous* les `notableCredits`, avec :
  - une **case à cocher** = présent dans la filmographie (décocher = retirer)
  - une **étoile** = mis en avant (ajoute/retire de `featured_credits`)
  - un **badge** indiquant si le film est dans le catalogue ou non
  - un **sélecteur de rôle** (Cascadeur / Doublure / Coordinateur)
  - un **bouton supprimer** (corbeille) pour les crédits hors catalogue

### 5.2 Recherche + création de fiche manquante

- La barre de recherche cherche dans `site_films`.
- Si aucun résultat, afficher un bouton **« Créer la fiche "X" »** qui :
  - ouvre un mini-formulaire (titre, année, catégorie)
  - appelle `upsertFilm()` pour créer la fiche dans `site_films`
  - ajoute immédiatement le crédit au formateur
- Si un résultat existe, un clic l'ajoute à `notableCredits`.

### 5.3 Retrait explicite du Catalogue

- Bouton libellé **« Retirer »** (icône + texte) au lieu d'une étoile ambiguë.
- Le retrait enlève l'entrée de `featured_credits` **sans** toucher à
  `notable_credits` (le film reste dans la filmographie, juste plus en avant).

### 5.4 Réordonnancement

- Conserver ↑ / ↓ (fiable, accessible).
- Optionnel : glisser-déposer via HTML5 `draggable` sur les lignes du Catalogue.

## 6. Fichiers concernés

| Fichier | Nature |
| --- | --- |
| [`src/app/admin/components/TeamView.tsx`](src/app/admin/components/TeamView.tsx) | Refonte majeure de la colonne filmographie |
| [`src/app/admin/actions.ts`](src/app/admin/actions.ts) | Réutiliser `upsertFilm()` (déjà présent) |
| [`src/lib/credit-title.ts`](src/lib/credit-title.ts) | Déjà en place — normalisation |
| [`src/types/index.ts`](src/types/index.ts) | Aucun changement de type attendu |

## 7. Critères de réussite (vérifiables)

1. Pour Michel Bouis, **les 44 crédits sont visibles** dans « Tous les crédits ».
2. Chaque crédit affiche un badge **« Catalogue »** ou **« Hors catalogue »**.
3. Cliquer l'étoile d'un crédit l'ajoute au Catalogue ; re-cliquer le retire.
4. Le Catalogue affiche un bouton **« Retirer »** explicite par ligne.
5. Les flèches ↑ ↓ réordonnent le Catalogue et l'ordre est persisté.
6. Une recherche sans résultat propose **« Créer la fiche »** et l'ajoute.
7. `npm run typecheck && npm run build` passe (62 pages).
8. Vérification en base : `featured_credits` non vide après étoilage.

## 8. Ordre d'exécution

1. Ajouter les dérivés manquants (`allCredits`, `catalogueKeys`) dans `TeamView`.
2. Remplacer le bloc « Ajouter un crédit » par recherche + création de fiche.
3. Remplacer le bloc Catalogue par la liste ordonnée avec « Retirer ».
4. Remplacer « Crédits hors catalogue » par la liste unifiée « Tous les crédits ».
5. Nettoyer les imports/handlers devenus inutiles.
6. Typecheck + build.
7. Vérification en base sur Michel Bouis.
8. Commit + push.
