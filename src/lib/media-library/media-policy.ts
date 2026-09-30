/**
 * Politique média du Cockpit — contrats et invariants.
 *
 * Couche « Types & Contrats » (`AGENTS.md` § 1) : aucune entrée/sortie, aucun
 * accès réseau, aucun DOM. Ce fichier répond à trois questions et à elles
 * seules : quel profil de compression vise ce dossier, quel plafond s'applique
 * à cette nature de média, et quels préfixes sont réservés.
 *
 * La géométrie (dimensions cibles, effort d'encodage, décision de compresser)
 * vit dans `image-compression.plan.ts` : ici on ne décide que des règles.
 */

export type CompressionProfileId = 'web' | 'portrait' | 'logo' | 'hero' | 'passthrough';

export interface CompressionProfile {
    id: CompressionProfileId;
    /** Libellé affiché dans le panneau d'import. */
    label: string;
    /** Bord long visé en pixels. `0` = aucune redimension. */
    maxLongEdge: number;
    /** Qualité d'encodage WebP (0-1). */
    quality: number;
    /** Poids visé — repère d'affichage, jamais un couperet. */
    targetBytes: number;
}

/**
 * Profils d'encodage. Le levier principal n'est pas la qualité mais la
 * dimension : le site n'affiche jamais au-delà de 2560 px (`deviceSizes` de
 * `next.config.ts`), donc ramener une photo de 4032 px à 2560 px retire ~60 %
 * des pixels sans qu'aucun écran ne puisse le voir.
 */
export const COMPRESSION_PROFILES: Record<CompressionProfileId, CompressionProfile> = {
    web: { id: 'web', label: 'Web — 2560 px', maxLongEdge: 2560, quality: 0.85, targetBytes: 450_000 },
    portrait: { id: 'portrait', label: 'Portrait — 1600 px', maxLongEdge: 1600, quality: 0.88, targetBytes: 250_000 },
    logo: { id: 'logo', label: 'Logo — 512 px', maxLongEdge: 512, quality: 0.9, targetBytes: 60_000 },
    hero: { id: 'hero', label: 'Plein écran — 3200 px', maxLongEdge: 3200, quality: 0.9, targetBytes: 700_000 },
    passthrough: { id: 'passthrough', label: 'Sans recompression', maxLongEdge: 0, quality: 1, targetBytes: 0 },
};

export const DEFAULT_PROFILE_ID: CompressionProfileId = 'web';

/** Préfixe des négatifs haute résolution — jamais référencés par la vitrine. */
export const ORIGINALS_ROOT = '_originals';
/** Préfixe de la corbeille logique (suppression réversible). */
export const TRASH_ROOT = '_trash';

/** Préfixes qui ne sont jamais du contenu éditorial affichable. */
export const RESERVED_PREFIXES: readonly string[] = [ORIGINALS_ROOT, TRASH_ROOT];

/** Premier segment d'un chemin (`media/x/y.jpg` → `media`). */
export function rootSegment(path: string): string {
    return path.split('/')[0] ?? '';
}

/** Vrai pour `_originals/…` et `_trash/…` — à exclure du catalogue. */
export function isReservedPrefix(path: string): boolean {
    return RESERVED_PREFIXES.includes(rootSegment(path));
}

const FOLDER_RULES: ReadonlyArray<{ match: RegExp; profile: CompressionProfileId }> = [
    { match: /(^|\/)partner[-_]logo(\/|$)/, profile: 'logo' },
    { match: /(^|\/)hero(\/|$)/, profile: 'hero' },
    { match: /(^|\/)(portraits?|team|equipe)(\/|$)/, profile: 'portrait' },
];

/**
 * Profil applicable à un chemin de destination. Un négatif (`_originals/…`)
 * est jugé sur son chemin d'origine : le négatif d'un logo suit la politique
 * du logo, sans quoi le dossier technique dicterait la qualité.
 */
export function profileForPath(path: string): CompressionProfile {
    const clean = path.replace(/^_originals\//, '');
    const rule = FOLDER_RULES.find((candidate) => candidate.match.test(clean));
    return COMPRESSION_PROFILES[rule?.profile ?? DEFAULT_PROFILE_ID];
}

/* ------------------------------------------------------------------ *
 * Nature des médias et plafonds
 *
 * Deux limites distinctes : celle du dérivé téléversé vers le bucket, et
 * celle du négatif optionnel conservé sous `_originals/`. Une nature dont
 * `maxOriginalBytes` vaut 0 n'admet aucun négatif.
 * ------------------------------------------------------------------ */

export type MediaNature = 'image' | 'video' | 'document';

export interface MediaLimit {
    maxBytes: number;
    maxOriginalBytes: number;
    mimeTypes: readonly string[];
}

export const MEDIA_LIMITS: Record<MediaNature, MediaLimit> = {
    image: {
        maxBytes: 8_000_000,
        maxOriginalBytes: 12_000_000,
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml'],
    },
    video: {
        maxBytes: 45_000_000,
        maxOriginalBytes: 0,
        mimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    },
    document: {
        maxBytes: 20_000_000,
        maxOriginalBytes: 20_000_000,
        mimeTypes: ['application/pdf', 'text/csv', 'text/plain'],
    },
};

const EXTENSION_NATURE: ReadonlyArray<{ ext: RegExp; nature: MediaNature }> = [
    { ext: /\.(jpe?g|png|webp|avif|gif|svg)$/i, nature: 'image' },
    { ext: /\.(mp4|webm|mov|m4v)$/i, nature: 'video' },
    { ext: /\.(pdf|csv|txt)$/i, nature: 'document' },
];

/**
 * Nature d'un média : le type MIME fait foi, l'extension sert de repli (un
 * navigateur envoie `application/octet-stream` pour certains MP4). Renvoie
 * `null` quand rien ne correspond — c'est au ticket d'upload de refuser.
 */
export function mediaNature(mime: string, name: string): MediaNature | null {
    const normalized = (mime || '').toLowerCase().trim();
    const fromMime = (Object.keys(MEDIA_LIMITS) as MediaNature[]).find((nature) =>
        MEDIA_LIMITS[nature].mimeTypes.includes(normalized),
    );
    if (fromMime) return fromMime;
    return EXTENSION_NATURE.find((entry) => entry.ext.test(name))?.nature ?? null;
}

/** Plafond applicable à l'entrée, selon la conservation éventuelle du négatif. */
export function uploadCeilingBytes(nature: MediaNature, keepOriginal: boolean): number {
    const limit = MEDIA_LIMITS[nature];
    return keepOriginal && limit.maxOriginalBytes > 0 ? limit.maxOriginalBytes : limit.maxBytes;
}

/** Poids lisible en mégaoctets, virgule française (`8,0 Mo`). */
export function megaLabel(bytes: number): string {
    return `${(bytes / 1_000_000).toFixed(1).replace('.', ',')} Mo`;
}

/**
 * Motif de refus quand un fichier dépasse le plafond de sa nature.
 *
 * Le message appartient au domaine, pas à l'action : le navigateur et le
 * serveur refusent ainsi avec **les mêmes mots**, et le motif reste testable
 * sans réseau ni session.
 */
export function describeCeilingRefusal(bytes: number, ceiling: number, keepOriginal: boolean): string {
    const hint = keepOriginal
        ? 'Négatif refusé à ce poids.'
        : 'Compressez-le ou réduisez ses dimensions.';
    return `Fichier trop lourd : ${megaLabel(bytes)} pour un plafond de ${megaLabel(ceiling)}. ${hint}`;
}

/** Le type MIME est-il accepté pour cette nature ? */
export function acceptsMime(nature: MediaNature, mime: string): boolean {
    const normalized = (mime || '').toLowerCase().trim();
    if (!normalized || normalized === 'application/octet-stream') return true;
    return MEDIA_LIMITS[nature].mimeTypes.includes(normalized);
}

/** La conservation d'un négatif a-t-elle un sens pour cette nature ? */
export function originalRetentionAllowed(nature: MediaNature): boolean {
    return MEDIA_LIMITS[nature].maxOriginalBytes > 0;
}
