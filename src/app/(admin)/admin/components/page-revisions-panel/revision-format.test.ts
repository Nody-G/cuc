import { describe, it, expect } from 'vitest';
import { formatFieldLabel, summarizeValue } from './revision-format';

describe('formatFieldLabel', () => {
    it('traduit les champs racines', () => {
        expect(formatFieldLabel('title')).toBe('Titre de la page');
        expect(formatFieldLabel('meta_description')).toBe('Balise Meta Description (SEO)');
        expect(formatFieldLabel('sections')).toBe('Chiffres clés & Indicateurs');
    });

    it('traduit les sous-champs du hero', () => {
        expect(formatFieldLabel('hero.title')).toBe('Hero › Titre principal');
        expect(formatFieldLabel('hero.subtitle')).toBe('Hero › Sous-titre');
        expect(formatFieldLabel('hero.badge')).toBe('Hero › Badge / Surtitre');
        expect(formatFieldLabel('hero.bg_image')).toBe('Hero › Image d’arrière-plan');
        expect(formatFieldLabel('hero.cta_primary_text')).toBe('Hero › Bouton principal (texte)');
    });

    it('traduit les indicateurs chiffrés par index', () => {
        expect(formatFieldLabel('sections[0].value')).toBe('Indicateur #1 › Chiffre / Valeur');
        expect(formatFieldLabel('sections[2].title')).toBe('Indicateur #3 › Intitulé');
        expect(formatFieldLabel('sections[3].description')).toBe('Indicateur #4 › Sous-texte descriptif');
        expect(formatFieldLabel('sections[1]')).toBe('Indicateur #2 (Chiffre clé)');
    });

    it('traduit les sections de contenu spécialisées', () => {
        expect(formatFieldLabel('sections_data.about.title')).toBe('Section « À propos » › Titre');
        expect(formatFieldLabel('sections_data.story.description')).toBe('Section « Notre Histoire » › Description');
        expect(formatFieldLabel('sections_data.campus.content')).toBe('Section « Campus & Équipements » › Corps de texte');
    });

    it('retourne le champ brut si non reconnu', () => {
        expect(formatFieldLabel('custom_unknown_field')).toBe('custom_unknown_field');
    });
});

describe('summarizeValue', () => {
    it('ne renvoie JAMAIS "Objet modifié"', () => {
        const dummyObj = { title: 'Titre de test', subtitle: 'Sous-titre' };
        expect(summarizeValue(dummyObj)).not.toContain('Objet modifié');
    });

    it('gère les valeurs nulles et booléennes', () => {
        expect(summarizeValue(null)).toBe('—');
        expect(summarizeValue(undefined)).toBe('—');
        expect(summarizeValue(true)).toBe('Oui');
        expect(summarizeValue(false)).toBe('Non');
    });

    it('gère les chaînes et les nombres', () => {
        expect(summarizeValue('Bonjour')).toBe('Bonjour');
        expect(summarizeValue('')).toBe('(vide)');
        expect(summarizeValue('   ')).toBe('(vide)');
        expect(summarizeValue(42)).toBe('42');
    });

    it('résume les indicateurs proprement', () => {
        const indicator = { value: '150+', title: 'Productions cinéma' };
        expect(summarizeValue(indicator)).toBe('150+ — Productions cinéma');
    });

    it('résume les tableaux proprement', () => {
        expect(summarizeValue([])).toBe('(aucun élément)');
        expect(summarizeValue(['Action', 'Cascades'])).toBe('2 élém. : [Action, Cascades]');
    });

    it('résume les objets génériques en affichant leurs clés et valeurs', () => {
        const obj = { theme: 'dark', count: 5 };
        expect(summarizeValue(obj)).toBe('{ theme: "dark", count: 5 }');
    });
});
