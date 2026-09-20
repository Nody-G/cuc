<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# DOCTRINE ARCHITECTURE & DONNÉES : INTERCONNEXION CUC ↔ CUC SIGN

**Règle Fondamentale Permanente :**
1. **Zéro Texte ni Valeur Orpheline** : Tout ce qui est modifiable dans le Cockpit CUC (sessions, formateurs, disciplines, zones du campus, pages vitrine, formulaires, candidatures) doit être directement persisté dans Supabase (`https://xkbkcsypftvspmkfnrfm.supabase.co`). Aucun contenu critique ne doit dépendre uniquement du `localStorage` ou de constantes locales sans synchronisation base de données.
2. **Interconnexion Bidirectionnelle Maximale** : Dès que c'est utile et pertinent, les tables du site vitrine/cockpit CUC doivent être interconnectées avec les tables de l'application **CUC Sign** (branchée sur la même base de données Supabase) :
   - `site_sessions.cuc_sign_formation_id` ↔ `formations.id` (CUC Sign)
   - `site_team.profile_id` ↔ `profiles.id` (CUC Sign - coachs et directeurs)
   - `site_campus_pois.location_id` ↔ `locations.id` (CUC Sign - lieux et installations d'entraînement)
   - `site_inquiries` (candidatures et leads) ↔ admissions et futurs comptes élèves (`students` / `profiles`)
   - `site_disciplines` ↔ `evaluation_disciplines` (CUC Sign)
3. **Isolation et Sécurité** : Les tables du site vitrine et du cockpit sont strictement préfixées par `site_` et les clés étrangères vers CUC Sign utilisent `ON DELETE SET NULL` pour préserver l'intégrité absolue de CUC Sign.

# DOCTRINE ÉDITORIALE & RÉDACTIONNELLE : ZÉRO "AI SLOP", SOBRIÉTÉ & VÉRITÉ STRICTE

**Règle Permanente Non-Négociable :**
1. **Zéro Invention ni Enflure** : Ne JAMAIS inventer de titres de séquences (ex: fausses scènes d'escaliers ou d'action), de faux rôles de doublures (ex: faire passer une intervention de cascadeur de combat pour une doublure corps exclusive), de distinctions ou de partenariats inexistants.
2. **Ton Factuel et Professionnel** : Bannir tout sensationnalisme et superlatifs creux (*"légendaire"*, *"référence suprême"*, *"gun-fu cinématique"*, *"chutes massives"*, *"dossier pro complet"*, *"élite"*). Utiliser un vocabulaire technique sobre, direct et crédible pour les professionnels du cinéma (ex: *"Combats et cascades physiques"*, *"Câblage en studio"*, *"Cascades de véhicules"*).
3. **Zéro Gadget UI Creux** : Ne pas saturer les interfaces de faux badges marketing (*"HOLLYWOOD ACTION"*, *"PRO STAFF"*, *"WORLDWIDE"*), de points clignotants superflus ou de boutons à rallonge. Rester épuré, élégant et factuel.

