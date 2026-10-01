'use client';

/**
 * Dialogue de restauration versionnée — présentation pure (`AGENTS.md` § 1).
 *
 * Volontairement **difficile à déclencher par accident** : le plan complet est
 * affiché, la phrase exacte et le mot de passe doivent être saisis. Les trois
 * vérifications restent **côté serveur** (`executeRestoreWithGuards`), cette
 * interface ne fait que faciliter la saisie. Le mot de passe est vidé de l'état
 * local dès l'appel effectué : il n'est jamais conservé ni affiché.
 */

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, X } from 'lucide-react';
import {
    isRestorePhraseValid,
    restoreConfirmationPhrase,
} from './backup-format';
import type { RestoreOutcome, RestorePlanView, RestoreRequest } from './backup-status.types';

interface RestoreConfirmDialogProps {
    plan: RestorePlanView;
    submitting: boolean;
    onCancel: () => void;
    onConfirm: (request: RestoreRequest) => Promise<RestoreOutcome>;
}

export const RestoreConfirmDialog: React.FC<RestoreConfirmDialogProps> = ({
    plan,
    submitting,
    onCancel,
    onConfirm,
}) => {
    const [phrase, setPhrase] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [applied, setApplied] = useState<RestoreOutcome | null>(null);

    const expected = restoreConfirmationPhrase(plan.snapshotId);
    const phraseOk = isRestorePhraseValid(plan.snapshotId, phrase);
    const canSubmit = phraseOk && password.length > 0 && !submitting;

    const handleConfirm = async () => {
        setError(null);
        const result = await onConfirm({ snapshotId: plan.snapshotId, phrase, password });
        setPassword('');
        if (result.ok) {
            setApplied(result);
        } else {
            setError(result.error ?? 'Restauration refusée ou échouée.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-black/85 backdrop-blur-xs overflow-y-auto" onClick={onCancel} role="dialog" aria-modal="true" aria-label="Confirmer la restauration">
            <div className="bg-[#0D0D12] border border-red-500/40 rounded-2xl w-full max-w-2xl p-6 space-y-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
                <div className="flex items-start justify-between border-b border-white/10 pb-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-mono text-red-400 uppercase mb-1">
                            <ShieldAlert className="w-3.5 h-3.5" /> Opération destructive
                        </div>
                        <h2 className="text-lg font-black text-white uppercase tracking-tight">Restaurer la version {plan.snapshotId}</h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Ceci est un retour arrière réel : les tables de contenu seront ramenées à l’état de l’instantané.
                        </p>
                    </div>
                    <button type="button" onClick={onCancel} className="p-1 rounded-lg text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 cursor-pointer" aria-label="Fermer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {error !== null && (
                    <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-xl text-red-300 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                        <span>{error}</span>
                    </div>
                )}

                {applied !== null && (
                    <div className="p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs space-y-2">
                        <div className="flex items-center gap-2 font-bold">
                            <CheckCircle2 className="w-4 h-4" /> Restauration appliquée — {applied.tables.length} table(s) traitée(s).
                        </div>
                        {applied.preSnapshotId !== null && (
                            <div className="text-[11px] text-emerald-300/80">Pré-instantané créé : {applied.preSnapshotId} — il permet un retour en arrière.</div>
                        )}
                        <div className="text-[11px] text-emerald-300/80">Rechargez le Cockpit pour voir l’état restauré.</div>
                    </div>
                )}

                <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                    <div className="px-3 py-2 text-[11px] font-mono text-gray-300 uppercase border-b border-white/10">Plan par table</div>
                    <div className="max-h-56 overflow-y-auto divide-y divide-white/5">
                        {plan.tables.map((table) => (
                            <div key={table.table} className="px-3 py-2 flex items-center justify-between gap-3 text-[11px] font-mono">
                                <span className="text-white truncate">{table.table}</span>
                                <span className="text-gray-400 whitespace-nowrap">
                                    +{table.insert} ~{table.update} −{table.delete} · préservées {table.preserved}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="px-3 py-2 text-[11px] font-mono text-gray-300 bg-white/5">
                        TOTAL : +{plan.totals.insert} ~{plan.totals.update} −{plan.totals.delete} · préservées {plan.totals.preserved}
                    </div>
                </div>

                <div className="rounded-xl bg-emerald-950/20 border border-emerald-500/20 p-3 space-y-1.5">
                    <div className="text-[11px] font-mono text-emerald-300 uppercase">Ce qui n’est pas touché</div>
                    <ul className="space-y-1 text-[11px] text-emerald-200/90 list-disc list-inside">
                        {plan.untouched.map((note) => (
                            <li key={note}>{note}</li>
                        ))}
                    </ul>
                </div>

                <div className="space-y-3">
                    <label className="block space-y-1.5">
                        <span className="text-[11px] font-mono text-gray-300 uppercase">Saisir la phrase de confirmation</span>
                        <code className="block text-[11px] text-[#FFE500] bg-white/5 border border-white/10 rounded-lg px-2 py-1 select-all">{expected}</code>
                        <input type="text" value={phrase} onChange={(event) => setPhrase(event.target.value)} className="w-full bg-[#08080C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#FFE500]/50" placeholder={expected} autoComplete="off" spellCheck={false} />
                    </label>

                    <label className="block space-y-1.5">
                        <span className="text-[11px] font-mono text-gray-300 uppercase">Mot de passe de votre compte</span>
                        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full bg-[#08080C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFE500]/50" autoComplete="current-password" />
                        <span className="block text-[10px] text-gray-500">Vérifié côté serveur, jamais conservé ni journalisé.</span>
                    </label>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-white/10 pt-4">
                    <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold cursor-pointer">
                        {applied !== null ? 'Fermer' : 'Annuler'}
                    </button>
                    <button type="button" onClick={() => void handleConfirm()} disabled={!canSubmit} className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 disabled:opacity-40 disabled:cursor-not-allowed text-black text-xs font-black uppercase cursor-pointer">
                        {submitting ? 'Restauration en cours…' : 'Restaurer cette version'}
                    </button>
                </div>
            </div>
        </div>
    );
};
