import type {
    SitePageContent,
    SitePartner,
    SiteEvent,
    SiteSettings,
} from '@/lib/data/site-service';
import type { DoubledCelebrity, FilmCredit, Instructor } from '@/types';
import type {
    NavigationStructure,
    FooterStructure,
    SiteSocialLink,
} from '@/data/navigation';

export type ContentIssueSeverity = 'error' | 'warning' | 'info';

export type ContentIssueKind =
    | 'broken-link'
    | 'missing-image'
    | 'orphan'
    | 'seo'
    | 'incomplete-roles';

/**
 * Familles exclues du calcul du score de santé.
 *
 * `incomplete-roles` recense des **compléments éditoriaux à saisir** (rôles et
 * doublures) : ce n'est ni une panne ni un défaut de la vitrine. Les compter
 * ferait chuter le score technique à mesure que la liste de travail grandit,
 * alors que le contenu publié, lui, est sain.
 */
export const SCORE_EXEMPT_KINDS: readonly ContentIssueKind[] = ['incomplete-roles'];

export interface ContentIssue {
    id: string;
    kind: ContentIssueKind;
    severity: ContentIssueSeverity;
    /** Entité concernée (ex. « Page », « Navigation », « Partenaire »). */
    scope: string;
    /** Libellé lisible de l'élément en cause. */
    label: string;
    /** Description factuelle du problème. */
    message: string;
    /** Valeur fautive (URL, chemin d'image, slug…). */
    value?: string;
    /** Piste de correction concrète. */
    hint?: string;
}

export interface ContentHealthInput {
    pages: SitePageContent[];
    navigation?: NavigationStructure | null;
    footer?: FooterStructure | null;
    socialLinks?: SiteSocialLink[];
    partners?: SitePartner[];
    events?: SiteEvent[];
    settings?: SiteSettings | null;
    /** Films du catalogue (rôles CUC par coach, coordonnateur, doublures). */
    films?: FilmCredit[];
    /** Équipe : comédiens doublés déclarés par chaque coach. */
    team?: Instructor[];
    /** Catalogue des comédiens doublés : sert à détecter une fiche manquante. */
    celebrities?: DoubledCelebrity[];
    /** Chemins de fichiers locaux réellement présents dans `public/`. */
    knownPublicAssets?: string[];
}

export interface ContentHealthReport {
    issues: ContentIssue[];
    counts: Record<ContentIssueKind, number>;
    severityCounts: Record<ContentIssueSeverity, number>;
    /** Score de santé 0–100 (100 = aucun problème). */
    score: number;
    checkedAt: string;
}

/** Collecteur d'anomalies partagé par les vérificateurs. */
export type PushIssue = (issue: Omit<ContentIssue, 'id'>) => void;

export const SEVERITY_WEIGHT: Record<ContentIssueSeverity, number> = {
    error: 10,
    warning: 4,
    info: 1,
};
