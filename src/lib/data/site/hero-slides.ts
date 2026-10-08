/**
 * ==============================================================================
 * CUC — Visuels du hero d'accueil (domaine)
 * ==============================================================================
 * Les quatre photographies qui défilent en fond d'accueil ne sont plus figées :
 * le Cockpit peut en surcharger l'URL, en réordonner, en supprimer ou en
 * **ajouter** au-delà des quatre historiques, en écrivant dans
 * `site_pages.sections_data.hero.slides`.
 *
 * La vitrine et l'éditeur partagent la **même** fusion pure (`mergeHeroSlides`)
 * pour rester d'accord sur la structure :
 *
 *  - fusion **index par index** sur `HERO_SLIDES` : une surcharge remplace l'URL
 *    du même rang, les clés i18n des quatre visuels historiques sont conservées
 *    (`home.hero.slides.<clé>` continue de fournir légende, sous-titre, badge,
 *    étiquette) ;
 *  - un index au-delà de 4 crée un visuel supplémentaire, **sans clé i18n** :
 *    aucun texte éditorial n'est inventé (le `alt` neutre est décrit plus bas) ;
 *  - garde-fous : tableau absent, vide ou invalide ⇒ repli intégral sur
 *    `HERO_SLIDES` ; une entrée sans URL exploitable est ignorée ; la liste
 *    résultante n'est **jamais** vide (sinon `hero[currentSlide].url` serait
 *    `undefined` et ferait planter le fond 3D).
 *
 * Couche « Domaine & Services » (`AGENTS.md` § 1) : fonctions pures,
 * déterministes, testables hors du cycle de vie UI.
 */

/** Clés i18n des visuels historiques (`home.hero.slides.<clé>`). */
export const HERO_SLIDE_KEYS = ['campus', 'combat', 'facilities', 'team'] as const;

export type HeroSlideKey = (typeof HERO_SLIDE_KEYS)[number];

/** Visuel historique : clé i18n + URL média stable. */
export interface HeroSlide {
    key: HeroSlideKey;
    url: string;
}

/**
 * Surcharge persistée d'un visuel (`sections_data.hero.slides.<index>`).
 * Seule l'URL est nécessaire ; l'`alt` est réservé aux visuels ajoutés.
 */
export interface HeroSlideOverride {
    url?: string;
    alt?: string;
}

/**
 * Visuel effectivement rendu. `key` n'existe que pour les quatre visuels
 * historiques : un visuel ajouté n'a pas de copie i18n dédiée.
 */
export interface HeroSlideView {
    key?: HeroSlideKey;
    url: string;
    alt?: string;
}

/**
 * Graine de la liste d'édition : reprend les visuels historiques tels quels.
 * Matérialiser ces URL n'invente **aucun** contenu — ce sont exactement les
 * médias servis par repli quand la surcharge est absente.
 */
export type HeroSlideSeed = {
    /** Identifiant stable dérivé de la clé i18n (sert aux commandes de liste). */
    id: string;
    url: string;
    alt?: string;
};

export const HERO_SLIDES: HeroSlide[] = [
    {
        key: 'campus',
        url: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/home-couv-1.webp',
    },
    {
        key: 'combat',
        url: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/home-couv-2.webp',
    },
    {
        key: 'facilities',
        url: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/home-couv-3.webp',
    },
    {
        key: 'team',
        url: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/home-couv-4.webp',
    },
];

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** URL exploitable d'une valeur de surcharge : chaîne non vide, jamais inventée. */
function readUrl(value: unknown): string | undefined {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

function readAlt(value: unknown): string | undefined {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Fusionne la surcharge éditée (`sections_data.hero.slides`) avec les visuels
 * historiques, **index par index**.
 *
 * Garanties verrouillées par les tests :
 *  1. la longueur ne descend **jamais** sous celle de `HERO_SLIDES` (4) ;
 *  2. une surcharge sans URL valide retombe sur le visuel historique du rang ;
 *  3. un rang au-delà de 4 n'existe que s'il porte une URL exploitable ;
 *  4. aucune URL vide ni `undefined` ne peut atteindre le rendu.
 */
export function mergeHeroSlides(overrides?: readonly unknown[] | null): HeroSlideView[] {
    const incoming = Array.isArray(overrides) ? overrides : [];
    const length = Math.max(HERO_SLIDES.length, incoming.length);
    const merged: HeroSlideView[] = [];

    for (let index = 0; index < length; index += 1) {
        const base = HERO_SLIDES[index];
        const raw = incoming[index];
        const record = isRecord(raw) ? raw : undefined;
        const url = readUrl(record?.url) ?? base?.url;
        // Rang au-delà des visuels historiques sans URL : rien à rendre, on
        // n'invente pas d'image. Aux rangs historiques, `base.url` garantit la
        // valeur, donc aucun trou n'est créé.
        if (!url) continue;

        const alt = readAlt(record?.alt);
        merged.push({
            ...(base ? { key: base.key } : {}),
            url,
            ...(alt ? { alt } : {}),
        });
    }

    // Ceinture de sécurité : la liste ne doit jamais être vide, quel que soit
    // l'entrant (le rendu accède à `slides[currentSlide].url`).
    if (merged.length === 0) {
        return HERO_SLIDES.map((slide) => ({ key: slide.key, url: slide.url }));
    }

    return merged;
}

/** Dernier segment d'une URL (nom de fichier décodé), ou chaîne vide. */
export function heroSlideFilename(url: string): string {
    try {
        const clean = url.split('?')[0].split('#')[0];
        const parts = clean.split('/');
        return decodeURIComponent(parts[parts.length - 1] || '');
    } catch {
        return '';
    }
}

/**
 * Texte alternatif d'un visuel, dans cet ordre : copie i18n du visuel
 * historique, `alt` saisi par l'admin (visuels ajoutés), puis nom de fichier
 * dérivé de l'URL (jamais de texte éditorial inventé).
 */
export function resolveHeroSlideAlt(
    slide: HeroSlideView,
    copy?: { caption?: string } | null
): string {
    const caption = readAlt(copy?.caption);
    if (caption) return caption;
    if (slide.alt) return slide.alt;
    return heroSlideFilename(slide.url);
}

/** Graine d'édition : les visuels historiques, prêts à être surchargés. */
export function buildHeroSlideSeed(): HeroSlideSeed[] {
    return HERO_SLIDES.map((slide) => ({ id: slide.key, url: slide.url }));
}
