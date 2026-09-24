# RÈGLE PERMANENTE : INTERCONNEXION CUC VITRINE ↔ CUC SIGN & PERSISTANCE TOTALE

**Zéro valeur orpheline ; un lien faux est pire qu'aucun lien.**

> Source canonique du sujet — ne pas recopier ce contenu dans `AGENTS.md`.

## 1. Principe directeur

- Site vitrine / Cockpit CUC et CUC Sign partagent la même instance Supabase (`https://xkbkcsypftvspmkfnrfm.supabase.co`).
- **Zéro Texte ni Valeur Orpheline** : tout ce qui est modifiable dans le Cockpit (sessions, formateurs, disciplines, zones du campus, pages vitrine, formulaires, candidatures) est persisté en base. Aucun contenu critique uniquement en `localStorage` ou en constante locale non synchronisée.
- **Interconnexion bidirectionnelle maximale** dès que c'est utile et pertinent.

## 2. Matrice des interconnexions

| Entité vitrine / Cockpit | Table vitrine | Table CUC Sign | Liaison |
| :--- | :--- | :--- | :--- |
| Sessions de formation | `site_sessions` | `formations` | `cuc_sign_formation_id` ↔ `formations.id` |
| Équipe & formateurs | `site_team` | `profiles` | `profile_id` ↔ `profiles.id` (coachs, directeurs) |
| Campus & lieux d'entraînement | `site_campus_pois` | `locations` | `location_id` ↔ `locations.id` |
| Candidatures & leads | `site_inquiries` | `students` / `profiles` | conversion en dossier élève (admissions) |
| Disciplines | `site_disciplines` | **aucune table** | **Aucun appariement — ne JAMAIS créer de FK.** `evaluation_disciplines` est une table d'**instance** (`session_id NOT NULL` → `evaluation_sessions.id`, `ON DELETE CASCADE`) de 4 étiquettes courtes ; `site_disciplines` est un **référentiel éditorial** de 10 entrées spécialisées. Cf. `plans/revue-interconnexion-disciplines.md`. |

## 3. Sécurité et intégrité

1. **Préfixe obligatoire** : les tables vitrine/cockpit portent strictement le préfixe `site_`.
2. **Protection CUC Sign** : les clés étrangères vers CUC Sign utilisent `ON DELETE SET NULL` — une action côté vitrine ne corrompt jamais les données métier de CUC Sign.
3. **Un lien FAUX est pire qu'aucun lien** : prouver la compatibilité de cardinalité et de granularité avant toute FK. Une FK remplie de correspondances arbitraires propage de la fausse donnée dans toute l'application — c'est plus grave qu'une FK NULL.
4. **Realtime** : les mises à jour des tables `site_*` passent par les canaux existants (`subscribeTable`, un seul WebSocket par client).
5. **Panne de lecture** : une lecture Supabase en échec sert la **copie certifiée** du code (`DEFAULT_PAGE_CONTENTS`, `DEFAULT_NAVIGATION`…) — jamais une page morte. En place dans `getLocalizedPageContent()` (`src/lib/i18n/server.ts`).

## 4. Publication réelle des pages

`site_pages.is_published` est écrit par le Cockpit et respecté en **quatre points** :

1. **Sitemap** — `src/app/sitemap.ts`.
2. **Rendu** — `UnpublishedPageGate` branché dans `SiteDataProvider` : le HTML public ne contient jamais un contenu non publié.
3. **Moteurs** — `robots: noindex` posé par `buildRouteMetadata()` (`src/lib/i18n/route-metadata.ts`), source unique des métadonnées des 14 routes.
4. **Aperçu** — l'iframe du Cockpit (`?cuc-preview=1`) neutralise la garde pour continuer à éditer un brouillon.

Reste à faire : le **statut HTTP 404** — deux voies chiffrées dans `plans/revue-diffusion-brouillons.md`. **Ordre imposé** : 404 d'abord, policy RLS `site_pages` ensuite.

## 5. Présentation client de CUC Sign (positionnement, pas fonctionnalité)

CUC Sign est la **seconde étape** du projet, en chantier, indépendante du site : la vitrine et le Cockpit sont livrés
et fonctionnent sans elle. Toute présentation (dossier client, script d'appel) doit donc :

1. dire **ce que c'est** en langage métier — le suivi de l'élève après l'admission (émargement Qualiopi, rotations de
   groupes, sécurité, fiche de casting) — et jamais en langage technique ;
2. prouver la valeur par ce que le campus y gagne **aujourd'hui et demain** : preuves de présence pour les
   financeurs, temps administratif libéré, traçabilité des blessures, pilotage pédagogique sur des faits, et
   placement des élèves sur les tournages (le CUC comme vivier des productions) ;
2 bis. montrer les **relations entre les deux applications** — ce qui circule (candidature → dossier élève,
   formations/coachs/lieux lus par le site) et **l'état de chaque échange** (« en service », « à étendre »,
   « à l'étude »). C'est le cœur de l'intérêt des deux outils réunis : une candidature perdue ou une session
   annoncée à tort n'ont plus de raison d'exister ;
3. **ne jamais laisser croire à un coût caché** : périmètre et budget sont annoncés ensemble, le jour où la seconde
   étape est lancée, et rien de ce qui est déjà payé n'est remis en cause ;
4. s'appuyer sur ce qui existe déjà (le pont de données est en service : formations, coachs, lieux lus depuis CUC Sign)
   plutôt que sur des promesses. Toute fonctionnalité citée doit exister dans `Nody-G/cuc-sign` — sinon elle se tait.
