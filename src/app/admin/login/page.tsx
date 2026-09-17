'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Shield, Lock, Mail, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const normalizedEmail = email.includes('@') ? email.trim() : `${email.trim()}@cuc.fr`;
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        setErrorMessage(error.message === 'Invalid login credentials'
          ? 'Email ou mot de passe incorrect.'
          : error.message
        );
        setLoading(false);
        return;
      }

      if (data.user) {
        // Vérifier le rôle de l'utilisateur dans profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profile?.role !== 'admin') {
          // Si le profil n'a pas le rôle admin, déconnexion immédiate
          await supabase.auth.signOut();
          setErrorMessage('Accès refusé : ce compte ne possède pas les privilèges administrateur.');
          setLoading(false);
          return;
        }

        router.push('/admin');
        router.refresh();
      }
    } catch {
      setErrorMessage('Une erreur est survenue lors de la connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] flex flex-col items-center justify-center p-4 selection:bg-[#FFE500] selection:text-black">
      <div className="max-w-md w-full space-y-6">
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FFE500] text-black font-black text-2xl shadow-[0_0_30px_rgba(255,229,0,0.3)] mb-2">
            CUC
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
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="admin ou admin@cuc.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFE500] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">
                Mot de Passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFE500] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99]"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              {loading ? 'Connexion en cours...' : 'Accéder au Cockpit'}
            </button>
          </form>

          <div className="pt-4 border-t border-white/10 text-center text-xs text-gray-400">
            <span className="inline-flex items-center gap-1.5">
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
