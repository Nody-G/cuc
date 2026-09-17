'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

/**
 * Vérifie si l'utilisateur actuellement connecté est administrateur.
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return profile?.role === 'admin';
  } catch {
    return false;
  }
}

/**
 * Revalide toutes les pages du site vitrine suite à une modification de contenu.
 */
export async function revalidateSite(paths: string[] = ['/', '/formation-de-cascadeur', '/stages-cascades-parkour-2', '/equipe-cascadeurs-pro', '/cuc-team-cascadeur']) {
  try {
    for (const path of paths) {
      revalidatePath(path);
    }
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Met à jour le statut d'une session de stage en 1 clic.
 */
export async function updateSessionStatus(sessionId: string, newStatus: string) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_sessions')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (error) throw error;

    await revalidateSite(['/', '/formation-de-cascadeur', '/stages-cascades-parkour-2', '/stunt-workshop-cuc']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Crée une nouvelle session de stage.
 */
export async function createSession(data: {
  program_id: string;
  date_display: string;
  status: string;
  order_index?: number;
}) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_sessions')
      .insert({
        program_id: data.program_id,
        date_display: data.date_display,
        status: data.status,
        order_index: data.order_index ?? 0,
        is_published: true,
      });

    if (error) throw error;

    await revalidateSite(['/', '/formation-de-cascadeur', '/stages-cascades-parkour-2', '/stunt-workshop-cuc']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Supprime une session de stage.
 */
export async function deleteSession(sessionIdentifier: string) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_sessions')
      .delete()
      .or(`id.eq.${sessionIdentifier},date_display.eq.${sessionIdentifier}`);

    if (error) throw error;

    await revalidateSite(['/', '/formation-de-cascadeur', '/stages-cascades-parkour-2', '/stunt-workshop-cuc']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Met à jour le bandeau d'alerte.
 */
export async function updateAnnouncement(data: {
  id?: string;
  title: string;
  message: string;
  badge?: string;
  link_url?: string;
  link_text?: string;
  style: 'gold' | 'info' | 'alert' | 'dark';
  is_active: boolean;
}) {
  try {
    const adminClient = createAdminClient();

    if (data.id) {
      const { error } = await adminClient
        .from('site_announcements')
        .update({
          title: data.title,
          message: data.message,
          badge: data.badge,
          link_url: data.link_url,
          link_text: data.link_text,
          style: data.style,
          is_active: data.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);
      if (error) throw error;
    } else {
      const { error } = await adminClient
        .from('site_announcements')
        .insert({
          title: data.title,
          message: data.message,
          badge: data.badge,
          link_url: data.link_url,
          link_text: data.link_text,
          style: data.style,
          is_active: data.is_active,
        });
      if (error) throw error;
    }

    await revalidateSite(['/']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Met à jour ou insère un membre de l'équipe.
 */
export async function upsertTeamMember(member: {
  id: string;
  name: string;
  role: string;
  title: string;
  bio: string;
  specialties: string[];
  avatar_url?: string;
  instagram?: string;
  imdb?: string;
  external_url?: string;
}) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_team')
      .upsert({
        ...member,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    await revalidateSite(['/equipe-cascadeurs-pro', '/']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Met à jour ou insère un film dans la filmographie.
 */
export async function upsertFilm(film: {
  id: string;
  title: string;
  year?: string;
  category?: string;
  director?: string;
  stunt_roles?: string;
  image?: string;
  tag?: string;
  imdb_url?: string;
  trailer_url?: string;
  highlight?: boolean;
}) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_films')
      .upsert({
        ...film,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    await revalidateSite(['/cuc-team-cascadeur', '/']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Supprime un membre de l'équipe.
 */
export async function deleteTeamMember(id: string) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_team')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await revalidateSite(['/equipe-cascadeurs-pro', '/']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Supprime un film de la filmographie.
 */
export async function deleteFilm(id: string) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_films')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await revalidateSite(['/cuc-team-cascadeur', '/']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Met à jour ou insère le contenu détaillé d'une page (Hero, sections, SEO).
 */
export async function upsertPageContent(slug: string, pageData: {
  title: string;
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
  hero: Record<string, any>;
  sections?: any[];
  is_published?: boolean;
}) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_pages')
      .upsert({
        slug,
        title: pageData.title,
        meta_title: pageData.meta_title,
        meta_description: pageData.meta_description,
        og_image: pageData.og_image,
        hero: pageData.hero,
        sections: pageData.sections || [],
        is_published: pageData.is_published ?? true,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    const targetPath = slug === '/' ? '/' : `/${slug.replace(/^\//, '')}`;
    await revalidateSite([targetPath, '/']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Met à jour ou insère un partenaire.
 */
export async function upsertPartner(partner: {
  id: string;
  name: string;
  category: string;
  logo_url: string;
  website_url?: string;
  description?: string;
  order_index?: number;
}) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_partners')
      .upsert({
        ...partner,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
    await revalidateSite(['/partenaires', '/']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Supprime un partenaire.
 */
export async function deletePartner(id: string) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_partners')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await revalidateSite(['/partenaires', '/']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Met à jour ou insère une prestation CUC Events.
 */
export async function upsertEvent(event: {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  description?: string;
  features?: string[];
  price_indicator?: string;
  cta_text?: string;
  cta_link?: string;
  image_url?: string;
  order_index?: number;
}) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_events')
      .upsert({
        ...event,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
    await revalidateSite(['/cuc-events-agence', '/team-building-cascades', '/spectacles-cascadeurs-yamakasi', '/animations-airbag-parkour', '/']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Supprime une prestation CUC Events.
 */
export async function deleteEvent(id: string) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_events')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await revalidateSite(['/cuc-events-agence', '/']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Met à jour les paramètres globaux (coordonnées, réseaux sociaux, footer).
 */
export async function updateSiteSettings(key: string, value: Record<string, any>) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_settings')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
    await revalidateSite(['/', '/contact-cuc']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Téléverse un fichier média vers Supabase Storage (cuc-vitrine-assets).
 */
export async function uploadMediaFile(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) throw new Error('Aucun fichier fourni');

    const adminClient = createAdminClient();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    const cleanName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '_');
    const filePath = `uploads/${timestamp}_${cleanName}`;

    const { data, error } = await adminClient.storage
      .from('cuc-vitrine-assets')
      .upload(filePath, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: true,
      });

    if (error) throw error;

    const { data: publicUrlData } = adminClient.storage
      .from('cuc-vitrine-assets')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrlData.publicUrl,
      path: data.path,
      name: file.name,
      size: file.size,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur upload';
    return { success: false, error: message };
  }
}

/**
 * Liste les fichiers de la médiathèque Supabase Storage.
 */
export async function listMediaFiles() {
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient.storage
      .from('cuc-vitrine-assets')
      .list('uploads', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) throw error;

    const files = (data || [])
      .filter((f) => f.name !== '.emptyFolderPlaceholder')
      .map((f) => {
        const { data: publicUrlData } = adminClient.storage
          .from('cuc-vitrine-assets')
          .getPublicUrl(`uploads/${f.name}`);
        return {
          name: f.name,
          size: f.metadata?.size || 0,
          createdAt: f.created_at,
          url: publicUrlData.publicUrl,
        };
      });

    return { success: true, files };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur liste médias';
    return { success: false, error: message, files: [] };
  }
}

/**
 * Supprime un fichier média du stockage Supabase.
 */
export async function deleteMediaFile(filename: string) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient.storage
      .from('cuc-vitrine-assets')
      .remove([`uploads/${filename}`]);

    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur suppression média';
    return { success: false, error: message };
  }
}

