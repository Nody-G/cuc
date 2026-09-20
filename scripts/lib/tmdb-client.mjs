/**
 * ==============================================================================
 * CUC — Client TMDB réutilisable
 * ==============================================================================
 * Client HTTP sobre pour l'API officielle TMDB (The Movie Database).
 *
 * Fonctionnalités :
 *  - Authentification par clé API (v3) ou Bearer token (v4)
 *  - Rate-limiting strict à 40 requêtes / 10 secondes (limite officielle TMDB)
 *  - Retry avec backoff exponentiel sur erreurs réseau et 429/5xx
 *  - Cache disque persistant (évite de re-scraper inutilement)
 *  - Aucune dépendance externe (fetch natif Node 18+)
 *
 * Usage :
 *   import { tmdb } from './lib/tmdb-client.mjs';
 *   const person = await tmdb.get('/person/1234');
 *   const found  = await tmdb.get('/find/tt1234567', { external_source: 'imdb_id' });
 * ==============================================================================
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const CACHE_DIR = path.resolve(process.cwd(), '.cache', 'tmdb');

// Limite officielle TMDB : 40 requêtes / 10 secondes.
const RATE_LIMIT_MAX = 40;
const RATE_LIMIT_WINDOW_MS = 10_000;

// Politique de retry
const MAX_RETRIES = 4;
const BASE_BACKOFF_MS = 500;

/**
 * Résout la clé d'authentification TMDB depuis l'environnement.
 * Accepte TMDB_API_KEY (v3) ou TMDB_ACCESS_TOKEN (v4 Bearer).
 */
function resolveAuth() {
    const apiKey = process.env.TMDB_API_KEY || '';
    const accessToken = process.env.TMDB_ACCESS_TOKEN || '';

    if (!apiKey && !accessToken) {
        throw new Error(
            'Aucune clé TMDB trouvée. Ajoutez TMDB_API_KEY=... dans .env.local\n' +
            'Créez un compte gratuit sur https://www.themoviedb.org/settings/api'
        );
    }

    return { apiKey, accessToken };
}

/**
 * File d'attente glissante pour respecter le rate-limit TMDB.
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
            this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);

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

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Génère un nom de fichier de cache déterministe pour un endpoint + params.
 */
function cacheKeyFor(endpoint, params) {
    const sortedParams = Object.keys(params)
        .sort()
        .map((k) => `${k}=${params[k]}`)
        .join('&');
    const raw = `${endpoint}?${sortedParams}`;
    const hash = crypto.createHash('sha1').update(raw).digest('hex').slice(0, 16);
    const slug = endpoint.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '');
    return `${slug}__${hash}.json`;
}

class TmdbClient {
    constructor() {
        this.rateLimiter = new RateLimiter(RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
        this.requestCount = 0;
        this.cacheHits = 0;
        this.cacheEnabled = true;
        this._auth = null;
    }

    get auth() {
        if (!this._auth) this._auth = resolveAuth();
        return this._auth;
    }

    /**
     * Active ou désactive le cache disque.
     */
    setCacheEnabled(enabled) {
        this.cacheEnabled = Boolean(enabled);
    }

    /**
     * Effectue un GET sur l'API TMDB avec cache, rate-limit et retry.
     *
     * @param {string} endpoint - ex: '/person/1234/movie_credits'
     * @param {Record<string, string|number>} [params] - query params additionnels
     * @param {{ useCache?: boolean }} [options]
     * @returns {Promise<any>}
     */
    async get(endpoint, params = {}, options = {}) {
        const useCache = options.useCache !== false && this.cacheEnabled;
        const cacheFile = path.join(CACHE_DIR, cacheKeyFor(endpoint, params));

        if (useCache && fs.existsSync(cacheFile)) {
            try {
                const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
                this.cacheHits++;
                return cached;
            } catch {
                // Cache corrompu : on ignore et on re-fetch.
            }
        }

        const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null) {
                url.searchParams.set(key, String(value));
            }
        }

        const headers = { Accept: 'application/json' };
        if (this.auth.accessToken) {
            headers.Authorization = `Bearer ${this.auth.accessToken}`;
        } else {
            url.searchParams.set('api_key', this.auth.apiKey);
        }

        let lastError = null;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            await this.rateLimiter.acquire();

            try {
                const res = await fetch(url.toString(), { headers });
                this.requestCount++;

                if (res.status === 429) {
                    const retryAfter = Number(res.headers.get('retry-after')) || 0;
                    const waitMs = retryAfter > 0 ? retryAfter * 1000 : BASE_BACKOFF_MS * 2 ** attempt;
                    await sleep(waitMs);
                    lastError = new Error(`TMDB 429 (rate limit) sur ${endpoint}`);
                    continue;
                }

                if (res.status >= 500) {
                    await sleep(BASE_BACKOFF_MS * 2 ** attempt);
                    lastError = new Error(`TMDB ${res.status} sur ${endpoint}`);
                    continue;
                }

                if (res.status === 404) {
                    return null;
                }

                if (!res.ok) {
                    const body = await res.text().catch(() => '');
                    throw new Error(`TMDB ${res.status} sur ${endpoint} — ${body.slice(0, 200)}`);
                }

                const json = await res.json();

                if (useCache) {
                    fs.mkdirSync(CACHE_DIR, { recursive: true });
                    fs.writeFileSync(cacheFile, JSON.stringify(json, null, 2), 'utf8');
                }

                return json;
            } catch (err) {
                lastError = err;
                if (attempt < MAX_RETRIES) {
                    await sleep(BASE_BACKOFF_MS * 2 ** attempt);
                }
            }
        }

        throw lastError || new Error(`Échec TMDB sur ${endpoint}`);
    }

    /**
     * Résout un identifiant IMDb (ex: 'nm8686683') vers une personne TMDB.
     * @param {string} imdbId
     */
    async findByImdbId(imdbId) {
        if (!imdbId) return null;
        const data = await this.get(`/find/${imdbId}`, { external_source: 'imdb_id' });
        if (!data || !Array.isArray(data.person_results) || data.person_results.length === 0) {
            return null;
        }
        return data.person_results[0];
    }

    /**
     * Recherche une personne par nom.
     * @param {string} query
     */
    async searchPerson(query) {
        const data = await this.get('/search/person', { query, include_adult: 'false' });
        return data?.results || [];
    }

    /**
     * Récupère les crédits cinéma d'une personne.
     * @param {number|string} personId
     */
    async getMovieCredits(personId) {
        return this.get(`/person/${personId}/movie_credits`);
    }

    /**
     * Récupère les crédits télévision d'une personne.
     * @param {number|string} personId
     */
    async getTvCredits(personId) {
        return this.get(`/person/${personId}/tv_credits`);
    }

    /**
     * Statistiques d'usage pour le reporting.
     */
    stats() {
        return {
            requests: this.requestCount,
            cacheHits: this.cacheHits,
        };
    }
}

export const tmdb = new TmdbClient();
export { TmdbClient, CACHE_DIR };
