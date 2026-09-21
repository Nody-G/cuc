#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Correctif ponctuel du repli FR de `EventsPillarsSection`
 * ==============================================================================
 * Les blocs de repli (spectacles, animations, team building) de la page
 * `/cuc-events-agence` portaient leur copie en dur. Ce script remplace ces
 * littéraux par la copie du catalogue (`eventsAgence.pillars[n]`).
 *
 * Pourquoi un script plutôt qu'une édition manuelle : les ancres contiennent des
 * entités HTML (`&`, `'`) que les outils d'édition décodent avant écriture,
 * ce qui rend le remplacement exact impossible. Ici les motifs sont construits
 * avec des échappements (`\x26`, `\x27`) — le fichier n'est donc jamais ambigu.
 *
 * Idempotent : si une ancre n'est plus présente, elle est signalée et ignorée.
 * Historique : exécuté une fois lors de la migration i18n (juin 2026).
 * ==============================================================================
 */
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = 'src/components/sections/events/EventsPillarsSection.tsx';
const AMP = '\x26'; // &
const APO = '\x27'; // '

const EDITS = [
    // --- Bloc 1 : Spectacles -------------------------------------------------
    {
        from: `                      PRESTATIONS ${AMP}amp; SHOWS EN DIRECT`,
        to: `                      {pillars[0].tag}`,
    },
    {
        from: `                      SPECTACLES DE CASCADES`,
        to: `                      {pillars[0].title}`,
    },
    {
        from: `                    Vous souhaitez dynamiser votre événement avec un spectacle percutant ? Le Campus Univers Cascades met à votre disposition son savoir-faire et ses équipes de cascadeurs professionnels pour créer des shows vivants sur-mesure.`,
        to: `                    {pillars[0].paragraph1}`,
    },
    {
        from: `                    Combats chorégraphiés médiévaux, contemporains ou fantastiques, chutes de hauteur spectaculaires, cascades pyrotechniques (torches humaines), nos créations s${AMP}apos;adaptent à toutes les contraintes techniques et scéniques.`,
        to: `                    {pillars[0].paragraph2}`,
    },
    {
        from: `                        En savoir plus sur nos Spectacles`,
        to: `                        {pillars[0].cta}`,
    },
    {
        from: `                    alt="Photo Spectacle CUC Events"`,
        to: `                    alt={pillars[0].imageAlt}`,
    },
    // --- Bloc 3 : Team building ---------------------------------------------
    {
        from: `                      SÉMINAIRES ${AMP}amp; IMMERSION ENTREPRISE`,
        to: `                      {pillars[2].tag}`,
    },
    {
        from: `                      TEAM BUILDING CINÉMA D${AMP}apos;ACTION`,
        to: `                      {pillars[2].title}`,
    },
    {
        from: `                    Fédérez vos équipes lors d${AMP}apos;un séminaire d${AMP}apos;action inoubliable au cœur du domaine du CUC au Cateau-Cambrésis.`,
        to: `                    {pillars[2].paragraph1}`,
    },
    {
        from: `                    Atelier cinéma indoor, cascades physiques, cascades de feu sécurisées, tournage d${AMP}apos;une fausse bande-annonce d${AMP}apos;action : vos collaborateurs dépassent leurs limites dans un esprit de camaraderie et de bienveillance totale. Capacité d${AMP}apos;accueil jusqu${AMP}apos;à 90 personnes avec hébergement et restauration sur site.`,
        to: `                    {pillars[2].paragraph2}`,
    },
    {
        from: `                        Organiser un Team Building`,
        to: `                        {pillars[2].cta}`,
    },
    {
        from: `                    alt="Atelier Cinéma Indoor Team Building"`,
        to: `                    alt={pillars[2].imageAlt}`,
    },
];

let source = readFileSync(FILE, 'utf8');
let applied = 0;
const missing = [];

for (const edit of EDITS) {
    if (!source.includes(edit.from)) {
        missing.push(edit.from.trim().slice(0, 60));
        continue;
    }
    source = source.replace(edit.from, edit.to);
    applied += 1;
}

writeFileSync(FILE, source, 'utf8');

console.log(`${applied}/${EDITS.length} remplacement(s) appliqué(s) dans ${FILE}.`);
if (missing.length) {
    console.warn('Ancres introuvables :');
    for (const anchor of missing) console.warn(`  - ${anchor}`);
    process.exitCode = 2;
}
