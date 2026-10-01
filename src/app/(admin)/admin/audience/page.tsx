import React from 'react';
import { CockpitApp } from '../CockpitApp';

/**
 * Deep-link direct du hub « Statistiques & Audience » — même motif que
 * `/admin/chrome` : l'URL produite par la barre latérale doit rester
 * rechargeable directement.
 */
export default function AdminAudiencePage() {
    return <CockpitApp initialTab="audience" />;
}
