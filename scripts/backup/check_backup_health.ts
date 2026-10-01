#!/usr/bin/env node
/**
 * CLI — diagnostic de santé du dispositif de sauvegarde. **Strictement en
 * lecture seule** : ni écriture base, ni écriture stockage, ni écriture GitHub.
 *
 *   npm run backup:health
 *   npm run backup:health -- --max-age-hours=48
 *   npm run backup:health -- --json
 *
 * Lit le catalogue (`index.json`) et les manifestes via les modules existants,
 * confie le verdict au domaine pur (`assessBackupHealth`), imprime un rapport
 * lisible (une ligne par constat), alimente `$GITHUB_STEP_SUMMARY` et sort avec
 * le code calculé : `0` sain, `2` avertissement, `1` critique. Si le stockage ou
 * les identifiants sont absents, la sortie est un **refus explicite** — jamais
 * une réussite mensongère.
 */
import { appendFileSync } from 'node:fs';

import * as dotenv from 'dotenv';

import type { BackupManifest } from '../../src/lib/backup/contracts';
import { assessBackupHealth, type BackupHealthVerdict } from '../../src/lib/backup/health';
import { BACKUP_ENV, DEFAULT_STORAGE_PREFIX, resolveRetentionPolicy, resolveStorageSelection } from '../../src/lib/backup/io/config';
import { readBackupIndex } from '../../src/lib/backup/io/index-store';
import { createStorage } from '../../src/lib/backup/io/storage';
import { parseManifest } from '../../src/lib/backup/manifest';
import { buildIndexObjectKey } from '../../src/lib/backup/orchestrate';

dotenv.config({ path: '.env.local' });

const args = process.argv.slice(2);
const JSON_OUT = args.includes('--json');

/** Valeur d'une option `--nom=valeur`, sinon `null`. */
function option(name: string): string | null {
    const found = args.find((argument) => argument.startsWith(`--${name}=`));
    return found === undefined ? null : found.slice(name.length + 3);
}

function humanBytes(value: number | null): string {
    if (value === null) return '—';
    if (value < 1024) return `${value} o`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} Ko`;
    return `${(value / (1024 * 1024)).toFixed(2)} Mo`;
}

/** Résumé markdown destiné à `$GITHUB_STEP_SUMMARY`. */
function summaryMarkdown(verdict: BackupHealthVerdict): string {
    const last = verdict.lastSnapshot;
    const age = last.ageHours === null ? '—' : `${(Math.round(last.ageHours * 10) / 10)} h`;
    return [
        `## Diagnostic des sauvegardes — verdict : **${verdict.severity}** (code ${verdict.exitCode})`,
        '',
        '| Indicateur | Valeur |',
        '| :--- | :--- |',
        `| Dernier instantané | ${last.id ?? '—'} |`,
        `| Âge | ${age} |`,
        `| Statut | ${last.status ?? '—'} |`,
        `| Lignes | ${last.rows === null ? '—' : last.rows} |`,
        `| Octets | ${humanBytes(last.bytes)} |`,
        `| Tiers disponibles | quotidien ${verdict.tiers.daily} · hebdo ${verdict.tiers.weekly} · mensuel ${verdict.tiers.monthly} |`,
        `| Instantanés au catalogue | ${verdict.snapshotCount} |`,
        '',
    ].join('\n');
}

async function main(): Promise<void> {
    const env = { ...process.env };
    const prefix = env[BACKUP_ENV.storagePrefix]?.trim() || DEFAULT_STORAGE_PREFIX;
    const rawMaxAge = option('max-age-hours');
    const maxAgeHours = rawMaxAge === null ? 48 : Number(rawMaxAge);
    if (!Number.isFinite(maxAgeHours) || maxAgeHours <= 0) {
        throw new Error(`--max-age-hours invalide « ${rawMaxAge} » — un nombre d'heures strictement positif est attendu.`);
    }

    const storage = await createStorage(resolveStorageSelection(env));
    if (!storage.ok) throw new Error(`Stockage indisponible — ${storage.error.message}`);

    const index = await readBackupIndex(storage.value, buildIndexObjectKey(prefix));
    if (!index.ok) throw new Error(`Catalogue illisible — ${index.error.message}`);

    // Manifestes : lus en lecture seule ; un manifeste illisible est signalé,
    // il n'est jamais transformé en instantané sain.
    const manifests: BackupManifest[] = [];
    const manifestFailures: string[] = [];
    for (const entry of index.value.entries) {
        const object = await storage.value.get(`${entry.prefix}/manifest.json`);
        if (!object.ok) {
            manifestFailures.push(`${entry.id} — ${object.error.code}`);
            continue;
        }
        const parsed = parseManifest(object.value.toString('utf8'));
        if (!parsed.ok) {
            manifestFailures.push(`${entry.id} — ${parsed.error}`);
            continue;
        }
        manifests.push(parsed.manifest);
    }

    const verdict = assessBackupHealth({
        index: index.value,
        manifests,
        policy: resolveRetentionPolicy(env),
        now: new Date(),
        options: { maxAgeHours },
    });

    if (JSON_OUT) {
        console.log(JSON.stringify(verdict, null, 2));
    } else {
        console.log(`Diagnostic des sauvegardes — verdict ${verdict.severity} (code ${verdict.exitCode})`);
        for (const finding of verdict.findings) console.log(`[${finding.severity.toUpperCase()}] ${finding.message}`);
        for (const failure of manifestFailures) console.error(`[MANIFESTE] illisible — ${failure}`);
    }

    // Annotations GitHub : visibles même quand le rapport détaillé est replié.
    if (!JSON_OUT) {
        for (const finding of verdict.findings) {
            if (finding.severity === 'critical') console.log(`::error::${finding.message}`);
            else if (finding.severity === 'warning') console.log(`::warning::${finding.message}`);
        }
    }

    const stepSummary = process.env.GITHUB_STEP_SUMMARY;
    if (typeof stepSummary === 'string' && stepSummary.length > 0) appendFileSync(stepSummary, summaryMarkdown(verdict));

    process.exitCode = verdict.exitCode;
}

main().catch((error: unknown) => {
    console.error(`[backup:health] REFUS — ${error instanceof Error ? error.message : 'cause inconnue'}`);
    process.exitCode = 1;
});
