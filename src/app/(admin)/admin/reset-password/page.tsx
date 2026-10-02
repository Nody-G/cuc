'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle, CheckCircle2, ArrowLeft, RefreshCw } from 'lucide-react';
import { validatePasswordConfirmation } from '@/lib/auth/password-validation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // 1. Écoute de l'événement Supabase de récupération
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setIsReady(true);
      }
    });

    // 2. Traitement d'un éventuel code PKCE dans l'URL (?code=...)
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          setErrorMessage('Le lien de réinitialisation est invalide ou a expiré.');
        } else {
          setIsReady(true);
        }
      });
    } else {
      // Vérification si une session existe déjà
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setIsReady(true);
        }
      });
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const validation = validatePasswordConfirmation(password, confirmPassword);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Mot de passe invalide.');
      return;
    }

    const cleanPass = password.trim();

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: cleanPass,
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push('/admin');
      }, 2500);
    } catch {
      setErrorMessage('Une erreur est survenue lors de la mise à jour.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] flex flex-col items-center justify-center p-4 selection:bg-[#FFE500] selection:text-black">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center relative w-16 h-16 mb-2">
            <Image
              src="/images/logos/cuc-logo-yellow.png"
              alt="Campus Univers Cascades"
              width={64}
              height={64}
              className="object-contain drop-shadow-[0_0_20px_rgba(255,229,0,0.4)]"
              priority
            />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-white">
            Nouveau mot de passe
          </h1>
          <p className="text-xs font-mono text-gray-400">
            Définissez votre nouveau mot de passe d&apos;accès au Cockpit CUC
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0F0F14] border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="space-y-4 text-center py-2">
              <div className="inline-flex p-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-1">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-base font-bold text-white">
                Mot de passe mis à jour avec succès !
              </h2>
              <p className="text-xs text-gray-400">
                Vous allez être redirigé automatiquement vers le Cockpit...
              </p>
              <div className="pt-2">
                <Link
                  href="/admin"
                  className="inline-block py-2.5 px-6 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] text-black font-black text-xs uppercase tracking-wider transition"
                >
                  Accéder au Cockpit
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
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
                  Confirmer le mot de passe
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
                <span>Sécurité garantie par Supabase Auth & CUC Sign</span>
              </div>

              <button
                type="submit"
                disabled={loading || (!isReady && !password)}
                className="w-full py-3 px-4 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50"
              >
                {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                {loading ? 'Enregistrement...' : 'Enregistrer le nouveau mot de passe'}
              </button>
            </form>
          )}
        </div>

        {/* Retour connexion */}
        <div className="text-center">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-[#FFE500] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour à la page de connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
