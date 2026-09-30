/**
 * Worker de compression — exécution hors du fil principal.
 *
 * Un import de plusieurs photos de téléphone occupe le fil principal plusieurs
 * secondes (décodage + réencodage) : l'interface du Cockpit se figerait et le
 * glisser-déposer paraîtrait cassé. Le worker ne contient aucune règle : il
 * reçoit un fichier et un identifiant de profil, appelle le service de
 * compression et renvoie le résultat.
 *
 * `tsconfig.json` n'inclut pas la lib `webworker` : `self` y est donc typé
 * comme une fenêtre, d'où le passage explicite par `DedicatedWorkerGlobalScope`
 * via un cast — c'est le seul moyen de garder `postMessage` correctement typé.
 */

import { compressImage, type CompressedImage } from './image-compression.client';
import { COMPRESSION_PROFILES, type CompressionProfileId } from './media-policy';

export interface CompressionWorkerRequest {
    id: number;
    file: File;
    profileId: CompressionProfileId;
}

export interface CompressionWorkerResponse {
    id: number;
    ok: boolean;
    result?: CompressedImage;
    error?: string;
}

const scope = self as unknown as {
    addEventListener: (type: 'message', listener: (event: MessageEvent<CompressionWorkerRequest>) => void) => void;
    postMessage: (message: CompressionWorkerResponse) => void;
};

scope.addEventListener('message', (event) => {
    const { id, file, profileId } = event.data;
    const profile = COMPRESSION_PROFILES[profileId] ?? COMPRESSION_PROFILES.web;

    void compressImage(file, profile).then(
        (result) => scope.postMessage({ id, ok: true, result }),
        (error: unknown) => scope.postMessage({
            id,
            ok: false,
            error: error instanceof Error ? error.message : 'Compression impossible',
        }),
    );
});
