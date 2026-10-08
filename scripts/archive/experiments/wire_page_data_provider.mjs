#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Câblage des layouts de route sur `PageDataProvider` (contenu localisé)
 * ==============================================================================
 * Constat mesuré : le layout de locale ne connaît pas le slug de la route, donc
 * `usePageDynamicContent` retombait, au rendu serveur, sur la constante
 * `DEFAULT_PAGE_CONTENTS[slug]` (français) — le HTML des pages EN contenait le
 * hero et les sections en français, corrigés seulement après hydratation.
 *
 * Chaque `layout.tsx` de route est un composant SERVEUR : il connaît son slug.
 * Ce codemod lui fait résoudre `getLocalizedPageContent(slug, locale)` et
 * l'injecter via `PageDataProvider` (qui recopie la coquille du parent).
 *
 * Idempotent : un layout déjà câblé est ignoré. `--dry` n'écrit rien.
 *
 * Usage :
 *   node scripts/wire_page_data_provider.mjs --dry
 *   node scripts/wire_page_data_provider.mjs
 * ==============================================================================
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join('src', 'app', '(site)', '[locale]');
const DRY = process.argv.includes('--dry');

const IMPORT_ANCHOR = "import { buildRouteMetadata } from '@/lib/i18n/route-metadata';";
const IMPORT_BLOCK = [
    "import { hasLocale } from 'next-intl';",
    "import { getLocalizedPageContent } from '@/lib/i18n/server';",
    "import { routing } from '@/i18n/routing';",
    "import type { Locale } from '@/lib/i18n/entities';",
    "import { PageDataProvider } from '@/components/i18n/PageDataProvider';",
].join('\n');

const DEFAULT_EXPORT_RE =
    /export default function RouteLayout\(\{\s*children,\s*\}:\s*\{\s*children: React\.ReactNode;\s*\}\)\s*\{\s*return <section className="w-full flex-grow flex flex-col">\{children\}<\/section>;\s*\}/;

const slugs = readdirSync(ROOT).filter((entry) => {
    try {
        return statSync(join(ROOT, entry)).isDirectory() && entry !== '[locale]';
    } catch {
        return false;
    }
});

let wired = 0;
let skipped = 0;
const problems = [];

for (const slug of slugs) {
    const file = join(ROOT, slug, 'layout.tsx');
    let source;
    try {
        source = readFileSync(file, 'utf8');
    } catch {
        continue; // pas de layout pour ce dossier
    }

    if (source.includes('PageDataProvider')) {
        console.log(`= ${slug} : déjà câblé`);
        skipped += 1;
        continue;
    }

    if (!source.includes(IMPORT_ANCHOR) || !DEFAULT_EXPORT_RE.test(source)) {
        problems.push(slug);
        console.warn(`⚠️  ${slug} : structure inattendue — ignoré`);
        continue;
    }

    let next = source.replace(IMPORT_ANCHOR, `${IMPORT_ANCHOR}\n${IMPORT_BLOCK}`);

    next = next.replace(
        DEFAULT_EXPORT_RE,
        `export default async function RouteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale: Locale = hasLocale(routing.locales, locale)
    ? (locale as Locale)
    : 'fr';

  // Contenu de page localisé (FR + overlay EN) résolu sur le SERVEUR : le HTML
  // servi est déjà dans la bonne langue, sans flash de français.
  const page = await getLocalizedPageContent('${slug}', safeLocale);

  return (
    <PageDataProvider page={page}>
      <section className="w-full flex-grow flex flex-col">{children}</section>
    </PageDataProvider>
  );
}`
    );

    if (!DRY) writeFileSync(file, next, 'utf8');
    console.log(`${DRY ? '[dry] ' : ''}${slug} : câblé`);
    wired += 1;
}

console.log('');
console.log(
    `${DRY ? 'DRY-RUN' : 'APPLIQUÉ'} — ${wired} layout(s) câblé(s), ${skipped} déjà fait(s), ${problems.length} ignoré(s).`
);
if (problems.length) {
    console.log(`À traiter manuellement : ${problems.join(', ')}`);
    process.exitCode = 2;
}
