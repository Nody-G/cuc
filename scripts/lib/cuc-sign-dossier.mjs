/**
 * CHAPITRE CUC SIGN — contenu du dossier de présentation client
 * ===========================================================
 *
 * CUC Sign était noyé au milieu du dossier de l'application. Il en devient un
 * chapitre à part entière — sa propre « page » dans le même document — avec ce
 * que la plateforme fait, pour qui, comment les deux applications communiquent,
 * et les signalements terrain (matériel défectueux, rangement, blessure)
 * déclarés depuis un téléphone.
 *
 * Ce module ne lit rien et n'assemble que le contenu interne du chapitre : le
 * générateur (`generate_app_dossier.mjs`) en fournit le titre numéroté et la
 * balise `<section id="cuc-sign">`, et garde la main sur la mise en page globale.
 *
 * Contrat public : `buildCucSignContent({ esc, nf, icon, featCard, kpiHtml, cucSign })`.
 */

/**
 * Parcours d'un élève — le schéma qui relie le site, le Cockpit puis CUC Sign.
 * Animation 100 % native (CSS `offset-path` et SVG), sans dépendance.
 * `at` = seconde d'arrivée du jeton sur l'étape, dans une boucle de 16 s.
 */
const JOURNEY_PATH = 'M120 70 H820 V170 H120 V270 H820';
const JOURNEY_STEPS = [
  { x: 120, y: 70, n: '1', t: 'Il postule en ligne', s: 'site public · deux minutes', at: 0 },
  { x: 470, y: 70, n: '2', t: 'La demande arrive au Cockpit', s: 'statut, notes, réponse', at: 2.4 },
  { x: 820, y: 70, n: '3', t: 'Admission validée', s: 'convention, convocation', at: 4.9 },
  { x: 820, y: 170, n: '4', t: 'Le dossier élève naît dans CUC Sign', s: 'même base · aucune double saisie', at: 5.6 },
  { x: 120, y: 170, n: '5', t: 'Il émarge chaque jour', s: 'tablette à l’entrée, même hors ligne', at: 10.4 },
  { x: 470, y: 270, n: '6', t: 'Ses compétences se valident', s: 'coachs, tests physiques', at: 12.9 },
  { x: 820, y: 270, n: '7', t: 'Sa fiche part aux castings', s: 'PDF composite prêt à envoyer', at: 15.4 },
];

/**
 * Ce que CUC Sign apporte au campus — rédigé à partir de son dépôt
 * (`Nody-G/cuc-sign`) : émargement Qualiopi, kiosque hors ligne, rotations et
 * casting assistant, sécurité des élèves, fiche de casting.
 */
const CUC_SIGN_CARDS = [
  {
    iconName: 'shield',
    title: 'Émargement conforme Qualiopi',
    desc: "Feuilles de présence numériques horodatées et conservées : c'est la preuve que réclament les financeurs et les audits, produite au fil de l'année.",
    tags: ['Direction', 'Secrétariat'],
  },
  {
    iconName: 'refresh',
    title: 'La tablette à l’entrée, même sans réseau',
    desc: "Mode borne : l'élève signe en quelques secondes par QR code, et le pointage continue de fonctionner si le réseau tombe au gymnase.",
    tags: ['Élèves'],
  },
  {
    iconName: 'users',
    title: 'Les coachs notent et délibèrent sur le terrain',
    desc: "Note de 0 à 10 depuis le téléphone, table de délibération pour composer les groupes de niveaux, remplacements gérés, et un coup d'œil avant le cours sur les élèves qui reviennent de blessure.",
    tags: ['Coachs'],
  },
  {
    iconName: 'sliders',
    title: 'La direction pilote l’école',
    desc: "Planning des créneaux et des remplacements, présences et absences suivies, statistiques de fréquentation, gestion des comptes et des rôles (direction, secrétariat, coachs, élèves).",
    tags: ['Direction'],
  },
  {
    iconName: 'database',
    title: 'La sécurité des élèves, tracée',
    desc: 'Fiche médicale d’urgence à accès restreint, blessures suivies, matériel défectueux signalé avec photo : ce qui se perdait dans un carnet se retrouve en un écran.',
    tags: ['Coachs', 'Direction'],
  },
  {
    iconName: 'star',
    title: 'Compétences validées, fiche de casting prête',
    desc: "Chaque compétence validée et chaque test physique alimentent une fiche composite PDF — mensurations, skills, profil — directement envoyable aux productions.",
    tags: ['Élèves'],
  },
  {
    iconName: 'globe',
    title: 'Pensé aussi pour l’international',
    desc: 'Les stagiaires étrangers s’émargent et consultent leur progression dans leur langue ; le lexique technique est bilingue.',
    tags: ['Élèves', 'Coachs'],
  },
];

/**
 * Signalements terrain : le geste qui manquait. Depuis un simple téléphone,
 * chacun déclare ce qui ne va pas — et la bonne personne est prévenue.
 */
const CUC_SIGN_REPORT_CARDS = [
  {
    iconName: 'phone',
    title: 'Déclarer un problème en une photo',
    desc: "Matériel défectueux, équipement à réparer, zone mal rangée : depuis son téléphone, on prend une photo, on choisit le lieu et on envoie. Le signalement arrive directement sur le tableau de bord des administrateurs — plus de feuille volante ni de message oublié.",
    tags: ['Matériel', 'Rangement'],
  },
  {
    iconName: 'shield',
    title: 'Une blessure déclarée, tout le monde au courant',
    desc: "Un élève se blesse pendant un cours : il le déclare depuis son téléphone. Le coach est prévenu avant le cours suivant, la direction et le secrétariat aussi — la blessure est suivie et documentée, jamais reconstituée de mémoire.",
    tags: ['Blessure', 'Coachs', 'Direction'],
  },
  {
    iconName: 'bell',
    title: 'Du signalement à l’action, horodaté',
    desc: "Chaque déclaration est datée, rattachée à un lieu et à un auteur, puis traitée puis archivée : la direction voit ce qui a été fait, par qui, et quand.",
    tags: ['Traçabilité'],
  },
  {
    iconName: 'database',
    title: 'Fiche médicale d’urgence, accès restreint',
    desc: "Contacts d'urgence et informations médicales consultables uniquement par les personnes habilitées, au moment précis où elles en ont besoin — sans dossier papier qui traîne.",
    tags: ['Urgence'],
  },
];

/**
 * Ce que CUC Sign change pour l'avenir du campus. Chaque carte s'appuie sur ce
 * qui existe réellement dans le dépôt `Nody-G/cuc-sign`.
 */
const CUC_SIGN_FUTURE_CARDS = [
  {
    iconName: 'phone',
    title: 'Chaque candidature devient un inscrit suivi',
    desc: "Le site recrute, CUC Sign prend le relais : dossier, convocation, convention, certificat médical et autorisation d'image consignés au même endroit. Rien ne se perd entre le premier message et la rentrée.",
    tags: ['Recrutement'],
  },
  {
    iconName: 'shield',
    title: 'Les financeurs demandent des preuves : elles existent',
    desc: "Émargements horodatés, absences justifiées, certificats médicaux : les pièces réclamées par l'AFDAS, les OPCO et un audit Qualiopi se constituent au fil de l'année au lieu d'être reconstituées la veille.",
    tags: ['Financements'],
  },
  {
    iconName: 'gauge',
    title: 'Le campus pilote avec ses propres chiffres',
    desc: "Présences, blessures, progression, créneaux remplacés : l'équipe voit ce qui fonctionne et ajuste la pédagogie sur des faits, pas sur des impressions.",
    tags: ['Pilotage'],
  },
  {
    iconName: 'star',
    title: 'Un vivier où les productions viennent chercher',
    desc: "Compétences validées, tests physiques, mensurations et showreel composent un profil prêt à envoyer : le CUC ne se contente pas de former, il place ses élèves sur les tournages.",
    tags: ['Rayonnement'],
  },
];

/**
 * Circulation réelle entre le site public et CUC Sign. L'état est affiché :
 * « En service » ne se dit que pour ce qui tourne aujourd'hui.
 */
const CUC_SIGN_BRIDGE_ROWS = [
  [
    'Site → CUC Sign',
    "Une candidature acceptée devient un dossier élève : identité, coordonnées, programme visé, session souhaitée. Aucune ressaisie.",
    'En service',
  ],
  [
    'Site → CUC Sign',
    'Les créneaux planifiés et les coachs qui les assurent : le site affiche les sessions réellement programmées.',
    'À étendre',
  ],
  [
    'CUC Sign → Site',
    'Les formations (dates, intitulés), les 12 coachs et les lieux du campus : le site les lit en direct, en lecture seule.',
    'En service',
  ],
  [
    'CUC Sign → Site',
    "Le passage d'une session de « ouvert » à « complet » répercuté aussitôt sur la page des stages.",
    'À étendre',
  ],
  [
    'Plus tard',
    "Les productions pourraient chercher un cascadeur sur ses compétences validées et ses mensurations, directement depuis le site.",
    "À l'étude",
  ],
];

/**
 * Construit le contenu interne du chapitre CUC Sign (sans `<section>` ni titre
 * numéroté, dont la responsabilité revient au générateur).
 *
 * @param {object} options
 * @param {(s: unknown) => string} options.esc     Échappement HTML.
 * @param {(n: unknown) => string} options.nf      Formatage numérique FR.
 * @param {(name: string) => string} options.icon  Rendu d'une icône.
 * @param {(card: object) => string} options.featCard Carte de fonctionnalité.
 * @param {(v: unknown, l: string, s?: string) => string} options.kpiHtml Indicateur chiffré.
 * @param {object|null} options.cucSign            Données d'interconnexion mesurées en base.
 * @returns {string} HTML du contenu du chapitre.
 */
export function buildCucSignContent({ esc, nf, icon, featCard, kpiHtml, cucSign }) {
  const journeySvg = `
<svg viewBox="0 0 940 340" class="chart" role="img" aria-label="Parcours d'un élève : candidature en ligne, admission dans le Cockpit, dossier élève dans CUC Sign, émargement quotidien, validation des compétences, fiche composite envoyée aux castings">
  <path d="${JOURNEY_PATH}" stroke="#26262e" stroke-width="2" stroke-dasharray="6 8" fill="none"/>
  <path class="jdraw" d="${JOURNEY_PATH}"/>
  ${JOURNEY_STEPS.map(
    (p) => `
    <circle class="jring" cx="${p.x}" cy="${p.y}" r="19" style="animation-delay:${p.at}s"/>
    <circle class="jnode" cx="${p.x}" cy="${p.y}" r="19" fill="#12121a" stroke="#3a3a44" stroke-width="2" style="animation-delay:${p.at}s"/>
    <text x="${p.x}" y="${p.y + 5}" text-anchor="middle" fill="#fff" font-size="13.5" font-weight="700">${p.n}</text>
    <text x="${p.x}" y="${p.y + 40}" text-anchor="middle" fill="#fff" font-size="12.5" font-weight="600">${p.t}</text>
    <text x="${p.x}" y="${p.y + 56}" text-anchor="middle" fill="#9a9aa5" font-size="11">${p.s}</text>`
  ).join('')}
  <g class="jtoken" style="offset-path: path('${JOURNEY_PATH}')">
    <circle r="12" fill="#FFE500"/>
    <circle r="5" fill="#111"/>
  </g>
</svg>`;

  const espacesHtml = CUC_SIGN_CARDS.map(featCard).join('');
  const reportsHtml = CUC_SIGN_REPORT_CARDS.map(featCard).join('');
  const futureHtml = CUC_SIGN_FUTURE_CARDS.map(featCard).join('');

  const bridgeTable = `
    <table>
      <thead><tr><th>Sens</th><th>Ce qui circule entre les deux applications</th><th>État</th></tr></thead>
      <tbody>${CUC_SIGN_BRIDGE_ROWS.map(
    ([direction, detail, state]) =>
      `<tr><td><strong>${direction}</strong></td><td>${detail}</td><td>${state}</td></tr>`
  ).join('')}</tbody>
    </table>`;

  const connectionHtml = cucSign
    ? `<div class="kpis">
    ${kpiHtml(cucSign.formations, 'formations CUC Sign', 'référencées côté site')}
    ${kpiHtml(cucSign.profiles, 'profils CUC Sign', 'coachs & direction')}
    ${kpiHtml(cucSign.locations, 'lieux CUC Sign', 'installations du campus')}
    ${kpiHtml(`${cucSign.linkedSessions}/${cucSign.totalSessions}`, 'sessions reliées', 'les autres attendent leur formation CUC Sign')}
    ${kpiHtml(`${cucSign.linkedTeam}/${cucSign.totalTeam}`, 'coachs reliés', 'les intervenants externes n’ont pas de compte')}
    ${kpiHtml(`${cucSign.linkedPois}/${cucSign.totalPois}`, 'zones du campus reliées', 'liaisons vérifiées, jamais approximatives')}
  </div>`
    : '<p class="meta">Données d’interconnexion indisponibles pour le moment.</p>';

  return `
    <p class="lead">
      CUC Sign n'est pas un outil réservé aux élèves : c'est la <strong>plateforme de gestion de l'école</strong>,
      avec un espace pour chacun. <strong>Les élèves</strong> s'émargent chaque jour, consultent leur planning,
      suivent leur progression et repartent avec un profil de casting. <strong>Les coachs</strong> notent depuis leur
      téléphone, délibèrent pour composer les groupes, assurent un remplacement au pied levé et voient avant le
      cours qui revient de blessure. <strong>La direction et le secrétariat</strong> pilotent le planning, suivent
      présences et absences, gèrent les comptes et les rôles, et sortent les preuves réclamées par les financeurs.
    </p>
    <p>
      CUC Sign réutilise le travail déjà fait et les mêmes outils que le site, et surtout : le pont de données est
      <strong>déjà en service</strong>. Les formations, les coachs et les lieux affichés publiquement viennent de
      CUC Sign, en lecture seule. Les deux applications partagent <strong>la même base de données</strong> —
      c'est volontaire : rien à dupliquer, rien à synchroniser le jour où la seconde étape démarrera.
    </p>
    <div class="callout">
      <strong>Une seule école, une seule base.</strong> Ce qui est saisi d'un côté n'a jamais à être ressaisi de
      l'autre : une candidature perdue ou une session annoncée à tort n'ont plus de raison d'exister.
    </div>

    <h3>Le parcours d'un élève</h3>
    <p>Le jeton relie les trois étages du projet : le site (candidature), le Cockpit (admission), puis CUC Sign (vie de l'élève).</p>
    <div class="flow reveal">${journeySvg}</div>
    <p class="meta">
      Suivez le jeton : une candidature envoyée depuis votre site traverse l'admission, crée le dossier élève, accompagne
      l'émargement quotidien, puis ressort en fiche de casting. Chaque étape s'allume au passage.
    </p>

    <h3>Un espace pour chacun : les élèves, les coachs, la direction</h3>
    <p class="meta">Trois publics, une seule plateforme, des droits différents : chaque accès est nominatif et limité à son rôle.</p>
    <div class="feat-grid">${espacesHtml}</div>

    <h3>Signaler depuis son téléphone — et être prévenu à temps</h3>
    <p>
      C'est l'un des usages les plus concrets de CUC Sign : le terrain remonte l'information sans passer par un
      cahier ni par un appel. Chacun déclare depuis son smartphone, avec une photo quand c'est utile, et la bonne
      personne est prévenue — administrateurs comme coachs.
    </p>
    <div class="feat-grid">${reportsHtml}</div>
    <ul class="thread">
      <li><b>Matériel défectueux ou rangement :</b> photo + lieu → le signalement apparaît sur le tableau de bord des administrateurs.</li>
      <li><b>Blessure en cours :</b> l'élève déclare → le coach est informé au début du cours, les admins aussi.</li>
      <li><b>Suivi :</b> chaque déclaration reste consultable, avec sa date et son auteur, jusqu'à sa résolution.</li>
    </ul>

    <h3>Les deux applications, main dans la main <span class="meta">(ce qui circule déjà, et ce que la suite ouvrira)</span></h3>
    <p>
      C'est là que se joue l'intérêt des deux outils réunis : plus une donnée saisie deux fois, plus une session
      annoncée sur le site qui contredirait le planning interne. L'état de chaque échange est indiqué : « en service »
      se dit seulement pour ce qui fonctionne aujourd'hui.
    </p>
${bridgeTable}

    <h3>Le pont aujourd'hui, chiffré</h3>
    <p class="meta">Ces liens sont vérifiés en base : ils disent exactement ce que le site lit de CUC Sign, sans approximation.</p>
    ${connectionHtml}

    <h3>Ce que cela change pour la suite du CUC</h3>
    <div class="feat-grid">${futureHtml}</div>

    <div class="callout">
      <strong>Deux étapes, pas deux factures surprises.</strong> Le site public et le Cockpit sont livrés et en
      service — ils ne dépendent pas de CUC Sign pour fonctionner. CUC Sign est en préparation : il sera présenté
      avec son périmètre et son budget le moment venu, sans rien remettre en cause de ce qui est déjà en place.
    </div>`;
}
