/**
 * Modèles de réponse officielle par email — textes éditoriaux figés
 * (audition, financement AFDAS, devis entreprises, admission).
 *
 * Couche « Domaine » (`AGENTS.md` § 1) : fonctions pures de composition.
 */
import type { SiteInquiry } from '@/lib/data/site-service';

export interface EmailTemplate {
    id: string;
    name: string;
    badge: string;
    subject: (inq: SiteInquiry) => string;
    body: (inq: SiteInquiry) => string;
}

export const RESPONSE_TEMPLATES: EmailTemplate[] = [
    {
        id: 'audition',
        name: 'Convocation Audition CUC',
        badge: 'Auditions',
        subject: (inq) => `[CUC] Convocation aux auditions de sélection - ${inq.full_name}`,
        body: (inq) => `Bonjour ${inq.full_name},

Faisant suite à votre candidature pour la formation ${inq.program_title || inq.program_id}, nous avons le plaisir de vous convoquer aux prochaines auditions de sélection au sein du Campus Univers Cascades (Le Cannet-des-Maures, Var).

Rappel des éléments requis le jour de l'audition :
- Certificat médical de non-contre-indication à la pratique des cascades physiques de moins de 3 mois.
- Tenue de sport adaptée (training, baskets propres d'intérieur, protège-dents conseillé).
- Pièce d'identité en cours de validité.

Merci de nous confirmer votre présence par retour de mail sous 48h.

Bien cordialement,
Lucas Dollfus & L'Équipe Pédagogique
Campus Univers Cascades (CUC)
contact@campus-univers-cascades.com`,
    },
    {
        id: 'afdas',
        name: 'Dossier AFDAS / OPCO',
        badge: 'Financement',
        subject: (inq) => `[CUC] Dossier de financement AFDAS / OPCO - ${inq.full_name}`,
        body: (inq) => `Bonjour ${inq.full_name},

Nous faisons suite à votre demande concernant le financement AFDAS pour la formation ${inq.program_title || inq.program_id} au Campus Univers Cascades.

Le CUC étant un organisme de formation certifié Qualiopi (Certificat N° 21452296), nos parcours sont éligibles aux financements AFDAS (artistes, intermittents du spectacle et techniciens).

Vous trouverez ci-joint :
- Le programme pédagogique détaillé et le devis conventionné aux normes AFDAS.
- L'attestation d'éligibilité et le calendrier prévisionnel.

Procédure :
1. Déposez ce devis et ce programme sur votre espace adhérent AFDAS au moins 4 semaines avant le début de la session.
2. Transmettez-nous l'accord de prise en charge dès réception.

Restant à votre entière disposition,
Le Secrétariat Administratif CUC`,
    },
    {
        id: 'devis_event',
        name: 'Devis Immersion & Team Building',
        badge: 'Entreprises',
        subject: (inq) => `[CUC] Devis & Proposition d'immersion cascade cinéma - ${inq.full_name}`,
        body: (inq) => `Bonjour ${inq.full_name},

Merci pour votre prise de contact avec le Campus Univers Cascades.

Nous vous soumettons notre proposition de stage cascade cinéma adaptée à votre équipe :
- Initiation aux chorégraphies de combats scéniques et maniement d'armes sous la direction de cascadeurs professionnels.
- Ateliers chutes, câblage cinéma (wirework) et sécurité des plateaux.
- Restitution et tournage d'une scène d'action montée en direct.

N'hésitez pas à nous indiquer vos créneaux préférentiels pour convenir d'un échange téléphonique et caler le devis définitif.

L'Équipe Événements CUC
contact@campus-univers-cascades.com`,
    },
    {
        id: 'admission',
        name: 'Confirmation d\'Admission',
        badge: 'Inscription',
        subject: (inq) => `[CUC] Félicitations - Admission confirmée au Campus Univers Cascades - ${inq.full_name}`,
        body: (inq) => `Bonjour ${inq.full_name},

Nous avons le plaisir de vous annoncer votre admission officielle pour la session ${inq.program_title || inq.program_id} au sein du Campus Univers Cascades !

Vos prochaines étapes :
1. Retournez-nous le contrat de formation signé ainsi que le règlement intérieur paraphé.
2. Réglez l'acompte de réservation de place (ou transmettez votre accord de prise en charge).
3. Préparez votre arrivée sur le campus du Cannet-des-Maures (Var).

Nous avons hâte de vous compter parmi nos élèves cascadeurs.

Lucas Dollfus & L'Équipe du CUC`,
    },
];
