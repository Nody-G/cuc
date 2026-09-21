# Revue — Médiathèque Supabase Storage (diagnostic et refonte)

Mesuré le 21/09/2026 avec `node scripts/audit_storage_usage.mjs` (lecture seule, clé service).

## 1. Diagnostic — pourquoi la médiathèque paraît vide

`listMediaFiles()` (`src/app/(admin)/admin/actions.ts`) ne listait **qu'un seul dossier** :

| Limite constatée | Conséquence |
| --- | --- |
| `bucket.from('cuc-vitrine-assets').list('uploads', …)` | un seul préfixe exploré |
| `limit: 100`, `offset: 0` | au-delà de 100 objets, le reste invisible |
| aucun parcours récursif | les sous-dossiers n'apparaissent jamais |
| filtre `.emptyFolderPlaceholder` uniquement | pas de distinction dossiers/fichiers |

Or le dossier `uploads/` **n'existe même pas** dans le bucket : la seule zone alimentée par le
téléversement du cockpit. Le catalogue réel vit sous `media/**`.

## 2. Inventaire réel du bucket `cuc-vitrine-assets`

**175 objets — 217,45 Mo**, tous **référencés** (aucun orphelin au 21/09/2026).

| Dossier | Objets | Poids | Part |
| --- | --- | --- | --- |
| `media/reportages` | 3 | 127,05 Mo | 58,4 % |
| `media/cuc-visual` | 135 | 77,86 Mo | 35,8 % |
| `media/document` | 5 | 9,36 Mo | 4,3 % |
| `media/partner-logo` | 32 | 3,17 Mo | 1,5 % |

URLs Storage référencées : **246** au total — 225 dans le code source, 74 dans les tables
(`site_pages`, `site_films`, `site_team`, `site_events`, `site_settings`, `site_campus_pois`,
`site_partners`, `site_sessions`).

Constats complémentaires :

- Les affiches de films du catalogue **ne sont pas** hébergées sur Supabase (elles pointent vers
  `m.media-amazon.com`) : une future migration d'images y gagnerait, mais ce n'est pas le sujet ici.
- `media/reportages` pèse à lui seul plus de la moitié du bucket avec 3 vidéos : le candidat
  naturel à un transcodage/archivage, pas à une suppression (les 3 sont référencées).

## 3. Décisions de refonte

1. **Parcours récursif paginé** de tout le bucket côté serveur (`listMediaTree`), avec agrégat
   `{ objets, poids }` par dossier : c'est ce que la médiathèque affichera dès l'ouverture.
2. **Explorateur unique partagé** (`MediaExplorer`) entre l'onglet Médiathèque et le sélecteur
   d'image des 7 vues du cockpit (Pages, Disciplines, Événements, Films, Équipe, Partenaires,
   Zones du campus) : dossiers, recherche, filtres, tri, vues grille/liste, sélection multiple,
   panneau détail, glisser-déposer.
3. **Intelligence d'usage** : chaque objet est confronté à l'index des URLs réellement référencées
   en base → badge « Utilisé par N ressources » ou « Non référencé ». La suppression d'un média
   référencé exige une confirmation explicite.
4. **Suppression réversible** : par défaut les fichiers partent dans `_trash/AAAA-MM-JJ/` du même
   bucket (récupérables), l'effacement définitif étant une action distincte.
5. **Création de dossier** : Supabase Storage n'a pas de dossiers réels ; un dossier est matérialisé
   par un objet sentinelle `.emptyFolderPlaceholder`, que l'explorateur masque.
6. **Performance** : pagination par curseur, recherche différée (`useDeferredValue`), cache mémoire
   par dossier, `next/image` avec `sizes` et `loading="lazy"`, rendu par pages de 60, squelettes.

## 4. Livré

| Brique | Fichier | Rôle |
| --- | --- | --- |
| Socle serveur | `src/app/(admin)/admin/actions.ts` | `listMediaFolder` (tri/recherche/pagination), `listMediaTree` (parcours récursif + agrégats), `getMediaReferences` (index d'usage en base), `createMediaFolder`, `moveMediaObjects`, `deleteMediaObjects` (corbeille ou définitif), `uploadMediaFile(folder)` ; `listMediaFiles` conserve son contrat mais couvre tout le catalogue |
| Contrats partagés | `src/app/(admin)/admin/media-shared.ts` | types `MediaObject`/`MediaFolderStat`, `mediaKind`, `formatBytes`, `filterMedia` (module pur, hors `'use server'`) |
| Explorateur | `src/app/(admin)/admin/components/media/MediaExplorer.tsx` | arborescence + fil d'Ariane, recherche globale différée, filtres par type, tri nom/date/poids, vues grille et liste, sélection multiple (clic/shift), actions groupées, panneau détail, glisser-déposer, corbeille |
| Onglet Médiathèque | `src/app/(admin)/admin/components/MediaLibraryView.tsx` | en-tête + explorateur en mode `manage` |
| Sélecteur d'image | `src/app/(admin)/admin/components/MediaPickerModal.tsx` | explorateur en mode `pick` (props inchangées pour les 7 vues) |

## 5. Vérifications

- `npm run typecheck` → **OK**
- `npm run lint` → **0 erreur** (warnings préexistants uniquement)
- `/admin` et `/admin?tab=media` → **HTTP 200**
- Lecture du bucket via `scripts/audit_storage_usage.mjs` : **175 objets / 217,45 Mo**, 0 orphelin
- Reste à faire par l'utilisateur : parcours manuel dans le Cockpit (téléverser, déplacer, mettre à
  la corbeille, restaurer depuis `_trash`, vérifier qu'une image référencée déclenche bien
  l'avertissement) — la corbeille n'étant jamais supprimée automatiquement, la restauration se fait
  par déplacement inverse dans le même navigateur.
