import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const authenticStuntRoles = {
  "the-killer": "Gun-fu John Woo, câblage 3D, chutes à travers cloisons et fusillades au ralenti.",
  "largo-winch-3": "Combats véloces à mains nues, chutes de véhicules lancés, rigging aérien et poursuites.",
  "sous-la-seine": "Cascades subaquatiques, mouvements de panique fluviale, chutes dans l'eau et impacts d'explosions.",
  "elyas": "Combats tactiques rapprochés, affrontements à mains nues et fusillades en espace confiné.",
  "monte-cristo": "Combats d'époque à l'épée, sauts de falaise, chutes en mer et évasion du Château d'If.",
  "lamour-ouf": "Affrontements de rue percutants, fusillades, chutes sur sol dur et scènes de poursuite.",
  "the-substance": "Cascades physiques sous prothèses lourdes, chutes corporelles et impacts de haute intensité.",
  "john-wick-4": "Combats de triades, gun-fu, chutes dans les 222 marches de Montmartre et cascades physiques.",
  "valerian": "Wirework 3 axes, harnais suspendus et simulations d'apesanteur en studio.",
  "dunkirk": "Chutes en mer, explosions côtières et mouvements de panique de masse tournés sur les plages du Nord.",
  "james-bond-spectre": "Cascades d'action urbaine, explosions contrôlées, poursuites et affrontements rapprochés.",
  "lucy": "Combats martiaux rapprochés, projections par câblage et réactions physiques aux impacts balistiques.",
  "fast-furious-6": "Cascades automobiles, impacts cinétiques violents et combats d'action au corps-à-corps.",
  "yamakasi": "Pionniers mondiaux du parkour et de l'Art du Déplacement (ADD), cascades urbaines sur les toitures.",

  // The 49 previously copy-pasted films with dedicated authentic stunt work:
  "le-salaire-de-la-peur": "Convoi sous haute tension, fusillades en milieu désertique, explosions de camions et chutes de véhicules.",
  "machine": "Chorégraphies martiales au corps-à-corps en milieu industriel, combats armés à la clé à molette et chutes sur sol dur.",
  "fiasco": "Cascades physiques de comédie, chutes burlesques, fausses explosions et accidents orchestrés sur plateau.",
  "gtmax": "Cascades moto de haut niveau, cross urbain, poursuites à grande vitesse et glissades contrôlées.",
  "furies": "Combats rapprochés féminins rythmés, gun-fu, chutes de passerelles et bagarres dans les bas-fonds parisiens.",
  "alibi-com-2": "Bagarres de comédie rythmées, chutes de toits, impacts de mobilier et gags physiques de cascade.",
  "murder-mystery-2": "Cascades aériennes à la Tour Eiffel, câblage en hauteur, bagarres dans un van en marche et sauts de véhicules.",
  "wednesday-mercredi": "Duels d'escrime chorégraphiés, acrobaties sombres, voltige assistée par câbles et chutes fantastiques.",
  "goliath": "Mouvements de foule sous tension, bousculades manifestantes réalistes et chutes au sol.",
  "uncharted": "Voltige aérienne sur cargaison larguée en plein vol, combats d'agilité et chutes sur structures suspendues.",
  "the-355": "Combats tactiques à mains nues, désarmements rapides, courses-poursuites urbaines et chutes de hauteur.",
  "lupin": "Poursuites sur les toits de Paris, franchissements urbains type parkour, combats discrets et descentes en rappel.",
  "sentinelle": "Combats au couteau, affrontements en boîte de nuit et dans des villas, percussions balistiques et chutes sèches.",
  "black-widow": "Combats martiaux au sol et en l'air, wirework haute vélocité, chutes libres et cascades en soufflerie.",
  "braqueurs": "Fusillades au fusil d'assaut, impacts balistiques réalistes, chutes de car-jacking et assauts coordonnés.",
  "bac-nord": "Assauts physiques en cage d'escalier, bousculades violentes, jets de projectiles et arrestations sous haute tension.",
  "stillwater": "Affrontements réalistes de stade de football, percussions physiques de rue et bagarres au sol.",
  "dune": "Combats au corps-à-corps au bouclier, duel au couteau crysknife et réceptions de chutes dans le sable.",
  "family-business": "Cascades burlesques, chutes comiques sur sol dur, bagarres maladroites et projections dans les décors.",
  "police": "Tensions physiques en habitacle confiné de véhicule, interventions policières et contentions réalistes.",
  "balle-perdue": "Percussions de voitures béliers spécialement conçues, bagarres sèches en commissariat et combats physiques bruts.",
  "bronx": "Fusillades d'action policière, impacts balistiques lourds, carambolages et règlements de comptes.",
  "30-jours-max": "Sauts de balcons, chutes d'escaliers de comédie, traversées de fenêtres et cascades policières burlesques.",
  "nicky-larson": "Chorégraphies d'action manga rythmées, gun-fu cartoonesque, chutes de mobilier et esquives spectaculaires.",
  "6-underground": "Parkour urbain sur dômes historiques, chutes de grande hauteur, cascades de supercars et explosions spectaculaires.",
  "les-miserables": "Mouvements de foule en cité, impacts de feux d'artifice, chutes dans des halls d'immeubles et interventions anti-émeute.",
  "mortel": "Projections télékinétiques par câblage, chutes surnaturelles et combats physiques au lycée.",
  "mission-impossible-fallout": "Poursuite moto à contresens à Paris, combats au corps-à-corps au Grand Palais et chutes de toitures.",
  "raid-dingue": "Entraînement d'intervention du RAID, descentes en rappel sur façades, chutes comiques et tirs d'action.",
  "overdrive": "Cascades de supercars en mouvement, transferts entre camions lancés à vive allure et combats sur remorque.",
  "alibi-com": "Bagarres de comédie rythmées, chutes dans des buissons et piscines, glissades et percussions de véhicules légers.",
  "jason-bourne": "Combats rapprochés percutants avec objets du quotidien, courses-poursuites en véhicule SWAT et chutes sur le Strip.",
  "bastille-day": "Poursuite haletante sur les toits en zinc de Paris, combats dans un fourgon blindé et franchissements urbains.",
  "taken-3": "Chutes dans des cages d'ascenseur, tonneaux de véhicules sur autoroute et combats expéditifs au corps-à-corps.",
  "le-transporteur-heritage": "Combats chorégraphiés en hangar d'aéroport, glissades sous véhicules et acrobaties martiales.",
  "the-hunger-games": "Cascades physiques en arène urbaine, chutes d'arbres et de corniches, courses poursuites et esquives.",
  "l-affaire-sk1": "Poursuites pédestres dans les ruelles et le métro parisien, plaquages policiers d'urgence et arrestations au sol.",
  "3-days-to-kill": "Poursuites en berline dans les rues de Paris, combats rapprochés et chutes à travers du mobilier d'hôtel.",
  "malavita": "Assauts nocturnes de maison, explosions, chutes de toitures et fusillades rapprochées.",
  "taken-2": "Sauts de toits en toits d'Istanbul, projections de grenades, poursuites en taxi et fusillades intenses.",
  "de-l-autre-cote-du-periph": "Chutes de passerelles de karting, bagarres de club libertin et courses-poursuites sur le périphérique.",
  "from-paris-with-love": "Combats en restaurant asiatique, fusillades explosives sur les toits et tirs depuis un véhicule lancé.",
  "un-prophete": "Bagarres carcérales réalistes, agressions rapprochées à la lame et chutes dures sur sol béton.",
  "banlieue-13-ultimatum": "Franchissements d'obstacles urbains, sauts de toits vertigineux, combats contre les forces de sécurité et cascades parkour.",
  "largo-winch": "Combats chorégraphiés au corps-à-corps, chutes en falaise et cascades urbaines doublées par Vincent Bouillon.",
  "mesrine-l-ennemi-public-n-1": "Évasions carcérales spectaculaires, fusillades de grand banditisme, percussions balistiques et chutes de véhicules.",
  "babylon-a-d": "Parkour urbain dans une mégapole cyberpunk, combats d'arène violents, explosions et voltige câblée.",
  "taxi-4": "Cascades automobiles à grande vitesse, dérapages contrôlés, percussions urbaines et cascades comiques.",
  "danny-the-dog": "Chorégraphies martiales intenses, chutes violentes à travers le mobilier et projections câblées."
};

async function main() {
  console.log('--- Curating authentic stunt roles for all 63 films ---');
  
  // 1. Read filmography.ts
  const content = fs.readFileSync('./src/data/filmography.ts', 'utf8');
  const jsonStart = content.indexOf('= [') + 2;
  const jsonEnd = content.lastIndexOf(']');
  const prefix = content.slice(0, jsonStart);
  const suffix = content.slice(jsonEnd + 1);
  const films = JSON.parse(content.slice(jsonStart, jsonEnd + 1));
  
  console.log(`Loaded ${films.length} films from filmography.ts`);
  
  let updatedCount = 0;
  for (const film of films) {
    if (authenticStuntRoles[film.id]) {
      const oldRole = film.stuntRoles;
      film.stuntRoles = authenticStuntRoles[film.id];
      if (oldRole !== film.stuntRoles) {
        updatedCount++;
      }
    } else {
      console.warn(`[WARNING] Missing authentic role for film id: "${film.id}" (${film.title})`);
    }
  }
  
  console.log(`Updated ${updatedCount} film stunt roles in memory.`);
  
  // Write back to filmography.ts
  const newContent = prefix + JSON.stringify(films, null, 2) + suffix;
  fs.writeFileSync('./src/data/filmography.ts', newContent, 'utf8');
  console.log('Successfully saved to src/data/filmography.ts');
  
  // 2. Update Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseKey) {
    console.error('No Supabase key found in .env.local');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Syncing to Supabase...');
  
  // Sync to site_films
  let dbSuccessCount = 0;
  for (const film of films) {
    const { error } = await supabase
      .from('site_films')
      .update({ stunt_roles: film.stuntRoles })
      .eq('id', film.id);
      
    if (error) {
      console.error(`Error updating site_films for ${film.id}:`, error.message);
    } else {
      dbSuccessCount++;
    }
  }
  console.log(`Synced ${dbSuccessCount}/${films.length} films to site_films.`);
  
  // Sync to site_settings (films)
  const { error: settingsError } = await supabase
    .from('site_settings')
    .upsert({
      key: 'films',
      value: films,
      updated_at: new Date().toISOString()
    });
    
  if (settingsError) {
    console.error('Error updating site_settings (films):', settingsError.message);
  } else {
    console.log('Successfully updated site_settings (films).');
  }
  
  // 3. Sync disciplines to Supabase site_disciplines
  const { CUC_DISCIPLINES } = await import('../src/data/disciplines.ts').catch(() => ({ CUC_DISCIPLINES: null }));
  // or read disciplines.ts directly
  console.log('Done!');
}

main().catch(console.error);
