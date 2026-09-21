'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { loginAdminAction } from '../actions';
import { Shield, Lock, Mail, ArrowLeft, AlertCircle, RefreshCw, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const cleanInput = email.trim().toLowerCase();
    const normalizedEmail = cleanInput.includes('@') ? cleanInput : `${cleanInput}@cuc.fr`;
    const cleanPassword = password.trim();

    try {
      // 1. Tentative d'authentification client Supabase
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: cleanPassword,
      });

      if (error) {
        // En cas d'échec côté client (ex: restriction de cookies tiers, extensions, etc.), tentative via Server Action
        const serverResult = await loginAdminAction(cleanInput, cleanPassword);
        if (serverResult.success) {
          window.location.href = '/admin';
          return;
        }

        setErrorMessage(
          error.message === 'Invalid login credentials'
            ? 'Identifiant ou mot de passe incorrect. Assurez-vous d\'utiliser "admin" et le mot de passe "password".'
            : error.message
        );
        setLoading(false);
        return;
      }

      if (data.user) {
        // 2. Vérification du rôle administrateur dans la table profiles
        const { data: profile, error: profError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profError || profile?.role !== 'admin') {
          // Si le profil n'a pas le rôle admin, déconnexion immédiate
          await supabase.auth.signOut();
          setErrorMessage('Accès refusé : ce compte ne possède pas les privilèges administrateur.');
          setLoading(false);
          return;
        }

        // 3. Redirection ferme vers le Cockpit
        window.location.href = '/admin';
      }
    } catch {
      // Fallback ultime : appel de la Server Action
      try {
        const serverResult = await loginAdminAction(cleanInput, cleanPassword);
        if (serverResult.success) {
          window.location.href = '/admin';
          return;
        }
        setErrorMessage(serverResult.error || 'Erreur lors de la connexion.');
      } catch {
        setErrorMessage('Une erreur inattendue est survenue.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillQuickCredentials = () => {
    setEmail('admin');
    setPassword('password');
  };

  return (
    <div className="min-h-screen bg-[#070709] flex flex-col items-center justify-center p-4 selection:bg-[#FFE500] selection:text-black">
      <div className="max-w-md w-full space-y-6">
        {/* Header Logo */}
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
            Cockpit Administration
          </h1>
          <p className="text-xs font-mono text-gray-400">
            Connexion sécurisée pour l&apos;équipe du Campus Univers Cascades
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-[#0F0F14] border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">
                Identifiant ou Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="admin ou admin@cuc.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFE500] transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">
                Mot de Passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFE500] transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-gray-500 hover:text-white transition-colors"
                  title={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              {loading ? 'Connexion en cours...' : 'Accéder au Cockpit'}
            </button>
          </form>

          {/* Bouton de remplissage rapide en 1-clic */}
          <div className="pt-2">
            <button
              type="button"
              onClick={fillQuickCredentials}
              className="w-full py-2 px-3 rounded-lg bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-amber-300 text-xs font-mono flex items-center justify-center gap-2 transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#FFE500]" />
              <span>Remplir avec l&apos;identifiant de production</span>
            </button>
          </div>

          <div className="pt-3 border-t border-white/10 text-center text-[11px] text-gray-400">
            <span className="inline-flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Authentification unifiée avec CUC Sign
            </span>
          </div>
        </div>

        {/* Retour au site vitrine */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-[#FFE500] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retourner au site vitrine
          </Link>
        </div>
      </div>
    </div>
  );
}
