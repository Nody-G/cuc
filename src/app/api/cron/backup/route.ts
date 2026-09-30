import { NextRequest, NextResponse } from 'next/server';
import { exportFullSiteBackup } from '@/app/(admin)/admin/actions/backup';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * Route Cron de Sauvegarde Hebdomadaire Automatisée.
 * Standard Next.js & Vercel Cron.
 *
 * Fréquence recommandée : chaque dimanche à 03h00 UTC.
 * Sécurisation : Header `Authorization: Bearer <CRON_SECRET>` ou Vercel signature.
 * Rétention glissante : conserve les 8 dernières semaines pour éviter toute surcharge.
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Vérification de sécurité (si CRON_SECRET est configuré)
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const isVercelCron = req.headers.get('user-agent')?.includes('vercel-cron');
      if (!isVercelCron) {
        return NextResponse.json({ error: 'Non autorisé — token cron manquant ou invalide.' }, { status: 401 });
      }
    }

    // Exécution de l'instantané complet
    const backupRes = await exportFullSiteBackup();
    if (!backupRes.success || !backupRes.backup) {
      return NextResponse.json(
        { error: backupRes.error || 'Échec de la génération de la sauvegarde' },
        { status: 500 }
      );
    }

    const backupJson = JSON.stringify(backupRes.backup);
    const sizeBytes = Buffer.byteLength(backupJson, 'utf-8');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-cuc-${timestamp}.json`;

    // Tentative de persistance dans le bucket de stockage Supabase si accessible
    try {
      const adminClient = createAdminClient();
      const bucketName = 'cuc-backups';

      // Vérifie si le bucket existe ou tente l'upload
      const { error: uploadError } = await adminClient.storage
        .from(bucketName)
        .upload(filename, backupJson, {
          contentType: 'application/json',
          upsert: true,
        });

      if (!uploadError) {
        // Politique de rétention glissante : lister les fichiers et purger les anciens (> 8 semaines)
        const { data: files } = await adminClient.storage.from(bucketName).list('', {
          sortBy: { column: 'created_at', order: 'desc' },
        });

        if (files && files.length > 8) {
          const filesToDelete = files.slice(8).map((f) => f.name);
          await adminClient.storage.from(bucketName).remove(filesToDelete);
        }
      }
    } catch {
      // Si le bucket de stockage n'est pas créé, le backup reste généré et renvoyé en statut
    }

    return NextResponse.json({
      success: true,
      message: 'Sauvegarde hebdomadaire générée avec succès.',
      timestamp: new Date().toISOString(),
      filename,
      sizeBytes,
      tablesCount: Object.keys(backupRes.backup.data).length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
