import fs from 'fs';
import path from 'path';

const appDir = 'src/app';
const subdirs = fs.readdirSync(appDir, { withFileTypes: true });

for (const s of subdirs) {
  if (s.isDirectory()) {
    const layoutPath = path.join(appDir, s.name, 'layout.tsx');
    if (fs.existsSync(layoutPath)) {
      const content = fs.readFileSync(layoutPath, 'utf8');
      const titleMatch = content.match(/title:\s*['"]([^'"]+)['"]/);
      const descMatch = content.match(/description:\s*['"]([^'"]+)['"]/);
      console.log(s.name, '=> Title:', titleMatch ? titleMatch[1] : 'NONE', 'Desc:', descMatch ? 'YES' : 'NONE');
    }
  }
}
