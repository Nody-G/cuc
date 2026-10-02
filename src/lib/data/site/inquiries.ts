/**
 * Candidatures (inquiries) — extrait de `site-service.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2.
 */

import { loadSupabaseBrowserClient } from '@/lib/supabase/lazy-client';
import { getSupabaseClient } from './client';
import { SiteInquiry } from './types';
import { SAMPLE_INQUIRIES } from './defaults/samples';

/**
 * Récupère la liste des candidatures et demandes de contact.
 * Se synchronise en direct avec Supabase (table dédiée site_inquiries + miroir site_settings).
 * Côté client Cockpit, utilise le client de session authentifié pour satisfaire la politique RLS.
 */
export async function getInquiries(): Promise<SiteInquiry[]> {
  try {
    const supabase = typeof window !== 'undefined'
      ? await loadSupabaseBrowserClient()
      : await getSupabaseClient();
    const { data, error } = await supabase
      .from('site_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      return data as SiteInquiry[];
    }

    // 2. Fallback Supabase site_settings key='inquiries' (miroir de secours « zéro orphelin »)
    const { data: settingRow } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'inquiries')
      .maybeSingle();

    if (settingRow?.value?.list && Array.isArray(settingRow.value.list) && settingRow.value.list.length > 0) {
      return settingRow.value.list as SiteInquiry[];
    }

    if (!error && Array.isArray(data)) {
      return data as SiteInquiry[];
    }
  } catch {
    // Ignore error
  }

  // Doctrine « Zéro Valeur Orpheline » : aucun repli sur localStorage.
  // Un cache navigateur non synchronisé pouvait masquer la base et afficher des
  // candidatures obsolètes. Le dernier recours est l'échantillon versionné du
  // dépôt, identique pour le Cockpit comme pour la vitrine.
  return SAMPLE_INQUIRIES;
}
