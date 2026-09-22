/**
 * Métadonnées d'affichage du diagnostic : catégories d'anomalies, sévérités
 * (icône + ton) et tonalité du score global.
 */

import {
    Link2Off,
    ImageOff,
    Unlink,
    SearchCheck,
    AlertTriangle,
    AlertOctagon,
    Info,
} from 'lucide-react';
import type { ContentIssueKind, ContentIssueSeverity } from '@/lib/content-health';

export type HealthTab = 'pages' | 'navigation' | 'footer' | 'social' | 'partners' | 'events';

export const KIND_META: Record<
    ContentIssueKind,
    { label: string; icon: React.ComponentType<{ className?: string }>; tab: HealthTab }
> = {
    'broken-link': { label: 'Liens cassés', icon: Link2Off, tab: 'navigation' },
    'missing-image': { label: 'Images manquantes', icon: ImageOff, tab: 'pages' },
    orphan: { label: 'Contenu orphelin', icon: Unlink, tab: 'navigation' },
    seo: { label: 'Métadonnées SEO', icon: SearchCheck, tab: 'pages' },
};

export const SEVERITY_META: Record<
    ContentIssueSeverity,
    { label: string; icon: React.ComponentType<{ className?: string }>; tone: 'danger' | 'warning' | 'neutral' }
> = {
    error: { label: 'Critique', icon: AlertOctagon, tone: 'danger' },
    warning: { label: 'À corriger', icon: AlertTriangle, tone: 'warning' },
    info: { label: 'Optimisation', icon: Info, tone: 'neutral' },
};

export function scoreTone(score: number): 'success' | 'warning' | 'danger' {
    if (score >= 85) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
}
