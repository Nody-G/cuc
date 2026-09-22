/* -------------------------------------------------------------------------- */
/*  Utilitaires de classes                                                     */
/* -------------------------------------------------------------------------- */

export function cx(...classes: Array<string | false | null | undefined>): string {
    return classes.filter(Boolean).join(' ');
}

export const COCKPIT_INPUT_CLASS =
    'w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FFE500] transition-colors';

export const COCKPIT_LABEL_CLASS = 'block text-xs font-mono text-gray-400 mb-1';
