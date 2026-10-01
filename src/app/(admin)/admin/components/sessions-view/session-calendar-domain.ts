/**
 * Fonctions pures pour la sélection et le formatage des dates de sessions CUC.
 *
 * Élimine tout risque d'erreur orthographique sur les mois, le formatage
 * des intervalles (« 18 au 30 octobre 2026 », « 21 février au 05 mars 2027 »)
 * et les formats de week-ends (« 12 et 13 septembre 2026 »).
 */

export const FRENCH_MONTHS = [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
] as const;

export const FRENCH_WEEKDAYS_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] as const;

export type DateConnector = 'au' | 'et';

export interface CalendarDay {
    date: Date;
    dayNumber: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isoDate: string; // YYYY-MM-DD
}

/** Formate un numéro de jour sur 2 chiffres (norme CUC : 05, 09, 18...). */
export function padDay(day: number): string {
    return String(day).padStart(2, '0');
}

/** Convertit une date en YYYY-MM-DD local. */
export function toIsoDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Formate un intervalle de dates selon la convention exacte du Campus Univers Cascades :
 * - Même mois / même année : "18 au 30 octobre 2026" ou "12 et 13 septembre 2026"
 * - Mois différents / même année : "21 février au 05 mars 2027"
 * - Années différentes : "28 décembre 2026 au 08 janvier 2027"
 * - Jour unique : "15 mai 2027"
 */
export function formatSessionRange(
    start: Date,
    end?: Date | null,
    connector: DateConnector = 'au'
): string {
    const startDay = padDay(start.getDate());
    const startMonth = FRENCH_MONTHS[start.getMonth()];
    const startYear = start.getFullYear();

    if (!end || toIsoDate(start) === toIsoDate(end)) {
        return `${startDay} ${startMonth} ${startYear}`;
    }

    // Assurer l'ordre chronologique
    const [realStart, realEnd] = start.getTime() <= end.getTime() ? [start, end] : [end, start];
    const sDay = padDay(realStart.getDate());
    const sMonth = FRENCH_MONTHS[realStart.getMonth()];
    const sYear = realStart.getFullYear();

    const eDay = padDay(realEnd.getDate());
    const eMonth = FRENCH_MONTHS[realEnd.getMonth()];
    const eYear = realEnd.getFullYear();

    if (sYear === eYear && sMonth === eMonth) {
        return `${sDay} ${connector} ${eDay} ${sMonth} ${sYear}`;
    }

    if (sYear === eYear) {
        return `${sDay} ${sMonth} ${connector} ${eDay} ${eMonth} ${sYear}`;
    }

    return `${sDay} ${sMonth} ${sYear} ${connector} ${eDay} ${eMonth} ${eYear}`;
}

/** Génère la grille calendaire mensuelle (du lundi au dimanche). */
export function getMonthCalendarGrid(year: number, month: number): CalendarDay[] {
    const today = new Date();
    const todayIso = toIsoDate(today);

    // Premier jour du mois
    const firstDay = new Date(year, month, 1);
    // Indice du jour de la semaine (0 = Dimanche, transformé en 0 = Lundi ... 6 = Dimanche)
    const startDayOfWeek = (firstDay.getDay() + 6) % 7;

    // Nombre de jours dans le mois
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Nombre de jours dans le mois précédent
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: CalendarDay[] = [];

    // Jours du mois précédent
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const d = new Date(year, month - 1, daysInPrevMonth - i);
        days.push({
            date: d,
            dayNumber: d.getDate(),
            isCurrentMonth: false,
            isToday: toIsoDate(d) === todayIso,
            isoDate: toIsoDate(d),
        });
    }

    // Jours du mois courant
    for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, month, day);
        days.push({
            date: d,
            dayNumber: day,
            isCurrentMonth: true,
            isToday: toIsoDate(d) === todayIso,
            isoDate: toIsoDate(d),
        });
    }

    // Jours du mois suivant pour compléter les 5 ou 6 semaines (multiple de 7)
    const totalSlots = days.length <= 35 ? 35 : 42;
    const remaining = totalSlots - days.length;
    for (let day = 1; day <= remaining; day++) {
        const d = new Date(year, month + 1, day);
        days.push({
            date: d,
            dayNumber: day,
            isCurrentMonth: false,
            isToday: toIsoDate(d) === todayIso,
            isoDate: toIsoDate(d),
        });
    }

    return days;
}

/** Raccourcis express : calcule la date de fin selon la durée typique d'un stage CUC. */
export function computePresetEndDate(
    startDate: Date,
    preset: 'stage12' | 'stage10' | 'stage5' | 'weekend' | '1day'
): Date {
    const end = new Date(startDate);
    switch (preset) {
        case 'stage12':
            // Stage immersif CUC de 12 jours (ex: du dimanche au vendredi, 12 jours calendaires = +12j)
            end.setDate(startDate.getDate() + 12);
            return end;
        case 'stage10':
            // Stage AFDAS 2 semaines (10 jours ouvrés / 12-14 jours calendaires = +11j)
            end.setDate(startDate.getDate() + 11);
            return end;
        case 'stage5':
            // Stage 5 jours (ex: lundi au vendredi = +4j)
            end.setDate(startDate.getDate() + 4);
            return end;
        case 'weekend':
            // Formule Week-end (samedi au dimanche = +1j)
            end.setDate(startDate.getDate() + 1);
            return end;
        case '1day':
        default:
            return startDate;
    }
}
