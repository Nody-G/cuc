import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { ALL_OFFICIAL_FILM_POSTERS } from '../src/data/all_official_films.ts';
import { FILMOGRAPHY_CREDITS } from '../src/data/filmography.ts';
import { DOUBLED_CELEBRITIES } from '../src/data/celebrities.ts';
import { PROGRAMMES_TV } from '../src/data/videos.ts';
import { OFFICIAL_FILM_BANNERS } from '../src/data/filmBanners.ts';
import { CAMPUS_FACILITIES } from '../src/data/campus.ts';
import { STUNT_PROGRAMS } from '../src/data/programs.ts';

const env = fs.readFileSync('.env.local', 'utf-8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=([^\r\n]+)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=([^\r\n]+)/)[1].trim();
const client = createClient(url, key);

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// Métadonnées connues pour les films historiques du CUC
const KNOWN_FILM_METADATA = {
  'gtmax': { year: '2024', category: 'Streaming Global', director: 'Olivier Schneider', tag: 'NETFLIX' },
  'le-salaire-de-la-peur': { year: '2024', category: 'Streaming Global', director: 'Julien Leclercq', tag: 'NETFLIX ACTION' },
  'fiasco': { year: '2024', category: 'Série / Plateforme', director: 'Igor Gotesman', tag: 'NETFLIX SÉRIE' },
  'furies': { year: '2024', category: 'Série / Plateforme', director: 'Cédric Nicolas-Troyan', tag: 'SÉRIE ACTION' },
  'machine': { year: '2024', category: 'Série / Plateforme', director: 'Fred Grivois', tag: 'ARTE ACTION' },
  'alibi-com-2': { year: '2023', category: 'Cinéma Français', director: 'Philippe Lacheau', tag: 'COMÉDIE / CASCADES' },
  'murder-mystery-2': { year: '2023', category: 'Blockbuster', director: 'Jeremy Garelick', tag: 'NETFLIX WORLDWIDE' },
  'wednesday-mercredi': { year: '2022', category: 'Série / Plateforme', director: 'Tim Burton', tag: 'NETFLIX' },
  'goliath': { year: '2022', category: 'Cinéma Français', director: 'Frédéric Tellier', tag: 'THRILLER' },
  'uncharted': { year: '2022', category: 'Blockbuster', director: 'Ruben Fleischer', tag: 'SONY PICTURES' },
  'the-355': { year: '2022', category: 'Blockbuster', director: 'Simon Kinberg', tag: 'ACTION INTERNATIONALE' },
  'stillwater': { year: '2021', category: 'Cinéma International', director: 'Tom McCarthy', tag: 'FESTIVAL DE CANNES' },
  'dune': { year: '2021', category: 'Blockbuster', director: 'Denis Villeneuve', tag: 'WARNER BROS' },
  'bac-nord': { year: '2021', category: 'Cinéma Français', director: 'Cédric Jimenez', tag: 'POLAR CHOC' },
  'braqueurs': { year: '2021', category: 'Série / Plateforme', director: 'Julien Leclercq', tag: 'NETFLIX' },
  'family-business': { year: '2021', category: 'Série / Plateforme', director: 'Igor Gotesman', tag: 'NETFLIX' },
  'sentinelle': { year: '2021', category: 'Streaming Global', director: 'Julien Leclercq', tag: 'NETFLIX' },
  '30-jours-max': { year: '2020', category: 'Cinéma Français', director: 'Tarek Boudali', tag: 'COMÉDIE D\'ACTION' },
  'lupin': { year: '2021', category: 'Série / Plateforme', director: 'Louis Leterrier', tag: 'SUCCÈS MONDIAL NETFLIX' },
  'balle-perdue': { year: '2020', category: 'Streaming Global', director: 'Guillaume Pierret', tag: 'CASCADES AUTO CUC' },
  'mortel': { year: '2019', category: 'Série / Plateforme', director: 'Simon Astier', tag: 'NETFLIX' },
  '6-underground': { year: '2019', category: 'Blockbuster', director: 'Michael Bay', tag: 'NETFLIX EXTRÊME' },
  'black-widow': { year: '2021', category: 'Blockbuster', director: 'Cate Shortland', tag: 'MARVEL STUDIOS' },
  'bronx': { year: '2020', category: 'Streaming Global', director: 'Olivier Marchal', tag: 'POLICIER D\'ACTION' },
  'les-miserables': { year: '2019', category: 'Cinéma Français', director: 'Ladj Ly', tag: 'PRIX DU JURY CANNES' },
  'mission-impossible-fallout': { year: '2018', category: 'Blockbuster', director: 'Christopher McQuarrie', tag: 'TOM CRUISE ACTION' },
  'nicky-larson': { year: '2019', category: 'Cinéma Français', director: 'Philippe Lacheau', tag: 'ACTION MANGA' },
  'police': { year: '2020', category: 'Cinéma Français', director: 'Anne Fontaine', tag: 'POLICIER' },
  'valerian': { year: '2017', category: 'Blockbuster', director: 'Luc Besson', tag: 'EUROPACORP' },
  'alibi-com': { year: '2017', category: 'Cinéma Français', director: 'Philippe Lacheau', tag: 'BOX-OFFICE' },
  'dunkerque-dunkirk': { year: '2017', category: 'Blockbuster', director: 'Christopher Nolan', tag: 'WARNER BROS' },
  '007-spectre': { year: '2015', category: 'Blockbuster', director: 'Sam Mendes', tag: 'EON PRODUCTIONS' },
  'raid-dingue': { year: '2017', category: 'Cinéma Français', director: 'Dany Boon', tag: 'BOX-OFFICE' },
  'lucy': { year: '2014', category: 'Blockbuster', director: 'Luc Besson', tag: 'BOX-OFFICE MONDIAL' },
  'fast-furious-6': { year: '2013', category: 'Blockbuster', director: 'Justin Lin', tag: 'UNIVERSAL' },
  'overdrive': { year: '2017', category: 'Cinéma International', director: 'Antonio Negret', tag: 'CASCADES AUTO' },
  'de-l-autre-cote-du-periph': { year: '2012', category: 'Cinéma Français', director: 'David Charhon', tag: 'ACTION COMÉDIE' },
  'taken-3': { year: '2015', category: 'Blockbuster', director: 'Olivier Megaton', tag: 'EUROPACORP' },
  'jason-bourne': { year: '2016', category: 'Blockbuster', director: 'Paul Greengrass', tag: 'UNIVERSAL' },
  'le-transporteur-heritage': { year: '2015', category: 'Blockbuster', director: 'Camille Delamarre', tag: 'EUROPACORP' },
  'from-paris-with-love': { year: '2010', category: 'Blockbuster', director: 'Pierre Morel', tag: 'EUROPACORP' },
  '3-days-to-kill': { year: '2014', category: 'Blockbuster', director: 'McG', tag: 'EUROPACORP' },
  'the-hunger-games': { year: '2014', category: 'Blockbuster', director: 'Francis Lawrence', tag: 'LIONSGATE' },
  'taxi-4': { year: '2007', category: 'Cinéma Français', director: 'Gérard Krawczyk', tag: 'EUROPACORP' },
  'babylon-a-d': { year: '2008', category: 'Blockbuster', director: 'Mathieu Kassovitz', tag: 'ACTION SCI-FI' },
  'taken-2': { year: '2012', category: 'Blockbuster', director: 'Olivier Megaton', tag: 'EUROPACORP' },
  'bastille-day': { year: '2016', category: 'Cinéma International', director: 'James Watkins', tag: 'ACTION THRILLER' },
  'l-affaire-sk1': { year: '2014', category: 'Cinéma Français', director: 'Frédéric Tellier', tag: 'POLICIER' },
  'banlieue-13-ultimatum': { year: '2009', category: 'Film Culte', director: 'Patrick Alessandrin', tag: 'PARKOUR & CASCADES' },
  'largo-winch': { year: '2008', category: 'Cinéma Français', director: 'Jérôme Salle', tag: 'TOMER SISLEY' },
  'mesrine-l-ennemi-public-n-1': { year: '2008', category: 'Cinéma Français', director: 'Jean-François Richet', tag: 'CÉSAR MEILLEUR FILM' },
  'malavita': { year: '2013', category: 'Cinéma International', director: 'Luc Besson', tag: 'ROBERT DE NIRO' },
  'un-prophete': { year: '2009', category: 'Cinéma Français', director: 'Jacques Audiard', tag: 'GRAND PRIX CANNES' },
  'danny-the-dog': { year: '2005', category: 'Film Culte', director: 'Louis Leterrier', tag: 'JET LI & ACTION' },
  'yamakasi': { year: '2001', category: 'Film Culte', director: 'Ariel Zeitoun & Julien Seri', tag: 'ORIGINES DU PARKOUR' },
};

async function migrateAll() {
  console.log('=== MIGRATION INTÉGRALE DE TOUTES LES DONNÉES VITRINE DANS SUPABASE ===\n');

  // 1. MIGRATION DES 63 FILMS
  console.log('1. Consolidation et synchronisation des 63 Films dans site_films...');
  const detailedMap = new Map();
  for (const f of FILMOGRAPHY_CREDITS) {
    detailedMap.set(f.id, f);
    detailedMap.set(slugify(f.title), f);
  }

  const allConsolidatedFilms = [];
  const processedSlugs = new Set();

  for (const poster of ALL_OFFICIAL_FILM_POSTERS) {
    const slug = slugify(poster.title);
    if (processedSlugs.has(slug)) continue;
    processedSlugs.add(slug);

    const detailed = detailedMap.get(slug) || detailedMap.get(poster.title);
    const known = KNOWN_FILM_METADATA[slug] || {};

    const filmRecord = {
      id: detailed ? detailed.id : slug,
      title: detailed ? detailed.title : poster.title,
      year: detailed?.year || known.year || '2024',
      category: detailed?.category || known.category || 'Cinéma',
      director: detailed?.director || known.director || 'Production Cinéma',
      stunt_roles: detailed?.stuntRoles || 'Cascades physiques, doublures et chorégraphies conçues et exécutées par le Campus Univers Cascades',
      doubled_actors: detailed?.doubledActors || [],
      cuc_team_involved: detailed?.cuc_team_involved || [],
      highlight: detailed ? detailed.highlight : false,
      image: poster.img || detailed?.image || '',
      tag: detailed?.tag || known.tag || 'CUC TOURNAGE',
      imdb_url: detailed?.imdbUrl || '',
      allocine_url: detailed?.allocineUrl || '',
      trailer_url: detailed?.trailerUrl || '',
      is_published: true,
      updated_at: new Date().toISOString(),
    };

    allConsolidatedFilms.push(filmRecord);
  }

  // Ajouter les films de FILMOGRAPHY_CREDITS qui n'étaient pas explicitement dans posters
  for (const f of FILMOGRAPHY_CREDITS) {
    if (!processedSlugs.has(f.id) && !processedSlugs.has(slugify(f.title))) {
      processedSlugs.add(f.id);
      allConsolidatedFilms.push({
        id: f.id,
        title: f.title,
        year: f.year,
        category: f.category,
        director: f.director,
        stunt_roles: f.stuntRoles,
        doubled_actors: f.doubledActors || [],
        cuc_team_involved: f.cuc_team_involved || [],
        highlight: f.highlight,
        image: f.image,
        tag: f.tag,
        imdb_url: f.imdbUrl || '',
        allocine_url: f.allocineUrl || '',
        trailer_url: f.trailerUrl || '',
        is_published: true,
        updated_at: new Date().toISOString(),
      });
    }
  }

  console.log(`   -> Total de films consolidés : ${allConsolidatedFilms.length}`);

  // Upsert dans la table site_films
  let insertedFilms = 0;
  for (const film of allConsolidatedFilms) {
    const { error } = await client.from('site_films').upsert(film, { onConflict: 'id' });
    if (error) {
      console.warn(`   ! Erreur sur film "${film.title}":`, error.message);
    } else {
      insertedFilms++;
    }
  }
  console.log(`   ✓ ${insertedFilms}/${allConsolidatedFilms.length} films enregistrés dans site_films.`);

  // Miroir dans site_settings (key='films')
  await client.from('site_settings').upsert({
    key: 'films',
    value: { list: allConsolidatedFilms },
    updated_at: new Date().toISOString(),
  });
  console.log('   ✓ site_settings (key=films) synchronisé.\n');

  // 2. MIGRATION DES 11 CÉLÉBRITÉS DOUBLÉES
  console.log('2. Synchronisation des Célébrités Doublées (key=celebrities)...');
  await client.from('site_settings').upsert({
    key: 'celebrities',
    value: { list: DOUBLED_CELEBRITIES },
    updated_at: new Date().toISOString(),
  });
  console.log(`   ✓ ${DOUBLED_CELEBRITIES.length} célébrités doublées enregistrées dans site_settings.\n`);

  // 3. MIGRATION DES 6 VIDÉOS ET REPORTAGES TV
  console.log('3. Synchronisation des Vidéos & Émissions TV (key=videos)...');
  await client.from('site_settings').upsert({
    key: 'videos',
    value: { list: PROGRAMMES_TV },
    updated_at: new Date().toISOString(),
  });
  console.log(`   ✓ ${PROGRAMMES_TV.length} vidéos enregistrées dans site_settings.\n`);

  // 4. MIGRATION DES 12 BANNIÈRES DE FILMS
  console.log('4. Synchronisation des Bannières de Films (key=film_banners)...');
  await client.from('site_settings').upsert({
    key: 'film_banners',
    value: { list: OFFICIAL_FILM_BANNERS },
    updated_at: new Date().toISOString(),
  });
  console.log(`   ✓ ${OFFICIAL_FILM_BANNERS.length} bannières enregistrées dans site_settings.\n`);

  // 5. MIGRATION DES 7 INFRASTRUCTURES DU CAMPUS
  console.log('5. Synchronisation des Infrastructures du Campus (key=campus_facilities)...');
  await client.from('site_settings').upsert({
    key: 'campus_facilities',
    value: { list: CAMPUS_FACILITIES },
    updated_at: new Date().toISOString(),
  });
  console.log(`   ✓ ${CAMPUS_FACILITIES.length} infrastructures enregistrées dans site_settings.\n`);

  // 6. MIGRATION DES 6 PROGRAMMES DU CAMPUS
  console.log('6. Synchronisation des Programmes de Formation (site_programs & key=programs)...');
  for (const prog of STUNT_PROGRAMS) {
    await client.from('site_programs').upsert({
      id: prog.id,
      title: prog.title,
      category: prog.category,
      badge: prog.badge,
      tagline: prog.tagline,
      duration: prog.duration,
      hours: prog.hours,
      price: prog.price,
      description: prog.description,
      objectives: prog.objectives,
      key_modules: prog.keyModules,
      is_published: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
  }
  await client.from('site_settings').upsert({
    key: 'programs',
    value: { list: STUNT_PROGRAMS },
    updated_at: new Date().toISOString(),
  });
  console.log(`   ✓ ${STUNT_PROGRAMS.length} programmes synchronisés.\n`);

  console.log('=== MIGRATION GLOBALE SUPABASE RÉUSSIE AVEC SUCCÈS ! ===');
}

migrateAll().catch(console.error);
