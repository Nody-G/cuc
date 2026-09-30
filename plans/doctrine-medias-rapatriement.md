# Doctrine de gestion des médias — Rapatriement WordPress → Supabase

**Statut :** appliquée le 2026-09-20
**Périmètre :** site vitrine CUC (Next.js) + Cockpit + Supabase Storage

---

## 1. Principe fondamental

> **Aucun média critique ne doit dépendre d'un domaine tiers.**

Le site vitrine ne doit plus charger d'images, PDF ou vidéos depuis
`www.campus-universcascades.com` (ancien site WordPress). Tous les médias
propres au CUC sont hébergés dans **Supabase Storage**, bucket
`cuc-vitrine-assets`, sous le préfixe `media/`.

Cette règle prolonge la doctrine « Zéro Valeur Orpheline » : si le domaine
WordPress disparaît ou change, le site vitrine doit rester intégralement
fonctionnel.

---

## 2. Convention de stockage

```
cuc-vitrine-assets/
└── media/
    ├── cuc-visual/     # Photos campus, salles, portraits coachs, visuels de repli
    ├── film-poster/    # Affiches de films (filmographie)
    ├── partner-logo/   # Logos partenaires et institutions
    ├── document/       # Plaquettes et PDF téléchargeables
    └── video/          # Reportages TV (hébergement au cas par cas)
```

**URL publique canonique :**

```
https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/<categorie>/<fichier>
```

**Nommage :** nom de fichier d'origine normalisé (accents retirés, caractères
non alphanumériques remplacés par `-`). En cas de collision, suffixe `__1`.

**Cache :** `cacheControl: 31536000` (1 an) — les médias sont immuables.

---

## 3. Pipeline canonique

Le rapatriement suit cinq étapes, chacune matérialisée par un script
réutilisable :

| Étape | Script | Sortie |
| --- | --- | --- |
| 1. Inventaire | `node scripts/audit_original_media.mjs` | `scripts/media_inventory.{json,md}` |
| 2. Classification | `node scripts/classify_media_inventory.mjs` | `scripts/media_classification.{json,md}` |
| 3. Téléchargement | `node scripts/download_original_media.mjs` | `.staging/media/<categorie>/` |
| 4. Upload | `node scripts/upload_media_to_supabase.mjs` | `scripts/media_url_mapping.{json,md}` |
| 5. Réécriture | `node scripts/rewrite_media_urls.mjs` | `scripts/media_rewrite_report.{json,md}` |

**Rattrapage :** `node scripts/fetch_missing_media.mjs` couvre les URLs
référencées uniquement en base ou dans le code (non liées depuis les pages
publiques, donc invisibles au crawler).

---

## 4. Décisions de classification

| Catégorie | Décision | Justification |
| --- | --- | --- |
| `cuc-visual` | **RAPATRIER** | Cœur de la vitrine — photos campus, salles, portraits. |
| `film-poster` | **RAPATRIER** | Utilisées par la filmographie et les tournages. |
| `partner-logo` | **RAPATRIER** | Logos partenaires et institutions. |
| `document` | **RAPATRIER** | Plaquettes et PDF téléchargeables. |
| `video` | **CAS PAR CAS** | Reportages TV très lourds (60–120 Mo). |
| `third-party` | **IGNORER** | Ressources techniques WordPress (plugins, thèmes). |
| `broken` | **IGNORER** | Média cassé (HTTP ≥ 400) côté WordPress. |

### Cas particulier — vidéos de reportage

Deux reportages TV dépassent la taille maximale autorisée par Supabase Storage :

- `TF1-JT-20h-CUC-reportage-1.mp4` (82 Mo)
- `20h30-A-LECOLE-DES-CASCADEURS-FRANCE2-VWeb2-1.mp4` (120 Mo)

Ils restent **volontairement servis par le site d'origine** et sont déclarés
dans `INTENTIONALLY_EXTERNAL` (`scripts/verify_media_url_coverage.mjs`).

La compression est désormais tranchée : plafond vidéo de 45 Mo appliqué par le
ticket serveur, vidéo non recompressée côté serveur (`sharp` ne traite pas la
vidéo, `ffmpeg` est absent d'un runtime serverless). Un CDN vidéo dédié reste
une option ouverte si le volume augmente.

### Cas particulier — URLs mortes

Cinq URLs référencées en base ou dans le code renvoient **HTTP 404** côté
WordPress (médias supprimés). Elles ne peuvent pas être rapatriées :

- `2024/12/Bagarre.jpg`, `Nouveaux-riches.jpg`, `Athena.jpg`,
  `Le-Pacte-des-Loups.jpg` → remplacées par les affiches IMDb déjà présentes
  dans `site_films.image` (source de vérité).
- `2021/07/Animation-airbag-chute-libre.jpg` → remappée vers
  `media/cuc-visual/Airbag-vert.jpg` via `DEAD_URL_REMAP`
  (`scripts/rewrite_media_urls.mjs`).

---

## 5. Garde-fous de réécriture

`rewrite_media_urls.mjs` ne réécrit **jamais** :

- `SITE_URL` dans [`src/lib/seo.ts`](../src/lib/seo.ts) — c'est le domaine
  canonique du site, pas un média.
- Les adresses e-mail `@campus-universcascades.com`.
- Les liens internes `/wp-content/...` sans domaine.

**Cibles réécrites :**

1. **Base de données** — tables `site_pages`, `site_films`, `site_team`,
   `site_partners`, `site_events`, `site_settings` (parcours JSONB récursif,
   patch par diff de colonnes).
2. **Code source** — fichiers `.ts/.tsx/.js/.jsx/.mjs/.json/.css` sous `src/`,
   hors `seo.ts`, `robots.ts`, `sitemap.ts`.

**Idempotence :** une URL déjà migrée n'est pas retouchée. Le script peut être
relancé sans effet de bord.

---

## 6. Contrôles obligatoires

| Contrôle | Script | Seuil |
| --- | --- | --- |
| Couverture des URLs | `node scripts/verify_media_url_coverage.mjs` | **0 URL non couverte** (code 2 sinon) |
| Accessibilité des médias | `node scripts/verify_supabase_media_reachable.mjs` | **0 média cassé** (code 2 sinon) |

Ces deux scripts doivent être exécutés après toute modification du pipeline ou
de la table de correspondance.

---

## 7. Résultat du rapatriement (2026-09-20)

| Indicateur | Valeur |
| --- | --- |
| Médias inventoriés | 226 |
| Médias rapatriés | 221 |
| Poids total rapatrié | ~150 Mo |
| Lignes de base réécrites | 15 |
| Remplacements en base | 161 |
| Fichiers source réécrits | 37 |
| Remplacements source | 310 |
| URLs Supabase vérifiées (HTTP 200) | 166 / 166 |
| URLs non couvertes | 0 |

---

## 8. Compression des médias téléversés

La source canonique du sujet est [`media_compression.md`](../.agents/rules/media_compression.md) :
le média servi est un dérivé WebP dont le bord long suit le profil du dossier,
compressé dans le navigateur puis déposé via un ticket signé côté serveur ; un
seul master par image, les négatifs rangés sous `_originals` et jamais servis.
Plafonds appliqués par le ticket serveur : image 8 Mo, document 20 Mo, vidéo 45 Mo.

**Ordre de migration canonique :** mesurer → déposer le dérivé → vérifier qu'il
répond 200 → réécrire les références (code + base) → alors seulement supprimer
l'ancien objet. Aucune suppression n'est automatique.

| Commande | Rôle |
| --- | --- |
| `npm run media:policy` | Liste blanche des types MIME du bucket ; lecture seule par défaut (`media:policy:write` applique). |
| `npm run media:recompress` · `media:recompress:write` | Mesure les dérivés WebP, puis les dépose sans rien supprimer. |
| `npm run media:rewrite` · `media:rewrite:write` | Réécrit les références (code + base) vers les dérivés vérifiés. |
| `npm run media:rewrite:purge` | Supprime les anciens objets une fois la réécriture confirmée. |

**Résultat mesuré (2026-09-29) :** 100 images remplacées — 76,79 Mo de fichiers
d'origine par 15,93 Mo de dérivés, gain net 60,86 Mo ; 97 anciens objets
supprimés, 60,30 Mo libérés. Le bucket vitrine passe de 90,54 Mo / 178 objets à
31,27 Mo / 182 objets (−65 %).

---

## 9. Règle permanente

> **Tout nouveau média doit être téléversé dans `cuc-vitrine-assets/media/`
> et référencé par son URL Supabase. Aucune URL `wp-content/uploads` ne doit
> être introduite dans le code ou en base.**

La Médiathèque du Cockpit (onglet *Médiathèque & Fichiers*) est l'interface
d'administration de ce bucket : elle liste, téléverse et supprime les fichiers,
et fournit l'URL publique à copier.
