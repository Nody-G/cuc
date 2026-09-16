import fs from 'fs';
import path from 'path';

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

// 1. Check for empty or '#' hrefs
const suspiciousHrefs = [];
const hashAnchors = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const rel = path.relative('.', file);

  const hrefMatches = content.matchAll(/href=["']([^"']*)["']/g);
  for (const m of hrefMatches) {
    const href = m[1];
    if (href === '#' || href === '' || href.startsWith('javascript:')) {
      suspiciousHrefs.push({ file: rel, href });
    }
    if (href.includes('#')) {
      hashAnchors.push({ file: rel, href });
    }
  }
}

console.log('Suspicious hrefs (#, empty, javascript:):', suspiciousHrefs);
console.log('Hash anchors found:', hashAnchors);

// 2. Check each hash anchor to see if target page has matching id
const targetIdsChecked = [];
for (const item of hashAnchors) {
  const [route, hash] = item.href.split('#');
  // Determine which page component corresponds to route
  let pagePath = '';
  if (route === '' || route === '/') {
    pagePath = 'src/app/page.tsx';
  } else {
    pagePath = `src/app${route}/page.tsx`;
  }

  // Also check if id is in layout (e.g. Footer has id="contact")
  let found = false;
  const idRegex = new RegExp(`id=["']${hash}["']`);

  // Check layout/footer/navbar
  const commonFiles = [
    'src/components/layout/Footer.tsx',
    'src/components/layout/Navbar.tsx',
    pagePath
  ];

  for (const cf of commonFiles) {
    if (fs.existsSync(cf)) {
      const c = fs.readFileSync(cf, 'utf8');
      if (idRegex.test(c)) {
        found = true;
        break;
      }
    }
  }

  // If not found in page directly, search all tsx files in src/components used by that page
  if (!found) {
    for (const f of files) {
      const c = fs.readFileSync(f, 'utf8');
      if (idRegex.test(c)) {
        found = true;
        break;
      }
    }
  }

  targetIdsChecked.push({
    fromFile: item.file,
    href: item.href,
    hash,
    found
  });
}

const missingIds = targetIdsChecked.filter(t => !t.found);
console.log('Missing target IDs:', missingIds);
