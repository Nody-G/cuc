'use client';

import { useMemo, useState } from 'react';
import type { FilmCredit, Instructor } from '@/types';
import { creditTitleKey } from '@/lib/credit-title';
import { parseCredit } from '@/types';
import { extractRoleFromCredit, type NewFilmDraft } from './team-credits';

/**
 * Modèle de la filmographie en cours d'édition (Cockpit).
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1) : états locaux (recherche,
 * tri, brouillon de fiche) et dérivations — index des crédits, ensemble des
 * mises en avant, listes triées, compteurs. Aucune écriture ici.
 */
export function useCreditModel(editingMember: Instructor | null, films: FilmCredit[]) {
    /**
     * Recherche du catalogue pour AJOUTER un crédit au formateur.
     * Vide = aucun résultat affiché (on ne noie pas l'écran sous 700 films).
     */
    const [creditSearch, setCreditSearch] = useState('');

    /**
     * Formulaire de création d'une fiche film manquante au catalogue.
     * `null` = fermé. Sinon contient le titre pré-rempli depuis la recherche.
     */
    const [newFilmDraft, setNewFilmDraft] = useState<NewFilmDraft | null>(null);

    /** Tri de la liste « Tous les crédits » : par date (défaut) ou par nom. */
    const [creditSort, setCreditSort] = useState<'date' | 'name'>('date');

    /**
     * Clé canonique d'un titre — déléguée au helper partagé `creditTitleKey`.
     * Elle retire notamment le suffixe d'année « (2021) » : sans cela, les
     * crédits du formateur (« Lupin (2021) ») ne correspondaient jamais aux
     * titres nus du catalogue (« Lupin »), rendant la mise en avant inopérante.
     */
    const creditKey = (title: string) => creditTitleKey(title);

    /**
     * Index des crédits du formateur, dérivé de `notableCredits`.
     * `raw` = chaîne persistée "Titre — Rôle" (ou "Titre"), `title` = titre
     * affiché, `role` = rôle courant.
     */
    const creditIndex = useMemo(() => {
        const map = new Map<string, { raw: string; title: string; role: string }>();
        (editingMember?.notableCredits || []).forEach((raw) => {
            const parsed = parseCredit(raw);
            const title = (parsed.title || raw).trim();
            if (!title) return;
            map.set(creditKey(title), {
                raw,
                title,
                role: parsed.role || extractRoleFromCredit(raw),
            });
        });
        return map;
    }, [editingMember?.notableCredits]);

    /**
     * Ensemble des titres mis en avant (clé = titre normalisé).
     * On résout chaque entrée de `featured_credits` via `parseCredit` pour
     * ne comparer que des titres — jamais des chaînes "Titre — Rôle".
     */
    const featuredSet = useMemo(
        () =>
            new Set(
                (editingMember?.featuredCredits || [])
                    .map((c) => parseCredit(c).title || c)
                    .map((t) => creditKey(t))
                    .filter(Boolean)
            ),
        [editingMember?.featuredCredits]
    );

    /**
     * Résultats de recherche du catalogue pour AJOUTER un crédit.
     * On n'affiche rien tant que la recherche est vide (le catalogue compte
     * plusieurs centaines de films) ; on plafonne à 40 résultats.
     */
    const searchResults = useMemo(() => {
        const q = creditSearch.trim().toLowerCase();
        if (!q) return [];
        return films
            .filter((f) => f.title.toLowerCase().includes(q))
            .sort((a, b) => {
                const ya = parseInt(String(a.year), 10) || 0;
                const yb = parseInt(String(b.year), 10) || 0;
                return yb - ya;
            })
            .slice(0, 40);
    }, [films, creditSearch]);

    /** Ensemble des clés de titres présents dans le catalogue. */
    const catalogueKeys = useMemo(
        () => new Set(films.map((f) => creditKey(f.title))),
        [films]
    );

    /**
     * SOURCE UNIQUE DE VÉRITÉ : la totalité des crédits du formateur.
     *
     * Contient *tous* les `notableCredits`, qu'ils soient présents au catalogue
     * ou non. Chaque entrée expose : le libellé brut, le titre, le rôle, la clé
     * normalisée, et un drapeau `inCatalogue`.
     */
    const allCredits = useMemo(() => {
        const filmByKey = new Map(films.map((f) => [creditKey(f.title), f]));
        return (editingMember?.notableCredits || [])
            .map((raw) => {
                const parsed = parseCredit(raw);
                const title = (parsed.title || raw).trim();
                const key = creditKey(title);
                const film = filmByKey.get(key);
                // Année : priorité au catalogue, sinon extraite du titre « Titre (2021) ».
                const yearFromTitle = title.match(/\((\d{4})(?:\s*[-–—]\s*\d{4})?\)\s*$/)?.[1];
                const year = film?.year ? String(film.year) : yearFromTitle || '';
                return {
                    raw,
                    title: title.replace(/\s*\(\s*\d{4}\s*(?:[-–—]\s*\d{4}\s*)?\)\s*$/, '').trim() || title,
                    role: parsed.role || extractRoleFromCredit(raw),
                    key,
                    year,
                    inCatalogue: catalogueKeys.has(key),
                };
            })
            .filter((e) => e.key);
    }, [editingMember?.notableCredits, catalogueKeys, films]);

    /**
     * Tri de la liste « Tous les crédits » : par date (année décroissante) ou
     * par nom (alphabétique). Les crédits sans année sont relégués en fin de
     * tri par date.
     */
    const allCreditsSorted = useMemo(() => {
        const list = [...allCredits];
        if (creditSort === 'name') {
            return list.sort((a, b) =>
                a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' })
            );
        }
        return list.sort((a, b) => {
            const ya = parseInt(a.year, 10) || 0;
            const yb = parseInt(b.year, 10) || 0;
            if (yb !== ya) return yb - ya;
            return a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' });
        });
    }, [allCredits, creditSort]);

    /**
     * Liste unifiée : les crédits mis en avant d'abord (dans l'ordre choisi),
     * puis les autres crédits du formateur. Sert de source unique d'affichage
     * pour éviter la confusion entre "catalogue" et "crédits".
     */
    const featuredCreditsOrdered = useMemo(() => {
        const list = editingMember?.featuredCredits || [];
        return list
            .map((raw, idx) => {
                const parsed = parseCredit(raw);
                const title = (parsed.title || raw).trim();
                return { raw, title, key: creditKey(title), rank: idx };
            })
            .filter((e) => e.key);
    }, [editingMember?.featuredCredits]);

    /**
     * CATALOGUE : uniquement les films mis en avant, dans l'ordre choisi.
     * C'est cette liste — et elle seule — qui pilote l'ordre d'affichage
     * en tête de la fiche publique.
     */
    const catalogueFilms = useMemo(() => {
        const byKey = new Map(films.map((f) => [creditKey(f.title), f]));
        return featuredCreditsOrdered
            .map((entry) => {
                const film = byKey.get(entry.key);
                return film ? { entry, film } : null;
            })
            .filter(
                (x): x is { entry: (typeof featuredCreditsOrdered)[number]; film: FilmCredit } =>
                    Boolean(x)
            );
    }, [films, featuredCreditsOrdered]);

    return {
        creditSearch,
        setCreditSearch,
        newFilmDraft,
        setNewFilmDraft,
        creditSort,
        setCreditSort,
        creditIndex,
        featuredSet,
        searchResults,
        allCredits,
        allCreditsSorted,
        featuredCreditsOrdered,
        catalogueFilms,
        selectedCount: creditIndex.size,
        featuredCount: featuredCreditsOrdered.length,
    };
}
