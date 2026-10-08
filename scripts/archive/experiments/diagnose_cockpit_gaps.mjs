/**
 * Diagnostic des écarts Cockpit ↔ Vitrine ↔ Supabase.
 *
 * Objectif : mesurer précisément, pour chaque domaine éditorial, l'écart entre
 *   - les données réellement présentes en base (site_*),
 *   - les valeurs de repli codées en dur (DEFAULT_*),
 *   - et ce que le Cockpit affiche.
 *
 * Sortie : rapport JSON + tableau console. Lecture seule (aucune écriture).
 *
 * Usage : node scripts/diagnose_cockpit_gaps.mjs
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SERVICE_KEY) {
  console.error('Clé Supabase manquante (SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_ANON_KEY).');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/** Tables éditoriales du Cockpit et leur clé de tri canonique. */
const TABLES = [
  { table: 'site_partners', label: 'Partenaires', order: 'order_index' },
  { table: 'site_films', label: 'Films', order: 'order_index' },
  { table: 'site_team', label: 'Équipe', order: 'order_index' },
  { table: 'site_events', label: 'Événements', order: 'order_index' },
  { table: 'site_programs', label: 'Programmes', order: 'order_index' },
  { table: 'site_sessions', label: 'Sessions', order: 'order_index' },
  { table: 'site_disciplines', label: 'Disciplines', order: 'order_index' },
  { table: 'site_campus_pois', label: 'Zones campus', order: 'order_index' },
  { table: 'site_pages', label: 'Pages', order: 'slug' },
  { table: 'site_announcements', label: 'Annonces', order: 'created_at' },
  { table: 'site_inquiries', label: 'Candidatures', order: 'created_at' },
];

async function countTable(table) {
  const { count, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true });
  if (error) return { count: null, error: error.message };
  return { count: count ?? 0, error: null };
}

async function fetchAll(table, order) {
  const { data, error } = await supabase.from(table).select('*').order(order, { ascending: true });
  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}

async function main() {
  console.log('=== Diagnostic des écarts Cockpit / Vitrine / Supabase ===\n');

  const report = { generatedAt: new Date().toISOString(), tables: {}, findings: [] };

  for (const { table, label, order } of TABLES) {
    const { count, error } = await countTable(table);
    report.tables[table] = { label, count, error };
    const status = error ? `ERREUR: ${error}` : `${count} ligne(s)`;
    console.log(`- ${label.padEnd(16)} (${table.padEnd(20)}) : ${status}`);
  }

  // --- Partenaires : détecter les non publiés (invisibles côté vitrine) ---
  console.log('\n--- Partenaires : publication ---');
  const partners = await fetchAll('site_partners', 'order_index');
  if (partners.data) {
    const unpublished = partners.data.filter((p) => p.is_published === false);
    console.log(`Total : ${partners.data.length} | Publiés : ${partners.data.length - unpublished.length} | Non publiés : ${unpublished.length}`);
    if (unpublished.length > 0) {
      report.findings.push({
        severity: 'warning',
        area: 'partenaires',
        message: `${unpublished.length} partenaire(s) non publié(s) — invisibles sur la vitrine.`,
        items: unpublished.map((p) => ({ id: p.id, name: p.name })),
      });
      unpublished.forEach((p) => console.log(`   [non publié] ${p.id} — ${p.name}`));
    }
    const missingLogo = partners.data.filter((p) => !p.logo_url);
    if (missingLogo.length > 0) {
      report.findings.push({
        severity: 'warning',
        area: 'partenaires',
        message: `${missingLogo.length} partenaire(s) sans logo.`,
        items: missingLogo.map((p) => ({ id: p.id, name: p.name })),
      });
    }
  } else {
    console.log(`ERREUR lecture site_partners : ${partners.error}`);
  }

  // --- Films : intervenants CUC manquants ---
  console.log('\n--- Films : intervenants CUC ---');
  const films = await fetchAll('site_films', 'order_index');
  if (films.data) {
    const total = films.data.length;
    const withTeam = films.data.filter(
      (f) => Array.isArray(f.cuc_team_involved) && f.cuc_team_involved.length > 0
    );
    const withoutTeam = films.data.filter(
      (f) => !Array.isArray(f.cuc_team_involved) || f.cuc_team_involved.length === 0
    );
    console.log(`Total : ${total} | Avec intervenants : ${withTeam.length} | Sans intervenants : ${withoutTeam.length}`);
    if (withoutTeam.length > 0) {
      report.findings.push({
        severity: 'info',
        area: 'films',
        message: `${withoutTeam.length} film(s) sans intervenant CUC renseigné.`,
        items: withoutTeam.slice(0, 40).map((f) => ({ id: f.id, title: f.title })),
      });
    }
    // Rôles déclarés mais membre absent de l'équipe
    const team = await fetchAll('site_team', 'order_index');
    if (team.data) {
      const teamIds = new Set(team.data.map((t) => t.id));
      const orphans = [];
      films.data.forEach((f) => {
        (f.cuc_team_involved || []).forEach((memberId) => {
          if (!teamIds.has(memberId)) orphans.push({ film: f.title, memberId });
        });
      });
      if (orphans.length > 0) {
        report.findings.push({
          severity: 'warning',
          area: 'films',
          message: `${orphans.length} référence(s) d'intervenant orpheline(s) (membre absent de site_team).`,
          items: orphans.slice(0, 40),
        });
        console.log(`   ${orphans.length} référence(s) orpheline(s) détectée(s).`);
      }
    }
  } else {
    console.log(`ERREUR lecture site_films : ${films.error}`);
  }

  // --- Équipe : cohérence des slugs / IMDb ---
  console.log('\n--- Équipe : identités ---');
  const team = await fetchAll('site_team', 'order_index');
  if (team.data) {
    const noImdb = team.data.filter((t) => !t.imdb_id && !t.imdb);
    console.log(`Total : ${team.data.length} | Sans IMDb : ${noImdb.length}`);
    if (noImdb.length > 0) {
      report.findings.push({
        severity: 'info',
        area: 'equipe',
        message: `${noImdb.length} membre(s) sans identifiant IMDb.`,
        items: noImdb.map((t) => ({ id: t.id, name: t.name })),
      });
    }
  } else {
    console.log(`ERREUR lecture site_team : ${team.error}`);
  }

  // --- Synthèse ---
  console.log('\n=== Synthèse des constats ===');
  if (report.findings.length === 0) {
    console.log('Aucun écart détecté.');
  } else {
    report.findings.forEach((f) => {
      console.log(`[${f.severity.toUpperCase()}] ${f.area} — ${f.message}`);
    });
  }

  const fs = await import('node:fs/promises');
  await fs.writeFile(
    'scripts/cockpit_gaps_report.json',
    JSON.stringify(report, null, 2),
    'utf8'
  );
  console.log('\nRapport écrit : scripts/cockpit_gaps_report.json');
}

main().catch((err) => {
  console.error('Échec du diagnostic :', err);
  process.exit(1);
});
