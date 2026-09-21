#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Correctif ponctuel : visite 360° (`VirtualTourViewer` + page publique)
 * ==============================================================================
 * Remplace les libellés français en dur de la visionneuse 360° et de la page
 * `/visite-virtuelle` par la copie du catalogue `visiteVirtuelle`.
 *
 * Ancres construites avec des échappements (`\x26`, `\x27`) pour rester exactes
 * malgré le décodage des entités HTML par les outils d'édition.
 *
 * Idempotent : une ancre déjà remplacée est simplement signalée comme absente.
 * Historique : exécuté une fois lors de la migration i18n (juin 2026).
 * ==============================================================================
 */
import { readFileSync, writeFileSync } from 'node:fs';

const AMP = '\x26'; // &
const APO = '\x27'; // '

const TARGETS = [
    {
        file: 'src/components/ui/VirtualTourViewer.tsx',
        edits: [
            {
                from: `} from 'lucide-react';`,
                to: `} from 'lucide-react';\nimport { useTranslations } from 'next-intl';`,
            },
            {
                from: `}) => {\n  const containerRef = useRef<HTMLDivElement>(null);`,
                to: `}) => {\n  const t = useTranslations('visiteVirtuelle');\n  const containerRef = useRef<HTMLDivElement>(null);`,
            },
            {
                from: `            VISITE VIRTUELLE 360° INTERACTIVE`,
                to: `            {t('viewerTitle')}`,
            },
            {
                from: `            title="Aide de navigation"`,
                to: `            title={t('helpTitle')}`,
            },
            {
                from: `            <span className="hidden md:inline">Mode d${APO}emploi</span>`,
                to: `            <span className="hidden md:inline">{t('helpLabel')}</span>`,
            },
            {
                from: `            title="Réinitialiser la visite à l${APO}entrée"`,
                to: `            title={t('resetTitle')}`,
            },
            {
                from: `            <span className="hidden sm:inline">Réinitialiser</span>`,
                to: `            <span className="hidden sm:inline">{t('resetLabel')}</span>`,
            },
            {
                from: `            title="Ouvrir en plein écran dans un nouvel onglet / Casque VR"`,
                to: `            title={t('openTabTitle')}`,
            },
            {
                from: `            <span className="hidden lg:inline">Ouvrir dans un onglet</span>`,
                to: `            <span className="hidden lg:inline">{t('openTabLabel')}</span>`,
            },
            {
                from: `            title={isFullscreen ? "Quitter le plein écran" : "Plein écran immersif"}`,
                to: `            title={isFullscreen ? t('exitFullscreenTitle') : t('fullscreenTitle')}`,
            },
            {
                from: `                <span>RÉDUIRE</span>`,
                to: `                <span>{t('collapseLabel')}</span>`,
            },
            {
                from: `                <span>PLEIN ÉCRAN</span>`,
                to: `                <span>{t('fullscreenLabel')}</span>`,
            },
            {
                from: `              <strong className="text-white">Navigation 360° :</strong> Cliquez et faites glisser votre curseur (ou votre doigt sur mobile) pour regarder autour de vous. Cliquez sur les <span className="text-[#FFE500] font-semibold">flèches clignotantes au sol</span> pour avancer d${APO}une pièce à l${APO}autre.`,
                to: `              <strong className="text-white">{t('navHelpTitle')}</strong> {t('navHelpBody1')}{' '}\n              <span className="text-[#FFE500] font-semibold">{t('navHelpHighlight')}</span>{' '}\n              {t('navHelpBody2')}`,
            },
            {
                from: `            [MASQUER]`,
                to: `            {t('hideLabel')}`,
            },
            {
                from: `          title="Visite Virtuelle 360° Campus Univers Cascades"`,
                to: `          title={t('iframeTitle')}`,
            },
        ],
    },
    {
        file: 'src/app/(site)/[locale]/visite-virtuelle/page.tsx',
        edits: [
            {
                from: `import { soundFX } from '@/lib/soundFx';`,
                to: `import { soundFX } from '@/lib/soundFx';\nimport { useTranslations } from 'next-intl';`,
            },
            {
                from: `export default function VisiteVirtuellePage() {\n  const [activeTab, setActiveTab] = useState<'360' | '3d'>('360');`,
                to: `export default function VisiteVirtuellePage() {\n  const t = useTranslations('visiteVirtuelle');\n  const [activeTab, setActiveTab] = useState<'360' | '3d'>('360');`,
            },
            {
                from: `          Chargement du plan 3D…`,
                to: `          {t('loading3d')}`,
            },
            {
                from: `              ACCUEIL`,
                to: `              {t('breadcrumbHome')}`,
            },
            {
                from: `              LE CAMPUS`,
                to: `              {t('breadcrumbCampus')}`,
            },
            {
                from: `              {activeTab === '360' ? 'VISITE VIRTUELLE 360°' : 'PLAN 3D DU DOMAINE'}`,
                to: `              {activeTab === '360' ? t('breadcrumb360') : t('breadcrumb3d')}`,
            },
            {
                from: `                  VISITE DU DOMAINE`,
                to: `                  {t('pageTag')}`,
            },
            {
                from: `                DÉCOUVRIR LE CAMPUS <span className="text-[#FFE500]">{activeTab === '360' ? 'EN 360°' : 'EN 3D'}</span>`,
                to: `                {t('pageTitle')} <span className="text-[#FFE500]">{activeTab === '360' ? t('suffix360') : t('suffix3d')}</span>`,
            },
            {
                from: `                Explorez les infrastructures du centre de formation de cascadeurs au Cateau-Cambrésis.\n                Basculez librement entre les panoramas 360° et le plan 3D interactif du domaine.`,
                to: `                {t('pageSubtitle')}`,
            },
            {
                from: `                  <span>Vue 360° VR</span>`,
                to: `                  <span>{t('tab360Label')}</span>`,
            },
            {
                from: `                  <span>Plan 3D</span>`,
                to: `                  <span>{t('tab3dLabel')}</span>`,
            },
            {
                from: `                  Prendre Rendez-vous`,
                to: `                  {t('ctaRendezVous')}`,
            },
            {
                from: `                    11 000 m² d${APO}Infrastructures`,
                to: `                    {t('factsTitle1')}`,
            },
            {
                from: `                  Tour de saut de 21 mètres, salle d${APO}entraînement Zoé Bell, dojos,\n                  manège équestre et hangars de cascades mécaniques réunis sur un même domaine privé.`,
                to: `                  {t('factsBody1')}`,
            },
            {
                from: `                    Sécurité ${AMP} Équipements`,
                to: `                    {t('factsTitle2')}`,
            },
            {
                from: `                  Matériel professionnel de cascade aux normes en vigueur : matelas de réception certifiés,\n                  airbags de saut, trampolines et fosse de travail.`,
                to: `                  {t('factsBody2')}`,
            },
            {
                from: `                    Accès ${AMP} Hébergement`,
                to: `                    {t('factsTitle3')}`,
            },
            {
                from: `                  Situé au Cateau-Cambrésis (à 2h de Paris, 1h de Lille). Possibilité d${APO}hébergement\n                  sur site en pension complète pour les élèves en formation et stages.`,
                to: `                  {t('factsBody3')}`,
            },
        ],
    },
];

let total = 0;
let applied = 0;
const missing = [];

for (const target of TARGETS) {
    let source = readFileSync(target.file, 'utf8');
    for (const edit of target.edits) {
        total += 1;
        if (!source.includes(edit.from)) {
            missing.push(`${target.file} :: ${edit.from.trim().slice(0, 60)}`);
            continue;
        }
        source = source.replace(edit.from, edit.to);
        applied += 1;
    }
    writeFileSync(target.file, source, 'utf8');
}

console.log(`${applied}/${total} remplacement(s) appliqué(s).`);
if (missing.length) {
    console.warn('Ancres introuvables :');
    for (const anchor of missing) console.warn(`  - ${anchor}`);
    process.exitCode = 2;
}
