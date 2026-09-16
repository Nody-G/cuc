const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== '.git') {
        getFiles(fullPath, files);
      }
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts') || entry.name.endsWith('.json')) {
      files.push(fullPath);
    }
  }
  return files;
}

const appDir = path.join(process.cwd(), 'src', 'app');
const routes = [];
function findRoutes(dir, baseRoute = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!entry.name.startsWith('(') && !entry.name.startsWith('_')) {
        findRoutes(path.join(dir, entry.name), baseRoute + '/' + entry.name);
      } else {
        findRoutes(path.join(dir, entry.name), baseRoute);
      }
    } else if (entry.name === 'page.tsx' || entry.name === 'page.ts') {
      routes.push(baseRoute === '' ? '/' : baseRoute);
    }
  }
}
findRoutes(appDir);
console.log(`--- ROUTES DETECTED (${routes.length}) ---`);
console.log(routes);

const allFiles = getFiles(path.join(process.cwd(), 'src'));
console.log(`\nScanning ${allFiles.length} files in src/...`);

// Search for any href="..." or href={'...'} or url: '...' or href: '...'
const foundUrls = [];
for (const file of allFiles) {
  const rel = path.relative(process.cwd(), file);
  const content = fs.readFileSync(file, 'utf-8');
  
  // 1. href in JSX
  const hrefMatches = content.matchAll(/href\s*=\s*(?:["']([^"']+)["']|\{[`"']([^`"']+)["'`]\})/g);
  for (const m of hrefMatches) {
    const url = m[1] || m[2];
    foundUrls.push({ file: rel, url, type: 'href' });
  }

  // 2. data properties: href: '...', url: '...', link: '...'
  const propMatches = content.matchAll(/(?:href|url|link|path)\s*:\s*['"`]([^'"`]+)['"`]/g);
  for (const m of propMatches) {
    const url = m[1];
    foundUrls.push({ file: rel, url, type: 'dataProp' });
  }

  // 3. Check for buttons or links with no action or empty onClick
  const emptyClickMatches = content.matchAll(/onClick\s*=\s*\{\s*\(\)\s*=>\s*\{\s*\}\s*\}/g);
  for (const m of emptyClickMatches) {
    console.log(`[EMPTY ONCLICK] in ${rel}`);
  }

  // 4. Check for `#` or `#something`
  const hashMatches = content.matchAll(/href\s*=\s*["'](#[^"']*)["']/g);
  for (const m of hashMatches) {
    console.log(`[HASH LINK] ${m[1]} in ${rel}`);
  }
}

const deadRoutes = [];
const externalUrls = [];
for (const item of foundUrls) {
  const u = item.url.trim();
  if (u.startsWith('http://') || u.startsWith('https://')) {
    externalUrls.push(item);
  } else if (u.startsWith('/') && !u.startsWith('/images') && !u.startsWith('/api') && !u.startsWith('/fonts') && !u.startsWith('/favicon')) {
    const clean = u.split('?')[0].split('#')[0];
    if (!routes.includes(clean)) {
      deadRoutes.push({ ...item, clean });
    }
  }
}

console.log(`\n--- DEAD INTERNAL ROUTES (${deadRoutes.length}) ---`);
deadRoutes.forEach(d => console.log(`  ${d.file}: ${d.url} (clean: ${d.clean}) [${d.type}]`));

console.log(`\n--- ALL UNIQUE INTERNAL PATHS REFERENCED ---`);
const internalSet = new Set(foundUrls.filter(i => i.url.startsWith('/')).map(i => i.url));
console.log(Array.from(internalSet).sort());
