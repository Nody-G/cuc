import fs from 'fs';
import path from 'path';

const routes = [
  '/',
  '/animations-airbag-parkour',
  '/contact-cuc',
  '/cuc-events-agence',
  '/cuc-team-cascadeur',
  '/equipe-cascadeurs-pro',
  '/formation-de-cascadeur',
  '/partenaires',
  '/spectacles-cascadeurs-yamakasi',
  '/stages-cascades-parkour-2',
  '/stunt-workshop-cuc',
  '/team-building-cascades',
  '/videos-cascadeur',
  '/visite-guidee',
  '/visite-virtuelle'
];

function scanDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      scanDir(full, fileList);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.jsx') || f.endsWith('.js')) {
      fileList.push(full);
    }
  }
  return fileList;
}

const files = scanDir('src');
const allHrefs = [];
const hrefRegex = /href=["']([^"']+)["']/g;
const linkRegex = /<Link[^>]+href=["']([^"']+)["']/g;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = hrefRegex.exec(content)) !== null) {
    allHrefs.push({ file: path.relative('.', file), href: match[1] });
  }
}

console.log('Total hrefs found:', allHrefs.length);

const internalHrefs = allHrefs.filter(h => h.href.startsWith('/') || h.href.startsWith('#'));
console.log('Internal hrefs:', internalHrefs.length);

const invalid = [];
for (const item of internalHrefs) {
  let url = item.href;
  const hashIdx = url.indexOf('#');
  let route = hashIdx >= 0 ? url.slice(0, hashIdx) : url;
  if (!route && hashIdx >= 0) {
    continue;
  }
  if (route.length > 1 && route.endsWith('/')) route = route.slice(0, -1);
  if (!routes.includes(route)) {
    invalid.push(item);
  }
}

console.log('Invalid internal routes:', JSON.stringify(invalid, null, 2));
