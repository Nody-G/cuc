import { DoubledCelebrity } from '@/types';

/**
 * Comédiens doublés — données factuelles uniquement.
 *
 * Les champs de segmentation marketing (`roleType`, `highlightTag`) ont été
 * retirés : c'étaient des étiquettes publicitaires, affichées nulle part et
 * sans valeur de preuve. Chaque fiche reste adossée à ce qui est vérifiable :
 * le comédien, ses productions, la doublure éventuellement renseignée et son
 * profil IMDb.
 */
export const DOUBLED_CELEBRITIES: DoubledCelebrity[] = [
  {
    id: 'tomer-sisley',
    name: 'Tomer Sisley',
    photo: '/images/actors/tomer-sisley.jpg',
    productions: ['Largo Winch', 'Largo Winch : Le Prix de l\'argent', 'Balthazar'],
    stuntSpecialty: 'Combats chorégraphiés, cascades physiques et poursuites.',
    stuntDoubles: 'Doublé par Vincent Bouillon',
    imdbUrl: 'https://www.imdb.com/name/nm0803037/',
  },
  {
    id: 'keanu-reeves',
    name: 'Keanu Reeves',
    photo: '/images/actors/keanu-reeves.jpg',
    productions: ['John Wick : Chapitre 4'],
    stuntSpecialty: 'Chute des 222 marches du Sacré-Cœur à Paris (Taurus World Stunt Award 2024).',
    stuntDoubles: 'Doublé par Vincent Bouillon',
    imdbUrl: 'https://www.imdb.com/name/nm0000206/',
  },
  {
    id: 'jean-dujardin',
    name: 'Jean Dujardin',
    photo: '/images/actors/jean-dujardin.jpg',
    productions: ['OSS 117 : Alerte rouge en Afrique noire'],
    stuntSpecialty: 'Cascades physiques et combats chorégraphiés.',
    stuntDoubles: 'Doublé par Vincent Bouillon',
    imdbUrl: 'https://www.imdb.com/name/nm0241121/',
  },
  {
    id: 'pierre-niney',
    name: 'Pierre Niney',
    photo: '/images/actors/pierre-niney.jpg',
    productions: ['Le Comte de Monte-Cristo'],
    stuntSpecialty: 'Duels à l\'épée et cascades physiques réglés avec les régleurs CUC.',
    stuntDoubles: '',
    imdbUrl: 'https://www.imdb.com/name/nm2582755/',
  },
  {
    id: 'francois-civil',
    name: 'François Civil',
    photo: '/images/actors/francois-civil.jpg',
    productions: ['L\'Amour Ouf', 'Bac Nord'],
    stuntSpecialty: 'Combats rapprochés et cascades physiques.',
    stuntDoubles: '',
    imdbUrl: 'https://www.imdb.com/name/nm2476624/',
  },
  {
    id: 'roschdy-zem',
    name: 'Roschdy Zem',
    photo: '/images/actors/roschdy-zem.jpg',
    productions: ['Elyas'],
    stuntSpecialty: 'Combats rapprochés et fusillades tactiques.',
    stuntDoubles: '',
    imdbUrl: 'https://www.imdb.com/name/nm0954704/',
  },
  {
    id: 'omar-sy',
    name: 'Omar Sy',
    photo: '/images/actors/omar-sy.jpg',
    productions: ['The Killer', 'Lupin'],
    stuntSpecialty: 'Cascades physiques et affrontements armés.',
    stuntDoubles: '',
    imdbUrl: 'https://www.imdb.com/name/nm1082477/',
  },
  {
    id: 'gilles-lellouche',
    name: 'Gilles Lellouche',
    photo: '/images/actors/gilles-lellouche.jpg',
    productions: ['Bac Nord', 'L\'Amour Ouf'],
    stuntSpecialty: 'Cascades physiques et poursuites urbaines.',
    stuntDoubles: '',
    imdbUrl: 'https://www.imdb.com/name/nm0500976/',
  },
  {
    id: 'kevin-costner',
    name: 'Kevin Costner',
    photo: '/images/actors/kevin-costner.jpg',
    productions: ['3 Days to Kill'],
    stuntSpecialty: 'Cascades physiques et poursuites lors du tournage parisien.',
    stuntDoubles: '',
    imdbUrl: 'https://www.imdb.com/name/nm0000126/',
  },
  {
    id: 'vincent-cassel',
    name: 'Vincent Cassel',
    photo: '/images/actors/vincent-cassel.jpg',
    productions: ['Jason Bourne', 'Mesrine'],
    stuntSpecialty: 'Combats et cascades physiques.',
    stuntDoubles: '',
    imdbUrl: 'https://www.imdb.com/name/nm0001993/',
  },
  {
    id: 'jean-reno',
    name: 'Jean Reno',
    photo: '/images/actors/jean-reno.jpg',
    productions: ['Antigang'],
    stuntSpecialty: 'Cascades physiques et affrontements armés.',
    stuntDoubles: '',
    imdbUrl: 'https://www.imdb.com/name/nm0000606/',
  },
];
