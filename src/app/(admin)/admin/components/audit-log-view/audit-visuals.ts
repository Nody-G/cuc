import type { ComponentType } from 'react';
import {
    Activity,
    Calendar,
    Database,
    FileText,
    Film,
    Handshake,
    Image as ImageIcon,
    Inbox,
    Layers,
    MapPin,
    RefreshCw,
    Settings,
    ShieldCheck,
    Sparkles,
    User,
    Users,
} from 'lucide-react';

export interface ActionVisual {
    icon: ComponentType<{ className?: string }>;
    tone: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
}

/**
 * Associe une action d'audit à une icône et une tonalité sobres.
 * Aucun libellé marketing : uniquement la nature technique de l'action.
 */
export function resolveActionVisual(action: string): ActionVisual {
    const a = action.toLowerCase();
    if (a.includes('suppress') || a.includes('delete') || a.includes('remove')) {
        return { icon: Database, tone: 'danger' };
    }
    if (a.includes('publi') || a.includes('publish')) {
        return { icon: ShieldCheck, tone: 'success' };
    }
    if (a.includes('restaur') || a.includes('restore')) {
        return { icon: RefreshCw, tone: 'warning' };
    }
    if (a.includes('connexion') || a.includes('login') || a.includes('auth')) {
        return { icon: User, tone: 'accent' };
    }
    if (a.includes('création') || a.includes('creation') || a.includes('ajout')) {
        return { icon: Sparkles, tone: 'accent' };
    }
    if (a.includes('modif') || a.includes('update') || a.includes('édition')) {
        return { icon: FileText, tone: 'neutral' };
    }
    return { icon: Activity, tone: 'neutral' };
}

export interface EntityVisual {
    icon: ComponentType<{ className?: string }>;
}

/**
 * Associe une entité d'audit à une icône de domaine.
 *
 * Retourne un objet (et non directement le composant) : un tag JSX issu d'un
 * appel de fonction est refusé par la règle React Compiler `static-components`
 * (« Cannot create components during render ») ; l'accès par propriété est sûr.
 */
export function resolveEntityVisual(entity: string): EntityVisual {
    const e = entity.toLowerCase();
    if (e.includes('page')) return { icon: FileText };
    if (e.includes('média') || e.includes('media') || e.includes('image')) return { icon: ImageIcon };
    if (e.includes('équipe') || e.includes('equipe') || e.includes('team') || e.includes('coach')) return { icon: Users };
    if (e.includes('film')) return { icon: Film };
    if (e.includes('session')) return { icon: Calendar };
    if (e.includes('partenaire') || e.includes('partner')) return { icon: Handshake };
    if (e.includes('discipline')) return { icon: Layers };
    if (e.includes('campus') || e.includes('zone') || e.includes('poi')) return { icon: MapPin };
    if (e.includes('candidature') || e.includes('inquiry') || e.includes('lead')) return { icon: Inbox };
    if (e.includes('param') || e.includes('setting') || e.includes('navigation') || e.includes('footer')) return { icon: Settings };
    return { icon: Activity };
}
