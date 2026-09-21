# Revue — Badges de hero : doublons et gadgets (code)

**Mode :** APPLIQUÉ (--apply)
**Généré le :** 2026-09-21T22:33:28.472Z

## Règle appliquée

Un badge = **une** information. Quand badge et méta disent la même chose, on conserve le badge (identité, au-dessus du titre) et la méta garde le détail qu’il ne porte plus. Un badge qui répète le titre est remplacé par un fait (durée, public, volume horaire).

## Éditions

### `src/lib/data/site-service.ts` — ⏭ motif introuvable (déjà appliqué ?)

- Avant : `(n/a)`
- Après : `undefined`
- Motif : Langue dupliquée avec heroMeta — la langue reste une seule fois, dans la méta.

### `src/lib/data/site-service.ts` — ⏭ motif introuvable (déjà appliqué ?)

- Avant : `(n/a)`
- Après : `undefined`
- Motif : Chaînes TV dupliquées avec heroMeta.

### `src/lib/data/site-service.ts` — ⏭ motif introuvable (déjà appliqué ?)

- Avant : `(n/a)`
- Après : `undefined`
- Motif : Catégories déjà listées par heroMeta (dont institutions).

### `src/lib/data/site-service.ts` — ⏭ motif introuvable (déjà appliqué ?)

- Avant : `(n/a)`
- Après : `undefined`
- Motif : « Shows clé en main » déjà présent dans heroMeta.

### `src/lib/data/site-service.ts` — ⏭ motif introuvable (déjà appliqué ?)

- Avant : `(n/a)`
- Après : `undefined`
- Motif : « Cohésion d’équipe » déjà présent dans heroMeta.

### `src/lib/data/site-service.ts` — ⏭ motif introuvable (déjà appliqué ?)

- Avant : `(n/a)`
- Après : `undefined`
- Motif : Le titre contient déjà « Formation professionnelle » ; le badge porte les faits (durée, volume horaire).

### `src/lib/data/site-service.ts` — ⏭ motif introuvable (déjà appliqué ?)

- Avant : `(n/a)`
- Après : `undefined`
- Motif : Le titre (« CONTACT & PROJETS ») contient déjà « Contact ».

### `src/lib/data/site-service.ts` — ⏭ motif introuvable (déjà appliqué ?)

- Avant : `(n/a)`
- Après : `undefined`
- Motif : Le titre (« STAGES DE CASCADE & PARKOUR ») contient déjà « Stages ».

### `messages/fr.json` — ⏭ motif introuvable (déjà appliqué ?)

- Avant : `(n/a)`
- Après : `undefined`
- Motif : La langue n’apparaît plus qu’ici (le badge a été nettoyé).

### `messages/fr.json` — ⏭ motif introuvable (déjà appliqué ?)

- Avant : `(n/a)`
- Après : `undefined`
- Motif : Chiffre non prouvable retiré ; « encadrées » redondait avec le badge « ENCADREMENT PROFESSIONNEL ».

### `messages/fr.json` — ✔

- Avant : `"heroMeta": "2 SEMAINES RÉSIDENTIELLES • EN ANGLAIS & FRANÇAIS"`
- Après : `"heroMeta": "EN ANGLAIS & FRANÇAIS"`
- Motif : « 2 semaines » est déjà dans le sous-titre ; la méta ne garde que la langue.

### `messages/en.json` — ✔

- Avant : `"heroMeta": "2 RESIDENTIAL WEEKS • IN ENGLISH & FRENCH"`
- Après : `"heroMeta": "IN ENGLISH & FRENCH"`
- Motif : Idem FR : la durée reste au sous-titre.

### `messages/fr.json` — ✔

- Avant : `"heroMeta": "GRAND PUBLIC • DEPUIS 2009"`
- Après : `"heroMeta": "DEPUIS 2009"`
- Motif : « Grand public » est déjà dans le sous-titre ; la méta ne garde que l’ancienneté.

### `messages/en.json` — ✔

- Avant : `"heroMeta": "OPEN TO THE PUBLIC • SINCE 2009"`
- Après : `"heroMeta": "SINCE 2009"`
- Motif : Idem FR.

### `messages/en.json` — ⏭ motif introuvable (déjà appliqué ?)

- Avant : `(n/a)`
- Après : `undefined`
- Motif : Idem FR : langue seule (état hérité).

### `messages/en.json` — ⏭ motif introuvable (déjà appliqué ?)

- Avant : `(n/a)`
- Après : `undefined`
- Motif : Chiffre non prouvable retiré ; encadrement déjà porté par le badge.

**Total : 4/16 édition(s).**

La base de données (`site_pages.hero.badge`) est alignée par
[`apply_hero_badge_cleanup_migration.mjs`](scripts/apply_hero_badge_cleanup_migration.mjs:1).
