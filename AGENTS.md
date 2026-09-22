<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# DIRECTIVES PROJET : ARCHITECTURE MODULAIRE & SRP

## 1. ARCHITECTURE ET PRINCIPE DE RESPONSABILITÉ UNIQUE (SRP)
- **Interdiction formelle des "God Components" :** Un composant ne doit jamais concentrer la vue, la logique métier, la gestion d'état complexe et les requêtes réseau à lui seul.
- **Séparation stricte en 4 couches étanches :**
  1. `UI / Présentation` : Composants déclaratifs purs (props in, render out). Aucun calcul lourd, aucun appel réseau direct.
  2. `Hooks & Orchestration` : Gestion de l'état, synchronisation, liaisons réactives.
  3. `Domaine & Services` : Fonctions pures, déterministes, typées et testables hors du cycle de vie UI.
  4. `Types & Contrats` : Interfaces et schémas isolés dans des fichiers dédiés.

## 2. DIMENSIONNEMENT ET PRAGMATISME DES FICHIERS
- **Taille cible (Soft limit) :** Viser ~150 à 200 lignes par composant UI une fois la logique et les types extraits.
- **Plafond maximal (Hard limit) :** 300 lignes. Au-delà, l'extraction de sous-composants ou de modules spécialisés est obligatoire.
- **Anti-sur-fragmentation :** Ne pas créer de micro-fichiers artificiels. Une extraction doit répondre à un besoin d'isolation de responsabilité, de réutilisabilité ou de lisibilité.

## 3. MULTI-AGENTS & INTERVENTIONS MINIMALES
- **Diffs chirurgicaux :** Toujours privilégier la modification locale ciblée. Ne jamais réécrire un fichier complet si une retouche partielle suffit.
- **Isolation pour agents parallèles :** Maintenir des frontières nettes entre modules pour permettre l'exécution concurrente de sous-agents sans conflits de merge.
- **Typage explicite :** Interfaces et signatures publiques strictement typées pour une auto-documentation immédiate.

## 4. PROTOCOLE D'EXÉCUTION OBLIGATOIRE DE L'AGENT
À chaque tâche, l'agent applique ces 3 étapes :
1. **Planification (Artifact) :** Lister les fichiers impactés/créés et justifier brièvement la séparation des rôles avant de coder.
2. **Implémentation atomique :** Coder dans l'ordre logique (Contrats/Types -> Logique pure/Hooks -> Assemblage UI).
3. **Contrôle post-action :** Vérifier l'absence de régression, le respect des plafonds de lignes et l'absence de dépendance circulaire.

## 5. CYCLE DE VIE ET MAINTENANCE DES RÈGLES
- Ce fichier doit rester sous les 150 lignes. L'agent a l'obligation de refactoriser, simplifier ou élaguer ces directives si le fichier commence à enfler.
- Tout nouveau détail opérationnel lourd doit être déporté sous forme de compétence dans `.agents/skills/`.
- L'interdiction des God Components et le principe SRP sont non négociables et invariables.

---

## INDEX DES RÈGLES CANONIQUES

> Une seule source par sujet : le détail vit dans son fichier et n'est jamais recopié ici. Une règle se met à jour dans son fichier canonique.

| Sujet | Fichier canonique |
| :--- | :--- |
| Architecture, SRP, protocole agent | ce fichier (sections 1 à 5) |
| Interconnexion CUC ↔ CUC Sign, persistance, publication | [`cuc_sign_interconnection.md`](.agents/rules/cuc_sign_interconnection.md:1) |
| Style éditorial — zéro AI slop, Parkour | [`editorial_style_and_truthfulness.md`](.agents/rules/editorial_style_and_truthfulness.md:1) |
| Identité & filmographie des coachs (IMDb) | [`coach_identity_verification.md`](.agents/rules/coach_identity_verification.md:1) |
| Normalisation des titres & mise en avant des crédits | [`credit_title_normalization.md`](.agents/rules/credit_title_normalization.md:1) |
| Édition bilingue du Cockpit FR → EN | [`cockpit_bilingual_editing.md`](.agents/rules/cockpit_bilingual_editing.md:1) |
| Mode Studio — édition visuelle en place | [`studio_mode_preview.md`](.agents/rules/studio_mode_preview.md:1) |
| Micro-textes éditables | [`site_microcopy.md`](.agents/rules/site_microcopy.md:1) |
| Durabilité, CI, roadmap, RLS | [`durability_health.md`](.agents/rules/durability_health.md:1) |
