/**
 * Lot i18n — surfaces modales : candidature (`applicationModal`) et visionneuse
 * (`lightbox`).
 *
 * Ces deux composants s'ouvrent au clic sur des pages anglaises mais portaient
 * leur copie en français dans le code — invisible pour le crawler (rien n'est
 * rendu au premier chargement), donc jamais corrigé. Les libellés partent au
 * catalogue ; les valeurs ENVOYÉES EN BASE (`program_title`, statut AFDAS)
 * restent, elles, en français : ce sont des références de cockpit, pas de la
 * copie d'interface.
 *
 * Usage : node scripts/fix_modals_i18n.mjs [--dry]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dry = process.argv.includes('--dry');
const here = (rel) => fileURLToPath(new URL('../' + rel, import.meta.url));

const APPLICATION_MODAL = {
    fr: {
        closeAria: 'Fermer',
        badge: 'CANDIDATURE & ADMISSIONS',
        session: 'SESSION 2026-2027',
        logoAlt: 'Logo CUC',
        titleLead: 'Candidater au ',
        titleAccent: 'Campus Univers Cascades',
        intro:
            'Remplissez les informations ci-dessous pour postuler au cursus professionnel, réserver un stage ou solliciter une prise en charge AFDAS.',
        tabs: {
            pro: 'Cursus Pro (Long)',
            discovery: 'Stage Découverte',
            weekend: 'Week-end (250€)',
            afdas: 'Prise en charge AFDAS',
        },
        labels: {
            fullName: 'Nom & Prénom *',
            age: 'Âge * (Dès 16 ou 18 ans)',
            email: 'Adresse Email *',
            phone: 'Téléphone *',
            afdasStatus: 'Statut AFDAS / Professionnel',
            sport: 'Parcours Sportif / Artistique & Disciplines pratiquées',
            session: 'Session souhaitée / Objectifs',
        },
        placeholders: {
            fullName: 'Ex: Alexandre Dubois',
            age: 'Ex: 22',
            email: 'alexandre@exemple.com',
            phone: '06 00 00 00 00',
            sport: 'Ex: Arts martiaux (5 ans), Parkour, Gymnastique, Théâtre...',
            message: 'Précisez la date de session visée ou vos questions particulières...',
        },
        afdasOptions: [
            'Intermittent du spectacle (Comédien, danseur, artiste)',
            'Cascadeur professionnel en activité',
            'Autre ayant-droit AFDAS',
        ],
        safetyTitle: 'Avis de sécurité & sélection :',
        safetyBody:
            "En raison de l'exigence physique et des contraintes de sécurité, chaque candidature est soumise à l'examen de la commission pédagogique du CUC.",
        submitError: 'Erreur lors de la transmission du dossier.',
        cancel: 'Annuler',
        submit: 'Transmettre ma Candidature',
        submitting: 'Transmission...',
        successTitle: 'Dossier Transmis avec Succès !',
        successBody:
            'Votre demande a bien été enregistrée pour le compte de <strong>{name}</strong>. Un responsable pédagogique du CUC vous contactera sous 24 à 48 heures pour valider votre dossier et les disponibilités de session.',
        contactAddress: 'Campus CUC, 59360 Le Cateau-Cambrésis (Hauts-de-France)',
        contactPhone: 'Standard pédagogique : (+33) 06 72 84 94 92',
        closeCase: 'Fermer le Dossier',
    },
    en: {
        closeAria: 'Close',
        badge: 'APPLICATION & ADMISSIONS',
        session: 'SESSION 2026-2027',
        logoAlt: 'CUC logo',
        titleLead: 'Apply to ',
        titleAccent: 'Campus Univers Cascades',
        intro:
            'Fill in the details below to apply for the professional course, book a course or request AFDAS funding.',
        tabs: {
            pro: 'Pro Course (Long)',
            discovery: 'Discovery Course',
            weekend: 'Weekend (€250)',
            afdas: 'AFDAS Funding',
        },
        labels: {
            fullName: 'Full name *',
            age: 'Age * (from 16 or 18)',
            email: 'Email address *',
            phone: 'Phone *',
            afdasStatus: 'AFDAS / professional status',
            sport: 'Sporting / artistic background & disciplines practised',
            session: 'Preferred session / goals',
        },
        placeholders: {
            fullName: 'e.g. Alexandre Dubois',
            age: 'e.g. 22',
            email: 'alexandre@example.com',
            phone: '06 00 00 00 00',
            sport: 'e.g. Martial arts (5 years), Parkour, Gymnastics, Theatre...',
            message: 'Tell us the session date you are aiming for or any specific questions...',
        },
        afdasOptions: [
            'Performing arts worker (actor, dancer, artist)',
            'Professional stunt performer in activity',
            'Other AFDAS beneficiary',
        ],
        safetyTitle: 'Safety notice & selection:',
        safetyBody:
            'Because of the physical demands and safety requirements, every application is reviewed by the CUC teaching committee.',
        submitError: 'Error while submitting your application.',
        cancel: 'Cancel',
        submit: 'Submit my application',
        submitting: 'Submitting...',
        successTitle: 'Application submitted successfully!',
        successBody:
            'Your request has been recorded for <strong>{name}</strong>. A CUC course officer will contact you within 24 to 48 hours to confirm your application and session availability.',
        contactAddress: 'CUC Campus, 59360 Le Cateau-Cambrésis (Hauts-de-France)',
        contactPhone: 'Course office: (+33) 06 72 84 94 92',
        closeCase: 'Close the application',
    },
};

const LIGHTBOX = {
    fr: {
        closeAria: 'Fermer la visionneuse',
        closeTitle: 'Fermer (Échap)',
        prevAria: 'Photo précédente',
        prevTitle: 'Précédente (Flèche gauche)',
        nextAria: 'Photo suivante',
        nextTitle: 'Suivante (Flèche droite)',
        navHint: 'Navigation : Touches ← / → pour parcourir • Échap pour fermer',
    },
    en: {
        closeAria: 'Close the viewer',
        closeTitle: 'Close (Esc)',
        prevAria: 'Previous photo',
        prevTitle: 'Previous (Left arrow)',
        nextAria: 'Next photo',
        nextTitle: 'Next (Right arrow)',
        navHint: 'Navigation: ← / → to browse • Esc to close',
    },
};

for (const rel of ['messages/fr.json', 'messages/en.json']) {
    const path = here(rel);
    const locale = rel.includes('en.json') ? 'en' : 'fr';
    const catalog = JSON.parse(readFileSync(path, 'utf8'));
    const hadModal = Boolean(catalog.applicationModal);
    const hadLightbox = Boolean(catalog.lightbox);
    catalog.applicationModal = APPLICATION_MODAL[locale];
    catalog.lightbox = LIGHTBOX[locale];
    if (!dry) writeFileSync(path, JSON.stringify(catalog, null, 4) + '\n');
    console.log(
        `${rel} : applicationModal ${hadModal ? 'remplacé' : 'ajouté'}, lightbox ${hadLightbox ? 'remplacé' : 'ajouté'}`
    );
}

if (dry) console.log('Mode --dry : aucun fichier écrit.');
