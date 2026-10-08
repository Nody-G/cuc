import fs from 'node:fs';
import path from 'node:path';

const token = process.env.INSTAGRAM_ACCESS_TOKEN;
if (!token) {
    console.error('INSTAGRAM_ACCESS_TOKEN is required');
    process.exit(1);
}

function formatFollowerCount(count) {
    if (count >= 1000000) {
        const val = (count / 1000000).toFixed(1).replace('.', ',');
        return `${val.endsWith(',0') ? val.slice(0, -2) : val} M`;
    }
    if (count >= 1000) {
        const val = (count / 1000).toFixed(count >= 100000 ? 0 : 1).replace('.', ',');
        return `${val.endsWith(',0') ? val.slice(0, -2) : val} k`;
    }
    return count.toLocaleString('fr-FR');
}

async function run() {
    console.log('▶ Chargement des médias depuis l’API Meta Graph...');
    const host = 'https://graph.instagram.com';
    let url = `${host}/v19.0/me/media?fields=id,permalink,caption,like_count,timestamp&limit=100&access_token=${token}`;
    const mediaMap = new Map();
    let page = 0;
    while (url && page < 15) {
        page++;
        const res = await fetch(url);
        const json = await res.json();
        for (const item of json.data || []) {
            const m = item.permalink?.match(/instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/);
            if (m) mediaMap.set(m[1], item);
        }
        url = json.paging?.next || null;
    }
    console.log(`✓ ${mediaMap.size} publications trouvées dans le compte CUC.`);

    // Lecture du catalogue existant
    const cataloguePath = 'src/data/instagram-reels.ts';
    const text = fs.readFileSync(cataloguePath, 'utf8');

    // Parse existing ALL_INSTAGRAM_REELS
    const matchReels = [...text.matchAll(/\{\s*id:\s*"([^"]+)",\s*shortcode:\s*"([^"]+)",\s*url:\s*"([^"]+)",\s*title:\s*("(?:[^"\\]|\\.)*"),\s*description:\s*("(?:[^"\\]|\\.)*"),\s*coverImage:\s*"([^"]+)",\s*views:\s*([0-9]+),\s*viewsFormatted:\s*"([^"]*)",(?:\s*likes:\s*"([^"]*)",)?(?:\s*date:\s*"([^"]*)",)?(?:\s*isFeatured:\s*(true|false),)?/g)];

    console.log(`✓ ${matchReels.length} Reels analysés dans le catalogue actuel.`);

    const updatedReels = [];
    let updatedCount = 0;

    for (const m of matchReels) {
        const [
            ,
            id,
            shortcode,
            reelUrl,
            rawTitle,
            rawDesc,
            coverImage,
            oldViews,
            oldViewsFormatted,
            likes,
            date,
            isFeatured,
        ] = m;

        let views = parseInt(oldViews, 10);
        let viewsFormatted = oldViewsFormatted;
        let finalLikes = likes;

        const mediaItem = mediaMap.get(shortcode);
        if (mediaItem) {
            try {
                const insRes = await fetch(`${host}/v19.0/${mediaItem.id}/insights?metric=views,likes&access_token=${token}`);
                const ins = await insRes.json();
                const metrics = Object.fromEntries((ins.data || []).map((x) => [x.name, x.values?.[0]?.value]));
                if (typeof metrics.views === 'number') {
                    views = metrics.views;
                    viewsFormatted = formatFollowerCount(views);
                    if (typeof metrics.likes === 'number') {
                        finalLikes = formatFollowerCount(metrics.likes);
                    } else if (mediaItem.like_count != null) {
                        finalLikes = formatFollowerCount(mediaItem.like_count);
                    }
                    updatedCount++;
                    console.log(`  ✓ [Certifié Meta] ${shortcode} -> ${views.toLocaleString('fr-FR')} vues (${viewsFormatted}), likes: ${finalLikes}`);
                }
            } catch (err) {
                console.warn(`  ⚠ Impossible de récupérer les insights pour ${shortcode}:`, err.message);
            }
        } else {
            console.log(`  ℹ [Collaboratif/Externe] ${shortcode} conservé (${viewsFormatted} vues)`);
        }

        updatedReels.push({
            id,
            shortcode,
            url: reelUrl,
            rawTitle,
            rawDesc,
            coverImage,
            views,
            viewsFormatted,
            likes: finalLikes,
            date,
            isFeatured: isFeatured === 'true',
        });
    }

    console.log(`\nTotal mis à jour avec les vues officielles certifiées : ${updatedCount} / ${updatedReels.length}`);

    // Dédoublonner par shortcode pour que ALL_INSTAGRAM_REELS contienne chaque vidéo exactement une fois
    const uniqueReelsMap = new Map();
    for (const r of updatedReels) {
        if (!uniqueReelsMap.has(r.shortcode)) {
            uniqueReelsMap.set(r.shortcode, r);
        }
    }
    const deduplicatedReels = [...uniqueReelsMap.values()];

    // Tri par vues réelles décroissantes
    const sorted = deduplicatedReels.sort((a, b) => b.views - a.views);

    // Mettre à jour DEFAULT_FEATURED_REELS en prenant les 6 reels phares historiques avec leurs nouvelles vraies vues
    const featuredShortcodes = ['DdEoOcyM-We', 'Dc80NYLMv1Y', 'Dcqh0VisRnc', 'DcjNkFxMRm9', 'DbLJg18Mt7d', 'DZNOYRBsuwv'];
    const updatedFeatured = featuredShortcodes.map((sc, i) => {
        const found = sorted.find((r) => r.shortcode === sc);
        if (!found) throw new Error(`Featured reel missing: ${sc}`);
        return {
            ...found,
            id: `reel-featured-${i + 1}`,
            isFeatured: true,
        };
    });

    // Reconstruire les entrées ALL_INSTAGRAM_REELS (sans doublon)
    const allOut = sorted.map((r, i) => ({
        ...r,
        id: `reel-${i + 1}`,
        isFeatured: featuredShortcodes.includes(r.shortcode),
    }));

    function formatBlock(r) {
        const lines = [
            '    {',
            `        id: "${r.id}",`,
            `        shortcode: "${r.shortcode}",`,
            `        url: "${r.url}",`,
            `        title: ${r.rawTitle},`,
            `        description: ${r.rawDesc},`,
            `        coverImage: "${r.coverImage}",`,
            `        views: ${r.views},`,
            `        viewsFormatted: "${r.viewsFormatted}",`,
        ];
        if (r.likes) lines.push(`        likes: "${r.likes}",`);
        if (r.date) lines.push(`        date: "${r.date}",`);
        if (r.isFeatured) lines.push(`        isFeatured: true,`);
        lines.push('    },');
        return lines.join('\n');
    }

    const output = `/**
 * Catalogue des Reels Instagram officiels du CUC (@campus.univers.cascades).
 *
 * Provenance : shortcodes et légendes authentiques du compte ; chaque entrée
 * n'existe que si sa couverture est réellement présente dans
 * \`public/images/reels/<shortcode>.jpg\`. Aucune entrée inventée.
 *
 * Les nombres de vues des Reels CUC sont désormais certifiés par la Meta Graph
 * API officielle (\`/v19.0/{media_id}/insights?metric=views\`).
 */

export type StuntCategory = 'fire' | 'car' | 'height' | 'combat' | 'parkour' | 'workshop' | 'general';

export interface InstagramReel {
    id: string;
    shortcode: string;
    url: string;
    title: string;
    description: string;
    coverImage: string;
    views: number;
    viewsFormatted: string;
    likes?: string;
    date?: string;
    isFeatured?: boolean;
    stuntCategory?: StuntCategory;
}

export type ReelSortOption = 'featured' | 'views' | 'recent' | 'oldest';

/**
 * 6 Reels mis en avant (accueil de la vidéothèque).
 * Même ordre que les traductions éditoriales \`videos.reelsItems\`.
 */
export const DEFAULT_FEATURED_REELS: InstagramReel[] = [
${updatedFeatured.map(formatBlock).join('\n')}
];

/**
 * Catalogue complet des Reels officiels présents dans le dépôt.
 * Trié par nombre de vues certifiées décroissant.
 */
export const ALL_INSTAGRAM_REELS: InstagramReel[] = [
${allOut.map(formatBlock).join('\n')}
];
`;

    fs.writeFileSync(cataloguePath, output, 'utf8');
    console.log(`✔ Catalogue mis à jour avec succès dans ${cataloguePath}`);
}

run().catch(console.error);
