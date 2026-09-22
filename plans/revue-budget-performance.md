# Revue — Budget performance du Mode Studio

Généré le 2026-09-22T00:56:13.767Z par `scripts/audit_performance_budget.mjs`.

| Engagement | État | Preuve |
| --- | --- | --- |
| Un seul WebSocket par visiteur (canal partagé) | ✅ | Aucun `createSafeChannel` sur le chemin public ; tout passe par `subscribeTable`. |
| Aperçu sans Realtime (brouillon par postMessage) | ✅ | `?cuc-preview=1` coupe le Realtime et met les effets lourds en veille ; la vitrine publique reste inchangée. |
| Zéro requête publique nominale (cache serveur) | ✅ | `usePageDynamicContent` ne rejoue une requête que si le serveur n’a pas fourni la page. |
| Publication FR + EN | ✅ | Chaque revalidation de chemin couvre aussi sa variante `/en/...`. |
| Invalidation par tags de cache | ✅ | Les lectures `use cache` + `cacheTag` sont invalidées (`updateTag`). |
| Aucune écriture en base depuis l’aperçu | ✅ | La couche d’édition ne parle qu’au Cockpit (`postMessage`) — l’écriture reste l’action « Enregistrer ». |

## Ratios de référence

- Fichiers publics analysés : 163
- Fichiers Cockpit analysés : 65
- Canaux Realtime historiques restants sur le chemin public : 0

✅ Budget tenu : brouillon-first, un WebSocket par client, cache serveur, publication FR + EN.

