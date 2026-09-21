# Revue d'interconnexion — `site_team` 5/12 et `site_sessions` 10/18

**Date :** 2026-09-21
**Statut :** ✅ Diagnostic terminé — aucun lien à créer (NULL légitimes)
**Doctrine appliquée :** AGENTS.md — « Un lien FAUX est pire qu'aucun lien »

---

## 1. Contexte

Le vérificateur [`scripts/verify_interconnections.mjs`](../scripts/verify_interconnections.mjs)
rapportait :

```
✅ site_team.profile_id ↔ profiles.id — 5/12 liés
✅ site_sessions.cuc_sign_formation_id ↔ formations.id — 10/18 liées
```

Ces ratios **ne sont pas des anomalies** : le vérificateur confirme
`0 lien(s) cassé(s)`. Les lignes non liées portent une FK `NULL`, état valide
par doctrine (`ON DELETE SET NULL`). La question restante était : ces `NULL`
sont-ils **légitimes** ou **rattrapables** ?

Le script [`scripts/inspect_team_sessions_linkage.mjs`](../scripts/inspect_team_sessions_linkage.mjs)
(lecture seule) a comparé chaque ligne non liée aux tables CUC Sign.

---

## 2. `site_team` — 7 lignes non liées : NULL légitimes

| Membre | Rôle | Profil CUC Sign correspondant |
|---|---|---|
| Amédéo Cazzella | Formateur Armes & Combats | ⛔ aucun |
| Jérôme Gaspard | Responsable Pédagogique | ⛔ aucun |
| Maurice Chan | Instructeur Référent | ⛔ aucun |
| Vincent Bouillon | Spécialiste Combats & Chutes | ⛔ aucun |
| Kefi Abrikh | Action Designer & Chorégraphe | ⛔ aucun |
| Michel Bouis | Formateur Chutes & Armes | ⛔ aucun |
| Alan Cueff | Instructeur & Cascadeur | ⛔ aucun |

**Aucun profil CUC Sign ne partage de jeton de nom** avec ces 7 membres. Ce sont
des **intervenants externes / invités** (coachs de renom du cinéma français)
qui n'ont pas de compte dans l'application CUC Sign. Leur `profile_id` reste
`NULL` — c'est l'état correct.

> Créer un lien vers un profil arbitraire propagerait une fausse identité dans
> toute l'application CUC Sign (planning, évaluations, paie). Interdit.

---

## 3. `site_sessions` — 8 lignes non liées : NULL légitimes

Les 8 sessions non liées sont des **sessions futures (2027)** qui n'existent pas
encore dans CUC Sign. Les candidats trouvés par jeton générique (`pro`, `afdas`,
`immersion`, `stunt`, `summer`, `camp`) **ne correspondent pas par la date** :

| Session vitrine | Date | Candidat CUC Sign | Date candidat | Verdict |
|---|---|---|---|---|
| `pro-longue-duree` | 27 juin → 09 juillet **2027** | Formation Pro | août 2026 / oct. 2026 / avril 2027 | ❌ dates ≠ |
| `weekend-immersion` | 20-21 mars **2027** | Week-end Immersion | nov. 2026 / sept. 2026 | ❌ dates ≠ |
| `afdas-artistes-interpretes` | 18-29 janvier **2027** | Stage AFDAS | mars 2026 / mai 2026 | ❌ dates ≠ |
| `stunt-summer-camp` | 08-13 août **2027** | Stunt Summer Camp | août 2026 / juillet 2026 | ❌ dates ≠ |
| `afdas-cascadeurs-pro` | « annoncée prochainement » | Stage AFDAS | mars 2026 / mai 2026 | ❌ pas de date |
| `afdas-artistes-interpretes` | 09-20 novembre 2026 | Stage AFDAS | mars 2026 / mai 2026 | ❌ dates ≠ |
| `afdas-artistes-interpretes` | 15-26 mars 2027 | Stage AFDAS | mars 2026 / mai 2026 | ❌ dates ≠ |
| `stunt-summer-camp` | 11-16 juillet 2027 | Stunt Summer Camp | août 2026 / juillet 2026 | ❌ dates ≠ |

**Un jeton de nom commun ne prouve pas l'identité d'une session.** Apparier
`afdas-artistes-interpretes (janvier 2027)` à `Stage AFDAS (mars 2026)` ferait
pointer une session vitrine vers une formation CUC Sign **déjà passée** — le
compteur de places, les inscriptions et les évaluations seraient faux.

Ces sessions seront liées **automatiquement** lorsque les formations
correspondantes seront créées dans CUC Sign (via
[`syncSessionsSeatCountsFromCucSign()`](../src/app/admin/actions.ts:1597) et le
flux d'administration). En attendant, `NULL` est l'état correct.

---

## 4. Décision

1. **Aucune FK à créer** pour `site_team` ni `site_sessions`.
2. Les ratios `5/12` et `10/18` sont **sains** : ils reflètent la réalité
   (intervenants externes sans compte, sessions futures non encore créées).
3. Le vérificateur [`verify_interconnections.mjs`](../scripts/verify_interconnections.mjs)
   distingue désormais explicitement :
   - **❌ cassé** = FK non nulle pointant vers une ligne inexistante (régression) ;
   - **✅ NULL légitime** = FK nulle (état valide, en attente de création côté CUC Sign).
4. Le script d'inspection
   [`inspect_team_sessions_linkage.mjs`](../scripts/inspect_team_sessions_linkage.mjs)
   reste disponible pour rejouer le diagnostic après toute création de compte ou
   de formation côté CUC Sign.

---

## 5. Critère de réouverture

Rejouer `node scripts/inspect_team_sessions_linkage.mjs` si :
- un intervenant externe obtient un compte CUC Sign (→ lier son `profile_id`) ;
- une formation 2027 est créée dans CUC Sign (→ lier `cuc_sign_formation_id`).

Tant qu'aucun candidat **avec date concordante** n'apparaît, les `NULL` restent
la seule option conforme à la doctrine.
