/**
 * Journalisation des échecs de la médiathèque — point unique.
 *
 * Module **sans** directive `'use server'` : il n'expose aucune Server Action, il
 * est importé par `media.ts` et `media-organize.ts`. Il existe parce que les deux
 * modules journalisent le même genre d'échec : dupliquer la classification aurait
 * produit deux vocabulaires pour la même panne, et un tableau de bord qui ne
 * compte plus la même chose selon le chemin emprunté.
 *
 * Ces Server Actions **retournent** leurs erreurs (`{ success: false }`) au lieu
 * de les lever : c'est donc au point de décision que l'échec devient un événement.
 * La classification distingue un bucket absent (stockage mal configuré), un
 * fichier trop lourd et un réseau injoignable — trois pannes qui n'appellent pas
 * la même réaction.
 */

import { classifyError } from '@/lib/logging/classify';
import { writeActivityLog } from '@/lib/logging/write';

export function reportMediaFailure(
    category: string,
    target: string,
    error: unknown,
    origin: string,
): void {
    const classified = classifyError(error, { source: 'media', category });
    void writeActivityLog({
        level: classified.level,
        source: classified.source,
        category: classified.category,
        message: classified.message,
        target: target || null,
        context: classified.context,
        origin,
    });
}
