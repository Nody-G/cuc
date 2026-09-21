# Revue — Incidents au démarrage (septembre 2026)

Deux incidents distincts ont été signalés « au démarrage » du site. Ils n'ont ni
la même cause ni le même impact : le premier était un **avertissement de
librairie**, le second une **régression visuelle bloquante** introduite par la
refonte i18n. Les deux sont corrigés, vérifiés et poussés.

---

## Incident 1 — `Multiple GoTrueClient instances detected` (avertissement)

### Symptôme

Console navigateur, à chaque chargement :

```
GoTrueClient@sb-xkbkcsypftvspmkfnrfm-auth-token:1 (2.116.0)
Multiple GoTrueClient instances detected in the same browser context.
```

### Cause racine

`GoTrueClient` tient un registre **statique** indexé par `storageKey`
([`GoTrueClient.js`](../node_modules/@supabase/auth-js/dist/module/GoTrueClient.js:164)) :

```js
this.instanceID = GoTrueClient.nextInstanceID[this.storageKey] ?? 0;
GoTrueClient.nextInstanceID[this.storageKey] = this.instanceID + 1;
if (this.instanceID > 0 && isBrowser()) console.warn('Multiple GoTrueClient instances…')
```

Deux clients coexistaient **côté navigateur** avec la `storageKey` par défaut
(`sb-<ref>-auth-token`) :

| Client | Origine | Rôle |
| --- | --- | --- |
| [`createClient()`](../src/lib/supabase/client.ts:60) | `@supabase/ssr` | session, cookies, Realtime |
| [`createPublicClient()`](../src/lib/supabase/public.ts:74) | `@supabase/supabase-js` | lectures anonymes de `site-service.ts` |

Le second est tiré dans le bundle client parce que `site-service.ts` est importé
par des composants `'use client'`. Le tag `:1` du log désigne le second créé.

Le déclencheur est reproductible **dans un seul composant** :
[`CucFilmsShowcase.tsx`](../src/components/sections/films/CucFilmsShowcase.tsx:48)
appelle `getFilms()` (→ `createPublicClient()`) **et** `createClient()` (ligne 50)
dans le même effet.

### Correctif

1. [`public.ts`](../src/lib/supabase/public.ts:57) — `storageKey` dédiée
   `cuc-site-public-anon`. Le lecteur anonyme n'appartient plus à l'espace de
   stockage d'authentification ; il reste `persistSession: false`,
   `autoRefreshToken: false`, `detectSessionInUrl: false` (aucune écriture
   `localStorage`, aucun `BroadcastChannel`).
2. [`client.ts`](../src/lib/supabase/client.ts:44) — singleton porté par
   `globalThis` (`__cuc_supabase_browser_client__`) au lieu d'une variable de
   module : les **deux layouts racines** (`(site)/[locale]` et `(admin)`)
   permettent à Turbopack de dupliquer un module dans plusieurs bundles, ce qui
   aurait recréé un second client. La mémoïsation reste **limitée au navigateur**
   (côté serveur, un client neuf par appel : pas de partage d'état entre requêtes).

### Vérification

`npm run typecheck` ✅ · `npm run lint` (0 erreur) ✅ · `npm test` (123 tests) ✅.
Contrôle exhaustif : seuls `server.ts` et `admin.ts` instancient d'autres clients
Supabase, tous deux serveur uniquement.

### Incident connexe détecté et réparé

La clé anon de repli de `client.ts` avait été retranscrite avec un caractère
erroné (`exp` corrompu). Détecté par comparaison **octet par octet** avec `HEAD`
(décodage du payload JWT : `exp` attendu `2098677318`), puis restauré
**par programme** — plus aucune saisie manuelle d'un secret. Le diff ne contient
aucune modification de cette ligne.

---

## Incident 2 — Site non stylé : logos géants puis page blanche (BLOQUANT)

### Symptôme

- un logo (Instagram) s'affiche **en très grand** ;
- puis **écran blanc** ;
- après actualisation, un logo (Qualiopi) apparaît **de mauvaise qualité**
  (rendu à une taille non contrainte).

### Cause racine

**`globals.css` n'était importé par AUCUN fichier de `src/`.**

Lors du passage à `src/app/(site)/[locale]/layout.tsx` + `src/app/(admin)/layout.tsx`,
l'ancien `src/app/layout.tsx` a été supprimé. Or sa ligne 3 portait :

```ts
import "./globals.css";
```

Son remplaçant [`RootShell.tsx`](../src/components/layout/RootShell.tsx:1) n'avait
pas repris cet import. Conséquences :

- **Tailwind n'était plus servi** → plus aucune classe utilitaire (`w-5 h-5`,
  `bg-[#060608]`, `text-white`…) → les SVG/logos retombent sur leur taille
  intrinsèque : « logo affiché en grand » ;
- la règle `body { background-color: #060608; color: #f4f4f6 }` de
  [`globals.css`](../src/app/globals.css:30) n'existait plus → **fond blanc** :
  « écran blanc » ;
- le seul CSS encore émis était celui des polices `next/font` (≈ 6 Ko), d'où des
  images non contraintes et perçues comme « de mauvaise qualité ».

**Pourquoi aucun outil ne l'a détecté** : `tsc`, `eslint` et `next build`
réussissaient tous. Un import CSS manquant n'est pas une erreur de compilation —
le build est simplement… sans styles.

### Preuve du diagnostic

Comparaison des CSS émis par le build de production :

| État | Feuilles liées dans `/fr` | Taille du chunk applicatif | Tailwind | Thème `--cuc-yellow` | `body` `#060608` |
| --- | --- | --- | --- | --- | --- |
| Avant | 1 (polices seules) | — | absent | absent | absent |
| Après | 2 | **145 Ko** | présent (`.sr-only`) | présent | présent |

### Correctif

1. [`RootShell.tsx`](../src/components/layout/RootShell.tsx:18) importe
   `@/app/globals.css`. `RootShell` est le seul composant qui rend
   `<html>`/`<body>` et il est partagé par les **deux** layouts racines : c'est
   donc le point unique qui garantit le chargement du CSS pour la vitrine **et**
   le Cockpit. Un commentaire d'avertissement y rappelle que cet import doit
   rester.
2. `viewport` / `themeColor: '#FFE500'` restauré dans
   [`(site)/[locale]/layout.tsx`](../src/app/(site)/[locale]/layout.tsx:63)
   (perdu avec l'ancien layout racine, parité rétablie).

### Garde-fou permanent

Nouveau test [`global-styles.test.ts`](../src/lib/global-styles.test.ts:1) —
échoue si :

1. `src/app/globals.css` disparaît ;
2. la feuille n'importe plus Tailwind (`@import "tailwindcss"`) ;
3. la règle de fond `background-color: #060608` disparaît ;
4. **plus aucun module de `src/` n'importe `globals.css`** (le CSS ne serait alors
   jamais chargé).

Ce dernier point aurait détecté la régression immédiatement.

### Vérification

`npm run typecheck` ✅ · `npm test` (**126 tests**, +3) ✅ · `npm run lint`
(0 erreur) ✅ · `npm run build` ✅ (94 routes).

---

## Incident 3 — `Error` sans message dès le premier défilement (BLOQUANT)

### Symptôme

Page d'accueil : au premier défilement, la page entière est remplacée par une
frontière d'erreur. Console :

```
[CUC] Erreur racine interceptée : Error
    at en (…/0dddzqrxwpgh2.js:3:4248)
    at e.s.! (…/0dddzqrxwpgh2.js:3:7154)
```

Deux indices décisifs : le message est **vide** (`Error` seul, sans texte) et la
ligne dit **« Erreur racine »** — donc émise par
[`global-error.tsx`](../src/app/global-error.tsx:25), pas par l'`error.tsx` de
route. L'exception ne vient donc pas de la page mais de la **coquille**.

### Cause racine

`MobileStickyCTA` est rendu par `RootShell`, donc **hors** du
`NextIntlClientProvider` que les layouts racines déclaraient autour de
`{children}`. Or ce composant ne monte son `<Link>` localisé qu'au premier
défilement (`scrollY > 200`) — et le `Link` de `@/i18n/navigation` appelle
`useLocale()` à chaque rendu :

```js
// next-intl — navigation/shared/BaseLink.js
import { useLocale } from 'use-intl';
function LocalizedLink({ locale, ...rest }, ref) {
    const curLocale = useLocale();
    ...
}
```

`use-intl` lève alors une exception dont le message n'existe **qu'en
développement** :

```js
// use-intl — development
throw new Error('No intl context found. Have you configured the provider?');
// use-intl — production (message retiré du bundle)
throw new Error();
```

D'où un `Error` muet en production. Comme `MobileStickyCTA` vit dans la coquille
et non dans la page, l'`error.tsx` de route ne l'interceptait pas : l'exception
remontait à `global-error.tsx`, qui remplace tout le document.

### Correctif

Le provider est porté par [`RootShell`](../src/components/layout/RootShell.tsx:1),
à la racine. Tout ce que la coquille rend — page, lien d'évitement,
`MobileStickyCTA`, pont d'aperçu — partage désormais le même contexte i18n.
Les deux layouts ne déclarent plus de provider : ils passent leurs `messages`.
L'invariant ne dépend donc plus de l'ordre de composition des layouts.

### Garde-fou

[`shell-providers.test.ts`](../src/lib/shell-providers.test.ts:1) — échoue si
`MobileStickyCTA` ou `PreviewBridgeClient` sortent du périmètre de
`<NextIntlClientProvider>` dans la coquille.

### Vérification

`npm run typecheck` ✅ · `npm test` (**129 tests**) ✅ · `npm run lint` (0 erreur)
✅ · `npm run build` ✅ (94 routes).

---

## Leçon retenue

Les trois incidents partagent la même mécanique : **un état global implicite**
(registre statique de `GoTrueClient` indexé par `storageKey` ; feuille de style
globale chargée par un import qu'aucun outil ne vérifie). Dans les deux cas, la
correction durable n'est pas de supprimer le symptôme mais de rendre l'invariant
**explicite et vérifié** : `storageKey` distincte et nommée, singleton posé sur
`globalThis`, import CSS unique et gardé par un test.
