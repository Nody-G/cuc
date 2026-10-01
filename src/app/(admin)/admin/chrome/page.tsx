import React from 'react';
import { CockpitApp } from '../CockpitApp';

/**
 * Deep-link direct du hub « Chrome du Site » — nécessaire pour que la barre
 * latérale (`switchTab('chrome')` → `pushState('/admin/chrome')`) survive à un
 * rafraîchissement de la page.
 */
export default function AdminChromePage() {
    return <CockpitApp initialTab="chrome" />;
}
