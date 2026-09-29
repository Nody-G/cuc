/**
 * Historique d'une **personne** — par opposition à un dossier.
 *
 * Couche « Domaine » (`AGENTS.md` § 1) : fonctions pures, aucun accès réseau.
 *
 * Deux cas d'usage réels :
 *  1. une candidature **recalée** n'empêche pas de re-postuler plus tard ;
 *  2. une session **Découverte non suivie** du cursus long doit rester connue
 *     « pour l'avenir », même si le dossier est clos.
 *
 * Aucun stockage supplémentaire n'est nécessaire : l'historique se **dérive**
 * des dossiers déjà conservés (`site_inquiries` + miroir), regroupés par
 * adresse email. Un second passage produit une seconde ligne portant le même
 * email — le passé est donc là, sans table ni synchronisation à maintenir.
 */

import {
    LONG_PROGRAM_STAGE,
    isTerminalStage,
    resolveStage,
    type PipelineId,
} from './pipelines';
import { isNegativeStage, pipelineOfMetadata } from './pipeline-read';

/** Vue minimale d'un dossier — assez pour construire un historique. */
export interface ApplicantDossier {
    id: string;
    email: string;
    status: string;
    created_at: string;
    updated_at?: string;
    metadata?: unknown;
}

export interface ApplicantDecision {
    /** Horodatage ISO de la décision (dernière mise à jour du dossier). */
    at: string;
    /** Identifiant du dossier concerné. */
    dossierId: string;
    pipeline: PipelineId;
    stage: string;
    /** Libellé de l'étape, lu dans le catalogue du pipeline. */
    label: string;
    /** `true` pour une clôture défavorable (non retenu, écarté). */
    negative: boolean;
}

export type DiscoveryVerdictValue = 'en_attente' | 'favorable' | 'defavorable';

export interface ApplicantHistory {
    email: string;
    /** Nombre de dossiers déposés par cette personne. */
    applications: number;
    firstAt: string | null;
    lastAt: string | null;
    /** Clôtures déjà rendues, la plus récente en tête. */
    decisions: ApplicantDecision[];
    /** Dernier verdict Découverte connu (pipeline Formation), `null` si aucune. */
    discoveryVerdict: DiscoveryVerdictValue | null;
    /** `true` si la personne a déjà été admise au cursus long. */
    longProgramAdmitted: boolean;
    /** `true` si une Découverte a été suivie sans déboucher sur le cursus long. */
    discoveryNotRetained: boolean;
}

/**
 * Normalise une adresse pour regrouper une même personne.
 *
 * Contrairement à la connexion du Cockpit, **on n'ajoute aucun domaine** : un
 * candidat écrit depuis l'adresse qu'il veut. On se contente de comparer ce qui
 * est comparable (espaces, casse).
 */
export function normalizeApplicantEmail(value: string | null | undefined): string {
    return (value ?? '').trim().toLowerCase();
}

/** Regroupe des dossiers par personne (email normalisé). */
export function groupByApplicant<T extends { email: string }>(
    entries: readonly T[]
): Map<string, T[]> {
    const groups = new Map<string, T[]>();
    for (const entry of entries) {
        const key = normalizeApplicantEmail(entry.email);
        if (!key) continue;
        const current = groups.get(key);
        if (current) current.push(entry);
        else groups.set(key, [entry]);
    }
    return groups;
}

export function isReturningApplicant(history: ApplicantHistory): boolean {
    return history.applications > 1;
}

/** Au moins une décision déjà rendue sur un dossier antérieur. */
export function hasPreviousDecisions(history: ApplicantHistory): boolean {
    return history.decisions.length > 0;
}

/**
 * Dossiers **antérieurs** de la même personne (hors dossier courant), du plus
 * récent au plus ancien.
 */
export function previousDossiers<T extends ApplicantDossier>(
    entries: readonly T[],
    currentId: string
): T[] {
    const current = entries.find((entry) => entry.id === currentId);
    if (!current) return [];
    const key = normalizeApplicantEmail(current.email);
    if (!key) return [];
    return entries
        .filter(
            (entry) => entry.id !== currentId && normalizeApplicantEmail(entry.email) === key
        )
        .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
}

function readDiscoveryVerdict(metadata: unknown): DiscoveryVerdictValue | null {
    const verdict =
        typeof metadata === 'object' && metadata !== null
            ? (metadata as { discovery_verdict?: unknown }).discovery_verdict
            : undefined;
    if (verdict === 'favorable' || verdict === 'defavorable' || verdict === 'en_attente') {
        return verdict;
    }
    return null;
}

/** Construit l'historique d'une personne à partir de tous ses dossiers. */
export function buildApplicantHistory(
    email: string,
    dossiers: readonly ApplicantDossier[]
): ApplicantHistory {
    const key = normalizeApplicantEmail(email);
    const own = dossiers
        .filter((dossier) => normalizeApplicantEmail(dossier.email) === key)
        .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));

    const decisions: ApplicantDecision[] = [];
    let longProgramAdmitted = false;
    let discoveryVerdict: DiscoveryVerdictValue | null = null;

    for (const dossier of own) {
        const pipeline = pipelineOfMetadata(dossier.metadata);
        const stage = resolveStage(pipeline, dossier.status);
        const stamp = dossier.updated_at || dossier.created_at;

        if (stage.id === LONG_PROGRAM_STAGE) longProgramAdmitted = true;

        if (pipeline.id === 'formation') {
            const verdict = readDiscoveryVerdict(dossier.metadata);
            if (verdict && verdict !== 'en_attente') discoveryVerdict = verdict;
        }

        if (isTerminalStage(stage)) {
            decisions.push({
                at: stamp,
                dossierId: dossier.id,
                pipeline: pipeline.id,
                stage: stage.id,
                label: stage.label,
                negative: isNegativeStage(pipeline, stage.id),
            });
        }
    }

    decisions.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));

    /**
     * « Découverte non retenue » : soit le verdict le dit, soit une Découverte a
     * bien eu lieu (verdict connu) et le dossier s'est clos défavorablement en
     * Formation. Un simple refus sans Découverte ne suffit pas à l'affirmer.
     */
    const refusedAfterDiscovery =
        discoveryVerdict !== null &&
        decisions.some((decision) => decision.pipeline === 'formation' && decision.negative);
    const discoveryNotRetained = discoveryVerdict === 'defavorable' || refusedAfterDiscovery;

    return {
        email: key,
        applications: own.length,
        firstAt: own[0]?.created_at ?? null,
        lastAt: own[own.length - 1]?.created_at ?? null,
        decisions,
        discoveryVerdict,
        longProgramAdmitted,
        discoveryNotRetained,
    };
}
