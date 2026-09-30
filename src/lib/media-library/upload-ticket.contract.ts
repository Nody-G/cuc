/**
 * Contrats du téléversement direct — types partagés hook navigateur / action serveur.
 *
 * Couche « Types & Contrats » (`AGENTS.md` § 1) : aucun import, aucune
 * dépendance. Ce fichier existe pour qu'un seul vocabulaire décrive le
 * téléversement des deux côtés de la frontière serveur, sans que le client
 * importe l'action (`'use server'`) ni que le serveur importe le hook.
 *
 * Pourquoi un ticket plutôt qu'un envoi via Server Action : le corps d'une
 * Server Action est plafonné à 1 Mo, celui d'une fonction serverless à 4,5 Mo.
 * Le navigateur compresse, demande une autorisation signée, puis dépose
 * lui-même le fichier dans Supabase Storage — le serveur ne voit jamais les
 * octets, il ne fait qu'autoriser et journaliser.
 */

import type { CompressionProfileId } from './media-policy';

export interface MediaUploadTicketRequest {
    /** Dossier de destination dans le bucket (`media/cuc-visual`). */
    folder: string;
    /** Nom d'origine du fichier, utilisé pour dériver les chemins. */
    fileName: string;
    /** Type MIME du contenu réellement déposé (WebP si le dérivé a été produit). */
    contentType: string;
    /** Taille du contenu réellement déposé, en octets. */
    bytes: number;
    /** Conservation du négatif haute résolution sous `_originals/`. */
    keepOriginal: boolean;
}

export interface SignedTarget {
    path: string;
    uploadUrl: string;
    token: string;
    publicUrl: string;
}

export interface MediaUploadTicket {
    /** Dérivé servi par la vitrine. */
    served: SignedTarget;
    /** Négatif optionnel, jamais référencé par le site. */
    original: SignedTarget | null;
    profileId: CompressionProfileId;
    /** Plafond appliqué côté serveur, en octets (affichage et garde client). */
    ceilingBytes: number;
}

export type MediaUploadTicketResult =
    | { success: true; ticket: MediaUploadTicket }
    | { success: false; error: string };

export interface MediaUploadReport {
    /** Chemin du dérivé effectivement déposé. */
    path: string;
    folder: string;
    fileName: string;
    contentType: string;
    profileId: CompressionProfileId;
    bytesBefore: number;
    bytesAfter: number;
    /** `true` si le contenu déposé est le dérivé WebP. */
    compressed: boolean;
    keptOriginal: boolean;
    originalPath: string | null;
}

export type MediaUploadReportResult =
    | { success: true; url: string }
    | { success: false; error: string };

/**
 * Ce que le rôle courant a le droit de faire, et sous quel plafond.
 *
 * Le serveur reste l'autorité : ces valeurs ne servent qu'à afficher les bonnes
 * options et les bonnes limites. Un client modifié qui les ignorerait se ferait
 * refuser au moment du ticket.
 */
export interface MediaUploadCapabilities {
    /** Le rôle courant peut-il conserver un négatif haute résolution ? */
    canKeepOriginal: boolean;
    /** Plafond du dérivé servi pour une image, en octets. */
    imageCeilingBytes: number;
    /** Plafond d'un négatif image conservé, en octets. */
    imageOriginalCeilingBytes: number;
    /** Profil de compression appliqué au dossier courant. */
    profileId: CompressionProfileId;
    folder: string;
}

export type MediaUploadCapabilitiesResult =
    | { success: true; capabilities: MediaUploadCapabilities }
    | { success: false; error: string };
