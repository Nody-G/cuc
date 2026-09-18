# RÈGLE PERMANENTE : INTERCONNEXION CUC VITRINE ↔ CUC SIGN & PERSISTANCE TOTALE

## 1. Principe Directeur Absolu
Le site vitrine / Cockpit CUC et l'application métier d'émargement et d'administration **CUC Sign** partagent la même instance de base de données Supabase (`https://xkbkcsypftvspmkfnrfm.supabase.co`).
L'agent doit **systématiquement et obligatoirement interconnecter** toute donnée ou entité présente dans le site CUC avec CUC Sign dès que c'est utile, pertinent et nécessaire.

## 2. Zéro Valeur ou Texte Orphelin
- Toute valeur, tout texte, tout paramètre modifiable via le Cockpit CUC (ou saisi par un utilisateur sur la vitrine) **doit avoir sa place en base de données Supabase**.
- Ne JAMAIS laisser de données en dur (mock), de formulaires non persistés, ou de données confinées uniquement au `localStorage` sans persistance Supabase.

## 3. Matrice des Interconnexions Obligatoires
| Entité CUC Vitrine / Cockpit | Table CUC | Table CUC Sign | Clé de Liaison & Utilité |
| :--- | :--- | :--- | :--- |
| **Sessions de Formation** | `site_sessions` | `formations` | `cuc_sign_formation_id` ↔ `formations.id` : Permet aux sessions affichées sur le site de correspondre aux promotions réelles de CUC Sign (dates, émargement, statut de session). |
| **Équipe & Formateurs** | `site_team` | `profiles` | `profile_id` ↔ `profiles.id` : Permet aux coachs de la vitrine d'être liés aux comptes utilisateurs formateurs de CUC Sign (avec rôle `coach`, `instructor`, `admin`). |
| **Campus & Lieux d'Entraînement** | `site_campus_pois` | `locations` | `location_id` ↔ `locations.id` : Les zones interactives du campus (Dojo Malik, Tour Gaspard, Salle Bell, etc.) correspondent aux lieux d'entraînement enregistrés dans CUC Sign. |
| **Disciplines** | `site_disciplines` | `evaluation_disciplines` | `discipline_id` : Alignement des grilles d'évaluation et compétences entre la formation CUC Sign et les fiches programmes de la vitrine. |
| **Candidatures & Inquiries** | `site_inquiries` | `students` / `inscriptions` | Dès qu'un prospect postule sur la vitrine, la demande est enregistrée et préparée pour conversion en dossier élève CUC Sign. |
| **Traçabilité & Audit** | `site_audit_logs` | `audit_logs` | Traçabilité des actions administratives pour conformité Qualiopi et sécurité. |

## 4. Règles de Sécurité et d'Intégrité
1. **Préfixe Obligatoire** : Toutes les tables créées pour la vitrine ou le cockpit doivent porter le préfixe `site_` (`site_pages`, `site_sessions`, `site_team`, `site_disciplines`, `site_campus_pois`, `site_inquiries`, `site_audit_logs`, `site_settings`).
2. **Protection CUC Sign** : Les clés étrangères vers les tables de CUC Sign doivent systématiquement avoir `ON DELETE SET NULL`. Une modification ou suppression sur la vitrine ne doit JAMAIS corrompre ou supprimer de données métier dans CUC Sign.
3. **Synchronisation Temps Réel** : Les canaux Supabase Realtime doivent écouter les tables `site_*` pour répercuter immédiatement les mises à jour sans rechargement.
