#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Auto-test des règles de réparation typographique
 * ==============================================================================
 * Vérifie hors ligne (sans base, sans serveur) que les règles de
 * `scripts/lib/text-repairs.mjs` sont sûres. Le test central reproduit
 * l'INCIDENT DU 2026-09-21 et prouve deux choses :
 *
 *   1. l'ancien motif `/\S {2,}\S/g` **supprime** des caractères réels ;
 *   2. le motif à regard — et le garde-fou `substance()` — l'interdisent.
 *
 * Usage : node scripts/selftest_text_repairs.mjs
 * Sort en code 1 dès qu'une assertion échoue.
 * ==============================================================================
 */
import {
    AMP,
    ESCAPED_AMP,
    collapseSpaceRuns,
    decodeEscapedAmp,
    fixEnglishPunctuation,
    preservesSubstance,
} from './lib/text-repairs.mjs';

let checks = 0;
let failures = 0;

function expect(label, actual, expected) {
    checks += 1;
    if (actual === expected) {
        console.log(`  OK   ${label}`);
        return;
    }
    failures += 1;
    console.error(`  ÉCHEC ${label}\n       attendu : ${JSON.stringify(expected)}\n       obtenu  : ${JSON.stringify(actual)}`);
}

function expectTrue(label, value) {
    checks += 1;
    if (value) {
        console.log(`  OK   ${label}`);
        return;
    }
    failures += 1;
    console.error(`  ÉCHEC ${label} (faux)`);
}

console.log('');
console.log('Règle 1 — l\'ancien motif est destructeur (reproduction de l\'incident)');
// Motif fautif d'origine : il inclut le caractère AVANT et APRÈS la suite d'espaces.
const UNSAFE = /\S {2,}\S/g;
expect('« Gloria  needs » avec le motif fautif', 'Gloria  needs'.replace(UNSAFE, ' '), 'Glori eeds');
expect('« family.  She » avec le motif fautif', 'family.  She'.replace(UNSAFE, ' '), 'family he');

console.log('');
console.log('Règle 2 — le motif à regard ne perd aucun caractère');
expect('« Gloria  needs » réduit', collapseSpaceRuns('Gloria  needs'), 'Gloria needs');
expect('« family.  She » réduit', collapseSpaceRuns('family.  She'), 'family. She');
expect('« brings  together » réduit', collapseSpaceRuns('brings  together'), 'brings together');
expect('« love...  Based » réduit', collapseSpaceRuns('love...  Based'), 'love... Based');
expect('espace simple inchangé', collapseSpaceRuns('a b'), 'a b');
expect('espace isolé en fin de texte inchangé', collapseSpaceRuns('fin  '), 'fin  ');

console.log('');
console.log('Règle 3 — la ponctuation anglaise se colle, l\'ellipse est préservée');
expect('« unit : Police »', fixEnglishPunctuation('unit : Police'), 'unit: Police');
expect('« hell . »', fixEnglishPunctuation('hell .'), 'hell.');
expect('« story ? »', fixEnglishPunctuation('story ?'), 'story?');
expect('« decorator ; third »', fixEnglishPunctuation('decorator ; third'), 'decorator; third');
expect('ellipse préservée', fixEnglishPunctuation('indifferent ...'), 'indifferent ...');
expect('phrase ponctuée inchangée', fixEnglishPunctuation('Gloria needs an orgasm.'), 'Gloria needs an orgasm.');

console.log('');
console.log('Règle 4 — décodage de l\'entité résiduelle');
expect('entité décodée', decodeEscapedAmp(`involved ${ESCAPED_AMP} the campaign`), `involved ${AMP} the campaign`);
expect('texte sans entité inchangé', decodeEscapedAmp('no entity here'), 'no entity here');

console.log('');
console.log('Règle 5 — le garde-fou de substance');
expectTrue('réduction d\'espaces : substance préservée', preservesSubstance('Gloria  needs', 'Gloria needs'));
expectTrue('ponctuation collée : substance préservée', preservesSubstance('unit : Police', 'unit: Police'));
expectTrue('entité décodée : substance préservée', preservesSubstance(`a ${ESCAPED_AMP} b`, `a ${AMP} b`));
expectTrue(
    'perte de caractères : substance modifiée (donc détectée)',
    !preservesSubstance('Gloria  needs', 'Glori eeds')
);
expectTrue(
    'perte de ponctuation : substance modifiée (donc détectée)',
    !preservesSubstance('family.  She', 'family he')
);
expectTrue(
    'chaîne complète de correction : sûre',
    preservesSubstance(
        'Gloria  needs an orgasm .',
        fixEnglishPunctuation(collapseSpaceRuns('Gloria  needs an orgasm .'))
    )
);

console.log('');
console.log(`${checks - failures}/${checks} assertion(s) OK`);
console.log('');
if (failures) process.exit(1);
