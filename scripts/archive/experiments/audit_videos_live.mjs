/**
 * ==============================================================================
 * CUC — DIAGNOSTIC LECTURE SEULE : source de vérité vidéos + statut HTTP réel
 * ==============================================================================
 * Objectif de mesure, sans aucune écriture :
 *   1. lire `site_settings` key='videos' (source de vérité publique) ;
 *   2. lister les URLs stockées (DB) et le repli dépôt (PROGRAMMES_TV) ;
 *   3. sonder chaque URL (HEAD puis GET avec redirect:'manual') et rapporter le
 *      code HTTP exact + l'en-tête fautif (403, 401, 404, content-type…) ;
 *   4. sonder les candidats Dailymotion/YouTube/MP4 extraits de l'ancien site.
 *
 * Usage :
 *   node scripts/audit_videos_live.mjs
 * ==============================================================================
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

function loadEnv() {
    try {
        const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
        for (const line of raw.split(/\r?\n/)) {
            const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
            if (m && !process.env[m[1]]) {
                process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
            }
        }
    } catch {
        /* environnement déjà fourni */
    }
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const DM_IDS = [
    { label: 'COEUR DE CASCADEURS', id: 'x9uewe0' },
    { label: 'REPORTAGE BFM TV', id: 'x8581s9' },
    { label: 'HAPPY BIRTHDAY CUC', id: 'x858323' },
    { label: "SESSION D'AOÛT 2017", id: 'x8583in' },
    { label: 'ZOË BELL AU CAMPUS', id: 'k2LHEg1AIHtIfYxkvcz' },
    { label: 'STUNT RIDER — CAMPUS LIFE', id: 'x8583u3' },
];

/** Repli dépôt — doit rester synchronisé avec src/data/videos.ts (lecture seule). */
const REPO_FALLBACK = [
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/reportages/20h30-A-LECOLE-DES-CASCADEURS-FRANCE2-VWeb2-1-part1.mp4',
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/reportages/TF1-JT-20h-CUC-reportage-1.mp4',
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/reportages/20h30-A-LECOLE-DES-CASCADEURS-FRANCE2-VWeb2-1-part2.mp4',
];

/** Candidats extraits de l'ancien site (script inspect_videos.mjs). */
const LEGACY_CANDIDATES = [
    { label: 'DM x9uewe0 (video-cascadeurs)', url: 'https://www.dailymotion.com/embed/video/x9uewe0' },
    { label: 'DM geo x9uewe0', url: 'https://geo.dailymotion.com/player.html?video=x9uewe0' },
    { label: 'DM x8581s9 (video-bfmtv)', url: 'https://www.dailymotion.com/embed/video/x8581s9' },
    { label: 'DM geo x8581s9', url: 'https://geo.dailymotion.com/player.html?video=x8581s9' },
    { label: 'DM x858323 (video-birthday)', url: 'https://www.dailymotion.com/embed/video/x858323' },
    { label: 'DM geo x858323', url: 'https://geo.dailymotion.com/player.html?video=x858323' },
    { label: 'DM x8583in (video-aout2017)', url: 'https://www.dailymotion.com/embed/video/x8583in' },
    { label: 'DM geo x8583in', url: 'https://geo.dailymotion.com/player.html?video=x8583in' },
    { label: 'DM k2LHEg1AIHtIfYxkvcz (video-zoebell)', url: 'https://www.dailymotion.com/embed/video/k2LHEg1AIHtIfYxkvcz' },
    { label: 'DM geo k2LHEg1AIHtIfYxkvcz', url: 'https://geo.dailymotion.com/player.html?video=k2LHEg1AIHtIfYxkvcz' },
    { label: 'DM x8583u3 (video-stuntrider)', url: 'https://www.dailymotion.com/embed/video/x8583u3' },
    { label: 'DM geo x8583u3', url: 'https://geo.dailymotion.com/player.html?video=x8583u3' },
    { label: 'YT X1LJN9AswpU', url: 'https://www.youtube.com/embed/X1LJN9AswpU' },
    { label: 'YT -jVwT--LbHA', url: 'https://www.youtube.com/embed/-jVwT--LbHA' },
    { label: 'YT AGNMXfQbtdE', url: 'https://www.youtube.com/embed/AGNMXfQbtdE' },
    { label: 'YT YO7bhPEHMd4', url: 'https://www.youtube.com/embed/YO7bhPEHMd4' },
    { label: 'Legacy MP4 TF1-JT-20h', url: 'https://www.campus-universcascades.com/wp-content/uploads/2021/07/TF1-JT-20h-CUC-reportage-1.mp4' },
    { label: 'Legacy MP4 FRANCE2', url: 'https://www.campus-universcascades.com/wp-content/uploads/2021/07/20h30-A-LECOLE-DES-CASCADEURS-FRANCE2-VWeb2-1.mp4' },
];

async function probe(url) {
    const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' };
    let headStatus = 'n/a';
    let headServer = '';
    let getStatus = 'n/a';
    let getCt = '';
    let getLocation = '';
    try {
        const h = await fetch(url, { method: 'HEAD', headers, redirect: 'manual' });
        headStatus = h.status;
        headServer = h.headers.get('server') || '';
    } catch (e) {
        headStatus = `ERR:${e.message}`;
    }
    try {
        const g = await fetch(url, { method: 'GET', headers, redirect: 'manual' });
        getStatus = g.status;
        getCt = g.headers.get('content-type') || '';
        getLocation = g.headers.get('location') || '';
    } catch (e) {
        getStatus = `ERR:${e.message}`;
    }
    return { headStatus, headServer, getStatus, getCt, getLocation };
}

async function main() {
    console.log('=== 1) SOURCE DE VÉRITÉ : site_settings key=videos ===');
    let dbUrls = [];
    if (SUPABASE_URL && SERVICE_KEY) {
        const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
        const { data, error } = await supabase
            .from('site_settings')
            .select('key,value,updated_at')
            .eq('key', 'videos')
            .maybeSingle();
        if (error) {
            console.log('Erreur lecture site_settings:', error.message);
        } else if (!data) {
            console.log('Aucune ligne site_settings key=videos (le repli dépôt est donc servi).');
        } else {
            console.log('updated_at:', data.updated_at);
            const list = data.value?.list;
            if (Array.isArray(list)) {
                console.log(`value.list.length = ${list.length}`);
                dbUrls = list.map((v) => v?.dmId).filter(Boolean);
                console.log(JSON.stringify(list.map((v) => ({ title: v.title, dmId: v.dmId })), null, 2));
            } else {
                console.log('value.list absent / non tableau :', JSON.stringify(data.value).slice(0, 800));
            }
        }
    } else {
        console.log('Variables Supabase absentes — lecture DB impossible.');
    }

    console.log('\n=== 2) STATUT HTTP — URLs stockées en DB ===');
    for (const url of dbUrls) {
        const r = await probe(url);
        console.log(`${url}\n   HEAD=${r.headStatus} GET=${r.getStatus} ct=${r.getCt} loc=${r.getLocation}`);
    }

    console.log('\n=== 3) STATUT HTTP — repli dépôt (src/data/videos.ts) ===');
    for (const url of REPO_FALLBACK) {
        const r = await probe(url);
        console.log(`${url}\n   HEAD=${r.headStatus} GET=${r.getStatus} ct=${r.getCt}`);
    }

    console.log('\n=== 4) STATUT HTTP — candidats ancien site ===');
    for (const c of LEGACY_CANDIDATES) {
        const r = await probe(c.url);
        console.log(`${c.label}\n   ${c.url}\n   HEAD=${r.headStatus} GET=${r.getStatus} ct=${r.getCt} loc=${r.getLocation}`);
    }

    console.log('\n=== 5) LECTURE site_settings.videos via clé ANON (RLS) ===');
    if (SUPABASE_URL && ANON_KEY) {
        const anon = createClient(SUPABASE_URL, ANON_KEY);
        const { data, error } = await anon
            .from('site_settings')
            .select('key,value')
            .eq('key', 'videos')
            .maybeSingle();
        if (error) console.log('ANON erreur:', error.message, error.code);
        else if (!data) console.log('ANON: aucune ligne visible (RLS peut masquer) -> repli depot servi.');
        else console.log(`ANON: ligne visible, list.length=${Array.isArray(data.value?.list) ? data.value.list.length : 'n/a'}`);
    } else {
        console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY absent.');
    }

    console.log('\n=== 6) DAILYMOTION oEmbed (public/embeddable ?) + suivi redirection ===');
    for (const v of DM_IDS) {
        const watch = `https://www.dailymotion.com/video/${v.id}`;
        let oembed = 'n/a';
        try {
            const r = await fetch(`https://www.dailymotion.com/services/oembed?url=${encodeURIComponent(watch)}&format=json`, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            });
            oembed = `${r.status} ${r.headers.get('content-type') || ''}`;
        } catch (e) {
            oembed = `ERR:${e.message}`;
        }
        let followed = 'n/a';
        let body = '';
        try {
            const r = await fetch(`https://www.dailymotion.com/embed/video/${v.id}`, {
                redirect: 'follow',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
                    Accept: 'text/html,application/xhtml+xml',
                    Referer: 'https://cuc-new.vercel.app/',
                },
            });
            followed = `${r.status} ${r.headers.get('content-type') || ''} final=${r.url}`;
            body = (await r.text()).slice(0, 160).replace(/\s+/g, ' ');
        } catch (e) {
            followed = `ERR:${e.message}`;
        }
        console.log(`${v.label} (${v.id})\n   oEmbed=${oembed}\n   embed-follow=${followed}\n   body="${body}"`);
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
