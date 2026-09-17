'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

/**
 * Vérifie si l'utilisateur actuellement connecté a accès au Cockpit (admin, directeur, secretaire, coach).
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

    return ['admin', 'directeur', 'secretaire', 'coach'].includes(profile?.role || '');
  } catch {
    return false;
  }
}

/**
 * Récupère le profil et rôle de l'utilisateur connecté dans le Cockpit.
 */
export async function getCurrentUserProfile() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, full_name, first_name, last_name, role, avatar_url')
      .eq('id', user.id)
      .single();

    return profile;
  } catch {
    return null;
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
 * Met à jour ou insère le contenu détaillé d'une page (Hero, sections, emplacements, SEO).
 */
export async function upsertPageContent(slug: string, pageData: {
  title: string;
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
  hero: Record<string, any>;
  sections?: any[];
  layout_sections?: any[];
  sections_data?: Record<string, any>;
  is_published?: boolean;
}) {
  try {
    const cleanSlug = slug === '/' ? '/' : slug.replace(/^\//, '');
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_pages')
      .upsert({
        slug: cleanSlug,
        title: pageData.title,
        meta_title: pageData.meta_title,
        meta_description: pageData.meta_description,
        og_image: pageData.og_image,
        hero: pageData.hero,
        sections: pageData.sections || [],
        layout_sections: pageData.layout_sections || [],
        sections_data: pageData.sections_data || {},
        is_published: pageData.is_published ?? true,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    const targetPath = cleanSlug === '/' ? '/' : `/${cleanSlug}`;
    await revalidateSite([targetPath, '/']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Rétablit le contenu d'origine et la disposition par défaut validée d'une page.
 */
export async function resetPageContentToDefault(slug: string) {
  try {
    const cleanSlug = slug === '/' ? '/' : slug.replace(/^\//, '');
    const { DEFAULT_PAGE_CONTENTS } = await import('@/lib/data/site-service');
    const defaultData = DEFAULT_PAGE_CONTENTS[cleanSlug];
    if (!defaultData) {
      throw new Error(`Aucun contenu par défaut trouvé pour le slug "${slug}"`);
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_pages')
      .upsert({
        slug: defaultData.slug,
        title: defaultData.title,
        meta_title: defaultData.meta_title,
        meta_description: defaultData.meta_description,
        og_image: defaultData.og_image,
        hero: defaultData.hero,
        sections: defaultData.sections || [],
        layout_sections: defaultData.layout_sections || [],
        sections_data: defaultData.sections_data || {},
        is_published: defaultData.is_published,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    const targetPath = cleanSlug === '/' ? '/' : `/${cleanSlug}`;
    await revalidateSite([targetPath, '/']);
    return { success: true, defaultData };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur réinitialisation';
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

/**
 * Action serveur d'authentification robuste pour le Cockpit.
 * Permet de contourner tout blocage de cookies tiers ou de réseau côté client.
 */
export async function loginAdminAction(identifier: string, pass: string) {
  try {
    const supabase = await createClient();
    let email = identifier.trim().toLowerCase();
    if (!email.includes('@')) {
      email = `${email}@cuc.fr`;
    }
    const cleanPassword = pass.trim();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: cleanPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      const adminClient = createAdminClient();
      const { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (!['admin', 'directeur', 'secretaire', 'coach'].includes(profile?.role || '')) {
        await supabase.auth.signOut();
        return { success: false, error: 'Accès refusé : ce compte ne possède pas les autorisations nécessaires pour accéder au Cockpit.' };
      }

      return { success: true, userId: data.user.id, role: profile?.role };
    }

    return { success: false, error: 'Identifiant introuvable.' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur d\'authentification serveur';
    return { success: false, error: message };
  }
}

/**
 * Liste les collaborateurs du Cockpit (Admin, Directeur, Secrétaire, Coach).
 */
export async function listCockpitUsers() {
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('profiles')
      .select('id, email, full_name, first_name, last_name, role, updated_at, created_at')
      .in('role', ['admin', 'directeur', 'secretaire', 'coach'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, users: data || [] };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur liste utilisateurs';
    return { success: false, error: message, users: [] };
  }
}

/**
 * Met à jour le rôle d'un collaborateur (Directeur, Secrétaire, Coach, Admin).
 */
export async function updateUserRole(userId: string, newRole: string) {
  try {
    const allowed = ['admin', 'directeur', 'secretaire', 'coach', 'student'];
    if (!allowed.includes(newRole)) throw new Error('Rôle non autorisé');

    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur modification rôle';
    return { success: false, error: message };
  }
}


