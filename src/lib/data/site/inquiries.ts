/**
 * Candidatures (inquiries) — extrait de `site-service.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2.
 */

import { getSupabaseClient } from './client';
import { SiteInquiry } from './types';
import { SAMPLE_INQUIRIES } from './defaults/samples';

/**
 * Récupère la liste des candidatures et demandes de contact.
 * Se synchronise en direct avec Supabase (table dédiée site_inquiries + miroir site_settings).
 */
export async function getInquiries(): Promise<SiteInquiry[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('site_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      return data as SiteInquiry[];
    }

    // 2. Fallback Supabase site_settings key='inquiries'
    const { data: settingRow } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'inquiries')
      .maybeSingle();

    if (settingRow?.value?.list && Array.isArray(settingRow.value.list)) {
      return settingRow.value.list as SiteInquiry[];
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
