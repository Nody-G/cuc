/**
 * Façade des Server Actions du Cockpit — l’implémentation est découpée dans
 * `./actions/**` (un module par domaine, règle SRP `AGENTS.md` § 1-2).
 *
 * Surface publique strictement identique : tous les imports existants
 * (`@/app/(admin)/admin/actions`) restent valides. **Aucune directive
 * `'use server'` ici** : un fichier marqué n'accepte que des fonctions async
 * exportées (les ré-exports y sont refusés par le compilateur — vérifié au
 * build). Les modules d’origine portent la directive, la référence d’action
 * est résolue à la source pour les composants clients.
 */

export { checkIsAdmin, getCurrentUserProfile, loginAdminAction, listCockpitUsers, updateUserRole } from './actions/auth';
export { revalidateSite } from './actions/revalidate';
export { updateSessionStatus, createSession, deleteSession, upsertProgram, deleteProgram } from './actions/sessions';
export { updateAnnouncement } from './actions/announcements';
export { upsertTeamMember, deleteTeamMember } from './actions/team';
export { upsertFilm, deleteFilm } from './actions/films';
export { upsertSiteTranslation, getSiteTranslation, deleteSiteTranslation } from './actions/translations';
export type { SiteTranslationReadResult } from './actions/translations';
export { upsertPageContent, setPagePublishState, resetPageContentToDefault } from './actions/pages';
export { upsertPartner, deletePartner, upsertEvent, deleteEvent } from './actions/partners-events';
export { updateSiteSettings, loadMicrocopyCatalog, saveMicrocopyOverrides } from './actions/settings';
export { upsertDiscipline, deleteDiscipline, upsertCampusPOI, deleteCampusPOI } from './actions/campus';
export { upsertCampusPlacements3D, probeCampusPlacements3D } from './actions/campus-3d';
export { logAuditEvent } from './actions/audit';
export { uploadMediaFile, listMediaFolder, listMediaTree, getMediaReferences } from './actions/media';
export { createMediaFolder, moveMediaObjects, deleteMediaObjects, listMediaFiles, deleteMediaFile } from './actions/media-organize';
export { submitInquiry, updateInquiryStatus, updateInquiryNotes, deleteInquiry } from './actions/inquiries';
export { convertInquiryToCucSignStudent } from './actions/inquiries-conversion';
export { syncSessionsSeatCountsFromCucSign } from './actions/sessions-sync';
export { exportFullSiteBackup, restoreFullSiteBackup } from './actions/backup';
export { getSystemHealth } from './actions/health';
export type { HealthState, HealthMetric, SystemHealthReport } from './actions/health';
