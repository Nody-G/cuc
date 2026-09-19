import fs from 'fs';
import path from 'path';

function scanFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let list = [];
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory() && f.name !== 'node_modules' && f.name !== '.next') {
      list = list.concat(scanFiles(full));
    } else if (f.isFile() && (f.name.endsWith('.tsx') || f.name.endsWith('.ts'))) {
      list.push(full);
    }
  }
  return list;
}

const allFiles = scanFiles('./src');

// 1. Extract StuntBadge text
const stuntBadges = [];
allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.matchAll(/<StuntBadge[^>]*>([\s\S]*?)<\/StuntBadge>/g);
  for (const m of matches) {
    const text = m[1].replace(/<[^>]+>/g, '').trim();
    if (text) {
      stuntBadges.push({ file, text });
    }
  }
});

console.log('=== ALL StuntBadge USAGES ===');
stuntBadges.forEach(b => console.log(`${b.file} -> "${b.text}"`));

// 2. Extract badges with "badge" prop
const badgeProps = [];
allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.matchAll(/badge:\s*['"`]([^'"`]+)['"`]/g);
  for (const m of matches) {
    badgeProps.push({ file, text: m[1] });
  }
});
console.log('\n=== ALL badge: "..." PROPERTIES ===');
badgeProps.forEach(b => console.log(`${b.file} -> "${b.text}"`));

// 3. Check stuntRoles in filmography.ts
const filmography = fs.readFileSync('src/data/filmography.ts', 'utf8');
const stuntRolesMatches = [...filmography.matchAll(/"stuntRoles":\s*"([^"]+)"/g)];
console.log(`\n=== stuntRoles in filmography.ts (${stuntRolesMatches.length} films) ===`);
const uniqueRoles = {};
stuntRolesMatches.forEach(m => {
  uniqueRoles[m[1]] = (uniqueRoles[m[1]] || 0) + 1;
});
for (const [role, count] of Object.entries(uniqueRoles)) {
  console.log(`[x${count}] "${role}"`);
}
