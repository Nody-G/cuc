/**
 * Façade `site-service` — l’implémentation est découpée dans `./site/**`
 * (un module par entité, règle SRP `AGENTS.md` § 1-2).
 *
 * Tous les imports existants (`@/lib/data/site-service`) restent valides :
 * la surface publique est strictement identique. Le client Supabase public
 * vit dans `./site/client` et n’est pas ré-exporté (il était privé).
 */

export * from './site/types';
export * from './site/content';
export * from './site/team';
export * from './site/films';
export * from './site/settings';
export * from './site/pages';
export * from './site/partners';
export * from './site/events';
export * from './site/inquiries';
export * from './site/audit';
export * from './site/navigation';
export * from './site/page-revisions';
export * from './site/defaults/pages';
export * from './site/defaults/partners';
export * from './site/defaults/events';
export * from './site/defaults/settings';
export * from './site/defaults/samples';
