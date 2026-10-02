# Checklist Officielle — Mise en Ligne du Site CUC

> Document de suivi pour le lancement en production sur `campus-universcascades.com`.
> À cocher et enrichir au fur et à mesure de l'avancement.

---

## 1. Contenus & Visuels (Cockpit)

- [ ] **Remplacement des photos** :
  - [ ] Hero de la page d'accueil (sliders 5, 6, 7, 8).
  - [ ] Photos des disciplines & installations du campus.
  - [ ] Portraits et photos d'action de l'équipe / coachs.
  - [ ] Visuels et affiches des films / crédits.
- [ ] **Textes & descriptions** :
  - [ ] Descriptions des formations et dates de sessions à jour.
  - [ ] Biographies et rôles des coachs.
  - [ ] Textes de présentation du campus et de la Tour CUC.
  - [ ] Relecture rapide de l'anglais (`/en`) sur les pages clés.

---

## 2. Nom de Domaine & Bascule DNS (Vercel)

- [ ] **Déclaration dans Vercel** :
  - [ ] Ajouter `campus-universcascades.com` et `www.campus-universcascades.com` dans *Settings > Domains*.
- [ ] **Bascule DNS chez le registrar** (OVH, Gandi, Cloudflare...) :
  - [ ] CNAME `www` pointé vers `cname.vercel-dns.com`.
  - [ ] Enregistrement A `@` pointé vers `76.76.21.21`.
- [ ] **Certificat SSL (HTTPS)** :
  - [ ] Vérifier que Vercel affiche le cadenas vert sur les deux domaines.
- [ ] **Redirections de l'ancien site** :
  - [ ] Tester les anciennes URL WordPress (`/formations`, `/disciplines`, `/contact`...) pour vérifier qu'elles redirigent bien vers les nouvelles pages en 301.

---

## 3. Authentification & Sécurité (Google OAuth & Supabase)

- [ ] **Supabase Dashboard** (*Authentication > URL Configuration*) :
  - [ ] *Site URL* mise à jour : `https://www.campus-universcascades.com`.
  - [ ] *Redirect URLs* ajoutées :
    - `https://www.campus-universcascades.com/auth/callback`
    - `https://campus-universcascades.com/auth/callback`
- [ ] **Google Cloud Console** (*APIs & Services > Identifiants*) :
  - [ ] Vérifier que l'URI de redirection autorisée contient `https://xkbkcsypftvspmkfnrfm.supabase.co/auth/v1/callback`.
  - [ ] Vérifier que l'écran de consentement permet la connexion des comptes administratifs de l'équipe CUC.

---

## 4. Variables d'Environnement Vercel (Production)

- [ ] `NEXT_PUBLIC_SITE_URL` = `https://www.campus-universcascades.com`.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = présente et cochée pour l'environnement **Production**.
- [ ] `INSTAGRAM_ACCESS_TOKEN` & `INSTAGRAM_ACCOUNT_ID` = présents (si synchronisation des reels Instagram active).

---

## 5. Recette Fonctionnelle de Pré-Lancement (Test des 15 minutes)

- [ ] **Candidatures & Contact** :
  - [ ] Soumettre un formulaire test sur `/contact-cuc`.
  - [ ] Vérifier sa réception immédiate dans le Cockpit (`/admin/inquiries`).
- [ ] **Accès Cockpit** :
  - [ ] Tester une connexion admin complète depuis le nom de domaine officiel.
- [ ] **Plan 3D du Campus** :
  - [ ] Vérifier le chargement et la navigation 3D sur ordinateur et mobile.
- [ ] **Bilinguisme** :
  - [ ] Vérifier la bascule FR / EN depuis la barre de navigation.
- [ ] **Affichage Mobile** :
  - [ ] Vérifier la réactivité du menu, des formulaires et des vidéos sur smartphone.

---

## 6. Conformité Légale & Administrative

- [ ] **Mentions Légales & Footer** :
  - [ ] Numéro SIRET / RCS vérifié.
  - [ ] Numéro d'enregistrement de formation / Qualiopi (`21452296`) vérifié.
  - [ ] Nom du directeur de publication à jour.
  - [ ] Mention de l'hébergeur Vercel Inc. conforme.

---

## 7. Actions Immédiates Post-Lancement (J+1 / J+7)

- [ ] **Google Search Console** :
  - [ ] Déclarer la propriété `https://www.campus-universcascades.com`.
  - [ ] Soumettre le sitemap : `https://www.campus-universcascades.com/sitemap.xml`.
- [ ] **Vercel Web Analytics** :
  - [ ] Activer Vercel Analytics en 1 clic dans le tableau de bord Vercel pour le suivi des visites en temps réel conforme RGPD.

---

## 8. Notes & Ajustements Équipe CUC

*(Espace libre pour noter des points spécifiques au fur et à mesure)*

- 
