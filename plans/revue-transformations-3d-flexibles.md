# Revue — Transformations 3D flexibles des bâtiments (studio du Cockpit)

## 1. Demande initiale

> « je veux pouvoir agrandir tourner et modifier de manière flexible les bâtiments en 3D dans
> le cockpit en plus de pouvoir les déplacer »

Périmètre arbitré ensuite par l'opérateur :

> « Échelle uniquement retenue : largeur / hauteur / profondeur + verrou uniforme, et rotation Y.
> Je retire l'altitude Y, le tangage X et le roulis Z (gizmo : poignées d'échelle + anneau Y
> seulement). »

Le studio savait **déplacer** (X / Z), **tourner autour de l'axe vertical** et appliquer une
**échelle uniforme XZ** ainsi qu'une **hauteur relative**. Il ne savait pas redimensionner un
bâtiment **de façon indépendante sur ses trois axes**. C'est ce manque que cette revue corrige.

---

## 2. Diagnostic de l'existant

| Point | Constat |
| --- | --- |
| Modèle de données | [`EditableFacilityItem`](src/components/3d/types/campus3d.types.ts:29) ne portait que `scale` (uniforme XZ) et `heightScale` (Y), appliqués en [`campusSync.syncFacilitiesMeshes()`](src/components/3d/engine/campusSync.ts:185) |
| Gizmo | [`createCampusGizmo()`](src/components/3d/engine/useCampusGizmo.ts:203) exposait uniquement les flèches X / Z, un disque de glissement libre et l'anneau de lacet — **aucune poignée d'échelle** |
| Détection des poignées | [`findGizmoHandle()`](src/components/3d/engine/useCampusGizmo.ts:296) testait le **préfixe** `'gizmo-'` : les groupes conteneurs (`gizmo-rot-subgroup`, futurs `gizmo-scale-group`) portent ce préfixe et auraient été pris pour des poignées — une poignée fantôme capturant tous les clics |
| Taille du gizmo | Rayon du disque figé à 3,6 m, flèches à 8,5 m, couronne de mise en évidence à 8,5–9,2 m : dès qu'un bâtiment était agrandi, la couronne disparaissait **dans** le volume et les poignées devenaient inatteignables |
| Aimantation | Le glisser bornait la position à **±75 m** en dur ([`useCampusPointerDrag.ts`](src/components/3d/engine/useCampusPointerDrag.ts:144)). Or `site-tournage` est à **z = 106,63 m** : le premier glisser le **téléportait** à z = 75 |
| Retour arrière | Aucun historique : impossible d'annuler un placement malheureux |
| Initialisation des maillages | [`setupCampusBuildings()`](src/components/3d/engine/campusScene.ts:143) appliquait encore `item.scale` / `item.heightScale` de façon indépendante de la synchronisation — deux chemins de code pour une même transformée |

---

## 3. Modèle retenu

```ts
interface FacilityTransform {
  x: number;          // mètres, Est (+) / Ouest (−)
  z: number;          // mètres, Sud (+) / Nord (−)
  rotationY: number;  // degrés, lacet
  scaleX: number;     // facteur de largeur (axe local X)
  scaleY: number;     // facteur de hauteur (axe local Y)
  scaleZ: number;     // facteur de profondeur (axe local Z)
}
```

`EditableFacilityItem` = transformée + `id`, `name`, `code`, `uniformScale`, `visible`.

Ce qui a été **volontairement écarté** : `y` (altitude), `rotationX` (tangage), `rotationZ`
(roulis). Un bâtiment posé au sol ne se surélève ni ne se penche ; ces champs ont été retirés du
modèle, de l'UI, du gizmo et des raccourcis plutôt que laissés en place à ne rien faire.

### 3.1 Migration v1 → v2

La scène v1 appliquait `scale.set(scale, scale × heightScale, scale)`. La migration est donc
exacte, sans perte :

```
scaleX = scale
scaleZ = scale
scaleY = scale × heightScale
```

[`normalizeFacilityItem()`](src/components/3d/data/facilityTransform.ts:76) applique cette règle
**uniquement** si aucun axe explicite n'est présent, puis borne, nettoie les valeurs non finies et
ignore les clés hors périmètre. Les enregistrements déjà persistés dans
`site_settings.campus_placements_3d` et dans `localStorage` restent donc lisibles **sans script de
migration** : la conversion se fait au chargement.

### 3.2 Bornes

| Grandeur | Bornes | Justification |
| --- | --- | --- |
| Position X / Z | ±160 m | Le domaine réel s'étend de x ≈ −46 m à +29 m et z ≈ −3 m à +107 m (empreintes OSM) ; 160 m laisse une marge sans permettre de perdre un bâtiment |
| Échelle par axe | 0,05 → 12 | Empêche l'échelle nulle (maillage invisible) et l'échelle absurde |
| Lacet | [0, 360) | Repli circulaire |

---

## 4. Gizmo à trois modes

`GizmoMode = 'translate' | 'rotate' | 'scale'`, sélectionnable dans le studio (boutons) et au
clavier (`1` / `2` / `3`). Chaque mode affiche **son** jeu de poignées ; les autres groupes sont
masqués, donc **retirés du raycast** — aucune ambiguïté entre une flèche et un axe superposés.

| Mode | Poignées |
| --- | --- |
| Déplacer | flèches X et Z, disque central de glissement libre |
| Tourner | anneau de lacet (plan horizontal) |
| Redimensionner | trois axes à embout cubique + cube central d'échelle uniforme |

### 4.1 Détection des poignées : liste blanche exacte

`findGizmoHandle()` compare à un ensemble **fermé** de noms
([`GIZMO_HANDLE_NAMES`](src/components/3d/engine/useCampusGizmo.ts:19)) au lieu d'un test de
préfixe. Les groupes conteneurs ne peuvent plus être confondus avec des poignées.

### 4.2 Échelle adaptative et gel pendant le glisser

[`computeGizmoScale()`](src/components/3d/engine/gizmoMath.ts:107) combine deux contraintes :

1. **constance à l'écran** — l'échelle croît avec la distance caméra, sinon les poignées sont
   inatteignables en vue globale ;
2. **accessibilité sur les gros volumes** — elle croît aussi avec le rayon englobant de l'objet,
   sinon les poignées restent enfouies dans un bâtiment agrandi.

Cette valeur est **gelée pendant un glisser**. Sans ce gel, agrandir le bâtiment agrandirait le
gizmo, qui agrandirait le bâtiment : boucle de rétroaction divergente. Le gel est levé au
relâchement.

### 4.3 Ancrage

- Mode **Déplacer** : au sol, pour que le disque se comporte comme une poignée posée au sol.
- Modes **Tourner** / **Redimensionner** : au **centre englobant** de l'objet, pour que l'anneau
  enveloppe le volume et que les poignées restent accessibles.

La couronne de mise en évidence suit désormais l'emprise réelle
([`setHighlightRadius()`](src/components/3d/engine/useCampusGizmo.ts:432)) au lieu d'un anneau de
taille fixe.

### 4.4 Sens de rotation

`signedAngleAroundAxis()` mesure l'angle autour de l'axe vertical avec la référence `+X`, ce qui
donne le **même sens que la règle de la main droite de Three.js** : le delta d'angle se cumule
directement à `rotationY`, sans correction de signe ad hoc. Le passage ±180° est déroulé pour
éviter un saut d'un demi-tour pendant le glisser.

### 4.5 Mise à l'échelle

- **Axe** : le pointeur est projeté sur l'axe (`rayAxisParam`), et le déplacement rapporté au
  **rayon de l'objet** — décaler le pointeur d'« un rayon » le long de l'axe double l'échelle. Le
  ressenti est identique quelle que soit la taille du bâtiment.
- **Uniforme** : déplacement vertical du pointeur, en progression **multiplicative**
  (`exp(−Δy·k)`) — agrandir puis réduire du même geste revient au point de départ.
- **Réglage fin** : `Maj` pendant le glisser (sensibilité × 0,25).
- **Verrou lié** : le rapport appliqué à l'axe piloté est reporté **proportionnellement** sur les
  deux autres, ce qui préserve un jeu déséquilibré (1 : 2 : 3 → 2 : 4 : 6) au lieu de l'écraser.

### 4.6 Accessibilité de la rotation (correctif de découvrabilité)

Premier retour d'usage : « j'arrive pas à trouver comment rotationner les éléments ». Cause réelle :
l'anneau de lacet n'était monté que dans le groupe du mode **Tourner**, donc **invisible** tant que
l'outil n'avait pas été changé — et le sélecteur d'outil vivait uniquement dans le panneau latéral,
qui peut être hors champ (fenêtre étroite, défilement).

Trois corrections :

1. **L'anneau de lacet est affiché dans tous les outils** (estompé hors mode Tourner). C'est
   l'affordance de rotation : elle ne doit jamais disparaître.
2. **Le saisir bascule automatiquement l'outil sur « Tourner »** : la manipulation aboutit toujours,
   et le panneau reflète ensuite l'outil réellement utilisé. Un clic sur l'anneau n'est jamais mort.
3. **Barre d'outils superposée au viewport** ([`CampusStudioToolbar.tsx`](src/components/3d/ui/CampusStudioToolbar.tsx)),
   avec les trois outils étiquetés et leur raccourci. L'outil est visible là où le regard se trouve,
   indépendamment de l'état du panneau latéral.

Pour éviter que l'anneau permanent ne capte un clic destiné à une flèche ou à un axe, la détection
donne **la priorité aux poignées de l'outil courant**, l'anneau ne servant que de repli.

Deux garanties supplémentaires :

- **Pivot figé à la saisie** : les mesures d'angle et de mise à l'échelle se rapportent à
  `dragPivot`, capturé au clic, et non à la position vivante du gizmo. Changer d'outil ou suivre
  l'objet pendant le glisser ne peut donc pas décaler le centre de rotation sous le pointeur.
- **Ancre stable pendant le glisser** : `anchorGizmo` conserve l'ancrage de l'outil saisi
  (`dragGizmoMode`), donc le gizmo ne saute pas lorsqu'un changement d'outil survient en plein geste.

---

## 5. Saisie numérique, annulation, persistance

### 5.1 Panneau du studio

- **Position** : X, Z (curseur + saisie + pas rapides), bornes affichées.
- **Orientation** : lacet Y avec pas rapides ±15 / 45 / 90° et remise à 0°.
- **Dimensions** : largeur (X), hauteur (Y), profondeur (Z) + bascule **Liée / Libre**.
  - **Référence réelle affichée** : l'empreinte OSM (`realFacilities.ts`) et la taille appliquée
    `largeur × profondeur`. OSM ne fournit **aucune hauteur** : la hauteur reste donc un **facteur**
    — aucun nombre de mètres n'est présenté comme réel pour elle.
  - Pour un repère créé dans le cockpit, aucune dimension n'existe : l'UI l'écrit explicitement au
    lieu d'inventer une valeur.
  - Bouton **« Échelle 1:1 (emprise réelle) »** pour revenir d'un agrandissement.
- Alerte lorsque le verrou est déverrouillé : une échelle non uniforme éloigne la maquette de
  l'emprise mesurée sur le terrain.

### 5.2 Historique

`Ctrl+Z` / `Ctrl+Maj+Z` (+ boutons dans le panneau). Deux mécanismes :

- **Une entrée par geste** : un glisser de poignée n'écrit qu'au relâchement, donc un seul pas
  d'historique.
- **Fusion des saisies continues** : deux modifications du **même champ** sur la **même
  installation** dans une fenêtre de 700 ms forment un seul pas — sans quoi glisser un curseur
  produirait des dizaines d'entrées et « Annuler » deviendrait inutilisable.

L'état est muté via une référence synchrone et non dans un updater React : en mode strict, un
updater est invoqué deux fois, ce qui dupliquerait chaque entrée d'historique.

### 5.3 Persistance

La persistance existante est conservée et **normalisée aux trois points d'entrée** :

| Entrée | Traitement |
| --- | --- |
| Chargement Supabase (`site_settings` → `campus_placements_3d`) | `normalizeFacilityRecord(placements, DEFAULT_FACILITIES)` — une entrée partielle n'efface jamais le reste du plan |
| `localStorage` | `normalizeFacilityRecord(saved, DEFAULT_FACILITIES)` — migration v1 transparente |
| Import JSON | `normalizeFacilityRecord(parsed)` — remplacement strict, borné, refus d'un JSON sans installation exploitable |

L'écriture reste différée (400 ms) et cible Supabase en mode Cockpit, `localStorage` en mode public.

---

## 6. Correctif d'un bug réel : la borne ±75 m

`site-tournage` est situé à **z = 106,63 m** (empreinte OSM `75874280`). Le glisser bornait
`Math.max(-75, Math.min(75, z))` : **tout déplacement de ce bâtiment le téléportait à z = 75**. La
borne est désormais dérivée de l'emprise du domaine (±160 m) et un test de non-régression fige le
comportement ([`facilityTransform.test.ts`](src/components/3d/data/facilityTransform.test.ts:97)).

---

## 7. Fichiers touchés

| Fichier | Rôle |
| --- | --- |
| [`campus3d.types.ts`](src/components/3d/types/campus3d.types.ts) | `FacilityTransform`, `GizmoMode`, `GizmoDragType`, contexte de scène |
| [`facilityTransform.ts`](src/components/3d/data/facilityTransform.ts) *(nouveau)* | Normalisation, migration, bornes, verrou d'échelle, références OSM |
| [`gizmoMath.ts`](src/components/3d/engine/gizmoMath.ts) *(nouveau)* | Rayon ↔ axe, rayon ↔ plan, angle signé, sphère englobante, échelle adaptative |
| [`useCampusGizmo.ts`](src/components/3d/engine/useCampusGizmo.ts) | Trois jeux de poignées, liste blanche, échelle adaptative, couronne dimensionnée |
| [`useCampusPointerDrag.ts`](src/components/3d/engine/useCampusPointerDrag.ts) | Manipulations (déplacer / tourner / redimensionner), gel du gizmo, commit unique |
| [`campusSync.ts`](src/components/3d/engine/campusSync.ts) | Application de la transformée, ancrage du gizmo, mise en évidence |
| [`campusScene.ts`](src/components/3d/engine/campusScene.ts) | Construction initiale des maillages alignée sur la même transformée |
| [`useCampusScene.ts`](src/components/3d/engine/useCampusScene.ts) | Mode de gizmo, snapshot de glisser, échelle adaptative dans la boucle de rendu |
| [`EditorCoordinateInputs.tsx`](src/components/3d/ui/EditorCoordinateInputs.tsx) | Position, orientation, dimensions, verrou, référence OSM |
| [`CampusEditorPanel.tsx`](src/components/3d/ui/CampusEditorPanel.tsx) | Sélecteur d'outil, annuler / rétablir, aide des raccourcis |
| [`CampusStudioToolbar.tsx`](src/components/3d/ui/CampusStudioToolbar.tsx) *(nouveau)* | Barre d'outils superposée au viewport : outils étiquetés + annuler / rétablir |
| [`useCampusGizmo.test.ts`](src/components/3d/engine/useCampusGizmo.test.ts) *(nouveau)* | Contrat des poignées, visibilité par outil, exclusion des groupes masqués |
| [`CampusPlan3D.tsx`](src/components/3d/CampusPlan3D.tsx) | État du mode, historique fusionné, chargements normalisés, raccourcis |
| `defaultFacilities.test.ts`, `facilityTransform.test.ts` | Couverture de la migration, des bornes et du verrou d'échelle |

---

## 8. Raccourcis du studio

| Touche | Effet |
| --- | --- |
| `1` / `2` / `3` | Déplacer · Tourner · Redimensionner |
| Flèches | X / Z (pas 0,5 m ; `Maj` 2,5 m ; `Alt` 0,1 m) |
| `[` / `]` | Lacet ∓ 15° |
| `+` / `−` | Échelle uniforme (`Alt` : pas fin) |
| `F` | Cadrer la caméra sur l'objet |
| `Ctrl+Z` / `Ctrl+Maj+Z` | Annuler / rétablir |

---

## 9. Doctrine respectée

- **Zéro invention** : les dimensions de référence proviennent des empreintes OpenStreetMap
  réelles ; la hauteur, non mesurée, n'est **jamais** présentée en mètres. Un repère sans empreinte
  l'affiche explicitement.
- **Un lien faux est pire qu'aucun lien** : aucune correspondance devinée n'a été introduite ; le
  champ `scaleY` reste un facteur relatif, sans prétendre à une vérité terrain.
- **Zéro gadget creux** : les commandes retirées du périmètre (altitude, tangage, roulis) ont été
  **supprimées du modèle**, pas laissées inertes dans l'interface. Aucun badge marketing, aucune
  pastille décorative.
- **Ton factuel** : libellés techniques, pas de superlatifs.

---

## 9 bis. Persistance : rendre l'échec visible (correctif)

Second retour d'usage : « ça se sauvegarde pas automatiquement quand je déplace des bâtiments ».

### Ce qui rendait le diagnostic impossible

1. **Retour d'action ignoré.** [`upsertCampusPlacements3D()`](src/app/admin/actions.ts:941) renvoie
   `{ success, error }`, mais l'appelant faisait `upsertCampusPlacements3D(next).catch(() => {})`.
   Une écriture refusée (droits, RLS, réseau) était donc **strictement indiscernable** d'un succès :
   l'opérateur croyait avoir sauvegardé. Le seul témoin était un `console.error` côté serveur.
2. **Écriture en attente jetée au démontage.** L'effet de nettoyage se contentait de
   `clearTimeout(saveTimeoutRef.current)`. Changer d'onglet du Cockpit (`CampusPlan3DView` est monté
   conditionnellement) ou fermer l'onglet dans la fenêtre de 400 ms **annulait purement et simplement**
   le dernier déplacement.
3. **Aucun état affiché.** Aucun indicateur ne distinguait « enregistré » de « en attente » ou
   « échoué ».

### Correctifs

| Correctif | Détail |
| --- | --- |
| Retour d'action contrôlé | `persistNow()` lit `result.success` et lève l'erreur réelle si l'écriture est refusée |
| Reprise unique | Une seconde tentative après 2,5 s absorbe un incident réseau ponctuel, sans boucle |
| Écriture au lieu d'abandon | `flushPendingSave()` est appelé au démontage **et** sur `pagehide` : la dernière modification part, elle n'est plus jetée |
| Échec rendu visible | État `idle / saving / saved / error` affiché dans la barre d'outils et dans le panneau, **message d'erreur réel inclus** ([`persistenceStatus.ts`](src/components/3d/data/persistenceStatus.ts)) |
| Enregistrement forcé | Bouton « Enregistrer » (barre d'outils et panneau) qui annule le différé et écrit l'état courant |

### Constat de terrain (preuve, pas supposition)

Diagnostic exécuté contre la base réelle :

```
node scripts/verify_campus_placements_3d.mjs
```

```
OK    NEXT_PUBLIC_SUPABASE_URL : https://xkbkcsypftvspmkfnrfm.supabase.co
OK    SUPABASE_SERVICE_ROLE_KEY : présente
WARN  Aucune ligne « campus_placements_3d » en base
WARN  Installations enregistrées : 0
OK    Écriture de contrôle réussie (valeur réécrite à l'identique)
```

Deux faits, et une conclusion :

1. **Le chemin d'écriture fonctionne** : l'upsert de contrôle a réussi depuis cet environnement.
2. **La ligne n'existait pas** : le studio n'avait donc **jamais** réussi à faire persister un
   placement dans Supabase — autrement dit, l'opérateur éditait un studio qui n'écrivait pas là
   où il le croyait.

3. **Cause la plus probable** : édition depuis le site public avec `?studio=1`. Dans ce cas
   `persistToDatabase` reste `false` (le Cockpit est le seul à le passer à `true`) et les écritures
   vont dans le `localStorage` du navigateur courant. Rien n'est partagé, rien n'arrive en base —
   ce qui correspond exactement au symptôme observé.

D'où la mention explicite de la **destination** dans l'état affiché : « Enregistré localement
(non partagé) » contre « Enregistré dans Supabase (plan partagé) ». Le studio ne peut plus laisser
croire qu'il modifie le plan partagé.

**Pour éditer le plan partagé : `Cockpit → Plan 3D` (`/admin/campus-3d`), et non `?studio=1` sur
le site public.**

Point de sécurité relevé au passage : l'action
[`upsertCampusPlacements3D()`](src/app/admin/actions.ts:941) ne vérifie **aucun droit** — elle crée
un client administrateur (clé de service) et écrit. Si l'on rendait un jour le studio public
persistant en base, n'importe quel visiteur pourrait réécrire le plan du campus via `?studio=1`.
La séparation actuelle (public = local, Cockpit = base) doit donc être conservée, ou une
vérification d'authentification doit être ajoutée à l'action avant tout élargissement.

### Cause racine confirmée : clé de service absente → écriture refusée par RLS

Troisième retour d'usage : « ça marque échec de l'enregistrement ». Le diagnostic affiché a permis
d'aller au bout, et la sonde Node a reproduit la cause exacte :

```
--- Contrôle du repli sur clé publique (scénario sans clé de service) ---
WARN  Écriture avec la clé publique REFUSÉE :
      new row violates row-level security policy for table "site_settings" (code 42501)
```

**Enchaînement réel :**

1. [`createAdminClient()`](src/lib/supabase/admin.ts:20) retombe **silencieusement** sur
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` quand `SUPABASE_SERVICE_ROLE_KEY` est absente de
   l'environnement d'exécution.
2. Avec la clé publique, les **lectures** passent (politiques RLS publiques) mais les **écritures**
   sont refusées : `42501`.
3. Le studio affiche donc « Échec de l'enregistrement », alors que la lecture du plan, elle,
   fonctionne parfaitement — d'où l'impression d'un studio « à moitié » cassé.

**Correctif de configuration (action à faire côté environnement) :** renseigner
`SUPABASE_SERVICE_ROLE_KEY` là où tourne l'application (Vercel → *Settings → Environment
Variables*), puis **redéployer**. En local, `.env.local` la contient déjà — le diagnostic Node le
confirme (`SUPABASE_SERVICE_ROLE_KEY : présente`), c'est donc l'environnement distant qui est
incomplet.

**Correctifs de code, pour que ce cas ne soit plus jamais muet :**

| Correctif | Effet |
| --- | --- |
| `hasServiceRoleKey()` | Rend la configuration de la clé de service **observable** au lieu de la déduire d'une erreur RLS |
| Sonde `probeCampusPlacements3D()` | Lecture seule sur le même chemin serveur ; distingue « action injoignable », « lecture OK / écriture refusée » et « lecture en échec » |
| Diagnostic automatique après échec | Le message final nomme la cause : clé de service absente, droits, contrainte ou réseau |
| Contrôle à l'ouverture | Le studio signale la configuration incomplète **avant** le premier geste, au lieu de laisser perdre un déplacement |
| `console.warn` dans le repli | Une ligne explicite dans les logs serveur à chaque appel sans clé de service |
| Succès partiel distingué | Une revalidation de pages en échec n'est plus confondue avec un échec d'écriture : les données sont en base, un avertissement le dit |

L'observation clé : un enregistrement qui échoue **en silence** est pire qu'un enregistrement
refusé bruyamment — le premier fait croire au succès. L'interface doit donc dire la vérité sur
l'état de l'écriture, y compris quand elle échoue.

---

## 10. Vérifications

```
npm run typecheck   # 0 erreur
npm run test        # 103 tests, 6 fichiers — 0 échec
npm run lint        # 0 erreur (95 avertissements préexistants, hors fichiers 3D)
npm run build       # à exécuter
```

### Contrôle manuel recommandé (Cockpit → onglet Plan 3D)

1. Sélectionner **Zoé Bell Hall**, passer en mode *Redimensionner*, glisser l'axe X : la largeur
   change **sans** toucher à la hauteur ni à la profondeur (verrou en *Libre*).
2. Repasser le verrou en *Liée* et glisser : les trois axes varient ensemble ; la référence
   « Taille appliquée » suit la largeur et la profondeur.
3. Mode *Tourner*, glisser l'anneau : le bâtiment pivote **sans** se pencher ni se surélever.
4. `Ctrl+Z` : le geste précédent est annulé en **une seule** étape.
5. Recharger la page : les valeurs sont reconstituées depuis `site_settings`.
6. Sélectionner **Site Extérieur** (z = 106,6 m) et le déplacer : il reste à sa position (plus de
   téléportation à z = 75).
