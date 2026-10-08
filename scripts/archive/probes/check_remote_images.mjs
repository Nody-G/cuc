import fs from 'fs';
import path from 'path';

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
const remoteUrls = new Set();

for (const file of allSrcFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  const matches = [...content.matchAll(/https?:\/\/[^'"\s`<>{}]+/g)];
  for (const m of matches) {
    let url = m[0];
    // filter image extensions
    if (/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(url)) {
      remoteUrls.add(url);
    }
  }
}

console.log(`Found ${remoteUrls.size} unique remote image URLs in src/`);
let failed = 0;
let ok = 0;

for (const url of remoteUrls) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    if (!res.ok) {
      console.log(`[FAIL ${res.status}] ${url}`);
      failed++;
    } else {
      ok++;
    }
  } catch (err) {
    console.log(`[ERR] ${url} => ${err.message}`);
    failed++;
  }
}

console.log(`\nRemote Image Check: ${ok} OK, ${failed} FAILED.`);
