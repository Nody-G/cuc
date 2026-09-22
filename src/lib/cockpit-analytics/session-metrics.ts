/**
 * Agrégats des sessions : sièges, taux de remplissage global et pression de
 * remplissage par programme (triée par taux décroissant).
 */

import type { StuntProgram } from '@/types';
import type { SessionPressure } from './types';

export interface SessionMetrics {
    sessionsTotal: number;
    sessionsFull: number;
    totalSeats: number;
    bookedSeats: number;
    seatFillRate: number;
    pressure: SessionPressure[];
}

export function computeSessionMetrics(programs: StuntProgram[]): SessionMetrics {
    let sessionsTotal = 0;
    let sessionsFull = 0;
    let totalSeats = 0;
    let bookedSeats = 0;
    const pressure: SessionPressure[] = [];

    for (const program of programs) {
        const sessions = program.nextSessions || [];
        let progSeats = 0;
        let progBooked = 0;
        let progOpen = 0;
        let progFull = 0;

        for (const session of sessions) {
            sessionsTotal += 1;
            const max = session.max_seats ?? 0;
            const booked = session.booked_seats ?? 0;
            progSeats += max;
            progBooked += booked;
            totalSeats += max;
            bookedSeats += booked;
            if (session.status === 'complet') {
                sessionsFull += 1;
                progFull += 1;
            } else {
                progOpen += 1;
            }
        }

        if (sessions.length > 0) {
            pressure.push({
                programId: program.id,
                programTitle: program.title,
                totalSeats: progSeats,
                bookedSeats: progBooked,
                fillRate: progSeats > 0 ? Math.round((progBooked / progSeats) * 1000) / 10 : 0,
                openSessions: progOpen,
                fullSessions: progFull,
            });
        }
    }

    pressure.sort((a, b) => b.fillRate - a.fillRate);

    const seatFillRate =
        totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 1000) / 10 : 0;

    return { sessionsTotal, sessionsFull, totalSeats, bookedSeats, seatFillRate, pressure };
}
