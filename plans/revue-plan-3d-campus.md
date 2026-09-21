# Revue — Plan 3D du campus : positions erronées & qualité des modèles

## 1. Constat utilisateur
> « REVOIS LE PLAN 3D LES BATIMENT NE CORRESPONDE PAS A CE QU IL Y A SUR MAPS OU DU MOINS IL SONT MAL PLACÉ ? ET LA QUALITÉ DES MODÈLES 3D LAISSE À DÉSIRER »

Deux problèmes distincts :
1. **Positions** : les bâtiments ne correspondent pas à la réalité (Maps / orthophoto).
2. **Qualité** : les modèles 3D sont trop sommaires.

---

## 2. Diagnostic — Positions

### 2.1 Le mapping réel → scène est **inventé**
[`defaultFacilities.ts`](src/components/3d/data/defaultFacilities.ts:3) prétend :
> « Initial placements calibrated to the real 1400x1400 IGN orthophoto »

Or les coordonnées `x`/`z` sont des valeurs rondes manifestement posées à la main
(`7.0/14.0`, `25.0/40.0`, `-55.0/-24.0`, `62.0/-48.0`…). **Aucune projection
géographique n'est calculée.** Il n'existe nulle part dans le code une conversion
`lat/lon → x/z`.

### 2.2 La donnée réelle existe pourtant
[`cuc_buildings.json`](scripts/cuc_buildings.json) contient **16 bâtiments OSM**
avec leurs empreintes polygonales réelles (`coords[]` en lat/lon), extraites par
[`parse_osm_cuc.mjs`](scripts/parse_osm_cuc.mjs:4) sur la bbox
`3.5350,50.0898,3.5395,50.0925`.

Emprise réelle mesurée :
- **Nord-Sud : 299 m**
- **Est-Ouest : 171 m**
- Centroïde : `50.091157, 3.538285`

### 2.3 Le fond de scène est un plan générique
[`campusScene.ts`](src/components/3d/engine/campusScene.ts:74) crée un
`PlaneGeometry(160, 160)` texturé avec `cuc_campus_aerial_real_z19.jpg`, **sans
aucune calibration** : ni échelle (m/px), ni origine, ni rotation. Le plan fait
160 m de côté alors que le domaine réel s'étend sur ~300 m N-S. **Le fond et les
bâtiments ne partagent donc aucun référentiel commun** — d'où l'impression de
bâtiments « mal placés ».

### 2.4 Conclusion
Les positions ne sont pas « légèrement décalées » : elles sont **arbitraires**.
Il faut :
1. Calculer une projection `lat/lon → x/z` (équirectangulaire locale, centrée sur
   le centroïde du domaine).
2. Dériver les positions des 9 installations depuis les empreintes OSM réelles.
3. Calibrer le plan de fond sur la même projection (échelle + origine + rotation).

---

## 3. Diagnostic — Qualité des modèles

Tous les bâtiments sont des **boîtes** (`BoxGeometry`) :

| Bâtiment | Modèle actuel | Réalité |
|---|---|---|
| Zoé Bell Hall | `Box(26,8,20)` + cône 4 faces | Gymnase 700 m², toit à 2 pans |
| Hall Câblage | `Box(20,9,22)` + 1 poutre | Hangar 600 m², charpente |
| Dojos | `Box(22,7,18)` nu | 3 espaces tatamis |
| Atelier Mécanique | `Box(24,5.5,14)` nu | Atelier + piste |
| QG Hébergement | 2 boîtes en L | Bâtiment 90 lits |
| Manège | demi-cylindre | Manège 900 m² |
| Site Tournage | 6 cônes « arbres » | 6 ha arborés |

Aucune **toiture**, aucune **ouverture**, aucun **matériau différencié**,
aucun **détail de façade**. Le rendu est un « blockout » de prévisualisation,
pas une maquette présentable.

---

## 4. Plan de correction

### Étape A — Projection géographique réelle
Créer `src/components/3d/engine/geoProjection.ts` :
- `projectLatLon(lat, lon, origin)` → `{ x, z }` (équirectangulaire locale,
  `x` = Est, `z` = Sud, centrée sur le centroïde).
- `computeBounds(buildings)` → emprise + centroïde.
- Constantes d'échelle partagées avec le plan de fond.

### Étape B — Positions dérivées de l'OSM
Générer `src/components/3d/data/realFacilities.ts` à partir de
`cuc_buildings.json` : mapper chaque installation à son empreinte OSM réelle
(par proximité + surface), puis projeter. **Aucune position inventée.**

### Étape C — Calibration du fond
Aligner `PlaneGeometry` sur l'emprise réelle (≈ 300 × 172 m, marge incluse),
avec origine et rotation cohérentes avec la projection.

### Étape D — Amélioration des modèles
- Toitures à 2 pans (`ExtrudeGeometry` ou prismes) au lieu de boîtes nues.
- Ouvertures (portes/baies) par soustraction ou façades segmentées.
- Matériaux différenciés (bardage, béton, vitrage, toiture).
- Hangar : charpente visible + poutre de levage.
- Zoé Bell : fosse à mousse + praticable lisibles.
- Manège : toiture à 2 pans + carrière.
- Arbres : silhouettes plus crédibles (tronc + houppier multi-niveaux).

### Étape E — Vérification
- Contrôle visuel : superposition plan 3D ↔ orthophoto.
- `npm run lint && npm run typecheck && npm run build`.
- Commit + push + `probe:prod`.

---

## 5. Doctrine respectée
- **Zéro Invention** : positions issues de données OSM réelles, pas de valeurs
  rondes posées à la main.
- **Un lien FAUX est pire qu'aucun lien** : si une installation ne peut pas être
  appariée à une empreinte OSM fiable, elle reste explicitement « non localisée »
  plutôt que placée arbitrairement.
