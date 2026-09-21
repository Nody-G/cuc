# Revue — Textes creux et vérification des liens

## 1. Demande

> « vérifie que dans le site il n'y a pas de description type IA ou qui ne servent à rien sur les
> photos ou ailleurs. enlève les textes de description inutiles que tu peux voir dans le site
> vitrine ou le cockpit, on est grand pas besoin de tout détailler pour chaque chose je veux que ce
> soit épuré. vérifie aussi que s'il y a des liens ou des boutons qui sont censés renvoyer quelque
> part, que ça fonctionne bien et de la bonne manière. »

Deux exigences : **couper le remplissage** et **vérifier les liens**.

---

## 2. Méthode : mesurer avant de couper

Couper « au feeling » sur 443 fichiers aurait été arbitraire. Un inventaire réutilisable a donc été
écrit : [`scripts/audit_copy_and_links.mjs`](scripts/audit_copy_and_links.mjs).

```
node scripts/audit_copy_and_links.mjs                 # rapport complet
node scripts/audit_copy_and_links.mjs --zone=cockpit  # une seule zone
node scripts/audit_copy_and_links.mjs --top=30        # les 30 textes les plus longs
```

Il produit : les textes visibles longs, les méta-descriptions SEO (à part), les liens externes avec
leur cible et leur destination, les liens internes cassés, et les boutons sans action. Rapport JSON :
`scripts/audit_copy_links_report.json`.

### Deux pièges de mesure rencontrés — et corrigés

Ces deux erreurs auraient conduit à « réparer » du code sain. Elles sont documentées parce qu'elles
se reproduiront à la prochaine mesure.

1. **Analyse ligne à ligne d'une balise multi-ligne.** Chercher `target` et `rel` sur la seule ligne
   du `href` rapportait **20 liens externes « en même onglet, sans rel »**… alors qu'ils étaient
   tous corrects, la mention se trouvant sur la ligne suivante. L'analyse porte désormais sur la
   balise complète.
2. **Heuristiques de texte trop larges.** Le premier passage remontait 423 « textes » dont
   l'essentiel était des chaînes de classes Tailwind. Un filtre sur les utilitaires, la densité de
   mots et la ponctuation de phrase ramène le total à **163 textes réellement lisibles**, dont
   seulement 7 dans le Cockpit.
3. **Commentaires pris pour du code.** Un commentaire qui *mentionne* `<button>` était compté comme
   un bouton inerte — cas réellement observé après avoir commenté le correctif. Les commentaires
   sont maintenant retirés avant analyse, et les composants primitifs recevant leur gestionnaire
   par `{...props}` ne sont plus signalés.

---

## 3. Liens et boutons : état réel après vérification

| Contrôle | Résultat |
| --- | --- |
| Liens internes cassés (route inexistante) | **0** sur 30 routes servies |
| Boutons sans action | **0** (après le correctif du § 3.2) |
| Liens externes | **20 / 20** en nouvel onglet avec `rel="noopener noreferrer"` |
| `href="#"` ou `href=""` | **0** |

Les 20 liens externes sont : Instagram (×3), YouTube, TikTok (×2), Facebook, WhatsApp,
Google Maps (×5), Apple Maps, Waze, SNCF Connect, le PDF de certificat Qualiopi (×3).

### 3.1 Pourquoi cela mérite d'être signalé

Le premier relevé annonçait 20 liens sortants non conformes. **C'était faux** : la mesure était
tronquée, pas le code. Sans ce contrôle, j'aurais « corrigé » 20 liens déjà corrects et introduit du
bruit dans le diff. C'est exactement ce que la doctrine appelle *un lien faux est pire qu'aucun
lien* : une conclusion fausse sur du code sain coûte plus cher qu'un doute assumé.

### 3.2 Un vrai défaut corrigé : bouton imbriqué dans un lien

[`MobileStickyCTA.tsx`](src/components/layout/MobileStickyCTA.tsx:63) plaçait un `<button>` à
l'intérieur d'un `<Link href>`. La navigation fonctionnait, mais deux éléments interactifs
superposés brouillent la cible de clic et la navigation au clavier (lecteurs d'écran). Le lien porte
désormais lui-même l'apparence du bouton.

---

## 4. Textes coupés

### 4.1 Disciplines — ANNULÉ : descriptions d'origine restaurées

Premier passage : les 10 `fullDesc` de [`disciplines.ts`](src/data/disciplines.ts:3) ont été
condensées de 457 à 180 caractères, en retirant les appréciations (« Unique en Europe », « Exercice
spectaculaire »).

**Retour client : « remets les mêmes descriptions qu'il y avait avant sur cette page, car là ça ne
me plaît pas ».** Les descriptions d'origine ont donc été **intégralement restaurées**, à l'octet
près — `git diff` contre l'état d'avant la revue ne renvoie rien.

### 4.1 bis Ce que cet aller-retour enseigne

J'ai traité ces fiches comme du remplissage à nettoyer. C'était une **erreur de jugement**, et elle a
une cause identifiable.

- **Confondre « long » et « creux ».** Une description de 400 caractères n'est pas du remplissage si
  elle décrit le contenu réel d'un enseignement. Ces textes **sont le produit** : c'est ce que le
  prospect vient lire pour choisir une formation. Les raccourcir appauvrit l'offre au lieu de
  l'épurer.
- **Décider à la place du client sur son propre contenu.** Distinguer un superlatif creux d'un détail
  technique jugé utile n'est pas un arbitrage de développeur. Retirer une tournure manifestement
  creuse (« unique au monde », « à couper le souffle ») se défend ; réécrire un argumentaire
  commercial ne se fait **que sur demande**.

**Règle retenue :** sur du contenu éditorial, on *signale* — on ne réécrit pas de sa propre
initiative. Les coupes qui relèvent d'un défaut objectif (donnée fausse, promesse invérifiable, lien
mort) restent légitimes, parce qu'elles se prouvent. Les coupes de style sur un texte porteur
d'information doivent passer par une validation.

### 4.1 ter Décision finale : tout le contenu d'origine est restauré

La consigne a ensuite été étendue à l'ensemble du site : « vérifie que tu n'as pas modifié les textes
originaux qu'il y avait à la base sur l'ensemble du site […] je veux garder les mêmes si c'est
pertinent ». Cette consigne tranche la question laissée ouverte au § 4.1 : **les coupes de § 4.2 et
§ 4.3 ont été annulées elles aussi.**

Tous les fichiers de contenu ont été restaurés depuis l'état d'avant la revue. La preuve est un
`git diff` vide :

```
git diff 8a40f78 -- src/data src/components/sections \
  src/app/equipe-cascadeurs-pro src/app/stunt-workshop-cuc src/app/team-building-cascades
# → aucune sortie
```

Autrement dit : **plus un seul texte du site n'est modifié par cette revue.** Le diff de session ne
contient plus que du **code** (studio 3D, HUD, déplacement de caméra, persistance) et l'aide du studio,
qui décrit des commandes nouvelles et n'existait pas sous cette forme.

### 4.2 Formations et installations — ANNULÉ : texte d'origine restauré

Cette coupe figurait au commit `af9bf89`. Elle est **intégralement annulée**. Le tableau ci-dessous est
conservé comme trace de ce qui avait été coupé, pour ne pas refaire le même arbitrage.

| Fichier | Avant (remis en place) | Après (coupe annulée) |
| --- | --- | --- |
| [`programs.ts`](src/data/programs.ts:30) | « Le **cursus de référence** pour intégrer l'**industrie**… » | « 9 à 10 stages de 12 jours échelonnés sur deux ans… » |
| `programs.ts` (découverte) | « Le point d'entrée **incontournable**… » | « 12 jours pour éprouver le rythme du métier… » |
| `programs.ts` (été) | « Une semaine estivale **vibrante**… » | « Une semaine d'été sur le campus… » |
| `programs.ts` (AFDAS artistes) | « …une **crédibilité totale**… » | « Recevoir des coups, chuter sans danger… » |
| `programs.ts` (week-end) | « **Vivez l'expérience** cascadeur… » | « Un week-end en internat sur le campus. » |
| [`campus.ts`](src/data/campus.ts:9) | « Structure **emblématique**… Haute de plus de 20 mètres… » | « Tour de saut inaugurée en octobre 2024… » |
| [`stages.data.ts`](src/components/sections/stages/stages.data.ts:38) | « **Vivez la vie d'un cascadeur**… » | « Deux jours en internat… » |
| [`stages.data.ts`](src/components/sections/stages/stages.data.ts:63) (AFDAS) | « Donnez à vos rôles une **crédibilité totale**… » | « 70 heures conventionnées AFDAS à Gennevilliers… » |
| `HomeVirtualTourSection` | « Découvrez nos 6 hectares **comme si vous y étiez !** » | Énumération des installations. |
| `equipe-cascadeurs-pro/page.tsx` | « Une **faculté d'action unique au monde**… » | « Coordinateurs de cascades, pionniers des Yamakasi… » |
| `stunt-workshop-cuc/page.tsx` | « …at the **world's premier** stunt training facility » | Faits : deux semaines, dix disciplines… |
| `team-building-cascades/page.tsx` | « immersion **inoubliable**… **sécurité sans compromis** » | « Ateliers de cascade, de 10 à 300 personnes… » |

**Fichiers restaurés à l'octet près :** `src/data/programs.ts`, `src/data/campus.ts`,
`src/components/sections/stages/stages.data.ts`,
`src/components/sections/home/HomeVirtualTourSection.tsx`,
`src/app/equipe-cascadeurs-pro/page.tsx`, `src/app/stunt-workshop-cuc/page.tsx`,
`src/app/team-building-cascades/page.tsx`.

### 4.3 Cockpit — ANNULÉ : sous-titres d'origine restaurés

Les deux sous-titres retirés sont remis en place :

| Fichier | Restauré |
| --- | --- |
| [`ContentHealthView.tsx`](src/app/admin/components/ContentHealthView.tsx:164) | « Détection automatique des liens internes cassés, images manquantes, contenus orphelins et métadonnées SEO incomplètes sur l'ensemble de la vitrine. » |
| [`AuditLogView.tsx`](src/app/admin/components/AuditLogView.tsx:307) | « Historique horodaté des modifications effectuées dans le Cockpit : création, édition, publication, suppression et restauration. » |

Le reste des textes du Cockpit (7 au total) est **fonctionnel** et n'a jamais été touché :
confirmations de restauration, avertissement d'écrasement de sauvegarde, consignes d'état vide
(« Glissez-déposez ou cliquez pour téléverser vos premières photos »). Ce ne sont pas des
descriptions, mais des messages qui engagent une action.

---

## 5. Ce qui a été délibérément conservé

Épuré ne veut pas dire vide. Les contenus suivants ont été **laissés tels quels** :

- **Bios de coachs** ([`team.ts`](src/data/team.ts:76)) : « 30 ans d'expérience », « 200 productions »,
  « Taurus World Stunt Award pour *John Wick 4* » — ce sont des faits vérifiables, et c'est la
  substance même d'une fiche coach.
- **Listes d'équipements** et **caractéristiques techniques** des installations : informations
  concrètes, structurées, utiles à la décision.
- **14 méta-descriptions SEO** : invisibles à l'écran, elles servent le référencement. Les couper
  pour des raisons de style aurait dégradé le site sans rien épurer.
- **Textes éditables du CMS** : beaucoup des phrases visées par cette revue étaient des **replis**
  utilisés uniquement si le contenu Supabase est absent (`content.hero?.subtitle || "…"`). Couper un
  repli ne change rien à l'écran — et le rétablir ne change rien non plus. C'est l'une des raisons
  pour lesquelles ce chantier ne se prouvait pas : il était invisible.

---

## 6. Défaut de donnée signalé — non corrigé

[`campus.ts`](src/data/campus.ts:114) — la fiche « Hébergement & Base de Vie (90 Places) » affiche comme
dimension **« Domaine de 6 hectares »**, valeur reprise de la fiche « Site Extérieur ». Un visiteur lit
donc une surface qui n'est pas celle de l'hébergement.

La correction (« 90 places ») avait été appliquée puis a été **annulée avec la restauration générale**.
Le texte d'origine est en place et l'anomalie est **signalée**, pas corrigée d'office. C'est l'application
de la règle du § 4.1 bis : une donnée manifestement fausse se prouve et se corrige, mais ici la valeur
peut être volontaire (le domaine dans son ensemble) — l'arbitrage revient au client.

---

## 7. Vérifications

```
node scripts/audit_copy_and_links.mjs     # 0 lien cassé, 0 bouton inerte, 20/20 liens externes OK
npm run typecheck                         # 0 erreur
npm run test                              # 122 tests / 8 fichiers — 0 échec
npm run lint                              # 0 erreur
npm run build                             # succès, 64 pages
```

Résultat mesuré sur le texte : **168 textes visibles longs** (423 au premier relevé, dont la plupart
étaient des classes Tailwind ; 163 après la passe de coupes, désormais annulée), dont **7 seulement
dans le Cockpit** — les 7 sont fonctionnels et intacts.

Après restauration, le contrôle de contenu ne porte plus que sur le **diagnostic** : cette revue ne
laisse derrière elle **aucune réécriture de texte**. Ce qu'elle laisse, c'est du code (studio 3D, HUD,
déplacement de caméra, persistance) et deux outils de mesure réutilisables —
[`scripts/audit_copy_and_links.mjs`](scripts/audit_copy_and_links.mjs) et
[`scripts/verify_campus_placements_3d.mjs`](scripts/verify_campus_placements_3d.mjs).

---

## 8. Contrôle final — plus aucun texte d'origine modifié

| Périmètre | État |
| --- | --- |
| `src/data` (disciplines, programmes, campus, équipe, filmographie) | **identique** à `8a40f78` |
| `src/components/sections` | **identique** à `8a40f78` |
| `src/app/equipe-cascadeurs-pro`, `stunt-workshop-cuc`, `team-building-cascades` | **identique** à `8a40f78` |
| `src/app/admin` | code uniquement (`actions.ts`, `CampusPlan3DView.tsx`) |
| `src/components/3d`, `src/lib` | code (studio, persistance, clés Supabase) |

Contrôle exécuté :

```
git diff 8a40f78 -- src/data src/components/sections \
  src/app/equipe-cascadeurs-pro src/app/stunt-workshop-cuc src/app/team-building-cascades
# → aucune sortie (aucun texte modifié)
```

Un seul texte reste modifié, et il est assumé : l'**aide du studio 3D**
([`CampusPlan3DView.tsx`](src/app/admin/components/CampusPlan3DView.tsx:89)), qui documente des
commandes qui n'existaient pas avant (anneau de rotation permanent, `Ctrl` + `Z`, clic droit pour se
déplacer). Revenir au texte d'origine y décrirait un outil qui n'existe plus.
