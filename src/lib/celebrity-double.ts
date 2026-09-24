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

export interface DoubledByParts {
    /** Texte précédant le nom (« Doublé par », « Doubled by »…), espaces retirés. */
    prefix: string;
    /** Membre CUC reconnu, ou `null` si le texte ne désigne personne de l'équipe. */
    member: TeamNameRef | null;
    /** Nom tel qu'écrit dans la fiche — toujours affiché. */
    name: string;
    /** Texte suivant le nom (ponctuation, précision éventuelle). */
    suffix: string;
}

const EMPTY: DoubledByParts = { prefix: '', member: null, name: '', suffix: '' };

/**
 * Découpe une phrase de doublure et identifie l'éventuel membre CUC cité.
 *
 * La correspondance se fait sur le **nom complet**, insensible à la casse.
 * Les noms les plus longs sont testés en premier : « Michel Bouis » est
 * reconnu avant « Michel », même si les deux existaient dans l'équipe.
 *
 * @param text    Phrase publiée (ex. « Doublé par Vincent Bouillon »).
 * @param members Référentiel de l'équipe (id + nom) dans lequel chercher.
 */
export function resolveDoubledBy(text: string, members: readonly TeamNameRef[]): DoubledByParts {
    const raw = (text ?? '').trim();
    if (!raw) return EMPTY;

    const haystack = raw.toLowerCase();
    const candidates = [...members]
        .filter((member) => member?.name?.trim())
        .sort((a, b) => b.name.length - a.name.length);

    for (const member of candidates) {
        const index = haystack.indexOf(member.name.toLowerCase());
        if (index === -1) continue;
        return {
            prefix: raw.slice(0, index).trimEnd(),
            member: { id: member.id, name: member.name },
            name: raw.slice(index, index + member.name.length),
            suffix: raw.slice(index + member.name.length),
        };
    }

    return { prefix: '', member: null, name: raw, suffix: '' };
}
