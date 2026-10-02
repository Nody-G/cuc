import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Route de rappel OAuth Supabase (PKCE).
 *
 * Échange le paramètre `?code=...` renvoyé par Supabase contre une session
 * persistée dans les cookies HTTP, puis redirige vers la destination `next`.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/admin';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const safeNext = next.startsWith('/admin') ? next : '/admin';
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${origin}/admin/login?error=oauth_failed`);
}
