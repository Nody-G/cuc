/**
 * Raccourcis clavier du Cockpit — source unique de vérité.
 *
 * Couche « Domaine & Services » (`AGENTS.md` § 1) : fonction pure, aucune
 * React. Consommée par l'aide des raccourcis (modale) et par la section
 * « Aide & Guide » — éviter toute duplication de libellés.
 */

export interface ShortcutEntry {
    keys: string[];
    label: string;
}

export interface ShortcutGroup {
    title: string;
    shortcuts: ShortcutEntry[];
}

/** Modificateur affiché selon la plateforme (⌘ sur macOS, Ctrl ailleurs). */
export function modifierKey(): string {
    const isMac =
        typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform || '');
    return isMac ? '⌘' : 'Ctrl';
}

/** Construit les groupes de raccourcis (modificateur résolu à l'exécution). */
export function buildShortcutGroups(): ShortcutGroup[] {
    const MOD = modifierKey();
    return [
        {
            title: 'Général',
            shortcuts: [
                { keys: [MOD, 'K'], label: 'Ouvrir la barre de commandes' },
                { keys: [MOD, 'B'], label: 'Replier / déplier la navigation latérale' },
                { keys: [MOD, '/'], label: 'Afficher cette aide' },
                { keys: ['Échap'], label: 'Fermer la fenêtre active' },
            ],
        },
        {
            title: 'Navigation rapide',
            shortcuts: [
                { keys: ['Alt', '1'], label: 'Tableau de bord' },
                { keys: ['Alt', '2'], label: 'Contact' },
                { keys: ['Alt', '3'], label: 'Pages du site' },
                { keys: ['Alt', '4'], label: 'Sessions de formation' },
                { keys: ['Alt', '5'], label: 'Coachs & formateurs' },
                { keys: ['Alt', '6'], label: 'Filmographie & cascades' },
                { keys: ['Alt', '7'], label: 'Instagram & vidéos' },
            ],
        },
        {
            title: 'Outils système',
            shortcuts: [
                { keys: [MOD, 'Shift', 'B'], label: 'Sauvegarde / restauration' },
                { keys: [MOD, 'Shift', 'H'], label: 'Diagnostic système' },
            ],
        },
        {
            title: 'Édition de pages',
            shortcuts: [
                { keys: [MOD, 'Z'], label: 'Annuler la dernière saisie (éditeur)' },
                { keys: [MOD, 'Shift', 'Z'], label: 'Rétablir (éditeur)' },
                { keys: ['Entrée'], label: 'Valider une saisie en place (Ctrl+Entrée en multi-lignes)' },
            ],
        },
        {
            title: 'Studio Plan 3D',
            shortcuts: [
                { keys: ['F'], label: 'Cadrer la caméra sur l’objet sélectionné' },
                { keys: ['[', ']'], label: 'Pivoter de 15°' },
                { keys: ['+', '−'], label: 'Ajuster l’échelle uniforme' },
            ],
        },
    ];
}
