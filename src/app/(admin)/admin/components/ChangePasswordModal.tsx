'use client';

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, X, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';
import { changeCurrentUserPasswordAction } from '../actions';
import { validatePasswordConfirmation } from '@/lib/auth/password-validation';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  showToast,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setPassword('');
    setConfirmPassword('');
    setErrorMessage(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const validation = validatePasswordConfirmation(password, confirmPassword);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Mot de passe invalide.');
      return;
    }

    const cleanPass = password.trim();

    setLoading(true);
    const res = await changeCurrentUserPasswordAction(cleanPass);
    setLoading(false);

    if (res.success) {
      showToast('Votre mot de passe a été mis à jour avec succès.');
      handleClose();
    } else {
      setErrorMessage(res.error || 'Impossible de mettre à jour le mot de passe.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#0F0F14] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <h2 className="text-lg font-black uppercase tracking-wider text-white">
            Changer mon mot de passe
          </h2>
          <p className="text-xs text-gray-400">
            Mettez à jour le mot de passe de votre compte administrateur.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">
              Nouveau mot de passe (min. 8 caractères)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFE500] transition-colors font-mono"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">
              Confirmer le nouveau mot de passe
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFE500] transition-colors font-mono"
              />
            </div>
          </div>

          <div className="text-[11px] font-mono text-gray-400 flex items-center gap-1.5 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FFE500]" />
            <span>Sécurité certifiée Supabase Auth</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
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
              {loading ? 'Mise à jour...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
