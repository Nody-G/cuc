import fs from 'fs';
import path from 'path';

const VALID_ROUTES = new Set([
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
  '/visite-virtuelle',
]);

const issues = {
  deadInternalLinks: [],
  brokenLocalImages: [],
  emptyHandlers: [],
  externalLinkAnomalies: [],
  httpErrors: []
};

// 1. Recursive scan of all src files
function getAllFiles(dir, exts = ['.ts', '.tsx']) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, exts));
    } else if (exts.includes(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

const allSrcFiles = getAllFiles('src');

// 2. Scan hrefs and images
for (const file of allSrcFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  const relFile = path.relative(process.cwd(), file);

  // Check hrefs
  const hrefMatches = [...content.matchAll(/href=(?:\{['"`]|['"`])([^'"`}]+)(?:['"`]\}|['"`])/g)];
  for (const match of hrefMatches) {
    let href = match[1].trim();
    if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
      continue;
    }
    if (href.startsWith('http://') || href.startsWith('https://')) {
      if (href.includes('undefined') || href.includes('example.com')) {
        issues.externalLinkAnomalies.push({ file: relFile, href });
      }
      continue;
    }
    // Internal link
    let route = href.split('#')[0].split('?')[0];
    if (route === '') {
      // Just a hash e.g. #plan-3d-campus
      continue;
    }
    // Normalize trailing slash
    if (route.length > 1 && route.endsWith('/')) {
      route = route.slice(0, -1);
    }
    if (!VALID_ROUTES.has(route)) {
      issues.deadInternalLinks.push({ file: relFile, href, targetRoute: route });
    }
  }

  // Check local images in public/
  const imgMatches = [...content.matchAll(/(?:src|logo)=(?:\{['"`]|['"`])(\/[^'"`}]+)(?:['"`]\}|['"`])/g)];
  for (const match of imgMatches) {
    const imgPath = match[1].trim();
    if (imgPath.startsWith('/images/') || imgPath.startsWith('/icons/') || imgPath.startsWith('/logos/')) {
      const fullDiskPath = path.join(process.cwd(), 'public', imgPath.slice(1));
      if (!fs.existsSync(fullDiskPath)) {
        issues.brokenLocalImages.push({ file: relFile, imgPath });
      }
    }
  }
}

// 3. HTTP status of all 15 routes
console.log('--- Checking HTTP status of all routes on http://localhost:3000 ---');
for (const route of VALID_ROUTES) {
  try {
    const res = await fetch(`http://localhost:3000${route}`);
    if (res.status !== 200) {
      issues.httpErrors.push({ route, status: res.status });
      console.log(`[FAIL] ${route} => HTTP ${res.status}`);
    } else {
      console.log(`[OK]   ${route} => 200 OK`);
    }
  } catch (err) {
    issues.httpErrors.push({ route, error: err.message });
    console.log(`[ERR]  ${route} => ${err.message}`);
  }
}

console.log('\n================ AUDIT REPORT ================');
console.log('Dead Internal Links:', issues.deadInternalLinks.length);
if (issues.deadInternalLinks.length > 0) {
  console.log(JSON.stringify(issues.deadInternalLinks, null, 2));
}

console.log('Broken Local Images:', issues.brokenLocalImages.length);
if (issues.brokenLocalImages.length > 0) {
  console.log(JSON.stringify(issues.brokenLocalImages, null, 2));
}

console.log('External Link Anomalies:', issues.externalLinkAnomalies.length);
if (issues.externalLinkAnomalies.length > 0) {
  console.log(JSON.stringify(issues.externalLinkAnomalies, null, 2));
}

console.log('HTTP Route Errors:', issues.httpErrors.length);
if (issues.httpErrors.length > 0) {
  console.log(JSON.stringify(issues.httpErrors, null, 2));
}
console.log('==============================================');
