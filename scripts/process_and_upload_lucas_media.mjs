import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const PROJECT_DIR = 'c:/Users/niels/Documents/Antigravity projects/CUC';
const LUCAS_DIR = path.join(PROJECT_DIR, 'CUC images lucas');
const BUCKET = 'cuc-vitrine-assets';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('Erreur: SUPABASE_SERVICE_ROLE_KEY manquante dans .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function sanitizeFilename(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s*\(supprimer[^)]*\)\s*/gi, '')
    .replace(/[()]/g, '-')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function scanImages(dir) {
  let list = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      list = list.concat(scanImages(full));
    } else {
      const ext = path.extname(item).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        list.push({
          full,
          rel: path.relative(LUCAS_DIR, full).replace(/\\/g, '/'),
          name: item,
          ext,
          size: st.size,
        });
      }
    }
  }
  return list;
}

const allImages = scanImages(LUCAS_DIR);
console.log(`Découvert ${allImages.length} images dans ${LUCAS_DIR}`);

function getTargetConfig(img) {
  const parts = img.rel.split('/');
  const topFolder = parts[0];
  const rawBase = path.parse(img.name).name;
  let cleanName = sanitizeFilename(rawBase);

  let categoryFolder = 'media/cuc-visual';
  let profile = 'web';
  let maxDim = 2560;
  let quality = 85;

  if (topFolder.startsWith('06 - EVENTS')) {
    categoryFolder = 'media/events';
  } else if (cleanName.includes('logo') || rawBase.toLowerCase().includes('logo')) {
    categoryFolder = 'media/partner-logo';
    profile = 'logo';
    maxDim = 512;
    quality = 90;
  }

  const isHero = rawBase.toLowerCase().includes('couv') ||
                 rawBase.toLowerCase().includes('bandeau') ||
                 cleanName.includes('couv') ||
                 cleanName.includes('bandeau');

  if (isHero && profile !== 'logo') {
    profile = 'hero';
    maxDim = 3200;
    quality = 90;
  }

  // Noms uniques et sémantiques par dossier
  let targetFilename = `${cleanName}.webp`;

  if (topFolder.startsWith('01 - ACCUEIL')) {
    if (cleanName.startsWith('couv')) {
      targetFilename = `home-${cleanName}.webp`;
    } else {
      targetFilename = `home-${cleanName}.webp`;
    }
  } else if (topFolder.startsWith('02 - LE CAMPUS')) {
    if (!cleanName.startsWith('campus-')) {
      targetFilename = `campus-${cleanName}.webp`;
    }
  } else if (topFolder.startsWith('03 - STAGES')) {
    if (img.rel.includes('FORMATION PROFESSIONNELLE')) {
      targetFilename = `formation-pro-${cleanName}.webp`;
    } else if (img.rel.includes('STAGES DE CASCADES')) {
      targetFilename = `stages-parkour-${cleanName}.webp`;
    } else if (img.rel.includes('WORKSHOP')) {
      targetFilename = `workshop-${cleanName}.webp`;
    }
  } else if (topFolder.startsWith('04 - TOURNAGE')) {
    if (img.rel.includes('NOS CASCADEUSES ET CASCADEURS')) {
      targetFilename = `cascadeur-${cleanName}.webp`;
    } else if (img.rel.includes('EQUIPEMENTS DE TOURNAGE')) {
      targetFilename = `equipement-${cleanName}.webp`;
    } else if (img.rel.includes('LE STUDIO ET SALLE')) {
      targetFilename = `studio-${cleanName}.webp`;
    } else if (cleanName.includes('logo')) {
      targetFilename = `cuc-team-badge.webp`;
    }
  } else if (topFolder.startsWith('05 - LEQUIPE')) {
    targetFilename = `equipe-pro-${cleanName}.webp`;
  } else if (topFolder.startsWith('06 - EVENTS')) {
    if (img.rel.includes('TEAM BUILDING')) {
      targetFilename = `team-building-${cleanName}.webp`;
    } else if (img.rel.includes('CUC EVENTS - AGENCY')) {
      targetFilename = `events-agency-${cleanName}.webp`;
    } else if (img.rel.includes('SPECTACLES CASCADES')) {
      targetFilename = `spectacles-${cleanName}.webp`;
    }
  }

  const objectPath = `${categoryFolder}/${targetFilename}`;
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${objectPath}`;

  return {
    categoryFolder,
    profile,
    maxDim,
    quality,
    targetFilename,
    objectPath,
    publicUrl,
  };
}

async function run() {
  console.log('--- Traitement & Upload des photos avec noms uniques sémantiques ---');
  let totalOrigBytes = 0;
  let totalCompBytes = 0;
  const results = [];
  const seenPaths = new Set();

  for (let i = 0; i < allImages.length; i++) {
    const img = allImages[i];
    const target = getTargetConfig(img);

    if (seenPaths.has(target.objectPath)) {
      console.warn(`ATTENTION: Collision évitée pour ${target.objectPath}, ajout suffixe...`);
      target.objectPath = target.objectPath.replace(/\.webp$/, `-${i}.webp`);
      target.publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${target.objectPath}`;
    }
    seenPaths.add(target.objectPath);

    totalOrigBytes += img.size;

    console.log(`[${i + 1}/${allImages.length}] ${img.rel} -> ${target.objectPath}`);

    const buffer = await sharp(img.full)
      .rotate()
      .resize({
        width: target.maxDim,
        height: target.maxDim,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: target.quality })
      .toBuffer();

    totalCompBytes += buffer.length;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(target.objectPath, buffer, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (error) {
      console.error(`   ERREUR upload: ${error.message}`);
      throw error;
    }

    results.push({
      originalPath: img.rel,
      originalBytes: img.size,
      compressedBytes: buffer.length,
      objectPath: target.objectPath,
      publicUrl: target.publicUrl,
      profile: target.profile,
    });
  }

  const mappingFile = path.join(PROJECT_DIR, 'scripts/lucas_media_mapping.json');
  fs.writeFileSync(mappingFile, JSON.stringify(results, null, 2), 'utf8');

  console.log('\n======================================================');
  console.log(`Traitement terminé avec succès pour les ${allImages.length} images distinctes.`);
  console.log(`Table de correspondance enregistrée dans : scripts/lucas_media_mapping.json`);
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
