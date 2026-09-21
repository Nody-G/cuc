#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Page « Visite guidée » : copie FR → catalogue (`visiteGuidee`)
 * ==============================================================================
 * Traite trois fichiers dont les ancres contiennent des entités HTML (`&`,
 * `'`) : le bloc « Accès & transport », la page parente (sections 360° et
 * plan 3D, chargeur du plan 3D).
 *
 * Le script ajoute aussi les clés de catalogue `visiteGuidee` (FR + EN) dans
 * `messages/*.json`, puis remplace les littéraux des composants.
 *
 * Idempotent : les clés déjà présentes sont conservées, les ancres déjà
 * remplacées sont signalées comme absentes.
 * ==============================================================================
 */
import { readFileSync, writeFileSync } from 'node:fs';

const A = '\x26'; // &
const P = '\x27'; // '

/** Copie de référence : clé → valeur FR / EN. */
const COPY = {
    accessBadge: [`ACCÈS ${A} TRANSPORT`, `ACCESS ${A} TRANSPORT`],
    accessTitle: [`COMMENT REJOINDRE LE CAMPUS ?`, `HOW TO REACH THE CAMPUS`],
    accessIntro: [
        `Situé au cœur de la région Hauts-de-France, le campus est facilement accessible depuis Paris, Lille, Bruxelles ou Londres.`,
        `Located in the heart of the Hauts-de-France region, the campus is easily reachable from Paris, Lille, Brussels or London.`,
    ],
    accessCarLabel: [`EN VOITURE :`, `BY CAR:`],
    accessCarBody: [
        `À 2h de Paris par les autoroutes A1 et A26. À 1h de Lille et Valenciennes. Parking privé sécurisé gratuit sur place pour les stagiaires.`,
        `2 hours from Paris via the A1 and A26 motorways. 1 hour from Lille and Valenciennes. Free secured private parking on site for trainees.`,
    ],
    accessTrainLabel: [`EN TRAIN (SNCF) :`, `BY TRAIN (SNCF):`],
    accessTrainBody: [
        `Gare de Le Cateau-Cambrésis (à 5 minutes du campus). Lignes directes depuis Paris Gare du Nord (via Saint-Quentin ou Cambrai). Navette CUC disponible sur demande.`,
        `Le Cateau-Cambrésis station (5 minutes from the campus). Direct services from Paris Gare du Nord (via Saint-Quentin or Cambrai). CUC shuttle available on request.`,
    ],
    accessPlaneLabel: [`EN AVION :`, `BY PLANE:`],
    accessPlaneBody: [
        `Aéroports internationaux de Paris CDG (1h45 de route), Lille Lesquin (1h) ou Charleroi Bruxelles-Sud (1h15).`,
        `International airports: Paris CDG (1h45 by road), Lille Lesquin (1h) or Brussels South Charleroi (1h15).`,
    ],
    coordinatesTitle: [`COORDONNÉES DU DOMAINE`, `GETTING HERE`],
    addressLabel: [`Adresse postale ${A} Accès :`, `Postal address ${A} access:`],
    mapRadarLabel: [`Radar ${A} Itinéraires`, `Radar ${A} directions`],
    standardLabel: [`Standard Admissions :`, `Admissions office:`],
    phoneLabel: [`Téléphone :`, `Phone:`],
    emailLabel: [`Email :`, `Email:`],
    idfLabel: [`Pôle Île-de-France (Studio Paris) :`, `Île-de-France centre (Paris studio):`],
    idfValue: [`Studio de Répétition ${A} Comédiens`, `Rehearsal studio ${A} actors`],
    accessCta: [
        `Planifier une Visite ou Réserver un Stage`,
        `Plan a visit or book a course`,
    ],
    tour3dBadge: [`TOPOGRAPHIE SPATIALE 3D`, `3D SPATIAL TOPOGRAPHY`],
    tour3dTitle: [`PLAN 3D INTERACTIF`, `INTERACTIVE 3D MAP`],
    tour3dTitleAccent: [`DU CAMPUS`, `OF THE CAMPUS`],
    tour3dParagraph: [
        `Faites pivoter la vue aérienne, explorez les 9 infrastructures en trois dimensions, et sélectionnez une zone pour découvrir ses installations spécialisées.`,
        `Rotate the aerial view, explore the nine facilities in three dimensions, and select an area to discover its specialised installations.`,
    ],
    tour360Badge: [`EXPÉRIENCE 360°`, `360° EXPERIENCE`],
    tour360Title: [`VISITE VIRTUELLE`, `VIRTUAL TOUR`],
    tour360TitleAccent: [`360° DU CAMPUS`, `360° OF THE CAMPUS`],
    tour360Paragraph: [
        `Explorez le domaine en immersion totale : naviguez librement dans le Zoé Bell Hall, observez la fosse olympique à cubes, la Tour CUC de 21m et l${P}ensemble des plateaux techniques.`,
        `Explore the grounds in full immersion: move freely through the Zoé Bell Hall, look at the Olympic foam pit, the 21m CUC Tower and all the technical stages.`,
    ],
    loading3d: [`Chargement du plan 3D…`, `Loading the 3D map…`],
};

// ---------------------------------------------------------------------------
// 1. Catalogue : ajout du namespace `visiteGuidee` (clés existantes préservées)
// ---------------------------------------------------------------------------
const catalogs = [
    { file: 'messages/fr.json', index: 0 },
    { file: 'messages/en.json', index: 1 },
];

for (const catalog of catalogs) {
    const data = JSON.parse(readFileSync(catalog.file, 'utf8'));
    data.visiteGuidee = data.visiteGuidee || {};
    for (const [key, pair] of Object.entries(COPY)) {
        if (typeof data.visiteGuidee[key] !== 'string') {
            data.visiteGuidee[key] = pair[catalog.index];
        }
    }
    writeFileSync(catalog.file, `${JSON.stringify(data, null, 4)}\n`, 'utf8');
    console.log(`catalogue ${catalog.file} : namespace visiteGuidee synchronise`);
}

// ---------------------------------------------------------------------------
// 2. Composants : littéraux FR → clés de catalogue
// ---------------------------------------------------------------------------
const TARGETS = [
    {
        file: 'src/components/sections/visite/VisiteAccessTransport.tsx',
        edits: [
            {
                from: `} from 'lucide-react';`,
                to: `} from 'lucide-react';\nimport { useTranslations } from 'next-intl';`,
            },
            {
                from: `export const VisiteAccessTransport: React.FC = () => {\n  return (`,
                to: `export const VisiteAccessTransport: React.FC = () => {\n  const t = useTranslations('visiteGuidee');\n  return (`,
            },
            { from: `              ACCÈS ${A}amp; TRANSPORT`, to: `              {t('accessBadge')}` },
            {
                from: `              COMMENT REJOINDRE LE CAMPUS ?`,
                to: `              {t('accessTitle')}`,
            },
            {
                from: `              Situé au cœur de la région Hauts-de-France, le campus est facilement accessible\n              depuis Paris, Lille, Bruxelles ou Londres.`,
                to: `              {t('accessIntro')}`,
            },
            { from: `                    EN VOITURE :`, to: `                    {t('accessCarLabel')}` },
            {
                from: `                  À 2h de Paris par les autoroutes A1 et A26. À 1h de Lille et Valenciennes.\n                  Parking privé sécurisé gratuit sur place pour les stagiaires.`,
                to: `                  {t('accessCarBody')}`,
            },
            { from: `                    EN TRAIN (SNCF) :`, to: `                    {t('accessTrainLabel')}` },
            {
                from: `                  Gare de Le Cateau-Cambrésis (à 5 minutes du campus). Lignes directes depuis\n                  Paris Gare du Nord (via Saint-Quentin ou Cambrai). Navette CUC disponible sur demande.`,
                to: `                  {t('accessTrainBody')}`,
            },
            { from: `                    EN AVION :`, to: `                    {t('accessPlaneLabel')}` },
            {
                from: `                  Aéroports internationaux de Paris CDG (1h45 de route), Lille Lesquin (1h)\n                  ou Charleroi Bruxelles-Sud (1h15).`,
                to: `                  {t('accessPlaneBody')}`,
            },
            { from: `              COORDONNÉES DU DOMAINE`, to: `              {t('coordinatesTitle')}` },
            { from: `                  Adresse postale ${A}amp; Accès :`, to: `                  {t('addressLabel')}` },
            { from: `                    <span>Radar ${A}amp; Itinéraires</span>`, to: `                    <span>{t('mapRadarLabel')}</span>` },
            { from: `                  Standard Admissions :`, to: `                  {t('standardLabel')}` },
            { from: `                Téléphone :{' '}`, to: `                {t('phoneLabel')}{' '}` },
            { from: `                Email :{' '}`, to: `                {t('emailLabel')}{' '}` },
            {
                from: `                  Pôle Île-de-France (Studio Paris) :`,
                to: `                  {t('idfLabel')}`,
            },
            { from: `                Studio de Répétition ${A}amp; Comédiens`, to: `                {t('idfValue')}` },
            {
                from: `                Planifier une Visite ou Réserver un Stage`,
                to: `                {t('accessCta')}`,
            },
        ],
    },
    {
        file: 'src/app/(site)/[locale]/visite-guidee/page.tsx',
        edits: [
            {
                from: `import React, { useState } from 'react';`,
                to: `import React, { useState } from 'react';\nimport { useTranslations } from 'next-intl';`,
            },
            {
                from: `/**
 * Attente du plan 3D`,
                to: `const PLACEHOLDER_NEVER_MATCHES`,
                optional: true,
            },
            {
                from: `          Chargement du plan 3D…`,
                to: `          {t('loading3d')}`,
            },
            {
                from: `export default function VisiteGuideePage() {\n  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);`,
                to: `export default function VisiteGuideePage() {\n  const t = useTranslations('visiteGuidee');\n  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);`,
            },
            { from: `                    TOPOGRAPHIE SPATIALE 3D`, to: `                    {t('tour3dBadge')}` },
            {
                from: `                  PLAN 3D INTERACTIF <span className="text-[#FFE500]">DU CAMPUS</span>`,
                to: `                  {t('tour3dTitle')} <span className="text-[#FFE500]">{t('tour3dTitleAccent')}</span>`,
            },
            {
                from: `                  Faites pivoter la vue aérienne, explorez les 9 infrastructures en\n                  trois dimensions, et sélectionnez une zone pour découvrir ses\n                  installations spécialisées.`,
                to: `                  {t('tour3dParagraph')}`,
            },
            { from: `                  EXPÉRIENCE 360°`, to: `                  {t('tour360Badge')}` },
            {
                from: `                  VISITE VIRTUELLE <span className="text-[#FFE500]">360° DU CAMPUS</span>`,
                to: `                  {t('tour360Title')} <span className="text-[#FFE500]">{t('tour360TitleAccent')}</span>`,
            },
            {
                from: `                  Explorez le domaine en immersion totale : naviguez librement\n                  dans le Zoé Bell Hall, observez la fosse olympique à cubes, la\n                  Tour CUC de 21m et l${P}ensemble des plateaux techniques.`,
                to: `                  {t('tour360Paragraph')}`,
            },
        ],
    },
];

const results = [];
for (const target of TARGETS) {
    let source = readFileSync(target.file, 'utf8');
    for (const edit of target.edits) {
        if (edit.optional && !source.includes(edit.from)) continue;
        if (!source.includes(edit.from)) {
            results.push(`ABSENT  ${target.file} :: ${edit.from.trim().slice(0, 60)}`);
            continue;
        }
        source = source.replace(edit.from, edit.to);
        results.push(`OK      ${target.file} :: ${edit.from.trim().slice(0, 60)}`);
    }
    writeFileSync(target.file, source, 'utf8');
}

console.log(results.join('\n'));
if (results.some((line) => line.startsWith('ABSENT'))) process.exitCode = 2;
