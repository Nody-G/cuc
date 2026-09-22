#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Gate Mode Studio : une seule commande, tous les contrôles
 * ==============================================================================
 * Objectif : ne plus s'arrêter entre chaque vérification. Ce script enchaîne
 * les contrôles du Mode Studio et rend un verdict unique :
 *
 *  - **bloquants** : couverture des champs (aucune page sans champ éditable),
 *    budget performance (canal unique, zéro requête publique nominale, FR + EN,
 *    aperçu allégé) ;
 *  - **informatifs** : dette micro-textes (par nature décroissante, elle est
 *    mesurée et publiée, pas bloquante) ;
 *  - `--with-tests` ajoute typecheck et suite Vitest (plus long).
 *
 * Usage :
 *   node scripts/studio_gate.mjs                 # audits seuls
 *   node scripts/studio_gate.mjs --with-tests    # audits + typecheck + tests
 */

import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const withTests = process.argv.includes('--with-tests');

const steps = [
    {
        name: 'Couverture des champs éditables',
        command: ['node', ['scripts/audit_cuc_fields.mjs']],
        blocking: true,
    },
    {
        name: 'Budget performance',
        command: ['node', ['scripts/audit_performance_budget.mjs']],
        blocking: true,
    },
    {
        name: 'Micro-textes visiteurs (dette mesurée)',
        command: ['node', ['scripts/audit_visible_microcopy.mjs']],
        blocking: false,
    },
];

if (withTests) {
    steps.push(
        { name: 'TypeScript', command: ['npm', ['run', 'typecheck']], blocking: true },
        { name: 'Tests unitaires', command: ['npm', ['run', 'test']], blocking: true }
    );
}

const results = [];

for (const step of steps) {
    const [bin, args] = step.command;
    const shell = process.platform === 'win32';
    const run = spawnSync(bin, args, {
        cwd: ROOT,
        stdio: 'inherit',
        shell,
    });
    results.push({ name: step.name, code: run.status ?? 1, blocking: step.blocking });
}

console.log('');
console.log('=== Gate Mode Studio ===');
for (const result of results) {
    const state = result.code === 0 ? 'OK' : result.blocking ? 'ÉCHEC' : 'DETTE (non bloquante)';
    console.log(`- ${result.name} : ${state}${result.code === 0 ? '' : ` (code ${result.code})`}`);
}

const blockingFailure = results.some((result) => result.blocking && result.code !== 0);
console.log(blockingFailure ? '\nGate EN ÉCHEC — un contrôle bloquant est rouge.' : '\nGate OK.');

if (blockingFailure) process.exitCode = 2;
