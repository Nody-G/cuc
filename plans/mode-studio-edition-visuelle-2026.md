# Plan — Mode Studio : édition visuelle en place de la vitrine

> Périmètre validé : **les 15 pages**, édition en place **texte + image + listes**,
> **FR et EN**, durcissement **Realtime / performance** dans le même chantier.
>
> Modèle retenu : **brouillon local, écriture unique à l'enregistrement, publication
> par invalidation ciblée.** L'édition ne touche jamais la base pendant la frappe.

---

## 1. Objectif

Un mode plein écran du Cockpit où l'on voit la **vraie page vitrine** (iframe
same-origin) et où chaque élément éditorial est **modifiable sur place** : clic sur
un texte → saisie directe, clic sur une image → remplacement, listes → ajout /
suppression / réordonnancement. Le tout sans rechargement, sans écriture tant que
l'on n'enregistre pas, avec retour arrière et bascule FR | EN.

## 2. Ce qui existe déjà (à réutiliser, jamais à réécrire)

| Élément | Fichier | Rôle |
| --- | --- | --- |
| Pont de prévisualisation | [`PreviewBridgeClient`](../src/components/preview/PreviewBridgeClient.tsx) | Reçoit le brouillon via `postMessage`, surligne `[data-cuc-field]`, signale le clic. Inerte hors iframe. |
| Hook de liaison | [`usePreviewBridge`](../src/lib/hooks/usePreviewBridge.ts) | Protocole actuel : `draft`, `ready`, `field-focus`, `field-hover`. Re-publication à chaque modification. |
| Store de brouillon | [`preview-store.ts`](../src/lib/preview/preview-store.ts) | Publication locale du brouillon aux abonnés (`usePageDynamicContent`). |
| Aperçu live | [`LivePreviewPane`](../src/app/(admin)/admin/components/pages-editor/LivePreviewPane.tsx) | Iframe page réelle, device switcher, reload. |
| Éditeur de pages | [`PagesEditorView`](../src/app/(admin)/admin/components/PagesEditorView.tsx) | 4 onglets, 8 sous-éditeurs, bascule FR | EN, scroll/focus sur champ cliqué. |
| Contrat de localisation | [`useEntityTranslation`](../src/lib/hooks/useEntityTranslation.ts) + [`localized-merge.ts`](../src/lib/i18n/localized-merge.ts) | Hydratation, diff, garde de divergence, aucune valeur vide publiée. |
| Lecture publique | [`server.ts`](../src/lib/i18n/server.ts) | `'use cache'` + `cacheLife('max')` + `cacheTag` : Supabase lu au cache-miss, jamais par visiteur. |
| Realtime | [`createSafeChannel`](../src/lib/supabase/realtime.ts) | Canaux sûrs à nom unique ; aujourd'hui un canal par montage et par table. |

## 3. Modèle d'écriture et budget performance (critères d'acceptation)

| Règle | Cible |
| --- | --- |
| Écritures pendant la frappe | **0** — le brouillon vit en mémoire Cockpit + iframe. |
| Écriture à l'enregistrement | **1 upsert** `site_pages` (+ 1 ligne `site_page_revisions` si enregistrement explicite). |
| Lecture publique nominale | **0 requête Supabase** (cache de tags Next, invalidation ciblée). |
| Canaux Realtime | **1 canal maximum par navigateur** (multiplexage), réservé admin / aperçu. |
| Médias | Storage + `next/image` (TTL 30 j déjà configuré), jamais de base64 en base. |
| Invalidation | `revalidateTag` / `updateTag` sur `site_pages`, `site_translations`, `page:<slug>`, `locale:<locale>` + chemins FR **et** EN. |

## 4. Protocole postMessage v2 — `usePreviewBridge`

```ts
export type PreviewMessage =
  | { channel: 'cuc-preview'; v: 2; type: 'ready' }
  | { channel: 'cuc-preview'; v: 2; type: 'mode'; payload: 'inspect' | 'edit' }
  | { channel: 'cuc-preview'; v: 2; type: 'draft'; payload: SitePageContent }
  | { channel: 'cuc-preview'; v: 2; type: 'field-hover'; field: string | null }
  | { channel: 'cuc-preview'; v: 2; type: 'field-select'; field: string }
  | { channel: 'cuc-preview'; v: 2; type: 'field-commit'; field: string; value: string }
  | { channel: 'cuc-preview'; v: 2; type: 'list-command'; field: string; command: 'add' | 'remove' | 'move-up' | 'move-down' | 'duplicate'; index: number }
  | { channel: 'cuc-preview'; v: 2; type: 'media-request'; field: string }
  | { channel: 'cuc-preview'; v: 2; type: 'media-commit'; field: string; url: string };
```

Invariants :

1. **Origine stricte** des deux côtés : `event.origin === window.location.origin`,
   cible d'envoi explicite (plus de `'*'` pour le canal d'édition).
2. **Inertie hors iframe** : aucun comportement en navigation publique.
3. **Aucun commit si la valeur est inchangée** (pas d'écriture de brouillon inutile).
4. Le brouillon reste un `SitePageContent` **complet et valide** : la fusion et le
   diff passent exclusivement par [`localized-merge.ts`](../src/lib/i18n/localized-merge.ts).

## 5. Registre des champs éditables

- `data-cuc-field` = chemin canonique (`sections_data.<bloc>.<clé>`, `hero.<clé>`, …).
- `data-cuc-kind` = `text | textarea | image | link | list-item` — le pont choisit
  le widget sans deviner.
- Nouveau script `scripts/audit_cuc_fields.mjs` : recense les annotations par page,
  croise avec les champs connus des éditeurs, **sort en code 2 si une page n'a
  aucune annotation**. Rapport : `plans/revue-couverture-champs-visuels.md`.
- Règle : un champ non annoté **n'est pas éditable** — la couverture est mesurée,
  jamais supposée (un champ qui *paraît* éditable sans l'être détruit la confiance).

## 6. Couche d'édition en place dans l'iframe

- **Primitive texte** : `input` / `textarea` **positionné en overlay** au-dessus de
  l'élément cible (mesure `getBoundingClientRect`, recalcul au scroll/resize).
  Jamais de `contentEditable` sur un nœud rendu par React : la réconciliation
  écraserait le DOM et corromprait l'aperçu.
- **Commit** : Entrée (mono-ligne), Cmd/Ctrl+Entrée ou blur (multi-lignes), Échap
  annule. Le texte reste **brut** (sauts de ligne autorisés) : pas de HTML, donc
  pas de sanitisation et aucune mise en forme inventée.
- **Liens** : popover d'URL, validé (chemin interne ou URL absolue).
- **Images** : bouton « Remplacer » → message `media-request` → le Cockpit ouvre
  [`MediaPickerModal`](../src/app/(admin)/admin/components/MediaPickerModal.tsx:22)
  → `media-commit`. La médiathèque reste la seule source des médias.
- **Listes** : l'inspecteur latéral expose ajouter / supprimer / monter / descendre /
  dupliquer. Chaque item est recomposé complet (ancres `id`, images, ordres repris
  du FR) et le **tableau entier** est écrit — doctrine « un tableau s'écrit en bloc ».
- **Historique** : pile undo/redo en mémoire dans le Cockpit ; `site_page_revisions`
  ne reçoit qu'une ligne par enregistrement explicite (jamais par autosave).

## 7. Mode Studio dans le Cockpit

- Vue **plein écran** dédiée : iframe page réelle + inspecteur latéral + bascule
  FR | EN (réutilise [`LocaleToggle`](../src/app/(admin)/admin/components/ui/LocaleToggle.tsx))
  - device switcher + panneau des modifications non enregistrées + Enregistrer / Publier.
- Entrée dans la navigation du Cockpit et dans la palette de commandes.
- **EN** : les commits écrivent dans `translation.localized` ; l'enregistrement passe
  par le diff existant (aucune valeur vide, tableaux complets, divergence signalée).
  Le badge de couverture EN s'affiche dans la vue.
- L'onglet « Mise en page » reste verrouillé en EN (identique au contrat actuel).

## 8. Couverture des 15 pages (lots)

| Lot | Pages |
| --- | --- |
| L1 | `/` — accueil : compléter hero, statistiques, sections non annotées, listes |
| L2 | `formation-de-cascadeur`, `stages-cascades-parkour-2`, `stunt-workshop-cuc` |
| L3 | `equipe-cascadeurs-pro`, `partenaires`, `contact-cuc` |
| L4 | `cuc-events-agence`, `team-building-cascades`, `spectacles-cascadeurs-yamakasi`, `animations-airbag-parkour` |
| L5 | `visite-virtuelle`, `visite-guidee`, `videos-cascadeur`, `cuc-team-cascadeur` |

Chaque lot : annoter les composants, vérifier la couverture par script, contrôler
l'édition en place (texte, image, liste), consigner les champs volontairement non
éditables.

## 9. Durcissement performance (même chantier)

1. **Multiplexage Realtime** : un seul canal par client, tous les
   `postgres_changes` regroupés ; hors admin / aperçu, Realtime désactivé ou limité.
   Le Realtime reste un confort — jamais une dépendance dure (doctrine `realtime.ts`).
2. **Aperçu allégé** : `?cuc-preview=1` coupe le Realtime **et** les effets lourds
   (3D, parallax, autoplay vidéo) dans l'iframe uniquement. La page publique n'est
   pas modifiée.
3. **Invalidation exacte** : tags + chemins localisés FR et EN après chaque écriture
   (aujourd'hui seuls quelques chemins FR sont revalidés).

## 10. Vérification / gate

- `node scripts/audit_cuc_fields.mjs` — couverture 15/15, exit 2 sinon.
- `npx vitest run` — protocole, commit, listes, fusion EN, inertie hors iframe.
- `npm run typecheck`, `npm run lint`, `npm run build`.
- `node scripts/probe_public_routes.mjs http://localhost:3000` — aucune régression publique.
- Mesure du budget : 0 requête publique nominale, 1 canal Realtime max, 1 upsert par enregistrement.

## 11. Non-objectifs et risques

- **Pas de HTML riche** : texte brut + sauts de ligne. Aucune mise en forme inventée.
- **Aucune création de structure** depuis la page : `layout_sections` reste géré par
  le Cockpit ; le Mode Studio édite le contenu, pas l'architecture de page.
- **Un champ non annoté n'est pas éditable** : la couverture est un livrable mesuré.
- **Divergence de structure EN** : aucune écriture, signalement explicite (doctrine i18n).
- **Effets lourds dans l'iframe** : traités par `?cuc-preview=1`, jamais par
  suppression d'effets sur la vitrine publique.
