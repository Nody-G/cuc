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
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

const allFiles = getFiles(path.join(process.cwd(), 'src'));
const urls = new Set();
const urlLocations = new Map();

for (const file of allFiles) {
  const rel = path.relative(process.cwd(), file);
  const content = fs.readFileSync(file, 'utf-8');
  const matches = content.matchAll(/https?:\/\/[^\s"'`<>)]+/g);
  for (const m of matches) {
    let u = m[0].replace(/[;,.]*$/, '');
    urls.add(u);
    if (!urlLocations.has(u)) urlLocations.set(u, []);
    urlLocations.get(u).push(rel);
  }
}

console.log(`Found ${urls.size} unique external URLs. Testing HTTP status...`);

async function testAll() {
  const results = [];
  for (const u of urls) {
    // Skip youtube search or complex queries if needed, or test with HEAD/GET
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(u, { method: 'HEAD', signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0' } }).catch(() => {
        // Fallback to GET
        return fetch(u, { method: 'GET', signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0' } });
      });
      clearTimeout(timeout);
      const status = res ? res.status : 0;
      if (status >= 400 || status === 0) {
        results.push({ url: u, status, files: urlLocations.get(u) });
      }
    } catch (e) {
      results.push({ url: u, status: 'ERROR: ' + e.message, files: urlLocations.get(u) });
    }
  }

  console.log('\n=== DEAD OR PROBLEMATIC EXTERNAL URLS ===');
  console.log(JSON.stringify(results, null, 2));
}

testAll();
