const fs = require('fs');
const path = require('path');

function getFiles(dir, list = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.next', '.git'].includes(entry.name)) {
        getFiles(full, list);
      }
    } else if (/\.(tsx|ts|jsx|js|css)$/.test(entry.name)) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n').length;
      const bytes = fs.statSync(full).size;
      list.push({ path: path.relative(process.cwd(), full).replace(/\\/g, '/'), lines, bytes });
    }
  }
  return list;
}

const files = getFiles(path.join(process.cwd(), 'src'));
files.sort((a, b) => b.lines - a.lines);

console.log('=== TOP 30 LARGEST FILES IN SRC (LINES & BYTES) ===');
files.slice(0, 30).forEach(f => {
  console.log(`${String(f.lines).padStart(5)} lines | ${String((f.bytes / 1024).toFixed(1)).padStart(6)} KB | ${f.path}`);
});

console.log('\n=== FILE COUNT AND CATEGORIES ===');
const breakdown = {};
files.forEach(f => {
  const ext = path.extname(f.path);
  breakdown[ext] = (breakdown[ext] || 0) + 1;
});
console.log(JSON.stringify(breakdown, null, 2));
