/**
 * Génère un fichier `opengraph-image.tsx` par route (hors racine, déjà fournie).
 *
 * Chaque fichier délègue le rendu à la fabrique partagée `renderOgImage`
 * (src/lib/og-image.tsx) afin de garantir une charte visuelle homogène.
 *
 * Idempotent : écrase le fichier s'il existe déjà.
 */
import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const APP_DIR = join(process.cwd(), "src", "app");

/** @type {{ route: string; eyebrow: string; title: string; subtitle?: string; metrics?: string[] }[]} */
const ROUTES = [
    {
        route: "formation-de-cascadeur",
        eyebrow: "FORMATION PROFESSIONNELLE",
        title: "DEVENIR CASCADEUR DE CINÉMA",
        subtitle: "Cursus 2 ans / 720 h + Formule Découverte 12 jours",
        metrics: ["720 HEURES", "2 ANS", "AFDAS", "QUALIOPI"],
    },
    {
        route: "stages-cascades-parkour-2",
        eyebrow: "STAGES & PARKOUR",
        title: "STAGES CASCADES & PARKOUR",
        subtitle: "Week-ends intensifs et stages thématiques ouverts à tous",
        metrics: ["WEEK-ENDS", "TOUS NIVEAUX", "PARKOUR", "CASCADES"],
    },
    {
        route: "cuc-team-cascadeur",
        eyebrow: "ÉQUIPE PROFESSIONNELLE",
        title: "CUC TEAM CASCADEURS",
        subtitle: "La troupe de cascadeurs professionnels du Campus",
        metrics: ["SPECTACLES", "CINÉMA", "ÉVÉNEMENTIEL", "LIVE"],
    },
    {
        route: "equipe-cascadeurs-pro",
        eyebrow: "L'ÉQUIPE",
        title: "L'ÉQUIPE DU CAMPUS",
        subtitle: "Formateurs, cascadeurs et encadrement technique",
        metrics: ["FORMATEURS", "CASCADEURS", "TECHNIQUE", "SÉCURITÉ"],
    },
    {
        route: "videos-cascadeur",
        eyebrow: "VIDÉOS & REPORTAGES",
        title: "LE CUC À L'ÉCRAN",
        subtitle: "Séries TV, reportages et coulisses du Campus",
        metrics: ["FRANCE 2", "BFM TV", "DAILYMOTION", "COULISSES"],
    },
    {
        route: "spectacles-cascades-yamakasi",
        eyebrow: "SPECTACLES",
        title: "SPECTACLES & YAMAKASI",
        subtitle: "Shows de cascades et démonstrations live",
        metrics: ["LIVE", "YAMAKASI", "PARKOUR", "ÉVÉNEMENTS"],
    },
    {
        route: "team-building-cascades",
        eyebrow: "TEAM BUILDING",
        title: "TEAM BUILDING CASCADES",
        subtitle: "Cohésion d'équipe par l'action et le dépassement",
        metrics: ["ENTREPRISES", "COHÉSION", "SUR-MESURE", "6 HECTARES"],
    },
    {
        route: "animations-airbag-parkour",
        eyebrow: "ANIMATIONS",
        title: "AIRBAG & PARKOUR",
        subtitle: "Animations grand public et airbag de réception",
        metrics: ["AIRBAG", "PARKOUR", "FAMILLE", "SÉCURISÉ"],
    },
    {
        route: "stunt-workshop-cuc",
        eyebrow: "STUNT WORKSHOP",
        title: "STUNT WORKSHOP CUC",
        subtitle: "Ateliers techniques encadrés par des professionnels",
        metrics: ["ATELIERS", "PROS", "TECHNIQUE", "IMMERSION"],
    },
    {
        route: "cuc-events-agence",
        eyebrow: "AGENCE ÉVÉNEMENTIELLE",
        title: "CUC EVENTS — AGENCE",
        subtitle: "Production d'événements et de cascades sur mesure",
        metrics: ["PRODUCTION", "SUR-MESURE", "CINÉMA", "LIVE"],
    },
    {
        route: "partenaires",
        eyebrow: "PARTENAIRES OFFICIELS",
        title: "NOS PARTENAIRES",
        subtitle: "13 marques et fabricants accompagnent le Campus",
        metrics: ["NIKE", "RXR", "C17", "KILOUTOU"],
    },
    {
        route: "visite-guidee",
        eyebrow: "VISITE GUIDÉE",
        title: "VISITEZ LE CAMPUS",
        subtitle: "Découvrez 6 hectares d'installations uniques",
        metrics: ["6 HECTARES", "CUC TOWER", "SUR RDV", "GRATUIT"],
    },
    {
        route: "visite-virtuelle",
        eyebrow: "VISITE VIRTUELLE 360°",
        title: "EXPLOREZ EN 360°",
        subtitle: "Visite immersive du domaine et du plan 3D",
        metrics: ["360°", "PLAN 3D", "IMMERSIF", "EN LIGNE"],
    },
    {
        route: "contact-cuc",
        eyebrow: "CONTACT",
        title: "CONTACTEZ LE CUC",
        subtitle: "Inscriptions, stages et renseignements",
        metrics: ["INSCRIPTIONS", "STAGES", "DEVIS", "RÉPONSE RAPIDE"],
    },
];

let created = 0;

for (const { route, eyebrow, title, subtitle, metrics } of ROUTES) {
    const dir = join(APP_DIR, route);
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }

    const metricsLiteral = metrics
        ? `[${metrics.map((m) => JSON.stringify(m)).join(", ")}]`
        : undefined;

    const content = `import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

/**
 * Image Open Graph générée dynamiquement pour la route /${route}.
 * Rendu 1200×630 via la fabrique partagée (charte CUC).
 */
export const alt = ${JSON.stringify(title)};
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
    return renderOgImage({
        eyebrow: ${JSON.stringify(eyebrow)},
        title: ${JSON.stringify(title)},
        subtitle: ${JSON.stringify(subtitle ?? "")},
        metrics: ${metricsLiteral ?? "undefined"},
    });
}
`;

    writeFileSync(join(dir, "opengraph-image.tsx"), content, "utf8");
    created += 1;
    console.log(`OK  ${route}/opengraph-image.tsx`);
}

console.log(`\n${created} images Open Graph générées.`);
