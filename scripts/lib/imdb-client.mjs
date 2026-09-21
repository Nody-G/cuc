/**
 * ==============================================================================
 * CUC — Client IMDb (GraphQL public + suggestion API)
 * ==============================================================================
 * IMDb ne propose pas d'API REST publique documentée, mais son site web
 * consomme une API GraphQL publique (`api.graphql.imdb.com`) qui renvoie la
 * filmographie complète d'une personne. C'est la source la plus exhaustive
 * pour les cascadeurs, très largement devant TMDB.
 *
 * Ce module fournit :
 *   - `imdb` : instance singleton prête à l'emploi
 *   - `ImdbClient` : classe réutilisable
 *   - `resolveImdbId(name)` : recherche nominative via l'API de suggestion
 *
 * Aucune clé n'est requise. Un rate-limit conservateur (20 req / 10 s) et un
 * cache disque (`.cache/imdb/`) évitent toute sur-sollicitation.
 *
 * AVERTISSEMENT LÉGAL : l'usage des données IMDb est encadré. Ce pipeline est
 * destiné à un usage interne non commercial (vérification de fiches coachs).
 * Voir https://help.imdb.com/article/imdb/general-information/can-i-use-imdb-data-in-my-software/G5JTRESSHJBBHTGX
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import https from 'node:https';

const GRAPHQL_HOST = 'api.graphql.imdb.com';
const SUGGESTION_HOST = 'v3.sg.media-imdb.com';

const USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export const CACHE_DIR = path.resolve(process.cwd(), '.cache', 'imdb');

/** Limite conservatrice : 20 requêtes par tranche de 10 secondes. */
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 10_000;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fenêtre glissante de rate-limiting.
 */
class RateLimiter {
    constructor(max, windowMs) {
        this.max = max;
        this.windowMs = windowMs;
        this.timestamps = [];
    }

    async acquire() {
        for (; ;) {
            const now = Date.now();
            this.timestamps = this.timestamps.filter(
                (t) => now - t < this.windowMs,
            );
            if (this.timestamps.length < this.max) {
                this.timestamps.push(now);
                return;
            }
            const oldest = this.timestamps[0];
            const waitMs = this.windowMs - (now - oldest) + 25;
            await sleep(waitMs);
        }
    }
}

function cacheKeyFor(payload) {
    return crypto
        .createHash('sha1')
        .update(typeof payload === 'string' ? payload : JSON.stringify(payload))
        .digest('hex');
}

/**
 * Client IMDb.
 */
export class ImdbClient {
    constructor(options = {}) {
        this.cacheEnabled = options.cache !== false;
        this.limiter = new RateLimiter(RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
        this.stats = { requests: 0, cacheHits: 0, errors: 0 };
        if (this.cacheEnabled) {
            fs.mkdirSync(CACHE_DIR, { recursive: true });
        }
    }

    setCacheEnabled(enabled) {
        this.cacheEnabled = Boolean(enabled);
        if (this.cacheEnabled) {
            fs.mkdirSync(CACHE_DIR, { recursive: true });
        }
    }

    _cachePath(key) {
        return path.join(CACHE_DIR, `${key}.json`);
    }

    _readCache(key) {
        if (!this.cacheEnabled) return null;
        const file = this._cachePath(key);
        if (!fs.existsSync(file)) return null;
        try {
            return JSON.parse(fs.readFileSync(file, 'utf8'));
        } catch {
            return null;
        }
    }

    _writeCache(key, value) {
        if (!this.cacheEnabled) return;
        try {
            fs.writeFileSync(
                this._cachePath(key),
                JSON.stringify(value, null, 2),
                'utf8',
            );
        } catch {
            /* cache best-effort */
        }
    }

    /**
     * Requête GraphQL brute avec retry/backoff.
     *
     * `options.headers` permet de surcharger l'en-tête de langue : le client
     * demande `fr-FR` par défaut (fiches coachs), mais les synopsis anglais
     * exigent `x-imdb-user-language: en-US` pour que IMDb renvoie bien la
     * version anglaise de l'intrigue.
     *
     * @param {string} query
     * @param {object} variables
     * @param {{retries?: number, headers?: Record<string,string>}} [options]
     */
    async graphql(query, variables = {}, options = {}) {
        const retries = options.retries ?? 3;
        const cacheKey = cacheKeyFor({ q: query, v: variables, h: options.headers ?? null });
        const cached = this._readCache(cacheKey);
        if (cached) {
            this.stats.cacheHits += 1;
            return cached;
        }

        const body = JSON.stringify({ query, variables });
        let lastError = null;

        for (let attempt = 0; attempt <= retries; attempt += 1) {
            await this.limiter.acquire();
            try {
                const data = await this._post(GRAPHQL_HOST, '/', body, options.headers);
                this.stats.requests += 1;
                this._writeCache(cacheKey, data);
                return data;
            } catch (err) {
                lastError = err;
                this.stats.errors += 1;
                const retriable = err.retriable !== false;
                if (!retriable || attempt === retries) break;
                await sleep(500 * 2 ** attempt);
            }
        }
        throw lastError ?? new Error('IMDb GraphQL : échec inconnu');
    }

    _post(hostname, requestPath, body, extraHeaders = null) {
        return new Promise((resolve, reject) => {
            const req = https.request(
                {
                    hostname,
                    path: requestPath,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(body),
                        'User-Agent': USER_AGENT,
                        Accept: 'application/json',
                        Origin: 'https://www.imdb.com',
                        Referer: 'https://www.imdb.com/',
                        'x-imdb-client-name': 'imdb-web-next',
                        'x-imdb-user-country': 'FR',
                        'x-imdb-user-language': 'fr-FR',
                        ...(extraHeaders || {}),
                    },
                },
                (res) => {
                    let raw = '';
                    res.on('data', (chunk) => {
                        raw += chunk;
                    });
                    res.on('end', () => {
                        if (res.statusCode === 404) {
                            const e = new Error('IMDb : ressource introuvable');
                            e.status = 404;
                            e.retriable = false;
                            reject(e);
                            return;
                        }
                        if (res.statusCode === 429 || res.statusCode >= 500) {
                            const e = new Error(
                                `IMDb : HTTP ${res.statusCode}`,
                            );
                            e.status = res.statusCode;
                            e.retriable = true;
                            reject(e);
                            return;
                        }
                        if (res.statusCode !== 200) {
                            const e = new Error(
                                `IMDb : HTTP ${res.statusCode}`,
                            );
                            e.status = res.statusCode;
                            e.retriable = false;
                            reject(e);
                            return;
                        }
                        try {
                            resolve(JSON.parse(raw));
                        } catch (parseErr) {
                            const e = new Error(
                                `IMDb : réponse non-JSON (${parseErr.message})`,
                            );
                            e.retriable = false;
                            reject(e);
                        }
                    });
                },
            );
            req.on('error', (err) => {
                err.retriable = true;
                reject(err);
            });
            req.write(body);
            req.end();
        });
    }

    /**
     * Recherche nominative via l'API de suggestion IMDb.
     * @param {string} name
     * @returns {Promise<Array<{imdbId:string,name:string,description:string}>>}
     */
    async suggest(name) {
        const first = (name || '').trim().charAt(0).toLowerCase() || 'a';
        const requestPath = `/suggestion/${encodeURIComponent(first)}/${encodeURIComponent(
            (name || '').toLowerCase(),
        )}.json`;
        const cacheKey = cacheKeyFor({ suggest: name });
        const cached = this._readCache(cacheKey);
        if (cached) {
            this.stats.cacheHits += 1;
            return cached;
        }

        await this.limiter.acquire();
        const data = await this._get(SUGGESTION_HOST, requestPath);
        this.stats.requests += 1;
        const results = (data?.d ?? [])
            .filter((entry) => String(entry.id || '').startsWith('nm'))
            .map((entry) => ({
                imdbId: entry.id,
                name: entry.l,
                description: entry.s || '',
            }));
        this._writeCache(cacheKey, results);
        return results;
    }

    _get(hostname, requestPath) {
        return new Promise((resolve, reject) => {
            const req = https.request(
                {
                    hostname,
                    path: requestPath,
                    method: 'GET',
                    headers: {
                        'User-Agent': USER_AGENT,
                        Accept: 'application/json',
                    },
                },
                (res) => {
                    let raw = '';
                    res.on('data', (chunk) => {
                        raw += chunk;
                    });
                    res.on('end', () => {
                        if (res.statusCode !== 200) {
                            const e = new Error(
                                `IMDb suggestion : HTTP ${res.statusCode}`,
                            );
                            e.status = res.statusCode;
                            e.retriable = res.statusCode >= 500;
                            reject(e);
                            return;
                        }
                        try {
                            resolve(JSON.parse(raw));
                        } catch (parseErr) {
                            const e = new Error(
                                `IMDb suggestion : réponse non-JSON (${parseErr.message})`,
                            );
                            e.retriable = false;
                            reject(e);
                        }
                    });
                },
            );
            req.on('error', (err) => {
                err.retriable = true;
                reject(err);
            });
            req.end();
        });
    }

    /**
     * Récupère l'identité et la filmographie complète d'une personne.
     *
     * NOTE TECHNIQUE : l'endpoint GraphQL public d'IMDb rejette (HTTP 400) les
     * requêtes utilisant des variables GraphQL (`$id: ID!`) ainsi que le champ
     * `characters` et les paginations > 250. La forme fiable est une requête
     * inline sans variables, avec `credits(first: 250)`. On pagine ensuite via
     * le curseur `pageInfo.endCursor` si nécessaire.
     *
     * @param {string} imdbId - identifiant `nmXXXXXXX`
     * @returns {Promise<{imdbId:string,name:string,credits:Array<object>}|null>}
     */
    async getPersonCredits(imdbId) {
        if (!/^nm\d+$/.test(String(imdbId || ''))) {
            throw new Error(`IMDb : identifiant invalide « ${imdbId} »`);
        }

        const collected = [];
        let personName = null;
        let total = 0;
        let after = null;
        let guard = 0;

        for (; ;) {
            const afterArg = after ? `, after: "${after}"` : '';
            const query = `
                query {
                    name(id: "${imdbId}") {
                        nameText { text }
                        credits(first: 250${afterArg}) {
                            total
                            pageInfo { hasNextPage endCursor }
                            edges {
                                node {
                                    title {
                                        id
                                        titleText { text }
                                        originalTitleText { text }
                                        releaseYear { year }
                                        titleType { id text }
                                    }
                                    category { id text }
                                }
                            }
                        }
                    }
                }
            `;

            let payload;
            try {
                payload = await this.graphql(query, {});
            } catch (err) {
                if (err.status === 404) return null;
                throw err;
            }

            const name = payload?.data?.name;
            if (!name) return null;

            personName = name.nameText?.text ?? personName;
            total = name.credits?.total ?? total;

            const edges = name.credits?.edges ?? [];
            for (const edge of edges) {
                const node = edge.node ?? {};
                const title = node.title ?? {};
                collected.push({
                    titleId: title.id ?? null,
                    title:
                        title.titleText?.text ??
                        title.originalTitleText?.text ??
                        null,
                    originalTitle: title.originalTitleText?.text ?? null,
                    year: title.releaseYear?.year ?? null,
                    titleType: title.titleType?.id ?? null,
                    titleTypeLabel: title.titleType?.text ?? null,
                    category: node.category?.text ?? null,
                    categoryId: node.category?.id ?? null,
                });
            }

            const pageInfo = name.credits?.pageInfo;
            guard += 1;
            if (!pageInfo?.hasNextPage || !pageInfo?.endCursor || guard >= 10) {
                break;
            }
            after = pageInfo.endCursor;
        }

        return {
            imdbId,
            name: personName,
            total: total || collected.length,
            credits: collected,
        };
    }

    /**
     * Résout un nom vers un identifiant IMDb en privilégiant les profils
     * dont l'activité connue est liée aux cascades.
     *
     * GARDE-FOU ANTI-FAUX-POSITIF : on n'accepte un résultat que si le nom
     * correspond EXACTEMENT (accents/casse normalisés) ET que la description
     * mentionne une activité de cascade/parkour/acrobatie. Sinon on renvoie
     * `null` plutôt qu'un homonyme non pertinent (ex. « Niels Dalery » ne doit
     * jamais être confondu avec un acteur homonyme sans lien avec les cascades).
     *
     * @param {string} name
     * @param {{allowUnverified?: boolean}} [options]
     * @returns {Promise<{imdbId:string,name:string,description:string}|null>}
     */
    async resolveImdbId(name, options = {}) {
        const results = await this.suggest(name);
        if (!results.length) return null;

        const normalize = (value) =>
            String(value || '')
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, ' ')
                .trim();

        const normalized = normalize(name);
        const exact = results.filter((r) => normalize(r.name) === normalized);
        if (!exact.length) return null;

        const stuntLike = exact.find((r) =>
            /stunt|cascade|parkour|acrobat|doublure|coordinateur/i.test(
                r.description,
            ),
        );
        if (stuntLike) return stuntLike;

        // Aucun profil « cascade » explicite : on n'accepte le résultat que si
        // l'appelant l'autorise explicitement (revue manuelle).
        if (options.allowUnverified) return exact[0];
        return null;
    }
}

/** Instance singleton. */
export const imdb = new ImdbClient();

export default imdb;
