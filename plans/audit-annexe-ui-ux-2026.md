# Annexe — Audit UI / UX, mise en page & synchronisation (2026)

Complément du rapport principal [`audit-general-2026.md`](plans/audit-general-2026.md), du
[`audit-supabase-2026.md`](plans/audit-supabase-2026.md) et de la revue de migration
[`revue-migration-supabase-2026.md`](plans/revue-migration-supabase-2026.md).
Toutes les affirmations ci-dessous sont mesurées par les scripts rejouables du dépôt.

---

## 1. Mise en page — une seule largeur pour toute la vitrine

**Constat d'audit.** La page Équipe affichait sa grille en `1600 px`, tandis que **38 autres
fichiers** (14 pages + 24 sections/blocs + en-tête/pied) plafonnaient à `1280 px` : **55 conteneurs
hors charte** au total (`max-w-7xl`), d'où des ruptures d'alignement d'une page à l'autre.

**Décision produit (2026-09-21).** La largeur de la page Équipe devient la norme unique :
classe `.page-shell` définie dans [`globals.css`](src/app/globals.css:678)
(`max-width: 1600px`, gouttières responsive `1 / 1.5 / 2 rem`), appliquée par le codemod
[`apply_canonical_container.mjs`](scripts/apply_canonical_container.mjs:1) — dry-run documenté
dans [`revue-conteneur-canonique.md`](plans/revue-conteneur-canonique.md:1).

| Mesure | Avant | Après |
| --- | ---: | ---: |
| Conteneurs locaux `max-w-7xl` / `max-w-[1600px]` | 58 | 0 |
| Fichiers alignés sur `.page-shell` | 2 | 40 |
| Écarts détectés par l'auditeur (règle n°9) | 55 | **0** |

**Exceptions assumées (documentées dans le codemod).**

- Cockpit `(admin)` : interface outil, pas vitrine.
- [`LightboxModal`](src/components/ui/LightboxModal.tsx:1) : la largeur interne cadre le média affiché.
- Colonnes éditoriales (`max-w-3xl`… telles que les chapeaux de section) : largeurs de lecture, conservées.

**Vérification.** `node scripts/audit_full_app.mjs` → « Écarts de largeur : 0 ».

---

## 2. Jaquettes de films — une seule présentation, une seule navigation

**Constat d'audit.** Quatre présentations coexistaient : le showcase « LES FILMS DOUBLÉS &
COORDONNÉS PAR LE CUC », la section Accueil, la filmographie de la fiche coach, et un composant
`FilmGridCard` devenu orphelin.

**Décision produit.** La présentation du showcase devient la **norme unique** :
[`FilmPosterCard`](src/components/sections/films/FilmPosterCard.tsx:1) — affiche ratio 2/3, badge
d'année en haut à gauche, titre sous l'affiche, repli visuel sans image cassée, **clic → fiche
détaillée** (`FilmDetailsModal`, la navigation validée par le client).

| Surface | Avant | Après |
| --- | --- | --- |
| Showcase « LES FILMS DOUBLÉS… » | carte inline (référence) | `FilmPosterCard` + modale |
| Accueil — bloc Tournages | `Link` vers l'ancre + affiches **codées en dur** | résolution live dans `site_films` par titre normalisé (`creditTitleKey`), carte + modale, repli linké si fiche absente ; abonnement Realtime `site_films` |
| Fiche coach — filmographie | carte locale, badge d'année **en haut à droite** | même carte detail enrichie (rôles conservés), **badge d'année aligné en haut à gauche** comme la référence |
| `FilmGridCard` | orphelin (jamais importé) | **supprimé** (plus aucun composant orphelin) |

**Vérification.** `node scripts/audit_full_app.mjs` → « Composants orphelins : 0 ».

---

## 3. Synchronisation temps réel — Cockpit → Vitrine

**Constat d'audit.** 14 composants à données vivantes n'avaient **aucun** abonnement temps réel
(couverture mesurée : 26 %). En base, la table `site_settings` n'était **pas publiée** : tous les
abonnements la concernant (Cockpit inclus) étaient inertes.

**Corrections.**

- Nouveau hook partagé [`useRealtimeRefresh`](src/lib/hooks/useRealtimeRefresh.ts:1) — un canal par
  composant (multi-tables), anti-rebond des rafales, `refresh` capturé par référence (aucune
  re-souscription au rendu), nettoyage systématique ; doctrine « le Realtime est un confort,
  jamais une dépendance dure » (échec absorbé, repli statique affiché).
- 12 surfaces branchées :

| Surface | Tables | Effet visiteur |
| --- | --- | --- |
| Fiche coach (`CoachDetailClient`) | `site_team`, `site_films` | crédits et rôles à jour sans rechargement |
| Vidéos (`/videos-cascadeur`) | `site_settings` | nouveaux reportages affichés en direct |
| En-tête (actions), CTA mobile, pied de page | `site_settings` | téléphone, libellés, coordonnées |
| Événements (`EventsPillarsSection`) | `site_events` | événements d'agence en direct |
| Partenaires (`PartenairesGridSection`) | `site_partners` | ajout/retrait instantané |
| Disciplines (`FormationDisciplinesExplorer`) | `site_disciplines` + miroir | référentiel vivant |
| Célébrités (`CelebrityDoublesGallery`), modale film | `site_settings`, `site_team` | fiches fraîches |
| Installations, carte campus | `site_settings`, `site_campus_pois` | campus vivant |

- Base : `ALTER PUBLICATION supabase_realtime ADD TABLE site_settings` + table
  `site_page_revisions` créée (publication incluse) — cf.
  [`revue-migration-supabase-2026.md`](plans/revue-migration-supabase-2026.md:1).

| Mesure | Avant | Après |
| --- | ---: | ---: |
| Couverture des composants live | 26 % | **92 %** |
| Tables publiées pour le temps réel | 22 | **24** (0 manquante) |
| Canal sans nettoyage | 0 | 0 |

Résidus volontaires (documentés) : `PageDataProvider` (données déjà rendues côté serveur) et
`CampusPlan3D` (scène 3D lourde) restent statiques.

---

## 4. Navigation, liens & redirections

- **Liens internes** : 0 cassé, vérification désormais fiable en présence des deux langues
  (la version précédente de l'auditeur ne pouvait structurellement pas détecter un 404 à 1 ou 2
  segments — corrigé).
- **Redirections** ([`next.config.ts`](next.config.ts:145)) : 18 redirections historiques
  validées automatiquement — 0 destination introuvable, 0 chaîne (nouvelle règle de l'auditeur).
- **Réseaux sociaux** : 0 conflit de handle (source unique `site_social_links`).
- **CTA flottants mobiles** : le bouton « retour en haut » se positionne déjà **au-dessus** de la
  barre collante (`bottom-[calc(5rem+env(safe-area-inset-bottom))]` sur mobile) — aucun
  chevauchement possible.
- **Méga-menus** : ajout de la fermeture au clavier (`Échap`) et à la sortie du focus — la
  navigation au clavier était possible mais le panneau pouvait rester ouvert.

---

## 5. Accessibilité & performance (état vérifié)

| Point | État | Source de vérification |
| --- | --- | --- |
| Lien d'évitement « Aller au contenu » | ✔ rendu sur toutes les pages | [`RootShell.tsx`](src/components/layout/RootShell.tsx:102) |
| `prefers-reduced-motion` | ✔ 4 blocs (cartes, marquee, fond, global) | [`globals.css`](src/app/globals.css:271) |
| Fermeture clavier des menus | ✔ `Échap` + sortie de focus | [`NavDropdowns.tsx`](src/components/layout/navbar/NavDropdowns.tsx:45) |
| `aria-*` sur les actions icônes | ✔ (labels localisés) | Navbar / Footer / CTA |
| Three.js chargé à la demande | ✔ `next/dynamic` sur les 2 pages publiques + Cockpit | [`visite-virtuelle/page.tsx`](src/app/(site)/[locale]/visite-virtuelle/page.tsx:42) |
| Images AVIF/WebP + `sizes` explicites | ✔ (formats + srcset calibrés) | [`next.config.ts`](next.config.ts:20) |
| Sécurité (CSP, HSTS, anti-clickjacking) | ✔ en-têtes globaux | [`next.config.ts`](next.config.ts:83) |

---

## 6. Résidus & suivi

- **Scripts d'audit** : l'auditeur principal couvre désormais 10 familles de contrôles (liens,
  ancres, doublons, redirections, orphelins, legacy WordPress, doctrine, réseaux sociaux,
  largeur, temps réel) + 3 avertissements (parité i18n, metadata, couverture RT). Les scripts
  historiques restent tracés (en-têtes d'obsolescence), jamais supprimés.
- **URLs WordPress résiduelles** : toutes confinées dans des registres de migration ou scripts
  historiques marqués — **0 référence vivante** dans `src/`.
- **Suivi recommandé** : re-exécuter `npm run audit && npm run audit:supabase && npm run report:audit`
  après chaque vague de modifications (la discipline « zéro valeur orpheline » s'appuie sur ce
  triptyque).
