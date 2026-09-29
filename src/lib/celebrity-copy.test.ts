/**
 * Tests de la description courte des vignettes de comédiens doublés.
 *
 * La vignette ne doit jamais inventer de contenu : la spécialité publiée prime,
 * sinon la première phrase de la biographie vérifiée est restituée telle quelle.
 * Ces cas verrouillent la priorité, la normalisation et la troncature.
 *
 * Aucun import de `vitest` : `globals: true` est activé dans la configuration
 * du dépôt (cf. `src/lib/celebrity-double.test.ts`).
 */
import {
    CELEBRITY_SHORT_DESCRIPTION_MAX_LENGTH,
    shortActorDescription,
} from './celebrity-copy';

describe('shortActorDescription', () => {
    it('privilégie la spécialité éditoriale quand elle est publiée', () => {
        expect(
            shortActorDescription({
                specialty: 'Combats chorégraphiés, cascades physiques et poursuites.',
                bio: 'Biographie bien plus longue. Deuxième phrase.',
            })
        ).toBe('Combats chorégraphiés, cascades physiques et poursuites.');
    });

    it('retombe sur la première phrase de la biographie', () => {
        expect(
            shortActorDescription({
                bio: "Acteur majeur du cinéma d'action. Il enchaîne ensuite les tournages.",
            })
        ).toBe("Acteur majeur du cinéma d'action.");
    });

    it('normalise les espaces et les sauts de ligne', () => {
        expect(shortActorDescription({ bio: '  Champion   de France\njunior.  Suite.  ' })).toBe(
            'Champion de France junior.'
        );
    });

    it('tronque à la fin du dernier mot complet sans dépasser le plafond', () => {
        const result = shortActorDescription({ bio: `${'cascade '.repeat(30)}poursuite.` });

        expect(result.endsWith('…')).toBe(true);
        expect(result.length).toBeLessThanOrEqual(CELEBRITY_SHORT_DESCRIPTION_MAX_LENGTH);
        // Aucun mot coupé : le texte conservé ne se termine pas par un espace.
        expect(result.slice(0, -1).endsWith(' ')).toBe(false);
    });

    it('retourne une chaîne vide sans matière éditoriale', () => {
        expect(shortActorDescription({})).toBe('');
        expect(shortActorDescription({ specialty: '   ', bio: '\n  ' })).toBe('');
    });
});
