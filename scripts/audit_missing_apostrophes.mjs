#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Audit des APOSTROPHES PERDUES dans les textes éditoriaux français
 * ==============================================================================
 * Les imports de synopsis et de fiches ont parfois supprimé l'apostrophe des
 * élisions : « dune fraternité », « laidera », « quil », « cest », « senivre ».
 * Le défaut est invisible en anglais (l'overlay EN est propre) mais bien présent
 * sur le site français et dans le Cockpit.
 *
 * Méthode (pas de dictionnaire complet, mais un crible honnête) :
 *   1. on isole les jetons qui COMMENCENT par une élision (`d`, `l`, `qu`, `n`,
 *      `j`, `m`, `t`, `s`, `c`, `jusqu`, `lorsqu`, `puisqu`, `presqu`) suivie
 *      d'une voyelle ou d'un `h` ;
 *   2. on élimine les mots français légitimes via une liste blanche vérifiée ;
 *   3. ce qui reste est un candidat : il est listé, jamais corrigé
 *      automatiquement (une correction de contenu reste une décision humaine).
 *
 * Usage :
 *   node scripts/audit_missing_apostrophes.mjs            # applicatif + revue
 *   node scripts/audit_missing_apostrophes.mjs --dry      # revue seulement
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

const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` };

/** Mots français légitimes commençant par une lettre d'élision + voyelle/h. */
const WHITELIST = new Set(
    (
        'le la les leur lui dans de des du depuis dont donc deux dire droit dernier derniere chez ce ces cet cette comme contre ' +
        'sous sur sa se ses si sans son sont ton ta tes tu temps tout tous toute toutes trois train nous ne non ni nos notre ' +
        'jamais jour jeu jeune juste moi ma mes mon mieux moins mer meme mais main quand que qui quoi quel quelle car cas cause ' +
        'centre cinq clair cote corps cours court contre capable chacune chacun chacun chaud chef chemin cher chercher cheval ' +
        'chose ciel clair club coeur couleur coup culture danger debout debut dedans dehors deja demain demande depuis dernier ' +
        'dessus destin detail devant devenir devoir difference difficile diner dire direction discours disparaitre distance ' +
        'doigt domaine donner dont doute doux drole dure durer eau ecole egalement encore enfant enfin ensemble ensuite entrer ' +
        'envie environ espece espoir essai essentiel etable etape etat ete etendu etoile etonner etrange etre etude evenement ' +
        'evidemment examen exemple excellent exception experience expliquer expression extreme facile facon faible faire fait ' +
        'falloir fameux famille fatigué faut faute faveur femme fendre ferme fermer fete feu fidele fier figure fil fille film ' +
        'fils fin finalement finir fixe flamme fleur fois folie fond force forcer foret forme former fort fortune fou foule ' +
        'frais franc frapper frequemment froid front fruit fuir fumer futur garde garder gauche general genre gens geste glace ' +
        'gloire gouvernement grace grade grand grave grief groupe guere guerre habitude hair haine haut herbe heriter heure ' +
        'heureux hier histoire hiver homme honneur honte hopital horloge hotel humain humeur huit huitre ici idee ignorer ' +
        'ailleurs image important impossible impression incident inconnu indiquer infinite influence information initial ' +
        'innocent inquiet inscrire instant institut instruction instrument intelligent interet interieur interpreter interruption ' +
        'introduire inventer invitation iode iris issue italien jamais jardin jaune jeter jeu jeudi jeune joie joli jouer jour ' +
        'journal journee joyeux jugement juger juillet juin juge juste justice la-bas laboratoire lac laid laisser lait langue ' +
        'large larme latin lecture legal leger lendemain lent lettre lever libre lien lieu ligne lire liste lit litterature ' +
        'livre local loi loin long longtemps lorsque lourd loyer lumiere lundi lune lutte machine madame mademoiselle magasin ' +
        'magnifique main maintenant maintien mais maison maitre majeste mal malade male maniere manque manteau marchand marche ' +
        'mardi mari mariage marine marque mars matin matiere mauvais mechant mecontent medecin meilleur melange meme memoire ' +
        'menace mener mensonge menton mer merci mere merveille mesure messe messieurs metal methode metier metre mettre midi ' +
        'mien mieux milieu militaire mille million ministre minute miroir mise mode moi moindre moine moins mois moitie moment ' +
        'monde monsieur mont montagne monter montre montrer moquer moral mort mot moteur mou mouvement moyen muet mur mure ' +
        'mystere nager naissance naitre nation nature naturel navire necessaire necessite negatif neige nerf net nettement ' +
        'neuf neuvieme nez nier niveau noble noce noir nom nombre nombreux nommer nord normale note noter nourrir nouveau ' +
        'nouvelle noyer nuage nuit nourriture objet obliger obscur observation observer occasion occuper ocean odeur oeuvre ' +
        'offenser offerte office officier offrir oiseau ombre oncle onde ongle opinion or orage oranger ordinaire ordre oreille ' +
        'organe orgueil orient origine orner orteil os oser oter ou ouest oublier outil outre ouvert ouvrage ouvrier ouvrir ' +
        'palais pale panier papier paquet par parce parcourir pareil parent parfois parfait parfum parler parmi parole part ' +
        'partager particulier partie partir partout parvenir pas passage passer passion patience patrie pauvre pavillon payer ' +
        'pays paysage peau peche peine peindre peinture penser pente perdu pere permettre perpetuel personne personne ' +
        'pesanteur petit peu peuple peur peut phase phenomene photo phrase physique piece pied pierre pire pistolet place ' +
        'plafond plaindre plaine plaire plaisir plan plante pleurer pleut plier plomb pluie plupart plume plus plusieurs ' +
        'poche poeme poesie poete poids poing point pointe poire poisson poli politique polonais pomme pont populaire port ' +
        'porte porter pose poser position posseder possible poste pouce poudre poule poumon pour pourquoi poursuivre pourtant ' +
        'pousser poussiere pouvoir pratique premier prendre preparer pres presque presse presser pret preuve prier principe ' +
        'printemps prix proche prochain produire produit professeur profit profond programme progres projet promettre ' +
        'prononcer propos propre proprete proteger prouver province provision prudent public puiser puis puisque puissance ' +
        'puissant punir pupitre qualite quand quant quantite quarante quart quartier quatre que quel quelque quelque quelle ' +
        'querelle question queue qui quinze quitter quoi quotidien raconter raison ranger rapide rappeler rapport rare ' +
        'rassurer rattraper ravissant rayon recevoir recherche recommencer reconnaitre reconduire recueillir redresser ' +
        'refaire reflechir refuser regard regarder regle regler reine rejeter relever remarquer remede remercier remettre ' +
        'remonter remplacer remplir remuer renard rencontre rendre renfermer renier rencontrer rentrer renverser repandre ' +
        'reparaître repartir repas repeter repondre reponse repos repousser representer reproche republique reputation ' +
        'reserve resister resolution resoudre respect respirer ressembler ressort ressouvenir rester reste resultat retard ' +
        'retenir retirer retour retraite retrouver reunir reussir reve reveiller reveler revenir rever revoir revue rez ' +
        'rhume richesse rideau ridicule rien rigide rire risque rive riviere riz robe roche roi role roman rond rose rouge ' +
        'route ruban rue ruine rumeur rupture sable sac sage saigner saint saisir saison salade salaire sale salle salon ' +
        'saluer salut sang sans sante satisfaire sauce sauf sauter sauver savoir savon scandale sceau scene seche secret ' +
        'secretaire seigneur sel selon semaine sembler senat sens sentiment sentir sept septembre serf serieux serment ' +
        'serrer service servir seul seulement siecle siege sien signal signe signer silence simple simplement singulier ' +
        'sinon site situer six social societe soeur soif soin soir soit sol soldat soleil solution sombre sommet sommier ' +
        'songe sonner sont sorcier sortir soudain souffle souffrir souhaiter soulier souligner soupcon souper souple source ' +
        'sourd sourire sous soutenir souvenir souvent sport subir succes successeur sucre suffire suffisant suggerer suicider ' +
        'suivre sujet superieur supposer supprimer sur surprendre surtout surveiller survivre suspect symbole systeme ' +
        'table tableau tache taille taire tandis tant tante tard tarif tas tasse tater te teinte tel tellement temoin ' +
        'temperament tempete temple temps tendance tendre tenir tentative tenue terme terminer terrain terre terrible ' +
        'territoire test tete the theatre theme thermostat tient tiers timbre tirage tirer tiroir tissu titre toi toile ' +
        'toit tomber ton tonne tonnerre torche tort total touchant toucher toujours tour tourner tournant tous tout toute ' +
        'trace tracer train traiter trajet tranche tranquille travail travers treize trembler trente tres tressaillir ' +
        'tribunal triste trois tromper trone trop trottoir trou trouble trouver tuer type unique uniforme union usage ' +
        'user usine utile utiliser vacances vain vaisseau valoir valeur vallee vallon valise valoir vapeur vase vaste ' +
        'veille veiller vendre vendredi vengeance venir vent vente veritable verite verre vers verser vert veste vetement ' +
        'viande victime victoire vide vide vidre vieil vieillard vieille vierge vif vigne vigoureux vilain village ville ' +
        'vin vingt violence violent violet visage visible visite visiter vison vitesse vitre vivre vocabulaire voeu voie ' +
        'voile voir voisin voiture voix vol voler voleur volontaire volontiers volume voter vouloir voyage voyelle vrai ' +
        'vraiment vue wagon week-end yeuse zèle zero zone'
    )
        .split(/\s+/)
        .filter(Boolean)
);

const ELISION = /^(jusqu|lorsqu|puisqu|presqu|qu|d|l|n|j|m|t|s|c)([aeiouyàâäéèêëîïôöùûüh].*)$/i;

const isCandidate = (token) => {
    const lowered = token.toLowerCase();
    if (lowered.length < 4) return false;
    const match = lowered.match(ELISION);
    if (!match) return false;
    const [, prefix, rest] = match;
    if (prefix === 'qu' && lowered.startsWith('que')) return false;
    if (WHITELIST.has(lowered)) return false;
    if (WHITELIST.has(prefix + rest)) return false;
    // Un mot réellement accentué (« héros », « élève ») est hors sujet.
    if (/[éèêëàâîïôû]/.test(rest.charAt(0)) && !/^[dh]/.test(rest)) return false;
    return true;
};

async function fetchRows(path) {
    const res = await fetch(`${URL_BASE}/rest/v1/${path}`, { headers: HEADERS });
    if (!res.ok) {
        console.warn(`  ⚠️  ${path} → HTTP ${res.status}`);
        return [];
    }
    return res.json();
}

const REGISTRY = [
    { entity: 'Films', path: 'site_films?select=id,description', fields: ['description'] },
    { entity: 'Coachs', path: 'site_team?select=id,bio,title,role', fields: ['bio', 'title', 'role'] },
    { entity: 'Partenaires', path: 'site_partners?select=id,description', fields: ['description'] },
    { entity: 'Événements', path: 'site_events?select=id,description,subtitle,features', fields: ['description', 'subtitle', 'features'] },
    { entity: 'Programmes', path: 'site_programs?select=id,title,description,duration', fields: ['title', 'description', 'duration'] },
    { entity: 'Disciplines', path: 'site_disciplines?select=id,name,short_desc,full_desc', fields: ['name', 'short_desc', 'full_desc'] },
    { entity: 'Pages vitrine', path: 'site_pages?select=slug,sections_data', fields: ['sections_data'] },
];

const lines = [];
lines.push('# Revue — Apostrophes perdues dans les textes éditoriaux FR');
lines.push('');
lines.push(`Généré le ${new Date().toISOString()} par \`scripts/audit_missing_apostrophes.mjs\`.`);
lines.push('');
lines.push(
    'Détecteur : élision (`d`, `l`, `qu`, `n`, `j`, `m`, `t`, `s`, `c`, `jusqu`, `lorsqu`, `puisqu`, `presqu`) suivie d’une voyelle ou d’un `h`, hors liste blanche de mots français légitimes. **Aucune correction automatique** : ce sont des candidats à relire.'
);
lines.push('');

let totalCandidates = 0;
const summary = [];

for (const def of REGISTRY) {
    const rows = await fetchRows(def.path);
    const perRow = [];
    for (const row of rows) {
        const found = new Set();
        for (const field of def.fields) {
            const value = row[field];
            const texts = Array.isArray(value)
                ? value
                : typeof value === 'object' && value !== null
                    ? [JSON.stringify(value)]
                    : [value];
            for (const text of texts) {
                if (typeof text !== 'string') continue;
                for (const token of text.split(/[^A-Za-zÀ-ÿ'-]+/)) {
                    if (isCandidate(token)) found.add(token);
                }
            }
        }
        if (found.size) perRow.push({ id: row.id ?? row.slug, tokens: [...found].slice(0, 8) });
    }
    totalCandidates += perRow.length;
    summary.push({ entity: def.entity, rows: rows.length, affected: perRow.length });
    if (perRow.length) {
        lines.push(`## ${def.entity} — ${perRow.length}/${rows.length} ligne(s) porteuse(s)`);
        lines.push('');
        lines.push('| Ligne | Jetons suspects |');
        lines.push('|---|---|');
        for (const item of perRow.slice(0, 60)) {
            lines.push(`| \`${item.id}\` | ${item.tokens.join(', ')} |`);
        }
        if (perRow.length > 60) lines.push(`| … | ${perRow.length - 60} autre(s) ligne(s) |`);
        lines.push('');
    }
}

lines.unshift('');
lines.splice(
    5,
    0,
    ...summary.map((entry) => `- ${entry.entity} : **${entry.affected}/${entry.rows}** ligne(s) porteuse(s)`)
);
lines.push(
    `**Total : ${totalCandidates} ligne(s) à relire.** Correction : rétablir l’apostrophe (` + "'" + `) dans les jetons listés — jamais de réécriture de phrase.`
);
lines.push('');

mkdirSync('plans', { recursive: true });
if (!DRY) writeFileSync('plans/revue-apostrophes-manquantes.md', lines.join('\n'), 'utf8');

console.log('');
for (const entry of summary) {
    console.log(`${entry.affected.toString().padStart(4)}/${String(entry.rows).padEnd(4)} ${entry.entity}`);
}
console.log('');
console.log(`Total : ${totalCandidates} ligne(s) à relire${DRY ? ' (dry-run : revue non écrite)' : ' — plans/revue-apostrophes-manquantes.md'}`);
