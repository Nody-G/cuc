/** Sonde ponctuelle : existe-t-il une introduction ANGLAISE sur Wikipédia pour les 5 fiches ? */
const TITLES = [
    '6 X Confiné.e.s',
    'Commissaire Moulin',
    'Mon frère Yves',
    'Panique au Grand Magasin',
    'Sauveur Giordano',
];

const EN_MARKERS =
    /\b(the|of|and|to|in|a|an|is|are|was|were|with|for|his|her|their|who|that|when|after|from|by|on|at|as|it|he|she|they|while|into|between)\b/gi;
const FR_MARKERS =
    /\b(le|la|les|des|une|un|et|pour|avec|sur|dans|est|sont|du|au|aux|par|qui|que|ne|pas|plus|tout|tous|elle|ils|elles|chez)\b/gi;

const isEnglishDominant = (value) => {
    if (typeof value !== 'string' || value.length < 40) return false;
    const en = (value.match(EN_MARKERS) ?? []).length;
    const fr = (value.match(FR_MARKERS) ?? []).length;
    return en >= 3 && en >= fr;
};

async function api(query) {
    const url = `https://en.wikipedia.org/w/api.php?format=json&${query}`;
    const res = await fetch(url, {
        headers: { 'User-Agent': 'CUC-i18n-audit/1.0 (contact@campus-universcascades.com)' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

for (const title of TITLES) {
    console.log(`\n=== ${title}`);
    try {
        const search = await api(
            `action=query&list=search&srlimit=2&srsearch=${encodeURIComponent(`${title} film`)}`
        );
        const hits = search?.query?.search ?? [];
        if (!hits.length) {
            console.log('  aucun résultat de recherche');
            continue;
        }
        for (const hit of hits) {
            const page = await api(
                `action=query&prop=extracts&exintro=1&explaintext=1&redirects=1&titles=${encodeURIComponent(hit.title)}`
            );
            const pages = page?.query?.pages ?? {};
            const entry = Object.values(pages)[0];
            const extract = String(entry?.extract ?? '').replace(/\s+/g, ' ').trim();
            console.log(`  • ${hit.title} — ${extract.length} car. — anglais=${isEnglishDominant(extract)}`);
            console.log(`    ${extract.slice(0, 220)}`);
        }
    } catch (error) {
        console.log(`  erreur : ${error.message}`);
    }
}
