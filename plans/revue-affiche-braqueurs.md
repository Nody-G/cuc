remplace # Revue — Affiche erronée « Braqueurs » et fiche en doublon

**Date :** 2026-09-21
**Signalement :** « L'affiche de *Braqueurs* n'est pas la bonne, là on voit une femme. »
**Statut :** ✅ Corrigé. Aucune donnée n'est supprimée (la fiche fautive est retirée de la
publication, pas effacée).

---

## 1. Ce que montrait réellement l'affiche

Le visuel servi pour la fiche `braqueurs` était
`https://m.media-amazon.com/images/M/MV5BZDY2Y2ZiZmQt…@._V1_.jpg`.

Téléchargé et **examiné** : c'est une **photo promotionnelle de Ricki Lake**
(l'animatrice et actrice américaine, coiffée court, tailleur à fines rayures, logo
« RICKI LAKE » en haut à gauche). **Rien à voir avec la série française** : l'image
provenait d'un titre IMDb qui n'est pas *Braqueurs*.

## 2. Cause racine — un identifiant IMDb faux

`site_films` contenait **deux fiches pour la même œuvre** :

| Fiche | Titre | IMDb | Affiche | Champs éditoriaux |
| --- | --- | --- | --- | --- |
| `braqueurs` | « Braqueurs » (2021) | `tt13300584` ❌ | **Ricki Lake** ❌ | catégorie, réalisateur, tag NETFLIX, AlloCiné, bande-annonce, ordre |
| `braqueurs-la-serie` | « Braqueurs: La série » (2021) | `tt13278100` ✅ | jaquette Netflix ✅ | quasi vides (import automatique) |

Résolution des deux identifiants auprès de TMDB :

- `tt13300584` → **aucun résultat** : ce n'est pas l'identifiant de *Braqueurs* ;
- `tt13278100` → **série « Braqueurs : La série » (2021)**, TMDB `130523`,
  synopsis : « Quand sa nièce contrarie un puissant baron de la drogue, Mehdi et sa
  bande de pros du braquage se retrouvent au cœur d'une guerre des gangs violente. »

L'affiche fautive a donc été récupérée à partir d'un identifiant erroné : le
mauvais titre a fourni le mauvais visuel. C'est le cas d'école de la doctrine
« un lien FAUX est pire qu'aucun lien ».

## 3. Confirmation visuelle des visuels candidats

Quatre fichiers distincts (comparaison par empreinte SHA-256) ont été téléchargés
puis **regardés** :

| Source | Empreinte (8 o) | Poids | Contenu observé |
| --- | --- | --- | --- |
| `site_films.image` de `braqueurs` | `e2ed3ae3` | 525 Ko | ❌ Ricki Lake |
| `site_films.image` de `braqueurs-la-serie` | `4d2d406b` | 311 Ko | ✅ jaquette « BRAQUEURS LA SÉRIE » (Netflix) |
| Supabase `film-poster/braqueurs.jpg` | `460f312d` | **9 Ko** | ✅ bonne jaquette… mais minuscule (illisible en grand) |
| TMDB officiel (série 130523) | `59a82805` | 86 Ko | ✅ même jaquette |

La jaquette officielle porte : « UNE SÉRIE CRÉÉE PAR HAMID HLIOUA ET JULIEN LECLERCQ »,
« RÉALISÉE PAR JULIEN LECLERCQ », « LE 24 SEPTEMBRE | NETFLIX » — ce qui confirme
l'identité de l'œuvre et le rattachement aux crédits des coachs.

## 4. Références croisées (vérifiées avant écriture)

- `site_team` — les **5 coachs** concernés (Lucas Dollfus, Jérôme Gaspard,
  Malik Diouf, Franck Blanc, Bastien Trouvé) déclarent
  `notable_credits: "Braqueurs: La série (2021) — Cascadeur"`, et Lucas l'a aussi en
  `featured_credits`. Le titre se normalise en `braqueurs la serie` : il
  s'apparie donc à la fiche `braqueurs-la-serie`, **pas** à `braqueurs`.
- `site_settings` (clé `team`) → `"braqueurs-la-serie":"Cascadeur"`.
- `site_settings` (clé `films`, miroir) → contient une fiche `braqueurs`.
- `src/data/filmography.ts` (repli statique) → entrée `id: "braqueurs"` avec le
  **même `imdbUrl` faux** (`tt13300584`) et l'image Supabase basse résolution.

Conclusion : la fiche `braqueurs` est **le doublon fautif** ; la référence
canonique est `braqueurs-la-serie`.

## 5. Correctifs appliqués

1. **Affiche** — le fichier Supabase `film-poster/braqueurs.jpg` (9 Ko, illisible)
   est **remplacé par la jaquette officielle en haute qualité** (celle vérifiée à
   l'œil, 311 Ko). Tous les consommateurs de cette URL (repli statique
   `filmography.ts`, `all_official_films.ts`, miroir `site_settings.films`)
   affichent donc la bonne affiche, nette.
2. **Rattachement de la bonne affiche** à la fiche publiée : `braqueurs-la-serie`
   reçoit l'URL Supabase (cohérente avec le reste du catalogue) et les champs
   éditoriaux de la fiche dupliquée : catégorie « Série / Plateforme »,
   réalisateur Julien Leclercq, tag NETFLIX, lien AlloCiné, bande-annonce.
3. **Retrait du doublon** : `braqueurs` passe en `is_published = false` — il
   disparaît de la grille publique sans être supprimé (traçabilité). Son
   `imdb_url` est corrigé en `tt13278100` pour ne plus propager une identité fausse.
4. **Repli statique** — [`filmography.ts`](../src/data/filmography.ts:494) : `id`,
   `title` et `imdbUrl` alignés sur l'identité réelle (`braqueurs-la-serie`,
   « Braqueurs: La série », `tt13278100`), conformément à la règle « le slug doit
   refléter l'identité réelle ».

## 6. Vérifications

- Les 4 visuels ont été téléchargés, hachés et **regardés** — aucune conclusion
  n'est tirée d'un nom de fichier.
- Résolution TMDB des deux identifiants IMDb (`/find?external_source=imdb_id`).
- Appariement des crédits vérifié : `creditTitleKey("Braqueurs: La série (2021)")`
  ne peut pas correspondre à « Braqueurs ».
- Contrôle final en base après écriture (état des deux fiches, URL servie).

## 7. Enseignement

Le catalogue mélange des affiches hébergées sur Supabase Storage (maîtrisées) et
des visuels IMDb (`m.media-amazon.com`) indexés par identifiant. Un identifiant
faux y produit une affiche **parfaitement plausible mais étrangère** — invisible
pour un audit qui ne compare que des chaînes de caractères. Seule la
**vérification du visuel** (ou la résolution de l'identifiant auprès d'une source
tierce) le détecte. À généraliser : contrôler que chaque `imdb_url` de `site_films`
se résout bien sur le même titre.
