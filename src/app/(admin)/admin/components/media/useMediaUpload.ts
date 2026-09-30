'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
    createMediaUploadTicket,
    finalizeMediaUpload,
    getMediaUploadCapabilities,
} from '@/app/(admin)/admin/actions/media-upload-ticket';
import { formatBytes } from '@/app/(admin)/admin/media-shared';
import { compressImage } from '@/lib/media-library/image-compression.client';
import { profileForPath } from '@/lib/media-library/media-policy';
import { runMediaUpload, type MediaUploadItem } from '@/lib/media-library/media-upload.runner';
import type { MediaUploadCapabilities } from '@/lib/media-library/upload-ticket.contract';

export type { MediaUploadItem, UploadItemStatus } from '@/lib/media-library/media-upload.runner';

export interface UseMediaUploadArgs {
    /** Dossier de destination dans le bucket (déjà résolu par la navigation). */
    prefix: string;
    showToast: (message: string) => void;
    /** Recharge dossier et arborescence après un lot. */
    onUploaded: () => Promise<void> | void;
}

export interface UseMediaUploadReturn {
    uploading: boolean;
    /** Avancement en fichiers traités (`processed` sur `total`). */
    progress: { processed: number; total: number };
    items: MediaUploadItem[];
    clear: () => void;
    handleUpload: (fileList: FileList | null) => Promise<void>;
    /** Libellé du profil de compression appliqué au dossier courant. */
    profileLabel: string;
    /** Le rôle courant peut-il conserver un négatif ? (décision serveur) */
    canKeepOriginal: boolean;
    keepOriginal: boolean;
    setKeepOriginal: (value: boolean) => void;
    /** Plafonds annoncés par le serveur, en octets. */
    imageCeilingBytes: number;
    imageOriginalCeilingBytes: number;
}

/** Dépose un blob sur une URL signée ; renvoie `null` en cas de succès. */
async function putBlob(url: string, body: Blob, contentType: string): Promise<string | null> {
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: { 'content-type': contentType, 'x-upsert': 'true' },
            body,
        });
        if (!response.ok) return `Dépôt refusé par le stockage (${response.status}).`;
        return null;
    } catch {
        return 'Réseau injoignable pendant le dépôt.';
    }
}

/**
 * Téléversement média avec compression — couche « Hooks & Orchestration »
 * (`AGENTS.md` § 1).
 *
 * Ce hook ne fait que trois choses : tenir l'état affiché, interroger le
 * serveur sur les droits du rôle courant, et appeler la séquence de domaine
 * `runMediaUpload` en lui injectant ses quatre dépendances réelles
 * (compression navigateur, ticket signé, dépôt direct, journalisation). Toute
 * la logique de décision vit dans `src/lib/media-library`, où elle est testée
 * sans DOM.
 */
export function useMediaUpload({
    prefix,
    showToast,
    onUploaded,
}: UseMediaUploadArgs): UseMediaUploadReturn {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState({ processed: 0, total: 0 });
    const [items, setItems] = useState<MediaUploadItem[]>([]);
    const [capabilities, setCapabilities] = useState<MediaUploadCapabilities | null>(null);
    const [keepOriginalWanted, setKeepOriginalWanted] = useState(false);

    const folder = prefix || 'uploads';
    const profile = useMemo(() => profileForPath(folder), [folder]);

    /**
     * Le droit de conserver un négatif appartient au rôle, pas à l'écran : il est
     * demandé au serveur. Tant que la réponse n'est pas là, l'option reste
     * fermée — proposer une case que le serveur refusera serait un mensonge
     * d'interface.
     */
    useEffect(() => {
        let active = true;
        void getMediaUploadCapabilities(folder).then((res) => {
            if (!active) return;
            setCapabilities(res.success ? res.capabilities : null);
        });
        return () => {
            active = false;
        };
    }, [folder]);

    const canKeepOriginal = capabilities?.canKeepOriginal ?? false;
    const keepOriginal = canKeepOriginal && keepOriginalWanted;

    const clear = useCallback(() => setItems([]), []);

    const handleUpload = useCallback(
        async (fileList: FileList | null) => {
            const files = Array.from(fileList ?? []);
            if (files.length === 0) return;

            setItems([]);
            setUploading(true);
            setProgress({ processed: 0, total: files.length });

            const summary = await runMediaUpload(files, {
                folder,
                keepOriginal,
                deps: {
                    compress: (file) => compressImage(file, profile),
                    requestTicket: createMediaUploadTicket,
                    put: putBlob,
                    finalize: finalizeMediaUpload,
                },
                onItem: (item) => {
                    setItems((previous) => {
                        const index = previous.findIndex((candidate) => candidate.id === item.id);
                        if (index === -1) return [...previous, item];
                        const next = [...previous];
                        next[index] = item;
                        return next;
                    });
                },
                onSettled: (settled, total) => setProgress({ processed: settled, total }),
            });

            setItems(summary.items);
            setUploading(false);

            const gain = summary.savedBytes > 0 ? ` · ${formatBytes(summary.savedBytes)} économisés` : '';
            const failure = summary.failures > 0 ? ` · ${summary.failures} échec(s)` : '';
            showToast(`${summary.stored}/${files.length} fichier(s) téléversé(s) dans ${folder}${gain}${failure}`);

            await onUploaded();
        },
        [folder, keepOriginal, onUploaded, profile, showToast],
    );

    return {
        uploading,
        progress,
        items,
        clear,
        handleUpload,
        profileLabel: profile.label,
        canKeepOriginal,
        keepOriginal,
        setKeepOriginal: setKeepOriginalWanted,
        imageCeilingBytes: capabilities?.imageCeilingBytes ?? 0,
        imageOriginalCeilingBytes: capabilities?.imageOriginalCeilingBytes ?? 0,
    };
}
