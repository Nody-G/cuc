/**
 * Gestionnaire de worker côté navigateur — plomberie de communication.
 *
 * Séparé de `image-compression.client.ts` pour une raison de responsabilité :
 * le service de compression décrit **comment** transformer une image, ce module
 * décrit **où** le travail s'exécute. Réencoder une photo de 12 Mo occupe le fil
 * principal plusieurs secondes : sans worker, l'interface du Cockpit se figerait
 * et le glisser-déposer paraîtrait cassé.
 *
 * Aucun échec du worker ne remonte comme un échec d'import : l'appelant retombe
 * sur l'exécution en ligne (voir `compressImage`).
 */

import type { CompressedImage } from './image-compression.client';
import type { CompressionProfile } from './media-policy';
// Import de type uniquement : le worker importe `compressImageInline` depuis le
// module de service, il n'y a donc aucun cycle d'exécution.
import type { CompressionWorkerResponse } from './image-compression.worker';

interface PendingCall {
    resolve: (result: CompressedImage) => void;
    reject: (error: Error) => void;
}

let compressionWorker: Worker | null = null;
let compressionCallId = 0;
const pendingCalls = new Map<number, PendingCall>();

/** Le navigateur sait-il lancer un worker ? */
export function workerAvailable(): boolean {
    return typeof Worker === 'function' && typeof URL !== 'undefined';
}

function rejectAllPending(message: string): void {
    for (const call of pendingCalls.values()) call.reject(new Error(message));
    pendingCalls.clear();
}

function ensureCompressionWorker(): Worker {
    if (compressionWorker) return compressionWorker;

    const worker = new Worker(new URL('./image-compression.worker.ts', import.meta.url), {
        type: 'module',
    });
    worker.addEventListener('message', (event: MessageEvent<CompressionWorkerResponse>) => {
        const call = pendingCalls.get(event.data.id);
        if (!call) return;
        pendingCalls.delete(event.data.id);
        if (event.data.ok && event.data.result) call.resolve(event.data.result);
        else call.reject(new Error(event.data.error || 'Compression impossible'));
    });
    worker.addEventListener('error', () => {
        rejectAllPending('Worker de compression indisponible');
        compressionWorker?.terminate();
        compressionWorker = null;
    });

    compressionWorker = worker;
    return worker;
}

/**
 * Compresse hors du fil principal. **Lève** si le worker fait défaut : c'est à
 * l'appelant de décider du repli, pas à ce module de le masquer.
 */
export function compressViaWorker(file: File, profile: CompressionProfile): Promise<CompressedImage> {
    return new Promise<CompressedImage>((resolve, reject) => {
        const id = (compressionCallId += 1);
        pendingCalls.set(id, { resolve, reject });
        try {
            ensureCompressionWorker().postMessage({ id, file, profileId: profile.id });
        } catch (error) {
            pendingCalls.delete(id);
            reject(error instanceof Error ? error : new Error('Compression impossible'));
        }
    });
}
