import fs from 'fs';
import path from 'path';

const suspiciousPatterns = [
  /\s\/\/\s/, // e.g. DOSSIER // ...
  /^\/\/\s*[A-ZÀ-Ÿ]/, // e.g. // TITRE
  /100%\s*(?:des images|sécurisé|sécurité|certifié|garanti|professionnel)/i,
  /plongez au c[œo]ur/i,
  /rôle opérationnel/i,
  /dossier production/i,
  /certifi[eé]\s*(?:cuc|campus)/i,
  /gps actif/i,
  /expérience immersive/i,
  /à la pointe/i,
  /fleuron/i,
  /inégalé/i,
  /à couper le souffle/i,
  /rigueur et passion/i,
  /alliance subtile/i,
  /standards? (?:militaires?|tactiques?)/i,
  /machine de guerre/i,
  /choc tactique/i,
  /ultra-sécurisé/i,
  /classe mondiale/i,
  /surpuissant/i,
  /OD-\d+/i,
  /INFRA-\d+/i,
  /MOD-\d+/i,
  /5 paliers/i,
  /tactical/i,
  /mission cascades/i,
  /hub opérationnel/i,
  /cursus élite/i,
  /déconnexion de l'instinct/i,
  /action design & hollywood rigueur/i,
  /sécurité absolue & contrôle de l'/i,
  /xtrem jump airbag • \+20 000 chutes/i
];

function scanDir(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let findings = [];
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory() && f.name !== 'node_modules' && f.name !== '.next') {
      findings = findings.concat(scanDir(full));
    } else if (f.isFile() && (f.name.endsWith('.tsx') || f.name.endsWith('.ts'))) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        suspiciousPatterns.forEach(pat => {
          if (pat.test(line)) {
            findings.push({
              file: full,
              line: idx + 1,
              pattern: pat.toString(),
              text: line.trim()
            });
          }
        });
      });
    }
  }
  return findings;
}

const results = scanDir('./src');
console.log(`Found ${results.length} potential LLM-cliches / dubious badges/descriptions.\n`);

// Group by file
const byFile = {};
results.forEach(r => {
  byFile[r.file] = byFile[r.file] || [];
  byFile[r.file].push(r);
});

for (const [file, items] of Object.entries(byFile)) {
  console.log(`=== ${file} (${items.length} items) ===`);
  items.slice(0, 8).forEach(it => {
    console.log(`  L${it.line}: [${it.pattern}] ${it.text.slice(0, 120)}`);
  });
  if (items.length > 8) console.log(`  ... and ${items.length - 8} more`);
}
