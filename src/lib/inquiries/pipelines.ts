/**
 * Pipelines de la page Contact — catalogue canonique des parcours et de leurs étapes.
 *
 * Couche « Domaine » (`AGENTS.md` § 1) : fonctions pures, aucun React, aucun accès réseau.
 *
 * Pourquoi : la page Contact sert de **pont entre les projets** du campus
 * (formation, production/tournage, événementiel & team building, presse). Un
 * tournage n'est ni « admis » ni « refusé » : chaque parcours a ses propres
 * étapes. Le vocabulaire d'admission est donc réservé au pipeline `formation`.
 *
 * Stockage (décision du 2026-09-29) : l'**étape** vit dans la colonne
 * `site_inquiries.status` (TEXT, sans contrainte SQL) et le **pipeline** dans
 * `metadata.pipeline` — aucune migration nécessaire, le pipe par défaut étant
 * `formation` pour les dossiers existants.
 */

export const PIPELINE_IDS = ['formation', 'production', 'evenement', 'presse'] as const;
export type PipelineId = (typeof PIPELINE_IDS)[number];

/** Tons alignés sur `CockpitBadge` — un seul vocabulaire de couleur. */
export type StageTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

export interface PipelineStage {
    id: string;
    label: string;
    tone: StageTone;
    /** Étape de clôture : le dossier ne progresse plus. */
    terminal?: boolean;
    /** Clôture défavorable (dossier non retenu / écarté). */
    negative?: boolean;
    /**
     * Étape à laquelle la personne **participe** réellement à un stage ou à une
     * formation. Règle projet : dès ce moment, elle doit avoir un profil CUC Sign
     * (voir `requiresProfileFor`).
     */
    participates?: boolean;
}

export interface ChecklistStep {
    id: string;
    label: string;
}

export interface Pipeline {
    id: PipelineId;
    label: string;
    /** Résumé du parcours, affiché dans le sélecteur. */
    description: string;
    /** `true` pour un parcours d'admission (vocabulaire admis/refusé légitime). */
    admission: boolean;
    stages: readonly PipelineStage[];
    checklist: readonly ChecklistStep[];
    /**
     * Verrou de progression : atteindre `stageId` exige que `requires` ait été
     * enregistré au préalable (voir `canSelectStage`).
     */
    gate?: { stageId: string; requires: string; reason: string };
}

/* ------------------------------------------------------------------ */
/* Le verrou Découverte → Cursus Pro                                   */
/* ------------------------------------------------------------------ */

/** Étape du verdict favorable rendu à l'issue de la session Découverte. */
export const DISCOVERY_VALIDATED_STAGE = 'decouverte_validee';

/** Étape d'entrée dans le cursus long, conditionnée au verdict Découverte. */
export const LONG_PROGRAM_STAGE = 'admis';

/* ------------------------------------------------------------------ */
/* Catalogue                                                           */
/* ------------------------------------------------------------------ */

const FORMATION: Pipeline = {
    id: 'formation',
    label: 'Formation & Admissions',
    description: 'Parcours d’admission : cursus pro, stages et prises en charge.',
    admission: true,
    stages: [
        { id: 'recue', label: 'Demande reçue', tone: 'accent' },
        { id: 'qualification', label: 'Qualification en cours', tone: 'warning' },
        {
            id: 'decouverte_planifiee',
            label: 'Découverte planifiée',
            tone: 'neutral',
            participates: true,
        },
        {
            id: 'decouverte_en_cours',
            label: 'Découverte en cours',
            tone: 'neutral',
            participates: true,
        },
        {
            id: DISCOVERY_VALIDATED_STAGE,
            label: 'Découverte validée',
            tone: 'accent',
            participates: true,
        },
        {
            id: LONG_PROGRAM_STAGE,
            label: 'Admis — Cursus Pro',
            tone: 'success',
            terminal: true,
            participates: true,
        },
        { id: 'refuse', label: 'Non retenu', tone: 'danger', terminal: true, negative: true },
        { id: 'archive', label: 'Archivé', tone: 'neutral', terminal: true },
    ],
    gate: {
        stageId: LONG_PROGRAM_STAGE,
        requires: DISCOVERY_VALIDATED_STAGE,
        reason:
            'Le cursus long n’est ouvert qu’après validation de la session Découverte (12 jours).',
    },
    checklist: [
        { id: 'contact', label: '1. Premier contact téléphonique effectué' },
        { id: 'dossier', label: '2. Dossier & certificat médical reçus' },
        { id: 'financement', label: '3. Financement validé (AFDAS / Personnel)' },
        { id: 'decouverte', label: '4. Session Découverte planifiée' },
        { id: 'verdict', label: '5. Verdict Découverte rendu par la commission' },
        { id: 'convocation', label: '6. Convocation / contrat officiel envoyé' },
    ],
};

const PRODUCTION: Pipeline = {
    id: 'production',
    label: 'Production & Tournage',
    description: 'Demandes de productions : cascades, coordination, action design.',
    admission: false,
    stages: [
        { id: 'recue', label: 'Brief reçu', tone: 'accent' },
        { id: 'qualification', label: 'Qualification & échange', tone: 'warning' },
        { id: 'devis_envoye', label: 'Devis / proposition envoyée', tone: 'neutral' },
        { id: 'conclu', label: 'Conclu — tournage planifié', tone: 'success', terminal: true },
        { id: 'ecarte', label: 'Écarté', tone: 'danger', terminal: true, negative: true },
        { id: 'archive', label: 'Archivé', tone: 'neutral', terminal: true },
    ],
    checklist: [
        { id: 'brief', label: '1. Brief technique reçu (scènes, durées, contraintes)' },
        { id: 'budget', label: '2. Budget ou fourchette cadre identifié' },
        { id: 'dates', label: '3. Dates de tournage confirmées' },
        { id: 'lieu', label: '4. Lieu de tournage confirmé' },
        { id: 'devis', label: '5. Devis envoyé et accusé de réception' },
    ],
};

const EVENEMENT: Pipeline = {
    id: 'evenement',
    label: 'Événementiel & Team Building',
    description: 'Prestations, shows, animations airbag et cohésion d’équipe.',
    admission: false,
    stages: [
        { id: 'recue', label: 'Demande reçue', tone: 'accent' },
        { id: 'qualification', label: 'Qualification & échange', tone: 'warning' },
        { id: 'devis_envoye', label: 'Devis envoyé', tone: 'neutral' },
        { id: 'conclu', label: 'Conclu — prestation planifiée', tone: 'success', terminal: true },
        { id: 'ecarte', label: 'Écarté', tone: 'danger', terminal: true, negative: true },
        { id: 'archive', label: 'Archivé', tone: 'neutral', terminal: true },
    ],
    checklist: [
        { id: 'brief', label: '1. Format demandé précisé (show, atelier, animation)' },
        { id: 'effectif', label: '2. Effectif et publics confirmés' },
        { id: 'date', label: '3. Date et lieu confirmés' },
        { id: 'devis', label: '4. Devis envoyé et accepté' },
    ],
};

const PRESSE: Pipeline = {
    id: 'presse',
    label: 'Presse & Médias',
    description: 'Demandes de tournage média, interviews et partenariats de diffusion.',
    admission: false,
    stages: [
        { id: 'recue', label: 'Demande reçue', tone: 'accent' },
        { id: 'qualification', label: 'Échange en cours', tone: 'warning' },
        { id: 'traitee', label: 'Réponse apportée', tone: 'success', terminal: true },
        { id: 'archive', label: 'Archivé', tone: 'neutral', terminal: true },
    ],
    checklist: [
        { id: 'demande', label: '1. Nature de la demande qualifiée (interview, reportage)' },
        { id: 'angle', label: '2. Angle et média identifiés' },
        { id: 'reponse', label: '3. Réponse ou autorisation transmise' },
    ],
};

export const PIPELINE_CATALOG: readonly Pipeline[] = [FORMATION, PRODUCTION, EVENEMENT, PRESSE];

const PIPELINE_BY_ID: Record<PipelineId, Pipeline> = {
    formation: FORMATION,
    production: PRODUCTION,
    evenement: EVENEMENT,
    presse: PRESSE,
};

/** Pipeline par défaut : celui des dossiers existants. */
export const DEFAULT_PIPELINE_ID: PipelineId = 'formation';

/* ------------------------------------------------------------------ */
/* Résolution des valeurs héritées                                     */
/* ------------------------------------------------------------------ */

/**
 * Correspondance des anciens statuts (`nouveau`, `en_cours`, `admis`,
 * `refuse`, `archive`) vers les étapes du catalogue.
 */
const LEGACY_STAGE_MAP: Record<string, string> = {
    nouveau: 'recue',
    en_cours: 'qualification',
    admis: LONG_PROGRAM_STAGE,
    refuse: 'refuse',
    archive: 'archive',
};

export function isPipelineId(value: unknown): value is PipelineId {
    return typeof value === 'string' && (PIPELINE_IDS as readonly string[]).includes(value);
}

/** Pipeline par identifiant, avec repli sur le pipeline par défaut. */
export function getPipeline(value: unknown): Pipeline {
    return isPipelineId(value) ? PIPELINE_BY_ID[value] : PIPELINE_BY_ID[DEFAULT_PIPELINE_ID];
}

/** Première étape d'un pipeline (celle d'un dossier qui arrive). */
export function firstStageOf(pipeline: Pipeline): PipelineStage {
    return pipeline.stages[0];
}

/** Étape résolue depuis une valeur stockée (héritée ou non), sinon première étape. */
export function resolveStage(pipeline: Pipeline, rawStage: unknown): PipelineStage {
    const candidate = typeof rawStage === 'string' ? rawStage : '';
    const mapped = LEGACY_STAGE_MAP[candidate] ?? candidate;
    return (
        pipeline.stages.find((stage) => stage.id === mapped) ?? firstStageOf(pipeline)
    );
}

export function isTerminalStage(stage: PipelineStage): boolean {
    return stage.terminal === true;
}

/** Étapes proposées dans un sélecteur (les clôtures restent accessibles). */
export function stageOptions(pipeline: Pipeline): readonly PipelineStage[] {
    return pipeline.stages;
}

/* ------------------------------------------------------------------ */
/* Garde-fou de progression                                            */
/* ------------------------------------------------------------------ */

export interface StageChangeInput {
    pipeline: Pipeline;
    fromStageId: string;
    toStageId: string;
    /** `true` si le verdict favorable de la session Découverte est enregistré. */
    discoveryValidated?: boolean;
}

export type StageChangeDecision = { allowed: true } | { allowed: false; reason: string };

/**
 * Autorise ou refuse un changement d'étape.
 *
 * Seul verrou métier à ce jour : l'entrée dans le cursus long (`admis`) exige
 * le verdict favorable de la session Découverte (12 jours). Toute autre
 * correction de dossier reste permise — l'équipe doit pouvoir rattraper une
 * erreur de saisie.
 */
export function canSelectStage({
    pipeline,
    fromStageId,
    toStageId,
    discoveryValidated = false,
}: StageChangeInput): StageChangeDecision {
    const target = pipeline.stages.find((stage) => stage.id === toStageId);
    if (!target) {
        return { allowed: false, reason: `Étape inconnue pour ce pipeline : ${toStageId}.` };
    }
    if (toStageId === fromStageId) return { allowed: true };

    const gate = pipeline.gate;
    if (gate && toStageId === gate.stageId && !discoveryValidated) {
        return { allowed: false, reason: gate.reason };
    }

    return { allowed: true };
}

/* La lecture d'un dossier (pipeline porté par les métadonnées, verdict,
   libellés, participation) vit dans `./pipeline-read` — un seul rôle par
   module : ici le catalogue, là la lecture. */
