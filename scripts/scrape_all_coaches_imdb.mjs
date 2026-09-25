/**
 * ==============================================================================
 * CUC — Scraping exhaustif des 20 coachs CUC via IMDb GraphQL
 * ==============================================================================
 * 1. Parcourt les 20 coachs du CUC (registre officiel issu du campus).
 * 2. Récupère tous leurs crédits via GraphQL (avec ... on Crew { jobs { text } }).
 * 3. Classe chaque participation selon la consigne stricte :
 *    - Cascadeur : cascadeur, stunt, stunt performer, cascade, cascades...
 *    - Coordinateur : coordinateur, coordinateur des cascades, stunt coordinator...
 *    - Doublure : stunt double, doublure + nom de l'acteur doublé.
 * 4. Documente la date du scraping (imdb_last_scraped_at).
 * 5. Extrait l'ensemble des acteurs doublés avec leurs cascadeurs et productions.
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { imdb } from './lib/imdb-client.mjs';
import { COACH_REGISTRY } from './lib/coach-registry.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const OUTPUT_JSON = path.join(__dirname, 'coaches_scraped_full_imdb.json');
const REPORT_MD = path.join(ROOT, 'plans', 'rapport-scraping-20-coachs-imdb.md');

// Normalisation des noms d'acteurs
function cleanActorName(rawName) {
  if (!rawName) return null;
  let name = rawName
    .replace(/^[:\s-]+/, '')
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Filtrer les faux positifs (mots techniques qui ne sont pas des noms propres)
  const stopWords = [
    'combats', 'combat', 'cascades', 'cascade', 'action', 'physique',
    'rapproches', 'rapprochés', 'tactiques', 'tactique', 'scene', 'scène',
    'generale', 'générale', 'partielle', 'specialiste', 'spécialiste',
    'stunt', 'stunts', 'driver', 'utility', 'performer'
  ];
  if (stopWords.includes(name.toLowerCase())) return null;

  // Remettre en casse propre
  return name.split(' ').map(w => {
    if (w.length <= 2 && w === w.toUpperCase()) return w;
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  }).join(' ');
}

// Extraction du nom de l'acteur doublé depuis le libellé de job
function extractActorFromJob(jobText) {
  if (!jobText) return null;
  const match = jobText.match(/(?:stunt\s+double|doublure(?:\s+cascades?)?)\s*(?:de\s+|d'|:)?\s*([a-zA-ZÀ-ÿ\s'-]+)/i);
  if (match && match[1]) {
    return cleanActorName(match[1]);
  }
  return null;
}

// Classification d'un crédit selon les règles utilisateur
function classifyCredit(credit) {
  const cat = (credit.category || '').toLowerCase();
  const jobs = (credit.jobs || []).map(j => (j || '').trim());
  const allTexts = [cat, ...jobs].join(' | ').toLowerCase();

  let category = 'Cascadeur';
  let doubledActor = null;
  let specificJob = '';

  // 1. Détection Doublure
  for (const job of jobs) {
    if (/stunt\s+double|doublure/i.test(job)) {
      category = 'Doublure';
      specificJob = job;
      doubledActor = extractActorFromJob(job);
      break;
    }
  }
  if (!doubledActor && (cat.includes('stunt double') || cat.includes('doublure'))) {
    category = 'Doublure';
    doubledActor = extractActorFromJob(cat);
  }

  // 2. Détection Coordinateur (si pas doublure ou si coordination mentionnée)
  const isCoord = /coordinat|supervis|régleur|regleur/i.test(allTexts);
  if (isCoord && category !== 'Doublure') {
    category = 'Coordinateur';
    specificJob = jobs.find(j => /coordinat|supervis|régleur|regleur/i.test(j)) || 'Coordinateur des cascades';
  } else if (isCoord && category === 'Doublure') {
    // Si la personne a fait les deux sur le même film, on garde la doublure pour la détection acteur
    // mais on note aussi la coordination
  }

  // 3. Sinon Cascadeur (stunt, stunt performer, cascade...)
  if (category !== 'Doublure' && category !== 'Coordinateur') {
    category = 'Cascadeur';
    specificJob = jobs[0] || 'Cascadeur';
  }

  // Rôle formaté
  let roleLabel = 'Cascadeur';
  if (category === 'Coordinateur') {
    roleLabel = 'Coordinateur des cascades';
  } else if (category === 'Doublure') {
    roleLabel = doubledActor ? `Doublure de ${doubledActor}` : 'Doublure';
  }

  return {
    category,
    roleLabel,
    doubledActor,
    specificJob,
    isCoordination: isCoord,
    isDoublure: category === 'Doublure',
    isCascadeur: category === 'Cascadeur' || /stunt|cascade/i.test(allTexts),
  };
}

async function scrapeAllCoaches() {
  console.log(`=== DÉMARRAGE DU SCRAPING DES ${COACH_REGISTRY.length} COACHS CUC ===\n`);
  const now = new Date().toISOString();
  const results = [];
  const allDoubledActorsMap = new Map(); // actorName -> { actorName, coaches: Set, productions: Set }

  for (let i = 0; i < COACH_REGISTRY.length; i++) {
    const coach = COACH_REGISTRY[i];
    console.log(`[${i + 1}/${COACH_REGISTRY.length}] ${coach.name} (${coach.id})...`);

    if (!coach.imdbId) {
      console.log(`  → Aucun identifiant IMDb pour ${coach.name} (exclu du scraping IMDb)`);
      results.push({
        id: coach.id,
        name: coach.name,
        imdbId: null,
        scrapedAt: now,
        creditsCount: 0,
        credits: [],
        doubledActors: [],
        status: 'SANS_IMDB',
      });
      continue;
    }

    try {
      const personData = await imdb.getPersonCredits(coach.imdbId);
      if (!personData || !personData.credits) {
        console.warn(`  ⚠️ Aucune donnée reçue pour ${coach.name} (${coach.imdbId})`);
        results.push({
          id: coach.id,
          name: coach.name,
          imdbId: coach.imdbId,
          scrapedAt: now,
          creditsCount: 0,
          credits: [],
          doubledActors: [],
          status: 'ERREUR_VIDE',
        });
        continue;
      }

      console.log(`  ✓ ${personData.credits.length} crédits bruts reçus (Total IMDb: ${personData.total})`);

      const coachCredits = [];
      const coachDoubledActors = new Set();

      for (const raw of personData.credits) {
        // Filtrer les crédits non pertinents (ex: Self, Archive Footage, Thanks) sauf cascades/crew/acting parkour
        const cat = (raw.category || '').toLowerCase();
        if (/thanks|archive|self/i.test(cat) && !raw.jobs?.length) {
          continue;
        }

        const title = raw.title || raw.originalTitle;
        if (!title) continue;

        const classification = classifyCredit(raw);

        const creditEntry = {
          titleId: raw.titleId,
          title,
          originalTitle: raw.originalTitle,
          year: raw.year ? String(raw.year) : '',
          rawCategory: raw.category,
          rawJobs: raw.jobs || [],
          category: classification.category, // 'Cascadeur' | 'Coordinateur' | 'Doublure'
          roleLabel: classification.roleLabel,
          doubledActor: classification.doubledActor,
          formattedCredit: `${title}${raw.year ? ` (${raw.year})` : ''} — ${classification.roleLabel}`,
        };

        coachCredits.push(creditEntry);

        if (classification.doubledActor) {
          coachDoubledActors.add(classification.doubledActor);

          // Agrégation globale
          const key = classification.doubledActor.toLowerCase();
          if (!allDoubledActorsMap.has(key)) {
            allDoubledActorsMap.set(key, {
              name: classification.doubledActor,
              coaches: new Set(),
              productions: new Set(),
            });
          }
          const agg = allDoubledActorsMap.get(key);
          agg.coaches.add(coach.name);
          if (title) agg.productions.add(title);
        }
      }

      // Déduplication des crédits par (titleId ou titre + année)
      const dedupedCreditsMap = new Map();
      for (const c of coachCredits) {
        const k = c.titleId || `${c.title}::${c.year}`;
        if (!dedupedCreditsMap.has(k)) {
          dedupedCreditsMap.set(k, c);
        } else {
          // Fusionner : si une version est Doublure ou Coordinateur, elle prime sur Cascadeur
          const existing = dedupedCreditsMap.get(k);
          if (c.category === 'Coordinateur' && existing.category === 'Cascadeur') {
            dedupedCreditsMap.set(k, c);
          } else if (c.category === 'Doublure' && existing.category !== 'Doublure') {
            dedupedCreditsMap.set(k, c);
          }
        }
      }
      const dedupedCredits = Array.from(dedupedCreditsMap.values());

      console.log(`  → ${dedupedCredits.length} crédits dédoublonnés, ${coachDoubledActors.size} comédiens doublés.`);

      results.push({
        id: coach.id,
        name: coach.name,
        imdbId: coach.imdbId,
        scrapedAt: now,
        creditsCount: dedupedCredits.length,
        credits: dedupedCredits,
        doubledActors: Array.from(coachDoubledActors),
        status: 'OK',
      });
    } catch (err) {
      console.error(`  ✗ Erreur scraping ${coach.name}:`, err.message);
      results.push({
        id: coach.id,
        name: coach.name,
        imdbId: coach.imdbId,
        scrapedAt: now,
        creditsCount: 0,
        credits: [],
        doubledActors: [],
        status: 'ERREUR',
        error: err.message,
      });
    }
  }

  // Formatage final des acteurs doublés
  const aggregatedActors = Array.from(allDoubledActorsMap.values()).map(a => ({
    name: a.name,
    stuntDoubles: `Doublé par ${Array.from(a.coaches).join(', ')}`,
    coachesList: Array.from(a.coaches),
    productions: Array.from(a.productions),
  })).sort((a, b) => b.productions.length - a.productions.length);

  const payload = {
    scrapedAt: now,
    coachesCount: results.length,
    coachesWithImdb: results.filter(r => r.imdbId).length,
    totalCreditsScraped: results.reduce((acc, c) => acc + c.creditsCount, 0),
    totalDoubledActorsDetected: aggregatedActors.length,
    coaches: results,
    aggregatedDoubledActors: aggregatedActors,
  };

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`\nSauvegardé avec succès dans ${path.relative(ROOT, OUTPUT_JSON)}`);

  // Génération du rapport Markdown
  generateReport(payload);
  return payload;
}

function generateReport(data) {
  const lines = [];
  lines.push('# Rapport de Scraping IMDb — 20 Coachs du Campus Univers Cascades');
  lines.push('');
  lines.push(`> Scraping exécuté le **${new Date(data.scrapedAt).toLocaleString('fr-FR')}**`);
  lines.push('');
  lines.push('## 1. Synthèse Globale');
  lines.push('');
  lines.push(`- **Nombre total de coachs recensés :** ${data.coachesCount} (dont 19 avec profil IMDb et 1 sans profil IMDb : Niels Dalery)`);
  lines.push(`- **Nombre total de participations/crédits extraits :** ${data.totalCreditsScraped}`);
  lines.push(`- **Nombre d\'acteurs distincts doublés par le CUC :** ${data.totalDoubledActorsDetected}`);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 2. Acteurs Doublés par les Coachs du CUC');
  lines.push('');
  lines.push('| Acteur | Doublure(s) CUC | Productions Notables | Nb Productions |');
  lines.push('| :--- | :--- | :--- | :--- |');
  for (const act of data.aggregatedDoubledActors) {
    const prods = act.productions.slice(0, 4).join(', ') + (act.productions.length > 4 ? '…' : '');
    lines.push(`| **${act.name}** | ${act.stuntDoubles} | ${prods} | ${act.productions.length} |`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 3. Détail par Coach');
  lines.push('');

  for (const c of data.coaches) {
    lines.push(`### ${c.name} (\`${c.id}\`)`);
    lines.push(`- **IMDb ID :** ${c.imdbId ? `[\`${c.imdbId}\`](https://www.imdb.com/name/${c.imdbId}/)` : '_Aucun (Niels Dalery)_'}`);
    lines.push(`- **Date du scraping :** \`${c.scrapedAt}\``);
    lines.push(`- **Nombre de participations :** ${c.creditsCount}`);
    if (c.doubledActors?.length) {
      lines.push(`- **Comédien(s) doublé(s) :** ${c.doubledActors.join(', ')}`);
    }

    if (c.credits?.length) {
      const coordCount = c.credits.filter(x => x.category === 'Coordinateur').length;
      const doublureCount = c.credits.filter(x => x.category === 'Doublure').length;
      const stuntCount = c.credits.filter(x => x.category === 'Cascadeur').length;
      lines.push(`- **Répartition :** Coordinateur: ${coordCount} · Doublure: ${doublureCount} · Cascadeur: ${stuntCount}`);
      lines.push('');
      lines.push('<details><summary>Voir les 10 premiers crédits</summary>');
      lines.push('');
      for (const cr of c.credits.slice(0, 10)) {
        lines.push(`- ${cr.formattedCredit}`);
      }
      lines.push('');
      lines.push('</details>');
    }
    lines.push('');
  }

  fs.writeFileSync(REPORT_MD, lines.join('\n'), 'utf8');
  console.log(`Rapport généré dans ${path.relative(ROOT, REPORT_MD)}`);
}

scrapeAllCoaches().catch(err => {
  console.error('Erreur globale scraping:', err);
  process.exit(1);
});
