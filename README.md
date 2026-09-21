# CUC — Campus Univers Cascades

Site officiel du **Campus Univers Cascades** (Le Cateau-Cambrésis, 59) : école de cascadeurs,
agence événementielle et centre de formation professionnelle certifié **QUALIOPI**.

## Stack technique

| Domaine | Technologie |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, React Server Components) |
| UI | [React 19](https://react.dev) |
| Styles | [Tailwind CSS 4](https://tailwindcss.com) |
| Animations | [Framer Motion 13](https://motion.dev) |
| 3D | [Three.js](https://threejs.org) (plan de campus interactif) |
| Icônes | [lucide-react](https://lucide.dev) |
| Langage | TypeScript 5 |

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

### Scripts disponibles

| Commande | Description |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | Analyse ESLint |
| `npm run typecheck` | Vérification des types TypeScript |
| `npm run test` | Tests unitaires (Vitest) |
| `npm run test:coverage` | Tests unitaires avec couverture |
| `npm run audit` | Audit consolidé (routes, ancres, liens, taille des fichiers) |
| `npm run audit:strict` | Idem, mais échoue si un problème est détecté (CI) |

## Structure du projet

```
src/
├── app/                    # Routes (App Router) — 15 pages publiques
│   ├── layout.tsx          # Layout racine (métadonnées, polices, Navbar/Footer)
│   ├── page.tsx            # Accueil
│   ├── globals.css         # Thème Tailwind 4 + design tokens
│   └── <route>/            # Chaque route possède son layout.tsx (métadonnées)
├── components/
│   ├── layout/             # Navbar, Footer, drawers, barre d'actions
│   ├── sections/           # Sections de page (home, formation, visite, …)
│   └── ui/                 # Composants réutilisables (boutons, hero, 3D, palette)
├── data/                   # Contenus statiques typés (programmes, équipe, films…)
└── types/                  # Interfaces TypeScript partagées
```

## Routes publiques

| Route | Contenu |
| --- | --- |
| `/` | Accueil — hero parallax, présentation, visite, QUALIOPI, partenaires, réseaux |
| `/formation-de-cascadeur` | Formation professionnelle 2 ans & formule découverte |
| `/stages-cascades-parkour-2` | Stages week-end parkour & cascades |
| `/stunt-workshop-cuc` | Workshop international |
| `/equipe-cascadeurs-pro` | Équipe des formateurs |
| `/cuc-team-cascadeur` | Tournages, films & affiches |
| `/videos-cascadeur` | Reportages TV & vidéos |
| `/spectacles-cascadeurs-yamakasi` | Spectacles & shows cinéma |
| `/animations-airbag-parkour` | Xtrem Jump — airbag géant |
| `/team-building-cascades` | Team building & séminaires |
| `/cuc-events-agence` | Agence CUC Events |
| `/visite-guidee` | Le Campus — visite guidée des installations |
| `/visite-virtuelle` | Visite virtuelle 360° & plan 3D |
| `/partenaires` | Partenaires officiels |
| `/contact-cuc` | Contact, inscriptions & règlement |

Les anciennes URL du site historique sont redirigées de façon permanente
(voir [`next.config.ts`](next.config.ts)).

## Internationalisation (FR / EN)

Vitrine bilingue via **next-intl** (segment `[locale]`) :

- `fr` (défaut) : URLs **sans préfixe** — aucune régression sur les URLs existantes ;
- `en` : URLs préfixées `/en/...` ; détection automatique dans [`src/proxy.ts`](src/proxy.ts) ;
- contenu éditorial traduit via la table Supabase `site_translations` (overlay `payload`
  fusionné par-dessus la base FR, **repli FR automatique**) ;
- sélecteur de langue dans la navbar (desktop + mobile).

| Script | Rôle |
| --- | --- |
| `node scripts/apply_site_translations_migration.mjs` | Crée `site_translations` (RLS + Realtime) |
| `node scripts/seed_site_translations_en.mjs` | Sème les traductions EN (pages + nav + footer) |
| `node scripts/audit_i18n_parity.mjs` | Vérifie la parité FR↔EN → `plans/revue-i18n-parite.md` |

Cockpit : onglet **« Traductions EN »** (route `/admin/translations`) pour éditer l'overlay.

## Conventions de code

- **Composants** : `PascalCase`, un composant par fichier, export nommé.
- **Données** : contenu statique isolé dans `src/data/` et typé via `src/types/`.
- **Styles** : utilitaires Tailwind uniquement ; couleur d'accent `#FFE500`.
- **Accessibilité** : `aria-label` sur les liens icônes, navigation clavier, contrastes AA.
- **Liens externes** : toujours `target="_blank"` + `rel="noopener noreferrer"`.

## Déploiement

Le projet est optimisé pour un déploiement [Vercel](https://vercel.com/new).
Consulter la [documentation de déploiement Next.js](https://nextjs.org/docs/app/building-your-application/deploying).

## Documentation interne

- [`plans/audit-complet-et-modernisation-2026.md`](plans/audit-complet-et-modernisation-2026.md) —
  audit complet et feuille de route de modernisation.
- [`AGENTS.md`](AGENTS.md) — règles destinées aux agents de développement.
