# Revue — Historique des révisions de pages

Généré le 2026-09-24T11:26:16.269Z par `scripts/audit_page_revisions.mjs`.

Règle de rétention : **20 révisions les plus récentes par page**, plus toute révision étiquetée (jalon volontaire). Mode : simulation (aucune suppression).

- Révisions en base : 0
- Pages concernées : 0
- Taille de la table (données + index) : 32 kB
- Révisions à supprimer : 0 (0 Ko de snapshots)

| Page | Révisions | Conservées | À supprimer | Plus ancienne | Snapshots conservés |
| --- | ---: | ---: | ---: | --- | ---: |


## Diagnostic — qui alimente cet historique ?

Écrivain **applicatif** présent : `upsertPageContent` dépose un instantané après chaque enregistrement réussi (`recordPageRevision`, client admin — la policy d’écriture exige un rôle administrateur).
Trigger SQL d’instantané **absent** en base — alimentation assurée par le seul écrivain applicatif (le SQL de référence reste `scripts/schema_page_revisions.sql`).

Triggers posés sur `site_pages` / `site_page_revisions` : aucun.
Fonctions attendues (`snapshot_site_page_revision`, `next_page_revision_number`) : **absentes**.

> Historique alimenté mais encore **vide** : normal tant qu’aucune page n’a été enregistrée depuis la mise en place de l’écrivain. Enregistrer une page dans le Cockpit, puis relancer cette mesure.

Simulation : relancer avec `--write` (ou `npm run cms:purge:revisions`) pour appliquer la rétention.

