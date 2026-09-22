import {
    canRedoHistory,
    canUndoHistory,
    createDraftHistory,
    DRAFT_HISTORY_LIMIT,
    pushHistory,
    redoHistory,
    resetHistory,
    undoHistory,
} from './draft-history';

/**
 * Garde-fous de l'historique du brouillon (undo / redo).
 *
 * Comportements verrouillés :
 *   1. annuler puis rétablir restitue exactement l'état précédent ;
 *   2. une nouvelle édition après un undo invalide le futur (pas de branche fantôme) ;
 *   3. la profondeur est bornée (un onglet ne grossit pas indéfiniment) ;
 *   4. piles vides → `null`, jamais d'exception ni d'état inventé.
 */
describe('draft-history', () => {
    it('annule puis rétablit, dans l’ordre', () => {
        const history = createDraftHistory<string>();
        let current = 'A';

        pushHistory(history, current);
        current = 'B';
        pushHistory(history, current);
        current = 'C';

        expect(canUndoHistory(history)).toBe(true);
        const back = undoHistory(history, current);
        expect(back).toBe('B');
        current = back as string;

        const forward = redoHistory(history, current);
        expect(forward).toBe('C');
        expect(canRedoHistory(history)).toBe(false);
    });

    it('invalide le futur dès qu’une nouvelle édition arrive', () => {
        const history = createDraftHistory<string>();
        pushHistory(history, 'A');
        const back = undoHistory(history, 'B');
        expect(back).toBe('A');

        pushHistory(history, 'A');
        expect(canRedoHistory(history)).toBe(false);
        expect(redoHistory(history, 'A2')).toBeNull();
    });

    it('borne la profondeur de l’historique', () => {
        const history = createDraftHistory<number>();
        for (let index = 0; index < DRAFT_HISTORY_LIMIT + 20; index += 1) {
            pushHistory(history, index);
        }
        expect(history.past.length).toBe(DRAFT_HISTORY_LIMIT);
        expect(history.past[0]).toBe(20);
    });

    it('retourne null sur des piles vides, sans exception', () => {
        const history = createDraftHistory<string>();
        expect(undoHistory(history, 'A')).toBeNull();
        expect(redoHistory(history, 'A')).toBeNull();
        expect(canUndoHistory(history)).toBe(false);
        expect(canRedoHistory(history)).toBe(false);
    });

    it('réinitialise les deux piles', () => {
        const history = createDraftHistory<string>();
        pushHistory(history, 'A');
        undoHistory(history, 'B');
        expect(canRedoHistory(history)).toBe(true);

        resetHistory(history);
        expect(canUndoHistory(history)).toBe(false);
        expect(canRedoHistory(history)).toBe(false);
    });
});
