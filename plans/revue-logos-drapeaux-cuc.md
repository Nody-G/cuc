# Revue & Documentation : Générateur des Logos CUC Drapeaux Internationaux

Ce document consigne l'architecture technique, les paramètres géométriques et la procédure de mise à jour des logos **CUC Drapeaux** créés pour les workshops internationaux.

---

## 1. Contexte & Architecture Technique

Pour répondre au besoin d'afficher les pays participants sur la future page **International Workshop**, un générateur automatisé a été mis en place pour décliner le logo CUC officiel aux couleurs de 20 nations (Royaume-Uni/Angleterre + 19 pays du monde).

### Fichiers de génération clés :
- [`scripts/generate_all_international_logos.py`](file:///c:/Users/niels/Documents/Antigravity%20projects/CUC/scripts/generate_all_international_logos.py) : Script Python qui assemble les fichiers vectoriels SVG avec les masques d'anneau, les liserés athlétiques CUC et les motifs de drapeaux nationaux.
- [`scripts/render_all_international_pngs.mjs`](file:///c:/Users/niels/Documents/Antigravity%20projects/CUC/scripts/render_all_international_pngs.mjs) : Script Node.js utilisant le moteur `sharp` pour compiler tous les SVG en fichiers PNG 1024 × 1024 px avec fond transparent.

---

## 2. Géométrie Canonique du Logo CUC

Tous les éléments sont modélisés sur un repère carré standardisé `viewBox="0 0 1024 1024"` :

| Élément | Paramètre géométrique | Valeur / Règle |
| :--- | :--- | :--- |
| **Centre du logo** | `(CX, CY)` | `(512.0, 512.0)` |
| **Anneau principal** | Rayons `[R_INNER, R_OUTER]` | `[356.0, 475.0]` (épaisseur = 119 px) |
| **Filets concentriques** | Rayons `[R_IN_LINE, R_OUT_LINE]` | `[338.5, 493.0]` avec liserés de finition |
| **Coupure horizontale arcs** | `Y_CUT_TOP` / `Y_CUT_BOTTOM` | Arcs coupés à `y = 292.0` (haut) et `y = 750.0` (bas) |
| **Axe de l'étoile** | Bounding box center | Strictement recalibré à `x = 512.0` (décalage de -5.0 px par rapport au raster asymétrique d'origine) |
| **Lettres C U C** | 3 couches vectorielles pures | 1. Contour noir externe · 2. Liseré blanc athlétique (inline) · 3. Corps intérieur couleur |

---

## 3. Note Importante sur la Typographie (CAMPUS UNIVERS CASCADES)

### Constat actuel :
Les lettres courbes **« CAMPUS »** et **« UNIVERS ★ CASCADES »** proviennent de la vectorisation par détection de contours du fichier raster `cuc-logo-bw.png`.  
En raison de la résolution d'origine du PNG scanné, certains glyphes présentent des irrégularités de contour (« cabossés »).

### Action future attendue (Fichier master de Lucas) :
Lucas doit transmettre le fichier original officiel du logo CUC en format vectoriel `.svg` ou `.ai`.

### Procédure de remplacement instantané :
Dès réception du SVG officiel de Lucas :
1. Extraire les chemins propres et lisses des textes `<path>` de « CAMPUS » et « UNIVERS CASCADES » (ou la fonte athlétique posée sur `<textPath>`).
2. Mettre à jour la variable `text_paths` dans [`scripts/generate_all_international_logos.py`](file:///c:/Users/niels/Documents/Antigravity%20projects/CUC/scripts/generate_all_international_logos.py).
3. Exécuter en une seule commande la régénération complète :
   ```bash
   python scripts/generate_all_international_logos.py; node scripts/render_all_international_pngs.mjs
   ```
4. Les **23 logos SVG et les 23 PNG haute définition** seront instantanément mis à jour avec la typographie immaculée sans aucune retouche manuelle.

---

## 4. Inventaire des Logos Actuels dans `public/images/logos/`

### 🇬🇧 Royaume-Uni & Angleterre (4 variantes) :
- `cuc-logo-uk-ring.svg` / `.png` (Anneau Union Jack authentique)
- `cuc-logo-uk-sport.svg` / `.png` (Sportswear / Varsity UK bleu marine & rouge)
- `cuc-logo-uk-letters.svg` / `.png` (Union Jack dans le lettrage U central)
- `cuc-logo-england-stgeorge.svg` / `.png` (Croix de Saint-Georges Angleterre, étoile centrée)

### 🌍 19 Pays pour les Workshops Internationaux :
- **Europe :** France (`france`), Allemagne (`germany`), Espagne (`spain`), Italie (`italy`), Suisse (`switzerland`), Belgique (`belgium`), Pays-Bas (`netherlands`), Irlande (`ireland`), Suède (`sweden`), Norvège (`norway`).
- **Amériques :** USA (`usa`), Canada (`canada`), Brésil (`brazil`), Mexique (`mexico`).
- **Asie & Océanie :** Japon (`japan`), Corée du Sud (`south-korea`), Chine (`china`), Australie (`australia`).
- **Afrique :** Afrique du Sud (`south-africa`).

### Galerie de prévisualisation :
- Voir le comparatif visuel complet dans l'artefact : [`cuc_international_workshops_logos.md`](file:///C:/Users/niels/.gemini/antigravity-ide/brain/26c0ee28-9ebe-43d5-beb4-e332fde86258/cuc_international_workshops_logos.md)
