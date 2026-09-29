'use server';

/**
 * Progression d'un dossier Contact dans son pipeline — Server Actions.
 *
 * Règle SRP : `AGENTS.md` § 1-2. Chaque mutation **lit le dossier** avant
 * d'écrire, applique un garde-fou de domaine (`canSelectStage`,
 * `evaluateReclassification`) puis délègue la persistance à
 * `mutateInquiry` — qui n'annonce le succès que si un dépôt a accepté.
 *
 * Le verrou métier : l'entrée dans le cursus long (`admis`) exige le verdict
 * favorable de la session Découverte (12 jours).
 */

import { mutateInquiry } from './inquiries-mutations';
import { findInquiryRow } from './inquiries-mirror';
import { updateInquiryStatus } from './inquiries';
import { appendReclassification, evaluateReclassification } from '@/lib/inquiries/reclassify';
import { canSelectStage } from '@/lib/inquiries/pipelines';
import {
    isDiscoveryValidated,
    pipelineOfMetadata,
    requiresProfileFor,
    stageLabel,
} from '@/lib/inquiries/pipeline-read';
import { findProfileIdByEmail } from './user-guards';
import { syncApplicantHistoryToProfile } from './applicant-history';
import type { SiteInquiryMetadata } from '@/lib/data/site-service';

const DISCOVERY_VERDICTS = ['en_attente', 'favorable', 'defavorable'] as const;
type DiscoveryVerdict = (typeof DISCOVERY_VERDICTS)[number];

const failureOf = (err: unknown, fallback: string): string =>
    err instanceof Error ? err.message : fallback;

/**
 * Change l'étape d'un dossier, dans les limites de son pipeline.
 *
 * Refuse l'entrée dans le cursus long sans verdict Découverte favorable ;
 * autorise toute autre correction (une équipe doit pouvoir rattraper une saisie).
 */
export async function updateInquiryStage(id: string, stage: string) {
    try {
        const inquiry = await findInquiryRow(id);
        if (!inquiry) return { success: false, error: 'Dossier introuvable.' };

        const pipeline = pipelineOfMetadata(inquiry.metadata);
        const decision = canSelectStage({
            pipeline,
            fromStageId: inquiry.status,
            toStageId: stage,
            discoveryValidated: isDiscoveryValidated(inquiry.metadata),
        });
        if (!decision.allowed) return { success: false, error: decision.reason };

        // Règle projet : participer à un stage ou une formation exige un profil
        // CUC Sign. On ne le crée pas ici — on refuse l'étape en le disant.
        if (requiresProfileFor(pipeline, stage)) {
            const profileId = await findProfileIdByEmail(inquiry.email);
            if (!profileId) {
                return {
                    success: false,
                    error: `L’étape « ${stageLabel(pipeline, stage)} » signifie que la personne participe : son profil CUC Sign doit exister. Créez le compte CUC Sign depuis la fiche avant de poursuivre.`,
                };
            }
        }

        const result = await updateInquiryStatus(id, stage);
        if (result.success) await syncApplicantHistoryToProfile(inquiry.email);
        return result;
    } catch (err: unknown) {
        return { success: false, error: failureOf(err, 'Erreur mise à jour étape') };
    }
}

/**
 * Re-catégorise un dossier vers un autre pipeline (erreur de catégorie du
 * visiteur). Le dossier repart à la première étape du pipeline cible et le
 * motif est conservé dans son historique.
 */
export async function reclassifyInquiry(id: string, targetPipeline: string, reason: string) {
    try {
        const inquiry = await findInquiryRow(id);
        if (!inquiry) return { success: false, error: 'Dossier introuvable.' };

        const decision = evaluateReclassification({
            currentPipeline: inquiry.metadata?.pipeline,
            targetPipeline,
            reason,
            at: new Date().toISOString(),
        });
        if (!decision.allowed) return { success: false, error: decision.reason };

        const history = appendReclassification(
            inquiry.metadata?.reclassifications,
            decision.entry
        );
        const metadata: SiteInquiryMetadata = {
            ...(inquiry.metadata ?? {}),
            pipeline: decision.pipeline,
            reclassifications: history,
        };
        const stamp = new Date().toISOString();

        const result = await mutateInquiry(
            id,
            { status: decision.stage, metadata, updated_at: stamp },
            (entry) => ({ ...entry, status: decision.stage, metadata, updated_at: stamp }),
            {
                action: 'inquiry.reclassify',
                failureAction: 'inquiry.reclassify.failed',
                failureMessage: 'La re-catégorisation n’a pas pu être enregistrée.',
                details: {
                    from: decision.entry.from,
                    to: decision.entry.to,
                    reason: decision.entry.reason,
                },
            }
        );
        if (result.success) await syncApplicantHistoryToProfile(inquiry.email);
        return result;
    } catch (err: unknown) {
        return { success: false, error: failureOf(err, 'Erreur re-catégorisation') };
    }
}

/**
 * Enregistre le verdict de la session Découverte (12 jours) qui conditionne
 * l'accès au cursus long. Réservé au pipeline Formation.
 */
export async function setDiscoveryVerdict(id: string, verdict: string) {
    try {
        if (!(DISCOVERY_VERDICTS as readonly string[]).includes(verdict)) {
            return { success: false, error: 'Verdict Découverte inconnu.' };
        }

        const inquiry = await findInquiryRow(id);
        if (!inquiry) return { success: false, error: 'Dossier introuvable.' };

        const pipeline = pipelineOfMetadata(inquiry.metadata);
        if (pipeline.id !== 'formation') {
            return {
                success: false,
                error: 'Le verdict Découverte ne concerne que le pipeline Formation.',
            };
        }

        const stamp = new Date().toISOString();
        const metadata: SiteInquiryMetadata = {
            ...(inquiry.metadata ?? {}),
            discovery_verdict: verdict as DiscoveryVerdict,
            ...(verdict === 'en_attente' ? {} : { discovery_decided_at: stamp }),
        };

        const result = await mutateInquiry(
            id,
            { metadata, updated_at: stamp },
            (entry) => ({ ...entry, metadata, updated_at: stamp }),
            {
                action: 'inquiry.discovery.verdict',
                failureAction: 'inquiry.discovery.verdict.failed',
                failureMessage: 'Le verdict Découverte n’a pas pu être enregistré.',
                details: { verdict },
            }
        );
        // « Découverte non retenue » doit survivre au dossier : on la verse au
        // profil CUC Sign quand la personne en a un.
        if (result.success) await syncApplicantHistoryToProfile(inquiry.email);
        return result;
    } catch (err: unknown) {
        return { success: false, error: failureOf(err, 'Erreur verdict Découverte') };
    }
}
