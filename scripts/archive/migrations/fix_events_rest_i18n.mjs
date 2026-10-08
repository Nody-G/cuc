#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Derniers libellés FR du parcours événementiel (correctif ponctuel)
 * ==============================================================================
 * Traite quatre fichiers dont les ancres contiennent des entités HTML
 * (`&`, `'`) : bandeaux partenaires de l'agence, reste du bloc
 * « animations » des piliers, sous-titre du panneau Airbag, et bandeau du
 * Stunt Workshop.
 *
 * Ancres construites avec `\x26` / `\x27` : le fichier n'est jamais ambigu.
 * Idempotent : une ancre déjà remplacée est signalée comme absente.
 * ==============================================================================
 */
import { readFileSync, writeFileSync } from 'node:fs';

const A = '\x26'; // &
const P = '\x27'; // '

const NEXT_INTL_IMPORT = "import { useTranslations } from 'next-intl';";

const TARGETS = [
    {
        file: 'src/components/sections/events/EventsPartnersBanners.tsx',
        edits: [
            {
                from: ``,
                to: `\n${NEXT_INTL_IMPORT}`,
                kind: 'insert-import',
            },
            {
                from: `export const EventsPartnersBanners: React.FC = () => {\n  return (`,
                to: `export const EventsPartnersBanners: React.FC = () => {\n  const t = useTranslations('eventsAgence');\n  return (`,
            },
            {
                from: `              <StuntBadge variant="yellow">PARTENAIRES ${A} MARQUES</StuntBadge>`,
                to: `              <StuntBadge variant="yellow">{t('partnersBadge')}</StuntBadge>`,
            },
            {
                from: `              ILS NOUS ONT FAIT CONFIANCE`,
                to: `              {t('partnersTitle')}`,
            },
            {
                from: `              <StuntBadge variant="yellow">RÉFÉRENCES CINÉMA</StuntBadge>`,
                to: `              <StuntBadge variant="yellow">{t('cinemaBadge')}</StuntBadge>`,
            },
            {
                from: `              LES PRODUCTIONS CINÉMA ${A} TÉLÉVISION`,
                to: `              {t('cinemaTitle')}`,
            },
        ],
    },
    {
        file: 'src/components/sections/events/EventsPillarsSection.tsx',
        edits: [
            {
                from: `                    Installations entièrement conformes aux normes de sécurité les plus strictes avec assurance professionnelle et encadrement qualifié.`,
                to: `                    {pillars[1].paragraph2}`,
            },
            {
                from: `                        En savoir plus sur nos Animations`,
                to: `                        {pillars[1].cta}`,
            },
        ],
    },
    {
        file: 'src/app/(site)/[locale]/animations-airbag-parkour/page.tsx',
        edits: [
            {
                from: `                        XTREM JUMP AIRBAG CINÉMA ${A}amp; PARKOUR`,
                to: `                        {t('panelSub')}`,
            },
        ],
    },
    {
        file: 'src/app/(site)/[locale]/stunt-workshop-cuc/page.tsx',
        edits: [
            {
                from: `import React from 'react';`,
                to: `import React from 'react';\nimport { useTranslations } from 'next-intl';`,
                kind: 'insert-import',
            },
            {
                from: `  EN ANGLAIS ${A} FRANÇAIS • 2 SEMAINES RÉSIDENTIELLES`,
                to: `  {t('heroMeta')}`,
            },
        ],
    },
];

const results = [];

for (const target of TARGETS) {
    let source = readFileSync(target.file, 'utf8');

    // Les édits `insert-import` passent en dernier : ils modifient le préambule.
    const edits = target.edits.filter((edit) => edit.kind !== 'insert-import');
    for (const edit of edits) {
        if (!source.includes(edit.from)) {
            results.push(`ABSENT  ${target.file} :: ${edit.from.trim().slice(0, 60)}`);
            continue;
        }
        source = source.replace(edit.from, edit.to);
        results.push(`OK      ${target.file} :: ${edit.from.trim().slice(0, 60)}`);
    }

    // Hook du composant de page du Stunt Workshop (une seule occurrence).
    if (target.file.endsWith('stunt-workshop-cuc/page.tsx') && !source.includes("useTranslations('stuntWorkshop')")) {
        source = source.replace(
            /export default function (\w+)\(\)\s*\{/,
            (match, name) => `${match}\n  const t = useTranslations('stuntWorkshop');`
        );
        results.push(`OK      ${target.file} :: hook useTranslations('stuntWorkshop')`);
    }

    // Import next-intl si absent.
    if (!source.includes(NEXT_INTL_IMPORT) && source.includes(`useTranslations(`)) {
        source = source.replace(/^(import React.*;\n)/m, `$1${NEXT_INTL_IMPORT}\n`);
        results.push(`OK      ${target.file} :: import next-intl`);
    }

    writeFileSync(target.file, source, 'utf8');
}

console.log(results.join('\n'));
if (results.some((line) => line.startsWith('ABSENT'))) process.exitCode = 2;
