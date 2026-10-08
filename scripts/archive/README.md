# Archives des Scripts CUC

Ce dossier regroupe les scripts et fichiers de données historiques, séparés du cœur actif de l'application pour maintenir un répertoire `scripts/` lisible et sécurisé.

## Organisation

- **`probes/`** : Sondes d'inspection, tests unitaires one-shot et vérifications ponctuelles créées lors de sessions de débogage antérieures.
- **`migrations/`** : Scripts SQL et scripts Node de migrations / seeds / correctifs déjà exécutés en base de données.
- **`data/`** : Dumps statiques volumineux (JSON, SQL, XML) et rapports historiques sans dépendance active dans l'application.
- **`experiments/`** : Scripts et utilitaires divers non référencés dans `package.json`.

> **Note :** Tous les scripts de production, de CI, de build et d'audit actif restent situés à la racine de `scripts/` et dans `scripts/lib/`, `scripts/backup/`.
