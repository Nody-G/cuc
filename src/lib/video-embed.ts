/**
 * Domaine pur : résolution d'une référence vidéo vers un média embarquable.
 *
 * Extrait de `DmVideoModal.tsx` (règle SRP, `AGENTS.md` § 1) afin d'isoler la
 * logique de résolution — déterministe et testable hors du cycle de vie UI —
 * de la présentation. Aucun accès réseau, aucun état, aucune dépendance React.
 *
 * Références acceptées : identifiant Dailymotion nu (`x9uewe0`), URL Dailymotion
 * (`/video/<id>`, `/embed/video/<id>`), URL YouTube (longue, courte, embed),
 * URL de Reel Instagram, fichier vidéo direct (`.mp4`, `.webm`, Cloudinary) et
 * toute URL `http(s)` servie en iframe brute.
 */

export type VideoEmbedKind = 'video' | 'iframe';

export type VideoProvider =
    | 'file'
    | 'youtube'
    | 'dailymotion'
    | 'instagram'
    | 'external'
    | 'unknown';

export interface VideoEmbed {
    /** `video` → balise `<video>` ; `iframe` → cadre embarqué. */
    kind: VideoEmbedKind;
    /** URL réellement injectée dans le lecteur (vide si référence inexploitable). */
    url: string;
    provider: VideoProvider;
    /** Page publique de visionnage, utilisée comme repli sortant. */
    watchUrl?: string;
}

const FILE_RE = /\.(?:mp4|webm|mov|m3u8|ogv)(?:[?#].*)?$/i;
const CLOUDINARY_VIDEO_RE = /\/video\/upload\//;
const YOUTUBE_RE = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
const DAILYMOTION_URL_RE = /dailymotion\.com\/(?:video|embed\/video)\/([a-zA-Z0-9]+)/;
const DAILYMOTION_ID_RE = /^[xk][a-zA-Z0-9]{4,}$/;
const INSTAGRAM_REEL_RE = /instagram\.com\/(?:reel|reels|tv|p)\/([a-zA-Z0-9_-]+)/;

/** Résout une référence vidéo en média embarquable. */
export function resolveEmbedUrl(raw: string): VideoEmbed {
    const value = (raw ?? '').trim();
    if (!value) return { kind: 'iframe', url: '', provider: 'unknown' };

    // 1. Fichier vidéo servi directement (mp4, webm, Cloudinary…).
    if (FILE_RE.test(value) || CLOUDINARY_VIDEO_RE.test(value)) {
        return { kind: 'video', url: value, provider: 'file', watchUrl: value };
    }

    // 2. YouTube (URL longue, courte ou embed) → lecteur sans cookie.
    const youtube = value.match(YOUTUBE_RE);
    if (youtube) {
        return {
            kind: 'iframe',
            url: `https://www.youtube-nocookie.com/embed/${youtube[1]}?autoplay=1&rel=0`,
            provider: 'youtube',
            watchUrl: `https://www.youtube.com/watch?v=${youtube[1]}`,
        };
    }

    // 3. Dailymotion : URL complète ou identifiant nu (`x…`, `k…`).
    const dailymotionUrl = value.match(DAILYMOTION_URL_RE);
    const dailymotionId = dailymotionUrl
        ? dailymotionUrl[1]
        : DAILYMOTION_ID_RE.test(value)
            ? value
            : null;
    if (dailymotionId) {
        return {
            kind: 'iframe',
            url: `https://www.dailymotion.com/embed/video/${dailymotionId}?autoplay=1&mute=1`,
            provider: 'dailymotion',
            watchUrl: `https://www.dailymotion.com/video/${dailymotionId}`,
        };
    }

    // 4. Reel / publication Instagram.
    const instagram = value.match(INSTAGRAM_REEL_RE);
    if (instagram) {
        return {
            kind: 'iframe',
            url: `https://www.instagram.com/reel/${instagram[1]}/embed/`,
            provider: 'instagram',
            watchUrl: value.split('?')[0],
        };
    }

    // 5. Autre URL http(s) : iframe brute.
    if (/^https?:\/\//i.test(value)) {
        return { kind: 'iframe', url: value, provider: 'external', watchUrl: value };
    }

    return { kind: 'iframe', url: '', provider: 'unknown' };
}

export interface VideoMediaUrls {
    /** URL de lecture schema.org (`embedUrl`) pour un lecteur tiers. */
    embedUrl?: string;
    /** URL du flux pour un fichier servi directement (`contentUrl`). */
    contentUrl?: string;
}

/**
 * Dérive les URLs schema.org d'un `VideoObject` à partir de la référence réelle.
 * Renvoie `{}` lorsque la référence est inexploitable : l'appelant ne doit alors
 * produire aucun JSON-LD mensonger.
 */
export function resolveVideoMedia(raw: string): VideoMediaUrls {
    const embed = resolveEmbedUrl(raw);
    if (!embed.url) return {};
    if (embed.kind === 'video') return { contentUrl: embed.url };
    if (embed.provider === 'dailymotion' || embed.provider === 'youtube' || embed.provider === 'instagram') {
        return { embedUrl: embed.url };
    }
    return {};
}
