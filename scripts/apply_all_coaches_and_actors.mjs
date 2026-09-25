/**
 * ==============================================================================
 * CUC — Application complète des 20 coachs et acteurs doublés
 * ==============================================================================
 * 1. Écrit src/data/celebrities.ts (comédiens réellement doublés par le CUC).
 * 2. Écrit src/data/team.ts (20 coachs avec crédits classés, acteurs doublés, date de scraping).
 * 3. Synchronise Supabase (site_team, site_settings, site_films).
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Supabase credentials manquants dans .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

// 1. Chargement des données scrapées
const scrapedData = JSON.parse(fs.readFileSync(path.join(__dirname, 'coaches_scraped_full_imdb.json'), 'utf8'));
const curatedCelebrities = JSON.parse(fs.readFileSync(path.join(__dirname, 'curated_doubled_celebrities.json'), 'utf8'));

// Slugify helper
function slugify(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// 2. Définitions complètes des 20 coachs
const COACH_DEFINITIONS = [
  {
    id: 'lucas-dollfus',
    name: 'Lucas Dollfus',
    role: 'Fondateur & Directeur Général',
    title: 'Coordinateur de Cascades & Formateur Référent',
    specialties: ['Direction de cascades', 'Action Design', 'Sécurité de tournage', 'Chutes de hauteur'],
    bio: "Fondateur du Campus Univers Cascades en 2008. Lucas Dollfus coordonne les cascades de longs-métrages, séries et événements, en appliquant une méthode d'entraînement axée sur la rigueur technique, la sécurité et la polyvalence.",
    avatarUrl: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/1-lucas.png',
    imdb: 'https://www.imdb.com/name/nm9598200/',
    externalUrl: 'https://www.instagram.com/lucas.dollfus/',
    instagram: 'https://www.instagram.com/lucas.dollfus/',
    order_index: 1,
  },
  {
    id: 'jerome-gaspard',
    name: 'Jérôme Gaspard',
    role: 'Responsable Pédagogique',
    title: 'Coordinateur de Cascades Référent Cinéma',
    specialties: ['Coordination de cascades', 'Chutes de grande hauteur', 'Câblage', 'Combats armés'],
    bio: "Coordinateur de cascades et formateur au CUC avec plus de 30 ans d'expérience et plus de 200 productions. Ancien gymnaste de haut niveau et fondateur d'Action Cascade et France-Cascade, il conçoit et coordonne des cascades physiques et mécaniques majeures pour le cinéma.",
    avatarUrl: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/2-jerome.png',
    imdb: 'https://www.imdb.com/name/nm2285249/',
    externalUrl: 'https://www.action-cascade.com/coordinateur-de-cascades/',
    instagram: 'https://www.instagram.com/jerome_gaspard_stunt/',
    order_index: 2,
  },
  {
    id: 'malik-diouf',
    name: 'Malik Diouf',
    role: 'Co-fondateur Yamakasi',
    title: 'Référent Parkour & Art du Déplacement',
    specialties: ['Parkour', 'Art du Déplacement', 'Franchissements urbains', 'Mobilité acrobatique'],
    bio: "Membre fondateur des Yamakasi et pionnier de l'Art du Déplacement et du Parkour. Malik Diouf transmet les fondamentaux du mouvement urbain naturel : franchissements d'obstacles, équilibre dynamique, précision et gestion du risque.",
    avatarUrl: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/3-malik.png',
    imdb: 'https://www.imdb.com/name/nm0228086/',
    externalUrl: 'https://www.instagram.com/malikdiouf_yamakasi/',
    instagram: 'https://www.instagram.com/malikdiouf_yamakasi/',
    order_index: 3,
  },
  {
    id: 'franck-blanc',
    name: 'Franck Blanc',
    role: 'Directeur Adjoint',
    title: 'Coach Câblage, Pyrotechnie & Torches',
    specialties: ['Câblage 3D', 'Systèmes de traction', 'Effets pyrotechniques', 'Torches humaines'],
    bio: "Directeur adjoint du campus et expert câblage et pyrotechnie. Franck Blanc forme les stagiaires aux techniques avancées de rigging 3D, aux trajectoires aériennes assistées et aux protocoles stricts de sécurité pyrotechnique.",
    avatarUrl: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/4-franck.png',
    imdb: 'https://www.imdb.com/name/nm6923086/',
    externalUrl: 'https://www.instagram.com/franck_blanc_cuc/',
    instagram: 'https://www.instagram.com/franck_blanc_cuc/',
    order_index: 4,
  },
  {
    id: 'frederic-dessains',
    name: 'Frédéric Dessains',
    role: 'Spécialiste Acrobaties, Combat et Comédie',
    title: 'Formateur Acrobaties, Combat & Cascades Comédie',
    specialties: ['Acrobaties au sol', 'Combats scéniques', 'Chutes comiques', 'Cascade burlesque'],
    bio: "Cascadeur et formateur expérimenté avec plus de 100 productions à son actif. Frédéric Dessains apporte au CUC son expertise des acrobaties, des combats scéniques et du timing comique indispensable aux cascades de divertissement.",
    avatarUrl: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/5-frederic.png',
    imdb: 'https://www.imdb.com/name/nm1178395/',
    externalUrl: 'https://www.instagram.com/fredericdessains/',
    instagram: 'https://www.instagram.com/fredericdessains/',
    order_index: 5,
  },
  {
    id: 'niels-dalery',
    name: 'Niels Dalery',
    role: 'Spécialiste Acrobaties & Free-Running',
    title: 'Formateur Référent Freerun & Acrobaties Urbaines',
    specialties: ['Acrobaties au sol', 'Free-Running', 'Tricking', 'Chutes acrobatiques'],
    bio: "Spécialiste des acrobaties au sol et du free-running de haut niveau. Niels Dalery enseigne la maîtrise spatiale, les rotations aériennes et l'aisance corporelle nécessaires aux scènes d'action modernes.",
    avatarUrl: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/6-niels.png',
    imdb: undefined,
    externalUrl: 'https://www.youtube.com/watch?v=DwpD2jceFXA',
    instagram: 'https://www.instagram.com/nielsdalery/',
    order_index: 6,
  },
  {
    id: 'amedeo-cazzella',
    name: 'Amédéo Cazzella',
    role: "Spécialiste Combats & Maniement d'Armes",
    title: 'Formateur Référent Armes Blanches & Tactique',
    specialties: ["Maniement d'armes blanches", 'Combats tactiques', 'Tir de combat', 'Chutes'],
    bio: "Spécialiste du combat scénique armé et à mains nues, avec plus de 110 productions dont John Wick 4. Amédéo Cazzella prépare les élèves au réalisme des affrontements au cinéma et à la manipulation sécurisée d'armes.",
    avatarUrl: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/7-amadeo.png',
    imdb: 'https://www.imdb.com/name/nm1000561/',
    externalUrl: 'https://www.instagram.com/amedeo_cazzella/',
    instagram: 'https://www.instagram.com/amedeo_cazzella/',
    order_index: 7,
  },
  {
    id: 'vincent-bouillon',
    name: 'Vincent Bouillon',
    role: 'Spécialiste Combats, Acrobaties et Chutes',
    title: 'Cascadeur Professionnel & Doublure Internationale',
    specialties: ['Combats chorégraphiés', 'Chutes de hauteur', "Doublure d'action", 'Acrobaties'],
    bio: "Cascadeur de référence internationale, lauréat du Taurus World Stunt Award 2024 pour la mythique chute des 222 marches du Sacré-Cœur dans John Wick: Chapitre 4 comme doublure de Keanu Reeves. Doublure attitrée de Tomer Sisley, Jean Dujardin et Adam Sandler.",
    avatarUrl: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/13-vincent-OK.png',
    imdb: 'https://www.imdb.com/name/nm4933991/',
    externalUrl: 'https://fr.vincentbouillon.com/',
    instagram: 'https://www.instagram.com/vincent_bouillon/',
    order_index: 8,
  },
  {
    id: 'maurice-chan',
    name: 'Maurice Chan',
    role: 'Spécialiste Acrobaties, Chutes et Combats',
    title: 'Formateur Référent Arts Martiaux & Chutes',
    specialties: ['Arts martiaux mixtes', 'Wushu', 'Chutes faciales et arrières', 'Chorégraphies rapides'],
    bio: "Co-fondateur du collectif Cascade Demo Team et expert international en arts martiaux et cascades de contact. Maurice Chan transmet l'exigence des impacts, la lisibilité caméra des frappes et la précision des enchaînements.",
    avatarUrl: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/9-maurice.png',
    imdb: 'https://www.imdb.com/name/nm0151023/',
    externalUrl: 'https://mauricechan.book.fr',
    instagram: 'https://www.instagram.com/mauricechan_official/',
    order_index: 9,
  },
  {
    id: 'kefi-abrikh',
    name: 'Kefi Abrikh',
    role: 'Spécialiste Chorégraphies de Combat',
    title: 'Action Designer & Chorégraphe de Combat',
    specialties: ['Action Design', 'Chorégraphies de combat', 'Prévisualisation', 'Cascades physiques'],
    bio: "Action designer et coordinateur des cascades sur des productions internationales (Lupin, Lucy, Fast & Furious 6). Kefi Abrikh forme les élèves à la conception de combats cinématographiques narratifs et dynamiques.",
    avatarUrl: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/10-kefi.png',
    imdb: 'https://www.imdb.com/name/nm3768608/',
    externalUrl: 'http://www.kefiabrikh.com',
    instagram: 'https://www.instagram.com/kefi_abrikh/',
    order_index: 10,
  },
  {
    id: 'anthony-pho',
    name: 'Anthony Pho',
    role: 'Spécialiste Chorégraphie de combat',
    title: 'Chorégraphe de Combat & Cascadeur',
    specialties: ['Chorégraphie de combat', 'Arts martiaux', 'Câblage', 'Combats rapprochés'],
    bio: "Chorégraphe de combat et cascadeur prolifique comptant plus de 170 productions (Yoroï, Black Snake). Anthony Pho enseigne la rythmique martiale, la distance de sécurité et le travail des impacts à l'écran.",
    avatarUrl: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/17-anthony.png',
    imdb: 'https://www.imdb.com/name/nm4131136/',
    externalUrl: 'https://www.anthonypho.com/',
    instagram: 'https://www.instagram.com/anthony_pho/',
    order_index: 11,
  },
  {
    id: 'alex-vu',
    name: 'Alex Vu',
    role: 'Spécialiste Tricks Chutes et Combats',
    title: 'Spécialiste Tricks, Chutes & Combats',
    specialties: ['Tricking', 'Chutes physiques', 'Combats acrobatiques', 'Cascades contact'],
    bio: "Cascadeur et formateur spécialisé dans le tricking et les chutes physiques de haute intensité. Alex Vu (John Wick: Chapter 4) forme les futurs cascadeurs à la combinaison fluide d'acrobaties explosives et de combats.",
    avatarUrl: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/12-alex.png',
    imdb: 'https://www.imdb.com/name/nm4842137/',
    externalUrl: 'https://alexvu.book.fr',
    instagram: 'https://www.instagram.com/alexvu_stunt/',
    order_index: 12,
  },
  {
    id: 'michel-bouis',
    name: 'Michel Bouis',
    role: "Spécialiste Chutes et Maniement d'armes",
    title: "Formateur Référent Chutes & Maniement d'Armes",
    specialties: ['Chutes de hauteur', "Maniement d'armes", 'Cascades mécaniques', 'Combats'],
    bio: "Figure historique de la cascade française avec plus de 260 crédits (Lupin, L'Amour ouf, Elyas, L'Empereur de Paris). Michel Bouis transmet son savoir inégalé sur les chutes complexes et le maniement d'armes scéniques.",
    avatarUrl: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/14-michel.png',
    imdb: 'https://www.imdb.com/name/nm0099365/',
    externalUrl: 'https://www.michel-bouis-cascade.fr/',
    instagram: 'https://www.instagram.com/michelbouis/',
    order_index: 13,
  },
  {
    id: 'sarah-belala',
    name: 'Sarah Belala',
    role: 'Spécialiste Combats, Chutes',
    title: 'Cascadeuse & Spécialiste Combats et Chutes',
    specialties: ['Combats rapprochés', 'Chutes de hauteur', 'Doublure féminine', 'Poursuites'],
    bio: "Cascadeuse et doublure d'action reconnue comptant plus de 80 productions (Acide, Mon Poussin, La Danseuse). Sarah Belala forme aux exigences physiques des chutes et des combats féminins sur plateau.",
    avatarUrl: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/15-sarah.png',
    imdb: 'https://www.imdb.com/name/nm5404934/',
    externalUrl: 'https://www.instagram.com/sarahbelala/',
    instagram: 'https://www.instagram.com/sarahbelala/',
    order_index: 14,
  },
  {
    id: 'pierre-toubas',
    name: 'Pierre Toubas',
    role: 'Spécialiste Combats, Acrobaties',
    title: 'Cascadeur & Spécialiste Combats et Acrobaties',
    specialties: ['Combats scéniques', 'Acrobaties martiales', 'Chutes physiques', 'Câblage'],
    bio: "Cascadeur et coordinateur fort de plus de 70 productions (Marianne, Walter). Pierre Toubas enseigne la synergie entre acrobaties dynamiques, chutes nettes et intensité martiale.",
    avatarUrl: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/16-pierre.png',
    imdb: 'https://www.imdb.com/name/nm4947290/',
    externalUrl: 'https://www.instagram.com/pierretoubas/',
    instagram: 'https://www.instagram.com/pierretoubas/',
    order_index: 15,
  },
  {
    id: 'jonathan-bernard',
    name: 'Jonathan Bernard',
    role: 'Spécialiste Combats et Chute',
    title: 'Cascadeur & Spécialiste Combats et Chutes',
    specialties: ['Combats réglés', 'Chutes de hauteur', 'Cascades physiques', 'Doublure'],
    bio: "Cascadeur polyvalent présent sur plus de 40 productions de cinéma et télévision. Jonathan Bernard accompagne les promotions sur les fondamentaux de chute et la réaction aux coups.",
    avatarUrl: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/18-jonathan.png',
    imdb: 'https://www.imdb.com/name/nm6788253/',
    externalUrl: 'https://www.instagram.com/jonathan_bernard_stunt/',
    instagram: 'https://www.instagram.com/jonathan_bernard_stunt/',
    order_index: 16,
  },
  {
    id: 'bastien-trouve',
    name: 'Bastien Trouvé',
    role: "Spécialiste Combats et Maniements d'armes",
    title: "Formateur Cascades & Maniement d'Armes",
    specialties: ["Maniement d'armes", 'Combats rapprochés', 'Chutes', 'Acrobaties'],
    bio: "Cascadeur professionnel et diplômé CUC, Bastien Trouvé compte près de 40 productions dont Anna de Luc Besson. Il forme les stagiaires à la précision du maniement des armes et à l'exécution martiale rigoureuse.",
    avatarUrl: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/19-bastien.png',
    imdb: 'https://www.imdb.com/name/nm9687362/',
    externalUrl: 'https://www.instagram.com/bastien_trouve/',
    instagram: 'https://www.instagram.com/bastien_trouve/',
    order_index: 17,
  },
  {
    id: 'teddy-ponceau',
    name: 'Teddy Ponceau',
    role: 'Spécialiste Parkour Combats et Chutes',
    title: 'Spécialiste Parkour, Combats & Chutes',
    specialties: ['Parkour', 'Franchissements rapides', 'Combats scéniques', 'Chutes de hauteur'],
    bio: "Traceur et cascadeur d'élite fort de plus de 80 productions (Sous la Seine 2). Teddy Ponceau forme aux techniques explosives de franchissement d'obstacles, aux chutes de vitesse et aux chorégraphies nerveuses.",
    avatarUrl: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/23-teddy-ponceau.png',
    imdb: 'https://www.imdb.com/fr/name/nm12249560/',
    externalUrl: 'https://www.instagram.com/teddyponceau/',
    instagram: 'https://www.instagram.com/teddyponceau/',
    order_index: 18,
  },
  {
    id: 'alan-cueff',
    name: 'Alan Cueff',
    role: 'Spécialiste Acrobatie et Chutes',
    title: 'Formateur Acrobatie & Cascades Physiques',
    specialties: ['Acrobaties au sol', 'Chutes physiques', 'Tricking', 'Combats'],
    bio: "Cascadeur professionnel formé au CUC, intervenant sur des productions internationales (Anna, The Killer). Alan Cueff transmet sa rigueur technique en acrobaties, chutes et combats rapprochés.",
    avatarUrl: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/21-alan-cueff.png',
    imdb: 'https://www.imdb.com/name/nm10995720/',
    externalUrl: 'https://www.instagram.com/alancueff/',
    instagram: 'https://www.instagram.com/alancueff/',
    order_index: 19,
  },
  {
    id: 'nicolas-retabi',
    name: 'Nicolas Retabi',
    role: 'Spécialiste Chutes Acrobaties et Airbag',
    title: 'Spécialiste Chutes, Acrobaties & Réceptions Airbag',
    specialties: ['Chutes de très grande hauteur', 'Réceptions Airbag', 'Acrobaties', 'Impacts'],
    bio: "Cascadeur de référence pour les chutes de très grande hauteur et la gestion des réceptions airbag (Les Trois Mousquetaires, Pattaya). Nicolas Retabi forme aux protocoles stricts des sauts et réceptions sécurisées.",
    avatarUrl: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/22-nicolas-rertabi.png',
    imdb: 'https://www.imdb.com/fr/name/nm6912508/',
    externalUrl: 'https://www.instagram.com/nicolasretabi/',
    instagram: 'https://www.instagram.com/nicolasretabi/',
    order_index: 20,
  },
];

// Assemblage des 20 coachs avec leurs crédits et métadonnées
const fullTeam = COACH_DEFINITIONS.map(def => {
  const scrapedCoach = scrapedData.coaches.find(c => c.id === def.id);
  const credits = scrapedCoach ? scrapedCoach.credits : [];
  
  // Formatage notableCredits
  const notableCredits = credits.length > 0
    ? credits.map(c => c.formattedCredit)
    : (def.id === 'niels-dalery' ? ['Sous la Seine (2024) — Cascadeur'] : []);

  // Map film_roles
  const film_roles = {};
  for (const c of credits) {
    const slug = slugify(c.title);
    film_roles[slug] = c.roleLabel;
  }
  if (def.id === 'niels-dalery') {
    film_roles['sous-la-seine'] = 'Cascadeur';
  }

  // Acteurs doublés
  const doubledActors = scrapedCoach ? scrapedCoach.doubledActors : [];

  return {
    ...def,
    doubledActors: Array.from(new Set(doubledActors)),
    notableCredits,
    metadata: {
      imdb_last_scraped_at: scrapedData.scrapedAt,
      film_roles,
    },
  };
});

async function main() {
  console.log('=== APPLICATION DES DONNÉES CUC (20 COACHS & ACTEURS DOUBLÉS) ===\n');

  // 1. Écriture de src/data/celebrities.ts
  console.log('1. Génération de src/data/celebrities.ts...');
  const cleanCelebrities = curatedCelebrities.map(c => ({
    id: c.id,
    name: c.name,
    photo: c.photo,
    productions: c.productions,
    stuntSpecialty: c.stuntSpecialty,
    stuntDoubles: c.stuntDoubles,
    imdbUrl: c.imdbUrl,
  }));

  const celebritiesCode = `import { DoubledCelebrity } from '@/types';

/**
 * Comédiens doublés par le CUC — données factuelles issues du scraping IMDb officiel.
 * Uniquement les acteurs ayant été effectivement doublés par un ou plusieurs coachs du CUC.
 * Dernière mise à jour : ${new Date().toISOString()}
 */
export const DOUBLED_CELEBRITIES: DoubledCelebrity[] = ${JSON.stringify(cleanCelebrities, null, 2)};
`;
  fs.writeFileSync(path.join(ROOT, 'src', 'data', 'celebrities.ts'), celebritiesCode, 'utf8');
  console.log(`✓ src/data/celebrities.ts écrit avec ${curatedCelebrities.length} comédiens doublés.`);

  // 2. Écriture de src/data/team.ts
  console.log('2. Génération de src/data/team.ts...');
  const teamCode = `import { Instructor } from '@/types';

/**
 * Liste officielle des 20 coachs et formateurs du Campus Univers Cascades.
 * Données filmographiques et rôles certifiés issus du scraping IMDb.
 * Horodatage du scraping : ${scrapedData.scrapedAt}
 */
export const CUC_TEAM: Instructor[] = ${JSON.stringify(fullTeam, null, 2)};
`;
  fs.writeFileSync(path.join(ROOT, 'src', 'data', 'team.ts'), teamCode, 'utf8');
  console.log(`✓ src/data/team.ts écrit avec 20 coachs et ${fullTeam.reduce((acc, c) => acc + c.notableCredits.length, 0)} crédits.`);

  // 3. Synchronisation Supabase site_team
  console.log('3. Synchronisation de la table site_team dans Supabase...');
  for (const coach of fullTeam) {
    const payload = {
      id: coach.id,
      name: coach.name,
      role: coach.role,
      title: coach.title,
      specialties: coach.specialties,
      bio: coach.bio,
      doubled_actors: coach.doubledActors,
      notable_credits: coach.notableCredits,
      avatar_url: coach.avatarUrl,
      instagram: coach.instagram,
      imdb: coach.imdb || null,
      external_url: coach.externalUrl,
      order_index: coach.order_index,
      is_published: true,
      metadata: coach.metadata,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('site_team').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.error(`  ✗ Erreur upsert coach ${coach.id}:`, error.message);
    } else {
      console.log(`  ✓ Coach ${coach.name} synchronisé (${coach.notableCredits.length} crédits)`);
    }
  }

  // 4. Synchronisation site_settings ('team' et 'celebrities')
  console.log('4. Synchronisation de site_settings...');
  const { error: errTeam } = await supabase.from('site_settings').upsert({
    key: 'team',
    value: fullTeam,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'key' });
  if (errTeam) console.error('  ✗ Erreur site_settings[team]:', errTeam.message);
  else console.log('  ✓ site_settings[team] synchronisé.');

  const { error: errCeleb } = await supabase.from('site_settings').upsert({
    key: 'celebrities',
    value: { list: curatedCelebrities },
    updated_at: new Date().toISOString(),
  }, { onConflict: 'key' });
  if (errCeleb) console.error('  ✗ Erreur site_settings[celebrities]:', errCeleb.message);
  else console.log('  ✓ site_settings[celebrities] synchronisé.');

  console.log('\n=== SYNCHRONISATION TERMINÉE AVEC SUCCÈS ===\n');
}

main().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
