import type { ComponentType } from 'react';
import { HomeView } from '../HomeView';
import AnimationsAirbagParkourPage from '../animations-airbag-parkour/page';
import ContactCucPage from '../contact-cuc/page';
import CucEventsAgencePage from '../cuc-events-agence/page';
import CucTeamCascadeurPage from '../cuc-team-cascadeur/page';
import EquipeCascadeursProPage from '../equipe-cascadeurs-pro/page';
import FormationDeCascadeurPage from '../formation-de-cascadeur/page';
import PartenairesPage from '../partenaires/page';
import SpectaclesCascadeursYamakasiPage from '../spectacles-cascadeurs-yamakasi/page';
import StagesCascadesParkour2Page from '../stages-cascades-parkour-2/page';
import StuntWorkshopCucPage from '../stunt-workshop-cuc/page';
import TeamBuildingCascadesPage from '../team-building-cascades/page';
import VideosCascadeurPage from '../videos-cascadeur/page';
import VisiteGuideePage from '../visite-guidee/page';
import VisiteVirtuellePage from '../visite-virtuelle/page';

/**
 * ==============================================================================
 * CUC — Registre des écrans d'aperçu
 * ==============================================================================
 * L'aperçu éditeur (`/preview/<slug>`) rend les **mêmes composants** que les
 * pages publiques — jamais une reconstruction par sections (l'incident de la
 * « route fantôme » : un aperçu qui rejouait les sections de l'accueil). Un slug
 * absent d'ici est un 404 : aucune page qui n'existe pas.
 *
 * Contrat de couverture : chaque page proposée par l'éditeur
 * (`SITE_PAGES_OPTIONS`) doit avoir son entrée — vérifié par
 * `preview-url.test.ts`.
 */
export const PREVIEW_SCREENS: Record<string, ComponentType> = {
    '/': HomeView,
    '/animations-airbag-parkour': AnimationsAirbagParkourPage,
    '/contact-cuc': ContactCucPage,
    '/cuc-events-agence': CucEventsAgencePage,
    '/cuc-team-cascadeur': CucTeamCascadeurPage,
    '/equipe-cascadeurs-pro': EquipeCascadeursProPage,
    '/formation-de-cascadeur': FormationDeCascadeurPage,
    '/partenaires': PartenairesPage,
    '/spectacles-cascadeurs-yamakasi': SpectaclesCascadeursYamakasiPage,
    '/stages-cascades-parkour-2': StagesCascadesParkour2Page,
    '/stunt-workshop-cuc': StuntWorkshopCucPage,
    '/team-building-cascades': TeamBuildingCascadesPage,
    '/videos-cascadeur': VideosCascadeurPage,
    '/visite-guidee': VisiteGuideePage,
    '/visite-virtuelle': VisiteVirtuellePage,
};
