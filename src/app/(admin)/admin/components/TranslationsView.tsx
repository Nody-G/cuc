'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getTranslationRows, type TranslationRow } from '@/lib/data/translations';
import { upsertSiteTranslation } from '@/app/(admin)/admin/actions';
import { Globe, Save, RefreshCw, AlertTriangle } from 'lucide-react';

interface TranslationsViewProps {
    showToast?: (message: string) => void;
}

/**
 * Cockpit — « Traductions EN ».
 *
 * Édite la table `site_translations` (overlay JSON par entité/locale).
 * Validation JSON côté client avant enregistrement ; l'écriture passe par la
 * server action `upsertSiteTranslation` (RLS admin).
 */
export const TranslationsView: React.FC<TranslationsViewProps> = ({ showToast }) => {
    const [rows, setRows] = useState<TranslationRow[]>([]);
    const [drafts, setDrafts] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [jsonErrors, setJsonErrors] = useState<Record<string, boolean>>({});

    const load = useCallback(async () => {
        const { rows: list, error } = await getTranslationRows();

        if (!error) {
            setRows(list);
            setDrafts(
                Object.fromEntries(list.map((r) => [r.id, JSON.stringify(r.payload, null, 2)]))
            );
            setJsonErrors({});
        } else {
            showToast?.(`Chargement impossible : ${error}`);
        }
        setLoading(false);
    }, [showToast]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const { rows: list, error } = await getTranslationRows();

            if (cancelled) return;

            if (!error) {
                setRows(list);
                setDrafts(
                    Object.fromEntries(list.map((r) => [r.id, JSON.stringify(r.payload, null, 2)]))
                );
                setJsonErrors({});
            } else {
                showToast?.(`Chargement impossible : ${error}`);
            }
            setLoading(false);
        })();

        return () => {
            cancelled = true;
        };
    }, [showToast]);

    const handleChange = (id: string, value: string) => {
        setDrafts((prev) => ({ ...prev, [id]: value }));
        try {
            JSON.parse(value);
            setJsonErrors((prev) => ({ ...prev, [id]: false }));
        } catch {
            setJsonErrors((prev) => ({ ...prev, [id]: true }));
        }
    };

    const save = async (row: TranslationRow) => {
        let payload: Record<string, unknown>;
        try {
            payload = JSON.parse(drafts[row.id] || '{}');
        } catch {
            showToast?.(`JSON invalide pour ${row.entity}/${row.entity_id}`);
            return;
        }

        setSavingId(row.id);
        const res = await upsertSiteTranslation({
            entity: row.entity,
            entity_id: row.entity_id,
            locale: row.locale,
            payload,
            is_published: row.is_published,
        });
        setSavingId(null);

        if (res.success) {
            showToast?.(`Traduction enregistrée : ${row.entity}/${row.entity_id}`);
            setLoading(true);
            await load();
        } else {
            showToast?.(`Enregistrement impossible : ${res.error || 'Erreur inconnue'}`);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                        <Globe className="w-5 h-5 text-amber-400" />
                        Traductions EN
                    </h1>
                    <p className="text-sm text-zinc-400 mt-1">
                        Overlay de traduction (table <code className="text-zinc-300">site_translations</code>) fusionné
                        par-dessus le contenu FR. Aucune traduction absente ne casse la vitrine : repli FR automatique.
                    </p>
                </div>
                <button
                    onClick={() => {
                        setLoading(true);
                        load();
                    }}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-700 text-xs text-zinc-300 hover:border-amber-400 hover:text-amber-400 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Recharger
                </button>
            </div>

            {loading ? (
                <div className="text-sm text-zinc-400">Chargement…</div>
            ) : rows.length === 0 ? (
                <div className="text-sm text-zinc-400">
                    Aucune traduction enregistrée. Lancez{' '}
                    <code className="text-zinc-300">node scripts/seed_site_translations_en.mjs</code> pour amorcer.
                </div>
            ) : (
                <div className="space-y-4">
                    {rows.map((row) => (
                        <div key={row.id} className="border border-zinc-800 rounded-xl p-4 bg-zinc-950/40">
                            <div className="flex items-center justify-between gap-3 mb-3">
                                <div className="text-sm">
                                    <span className="font-mono-tech text-amber-400">{row.entity}</span>
                                    <span className="text-zinc-500"> / </span>
                                    <span className="font-mono-tech text-zinc-200">{row.entity_id}</span>
                                    <span className="ml-2 text-[10px] uppercase tracking-wider text-zinc-500">
                                        {row.locale}
                                    </span>
                                </div>
                                <button
                                    onClick={() => save(row)}
                                    disabled={savingId === row.id || jsonErrors[row.id]}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-400 text-black hover:bg-amber-300 transition-colors disabled:opacity-40"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    Enregistrer
                                </button>
                            </div>

                            <textarea
                                value={drafts[row.id] ?? ''}
                                onChange={(e) => handleChange(row.id, e.target.value)}
                                spellCheck={false}
                                rows={10}
                                className={`w-full font-mono-tech text-xs bg-black/60 border rounded-lg p-3 text-zinc-200 focus:outline-none ${jsonErrors[row.id]
                                    ? 'border-red-500/70 focus:border-red-500'
                                    : 'border-zinc-800 focus:border-amber-400'
                                    }`}
                            />
                            {jsonErrors[row.id] && (
                                <div className="mt-2 flex items-center gap-2 text-[11px] text-red-400">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    JSON invalide — corrigez avant d'enregistrer.
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TranslationsView;
