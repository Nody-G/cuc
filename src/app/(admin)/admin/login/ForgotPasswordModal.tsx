'use client';

import React, { useState } from 'react';
import { Mail, AlertCircle, CheckCircle2, RefreshCw, X, ExternalLink } from 'lucide-react';
import { requestPasswordResetAction } from '../actions';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultIdentifier?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultIdentifier = '',
}) => {
  const [identifier, setIdentifier] = useState(defaultIdentifier);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setLoading(true);
    setErrorMessage(null);

    const res = await requestPasswordResetAction(identifier);
    setLoading(false);

    if (res.success) {
      setIsSent(true);
      if (res.devRecoveryLink) {
        setDevLink(res.devRecoveryLink);
      }
    } else {
      setErrorMessage(res.error || 'Impossible d\'envoyer le lien de réinitialisation.');
    }
  };

  const handleResetAndClose = () => {
    setIsSent(false);
    setDevLink(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#0F0F14] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">
        <button
          type="button"
          onClick={handleResetAndClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <h2 className="text-lg font-black uppercase tracking-wider text-white">
            Mot de passe oublié
          </h2>
          <p className="text-xs text-gray-400">
            Recevez un lien sécurisé pour définir un nouveau mot de passe.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isSent ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-emerald-300">Demande prise en compte</p>
                <p className="text-emerald-400/90 leading-relaxed">
                  Si un compte administrateur correspond à cette saisie, un email contenant les instructions de réinitialisation vient d&apos;être expédié.
                </p>
              </div>
            </div>

            {devLink && (
              <div className="p-3 bg-zinc-900 border border-amber-500/30 rounded-lg space-y-2">
                <div className="text-[11px] font-mono text-amber-300 flex items-center gap-1.5">
                  <span>Repli local (Mode dev) :</span>
                </div>
                <a
                  href={devLink}
                  className="inline-flex items-center gap-1.5 text-xs text-[#FFE500] hover:underline font-mono break-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  Ouvrir le lien de récupération
                </a>
              </div>
            )}

            <button
              type="button"
              onClick={handleResetAndClose}
              className="w-full py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition"
            >
              Retour à la connexion
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">
                Identifiant ou Email administrateur
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="nom@exemple.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFE500] transition-colors font-mono"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-gray-300 text-xs transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="py-2.5 px-4 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50"
              >
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {loading ? 'Envoi...' : 'Envoyer le lien'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
