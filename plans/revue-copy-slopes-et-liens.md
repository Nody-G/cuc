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

### 4.1 Disciplines (le plus gros volume de prose)

[`disciplines.ts`](src/data/disciplines.ts:3) — les 10 `fullDesc` faisaient 300 à 460 caractères
chacune, avec des appréciations que la doctrine interdit. Maximum ramené de **457 à 180 caractères**,
sans perdre un fait : chaque phrase porte désormais un équipement, un geste technique ou un contexte
de tournage.

| Discipline | Retiré | Conservé |
| --- | --- | --- |
| Chute de grande hauteur | « **Unique en Europe**, la CUC Tower dresse ses 21 mètres… » | Plateformes jusqu'à 21 m, défenestration, décrochage, dispositifs d'amortissement |
| Chutes d'escalier | « **Exercice spectaculaire**, … » | Roulement, contacts amortis, gainage, sortie dans l'axe caméra |
| Combat chorégraphié | Reformulation complète | « ne consiste pas à frapper réellement », répertoires, distances, axe caméra |
| 7 autres | Superlatifs et envolées | Gestes, matériel, contexte |

### 4.2 Formations et installations

| Fichier | Avant | Après |
| --- | --- | --- |
| [`programs.ts`](src/data/programs.ts:30) | « Le **cursus de référence** pour intégrer l'**industrie**… » | « 9 à 10 stages de 12 jours échelonnés sur deux ans : évaluation continue et mises en situation de plateau. » |
| `programs.ts` (découverte) | « Le point d'entrée **incontournable**… » | « 12 jours pour éprouver le rythme du métier, sans engagement sur le cursus long. » |
| `programs.ts` (été) | « Une semaine estivale **vibrante**… **dépassement de soi**… **ambiance de festival**… **à pas de géant**… **meilleurs instructeurs de France** » | « Une semaine d'été sur le campus : Parkour, Freerun, airbag et combats chorégraphiés. » |
| `programs.ts` (AFDAS artistes) | « …une **crédibilité totale**… » | « Recevoir des coups, chuter sans danger, manier des armes factices. » |
| `programs.ts` (week-end) | « **Vivez l'expérience** cascadeur… » | « Un week-end en internat sur le campus. » |
| [`campus.ts`](src/data/campus.ts:9) | « Structure **emblématique**… Haute de plus de 20 mètres avec plusieurs plateformes… » | « Tour de saut inaugurée en octobre 2024 : plateformes étagées de 6 à 21 mètres… » |
| [`stages.data.ts`](src/components/sections/stages/stages.data.ts:38) | « **Vivez la vie d'un cascadeur**… **faire le plein de sensations fortes** » | « Deux jours en internat : chutes sur airbag géant, combats scéniques… » |
| [`stages.data.ts`](src/components/sections/stages/stages.data.ts:63) (AFDAS) | « Donnez à vos rôles une **crédibilité totale**… » | « 70 heures conventionnées AFDAS à Gennevilliers : … » |
| `HomeVirtualTourSection` | « Découvrez nos 6 hectares **comme si vous y étiez !** » | Énumération des installations, point. |
| `equipe-cascadeurs-pro/page.tsx` | « Une **faculté d'action unique au monde**… **les plus grandes productions hollywoodiennes**… **chaque jour** » | « Coordinateurs de cascades, pionniers des Yamakasi et cascadeurs en exercice… » |
| `stunt-workshop-cuc/page.tsx` | « …at the **world's premier** stunt training facility » | Faits : deux semaines, dix disciplines, internat, 6 hectares. |
| `team-building-cascades/page.tsx` | « immersion **inoubliable**… **sécurité sans compromis** » | « Ateliers de cascade, de 10 à 300 personnes, sur le campus ou votre lieu de séminaire. » |

### 4.3 Cockpit

Deux sous-titres ne faisaient que redire ce que le panneau fait déjà :

| Fichier | Retiré |
| --- | --- |
| [`ContentHealthView.tsx`](src/app/admin/components/ContentHealthView.tsx:164) | « Détection automatique des liens internes cassés, images manquantes, contenus orphelins et métadonnées SEO incomplètes sur l'ensemble de la vitrine. » |
| [`AuditLogView.tsx`](src/app/admin/components/AuditLogView.tsx:307) | « Historique horodaté des modifications effectuées dans le Cockpit : création, édition, publication, suppression et restauration. » |

Le reste des textes du Cockpit (7 au total) est **fonctionnel** et conservé : confirmations de
restauration, avertissement d'écrasement de sauvegarde, consignes d'état vide (« Glissez-déposez ou
cliquez pour téléverser vos premières photos »). Ce ne sont pas des descriptions, mais des messages
qui engagent une action.

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
- **Textes éditables du CMS** : beaucoup de phrases coupées ici sont des **replis** utilisés
  uniquement si le contenu Supabase est absent (`content.hero?.subtitle || "…"`). L'effet visible
  dépend donc de ce qui est réellement publié dans le Cockpit.

---

## 6. Défaut de donnée corrigé au passage

[`campus.ts`](src/data/campus.ts:114) — la fiche « Hébergement & Base de Vie (90 Places) » affichait
comme dimension **« Domaine de 6 hectares »**, valeur copiée de la fiche « Site Extérieur ». Un
visiteur lisait donc une surface fausse. Corrigé en « 90 places ». **Une donnée fausse vaut moins
qu'une donnée absente** : c'est la même règle que celle appliquée aux liens et aux mots-clés.

---

## 7. Vérifications

```
node scripts/audit_copy_and_links.mjs     # 0 lien cassé, 0 bouton inerte, 20/20 liens externes OK
npm run typecheck                         # 0 erreur
npm run test                              # 122 tests / 8 fichiers — 0 échec
npm run lint                              # 0 erreur
npm run build                             # succès, 64 pages
```

Résultat mesuré sur le texte : **163 textes visibles longs** (contre 423 au premier relevé, dont la
plupart étaient des classes Tailwind), dont **7 seulement dans le Cockpit**, et un maximum ramené de
**457 à 286 caractères** pour la plus longue description du site.
