import React from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { checkIsAdmin } from './actions/auth';
import { isAuthFlowPath } from '@/lib/auth/admin-guard';

/**
 * Layout racine du Cockpit CUC — Frontière de sécurité Serveur.
 *
 * Exécute la vérification d'autorisation `checkIsAdmin()` côté serveur
 * avant tout rendu :
 * - Route protégée sans droits valides → `redirect('/admin/login?next=...')`
 * - Route de connexion alors que l'utilisateur est déjà admin → `redirect('/admin')`
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const currentPath = headerList.get('x-current-path') || '';
  const isAuthRoute = isAuthFlowPath(currentPath);

  const isAdmin = await checkIsAdmin();

  if (!isAuthRoute && !isAdmin) {
    const nextParam = currentPath && currentPath !== '/admin'
      ? `?next=${encodeURIComponent(currentPath)}`
      : '';
    redirect(`/admin/login${nextParam}`);
  }

  if (isAdmin && (currentPath === '/admin/login' || currentPath.startsWith('/admin/login/'))) {
    redirect('/admin');
  }

  return (
    <div className="min-h-screen bg-[#070709] text-gray-100 antialiased">
      {children}
    </div>
  );
}

