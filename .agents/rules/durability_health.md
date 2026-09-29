# RÈGLE PERMANENTE : DURABILITÉ — CE QUI GARDE LE SITE SAIN

**Ce qui n'est pas mesuré dérive.**

> Source canonique du sujet — ne pas recopier ce contenu dans `AGENTS.md`.

1. **Feuille de route vivante** : `plans/roadmap-site-2026.md` classe les évolutions par
   impact × effort (publication 404, RLS `site_pages`, accessibilité automatisée, budgets JS,
   JSON-LD, couverture EN). Un sujet ne se discute pas sans ce document.
2. **La CI est la définition de « terminé »** : `.github/workflows/ci.yml` enchaîne
   lint, typecheck, tests, **gate Mode Studio** (champs, budget, micro-textes), **audit strict**
   (routes, ancres, plafond SRP 300 lignes) et build. Un
   commit qui casse l'un de ces contrôles n'est pas livrable — la dette restante est publiée
   dans `plans/`, jamais silencieuse.
3. **RLS `site_pages` — appliquée le 2026-09-23, séquence à ne pas rouvrir** : la policy
   publique (`FOR SELECT USING (true)`) est remplacée par `USING (is_published = true)` —
   jamais l'appliquer sans les deux lectures service role (porte 404 `getPublicPageContent` +
   `getPagePublicationState`, aperçu `getPreviewPageContent`). Vérification reproductible
   **sans dépendre de l'API** : sonde Postgres qui endosse le rôle `anon` avec une ligne
   brouillon témoin dans une transaction annulée (`npm run db:migrate:site-pages-rls[:write]`).
   **Incident quota (2026-09-23)** : dépassement du quota de stockage de l'organisation →
   API Data coupée (402) pendant quelques heures, résolu par mise à jour du plan Supabase.
   Depuis, la surveillance est **mesurée et plafonnée** : `npm run audit:quotas` compare la
   base, le **stockage objet par bucket** et les tables qui grossissent seules à des budgets
   déclarés (base 200 Mo, stockage 150 Mo, plus grosse table 50 Mo, 20 000 lignes par table
   de croissance) et **échoue** au-delà ; le rapport est `plans/revue-quotas-supabase.md`, et
   le contrôle est intégré au gate Studio (annoncé « IGNORÉ » sans chaîne de connexion).
   Mesure du 2026-09-24 : base 17,4 Mo, stockage 90,95 Mo — confortable, mais c'est
   désormais un chiffre vérifié à chaque gate, pas une impression. Le stockage média avait
   été allégé le 2026-09-23 de 218 Mo à 90 Mo par purge des 3 vidéos de reportages (127 Mo
   libérés, conservées localement dans `.staging/media/video/`).
4. **Une seule source de vérité par sujet** : métadonnées → `buildRouteMetadata()`
   (`src/lib/i18n/route-metadata.ts`), fusion bilingue → `src/lib/i18n/localized-merge.ts`,
   libellés → `src/lib/i18n/microcopy.ts`, champs éditables → `src/lib/preview/cuc-field.ts`.
   Toute duplication locale est un bug futur.
5. **Gouvernance documentaire** : `AGENTS.md` porte la loi (SRP, plafond 300 lignes par
   module ; `AGENTS.md` lui-même < 150 lignes) et
   l'index ; le détail de chaque sujet vit dans **un seul** fichier de `.agents/rules/`. Une
   règle se met à jour dans son fichier canonique — jamais en double. Un guide opérationnel
   lourd devient un skill `.agents/skills/`.
6. **Charge : ce qui croît avec le trafic, et rien d'autre** : le nombre de tables n'est pas
   la question — la vitrine ne demande **aucune** lecture par visiteur (HTML prérendu,
   lectures `use cache` + tags) et n'ouvre **aucun** canal Realtime (voir
   `studio_mode_preview.md` § 4). Sa **seule écriture** est la télémétrie de performance
   vécue : échantillonnée à **un visiteur sur vingt** (décision prise une fois par session),
   **une écriture par page vue** à la sortie de page, jamais bloquante, table `site_vitals`
   sous RLS **sans aucune policy** (service role uniquement) et plafonnée à 180 jours par
   `npm run audit:vitals` / `npm run cms:purge:vitals`. Restent trois postes à surveiller :
   les **connexions Realtime** du Cockpit et l'aperçu (`npm run audit:budget`), le
   **stockage et l'egress médias** (`npm run media:audit`, leçon de l'incident quota du
   2026-09-23), et la **croissance de l'historique des pages** — mesurée et plafonnée par
   `npm run audit:revisions` (simulation) et `npm run cms:purge:revisions`
   (application : 20 révisions par page, jalons étiquetés préservés). Un seul écrivain
   dépose les instantanés : `recordPageRevision`, appelé par `upsertPageContent` — le
   trigger SQL annoncé dans `scripts/schema_page_revisions.sql` n'a jamais été posé en
   base, et la fabrique client historique ne pouvait rien insérer (policy d'écriture
   administrateur). Mesure du 2026-09-24 : `site_page_revisions` était **vide** ; le
   panneau « Historique des versions » promettait donc des versions inexistantes.
7. **Hébergement : ce que le projet exige vraiment** (relevé le 2026-09-24) — le site ne
   dépend d'**aucune** fonctionnalité payante de Vercel : pas de tâche planifiée (`vercel.json`
   absent, aucun `crons`), aucune fonction longue (`maxDuration`, runtime edge), pages
   prérendues avec `use cache`, images optimisées à la volée, en-têtes et redirections
   déclarés dans `next.config.ts`. L'offre gratuite suffit donc **techniquement** ; son
   règlement la réserve en revanche à un usage non commercial — réserve à confirmer auprès
   de Vercel pour une structure qui facture des formations (l'offre Pro représente alors
   ≈ 20 $/mois). Supabase reste **non optionnel** : cf. §3, la marge de stockage et les
   sauvegardes quotidiennes du plan payant sont la réponse à l'incident du 2026-09-23.
   Ces chiffres vivent dans le dossier client, recalculés à chaque génération
   (`npm run report:dossier`, section « Sous le capot ») : aucune valeur d'hébergement
   n'est écrite à la main dans un document.
8. **Aucune écriture avalée, aucun tableau de bord inventé** (leçon du 2026-09-24) :
   `supabase-js` **ne lève pas** d'exception, il renvoie `{ error }` — tout `try/catch`
   seul laisse donc passer une écriture refusée. Deux conséquences tirées :
   (a) une demande de candidature ne peut plus être annoncée « envoyée » sans stockage
   réel (`submitInquiry` lit `insertError` **et** l'erreur du miroir `site_settings`,
   journalise `inquiry.create(.failed)` dans `site_audit_logs`) ; (b) un écran d'analyse
   doit déclarer l'origine de ses chiffres — `SiteTrafficReport.dataSource = 'modelled'`
   affiche un bandeau « modèle de démonstration », et le flux « en direct » ne contient
   que des sessions réellement observées (les douze faux visiteurs de
   `traffic-data.generateLiveVisitors` ont été supprimés, la localisation non collectée
   est affichée comme telle). Même règle que pour Instagram : **un chiffre sans source
   mesurée s'affiche comme un repère, ou ne s'affiche pas.**
9. **Migrations de base : l'agent les applique lui-même, à une condition explicite** (consigne client du
   2026-09-29 : « fais-le automatiquement, ma base de données est très précieuse »). Le protocole est
   celui des scripts `db:migrate:*` : **essai à blanc d'abord** (aucune écriture), puis `:write`. Une
   migration est réputée **non destructive** si elle se limite à `ADD COLUMN IF NOT EXISTS`,
   `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `COMMENT` ou l'ajout d'une policy. Elle
   ne l'est **pas** dès qu'elle comporte `DROP`, `ALTER COLUMN … TYPE`, `DELETE`, `UPDATE` de masse, ou
   une contrainte ajoutée à des données existantes : dans ce cas, l'accord du client précède
   l'application. L'applier relève le **nombre de lignes avant/après** et échoue si le compte change —
   c'est la preuve d'innocuité, pas une formalité (`apply_applicant_history_migration.mjs` en est le
   modèle).
10. **Le journal d'activité — ce qui n'est pas écrit n'a pas eu lieu** (2026-09-29) : le Cockpit expose un
    hub « Journal & Activité » (`/admin/journal`, `src/app/(admin)/admin/components/LogsView.tsx`) à trois
    onglets — **métier** (le journal d'audit historique, `site_audit_logs`, rendu par la vue d'audit
    existante), **système** (`site_activity_logs` : erreurs classées, dégradations, jobs, e-mails refusés)
    et **rétention**. Une seule porte d'écriture, `src/lib/logging/write.ts` : elle **lit le champ `error`**
    (un `try/catch` seul laisserait passer une table absente, cf. § 8), ne lève jamais — un incident
    d'observabilité ne devient pas un incident fonctionnel — et applique `redact.ts` (jetons, clés et
    adresses masquées) puis `throttle.ts` (regroupement anti-inondation, le compte réel étant reporté dans
    `repeat_count`). Depuis un navigateur, deux portes distinctes : `reportClientError` (frontière
    d'erreur, `critical`, sans trace d'appel) et `reportClientIncident` (liste **fermée** de domaines et
    catégories, gravité imposée à `warning` — un navigateur n'est pas une autorité sur la gravité). La
    classification des erreurs vit dans `classify.ts` et s'appuie sur les **codes** PostgREST, jamais sur
    les messages traduits. Lecture réservée aux rôles `admin` et `directeur` (policy SQL) ; **aucune policy
    `DELETE`** : le journal est en ajout seul, la rétention passe par la clé de service
    (`npm run audit:logs` mesure, `npm run cms:purge:logs` applique — 90 j pour l'information, 180 j pour
    les signaux, 365 j pour un incident critique, plafond 20 000 lignes). En base, la colonne s'appelle
    `target` alors que le domaine l'appelle `entity` : la traduction est faite une seule fois, en lecture,
    par `src/lib/data/site/audit-mapper.ts` (sans quoi le filtre « Entité » restait vide à jamais). Règle
    courte : **une erreur non journalisée est une erreur invisible ; un journal qui fuit est pire qu'un
    journal absent.**
