/**
 * Tests de l'anti-inondation.
 *
 * Le cas visé est mesurable : une table absente produit une erreur par lecture,
 * soit des centaines de lignes identiques. Le regroupement doit à la fois
 * **protéger l'écriture** et **conserver le compte réel** des occurrences.
 *
 * L'horloge est injectée : aucun test ne dépend du temps réel.
 */
import { fingerprintOf, LogThrottle } from './throttle';

function makeClock(start = 0) {
    let current = start;
    return {
        now: () => current,
        advance: (ms: number) => {
            current += ms;
        },
    };
}

describe('fingerprintOf', () => {
    it('regroupe les événements identiques', () => {
        const a = fingerprintOf({ source: 'supabase', category: 'db.table_missing', message: 'm' });
        const b = fingerprintOf({ source: 'supabase', category: 'db.table_missing', message: 'm' });
        expect(a).toBe(b);
    });

    it('distingue deux cibles différentes', () => {
        const a = fingerprintOf({ source: 'media', category: 'upload.error', message: 'm', target: 'a.jpg' });
        const b = fingerprintOf({ source: 'media', category: 'upload.error', message: 'm', target: 'b.jpg' });
        expect(a).not.toBe(b);
    });
});

describe('LogThrottle', () => {
    it('écrit les occurrences autorisées puis compte les suivantes', () => {
        const clock = makeClock();
        const throttle = new LogThrottle({ windowMs: 1000, maxEmitsPerWindow: 2, now: clock.now });
        const fp = 'supabase|db.table_missing|m|';

        expect(throttle.register(fp)).toEqual({ emit: true, repeatCount: 1 });
        expect(throttle.register(fp)).toEqual({ emit: true, repeatCount: 1 });
        expect(throttle.register(fp)).toEqual({ emit: false, repeatCount: 0 });
        expect(throttle.register(fp)).toEqual({ emit: false, repeatCount: 0 });
    });

    it('reporte le compte des occurrences écartées sur la prochaine écriture', () => {
        const clock = makeClock();
        const throttle = new LogThrottle({ windowMs: 1000, maxEmitsPerWindow: 1, now: clock.now });
        const fp = 'media|upload.error|m|a.jpg';

        expect(throttle.register(fp)).toEqual({ emit: true, repeatCount: 1 });
        throttle.register(fp);
        throttle.register(fp);
        throttle.register(fp);

        clock.advance(1500);
        expect(throttle.register(fp)).toEqual({ emit: true, repeatCount: 4 });
    });

    it('renouvelle l’allocation après la fenêtre sans perdre les occurrences écartées', () => {
        const clock = makeClock();
        const throttle = new LogThrottle({ windowMs: 500, maxEmitsPerWindow: 1, now: clock.now });
        const fp = 'site|frontier.error|m|';

        expect(throttle.register(fp)).toEqual({ emit: true, repeatCount: 1 });
        expect(throttle.register(fp).emit).toBe(false);

        clock.advance(600);
        // L'incident a bien eu lieu deux fois : l'écriture suivante le dit.
        expect(throttle.register(fp)).toEqual({ emit: true, repeatCount: 2 });
        // Et l'allocation de la nouvelle fenêtre est bien repartie à zéro.
        expect(throttle.register(fp).emit).toBe(false);
    });

    it('laisse passer un événement critique au-delà du plafond quand on le demande', () => {
        const clock = makeClock();
        const throttle = new LogThrottle({ windowMs: 1000, maxEmitsPerWindow: 1, now: clock.now });
        const fp = 'site|frontier.error|m|';

        throttle.register(fp);
        expect(throttle.register(fp).emit).toBe(false);
        expect(throttle.register(fp, 5).emit).toBe(true);
    });

    it('suit chaque empreinte indépendamment', () => {
        const clock = makeClock();
        const throttle = new LogThrottle({ windowMs: 1000, maxEmitsPerWindow: 1, now: clock.now });

        expect(throttle.register('a|b|c|').emit).toBe(true);
        expect(throttle.register('a|b|d|').emit).toBe(true);
        expect(throttle.size).toBe(2);
    });

    it('oublie tout sur reset', () => {
        const clock = makeClock();
        const throttle = new LogThrottle({ maxEmitsPerWindow: 1, now: clock.now });
        throttle.register('a|b|c|');
        throttle.register('a|b|c|');
        throttle.reset();
        expect(throttle.size).toBe(0);
        expect(throttle.register('a|b|c|').emit).toBe(true);
    });
});
