#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Semis des overlays EN des 20 COACHS (entité `team` de site_translations)
 * ==============================================================================
 * Fiches complètes, humaines et professionnelles pour les 20 coachs.
 * Zéro « AI slop », crédits vérifiés, respect de la terminologie Parkour.
 *
 * Méthode (doctrine) :
 *   - traductions par CHEMIN (`role`, `title`, `bio`, `specialties`), appliquées sur
 *     la fiche FR RÉELLE lue dans `site_team` ;
 *   - les tableaux `specialties` sont écrits EN ENTIER (alignement d'index rigoureux) ;
 *   - fusion dans le payload EN existant, upsert sur (entity, entity_id, locale) ;
 *   - fichier de revue `plans/revue-traductions-coachs-en.md` écrit À CHAQUE exécution.
 *
 * Usage :
 *   node scripts/seed_team_translations_en.mjs --dry
 *   node scripts/seed_team_translations_en.mjs
 * ==============================================================================
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const DRY = process.argv.includes('--dry');

if (!URL_BASE || !KEY) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant.');
    process.exit(1);
}

const HEADERS = {
    apikey: KEY,
    Authorization: `Bearer ${KEY}`,
    'Content-Type': 'application/json',
};

/**
 * Traductions EN par coach pour les 20 intervenants CUC.
 * Spécialités alignées en longueur et en ordre sur les fiches FR.
 */
const TRANSLATIONS = {
    'lucas-dollfus': {
        role: 'Founder & Managing Director',
        title: 'Stunt Coordinator & Lead Instructor',
        bio: 'Born to two physical education teachers in Loire-Atlantique, Lucas Dollfus moved to Paris after his secondary studies with the ambition to learn stunt work. Struck by the lack of structured training, safety protocols, and industry standards at the time, he designed the concept of a full-fledged stunt academy at age 21, drawing inspiration from comprehensive athletic training campuses. He founded Campus Univers Cascades in 2008, established since 2016 on a 5-hectare estate in Le Cateau-Cambrésis, while continuing his career as an active stunt coordinator for film and television. On campus, he instills teamwork, technical rigor, and practical set-readiness in every trainee.',
        specialties: ['Stunt Direction', 'Action Design', 'On-Set Safety', 'High Falls'],
    },
    'jerome-gaspard': {
        role: 'Head of Training',
        title: 'Film Stunt Coordinator',
        bio: 'Introduced to gymnastics and acrobatics at an early age by his father, Jérôme Gaspard began his stunt career in 1997 at Disneyland Paris performing in the Pocahontas and Tarzan live shows. He made his feature film debut in 2001 doubling Samuel Le Bihan in Brotherhood of the Wolf (Le Pacte des loups), before working on more than two hundred film and television productions (Taken, Largo Winch, Valerian, Braquo). As the founder of the professional platform Action Cascade, he serves as Head of Training at the CUC, teaching mechanical and physical stunt coordination, extreme high falls, and methodical on-set risk analysis.',
        specialties: ['Stunt Coordination', 'High Falls', 'Rigging', 'Armed Combat'],
    },
    'malik-diouf': {
        role: 'Yamakasi Co-Founder',
        title: 'Lead Instructor — Parkour & Urban Agility',
        bio: 'As an original founding member of the Yamakasi, Malik Diouf helped bring Parkour to worldwide audiences through the landmark films Yamakasi and The Great Challenge (Les Fils du vent). An accomplished stunt performer and action coordinator across multiple film and television productions (Taxi 2, Les Misérables), he serves at Campus Univers Cascades as lead instructor for Parkour. He teaches an uncompromised approach to urban traversal, rooted in stamina management, foot placement accuracy, joint strengthening, and psychological composure when facing obstacles.',
        specialties: ['Parkour', 'Urban Obstacle Crossing', 'Acrobatic Mobility'],
    },
    'franck-blanc': {
        role: 'Deputy Director',
        title: 'Lead Coach — Rigging, Pyrotechnics & Full-Body Fire',
        bio: 'Coming from theater and stage acting, Franck Blanc joined Campus Univers Cascades to focus on the most technical disciplines in action cinema. Now deputy director of the school, he serves as the lead specialist for full-body fire stunts (human torches), high falls exceeding twenty meters, and 3D rigging systems. In training, he ensures students master kinetic pulley systems, harness adjustments, and strict fire safety protocols, emphasizing calm execution under pressure and uncompromising on-set responsibility.',
        specialties: ['3D Rigging', 'Pulley & Winch Systems', 'Pyrotechnic Effects', 'Human Torches'],
    },
    'frederic-dessains': {
        role: 'Specialist — Acrobatics, Combat & Comedy',
        title: 'Instructor — Acrobatics, Fight & Slapstick Stunts',
        bio: 'A child actor under directors Costa-Gavras and Claude Miller, Frédéric Dessains grew up in the entertainment world, performing hand-to-hand acrobatics with his father in cabarets and circuses. After joining the Disneyland Paris stunt team in 1998, he contributed to dozens of productions as an actor and stunt performer. At the CUC, he specializes in physical comedy and slapstick stunts. He trains students in stair falls, timed impacts, and comedic rhythm, teaching them to sell hits to the camera without sacrificing safety or physical longevity.',
        specialties: ['Floor Acrobatics', 'Stage Combat', 'Comic Falls', 'Slapstick Stunts'],
    },
    'niels-dalery': {
        role: 'Specialist — Acrobatics & Freerunning',
        title: 'Lead Instructor — Freerun & Urban Acrobatics',
        bio: 'A pioneer of urban freerunning in the Lyon region and 2013 French Speed Running Champion, Niels Dalery brings his explosive agility to the stunt industry. Having performed in feature films such as The Takedown (Loin du périph), he is responsible for urban acrobatics and tricking at the CUC. His coaching focuses on smooth momentum transfer, spatial awareness during aerial rotations, and adapting acrobatic movement to narrow sets and variable camera focal lengths.',
        specialties: ['Floor Acrobatics', 'Free-Running', 'Tricking', 'Acrobatic Falls'],
    },
    'amedeo-cazzella': {
        role: 'Specialist — Combat & Weapons Handling',
        title: 'Lead Instructor — Edged Weapons & Stage Combat',
        bio: 'Practicing martial arts since age fourteen, Amédéo Cazzella co-founded the Cascade Demo Team in 1997, taking part in major television broadcasts and martial arts festivals. An active stunt performer and fight coordinator on international productions (Anna, John Wick: Chapter 4, Lucy), he teaches edged-weapon handling and stage fencing at the CUC. His curriculum highlights edge orientation, realistic guard positions, cadence control, and safety distances required when working with bladed weapons on camera.',
        specialties: ['Edged-Weapon Handling', 'Tactical Combat', 'Combat Shooting', 'Falls'],
    },
    'vincent-bouillon': {
        role: 'Specialist — Combat, Acrobatics & Falls',
        title: 'Professional Stunt Performer & International Double',
        bio: 'A martial artist, gymnast, and member of the Cascade Demo Team and Hitz International, Vincent Bouillon is recognized internationally for doubling Keanu Reeves in John Wick: Chapter 4 and Ballerina. In 2024, he won a Taurus World Stunt Award in Hollywood (Hardest Hit) for his fall down the Montmartre steps. At the CUC, he trains students in the physical endurance needed for long takes, weapon handling during multi-opponent fight scenes, and the exact timing required to maintain rhythm with international action stars.',
        specialties: ['Choreographed Combat', 'High Falls', 'Action Doubling', 'Acrobatics'],
    },
    'maurice-chan': {
        role: 'Specialist — Acrobatics, Falls & Combat',
        title: 'Lead Instructor — Martial Arts & High-Intensity Falls',
        bio: 'Born in a refugee camp in Thailand before growing up in France, Maurice Chan earned a degree in cinema from the Sorbonne while winning the 1999 European Việt Võ Đạo championship. Co-founder of the Cascade Demo Team in 1997 and author of the reference handbook Les bases de la cascade physique, he oversees martial arts and contact falls at the CUC. His teaching emphasizes physical economy, taking hits convincingly, facial and back falls on hard surfaces, and action choreography designed specifically for the camera lens.',
        specialties: ['Mixed Martial Arts', 'Wushu & Việt Võ Đạo', 'Front & Back Falls', 'High-Speed Choreography'],
    },
    'kefi-abrikh': {
        role: 'Specialist — Fight Choreography',
        title: 'Action Designer & Fight Choreographer',
        bio: 'With a competitive combat sports background and years as a stunt double for Tomer Sisley, Kefi Abrikh has established himself as one of Europe’s top Action Designers and second-unit directors. Through his company AC Stunts, he has coordinated and choreographed major titles including The Emperor of Paris, City Hunter (Nicky Larson), and the video game Detroit: Become Human. At the CUC, he teaches action design, video pre-visualization, camera shot design, and the pacing needed to craft modern, hard-hitting fight sequences.',
        specialties: ['Action Design', 'Fight Choreography', 'Previsualisation', 'Physical Stunts'],
    },
    'anthony-pho': {
        role: 'Specialist — Fight Choreography',
        title: 'Fight Choreographer & Stunt Performer',
        bio: 'Holding a Master’s degree in Computer Science, Anthony Pho combined his analytical mindset with Taekwondo, Vovinam, and tricking. Mentored by action coordinator Manu Lanzi, he won a Taurus World Stunt Award in 2022 (Best Fight) for his choreography on Freaks Out, before performing on blockbusters including Dune, John Wick: Chapter 4, and The Matrix Resurrections. At the CUC, he teaches wirework, fight choreography, and rhythm breakdown, showing trainees how to optimize their strikes for the camera frame.',
        specialties: ['Fight Choreography', 'Martial Arts', 'Wirework', 'Close-Quarters Combat'],
    },
    'alex-vu': {
        role: 'Specialist — Tricks, Falls & Combat',
        title: 'Specialist — Tricking, Falls & Combat',
        bio: 'A member of the Cascade Demo Team since 2006, Alex Vu spent five years in Las Vegas performing a lead acrobatic and martial role in Cirque du Soleil’s show Kà. Co-founder of Stunt Workshop International, he brings a world-class standard in tricking, aerial martial arts, and high-impact falls. At the CUC, he focuses on dynamic body control, floor rebounds, and seamless transitions between acrobatic tricks and physical fight choreography.',
        specialties: ['Tricking', 'Physical Falls', 'Acrobatic Combat', 'Contact Stunts'],
    },
    'michel-bouis': {
        role: 'Specialist — Falls & Weapons Handling',
        title: 'Lead Instructor — Falls & Weapons Handling',
        bio: 'A Paris Firefighter for five years before entering professional stunts in 1987 with Mario Luraschi’s equestrian shows, Michel Bouis has built a career spanning more than 260 film, television, and stage productions (Queen Margot, Lupin, Beating Hearts). A veteran stunt performer and stunt coordinator, he teaches high falls, weapons handling, and vehicle stunts at the CUC. His instruction focuses on practical field experience, discipline, equipment maintenance, and repeatable execution on set.',
        specialties: ['High Falls', 'Weapons Handling', 'Mechanical Stunts', 'Combat'],
    },
    'sarah-belala': {
        role: 'Specialist — Combat & Falls',
        title: 'Stunt Performer — Combat & Physical Falls',
        bio: 'A graduate of Campus Univers Cascades with a scientific background, Sarah Belala is an accomplished athlete in parachuting, scuba diving, and martial arts. She has performed physical stunts, high falls, and full-body fire scenes on major international and French productions including Mission: Impossible – Fallout, Climax, Moon Knight, and The Takedown. At the CUC, she mentors trainees in close-quarters combat, reaction to hits, and the technical requirements of high-profile action doubling.',
        specialties: ['Close-Quarters Combat', 'High Falls', 'Action Doubling', 'Pursuits'],
    },
    'pierre-toubas': {
        role: 'Specialist — Combat & Acrobatics',
        title: 'Stunt Performer — Combat & Acrobatics',
        bio: 'A Taekwondo practitioner and expert in Haidong Gumdo (traditional Korean sword art), Pierre Toubas trained with Manu Lanzi’s MAD stunt team. Having performed in films like The Last Mercenary and City Hunter (Nicky Larson), he specializes in armed stage combat and martial acrobatics at the CUC. His coaching focuses on blade lines, spatial safety when handling props, and the visual clarity of sword strikes on screen.',
        specialties: ['Stage Combat', 'Martial Acrobatics', 'Physical Falls', 'Wirework'],
    },
    'jonathan-bernard': {
        role: 'Specialist — Combat & Falls',
        title: 'Stunt Performer — Combat & Falls',
        bio: 'A graduate of Campus Univers Cascades, Jonathan Bernard joined the core stunt ensemble for Romain Gavras’ acclaimed film Athena, performing in complex, high-energy single-take action sequences. Credited on productions such as The Killer, John Wick: Chapter 4, and B.R.I., he teaches combat timing and high falls at the CUC. He trains students to maintain physical precision, intensity, and focus through exhausting, continuous takes.',
        specialties: ['Timed Combat', 'High Falls', 'Physical Stunts', 'Action Doubling'],
    },
    'bastien-trouve': {
        role: 'Specialist — Combat & Weapons Handling',
        title: 'Stunt Instructor — Weapons & Hand-to-Hand Combat',
        bio: 'A graduate of Campus Univers Cascades with backgrounds in boxing, Muay Thai, and stage fencing, Bastien Trouvé designs clean, hard-hitting physical stunts. Credited on nearly forty film and television productions (Luc Besson’s Anna, Blood Coast, Largo Winch 3, Beating Hearts), he leads hand-to-hand combat and weapons handling workshops at the CUC. His training centers on footwork accuracy, distance management, and strictly honoring the coordinator’s choreographic vision.',
        specialties: ['Weapons Handling', 'Close-Quarters Combat', 'Falls', 'Acrobatics'],
    },
    'teddy-ponceau': {
        role: 'Specialist — Parkour, Combat & Falls',
        title: 'Specialist — Parkour, Combat & Falls',
        bio: 'A seasoned traceur and professional stunt performer with over eighty film and streaming credits (Furies, Wingwomen, The Killer, Acid, Alibi.com 2), Teddy Ponceau is widely recognized for his work doubling athletic actors. Specializing in high-speed chases, urban obstacle traversal, and impact falls, he teaches CUC trainees how to translate Parkour responsiveness into camera angles, confined spaces, and synchronized timing with screen partners.',
        specialties: ['Parkour', 'Rapid Traversal', 'Stage Combat', 'High Falls'],
    },
    'alan-cueff': {
        role: 'Specialist — Acrobatics & Falls',
        title: 'Instructor — Acrobatics & Physical Stunts',
        bio: 'Holding a state-certified BPJEPS qualification in acrobatic gymnastic activities and trained at Campus Univers Cascades, Alan Cueff has also qualified in vehicle stunt driving and tactical weapons handling. Working on leading French and international productions (Anna, The Killer, Elyas, The Takedown), he leads floor acrobatics, high falls, and ground landings at the CUC. His coaching emphasizes body alignment, trajectory consistency, and shock absorption to ensure lifelong physical safety.',
        specialties: ['Floor Acrobatics', 'Physical Falls', 'Tricking', 'Combat'],
    },
    'nicolas-retabi': {
        role: 'Specialist — Falls, Acrobatics & Airbag',
        title: 'Specialist — Falls, Acrobatics & Airbag Landings',
        bio: 'A professional stunt performer known for his work on landmark action films (Pattaya, Athena, The Veil), Nicolas Retabi has developed specialized expertise in extreme high falls and airbag landings. Frequently called upon to test and approve complex high-crane jumps, he trains CUC students in rigorous aerial safety protocols. His instruction covers free-fall breakdown, mid-air body tension, landing posture, and overcoming vertigo through mental control.',
        specialties: ['Extreme High Falls', 'Airbag Landings', 'Acrobatics', 'Impacts'],
    },
};

/** Fiches coachs RÉELLES en base — la vérité, jamais retapée. */
async function rest(pathname, init = {}) {
    const res = await fetch(`${URL_BASE}/rest/v1/${pathname}`, {
        ...init,
        headers: { ...HEADERS, ...(init.headers || {}) },
    });
    const body = await res.text();
    if (!res.ok) throw new Error(`${pathname} → ${res.status} ${body}`);
    return body ? JSON.parse(body) : null;
}

const teamRows = await rest('site_team?select=id,name,role,title,bio,specialties&order=order_index.asc');
const existingOverlays = await rest(
    'site_translations?select=entity_id,payload&entity=eq.team&locale=eq.en'
);
const existingByCoach = new Map(existingOverlays.map((row) => [row.entity_id, row.payload || {}]));
const teamById = new Map(teamRows.map((row) => [row.id, row]));

let applied = 0;
const review = [];
review.push('# Revue — Traductions EN des coachs (entité `team`)');
review.push('');
review.push(`Généré le ${new Date().toISOString()} par \`scripts/seed_team_translations_en.mjs\`.`);
review.push('');
review.push(`Mode : **${DRY ? 'dry-run (aucune écriture)' : 'application en base'}**`);
review.push('');
review.push('| Coach | Champs EN fournis |');
review.push('|---|---|');

for (const [coachId, fields] of Object.entries(TRANSLATIONS)) {
    const frRow = teamById.get(coachId);
    if (!frRow) {
        console.error(`❌ Coach « ${coachId} » absent de site_team — ignoré.`);
        process.exitCode = 2;
        continue;
    }

    // Garde-fou : les spécialités EN doivent être alignées sur la fiche FR.
    if (
        fields.specialties &&
        Array.isArray(frRow.specialties) &&
        fields.specialties.length !== frRow.specialties.length
    ) {
        console.error(
            `❌ ${coachId} : ${fields.specialties.length} spécialité(s) EN pour ${frRow.specialties.length} FR — alignement d'index invalide.`
        );
        process.exitCode = 2;
        continue;
    }

    const payload = {
        ...(existingByCoach.get(coachId) || {}),
        ...fields,
    };

    review.push(
        `| \`${coachId}\` (${frRow.name}) | ${Object.keys(fields).join(', ')} |`
    );
    console.log(
        `${DRY ? '[dry] ' : ''}team/${coachId} (${frRow.name}) — ${Object.keys(fields).join(', ')}`
    );

    if (!DRY) {
        await rest('site_translations?on_conflict=entity,entity_id,locale', {
            method: 'POST',
            headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
            body: JSON.stringify({
                entity: 'team',
                entity_id: coachId,
                locale: 'en',
                payload,
                is_published: true,
            }),
        });
    }
    applied += 1;
}

review.push('');
review.push(
    `${applied}/${teamRows.length} fiche(s) coach couverte(s) en EN — ${DRY ? 'dry-run, rien n’a été écrit.' : 'overlays publiés en base.'}`
);
review.push('');

mkdirSync('plans', { recursive: true });
writeFileSync('plans/revue-traductions-coachs-en.md', `${review.join('\n')}\n`, 'utf8');

console.log('');
console.log(`${DRY ? 'DRY-RUN' : 'APPLIQUÉ'} — ${applied} fiche(s) coach EN traitée(s).`);
console.log('Revue : plans/revue-traductions-coachs-en.md');
console.log('');
