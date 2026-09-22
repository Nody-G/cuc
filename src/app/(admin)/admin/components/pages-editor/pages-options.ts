/**
 * Contrats de l'éditeur de pages vitrine : onglets et sélecteur de page.
 * Module pur (aucun JSX) — `AGENTS.md` § 1-2.
 */

/** Onglets de l'éditeur de pages. */
export type PageEditorTab = 'layout' | 'content' | 'preview' | 'seo';

/** Pages vitrine éditables — libellés du sélecteur du Cockpit. */
export const SITE_PAGES_OPTIONS = [
    { label: 'Accueil (/)', value: '/' },
    { label: 'Formation Pro 2 Ans (/formation-de-cascadeur)', value: 'formation-de-cascadeur' },
    { label: 'Stages & Initiations (/stages-cascades-parkour-2)', value: 'stages-cascades-parkour-2' },
    { label: 'Stunt Workshops Masterclass (/stunt-workshop-cuc)', value: 'stunt-workshop-cuc' },
    { label: 'Équipe & Instructeurs (/equipe-cascadeurs-pro)', value: 'equipe-cascadeurs-pro' },
    { label: 'CUC Team & Action Design (/cuc-team-cascadeur)', value: 'cuc-team-cascadeur' },
    { label: 'CUC Events Agence (/cuc-events-agence)', value: 'cuc-events-agence' },
    { label: 'Team Building (/team-building-cascades)', value: 'team-building-cascades' },
    { label: 'Spectacles Yamakasi (/spectacles-cascadeurs-yamakasi)', value: 'spectacles-cascadeurs-yamakasi' },
    { label: 'Animations Airbag (/animations-airbag-parkour)', value: 'animations-airbag-parkour' },
    { label: 'Visite Virtuelle 360° (/visite-virtuelle)', value: 'visite-virtuelle' },
    { label: 'Visite Guidée Campus (/visite-guidee)', value: 'visite-guidee' },
    { label: 'Vidéos & Démos (/videos-cascadeur)', value: 'videos-cascadeur' },
    { label: 'Partenaires & Studios (/partenaires)', value: 'partenaires' },
    { label: 'Contact & Accès (/contact-cuc)', value: 'contact-cuc' },
];
