# Compression des médias — doctrine canonique

**Sujet :** tout média téléversé depuis le Cockpit.
**Implémentation de référence :** `src/lib/media-library/` (politique, domaine pur, service navigateur, séquence d'import) et `src/app/(admin)/admin/actions/media-upload-ticket.ts` (autorisation serveur).
**Constat d'origine :** dossier de stockage à 90,54 Mo / 178 objets pour un plafond d'organisation déjà franchi une fois (`402 exceed_storage_size_quota`, 2026-09-23).

---

## 1. Règle non négociable : le média servi est un dérivé léger

Aucune photo n'entre dans le bucket à sa taille d'appareil. Le master stocké est
**un WebP dont le bord long ne dépasse pas le profil du dossier** — 2560 px en
général, 3200 px pour un visuel plein écran, 1600 px pour un portrait, 512 px
pour un logo. Le site n'affiche jamais au-delà de `deviceSizes` (2560 px,
`next.config.ts`) : tout octet au-delà est perdu pour l'utilisateur et payé en
stockage puis en egress.

| Profil | Dossier | Bord long | Qualité WebP | Poids visé |
| :--- | :--- | ---: | ---: | ---: |
| `web` (défaut) | `media/cuc-visual`, `media/film-poster` | 2560 | 0,85 | 150–450 Ko |
| `portrait` | portraits, équipe | 1600 | 0,88 | 80–250 Ko |
| `logo` | `media/partner-logo` | 512 | 0,90 | 10–60 Ko |
| `hero` | visuels plein écran | 3200 | 0,90 | 250–700 Ko |
| `passthrough` | SVG, GIF animé, AVIF, PDF, vidéo | — | — | inchangé |

Le dérivé ne remplace l'original que s'il apporte **au moins 10 % de gain** ;
sinon on conserve le fichier reçu (voir `shouldKeepCompressed`).

## 2. La compression se fait dans le navigateur, jamais dans une Server Action

Le corps d'une Server Action est plafonné à **1 Mo** et celui d'une fonction
serverless à **4,5 Mo** : une photo d'appareil n'atteint jamais le serveur. Le
parcours canonique est donc :

1. compression navigateur (`image-compression.client.ts`, hors fil principal via
   le worker) ;
2. autorisation signée (`createMediaUploadTicket`) — le serveur valide nature,
   type MIME, plafond et chemin, puis signe l'URL ;
3. dépôt direct du blob dans Supabase Storage ;
4. journalisation du gain (`finalizeMediaUpload`, `media.upload.compressed`).

Ne jamais contourner cette chaîne en réintroduisant un envoi de fichier lourd
via Server Action. `uploadMediaFile` reste un repli pour les fichiers légers.

## 3. Un seul master par image — aucune famille de variantes

`next/image` dérive déjà le `srcset` AVIF/WebP depuis le master. Stocker
320/640/1024/1600/2560 multiplierait les objets et saturerait le bucket : c'est
l'inverse du but. Ne jamais générer de variantes responsives dans le stockage.

## 4. Le négatif vit sous `_originals`, jamais dans le catalogue

- L'original haute qualité est **facultatif**, réservé aux rôles `admin` et
  `directeur`, et sa taille est affichée avant validation.
- Il est rangé sous `_originals/<dossier>/…`, préfixe frère de `_trash` : masqué
  de la navigation, jamais proposé au sélecteur d'image, jamais référencé par la
  vitrine.
- Il n'est **jamais** l'image servie. Un négatif de 6 Mo occupe environ douze
  fois son dérivé : le réserver aux visuels de référence (plein écran, portraits,
  logos).
- Le poids des négatifs reste compté par le tableau de bord de stockage : un
  poids masqué serait un quota menti.

## 5. Plafonds et types autorisés

| Nature | Dérivé servi | Négatif | Types acceptés |
| :--- | ---: | ---: | :--- |
| Image | 8 Mo | 12 Mo | JPEG, PNG, WebP, AVIF, GIF, SVG |
| Document | 20 Mo | 20 Mo | PDF, CSV, TXT |
| Vidéo | 45 Mo | non admis | MP4, WebM, MOV |

Ces plafonds sont portés par `media-policy.ts` et appliqués **par le ticket
serveur** ; le bucket ne connaît qu'un plafond global et une liste de types
(`npm run media:policy:write`). Un client modifié se heurte au refus serveur.

La vidéo n'est pas compressible ici (`sharp` ne traite pas la vidéo, `ffmpeg` est
absent d'un runtime serverless) : au-delà de 45 Mo, passer par le script local
`node scripts/transcode_reportages.mjs` ou un CDN vidéo dédié.

## 6. Recompression de l'existant

`npm run media:recompress` mesure, `npm run media:recompress:write` dépose les
dérivés **sans rien supprimer**. L'ordre canonique est inviolable :

mesurer → déposer le dérivé → vérifier qu'il répond 200 → réécrire les
références (code + base) → **alors seulement** supprimer l'ancien objet.

Aucune suppression n'est automatique : un objet supprimé avant réécriture casse
la vitrine sans avertissement.
