# Revue — Hébergement Vercel : le CUC peut-il rester sur l'offre gratuite ?

**Date :** 2026-09-29
**Question posée :** « Le centre de formation est une association loi 1901, regarde si ça marche pour rester en gratuit sur Vercel. »
**Nature de ce document :** document de décision. **Aucun fait externe n'y est affirmé** (contrat, quota chiffré, programme associatif). Tout ce qui dépend de Vercel est marqué « **à vérifier** », avec l'endroit exact où le vérifier. Les chiffres cités viennent du dépôt ou des audits du projet.

---

## 1. La réponse en trois lignes

1. **Techniquement, oui** : le dépôt n'utilise aucune fonctionnalité payante de Vercel (aucune tâche planifiée, aucune fonction longue) et, depuis que les octets des médias sont servis par Supabase, il ne reste à Vercel que du HTML, du RSC, du JavaScript et des transformations d'images — tous mesurés ci-dessous, tous modestes.
2. **Juridiquement, le statut associatif ne tranche rien** : le point à instruire est le **caractère commercial de l'usage du site**, et deux vérifications échappent au dépôt (la clause d'usage de l'offre gratuite ; la qualification d'une activité qui facture des formations).
3. **Conclusion honnête :** « cela dépend de deux vérifications que seul Vercel peut trancher » ; si l'une bloque, les replis sont documentés (§ 6) et la consommation peut encore baisser (§ 7).

---

## 2. Ce que le dépôt établit (partie A)

### 2.1 Configuration d'hébergement

| Fait | Preuve |
| --- | --- |
| **Aucun `vercel.json`** à la racine : donc aucun `crons`, aucun `maxDuration`, aucun runtime edge déclaré | Arborescence de la racine du dépôt (aucun `vercel.json`) ; règle interne [`.agents/rules/durability_health.md`](../.agents/rules/durability_health.md:59) § 7 |
| Le dossier `.vercel` est ignoré par git : le déploiement vit chez la plateforme, pas dans le dépôt | [`.gitignore`](../.gitignore:39) |
| La production est un déploiement Vercel `cuc-new.vercel.app` | [`seo.ts`](../src/lib/seo.ts:8) (préfère `VERCEL_PROJECT_PRODUCTION_URL`, repli `cuc-new.vercel.app`) ; [`probe_production_guard.mjs`](../scripts/probe_production_guard.mjs:21) ; [`TrafficMonitorView.tsx`](<../src/app/(admin)/admin/components/TrafficMonitorView.tsx:98>) |
| Le domaine public n'est **pas** encore basculé : `www.campus-universcascades.com` sert toujours l'ancien WordPress | [`roadmap-site-2026.md`](../plans/roadmap-site-2026.md:89) ; [`plan-reste-a-faire-2026-09-24.md`](../plans/plan-reste-a-faire-2026-09-24.md:73) |

### 2.2 Variables d'environnement attendues en production

Déduites des lectures `process.env` du code (aucune valeur secrète n'est recopiée ici) :

| Variable | Lue dans | Rôle |
| --- | --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | [`admin.ts`](../src/lib/supabase/admin.ts:16) | Écritures Cockpit et Plan 3D ; son absence sur Vercel a déjà fait échouer des écritures **en silence** |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | [`server.ts`](../src/lib/supabase/server.ts:4), [`public.ts`](../src/lib/supabase/public.ts:47), [`client.ts`](../src/lib/supabase/client.ts:37) (replis codés en dur) | Accès données et Realtime |
| `NEXT_PUBLIC_SITE_URL` (repli `VERCEL_PROJECT_PRODUCTION_URL`) | [`seo.ts`](../src/lib/seo.ts:8) | URL canonique, `sitemap.xml`, `robots.txt`, `og:image` |
| `NEXT_PUBLIC_APP_URL` | [`user-accounts.ts`](<../src/app/(admin)/admin/actions/user-accounts.ts:220>), [`user-guards.ts`](<../src/app/(admin)/admin/actions/user-guards.ts:113>) | Repli de redirection d'authentification |
| `INSTAGRAM_ACCESS_TOKEN` / `META_ACCESS_TOKEN`, `INSTAGRAM_ACCOUNT_ID` / `META_INSTAGRAM_ACCOUNT_ID` | [`instagram-service.ts`](../src/lib/instagram/instagram-service.ts:75), [`instagram-monitor.ts`](<../src/app/(admin)/admin/actions/instagram-monitor.ts:29>) | Statistiques Instagram (facultatif) |
| `VERCEL_GIT_COMMIT_SHA` | cité comme trace de déploiement, [`plan-correctifs-cockpit-vitrine.md`](../plans/plan-correctifs-cockpit-vitrine.md:131) | Traçabilité du build |

### 2.3 Incidents déjà survenus côté hébergement

| Date | Incident | Trace | Ce qu'il apprend |
| --- | --- | --- | --- |
| 2026-09-20 | Vitrine inaccessible en production (toutes pages sauf le Cockpit) | [`revue-panne-prod-vercel.md`](../plans/revue-panne-prod-vercel.md:4) | **Ce n'était pas un échec de build Vercel** : une exception JavaScript cliente (canal Supabase Realtime à nom statique) remplaçait la page ; corrigé et vérifié en production ([`revue-panne-prod-vercel.md`](../plans/revue-panne-prod-vercel.md:11), commit `4efff33`) |
| 2026-09-20 | `/_next/image` renvoyait **400** sur les médias Supabase | [`revue-panne-prod-vercel.md`](../plans/revue-panne-prod-vercel.md:53) ; commentaire de [`next.config.ts`](../next.config.ts:44) | Preuve directe que **les transformations d'images passent par Vercel**, même quand les octets viennent de Supabase |
| 2026-09-23 | Supabase : quota de stockage dépassé → API Data en `402 exceed_storage_size_quota` | [`plan-reste-a-faire-2026-09-24.md`](../plans/plan-reste-a-faire-2026-09-24.md:71) ; [`roadmap-site-2026.md`](../plans/roadmap-site-2026.md:40) | Incident **Supabase**, pas Vercel ; a motivé le garde-fou `npm run audit:quotas` |
| 2026-09-24 | `SUPABASE_SERVICE_ROLE_KEY` absente de l'environnement Vercel → écritures refusées en silence | [`plan-reste-a-faire-2026-09-24.md`](../plans/plan-reste-a-faire-2026-09-24.md:72) ; [`revue-transformations-3d-flexibles.md`](../plans/revue-transformations-3d-flexibles.md:359) | La configuration plateforme est un point de panne réel : à documenter et contrôler |

### 2.4 Ce que le dépôt affirme déjà — et pourquoi cela ne suffit pas

Le dossier client généré écrit que « le règlement de l'offre gratuite de Vercel la réserve à un usage non commercial » et évalue l'offre professionnelle à environ 20 $/mois ([`cuc-dossier-application.html`](../reports/cuc-dossier-application.html:843) ; source du texte : [`generate_app_dossier.mjs`](../scripts/generate_app_dossier.mjs:762)). La règle interne reprend la même réserve ([`durability_health.md`](../.agents/rules/durability_health.md:63)).

Ces phrases sont **dans le dépôt** mais leur fondement est **externe** : elles ne prouvent rien par elles-mêmes. Elles restent **à vérifier** à la source, auprès de Vercel (conditions d'utilisation et page de tarification des offres).

---

## 3. Ce que l'application consomme réellement (partie B)

### 3.1 Ce qui ne passe plus par Vercel : les octets des médias

Après le rapatriement WordPress → Supabase ([`doctrine-medias-rapatriement.md`](../plans/doctrine-medias-rapatriement.md:1), appliqué le 2026-09-20) puis la campagne de recompression ([`plan-compression-medias-cockpit.md`](../plans/plan-compression-medias-cockpit.md:1)), les images et documents du site vivent dans le bucket `cuc-vitrine-assets` et sont servis par le **CDN Supabase**.

Mesure du 2026-09-29 (`npm run audit:quotas`) :

- bucket `cuc-vitrine-assets` : **182 objets / 31,27 Mo** ;
- stockage objet total : 31,68 Mo sur 189 objets ; base `postgres` : 18,94 Mo.

Conséquence : **les octets de ces médias ne sont pas de la bande passante Vercel**. La version committée du même rapport indiquait 90,95 Mo de stockage au même jour : la recompression a ramené ce poste à environ un tiers.

**Limite de cette affirmation :** si une page affiche un média Supabase via `next/image`, la **transformation** est tout de même exécutée par Vercel (`/_next/image`) — mécanisme prouvé par l'incident 400 ([`next.config.ts`](../next.config.ts:44)) et vérifié par `npm run probe:prod:images` ([`revue-panne-prod-vercel.md`](../plans/revue-panne-prod-vercel.md:152)).

### 3.2 Ce qui passe encore par Vercel

| Poste | Mesure | Source |
| --- | --- | --- |
| HTML prérendu, par route | de 160 607 octets (`/visite-virtuelle`) à 498 430 octets (`/cuc-team-cascadeur`) | [`cuc-metriques-2026.metrics.json`](../reports/cuc-metriques-2026.metrics.json:358) (`routes.pageWeights`) |
| JavaScript par route (gzip) | **563,5 Ko** au maximum (`/fr`, `/en`) ; aucun écart > +5 % | [`revue-poids-routes.md`](../plans/revue-poids-routes.md:24) |
| Assets statiques `public/` | **105 fichiers / 57,93 Mo**, dont **49,49 Mo pour 5 PNG** (`bandes-affiches-film-1..4.png` de 8,28 à 12,39 Mo, `bandeau-images-films.png` 6,65 Mo) | mesure de la mission ; usage : [`EventsPartnersBanners.tsx`](../src/components/sections/events/EventsPartnersBanners.tsx:76) |
| Transformations d'images | **128 usages `<Image`** dans **68 fichiers** ; formats `avif`/`webp`, 9 `deviceSizes`, `minimumCacheTTL` 30 jours | [`next.config.ts`](../next.config.ts:20) ; comptage du dépôt |
| Fonctions serveur | 29 pages Cockpit (`/admin/...`), 1 Route Handler (`POST /api/vitals`), 33 modules `'use server'` | [`cuc-metriques-2026.metrics.json`](../reports/cuc-metriques-2026.metrics.json:353) ; [`route.ts`](../src/app/api/vitals/route.ts:32) |
| Middleware (« proxy » Next 16) | exécuté sur **chaque** vue publique (le matcher exclut `api`, `admin`, `_next`, fichiers statiques) | [`proxy.ts`](../src/proxy.ts:37) |
| Routes générées à la demande | `sitemap.ts`, `robots.ts`, **16 `opengraph-image.tsx`** (7 usages de `ImageResponse`) | [`sitemap.ts`](../src/app/sitemap.ts:1), [`robots.ts`](../src/app/robots.ts:1) ; comptage du dépôt |
| Tâches planifiées | **aucune** | [`durability_health.md`](../.agents/rules/durability_health.md:60) |
| Télémétrie de visite | 1 écriture par page vue, **échantillonnée à 1 visiteur sur 20**, non bloquante | [`durability_health.md`](../.agents/rules/durability_health.md:44) ; [`SiteVisitTracker.tsx`](../src/components/analytics/SiteVisitTracker.tsx:34) |
| Visite virtuelle 360° | iframe chez un tiers (`hdmedia.fr`) : **0 octet** servi par Vercel | [`VirtualTourViewer.tsx`](../src/components/ui/VirtualTourViewer.tsx:32) |
| Plan 3D du campus | `three` (WebGL) côté client → gros chunks JS servis par Vercel (le plus gros chunk du build : 949 043 octets) | [`package.json`](../package.json:164) ; [`cuc-metriques-2026.metrics.json`](../reports/cuc-metriques-2026.metrics.json:457) (`bundle.topChunks`) |

### 3.3 Audits rejoués pendant cette mission

| Commande | Résultat | Code | Écriture de rapport |
| --- | --- | ---: | --- |
| `npm run audit:route-weight` | 72 routes publiques mesurées — « OK — aucun écart > +5 % » (maximum observé : +0,6 %) | 0 | réécrit [`revue-poids-routes.md`](../plans/revue-poids-routes.md:1) |
| `npm run audit:budget` | « 7 engagements vérifiés, 0 écart » — dont : aucun canal Realtime sur le chemin public, aucune requête publique nominale | 0 | réécrit [`revue-budget-performance.md`](../plans/revue-budget-performance.md:1) |
| `npm run audit:quotas` | Base 18,94 / 200 Mo · stockage objet 31,68 / 150 Mo | 0 | réécrit [`revue-quotas-supabase.md`](../plans/revue-quotas-supabase.md:1) |

Le rapport de métriques ([`cuc-metriques-2026.metrics.json`](../reports/cuc-metriques-2026.metrics.json:1), généré le 2026-09-29T16:59 par `npm run report:metrics`) est cité tel quel : il n'a pas été regénéré.

### 3.4 Ce qui n'est pas mesurable depuis le dépôt

Bande passante mensuelle réellement consommée, nombre d'invocations de fonctions, minutes de CPU, nombre de transformations d'images, dépassements éventuels : ces compteurs n'existent que dans le tableau de bord de l'hébergeur (**à vérifier** — projet Vercel → *Usage* / *Observability*). Aucun de ces chiffres n'est estimé ici : si une mesure manque, elle est dite manquante.

---

## 4. Forme juridique et nature de l'activité

### 4.1 Le raisonnement

- Une **association loi 1901** est une personne morale **à but non lucratif**. Cela décrit sa **forme** : qui la détient, où va l'excédent. Cela ne dit **rien** de la commercialité de ce qu'elle fait. Une association peut exercer une activité économique — y compris générer des recettes — sans changer de forme juridique.
- La question à trancher n'est donc pas « association ou pas ? » mais **« l'usage du site est-il commercial ? »**. C'est cette qualification-là qu'un hébergeur est susceptible d'examiner.
- Le dépôt montre une **activité économique** — c'est un fait interne, pas une opinion sur la position de Vercel :

| Fait | Trace |
| --- | --- |
| Formations facturées (ex. « Formule Week-end Immersion (250 € pension complète) ») | [`fr.json`](../messages/fr.json:400) |
| Financements professionnels : AFDAS, France Travail (AIF), OPCO & plans entreprise | [`fr.json`](../messages/fr.json:133) ; [`pages.ts`](../src/lib/data/site/defaults/pages.ts:66) ; [`settings.ts`](../src/lib/data/site/defaults/settings.ts:26) |
| Prestations et devis (événementiel, team building, animation airbag, coordination de cascades) | [`pages.ts`](../src/lib/data/site/defaults/pages.ts:312), [`events.ts`](../src/lib/data/site/defaults/events.ts:21) |
| Traitement commercial réel de demandes (devis signé, acompte encaissé) | [`samples.ts`](../src/lib/data/site/defaults/samples.ts:50) |
| Le site est l'interface publique de cette activité (candidature, devis, contact) | [`page.tsx`](<../src/app/(site)/[locale]/contact-cuc/page.tsx:1>) |

**Aucune source du dépôt ne dit comment Vercel qualifie cet usage.** La lecture ci-dessus ne doit pas être présentée comme la position de Vercel.

### 4.2 Questions à poser à Vercel (et à qui)

| # | Question | Interlocuteur |
| --- | --- | --- |
| 1 | Une association loi 1901 à but non lucratif dont l'activité comprend des formations facturées, des prestations d'événementiel et des financements OPCO/AFDAS peut-elle rester sur l'offre gratuite ? | Support Vercel (ticket écrit, pour obtenir une réponse opposable) |
| 2 | La clause d'usage de l'offre gratuite limite-t-elle l'usage « commercial » ? Si oui, comment qualifiez-vous une personne morale **à but non lucratif** dont les recettes financent l'activité ? | Support Vercel |
| 3 | Existe-t-il un programme, une remise ou un traitement particulier pour les associations / organismes de formation à but non lucratif ? Quels critères, quelles pièces ? (**à vérifier**) | Support puis formulaire commercial |
| 4 | En cas de dépassement d'un quota inclus, le dépassement est-il facturé automatiquement ou le service est-il interrompu ? | Support |
| 5 | Les sièges d'équipe et les rôles sont-ils limités sur l'offre visée ? (le Cockpit a plusieurs niveaux de droits) | Support / documentation des offres |

### 4.3 Pièces à préparer (association)

- Statuts de l'association et récépissé de déclaration en préfecture (ou numéro RNA).
- SIRET / avis de situation SIRENE si l'association en dispose.
- Attestation d'intérêt général, si elle existe (le cas échéant).
- Description des financements : part de cotisations/subventions **contre** part d'activité lucrative (formations, événements, prestations) — c'est le point qui sera demandé pour qualifier l'usage.
- Certification qualité éventuelle (le dépôt référence Qualiopi n° 21452296 : [`settings.ts`](../src/lib/data/site/defaults/settings.ts:24)) — utile pour qualifier l'activité de formation.
- Le volume d'usage observé : chiffres du § 3, complétés par les compteurs du tableau de bord (**à vérifier**).

---

## 5. Contraintes d'une offre gratuite : à vérifier, jamais supposé

Le dépôt ne contient pas le contrat, et aucune valeur n'est affirmée ici de mémoire.

| Point à vérifier | Où le vérifier | Question à poser |
| --- | --- | --- |
| Clause d'usage (commercial / non commercial) | Conditions d'utilisation et page de tarification des offres, côté Vercel (**à vérifier**) puis réponse écrite du support | « Notre usage est-il autorisé ? » (§ 4.2) |
| Bande passante mensuelle incluse, alerte et facturation au-delà | Tableau de bord Vercel → *Usage* ; documentation des limites du plan (**à vérifier**) | Quel quota mensuel, à partir de quand suis-je alerté, et que coûte le dépassement ? |
| Durée maximale d'exécution des fonctions et mémoire allouée | Documentation des limites du plan (**à vérifier**) | Nos routes les plus lentes (1 734 ms mesurés en local pour `/spectacles-cascadeurs-yamakasi`, [`cuc-metriques-2026.metrics.json`](../reports/cuc-metriques-2026.metrics.json:414)) tiennent-elles dans la durée incluse ? |
| Nombre de transformations d'images incluses | Documentation des limites du plan (**à vérifier**) | 128 usages `<Image` : combien de transformations par mois, et que se passe-t-il au-delà ? |
| Fréquence minimale et nombre de tâches planifiées | Documentation des limites du plan (**à vérifier**) | Aucune tâche planifiée n'est utilisée aujourd'hui ([`durability_health.md`](../.agents/rules/durability_health.md:60)) ; le point ne devient contraignant que si la planification de publication est livrée ([`roadmap-site-2026.md`](../plans/roadmap-site-2026.md:103)) |
| Nombre de membres d'équipe / sièges | Page des offres, côté Vercel (**à vérifier**) | Combien de comptes pour le Cockpit (admin/éditeur) sur l'offre visée ? |
| Temps de build inclus et concurrence des déploiements | Documentation des limites du plan (**à vérifier**) | Le build produit 63 routes ([`revue-panne-prod-vercel.md`](../plans/revue-panne-prod-vercel.md:108)) : tient-il dans l'offre visée ? |
| Conservation et export des journaux de fonction | Documentation / tableau de bord (**à vérifier**) | Combien de temps puis-je consulter un incident (leçon de la panne du 2026-09-20) ? |
| Taille maximale du corps d'une requête de fonction | Documentation plateforme (**à vérifier**) | Le dépôt documente un plafond plateforme « ≈ 4,5 Mo » ([`plan-compression-medias-cockpit.md`](../plans/plan-compression-medias-cockpit.md:16)) à confronter au plafond Next.js de 1 Mo ([`plan-compression-medias-cockpit.md`](../plans/plan-compression-medias-cockpit.md:15)) : la valeur est-elle toujours celle-là ? |
| Conséquences d'un pic de trafic ou d'un dépassement (suspension, facturation) | Contrat / support (**à vérifier**) | Que se passe-t-il si un Reel devient viral et que le trafic décuple ? |

---

## 6. Les options de rechange

Préalables valables pour toutes les options :

- Le domaine `www.campus-universcascades.com` sert encore l'ancien WordPress ([`roadmap-site-2026.md`](../plans/roadmap-site-2026.md:89)) : la bascule DNS est un chantier à part entière, à faire vers la cible retenue.
- **Supabase reste non optionnel** ([`durability_health.md`](../.agents/rules/durability_health.md:66)) : il porte les données, les médias, l'authentification et la synchronisation.
- **Contrainte technique commune : l'application exige un runtime serveur.** Un export statique est exclu par construction. La documentation Next.js livrée dans le dépôt liste explicitement comme non prises en charge en export statique : Server Actions, l'optimisation d'images avec le loader par défaut, les Route Handlers dépendant de la requête, `cookies()`, l'ISR et le Draft Mode ([`static-exports.md`](../node_modules/next/dist/docs/01-app/02-guides/static-exports.md:278)). S'y ajoutent ici `cacheComponents: true` ([`next.config.ts`](../next.config.ts:19)), le middleware/proxy ([`proxy.ts`](../src/proxy.ts:21)) et 33 modules `'use server'`.

### Option 1 — Rester sur Vercel en payant l'offre supérieure

- **Vérifiable dans le dépôt :** aucun changement de code. Toute la configuration utile vit dans [`next.config.ts`](../next.config.ts:1) et dans les variables d'environnement de la plateforme (§ 2.2).
- **À valider :** le montant réel pour cette structure (**à vérifier** — devis Vercel). Le dépôt cite ≈ 20 $/mois ([`durability_health.md`](../.agents/rules/durability_health.md:65)) et ≈ 45 $/mois pour Vercel Pro + Supabase Pro ([`cuc-dossier-appel-lucas.html`](../reports/cuc-dossier-appel-lucas.html:2095)) : chiffres **antérieurs et non contractuels**, donc **à vérifier**.
- **Risque :** faible techniquement (zéro portage). Le risque est budgétaire : une dépense récurrente pour une structure associative.

### Option 2 — Un hébergeur gratuit chez un concurrent dont les conditions autorisent l'usage commercial

- **Vérifiable dans le dépôt :** **aucune** configuration d'adaptateur n'existe (racine sans `netlify.toml`, `wrangler.toml`, `Dockerfile` ni `serverless.yml` ; [`package.json`](../package.json:151) ne contient aucune dépendance d'adaptateur). Un portage serait donc un chantier, pas un réglage.
- **À valider, précisément (rien n'est supposé ici) :** prise en charge de **Next.js 16.3.5** ([`package.json`](../package.json:158)) et de l'App Router ; des **Server Actions** (33 modules) ; du **middleware/proxy** ([`proxy.ts`](../src/proxy.ts:21)) ; de **`cacheComponents` / PPR** ([`next.config.ts`](../next.config.ts:19)) et de `use cache` (11 usages) ; d'un service de transformation d'images. Autrement dit : existence d'un **adaptateur maintenu** pour cette version — **à vérifier** auprès de chaque hébergeur candidat (par exemple via OpenNext pour Netlify, OpenNext Cloudflare pour Cloudflare Workers, AWS Amplify, Azure Static Web Apps : chaque cas à confirmer, version par version).
- **Risque :** élevé sur la parité fonctionnelle. Le Cockpit (Realtime, Server Actions, aperçu live) est le cœur outillé du projet : un portage partiel le casserait, et le coût d'exploitation de deux cibles serait supérieur à celui d'une seule.

### Option 3 — Un serveur privé virtuel (VPS) à bas coût

- **Vérifiable dans le dépôt :** l'application se construit (`npm run build`) et se démarre (`npm run start`) — scripts [`package.json`](../package.json:7) ; `sharp` est déjà une dépendance ([`package.json`](../package.json:162)), ce qui rend l'optimisation d'images possible sur la machine.
- **À valider :** dimensionnement (RAM/CPU) pour un build de 63 routes et pour un pic de trafic ; coût mensuel réel (**à vérifier** — offre d'hébergeur).
- **Ce que cela ajoute, et que le projet n'a pas aujourd'hui :** certificats TLS et leur renouvellement, reverse proxy, procédure de déploiement, sauvegardes, supervision et alertes, mises à jour du système et de Node, purge du cache de rendu sur disque, rotation des journaux, et un runbook de restauration — aucun document de déploiement n'existe dans le dépôt.
- **Risque :** réel et non technique au premier chef. Les deux incidents du projet (panne du 2026-09-20, quota du 2026-09-23) ont été diagnostiqués **sans** administration système ; un serveur nu transfère ce travail à l'équipe. À retenir seulement si ce temps est assumé.

### Option 4 — Réduire la consommation pour tenir dans une offre gratuite

Détaillée au § 7. Elle répond au volet technique de la question sans changer d'hébergeur, mais elle ne lève **pas** la réserve de la clause d'usage : elle réduit une facture potentielle, pas une qualification.

---

## 7. Mesures de réduction de consommation (ordonnées par impact)

| # | Mesure | Effet attendu | Script de mesure |
| --- | --- | --- | --- |
| 1 | Sortir les 5 PNG de `public/images/events/` (**49,49 Mo**) du statique Vercel : recompression puis hébergement sur Supabase avec URL, comme les autres médias | Supprime 49,49 Mo d'assets servis par Vercel — soit 85 % du poids de `public/` — et 5 transformations lourdes | `npm run report:metrics` (`bundle.publicAssets`) et `npm run audit:route-weight` (vérifier l'absence de régression JS) |
| 2 | Recompresser ces mêmes PNG (8,28 à 12,39 Mo pièce) en AVIF/WebP | Réduction forte attendue sur ces 5 fichiers, donc sur la bande passante et le coût de transformation (ratio exact **à vérifier** par la mesure, non estimé ici) | `npm run report:metrics` + mesure de la taille des fichiers |
| 3 | Ne plus faire passer par `/_next/image` les médias Supabase **déjà allégés** (les servir directement, avec `sizes`) | Supprime des transformations et de l'egress côté Vercel ; les octets restent chez Supabase | `npm run probe:prod:images` (non-régression) puis compteurs du tableau de bord (**à vérifier**) |
| 4 | Alléger le JavaScript des routes les plus lourdes (`/fr` et `/en` à 563,5 Ko gzip ; plus gros chunk du build 949 Ko, côté Cockpit) | Baisse de la bande passante JS à chaque première visite | `npm run audit:route-weight` (baseline committée, échec au-delà de +5 %) |
| 5 | Éviter de recalculer les 16 images OpenGraph à chaque requête (pré-génération ou cache durable) | Supprime des exécutions de fonction par partage social | `npm run probe:prod` (routes saines) puis compteurs du tableau de bord (**à vérifier**) |
| 6 | Abaisser l'échantillonnage de la télémétrie (aujourd'hui 1 visiteur sur 20, [`durability_health.md`](../.agents/rules/durability_health.md:44)) | Moins d'appels à `POST /api/vitals` | `npm run audit:vitals` |
| 7 | Garder le matcher du proxy/middleware minimal ([`proxy.ts`](../src/proxy.ts:37)) : ne pas l'étendre aux assets ni à l'API | Moins d'invocations de middleware par visite | Compteurs du tableau de bord (**à vérifier**) |

Réserve de mesure : les scripts internes mesurent les poids de JavaScript par route et les assets `public/` ; ils **ne mesurent pas** la bande passante réelle, qui n'existe que dans le tableau de bord de l'hébergeur (**à vérifier**).

---

## 8. Ce que je n'ai pas pu vérifier

Tout ce qui suit dépend de sources **externes** (Vercel, autres hébergeurs, qualification juridique) et doit être confirmé à la source. Je n'ai ni accès au web ni au tableau de bord.

1. L'existence, le libellé et la portée d'une clause d'usage (commercial / non commercial) dans l'offre gratuite (**à vérifier**).
2. L'existence d'un programme, d'une remise ou d'un traitement particulier pour les associations et organismes de formation (**à vérifier**).
3. **Tous les quotas chiffrés** de l'offre gratuite : bande passante mensuelle, durée et mémoire des fonctions, nombre de transformations d'images, fréquence et nombre des tâches planifiées, sièges d'équipe, temps de build, conservation des journaux (**à vérifier** — tableau de bord et documentation des limites).
4. Les prix actuels des offres payantes (hébergeur actuel, concurrents, VPS). Les repères internes cités (≈ 20 $/mois, ≈ 45 $/mois) sont antérieurs et non contractuels (**à vérifier**).
5. La consommation réelle du projet côté hébergement : bande passante, invocations de fonctions, minutes de CPU, transformations payantes (**à vérifier**).
6. La prise en charge de Next.js 16, des Server Actions, du middleware et de `cacheComponents`/PPR par chaque hébergeur candidat, ainsi que l'existence d'un adaptateur maintenu (**à vérifier**).
7. Toute appréciation juridique de l'activité (commerciale ou non) portée par un tiers : elle appartient à Vercel, et le cas échéant à un conseil (**à vérifier**).

---

## Note d'exécution (traces de la mission)

- **Seul fichier produit :** `plans/revue-hebergement-vercel.md`. Aucun fichier de `src/`, `scripts/`, `reports/` ni aucun autre document de `plans/` n'a été modifié à la main.
- Trois commandes d'audit ont été exécutées ; **elles réécrivent leur propre rapport**, comportement documenté de ces scripts : `plans/revue-poids-routes.md`, `plans/revue-budget-performance.md`, `plans/revue-quotas-supabase.md` (horodatage + valeurs de mesure).
- L'arbre de travail de git était **déjà modifié** avant cette mission (chantier média/compression en cours) : ces changements ne sont pas imputables à cette revue.
- `npm run audit` : les contrôles documentaires passent (routes invalides : 0 · ancres non résolues : 0 · hrefs suspects : 0 — **aucun lien mort introduit**). Le script sort néanmoins en **code 1** pour une dette **antérieure et hors sujet** : `src/app/(admin)/admin/actions/instagram-featured.ts` (314 lignes, au-dessus du plafond de 300), contenu **committé** (commit `b27f39b` du 2026-09-29) et **non modifié** dans l'arbre de travail. Aucune correction n'a été appliquée : elle sortirait du périmètre de cette revue.

**Prochaine action recommandée :** poser la question écrite au support Vercel (usage autorisé pour une association loi 1901 qui facture des formations) et, en parallèle, sortir les 5 PNG de `public/images/events/` (49,49 Mo) du statique Vercel — c'est la réduction à effet immédiat et mesurable.
