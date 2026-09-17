'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Users, Film, Bell, LayoutDashboard, Globe, Shield } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Si on est sur la page de connexion, afficher uniquement le formulaire sans la sidebar
  if (pathname === '/admin/login') {
    return (
      <React.Suspense fallback={null}>
        {children}
      </React.Suspense>
    );
  }

  const navItems = [
    { href: '/admin', label: 'Tableau de Bord', icon: LayoutDashboard },
    { href: '/admin/sessions', label: 'Sessions & Stages', icon: Calendar },
    { href: '/admin/team', label: 'Équipe & Coachs', icon: Users },
    { href: '/admin/films', label: 'Filmographie', icon: Film },
    { href: '/admin/announcements', label: 'Bandeau Flash', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-[#070709] text-gray-100 flex flex-col md:flex-row antialiased">
      {/* Sidebar latérale */}
      <aside className="w-full md:w-64 bg-[#0D0D12] border-b md:border-b-0 md:border-r border-white/10 flex flex-col shrink-0">
        {/* Header logo */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FFE500] flex items-center justify-center text-black font-black text-xl shadow-[0_0_20px_rgba(255,229,0,0.3)]">
              CUC
            </div>
            <div>
              <div className="text-sm font-bold tracking-wider text-white uppercase font-mono">COCKPIT</div>
              <div className="text-[10px] text-[#FFE500] font-semibold tracking-widest uppercase">Admin Vitrine</div>
            </div>
          </Link>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        </div>

        {/* Navigation principale */}
        <nav className="p-4 space-y-1.5 flex-1">
          <div className="px-3 py-2 text-[10px] font-mono tracking-widest text-gray-400 uppercase">
            Gestion du contenu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#FFE500] text-black font-bold shadow-md'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-gray-400'}`} />
                {item.label}
              </Link>
            );
          })}

          <div className="pt-4 px-3 py-2 text-[10px] font-mono tracking-widest text-gray-400 uppercase">
            Raccourcis
          </div>

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-[#FFE500] hover:bg-white/5 transition-colors"
          >
            <Globe className="w-4 h-4 text-gray-400" />
            Voir le site vitrine ↗
          </Link>
        </nav>

        {/* Footer sidebar */}
        <div className="p-4 border-t border-white/10 bg-black/20 text-xs text-gray-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#FFE500]" />
            <span className="text-[11px] font-mono">Instance CUC Sign</span>
          </div>
          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-300 font-mono">v2.0</span>
        </div>
      </aside>

      {/* Zone de contenu */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <React.Suspense
          fallback={
            <div className="p-10 text-center text-xs font-mono text-gray-400">
              Chargement du Cockpit CUC...
            </div>
          }
        >
          {children}
        </React.Suspense>
      </main>
    </div>
  );
}
