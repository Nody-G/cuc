import {
    BookOpen,
    HelpCircle,
    Layers,
    Sparkles,
    Workflow,
    type LucideIcon,
} from 'lucide-react';
import type { HelpTabDefinition, HelpTabId } from './help-content.types';

export interface HelpTabConfigItem extends HelpTabDefinition {
    icon: LucideIcon;
}

export const HELP_TABS: readonly HelpTabConfigItem[] = [
    {
        id: 'guide',
        label: 'Guide & Raccourcis',
        shortLabel: 'Guide',
        description: 'Démarrage rapide, navigation, rôles et gestes du quotidien.',
        icon: BookOpen,
        badge: 'Cockpit',
    },
    {
        id: 'application',
        label: 'Dossier Application',
        shortLabel: 'Application',
        description: 'Cartographie des 15 pages, 27 écrans Cockpit et architecture technique.',
        icon: Layers,
        badge: 'Architecture',
    },
    {
        id: 'methodologie',
        label: 'Méthodologie & Vibe Coding',
        shortLabel: 'Vibe Coding',
        description: 'Antigravity, Gemini, DeepSeek, GitHub, Vercel et le système de règles.',
        icon: Sparkles,
        badge: 'Coulisses',
    },
    {
        id: 'cuc-sign',
        label: 'CUC Sign & Vision d’Avenir',
        shortLabel: 'CUC Sign',
        description: 'Plateforme école, passerelle de données et trajectoire 3-5 ans.',
        icon: Workflow,
        badge: 'Futur',
    },
    {
        id: 'faq',
        label: 'FAQ & Réponses Clés',
        shortLabel: 'FAQ',
        description: 'Coûts réels, propriété intellectuelle, autonomie et sécurité pour Lucas.',
        icon: HelpCircle,
        badge: 'Questions',
    },
] as const;

export const DEFAULT_HELP_TAB: HelpTabId = 'guide';
