/**
 * ==============================================================================
 * ⚠️  SCRIPT HISTORIQUE — NE PAS RELANCER TEL QUEL
 * ==============================================================================
 * Ce script télécharge les logos partenaires depuis l'ANCIEN site WordPress
 * (`campus-universcascades.com/wp-content/...`). Les médias ont depuis été
 * rapatriés dans Supabase Storage et les URLs réécrites en base
 * (`scripts/media_url_mapping.json`).
 *
 * Vérification : `node scripts/verify_no_legacy_urls_in_db.mjs` → 0 URL legacy.
 * Conservé pour traçabilité (doctrine : marquer plutôt que supprimer).
 * ==============================================================================
 */
import fs from 'fs';
import path from 'path';

const PARTNER_LOGOS = [
  { id: 'nike', url: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/logo-nike.jpg', ext: 'jpg' },
  { id: 'taffcoeur', url: 'https://www.campus-universcascades.com/wp-content/uploads/2020/07/TaffCoeur-Q-page-001.jpg', ext: 'jpg' },
  { id: 'bsn', url: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/logo-bsn.jpg', ext: 'jpg' },
  { id: 'c17', url: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/logo-c17.jpg', ext: 'jpg' },
  { id: 'kiloutou', url: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/logo-kiloutou.jpg', ext: 'jpg' },
  { id: 'rxr-protect', url: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/logo-rxr-protect.jpg', ext: 'jpg' },
  { id: 'otm-incendie', url: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/logo-otm-incendie.jpg', ext: 'jpg' },
  { id: 'action-cascade', url: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/logo-action-cascade.jpg', ext: 'jpg' },
  { id: 'aya-catch', url: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/logo-aya-catch.jpg', ext: 'jpg' },
  { id: 'gravity', url: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/logo-gravity.jpg', ext: 'jpg' },
  { id: 'cascade-demo-team', url: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/logo-cascade-demo-team.jpg', ext: 'jpg' },
  { id: 'xtrem-video', url: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/logo-xtrem-video.jpg', ext: 'jpg' },
  { id: 'mfr-le-cateau', url: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/logo-mfr-le-cateau.jpg', ext: 'jpg' },
  { id: 'bandes-logos-1', url: 'https://www.campus-universcascades.com/wp-content/uploads/2021/05/Bandes-logos-1.png', ext: 'png' },
  { id: 'bandes-logos-2', url: 'https://www.campus-universcascades.com/wp-content/uploads/2021/05/Bandes-logos-2.png', ext: 'png' },
  { id: 'bandes-logos-3', url: 'https://www.campus-universcascades.com/wp-content/uploads/2021/05/Bandes-logos-3.png', ext: 'png' },
];

async function download() {
  const outDir = path.resolve('public/images/partenaires');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  for (const item of PARTNER_LOGOS) {
    const dest = path.join(outDir, `${item.id}.${item.ext}`);
    try {
      console.log(`Downloading ${item.id} from ${item.url}...`);
      const res = await fetch(item.url);
      if (!res.ok) {
        console.error(`Failed ${item.id}: HTTP ${res.status}`);
        continue;
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buffer);
      console.log(`Saved ${dest} (${buffer.length} bytes)`);
    } catch (err) {
      console.error(`Error downloading ${item.id}:`, err.message);
    }
  }
}

download();
