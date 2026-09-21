#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Semis des traductions EN (table `site_translations`)
 * ==============================================================================
 * Rédaction éditoriale sobre et factuelle (doctrine « zéro AI slop »).
 * Upsert idempotent sur la contrainte unique (entity, entity_id, locale).
 * Les liens de CTA restent des routes FR : le composant `Link` de next-intl les
 * préfixe automatiquement en `/en/...` selon la locale active.
 *
 * Usage :
 *   node scripts/seed_site_translations_en.mjs --dry
 *   node scripts/seed_site_translations_en.mjs
 * ==============================================================================
 */
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
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

const page = (entity_id, payload) => ({ entity: 'page', entity_id, locale: 'en', payload });

const ROWS = [
    page('/', {
        title: 'Home',
        meta_title: "Campus Univers Cascades | Europe's Leading Professional Stunt School",
        meta_description:
            'Professional stunt training centre founded in 2008 by Lucas Dollfus. Dedicated facilities for action cinema, parkour, fight choreography and stunts.',
        hero: {
            badge: 'LEADING EUROPEAN CENTRE • ACTION DESIGN & FILM STUNTS',
            title: 'CAMPUS UNIVERS CASCADES',
            subtitle:
                "Europe's largest training centre for professional film stunt performers, serving the international action film industry.",
            cta_primary_text: 'Explore the professional programme',
            cta_secondary_text: 'Guided campus tour',
        },
    }),
    page('formation-de-cascadeur', {
        title: 'Professional Programme',
        meta_title: 'Two-Year Professional Stunt Programme | Campus Univers Cascades',
        meta_description:
            'A two-year, 720 to 800-hour programme covering the full range of physical and film stunt disciplines.',
        hero: {
            badge: 'PROFESSIONAL TRAINING • 2 YEARS',
            title: 'PROFESSIONAL STUNT TRAINING',
            subtitle:
                'A two-year, 720 to 800-hour programme covering the full range of physical and film stunt disciplines.',
            cta_primary_text: 'Apply for selection',
            cta_secondary_text: 'Download the brochure',
        },
    }),
    page('stages-cascades-parkour-2', {
        title: 'Workshops & Introductions',
        meta_title: 'Stunt & Parkour Workshops | Campus Univers Cascades',
        meta_description:
            'From the 12-day immersion workshop to intensive weekends, train in film stunts under strict safety conditions.',
        hero: {
            badge: 'INTENSIVE WORKSHOPS, ALL LEVELS • FROM 16',
            title: 'STUNT & PARKOUR WORKSHOPS',
            subtitle:
                'From the 12-day immersion workshop to intensive weekends, experience film stunt training under strict safety conditions.',
            cta_primary_text: 'See upcoming dates',
            cta_secondary_text: 'Booking details',
        },
    }),
    page('stunt-workshop-cuc', {
        title: 'International Stunt Workshop',
        meta_title: 'International Stunt Workshop | Campus Univers Cascades',
        meta_description:
            'A two-week international stunt workshop at the CUC, gathering performers from the USA, UK, Europe and Australia.',
        hero: {
            badge: 'INTERNATIONAL WORKSHOP • ENGLISH & FRENCH',
            title: 'INTERNATIONAL STUNT WORKSHOP',
            subtitle:
                'Join stunt performers from around the world (USA, UK, Europe, Australia) for two weeks of full immersion at the CUC.',
            cta_primary_text: 'Apply for next session',
            cta_secondary_text: 'Inquire & information',
        },
    }),
    page('visite-guidee', {
        title: 'The Campus',
        meta_title: 'The Campus — Facilities & Infrastructure | CUC',
        meta_description:
            'Explore the CUC facilities: 21 m jump tower, 1,300 m² covered hangars, dojo, reception pit and trainee accommodation.',
        hero: {
            badge: 'TRAINING FACILITIES',
            title: 'THE CAMPUS',
            subtitle:
                'Discover the CUC facilities: 21 m jump tower, 1,300 m² covered hangars, reception pit, dojos, equestrian ring, 90-bed accommodation and a Paris-area rehearsal studio.',
            cta_primary_text: 'Facilities',
            cta_secondary_text: '360° tour',
        },
    }),
    page('visite-virtuelle', {
        title: '360° Virtual Tour',
        meta_title: '360° Virtual Tour & 3D Campus Map | CUC',
        meta_description:
            'Explore the CUC facilities in 360° immersion or via the interactive 3D map.',
        hero: {
            badge: '360° IMMERSION & 3D MAP',
            title: 'DISCOVER THE CAMPUS',
            subtitle:
                'Explore our 11,000 m² of facilities: fall pit, dojos, rigging hangars and 21-metre jump tower.',
            cta_primary_text: '360° virtual tour',
            cta_secondary_text: 'Interactive 3D map',
        },
    }),
    page('equipe-cascadeurs-pro', {
        title: 'The Team',
        meta_title: 'The Team | Film Coaches & Professionals — Campus Univers Cascades',
        meta_description:
            'Stunt coordinators, Yamakasi pioneers and working film professionals who train CUC students.',
        hero: {
            badge: 'FILM COACHES & PROFESSIONALS',
            title: 'THE TEAM',
            subtitle:
                'Stunt coordinators, Yamakasi pioneers and working film professionals who train CUC students every day.',
            cta_primary_text: 'Explore the professional programme',
            cta_secondary_text: 'Get in touch',
        },
    }),
    page('cuc-team-cascadeur', {
        title: 'Productions',
        meta_title: 'Productions | CUC Stunt Team & Stunt Coordination',
        meta_description:
            'CUC Stunt Team supports film and TV productions with a pool of over 200 certified stunt performers.',
        hero: {
            badge: 'STUNT COORDINATION • FILM',
            title: 'PRODUCTIONS',
            subtitle:
                'Campus Univers Cascades and CUC Stunt Team support productions with a pool of more than 200 certified stunt performers.',
            cta_primary_text: 'Contact the production team',
            cta_secondary_text: 'See the posters',
        },
    }),
    page('videos-cascadeur', {
        title: 'Video Library',
        meta_title: 'TV Reports & Stunt Videos | Campus Univers Cascades',
        meta_description:
            'Behind the scenes of stunt training in TF1 and France 2 reports, plus CUC showreels.',
        hero: {
            badge: 'TV REPORTS • TF1 8PM NEWS • FRANCE 2',
            title: 'CUC REPORTS & VIDEOS',
            subtitle:
                'Go behind the scenes of stunt training with reports from TF1 and France 2, plus Campus Univers Cascades showreels.',
            cta_primary_text: 'TF1 report (8pm news)',
            cta_secondary_text: 'France 2 report',
        },
    }),
    page('contact-cuc', {
        title: 'Contact & Projects',
        meta_title: 'Contact & Projects | Campus Univers Cascades',
        meta_description:
            'Film productions, action design, professional training, workshops or corporate events: get in touch directly with the CUC teams.',
        hero: {
            badge: 'CONTACT & ADMISSIONS',
            title: 'CONTACT & PROJECTS',
            subtitle:
                'Film productions, action design, professional training, workshops or corporate events: talk directly with the CUC teams.',
            cta_primary_text: 'Send a message',
            cta_secondary_text: 'Getting to the campus',
        },
    }),
    page('partenaires', {
        title: 'Partners',
        meta_title: 'Partners, Studios & Equipment Suppliers | CUC',
        meta_description:
            'Brands, manufacturers and institutions in equipment, protection and training who support the CUC.',
        hero: {
            badge: 'SUPPORTING US • BRANDS & INSTITUTIONS',
            title: 'OUR PARTNERS',
            subtitle:
                'Campus Univers Cascades works with recognised brands, manufacturers and institutions in equipment, protection and training.',
            cta_primary_text: 'Become a partner',
            cta_secondary_text: 'See certifications',
        },
    }),
    page('cuc-events-agence', {
        title: 'CUC Events Agency',
        meta_title: 'CUC Events | Live Show & Stunt Agency',
        meta_description:
            'Turnkey action shows for festivals, brand launches, theme parks and corporate events, staged by CUC professional stunt performers.',
        hero: {
            badge: 'ACTION EVENTS AGENCY • TURNKEY SHOWS',
            title: 'CUC EVENTS: SHOWS & ANIMATIONS',
            subtitle:
                'Make an impression at your festivals, brand launches, theme parks or corporate seminars with spectacular action shows.',
            cta_primary_text: 'Request an events quote',
            cta_secondary_text: 'Watch our show videos',
        },
    }),
    page('spectacles-cascadeurs-yamakasi', {
        title: 'Yamakasi Shows',
        meta_title: 'Stunt Shows & Yamakasi Performances | CUC Events',
        meta_description:
            'Live stunt shows combining Yamakasi urban acrobatics, choreographed fights and pyrotechnics.',
        hero: {
            badge: 'CINEMA ON STAGE • TURNKEY SHOWS',
            title: 'STUNT & YAMAKASI SHOWS',
            subtitle:
                'Live performances combining Yamakasi urban acrobatics, choreographed fights, pyrotechnics and high-precision stunts.',
            cta_primary_text: 'Book a show',
            cta_secondary_text: 'Watch show videos',
        },
    }),
    page('team-building-cascades', {
        title: 'Team Building',
        meta_title: 'Film & Stunt Team Building | CUC Events',
        meta_description:
            'Corporate team building: film stunts, voice dubbing and physical stunt activities supervised by professionals.',
        hero: {
            badge: 'SEMINARS & COMPANIES • TEAM COHESION',
            title: 'EXCEPTIONAL TEAM BUILDING',
            subtitle:
                'Give your teams a unifying experience: film stunts, voice dubbing and physical stunt activities supervised by professionals.',
            cta_primary_text: 'Request a seminar quote',
            cta_secondary_text: 'All CUC Events offers',
        },
    }),
    page('animations-airbag-parkour', {
        title: 'Airbag Activities',
        meta_title: 'Giant Airbag Free-Fall & Parkour Animation | CUC Events',
        meta_description:
            'Giant cinema airbag free-fall and parkour animation, supervised by professional stunt performers.',
        hero: {
            badge: 'CINEMA AIRBAG • PROFESSIONAL SUPERVISION',
            title: 'AIRBAG & PARKOUR ANIMATION',
            subtitle:
                'Let the public experience the unique sensation of free fall onto a giant cinema air cushion in a fully supervised, safe setting.',
            cta_primary_text: 'Request an airbag animation',
            cta_secondary_text: 'All CUC Events offers',
        },
    }),

    // --- Menu de navigation (libellés) ------------------------------------------
    {
        entity: 'navigation',
        entity_id: 'main',
        locale: 'en',
        payload: {
            labels: {
                home: 'HOME',
                campus: 'THE CAMPUS',
                formations: 'STAGES & TRAINING',
                'formation-pro': 'PROFESSIONAL PROGRAMME',
                'stages-sejours': 'STAGES & CAMPS',
                workshop: 'WORKSHOP',
                tournages: 'PRODUCTIONS',
                equipe: 'THE TEAM',
                events: 'EVENTS',
                'cuc-events-agence': 'CUC EVENTS AGENCY',
                'spectacles-yamakasi': 'YAMAKASI SHOWS',
                'animations-airbag': 'AIRBAG ANIMATION',
                'team-building': 'TEAM BUILDING',
                videos: 'VIDEOS',
                partenaires: 'PARTNERS',
                boutique: 'SHOP',
                contact: 'CONTACT',
                cta: 'Contact & Projects',
            },
        },
    },

    // --- Pied de page (libellés) -------------------------------------------------
    {
        entity: 'footer',
        entity_id: 'main',
        locale: 'en',
        payload: {
            labels: {
                formations: 'Training',
                'formation-pro-2ans': 'Two-Year Pro Programme',
                'formule-decouverte': 'Discovery Programme (12 days)',
                'stages-weekend': 'Weekend Workshops (€250)',
                afdas: 'AFDAS funding',
                'workshop-international': 'International Workshop',
                campus: 'The Campus',
                'visite-guidee-campus': 'Guided Campus Tour',
                'visite-virtuelle-360': '360° Virtual Tour',
                'zoe-bell-hall': 'Zoé Bell Hall & Pit',
                'cuc-tower': 'CUC Tower',
                dojos: 'Combat Dojos',
                equipe: 'The Team',
                'equipe-cascadeurs': 'Stunt Team',
                videos: 'Videos & Demos',
                tournages: 'Productions',
                'cuc-team': 'CUC Team & Action Design',
                partenaires: 'Partners & Studios',
                contact: 'Contact & Access',
                'contact-cuc': 'Contact & Projects',
                'carte-acces': 'Map & Access',
                boutique: 'Official Shop',
            },
        },
    },
];

for (const row of ROWS) {
    console.log(`${DRY ? '[dry] ' : ''}${row.entity}/${row.entity_id} (${row.locale})`);
    if (DRY) continue;

    const res = await fetch(
        `${URL_BASE}/rest/v1/site_translations?on_conflict=entity,entity_id,locale`,
        {
            method: 'POST',
            headers: { ...HEADERS, Prefer: 'resolution=merge-duplicates,return=minimal' },
            body: JSON.stringify({ ...row, is_published: true }),
        }
    );
    if (!res.ok) {
        console.error(`❌ ${row.entity}/${row.entity_id} → ${res.status} ${await res.text()}`);
        process.exit(2);
    }
}

console.log(`\n${DRY ? 'DRY-RUN' : 'APPLIQUÉ'} — ${ROWS.length} traduction(s) EN.\n`);
