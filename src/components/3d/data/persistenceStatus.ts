import { CampusSaveStatus } from '../types/campus3d.types';

export interface SaveStatusPresentation {
    /** Libellé court, factuel. */
    label: string;
    /** Détail affiché en dessous (message d'erreur réel, ou horodatage). */
    detail?: string;
    /** Intention visuelle, sans décoration superflue. */
    tone: 'neutral' | 'progress' | 'success' | 'error';
}

/** Heure locale au format HH:MM:SS. */
function formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString('fr-FR', { hour12: false });
}

/**
 * Traduit l'état de persistance en texte affichable.
 *
 * Deux exigences :
 * 1. Le message d'erreur réel est repris tel quel — masquer la cause d'un
 *    échec d'écriture rend le diagnostic impossible côté Cockpit.
 * 2. La **destination** est annoncée explicitement. Un studio ouvert depuis le
 *    site public (`?studio=1`) n'écrit que dans le navigateur courant : sans
 *    cette mention, on croit avoir modifié le plan partagé alors que le
 *    Cockpit continue d'afficher autre chose.
 */
export function describeSaveStatus(status: CampusSaveStatus | undefined): SaveStatusPresentation {
    const backend = status?.backend ?? 'database';
    const isLocal = backend === 'local';

    if (!status || status.state === 'idle') {
        return {
            label: isLocal ? 'Écritures locales (non partagées)' : 'Aucune modification en attente',
            detail:
                status?.savedAt !== undefined
                    ? `Dernier enregistrement à ${formatTime(status.savedAt)}`
                    : isLocal
                        ? 'Ce studio a été ouvert depuis le site public : les positions restent dans ce navigateur.'
                        : undefined,
            tone: 'neutral',
        };
    }

    if (status.state === 'saving') {
        return {
            label: isLocal ? 'Enregistrement local…' : 'Enregistrement…',
            tone: 'progress',
        };
    }

    if (status.state === 'error') {
        return {
            label: isLocal ? 'Échec de l’enregistrement local' : 'Échec de l’enregistrement',
            detail:
                status.error ??
                (isLocal
                    ? 'Stockage local indisponible ou quota atteint.'
                    : 'Cause inconnue — vérifiez la connexion Supabase du Cockpit.'),
            tone: 'error',
        };
    }

    if (status.warning) {
        return {
            label: isLocal ? 'Enregistré localement' : 'Enregistré dans Supabase',
            detail: `Attention : ${status.warning}`,
            tone: 'success',
        };
    }

    return {
        label: isLocal ? 'Enregistré localement' : 'Enregistré dans Supabase',
        detail: isLocal
            ? 'Non partagé : le Cockpit et les autres navigateurs ne verront pas ces positions.'
            : status.savedAt !== undefined
                ? `Plan partagé, mis à jour à ${formatTime(status.savedAt)}`
                : 'Plan partagé mis à jour.',
        tone: 'success',
    };
}

/** Classes de couleur associées à chaque intention. */
export const SAVE_TONE_CLASSES: Record<SaveStatusPresentation['tone'], string> = {
    neutral: 'text-zinc-400 border-zinc-700',
    progress: 'text-[#00e5ff] border-[#00e5ff]/60',
    success: 'text-emerald-400 border-emerald-500/50',
    error: 'text-red-400 border-red-500/60',
};
