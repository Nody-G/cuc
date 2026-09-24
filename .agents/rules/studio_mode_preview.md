# RÈGLE PERMANENTE : MODE STUDIO — ÉDITION VISUELLE EN PLACE (APERÇU LIVE)

**Le brouillon voyage en mémoire ; la base ne voit qu'un enregistrement.**

> Source canonique du sujet — ne pas recopier ce contenu dans `AGENTS.md`.

## 1. Le pont Cockpit ↔ vitrine

- Protocole versionné `src/lib/preview/preview-protocol.ts` (v2,
  origine vérifiée des deux côtés, tolérance des bundles hérités encore en cache CDN).
- La page publique embarque `PreviewBridgeClient` (brouillon, survol, sélection) et
  `PreviewEditLayer` (saisie en place) — **strictement inertes hors iframe**, couvert par tests.
- **Aucune écriture en base depuis l'aperçu** : seul le bouton « Enregistrer » persiste,
  via les server actions existantes.

## 2. Marquer un champ éditable

- `data-cuc-field="<chemin>"` + `data-cuc-kind="text|textarea|image|link|list-item"`.
- Helpers : `cucField('hero.title')`, `itemPath('formules', index, 'title')`
  (`src/lib/preview/cuc-field.ts`). Un chemin indisponible ne pose
  **aucun attribut** (zéro champ fantôme).
- **Chrome** : `data-cuc-setting="<clé>"` (réglage `site_settings.general`) et
  `data-cuc-micro="<clé du catalogue>"` (libellé `t('…')`). Le commit porte sa
  source ; le Cockpit écrit une clé à la fois (`updateSiteSettingField`,
  `updateMicrocopyOverrideField`) et une valeur vidée **retire** la surcharge
  (retour au réglage servi ou au catalogue) — jamais un texte blanc. Les
  brouillons voyagent par `settings-draft` / `microcopy-draft` ; la surcharge de
  catalogue est fusionnée par la **même** fonction que le serveur
  (`applyMicrocopyOverlay`, via `PreviewIntlProvider`).
- **Entités** : `data-cuc-entity="<table>:<id>:<champ>"` (référence canonique
  `entity-ref.ts`, pilote : bannière d'annonce). Le brouillon voyage par
  `entity-draft` ; l'écriture est une **liste blanche** serveur
  (`actions/entities.ts`, valeur vide refusée) — jamais une table ou un champ
  libre.
- **Garde-fous chrome** : le serveur refuse toute clé de catalogue inconnue
  (`isMicrocopyKey` — pas de texte orphelin) ; les micro-textes du brouillon sont
  **segmentés par locale** (jamais rejoués dans l'autre langue) ; le brouillon
  chrome a son filet local par locale (`chrome-draft-storage.ts`), effacé dès que
  les deux brouillons sont vides (donc après publication).
- **Un texte, une source** : quand la valeur affichée change de source selon la
  langue (CTA mobile : réglage FR / catalogue EN), l'annotation suit la source
  réelle (`cucSetting` / `cucMicro` selon `locale`) — un nœud n'est jamais annoté
  pour une source qu'il n'affiche pas.
- **Atteignabilité du clic** : annoncer un champ ne suffit pas, il doit **recevoir**
  le geste. Un conteneur décoratif (`pointer-events-none`) ou un frère plein cadre
  (`absolute inset-0` avec z-index supérieur — lien de carte, plan focal du hero)
  qui porte malgré tout des champs éditables se déclare `cucReach()` /
  `data-cuc-reach` **sur le conteneur** : pendant la seule session de Studio,
  l'aperçu le remonte et rend le geste à ses seuls champs annotés ; hors Mode
  Studio, la vitrine publique garde exactement son comportement (la parallaxe et
  la navigation publiques sont intactes). Un contrôle interactif ne porte **qu'un**
  champ éditable : deux annotations sous le même lien rendent le clic ambigu, donc
  la cible de navigation (`*_url`, `*_link` — déjà hors promesse d'édition en
  place) se règle au formulaire du Cockpit, pas dans la page.
- **Mesure, jamais supposition** : la vitrine **mesure** l'atteignabilité dans la
  page réelle (`src/lib/preview/field-reachability.ts` : `pointer-events` calculé
  + `elementFromPoint` au centre de chaque champ) et publie le résultat au Cockpit
  (`fields-audit`), qui l'affiche dans la barre de l'aperçu (« N champ(s) non
  cliquable(s) », avec le détail par champ). Un champ hors fenêtre n'est pas jugé :
  il est compté à part, jamais déclaré fautif.
- **Formulaire et aperçu, même couverture** : tout texte annoté côté vitrine existe
  aussi sous forme de contrôle porteur de `data-cuc-field` dans l'éditeur du
  Cockpit — sinon le mode inspection (`focus-field.ts`) n'a rien à focaliser et le
  texte reste hors de portée hors Mode Studio.
- Listes : `data-cuc-index="<i>"` sur l'item, chemin du **tableau** dans `data-cuc-field`.
- Rendu **data-first** obligatoire : `{donnée || t('clé')}` — le repli traduit reste en place.

## 2bis. Standards de la saisie en place (tenus par le code, vérifiés par tests)

- **Typographie miroir** : la saisie reprend le style **calculé** de l'élément édité
  (`src/lib/preview/inline-style.ts`) — mêmes police, corps, graisse,
  ligne, casse, alignement, couleur. Un titre s'édite en taille de titre, jamais en champ de
  12 px posé sur la page.
- **Clavier complet** : `Entrée` valide (ou `Ctrl/Cmd+Entrée` en multi-lignes), `Échap`
  annule, **`Tab` / `Maj+Tab` enchaînent les champs éditables** dans l'ordre du document
  (`src/lib/preview/field-navigation.ts`). La valeur en cours est
  validée **avant** le passage, et le flou déclenché par ce passage ne revalide ni ne ferme
  la nouvelle sélection.
- **Étiquette du champ** : la saisie porte `bloc.clé` + la nature (`text`, `textarea`, `link`) —
  on sait toujours ce qu'on modifie.
- **Repli visible** : le texte réellement rendu sert de `placeholder`, et un champ vidé
  l'annonce (« vide → repli traduit affiché »). Vider n'écrit jamais un libellé blanc.
- **Deux modes lisibles** : en inspection le survol est en pointillés (on *désigne* le champ à
  ouvrir dans le formulaire) ; en édition le survol est discret avec curseur de saisie (on
  *écrit*), avec un curseur dédié pour les images et les items de liste.
- **Édition par défaut** : l'onglet Aperçu ouvre en mode `edit` — un clic sur un texte annoté
  ouvre la saisie ; l'inspection reste accessible dans la barre. Un contrôle (bouton, lien) dont
  **un seul** champ est annoté est éditable sur toute sa surface (icônes SVG et rembourrage
  compris) ; plusieurs champs = comportement public conservé (`src/lib/preview/field-hit.ts`).
- **Réversibilité** : `Ctrl+Z` / `Ctrl+Maj+Z` dans le Cockpit, inspecteur de modifications
  (`src/lib/preview/draft-diff.ts`) avec retour par champ ou global — rien
  n'est écrit en base avant « Enregistrer ».

## 3. Invariants non négociables

- Aucune valeur vide persistée ; aucun item inventé (liste vide → pas d'ajout) ;
  aucune liste rendue complètement vidée ; aucune structure inventée.
- Saisie en place : `input`/`textarea` superposés — **jamais** `contentEditable` sur un
  nœud rendu par React (la réconciliation écraserait le DOM).
- **Une seule source par texte** : un correctif d'édition en place écrit dans le **même**
  chemin que le formulaire du Cockpit (ex. stages : `sections_data.stages_catalogue.items.*`,
  jamais un bloc d'overrides parallèle) ; `audit:fields` exige que chaque champ promis par un
  éditeur (`liveEdit`, formulaires, items) soit annoté côté vitrine.
- Écriture du brouillon par chemin immuable :
  `src/lib/preview/field-path.ts`.
- Commandes de liste : moteur pur `src/lib/preview/list-command.ts`.

## 4. Performance et publication

- Realtime : **réservé au Cockpit**. `subscribeTable` (`src/lib/supabase/realtime.ts`)
  n'ouvre un canal que sur une route `/admin/...` (`isCockpitRoute`), et un **seul**
  WebSocket partagé par client y suffit à toutes les tables. Sur la vitrine publique,
  aucun canal : un visiteur n'a pas besoin d'une page qui se met à jour toute seule, et le
  nombre de connexions simultanées est la seule charge qui croît avec le nombre d'onglets
  ouverts. Sa fraîcheur vient de la navigation (cache serveur invalidé par tag) et, sur
  place, de la **reprise d'onglet** (`focus` / `visibilitychange`, `useRealtimeRefresh`,
  une fois par demi-minute au plus). Un sondage périodique reste possible, mais **opt-in**
  et justifié par l'urgence — seul le bandeau d'annonce le demande (5 minutes, onglet
  visible).
- Aperçu : `?cuc-preview=1` coupe le Realtime et met les effets lourds en veille
  (`src/lib/preview/preview-context.ts`). La vitrine publique n'est
  **jamais** chargée avec ce paramètre.
- Publication : `revalidateSite` (`src/app/(admin)/admin/actions.ts`) revalide les chemins
  FR **et** `/en/...`, **et** les tags (`site_pages`, `site_translations`, `site_navigation`,
  `site_footer`, `site_social_links`).
- **Filet local du poste de travail** : le brouillon est recopié dans `localStorage`
  (`src/lib/preview/draft-storage.ts`, TTL 7 jours, versionné, effacé
  à l'enregistrement) et proposé à la récupération après un rechargement ; un `beforeunload`
  avertit tant qu'il reste des modifications. La base ne voit **toujours** rien.
- **Concurrence** : `upsertPageContent` refuse une écriture si la page a été modifiée depuis
  son ouverture (tolérance 2 s sur `updated_at`) — deux administrateurs ou deux onglets ne
  s'écrasent jamais en silence, et le brouillon local est conservé pour rejouer la saisie.

## 5. Vérification obligatoire après toute modification

- `npm run audit:fields` — couverture des champs page par page (code 2 si une page
  n'expose aucun champ). Rapport : `plans/revue-couverture-champs-visuels.md`.
- Atteignabilité : ouvrir l'aperçu de la page et lire la barre d'état — la sonde
  affiche le nombre de champs mesurés cliquables, ou la liste des champs annoncés
  mais hors de portée (calque décoratif ou recouvrement). Toute page qui affiche
  « non cliquable(s) » se corrige par `cucReach()` ou par une seule annotation par
  contrôle — jamais par un contournement CSS global.
- `npm run audit:microcopy` — micro-textes visiteurs classés (annotés / données / traductions /
  codés en dur). Rapport : `plans/revue-micro-textes-visiteurs.md`.
- `npm run audit:budget` — budget performance (canal partagé, zéro requête publique nominale,
  FR + EN, aperçu allégé). Rapport : `plans/revue-budget-performance.md`.
- `npm run studio:gate` / `npm run studio:gate:full` — **gate unique** enchaînant les trois
  audits puis le typecheck et les tests ; un seul verdict, aucune vérification oubliée.
- `npm run test` (protocole, chemins, listes, inertie) + `npm run typecheck` + `npm run build`.
