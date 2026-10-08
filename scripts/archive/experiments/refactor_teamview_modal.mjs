#!/usr/bin/env node
/**
 * OBSOLÈTE — codemod à usage unique (2026-09-22).
 *
 * Remplace le bloc modal d'édition de `TeamView.tsx` (~670 lignes) par la
 * composition extraite (`team-view/TeamMemberEditorModal`), insère l'import et
 * élague les imports devenus inutiles (comptage d'identifiants, aucun jugement).
 * Conservé pour traçabilité (doctrine AGENTS.md : marquer plutôt que supprimer).
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const FILE = path.join(ROOT, 'src', 'app', '(admin)', 'admin', 'components', 'TeamView.tsx');

const original = fs.readFileSync(FILE, 'utf8');
const lines = original.split('\n');

const START_MARK = '{/* Modal édition membre */}';
const END_MARK = '{/* MediaPicker pour l\'avatar */}'.replace("l'avatar", "l'avatar"); // garde l'apostrophe droite
const START = '      {/* Modal édition membre */}';
const END = "      {/* MediaPicker pour l'avatar */}";

const idxStart = lines.findIndex((l) => l.trim() === START.trim());
const idxEnd = lines.findIndex((l) => l.trim() === END.trim());
if (idxStart < 0 || idxEnd < 0 || idxEnd <= idxStart) {
    throw new Error(`Bornes introuvables (start=${idxStart}, end=${idxEnd})`);
}
// Fin réelle : dernière ligne non vide avant le commentaire MediaPicker.
let idxLast = idxEnd - 1;
while (idxLast > idxStart && lines[idxLast].trim() === '') idxLast--;

const modalBlock = `      {/* Modal édition membre */}
      {editingMember && (
        <TeamMemberEditorModal
          member={editingMember}
          onMemberChange={(next) => setEditingMember(next)}
          onClose={() => setEditingMember(null)}
          onSubmit={handleSaveTeamMember}
          onOpenMediaPicker={() => setShowMediaPickerTeam(true)}
          credits={{
            selectedCount,
            featuredCount,
            search: creditSearch,
            onSearchChange: setCreditSearch,
            searchResults,
            creditIndex,
            onToggleFilm: toggleFilmCredit,
            onSetRole: setCreditRole,
            newFilmDraft,
            onNewFilmDraftChange: setNewFilmDraft,
            onCreateFilmAndCredit: createFilmAndCredit,
            catalogueItems: catalogueFilms,
            onMoveFeatured: moveFeatured,
            onToggleFeatured: toggleFeatured,
            rows: allCredits,
            sortedRows: allCreditsSorted,
            sortMode: creditSort,
            onSortModeChange: setCreditSort,
            featuredSet,
            featuredOrder: featuredCreditsOrdered,
            onRemoveCredit: removeCredit,
          }}
        />
      )}`.split('\n');

let next = [...lines.slice(0, idxStart), ...modalBlock, ...lines.slice(idxLast + 1)];

// Import du composant, juste après l'import de `./ui`.
const uiImportIdx = next.findIndex((l) => l.includes("from './ui';"));
if (uiImportIdx < 0) throw new Error("Import './ui' introuvable");
next.splice(uiImportIdx + 1, 0, "import { TeamMemberEditorModal } from './team-view/TeamMemberEditorModal';");

/* ------------------------------------------------------------------ */
/* Élagage des imports inutilisés (comptage, pas d'interprétation)     */
/* ------------------------------------------------------------------ */
const IMPORT_RE = /^import\s+(?:type\s+)?(?:([A-Za-z0-9_]+)\s*,?\s*)?(?:\{([\s\S]*?)\})?\s*from\s*['"]([^'"]+)['"];$/gm;

let text = next.join('\n');

// Corps = texte sans les instructions d'import (pour ne pas se compter soi-même).
const stripped = text.replace(IMPORT_RE, '');
const countOf = (name) => (stripped.match(new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g')) ?? []).length;

const removed = [];
const statements = [...text.matchAll(IMPORT_RE)];
for (const m of statements) {
    const [raw, defaultName, braceNames] = m;
    if (!braceNames) {
        if (defaultName && countOf(defaultName) === 0) {
            text = text.replace(raw, '');
            removed.push(defaultName);
        }
        continue;
    }
    const tokens = braceNames.split(',').map((t) => t.trim()).filter(Boolean);
    const kept = tokens.filter((t) => {
        const id = t.replace(/^type\s+/, '').split(/\s+as\s+/).pop().trim();
        const used = countOf(id) > 0;
        if (!used) removed.push(id);
        return used;
    });
    if (kept.length === tokens.length) continue;
    const rebuilt = kept.length
        ? `import { ${kept.join(', ')} } from '${m[3]}';`
        : '';
    text = text.replace(raw, rebuilt);
}

text = text.replace(/\n{3,}/g, '\n\n');
fs.writeFileSync(FILE, text, 'utf8');

console.log(`modal remplacé (lignes ${idxStart + 1}-${idxLast + 1})`);
console.log(`imports retirés (${removed.length}) : ${removed.join(', ') || '—'}`);
console.log(`TeamView.tsx : ${text.split('\n').length} lignes`);
