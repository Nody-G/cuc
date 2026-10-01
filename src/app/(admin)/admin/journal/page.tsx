import React from 'react';
import { CockpitApp } from '../CockpitApp';

export default function AdminJournalPage() {
    // `initialTab="journal"` : l'URL `/admin/journal` ouvre le hub Journal avec
    // le sous-onglet « Activité » pré-sélectionné (comportement historique).
    return <CockpitApp initialTab="journal" />;
}
