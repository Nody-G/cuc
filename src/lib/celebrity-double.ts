/**
 * Attribution d'une doublure CUC à un comédien doublé.
 *
 * Le champ `stuntDoubles` d'un comédien est une **phrase éditoriale** telle
 * qu'elle est publiée (« Doublé par Vincent Bouillon », « Doubled by Vincent
 * Bouillon »). Il n'existe pas de clé étrangère reliant le comédien au membre
 * de l'équipe qui l'a doublé : cette fonction établit le rapprochement par le
 * nom, de façon déterministe et testable, sans jamais inventer de lien.
 *
 * Contrat : si aucun membre de l'équipe ne correspond au texte, `member` vaut
 * `null` et le texte est restitué tel quel. Un lien faux est pire qu'aucun lien.
 */

/** Référence minimale d'un membre de l'équipe CUC. */
export interface TeamNameRef {
    id: string;
    name: string;
}

export interface DoubledBySegment {
    type: 'text' | 'member';
    text: string;
    member?: TeamNameRef;
}

export interface DoubledByParts {
    /**
     * Texte précédant le nom (« Doublé par », « Doubled by »…), **espace de
     * liaison conservé** : le rendu n'a ainsi aucun caractère littéral à écrire
     * dans le JSX (aucune dette de micro-copie).
     */
    prefix: string;
    /** Premier membre CUC reconnu, ou `null` si le texte ne désigne personne de l'équipe. */
    member: TeamNameRef | null;
    /** Nom tel qu'écrit dans la fiche — toujours affiché. */
    name: string;
    /** Texte suivant le nom (ponctuation, précision éventuelle). */
    suffix: string;
    /** Tous les segments découpés (texte brut ou membre CUC cliquable). */
    segments: DoubledBySegment[];
    /** Tous les membres distincts reconnus dans la mention. */
    allMembers: TeamNameRef[];
}

const EMPTY: DoubledByParts = {
    prefix: '',
    member: null,
    name: '',
    suffix: '',
    segments: [],
    allMembers: [],
};

interface Candidate {
    pattern: string;
    member: TeamNameRef;
}

/**
 * Découpe une phrase de doublure et identifie un ou plusieurs membres CUC cités.
 *
 * La correspondance se fait sur le **nom complet** (ou ses variantes reconnues),
 * insensible à la casse. Les correspondances sont ordonnées par position
 * d'apparition pour générer des segments de rendu cliquables pour chaque coach.
 *
 * @param text    Phrase publiée (ex. « Doublé par Jérôme Gaspard & Kefi Abrikh »).
 * @param members Référentiel de l'équipe (id + nom) dans lequel chercher.
 */
export function resolveDoubledBy(text: string, members: readonly TeamNameRef[]): DoubledByParts {
    const raw = (text ?? '').trim();
    if (!raw) return EMPTY;

    const candidates: Candidate[] = [];
    for (const member of members) {
        if (!member?.name?.trim()) continue;
        candidates.push({ pattern: member.name.toLowerCase(), member });
        // Alias courants (variantes orthographiques connues)
        if (member.id === 'kefi-abrikh') {
            candidates.push({ pattern: 'kefy abrikh', member });
            candidates.push({ pattern: 'kefy', member });
            candidates.push({ pattern: 'kefi', member });
        }
    }
    // Les motifs les plus longs sont testés en priorité pour éviter les faux raccourcis
    candidates.sort((a, b) => b.pattern.length - a.pattern.length);

    const haystack = raw.toLowerCase();
    interface Match {
        start: number;
        end: number;
        member: TeamNameRef;
    }
    const matches: Match[] = [];

    for (const candidate of candidates) {
        let pos = 0;
        while ((pos = haystack.indexOf(candidate.pattern, pos)) !== -1) {
            const start = pos;
            const end = pos + candidate.pattern.length;
            pos = end;
            // Évite le chevauchement avec une correspondance plus longue déjà trouvée
            const overlaps = matches.some((m) => Math.max(start, m.start) < Math.min(end, m.end));
            if (!overlaps) {
                matches.push({ start, end, member: candidate.member });
            }
        }
    }

    // Aucun membre de l'équipe reconnu
    if (matches.length === 0) {
        return {
            prefix: '',
            member: null,
            name: raw,
            suffix: '',
            segments: [{ type: 'text', text: raw }],
            allMembers: [],
        };
    }

    // Tri par position dans le texte
    matches.sort((a, b) => a.start - b.start);

    const segments: DoubledBySegment[] = [];
    let cursor = 0;
    for (const match of matches) {
        if (match.start > cursor) {
            segments.push({ type: 'text', text: raw.slice(cursor, match.start) });
        }
        segments.push({
            type: 'member',
            text: raw.slice(match.start, match.end),
            member: match.member,
        });
        cursor = match.end;
    }
    if (cursor < raw.length) {
        segments.push({ type: 'text', text: raw.slice(cursor) });
    }

    const first = matches[0];
    const uniqueMembers = [...new Map(matches.map((m) => [m.member.id, m.member])).values()];

    return {
        prefix: raw.slice(0, first.start),
        member: first.member,
        name: raw.slice(first.start, first.end),
        suffix: raw.slice(first.end),
        segments,
        allMembers: uniqueMembers,
    };
}
