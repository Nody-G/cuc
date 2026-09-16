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
| `/visite-guidee` | Visite guidée du domaine (6 ha) |
| `/visite-virtuelle` | Visite virtuelle 360° & plan 3D |
| `/partenaires` | Partenaires officiels |
| `/contact-cuc` | Contact, inscriptions & règlement |

Les anciennes URL du site historique sont redirigées de façon permanente
(voir [`next.config.ts`](next.config.ts)).

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
