/**
 * Chasse aux clichés LLM, badges creux et violations de doctrine éditoriale.
 *
 * Référence : AGENTS.md — « DOCTRINE ÉDITORIALE & RÉDACTIONNELLE : ZÉRO "AI SLOP" »
 *   1. Zéro invention ni enflure (titres de séquences, rôles de doublures, distinctions).
 *   2. Ton factuel et professionnel — bannir le sensationnalisme et les superlatifs creux.
 *   3. Zéro gadget UI creux — pas de faux badges marketing, pas de points clignotants.
 *   4. Terminologie Parkour — JAMAIS « ADD » ni « Art du Déplacement ».
 *
 * Usage :
 *   node scripts/hunt_llm_cliches.mjs            # rapport console + JSON
 *   node scripts/hunt_llm_cliches.mjs --strict   # exit 2 si au moins un hit
 *
 * Sortie : scripts/slop_report.json (inventaire structuré, par fichier et par règle).
 */
import fs from 'fs';
import path from 'path';

const STRICT = process.argv.includes('--strict');

/**
 * Chaque règle porte un identifiant stable (utilisé dans le rapport JSON) et une
 * regex. Les règles sont regroupées par nature de violation pour permettre un
 * triage rapide (badge creux vs superlatif vs terminologie).
 */
const RULES = [
  // ── 1. Badges marketing creux (doctrine §3) ────────────────────────────────
  { id: 'badge-hollywood', group: 'badge', re: /\bhollywood\b/i },
  { id: 'badge-pro-staff', group: 'badge', re: /\bpro\s*staff\b/i },
  { id: 'badge-worldwide', group: 'badge', re: /\bworldwide\b/i },
  { id: 'badge-box-office', group: 'badge', re: /\bbox[\s-]?office\b/i },
  { id: 'badge-tactique', group: 'badge', re: /\btactique?s?\b/i },
  { id: 'badge-elite', group: 'badge', re: /\b[ée]lite\b/i },
  { id: 'badge-premium', group: 'badge', re: /\bpremium\b/i },
  { id: 'badge-exclusif', group: 'badge', re: /\bexclusi(?:f|ve)\b/i },
  { id: 'badge-certifie', group: 'badge', re: /\bcertifi[eé]\s*(?:cuc|campus)/i },
  { id: 'badge-100-pourcent', group: 'badge', re: /100\s*%\s*(?:des images|s[ée]curis[ée]|s[ée]curit[ée]|certifi[ée]|garanti|professionnel)/i },

  // ── 2. Superlatifs et enflure (doctrine §2) ────────────────────────────────
  { id: 'superl-légendaire', group: 'superlatif', re: /\bl[ée]gendaire\b/i },
  { id: 'superl-référence-suprême', group: 'superlatif', re: /r[ée]f[ée]rence\s+supr[êe]me/i },
  { id: 'superl-inégalé', group: 'superlatif', re: /\bin[ée]gal[ée]\b/i },
  { id: 'superl-fleuron', group: 'superlatif', re: /\bfleuron\b/i },
  { id: 'superl-classe-mondiale', group: 'superlatif', re: /classe\s+mondiale/i },
  { id: 'superl-à-la-pointe', group: 'superlatif', re: /[àa]\s+la\s+pointe/i },
  { id: 'superl-à-couper-le-souffle', group: 'superlatif', re: /[àa]\s+couper\s+le\s+souffle/i },
  { id: 'superl-surpuissant', group: 'superlatif', re: /\bsurpuissant\b/i },
  { id: 'superl-machine-de-guerre', group: 'superlatif', re: /machine\s+de\s+guerre/i },
  { id: 'superl-chutes-massives', group: 'superlatif', re: /chutes?\s+massives?/i },
  { id: 'superl-dossier-pro-complet', group: 'superlatif', re: /dossier\s+pro\s+complet/i },
  { id: 'superl-gun-fu', group: 'superlatif', re: /gun[\s-]?fu/i },
  { id: 'superl-expérience-immersive', group: 'superlatif', re: /exp[ée]rience\s+immersive/i },
  { id: 'superl-rigueur-et-passion', group: 'superlatif', re: /rigueur\s+et\s+passion/i },
  { id: 'superl-alliance-subtile', group: 'superlatif', re: /alliance\s+subtile/i },
  { id: 'superl-plongez-au-coeur', group: 'superlatif', re: /plongez\s+au\s+c[œo]ur/i },
  { id: 'superl-succès-mondial', group: 'superlatif', re: /succ[èe]s\s+mondial/i },
  { id: 'superl-ultra-sécurisé', group: 'superlatif', re: /ultra[\s-]s[ée]curis[ée]/i },

  // ── 3. Terminologie Parkour (doctrine §4) ─────────────────────────────────
  { id: 'termino-add', group: 'terminologie', re: /\bADD\b/ },
  { id: 'termino-art-du-deplacement', group: 'terminologie', re: /art\s+du\s+d[ée]placement/i },

  // ── 4. Jargon pseudo-opérationnel (doctrine §3) ───────────────────────────
  { id: 'jargon-radar-tactique', group: 'jargon', re: /radar\s+tactique/i },
  { id: 'jargon-hub-opérationnel', group: 'jargon', re: /hub\s+op[ée]rationnel/i },
  { id: 'jargon-mission-cascades', group: 'jargon', re: /mission\s+cascades/i },
  { id: 'jargon-cursus-élite', group: 'jargon', re: /cursus\s+[ée]lite/i },
  { id: 'jargon-gps-actif', group: 'jargon', re: /gps\s+actif/i },
  { id: 'jargon-rôle-opérationnel', group: 'jargon', re: /r[ôo]le\s+op[ée]rationnel/i },
  { id: 'jargon-dossier-production', group: 'jargon', re: /dossier\s+production/i },
  { id: 'jargon-standards-militaires', group: 'jargon', re: /standards?\s+(?:militaires?|tactiques?)/i },
  { id: 'jargon-choc-tactique', group: 'jargon', re: /choc\s+tactique/i },
  { id: 'jargon-code-interne', group: 'jargon', re: /\b(?:OD|INFRA|MOD)-\d+/i },
  { id: 'jargon-5-paliers', group: 'jargon', re: /5\s+paliers/i },
  { id: 'jargon-tactical', group: 'jargon', re: /\btactical\b/i },

  // ── 5. Faux compteurs / chiffres d'enflure (doctrine §1) ──────────────────
  { id: 'chiffre-xtrem-jump', group: 'chiffre', re: /xtrem\s+jump\s+airbag\s*•\s*\+?\s*20\s*000\s*chutes/i },
  { id: 'chiffre-tour-de-saut-extreme', group: 'chiffre', re: /tour\s+de\s+saut\s+extr[êe]me/i },
];

/**
 * Fichiers exclus : ce sont des sources de vérité ou des artefacts d'audit qui
 * citent volontairement les termes bannis (registres, rapports, ce script).
 */
const EXCLUDE_FILES = new Set(
  [
    // Ce script et son rapport citent les motifs par construction.
    'scripts/hunt_llm_cliches.mjs',
    'scripts/slop_report.json',
    // L'audit définit lui-même la liste des motifs bannis.
    'scripts/audit_full_app.mjs',
    'scripts/audit_full_app_report.json',
    // Scripts d'inspection/diagnostic : ils listent les motifs pour les traquer.
    'scripts/inspect_badges_and_copy.mjs',
    'scripts/inspect_all_llm_copy.mjs',
    'scripts/audit_and_sync_supabase_clean.mjs',
    'scripts/deep_audit_interconnection.mjs',
    'scripts/clean_stunt_roles_and_fix_niels.mjs',
    'scripts/curate_authentic_stunt_roles.mjs',
    'scripts/sync_all_to_supabase.mjs',
    // Scripts de VÉRIFICATION DE DOCTRINE : ils définissent les motifs bannis
    // (regex, labels) pour les interdire en base. Les détecter serait un
    // artefact de détection, pas une violation éditoriale.
    'scripts/verify_doctrine_in_db.mjs',
    'scripts/verify_films_enrichment.mjs',
    // Scripts de NORMALISATION : ils portent les règles de remplacement
    // (`ADD` → `Parkour`, `gun-fu` → `Combats rapprochés`). Le motif source
    // est cité par construction.
    'scripts/enrich_films_and_roles.mjs',
    'scripts/lib/credit-curator.mjs',
    'scripts/fix_doctrine_in_db.mjs',
    'scripts/normalize_film_tags_in_db.mjs',
    'scripts/migrate_all_data_to_supabase.mjs',
    'scripts/sync_all_coach_credits_supabase.mjs',
    // Documentation du scraper : cite les termes bannis pour expliquer le
    // normaliseur.
    'scripts/README-coach-scraper.md',
    // Artefacts de revue / données brutes IMDb : contiennent les titres et
    // synopsis d'origine (anglais), jamais publiés tels quels sur la vitrine.
    'scripts/coach_credits_review.json',
    'scripts/coach_credits_review_imdb.json',
    'scripts/films_real_data.json',
    // Inventaires média : les noms de fichiers sources contiennent « WORLDWIDE ».
    'scripts/media_download_manifest.json',
    'scripts/media_classification.md',
    'scripts/media_classification.json',
    'scripts/media_inventory.md',
    'scripts/media_inventory.json',
    'scripts/media_url_mapping.md',
    'scripts/media_url_mapping.json',
    // Doctrine : cite les termes bannis pour les interdire.
    'AGENTS.md',
  ].map((p) => path.normalize(p)),
);

const EXCLUDE_DIRS = new Set(['node_modules', '.next', '.git', '.cache', 'plans']);

const SCAN_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.sql', '.json', '.md']);

/**
 * Neutralisation des faux positifs structurels avant analyse.
 *
 * 1. Valeurs d'énumération de niveau de discipline (« Tactique », « Extrême ») :
 *    ce sont des paliers pédagogiques, pas des badges marketing.
 * 2. Mots-clés SQL DDL (`ADD CONSTRAINT`, `ADD COLUMN`) : le verbe SQL « ADD »
 *    n'a rien à voir avec l'acronyme banni « ADD » (Art du Déplacement).
 * 3. Commentaires de code (`//`, `/*`, `{/*`) : les noms de design-tokens
 *    (« Tactical Grid ») ne sont jamais affichés à l'utilisateur.
 */
const NEUTRALIZE = [
  // Valeur d'énumération de niveau dans un `<option>` JSX :
  // `<option value="Tactique">Tactique</option>` — le texte affiché est le
  // palier pédagogique, pas un badge marketing. DOIT précéder les règles
  // génériques sur les guillemets, sinon `"Tactique"` est neutralisé avant
  // que le motif `<option>` complet ne puisse correspondre.
  /<option\s+value="(?:Tactique|Extrême|Extreme|Avancé|Avance|Intermédiaire|Intermediaire|Débutant|Debutant)">\s*(?:Tactique|Extrême|Extreme|Avancé|Avance|Intermédiaire|Intermediaire|Débutant|Debutant)\s*<\/option>/g,
  /'(?:Tactique|Extrême|Extreme|Avancé|Avance|Intermédiaire|Intermediaire|Débutant|Debutant)'/g,
  /"(?:Tactique|Extrême|Extreme|Avancé|Avance|Intermédiaire|Intermediaire|Débutant|Debutant)"/g,
  /level:\s*'(?:Tactique|Extrême|Extreme|Avancé|Avance|Intermédiaire|Intermediaire|Débutant|Debutant)'/g,
  /\bADD\s+(?:CONSTRAINT|COLUMN|TABLE|INDEX|PRIMARY|FOREIGN|UNIQUE|CHECK|PUBLICATION|IF)\b/gi,
  // Vocabulaire technique légitime des cascades : « déplacement tactique »,
  // « combats tactiques », « rappel tactique », « gilets tactiques » désignent
  // des techniques de plateau, pas des badges marketing. On neutralise
  // l'adjectif « tactique » uniquement lorsqu'il qualifie ces noms techniques.
  /\b(?:d[ée]placements?|combats?|rappel|gilets?|fusillades?|armes?)\s+tactiques?\b/gi,
  // Nom de thème du Cockpit (« Sombre Tactique ») : design-token, pas vitrine.
  /Sombre\s+Tactique/gi,
  // Libellés de catégories de films : « Blockbusters Hollywood » est un
  // classement éditorial factuel (origine des productions), pas un badge creux.
  /Blockbusters?\s+Hollywood/gi,
  // Valeur d'énumération de niveau dans un `<option>` JSX :
  // `<option value="Tactique">Tactique</option>` — le texte affiché est le
  // palier pédagogique, pas un badge marketing.
  /<option\s+value="(?:Tactique|Extrême|Extreme|Avancé|Avance|Intermédiaire|Intermediaire|Débutant|Debutant)">\s*(?:Tactique|Extrême|Extreme|Avancé|Avance|Intermédiaire|Intermediaire|Débutant|Debutant)\s*<\/option>/g,
  // Liste de mots-clés de rôles (stop-words) : « tactiques », « tactique »
  // sont des jetons techniques de parsing, jamais affichés.
  /'(?:rapproches|rapprochés|tactiques|tactique|scene|scène|generale|générale|partielle)'/g,
];

/** Détecte une ligne qui n'est QUE du commentaire de code (jamais rendue à l'écran). */
function isCodeComment(line) {
  const t = line.trim();
  return (
    t.startsWith('//') ||
    t.startsWith('/*') ||
    t.startsWith('*') ||
    t.startsWith('{/*') ||
    t.startsWith('--')
  );
}

/**
 * Retire un commentaire de fin de ligne (`code; // commentaire`) avant analyse.
 * Un nom de design-token dans un commentaire (`// For tactical radar layout`)
 * n'est jamais rendu à l'utilisateur. On ne coupe qu'à partir d'un `//` précédé
 * d'un espace (ou en début de ligne) et jamais à l'intérieur d'une chaîne
 * entre guillemets — pour ne pas casser les URLs (`https://…`).
 */
function stripTrailingComment(line) {
  let inSingle = false;
  let inDouble = false;
  let inBacktick = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    const prev = line[i - 1];
    if (c === "'" && !inDouble && !inBacktick && prev !== '\\') inSingle = !inSingle;
    else if (c === '"' && !inSingle && !inBacktick && prev !== '\\') inDouble = !inDouble;
    else if (c === '`' && !inSingle && !inDouble && prev !== '\\') inBacktick = !inBacktick;
    else if (
      c === '/' &&
      line[i + 1] === '/' &&
      !inSingle &&
      !inDouble &&
      !inBacktick &&
      (i === 0 || /\s/.test(prev))
    ) {
      return line.slice(0, i);
    }
  }
  return line;
}

function neutralize(line) {
  let out = stripTrailingComment(line);
  for (const re of NEUTRALIZE) out = out.replace(re, '«NEUTRALISE»');
  return out;
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
      continue;
    }
    if (!SCAN_EXTENSIONS.has(path.extname(entry.name))) continue;
    if (EXCLUDE_FILES.has(path.normalize(full))) continue;
    files.push(full);
  }
  return files;
}

const roots = ['src', 'scripts', 'public'];
const files = roots.flatMap((r) => walk(r));

const findings = [];
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((rawLine, idx) => {
    // Un commentaire de code n'est jamais rendu à l'utilisateur : les noms de
    // design-tokens (« Tactical Grid ») ne constituent pas du contenu vitrine.
    if (isCodeComment(rawLine)) return;
    const line = neutralize(rawLine);
    for (const rule of RULES) {
      if (rule.re.test(line)) {
        findings.push({
          file: path.normalize(file),
          line: idx + 1,
          rule: rule.id,
          group: rule.group,
          text: rawLine.trim().slice(0, 200),
        });
      }
    }
  });
}

// ── Rapport console ──────────────────────────────────────────────────────────
const byGroup = {};
for (const f of findings) byGroup[f.group] = (byGroup[f.group] || 0) + 1;

console.log(`\n=== CHASSE AUX CLICHÉS LLM / BADGES CREUX ===`);
console.log(`Fichiers scannés : ${files.length}`);
console.log(`Occurrences      : ${findings.length}\n`);
for (const [group, count] of Object.entries(byGroup).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${group.padEnd(14)} ${count}`);
}

const byFile = {};
for (const f of findings) {
  byFile[f.file] = byFile[f.file] || [];
  byFile[f.file].push(f);
}

console.log('');
for (const [file, items] of Object.entries(byFile).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`=== ${file} (${items.length}) ===`);
  for (const it of items.slice(0, 10)) {
    console.log(`  L${it.line} [${it.rule}] ${it.text.slice(0, 130)}`);
  }
  if (items.length > 10) console.log(`  … et ${items.length - 10} de plus`);
}

// ── Rapport JSON ─────────────────────────────────────────────────────────────
const report = {
  generatedAt: new Date().toISOString(),
  scannedFiles: files.length,
  total: findings.length,
  byGroup,
  byRule: RULES.map((r) => ({
    id: r.id,
    group: r.group,
    count: findings.filter((f) => f.rule === r.id).length,
  })).filter((r) => r.count > 0),
  findings,
};

fs.writeFileSync('scripts/slop_report.json', JSON.stringify(report, null, 2), 'utf8');
console.log(`\nRapport JSON : scripts/slop_report.json`);

if (STRICT && findings.length > 0) {
  console.error(`\nÉCHEC — ${findings.length} occurrence(s) de cliché/badge creux détectée(s).`);
  process.exit(2);
}
