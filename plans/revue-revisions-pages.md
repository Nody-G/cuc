# Revue — Historique des révisions de pages

Généré le 2026-10-02T14:27:08.288Z par `scripts/audit_page_revisions.mjs`.

Règle de rétention : **20 révisions les plus récentes par page**, plus toute révision étiquetée (jalon volontaire). Mode : simulation (aucune suppression).

- Révisions en base : 6
- Pages concernées : 3
- Taille de la table (données + index) : 112 kB
- Révisions à supprimer : 0 (0 Ko de snapshots)

| Page | Révisions | Conservées | À supprimer | Plus ancienne | Snapshots conservés |
| --- | ---: | ---: | ---: | --- | ---: |
| `/` | 4 | 4 | 0 | 2026-09-25 | 12 Ko |
| `partenaires` | 1 | 1 | 0 | 2026-09-29 | 1 Ko |
| `videos-cascadeur` | 1 | 1 | 0 | 2026-10-01 | 2 Ko |


## Diagnostic — qui alimente cet historique ?

Écrivain **applicatif** présent : `upsertPageContent` dépose un instantané après chaque enregistrement réussi (`recordPageRevision`, client admin — la policy d’écriture exige un rôle administrateur).
Trigger SQL d’instantané **absent** en base — alimentation assurée par le seul écrivain applicatif (le SQL de référence reste `scripts/schema_page_revisions.sql`).

Triggers posés sur `site_pages` / `site_page_revisions` : aucun.
Fonctions attendues (`snapshot_site_page_revision`, `next_page_revision_number`) : **absentes**.

Simulation : relancer avec `--write` (ou `npm run cms:purge:revisions`) pour appliquer la rétention.

