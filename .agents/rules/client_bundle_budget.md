# RÈGLE PERMANENTE : BUDGET JS DE PREMIER CHARGEMENT & CHARGEMENT DIFFÉRÉ

**Un octet qui n'est pas utile au premier écran est un octet volé à l'utilisateur.**

> Source canonique du sujet — ne pas recopier ce contenu dans `AGENTS.md`.

1. Budget par route publique (gzip, premier chargement) :
   - palier A (contenu statique) : ≤ 250 Ko ; plafond dur 300 Ko ;
   - palier B (interactif/média) : ≤ 300 Ko ; plafond dur 360 Ko ;
   - plafond absolu : 380 Ko.
   Le contrat machine est `scripts/route-weight-budget.json` (mapping route → palier).

2. Preuve : `npm run audit:route-weight` (HTML prérendus, chunks réellement référencés).
   Dépasser un plafond dur ÉCHOUE ; s'en approcher à moins de 10 % AVERTIT.
   La baseline relative ne remplace jamais le plafond absolu.

3. Bibliothèques lourdes — jamais dans le graphe d'une route publique :
   `three`, `framer-motion`, `@supabase/supabase-js`, bibliothèques de cartes/graphes.
   Seuls trois chemins sont licites : `next/dynamic`, `import()` déclenché par une action,
   ou usage strictement serveur. Un `import` statique atteignable depuis une route publique
   est un défaut, pas un choix.

4. Exception : documentée dans `plans/` (justification + plafond temporaire + date de revue),
   jamais silencieuse — même doctrine que la dette publiée de `durability_health.md` § 2.

5. Maintenance : après une amélioration, régénérer la baseline
   (`npm run audit:route-weight:baseline`) **après revue**, et resserrer les plafonds.
   Le contrôle est intégré au gate existant (`.github/workflows/ci.yml`).
