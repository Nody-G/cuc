import type { StuntProgram } from '@/types';
import type { SiteInquiry } from '@/lib/data/site-service';

export type ProgramSession = StuntProgram['nextSessions'][number];

export type SessionStatus = 'ouvert' | 'dernières places' | 'complet' | 'bientôt';

/** Statuts proposés à la création d'une session (pas de « bientôt » manuel). */
export type NewSessionStatus = Exclude<SessionStatus, 'bientôt'>;

export const STATUS_COLORS: Record<string, string> = {
    complet: 'bg-red-500/10 text-red-400 border-red-500/20',
    'dernières places': 'bg-yellow-500/10 text-[#FFE500] border-yellow-500/20',
    ouvert: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    bientôt: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

/** Dossiers candidats rattachés à une session (programme + date), et admis. */
export function countSessionCandidates(
    inquiries: SiteInquiry[] | undefined,
    program: StuntProgram,
    sessionDate: string
): { total: number; admitted: number } {
    const matchingCandidates = (inquiries || []).filter((i) => {
        const matchesProg =
            i.program_id === program.id ||
            i.program_title?.toLowerCase().includes(program.title.toLowerCase());
        const matchesDate =
            !i.session_date ||
            sessionDate.includes(i.session_date) ||
            i.session_date.includes(sessionDate);
        return matchesProg && matchesDate;
    });

    const admitted = matchingCandidates.filter((c) => c.status === 'admis').length;
    return { total: matchingCandidates.length, admitted };
}

/** Couleur de la jauge d'effectifs CUC Sign (rouge si complet, ambre si seuil proche). */
export function seatBarColor(booked: number, max: number): string {
    if (booked >= max) return 'bg-rose-500';
    if (max - booked <= 3) return 'bg-amber-400';
    return 'bg-emerald-400';
}
