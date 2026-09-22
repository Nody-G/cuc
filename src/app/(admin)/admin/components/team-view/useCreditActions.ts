'use client';

import type { FilmCredit, Instructor } from '@/types';
import { parseCredit } from '@/types';
import { upsertFilm } from '@/app/(admin)/admin/actions';
import { buildCreditString, type NewFilmDraft } from './team-credits';
import { creditTitleKey } from '@/lib/credit-title';

export interface UseCreditActionsArgs {
    editingMember: Instructor | null;
    setEditingMember: (next: Instructor) => void;
    /** Index des crédits (clé normalisée → crédit), fourni par `useCreditModel`. */
    creditIndex: ReadonlyMap<string, { raw: string; title: string; role: string }>;
    startTransition: (callback: () => void | Promise<void>) => void;
    showToast: (msg: string) => void;
    newFilmDraft: NewFilmDraft | null;
    setNewFilmDraft: (draft: NewFilmDraft | null) => void;
    setCreditSearch: (value: string) => void;
}

/**
 * Écritures du modèle de crédits (fiche en édition, jamais le catalogue).
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1) : chaque opération
 * reconstruit la chaîne "Titre — Rôle" persistée (`buildCreditString`) et
 * maintient l'appariement des mises en avant par titre normalisé — jamais par
 * chaîne brute. La création d'une fiche film passe par la Server Action
 * `upsertFilm`.
 */
export function useCreditActions({
    editingMember,
    setEditingMember,
    creditIndex,
    startTransition,
    showToast,
    newFilmDraft,
    setNewFilmDraft,
    setCreditSearch,
}: UseCreditActionsArgs) {
    const creditKey = (title: string) => creditTitleKey(title);

    /** Ajoute ou retire un film du catalogue comme crédit du formateur. */
    const toggleFilmCredit = (film: FilmCredit) => {
        if (!editingMember) return;
        const key = creditKey(film.title);
        const existing = creditIndex.get(key);
        const currentCredits = editingMember.notableCredits || [];
        const currentFeatured = editingMember.featuredCredits || [];

        if (existing) {
            // Retrait : on purge aussi la mise en avant correspondante (par titre).
            setEditingMember({
                ...editingMember,
                notableCredits: currentCredits.filter((c) => c !== existing.raw),
                featuredCredits: currentFeatured.filter(
                    (c) => creditKey(parseCredit(c).title || c) !== key
                ),
            });
            return;
        }

        const raw = buildCreditString(film.title, 'Cascadeur');
        setEditingMember({
            ...editingMember,
            notableCredits: [...currentCredits, raw],
        });
    };

    /** Change le rôle d'un crédit existant (reconstruit la chaîne). */
    const setCreditRole = (filmTitle: string, role: string) => {
        if (!editingMember) return;
        const key = creditKey(filmTitle);
        const existing = creditIndex.get(key);
        if (!existing) return;

        const nextRaw = buildCreditString(existing.title, role);
        const currentCredits = editingMember.notableCredits || [];
        const currentFeatured = editingMember.featuredCredits || [];

        setEditingMember({
            ...editingMember,
            notableCredits: currentCredits.map((c) => (c === existing.raw ? nextRaw : c)),
            // La mise en avant suit le nouveau libellé, appariée par titre.
            featuredCredits: currentFeatured.map((c) =>
                creditKey(parseCredit(c).title || c) === key ? nextRaw : c
            ),
        });
    };

    /** Bascule la mise en avant d'un crédit (appariement par titre). */
    const toggleFeatured = (filmTitle: string) => {
        if (!editingMember) return;
        const key = creditKey(filmTitle);
        const existing = creditIndex.get(key);
        if (!existing) return;

        const currentFeatured = editingMember.featuredCredits || [];
        const isFeatured = currentFeatured.some(
            (c) => creditKey(parseCredit(c).title || c) === key
        );

        setEditingMember({
            ...editingMember,
            featuredCredits: isFeatured
                ? currentFeatured.filter((c) => creditKey(parseCredit(c).title || c) !== key)
                : [...currentFeatured, existing.raw],
        });
    };

    /** Réordonne les crédits mis en avant (par titre normalisé). */
    const moveFeatured = (key: string, direction: -1 | 1) => {
        if (!editingMember) return;
        const featured = editingMember.featuredCredits || [];
        const idx = featured.findIndex((c) => creditKey(parseCredit(c).title || c) === key);
        if (idx < 0) return;
        const target = idx + direction;
        if (target < 0 || target >= featured.length) return;
        const next = [...featured];
        [next[idx], next[target]] = [next[target], next[idx]];
        setEditingMember({ ...editingMember, featuredCredits: next });
    };

    /**
     * Supprime définitivement un crédit de la filmographie du formateur
     * (et sa mise en avant éventuelle). Vaut pour le catalogue comme hors catalogue.
     */
    const removeCredit = (raw: string) => {
        if (!editingMember) return;
        const key = creditKey(parseCredit(raw).title || raw);
        setEditingMember({
            ...editingMember,
            notableCredits: (editingMember.notableCredits || []).filter((c) => c !== raw),
            featuredCredits: (editingMember.featuredCredits || []).filter(
                (c) => creditKey(parseCredit(c).title || c) !== key
            ),
        });
    };

    /**
     * Crée une fiche film manquante dans `site_films`, puis l'ajoute
     * immédiatement comme crédit du formateur en cours d'édition.
     *
     * C'est le point qui manquait : pouvoir référencer une œuvre absente du
     * catalogue sans quitter le Cockpit.
     */
    const createFilmAndCredit = async () => {
        if (!editingMember || !newFilmDraft) return;
        const title = newFilmDraft.title.trim();
        if (!title) return;

        const slug =
            title
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
                .slice(0, 60) || `film-${Date.now()}`;

        const year = newFilmDraft.year.trim();

        // 1. Ajout immédiat au formateur (optimiste).
        const raw = buildCreditString(year ? `${title} (${year})` : title, 'Cascadeur');
        const currentCredits = editingMember.notableCredits || [];
        if (!creditIndex.has(creditKey(title))) {
            setEditingMember({
                ...editingMember,
                notableCredits: [...currentCredits, raw],
            });
        }

        // 2. Persistance de la fiche film dans le catalogue.
        startTransition(async () => {
            const res = await upsertFilm({
                id: slug,
                title,
                year,
                category: newFilmDraft.category,
                stunt_roles: '',
                highlight: false,
                image: '',
                tag: '',
                imdb_url: '',
                allocine_url: '',
                trailer_url: '',
            });
            if (res && 'success' in res && !res.success) {
                showToast(`Fiche « ${title} » non enregistrée : ${res.error ?? 'erreur'}`);
            } else {
                showToast(`Fiche « ${title} » créée et ajoutée au formateur.`);
            }
        });

        setNewFilmDraft(null);
        setCreditSearch('');
    };

    return {
        toggleFilmCredit,
        setCreditRole,
        toggleFeatured,
        moveFeatured,
        removeCredit,
        createFilmAndCredit,
    };
}
