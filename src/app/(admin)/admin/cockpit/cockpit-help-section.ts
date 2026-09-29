/**
 * Section « Aide » du menu du Cockpit.
 *
 * Extraite comme `cockpit-system-section.ts` (frontière nette pour les
 * sous-agents, `AGENTS.md` § 3). Contrairement aux « Outils Système », cette
 * section est **visible pour tous les rôles** : la pédagogie n'est pas un
 * privilège de la Direction.
 */

import { LifeBuoy } from 'lucide-react';
import type { CockpitNavSectionModel } from './cockpit-nav';

export const HELP_NAV_SECTION: CockpitNavSectionModel = {
    title: 'Aide',
    items: [{ id: 'help', label: 'Aide & Guide', icon: LifeBuoy }],
};
