import fs from 'node:fs';
import path from 'node:path';
import { STUNT_PROGRAMS } from '../src/data/programs';
import { CUC_TEAM } from '../src/data/team';
import { FILMOGRAPHY_CREDITS } from '../src/data/filmography';

function escapeSql(str: string | undefined | null): string {
  if (str === undefined || str === null) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

function escapeSqlArray(arr: string[] | undefined | null): string {
  if (!arr || arr.length === 0) return "'{}'::text[]";
  const items = arr.map(item => `'${item.replace(/'/g, "''")}'`).join(', ');
  return `ARRAY[${items}]::text[]`;
}

let sql = `-- ==============================================================================
-- CUC — Campus Univers Cascades : Données Initiales du Site Vitrine (SEED)
-- ==============================================================================
-- Exécutez ce script APRÈS scripts/schema_site_vitrine.sql dans l'éditeur SQL Supabase.
-- ==============================================================================

-- 1. INSERTION DES PROGRAMMES (site_programs)
`;

STUNT_PROGRAMS.forEach((p, idx) => {
  sql += `INSERT INTO public.site_programs (
    id, category, title, badge, highlight, tagline, duration, hours, location,
    price, price_note, age_requirement, eligibility, description, objectives,
    key_modules, certification, cta_text, brochure_url, order_index, is_published
) VALUES (
    ${escapeSql(p.id)},
    ${escapeSql(p.category)},
    ${escapeSql(p.title)},
    ${escapeSql(p.badge)},
    ${p.highlight ? 'true' : 'false'},
    ${escapeSql(p.tagline)},
    ${escapeSql(p.duration)},
    ${escapeSql(p.hours)},
    ${escapeSql(p.location)},
    ${escapeSql(p.price)},
    ${escapeSql(p.priceNote)},
    ${escapeSql(p.ageRequirement)},
    ${escapeSqlArray(p.eligibility)},
    ${escapeSql(p.description)},
    ${escapeSqlArray(p.objectives)},
    ${escapeSqlArray(p.keyModules)},
    ${escapeSql(p.certification)},
    ${escapeSql(p.ctaText)},
    ${escapeSql(p.brochureUrl)},
    ${idx},
    true
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    badge = EXCLUDED.badge,
    price = EXCLUDED.price,
    price_note = EXCLUDED.price_note,
    description = EXCLUDED.description,
    brochure_url = EXCLUDED.brochure_url;

`;

  // Sessions for this program
  if (p.nextSessions && p.nextSessions.length > 0) {
    p.nextSessions.forEach((s, sIdx) => {
      sql += `INSERT INTO public.site_sessions (
    program_id, date_display, status, order_index, is_published
) VALUES (
    ${escapeSql(p.id)},
    ${escapeSql(s.date)},
    ${escapeSql(s.status)},
    ${sIdx},
    true
);
`;
    });
    sql += '\n';
  }
});

sql += `-- 2. INSERTION DE L'ÉQUIPE (site_team)\n`;

CUC_TEAM.forEach((t, idx) => {
  sql += `INSERT INTO public.site_team (
    id, name, role, title, specialties, bio, notable_credits,
    avatar_url, instagram, imdb, external_url, order_index, is_published
) VALUES (
    ${escapeSql(t.id)},
    ${escapeSql(t.name)},
    ${escapeSql(t.role)},
    ${escapeSql(t.title)},
    ${escapeSqlArray(t.specialties)},
    ${escapeSql(t.bio)},
    ${escapeSqlArray(t.notableCredits)},
    ${escapeSql(t.avatarUrl)},
    ${escapeSql(t.instagram)},
    ${escapeSql(t.imdb)},
    ${escapeSql(t.externalUrl)},
    ${idx},
    true
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    title = EXCLUDED.title,
    bio = EXCLUDED.bio,
    avatar_url = EXCLUDED.avatar_url;

`;
});

sql += `-- 3. INSERTION DE LA FILMOGRAPHIE (site_films)\n`;

FILMOGRAPHY_CREDITS.forEach((f, idx) => {
  sql += `INSERT INTO public.site_films (
    id, title, year, category, director, stunt_roles, doubled_actors,
    highlight, image, tag, imdb_url, allocine_url, trailer_url, order_index, is_published
) VALUES (
    ${escapeSql(f.id)},
    ${escapeSql(f.title)},
    ${escapeSql(f.year)},
    ${escapeSql(f.category)},
    ${escapeSql(f.director)},
    ${escapeSql(f.stuntRoles)},
    ${escapeSqlArray(f.doubledActors)},
    ${f.highlight ? 'true' : 'false'},
    ${escapeSql(f.image)},
    ${escapeSql(f.tag)},
    ${escapeSql(f.imdbUrl)},
    ${escapeSql(f.allocineUrl)},
    ${escapeSql(f.trailerUrl)},
    ${idx},
    true
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    year = EXCLUDED.year,
    director = EXCLUDED.director,
    stunt_roles = EXCLUDED.stunt_roles,
    image = EXCLUDED.image;

`;
});

sql += `-- 4. BANDEAU D'ALERTE PAR DÉFAUT (site_announcements)
INSERT INTO public.site_announcements (
    title, message, badge, style, is_active
) VALUES (
    'Inscriptions Ouvertes',
    'Les inscriptions pour les prochains stages cascades & parkour sont actuellement ouvertes.',
    'CUC 2026-2027',
    'gold',
    false
);
`;

const outputPath = path.join(process.cwd(), 'scripts', 'seed_site_vitrine.sql');
fs.writeFileSync(outputPath, sql, 'utf-8');
console.log(`Fichier SQL de seed régénéré avec succès : ${outputPath}`);
