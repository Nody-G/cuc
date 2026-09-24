/**
 * Styles partagés des éditeurs du hero : un seul lieu de vérité pour la carte,
 * l'étiquette et la saisie — les blocs du hero restent ainsi de simples
 * assemblages, sans classes dupliquées (`AGENTS.md` § 2, anti-sur-fragmentation :
 * ce module n'existe que parce qu'il est partagé par plusieurs blocs).
 */

export const HERO_CARD_CLASS = 'bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-4';
export const HERO_CARD_HEADER_CLASS =
    'border-b border-white/10 pb-3 flex items-center justify-between';
export const HERO_CARD_TITLE_CLASS = 'text-sm font-bold text-white uppercase tracking-wider';
export const HERO_CARD_HINT_CLASS = 'text-xs text-gray-400';
export const HERO_TAG_CLASS =
    'text-[10px] font-mono text-[#FFE500] px-2 py-0.5 rounded bg-white/5 border border-white/10';
export const HERO_LABEL_CLASS = 'block text-xs font-mono text-gray-400 mb-1';
export const HERO_SUB_LABEL_CLASS = 'block text-[10px] font-mono text-gray-400 mb-0.5';
export const HERO_INPUT_CLASS =
    'w-full bg-black/60 border border-white/20 rounded px-3 py-2 text-xs text-white focus:border-[#FFE500] focus:outline-none';
export const HERO_CTA_BOX_CLASS = 'p-3 bg-black/40 rounded-lg border border-white/5 space-y-2';
