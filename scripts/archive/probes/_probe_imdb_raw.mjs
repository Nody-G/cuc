/** Sonde ponctuelle : comprendre le HTTP 400 de l'API GraphQL IMDb (plots). */
import https from 'node:https';

const TT = 'tt1429534'; // Braquo

const USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function post(body, headers) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(body);
        const req = https.request(
            {
                hostname: 'api.graphql.imdb.com',
                path: '/',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload),
                    'User-Agent': USER_AGENT,
                    Accept: 'application/json',
                    Origin: 'https://www.imdb.com',
                    Referer: 'https://www.imdb.com/',
                    'x-imdb-client-name': 'imdb-web-next',
                    'x-imdb-user-country': 'FR',
                    'x-imdb-user-language': 'fr-FR',
                    ...headers,
                },
            },
            (res) => {
                let raw = '';
                res.on('data', (chunk) => {
                    raw += chunk;
                });
                res.on('end', () => resolve({ status: res.statusCode, body: raw }));
            }
        );
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

const variants = {
    baseline: `query { title(id: "${TT}") { id titleText { text } } }`,
    plot: `query { title(id: "${TT}") { id plot { plotText { plainText } } } }`,
    plotLang: `query { title(id: "${TT}") { id plot { plotText { plainText language { id } } } } }`,
    summaries: `query { title(id: "${TT}") { id plotSummaries(first: 1) { edges { node { text { plainText } } } } } }`,
    synopsis: `query { title(id: "${TT}") { id synopsis { text } } }`,
    plots: `query { title(id: "${TT}") { id plots(first: 1) { edges { node { plotText { plainText } } } } } }`,
};

for (const [name, query] of Object.entries(variants)) {
    const res = await post({ query }, {});
    const short = res.body.replace(/\s+/g, ' ').slice(0, 260);
    console.log(`\n[${name}] HTTP ${res.status}\n  ${short}`);
}

const withEnHeaders = await post(
    { query: variants.plot },
    { 'x-imdb-user-country': 'US', 'x-imdb-user-language': 'en-US' }
);
console.log(`\n[plot + en-US] HTTP ${withEnHeaders.status}\n  ${withEnHeaders.body.replace(/\s+/g, ' ').slice(0, 400)}`);
