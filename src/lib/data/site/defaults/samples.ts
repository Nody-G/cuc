/**
 * Données d’exemple — candidatures, audit — extrait de `site-service.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2.
 */

import { AuditLogEntry, SiteInquiry } from '../types';

export const SAMPLE_INQUIRIES: SiteInquiry[] = [
  {
    id: 'inq-1',
    full_name: 'Maxime Lefebvre',
    email: 'm.lefebvre.gym@gmail.com',
    phone: '06 14 28 39 50',
    program_id: 'pro-longue-duree',
    program_title: 'Formation Professionnelle 2 ans',
    age: '21 ans',
    sport_background: 'Gymnastique artistique haut niveau (12 ans), Parkour & Tricking',
    session_date: 'Septembre 2026',
    afdas_status: 'Demandeur d’emploi / Financement individuel',
    message: 'Passionné de cascade physique et de cinéma d’action, je souhaite intégrer la promotion 2026. Disponible pour les auditions physiques au Cateau-Cambrésis.',
    status: 'nouveau',
    admin_notes: 'Profil physique très prometteur. Dossier de candidature complet reçu.',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'inq-2',
    full_name: 'Camille Vasseur',
    email: 'camille.vasseur.pro@outlook.fr',
    phone: '06 82 45 10 99',
    program_id: 'stage-afdas-pro',
    program_title: 'Stage Professionnel AFDAS',
    age: '27 ans',
    sport_background: 'Comédienne comédie musicale, escrime de spectacle, boxe thaï',
    session_date: 'Juillet 2026',
    afdas_status: 'Intermittent du spectacle (AFDAS accordé)',
    message: 'Comédienne intermittente, je cherche à perfectionner mes compétences en combat chorégraphié et chutes câblées pour de futurs tournages.',
    status: 'en_cours',
    admin_notes: 'Contactée par téléphone. Convention AFDAS transmise au secrétariat.',
    created_at: new Date(Date.now() - 3600000 * 26).toISOString(),
  },
  {
    id: 'inq-3',
    full_name: 'Lucas Bernard (RH Warner Bros Fr)',
    email: 'l.bernard@prod-events.fr',
    phone: '01 42 68 90 00',
    program_id: 'team-building',
    program_title: 'Team Building Cascade 45 personnes',
    age: 'N/A',
    sport_background: 'Équipe de production de 45 collaborateurs',
    session_date: '18 Juin 2026',
    afdas_status: 'Financement Entreprise / OPCO',
    message: 'Bonjour, nous souhaiterions privatiser le domaine pour une journée Team Building avec ateliers Chute Airbag et Combat Scénique pour notre équipe.',
    status: 'admis',
    admin_notes: 'Devis envoyé et signé. Accompte 30% reçu. Encadrement prévu avec 4 instructeurs.',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
];

export const SAMPLE_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-1',
    user_name: 'Lucas Dollfus (Directeur)',
    action: 'Mise à jour de page',
    entity: 'team-building-cascades',
    details: 'Mise à jour des descriptifs d’ateliers et réorganisation de grille',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'log-2',
    user_name: 'Secrétariat CUC',
    action: 'Nouvelle Session',
    entity: 'Formation Découverte',
    details: 'Session 15-26 Juillet 2026 ouverte aux inscriptions',
    created_at: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
  },
  {
    id: 'log-3',
    user_name: 'Admin Système',
    action: 'Bandeau Flash',
    entity: 'site_announcements',
    details: 'Activation de l’alerte Journée Portes Ouvertes Campus',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];
