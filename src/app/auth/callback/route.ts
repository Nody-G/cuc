import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAuditEvent } from '@/app/(admin)/admin/actions/audit';

/**
 * Route de rappel OAuth Supabase (PKCE).
 *
 * Échange le paramètre `?code=...` renvoyé par Supabase contre une session
 * persistée dans les cookies HTTP, puis vérifie les privilèges d'accès au Cockpit.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/admin';

  if (code) {
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && session?.user) {
      const adminClient = createAdminClient();
      const { data: profile } = await adminClient
        .from('profiles')
        .select('role, full_name, email')
        .eq('id', session.user.id)
        .maybeSingle();

      const userRole = profile?.role || '';
      const isAuthorized = ['admin', 'directeur', 'secretaire'].includes(userRole);
      const userIdentifier = session.user.email || profile?.email || session.user.id;

      if (!isAuthorized) {
        // Journalisation chirurgicale de la tentative non autorisée
        void logAuditEvent(
          'auth.google_unauthorized',
          userIdentifier,
          `Tentative d'accès non autorisée via Google OAuth (compte: ${userIdentifier}, rôle: ${userRole || 'aucun'})`
        );

        // Déconnexion immédiate pour éliminer les cookies de session non autorisés
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/admin/login?error=unauthorized`);
      }

      // Connexion autorisée : journalisation d'audit
      void logAuditEvent(
        'auth.google_login_success',
        userIdentifier,
        `Connexion réussie via Google OAuth (${profile?.full_name || userIdentifier}, rôle: ${userRole})`
      );

      const safeNext = next.startsWith('/admin') ? next : '/admin';
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${origin}/admin/login?error=oauth_failed`);
}
