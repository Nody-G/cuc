# Revue — Interconnexion `site_disciplines` ↔ `evaluation_disciplines`

**Date :** 2026-09-21
**Statut :** Diagnostic terminé — **aucune écriture effectuée** (doctrine : un lien faux est pire qu'aucun lien)

---

## 1. Le constat de départ

Le vérificateur [`scripts/verify_interconnections.mjs`](../scripts/verify_interconnections.mjs:103) rapportait :

```
✅ site_disciplines ↔ evaluation_disciplines (nom) — 0/10 disciplines actives appariées
```

Le contrôle passait au vert parce qu'il ne testait que `activeDisc.length > 0` — il ne
détectait donc **pas** l'absence totale d'appariement. C'est un défaut du vérificateur.

## 2. Ce que révèle l'inspection réelle

### 2.1 Les deux tables ne sont pas de même nature

| | `site_disciplines` | `evaluation_disciplines` |
| --- | --- | --- |
| **Rôle** | Référentiel éditorial du site vitrine | Instance d'évaluation rattachée à **une session** |
| **Clé** | `id TEXT` (slug, ex. `parkour-yamakasi`) | `id UUID` |
| **Parent** | aucun | `session_id UUID NOT NULL` → `evaluation_sessions.id` (`ON DELETE CASCADE`) |
| **Coach** | `instructor_ids TEXT[]` (plusieurs) | `coach_id UUID` → `profiles.id` (`ON DELETE SET NULL`) |
| **Lignes** | 10 | **4** |
| **Sessions distinctes** | — | **1 seule** (`3435c984-56ec-4322-8fbc-474482c21e37`) |

### 2.2 Le contenu de `evaluation_disciplines` est un jeu de 4 étiquettes courtes

```
Parkour, Acrobatie, Combat, Chute
```

Ces 4 lignes appartiennent **toutes à la même session d'évaluation**. Ce n'est pas un
catalogue : c'est la liste des disciplines évaluées lors d'une session donnée.

### 2.3 Le contenu de `site_disciplines` est un catalogue éditorial de 10 entrées

```
01 Combat Chorégraphié & Action Design
02 Chute de Grande Hauteur (CUC Tower 21m)
03 Torche Humaine & Cascades Pyrotechniques
04 Câblage 3D & Wirework Cinéma
05 Maniement d'Armes & Rôles d'Intervention
06 Parkour & Méthode Yamakasi
07 Chutes de sa Hauteur & Brise-Mobilier
08 Maniement d'Armes Blanches Historiques & Modernes
09 Chutes d'Escalier
10 Acrobatie & Gymnastique de Cascade
```

### 2.4 L'appariement par nom est structurellement impossible

`0/10` par nom exact normalisé. Les pistes souples ne couvrent que 4 entrées sur 10 :

| `site_disciplines` | Étiquette CUC Sign candidate |
| --- | --- |
| Combat Chorégraphié & Action Design | `Combat` |
| Chute de Grande Hauteur (CUC Tower 21m) | `Chute` |
| Parkour & Méthode Yamakasi | `Parkour` |
| Acrobatie & Gymnastique de Cascade | `Acrobatie` |
| **Torche Humaine & Cascades Pyrotechniques** | *aucune* |
| **Câblage 3D & Wirework Cinéma** | *aucune* |
| **Maniement d'Armes & Rôles d'Intervention** | *aucune* |
| **Chutes de sa Hauteur & Brise-Mobilier** | *aucune* |
| **Maniement d'Armes Blanches Historiques & Modernes** | *aucune* |
| **Chutes d'Escalier** | *aucune* |

## 3. Conclusion : la doctrine est mal formulée, pas mal appliquée

La doctrine AGENTS.md prescrit :

> `site_disciplines` ↔ `evaluation_disciplines` (CUC Sign)

**Cette interconnexion est structurellement erronée.** Trois raisons :

1. **Cardinalité incompatible** — `evaluation_disciplines` est une table d'instance
   (`session_id NOT NULL`, `ON DELETE CASCADE`). Une discipline du catalogue vitrine
   existe indépendamment de toute session d'évaluation. Relier les deux créerait une
   dépendance où la suppression d'une session d'évaluation effacerait des lignes du
   référentiel vitrine.

2. **Granularité incompatible** — 4 étiquettes courtes (`Combat`, `Chute`) contre
   10 disciplines éditoriales spécialisées (`Torche Humaine & Cascades Pyrotechniques`).
   Aucune correspondance 1:1 n'existe, et forcer une correspondance N:1 produirait
   des liens **faux** — exactement ce que la doctrine interdit.

3. **Le parent réel est `evaluation_sessions`** — la FK de `evaluation_disciplines`
   pointe vers `evaluation_sessions.id`, pas vers un référentiel de disciplines.
   Il n'existe **aucune table de référentiel de disciplines** dans CUC Sign
   (vérifié : `information_schema.tables` ne retourne que `evaluation_disciplines`).

## 4. Décision

**Aucune colonne de liaison n'est ajoutée.** Conformément à la doctrine
« un lien FAUX est pire qu'aucun lien », on ne crée pas de FK
`site_disciplines.evaluation_discipline_id` : elle serait soit NULL à 100 %,
soit remplie de correspondances arbitraires.

## 5. Corrections appliquées à la place

### 5.1 Corriger le vérificateur (le vrai bug)

[`scripts/verify_interconnections.mjs`](../scripts/verify_interconnections.mjs:103) validait
`activeDisc.length > 0` — un contrôle qui ne peut jamais échouer tant que la table
n'est pas vide. Il masquait donc l'absence d'appariement.

Le contrôle est reformulé pour distinguer deux cas honnêtement :

- **lien cassé** (FK orpheline) → échec, code 2
- **appariement nul** (0/N) → **avertissement explicite**, pas un faux succès

### 5.2 Documenter la doctrine

La ligne `site_disciplines ↔ evaluation_disciplines` d'AGENTS.md doit être corrigée
en `site_disciplines` ↔ *(pas de référentiel CUC Sign — table d'instance uniquement)*.

## 6. Ce qui reste légitimement interconnectable

| Interconnexion | État | Verdict |
| --- | --- | --- |
| `site_team.profile_id` ↔ `profiles.id` | 5/12 | ✅ valide, à compléter (chantier 6) |
| `site_sessions.cuc_sign_formation_id` ↔ `formations.id` | 10/18 | ✅ valide, à compléter (chantier 6) |
| `site_campus_pois.location_id` ↔ `locations.id` | 5/5 | ✅ complet |
| `site_inquiries.metadata.cuc_sign_student_id` ↔ `students.id` | 0/0 | ✅ valide, table vide |
| `site_disciplines` ↔ `evaluation_disciplines` | 0/10 | ❌ **structurellement invalide** |

## 7. Scripts d'inspection réutilisables

- `node scripts/inspect_disciplines_mapping.mjs` — schémas + contenu + matrice d'appariement
- `node scripts/inspect_eval_disciplines_scope.mjs` — portée (instance vs référentiel)
- `node scripts/inspect_eval_disciplines_fk.mjs` — contraintes FK sortantes
