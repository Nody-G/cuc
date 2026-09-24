# Revue — Budget performance du Mode Studio

Généré le 2026-09-24T12:39:36.220Z par `scripts/audit_performance_budget.mjs`.

| Engagement | État | Preuve |
| --- | --- | --- |
| Realtime réservé au Cockpit (aucun canal sur le chemin public) | ✅ | Aucun `createSafeChannel` sur le chemin public ; `subscribeTable` n’ouvre un canal que sur une route `/admin/...` (canal partagé, un seul WebSocket par éditeur). |
| Fraîcheur visiteur sans WebSocket (reprise d’onglet, sondage opt-in) | ✅ | La vitrine recharge à la reprise d’onglet (intervalle minimum) ; le sondage périodique n’existe que si un appelant le demande (bandeau d’annonce, 5 min, onglet visible). |
| Aperçu sans Realtime (brouillon par postMessage) | ✅ | `?cuc-preview=1` coupe le Realtime et met les effets lourds en veille ; la vitrine publique reste inchangée. |
| Zéro requête publique nominale (cache serveur) | ✅ | `usePageDynamicContent` ne rejoue une requête que si le serveur n’a pas fourni la page. |
| Publication FR + EN | ✅ | Chaque revalidation de chemin couvre aussi sa variante `/en/...`. |
| Invalidation par tags de cache | ✅ | Les lectures `use cache` + `cacheTag` sont invalidées (`updateTag`). |
| Aucune écriture en base depuis l’aperçu | ✅ | La couche d’édition ne parle qu’au Cockpit (`postMessage`) — l’écriture reste l’action « Enregistrer ». |

## Ratios de référence

- Fichiers publics analysés : 263
- Fichiers Cockpit analysés : 347
- Canaux Realtime historiques restants sur le chemin public : 0
- Canaux Realtime ouverts par un visiteur : 0 (route Cockpit uniquement)

✅ Budget tenu : brouillon-first, Realtime réservé au Cockpit, reprise d’onglet côté visiteur, cache serveur, publication FR + EN.

