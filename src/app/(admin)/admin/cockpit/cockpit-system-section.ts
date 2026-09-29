/**
 * Section « Outils Système » du menu du Cockpit.
 *
 * Extraite de `cockpit-nav.ts`, qui frôlait le plafond dur de 300 lignes
 * (`AGENTS.md` § 2) après l'ajout du journal. L'extraction répond à un besoin
 * réel : cette section a une raison d'être propre — **elle n'existait pas**.
 *
 * Constat du 2026-09-29 : `logs`, `audit`, `health`, `analytics`, `translations`
 * et `microcopy` étaient rendus par le Cockpit mais absents du menu. Ils
 * n'étaient joignables que par URL directe ou palette de commandes — un écran
 * qu'on ne trouve pas n'existe pas. Les rassembler ici les rend visibles d'un
 * seul endroit, et cette section reste réservée à la Direction puisque
 * l'onglet `logs` s'appuie sur des policies de lecture `admin`/`directeur`.
 */

import { Activity, FileText, Globe, Shield } from 'lucide-react';
import type { CockpitNavSectionModel } from './cockpit-nav';

export const SYSTEM_TOOLS_SECTION: CockpitNavSectionModel = {
    title: '5. Outils Système',
    items: [
        { id: 'logs', label: 'Journal & Activité', icon: Activity },
        { id: 'audit', label: 'Journal d’Audit', icon: Shield },
        { id: 'health', label: 'Diagnostic du Site', icon: Shield },
        { id: 'analytics', label: 'Statistiques & Conversion', icon: Activity },
        { id: 'translations', label: 'Traductions Anglaises', icon: Globe },
        { id: 'microcopy', label: 'Textes & Boutons du Site', icon: FileText },
    ],
};
