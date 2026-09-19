import fs from 'fs';
import path from 'path';

const patterns = [
  { name: 'Double slash badge', re: /[A-ZÀ-Ÿ\s]{3,}\s*\/\/\s*[A-ZÀ-Ÿ\s]{3,}/g },
  { name: '100% cliché', re: /100%\s*[\wéèêàùâôîëï]+/gi },
  { name: 'Plongez au coeur', re: /plong(?:ez|ée)\s+au\s+c[œo]ur/gi },
  { name: 'Dubious badge terms', re: /\b(GPS ACTIF|HUB OPÉRATIONNEL|MISSION CASCADES|RÔLE OPÉRATIONNEL|CURSUS ÉLITE|CERTIFIÉ CUC|CERTIFIÉ CAMPUS)\b/gi },
  { name: 'Robotic code prefixes', re: /\b(INFRA-\d+|OD-\d+|MOD-\d+)\b/g },
  { name: 'LLM buzzwords', re: /\b(à la pointe|fleuron|inégalé|à couper le souffle|alliance subtile|rigueur et passion|choc tactique|ultra-sécurisé|classe mondiale|surpuissant|déconnexion de l'instinct)\b/gi },
  { name: 'Dubious hero badge', re: /ACTION DESIGN & HOLLYWOOD RIGUEUR|SÉCURITÉ ABSOLUE & CONTRÔLE DE L'|XTREM JUMP AIRBAG • \+20 000 CHUTES/gi }
];

function scan(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== 'node_modules' && e.name !== '.next') {
      scan(full);
    } else if (e.isFile() && (e.name.endsWith('.tsx') || (e.name.endsWith('.ts') && !e.name.endsWith('.test.ts') && !e.name.endsWith('.d.ts')))) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, i) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('import ')) return;
        
        patterns.forEach(({ name, re }) => {
          const matches = line.match(re);
          if (matches) {
            console.log(`[${name}] ${full}:${i + 1}`);
            console.log(`  Match: ${matches.join(', ')}`);
            console.log(`  Line : ${trimmed.slice(0, 140)}\n`);
          }
        });
      });
    }
  }
}

scan('./src');
