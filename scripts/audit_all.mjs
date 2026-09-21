#!/usr/bin/env node
/**
 * Point d'entrée unique d'audit — CUC
 * ------------------------------------
 * Consolide les audits canoniques dispersés en une seule commande :
 *
 *   npm run audit:all          # exécute toute la chaîne
 *   npm run audit:all -- --fast # saute les étapes réseau (DB / prod)
 *
 * Étapes (dans l'ordre) :
 *   1. audit_full_app.mjs          — liens, doublons, ancres, orphelins, slop, social
 *   2. hunt_llm_cliches.mjs        — chasse aux clichés IA (5 groupes de règles)
 *   3. verify_doctrine_in_db.mjs   — 0 violation doctrine en base Supabase
 *   4. verify_media_url_coverage.mjs — 0 URL legacy wp-content (code + seeds)
 *   5. verify_no_legacy_urls_in_db.mjs — 0 URL legacy en base
 *   6. verify_featured_matching.mjs — taux d'appariement crédits ↔ catalogue
 *
 * Chaque étape est isolée : un échec n'interrompt pas la chaîne, mais le
 * rapport final sort en code 1 si au moins une étape a échoué.
 */

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FAST = process.argv.includes('--fast');

/** @typedef {{ name: string, file: string, args?: string[], network?: boolean }} AuditStep */

/** @type {AuditStep[]} */
const STEPS = [
  { name: 'Audit complet app', file: 'audit_full_app.mjs' },
  { name: 'Chasse clichés IA', file: 'hunt_llm_cliches.mjs' },
  { name: 'Doctrine en base', file: 'verify_doctrine_in_db.mjs', network: true },
  { name: 'Couverture médias (code + seeds)', file: 'verify_media_url_coverage.mjs' },
  { name: 'URLs legacy en base', file: 'verify_no_legacy_urls_in_db.mjs', network: true },
  { name: 'Appariement crédits ↔ catalogue', file: 'verify_featured_matching.mjs', network: true },
];

const results = [];

for (const step of STEPS) {
  const abs = join(__dirname, step.file);

  if (!existsSync(abs)) {
    results.push({ name: step.name, status: 'SKIP', detail: 'fichier introuvable' });
    console.log(`\n⏭️  ${step.name} — ignoré (${step.file} introuvable)`);
    continue;
  }

  if (FAST && step.network) {
    results.push({ name: step.name, status: 'SKIP', detail: '--fast (réseau)' });
    console.log(`\n⏭️  ${step.name} — ignoré (--fast)`);
    continue;
  }

  console.log(`\n${'─'.repeat(64)}\n▶️  ${step.name} — ${step.file}\n${'─'.repeat(64)}`);

  const proc = spawnSync(process.execPath, [abs, ...(step.args ?? [])], {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env,
  });

  const code = proc.status ?? 1;
  results.push({ name: step.name, status: code === 0 ? 'OK' : 'FAIL', detail: `exit ${code}` });
}

console.log(`\n${'═'.repeat(64)}\n📋 RAPPORT D'AUDIT CONSOLIDÉ\n${'═'.repeat(64)}`);
for (const r of results) {
  const icon = r.status === 'OK' ? '✅' : r.status === 'SKIP' ? '⏭️ ' : '❌';
  console.log(`${icon} ${r.name.padEnd(42)} ${r.detail}`);
}

const failed = results.filter((r) => r.status === 'FAIL');
const skipped = results.filter((r) => r.status === 'SKIP');
console.log(
  `\n${results.length - failed.length - skipped.length}/${results.length} étapes OK` +
    (skipped.length ? ` · ${skipped.length} ignorée(s)` : '') +
    (failed.length ? ` · ${failed.length} échec(s)` : '')
);

process.exit(failed.length > 0 ? 1 : 0);
