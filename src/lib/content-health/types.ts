import type {
    SitePageContent,
    SitePartner,
    SiteEvent,
    SiteSettings,
} from '@/lib/data/site-service';
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
    | 'seo';

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
