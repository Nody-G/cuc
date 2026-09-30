/**
 * Téléchargement direct d'un fichier média sous forme de Blob.
 * Résout le comportement par défaut des navigateurs qui affichent l'image
 * au lieu de la télécharger lorsque l'URL est sur un domaine tiers (CORS Supabase / CDN).
 */
export async function forceDownloadBlob(url: string, filename?: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const resolvedFilename = filename || url.split('/').pop()?.split('?')[0] || 'media-cuc';

  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);

    const blob = await res.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = resolvedFilename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(objectUrl);
    return true;
  } catch {
    // Repli de secours : ouverture dans un nouvel onglet avec download hint
    const fallbackLink = document.createElement('a');
    fallbackLink.href = url;
    fallbackLink.target = '_blank';
    fallbackLink.rel = 'noopener noreferrer';
    fallbackLink.download = resolvedFilename;
    document.body.appendChild(fallbackLink);
    fallbackLink.click();
    fallbackLink.remove();
    return false;
  }
}
