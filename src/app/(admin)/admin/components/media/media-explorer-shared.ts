/**
 * Contrats & constantes de l'explorateur de médiathèque.
 *
 * Module pur (aucun JSX) : taille de page, type de vue et correspondances
 * nature → icône / libellé. Règle SRP : `AGENTS.md` § 1-2.
 */
import { FileText, Film, HardDrive, Image as ImageIcon } from 'lucide-react';
import type { MediaKind } from '@/app/(admin)/admin/media-shared';

/** Taille de page du parcours d'un dossier. */
export const PAGE_SIZE = 60;

/** Vue d'affichage des médias. */
export type ExplorerView = 'grid' | 'list';

export const KIND_ICON: Record<MediaKind, React.ComponentType<{ className?: string }>> = {
    image: ImageIcon,
    video: Film,
    document: FileText,
    other: HardDrive,
};

export const KIND_LABEL: Record<MediaKind, string> = {
    image: 'Images',
    video: 'Vidéos',
    document: 'Documents',
    other: 'Autres',
};
