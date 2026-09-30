'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
import { cucMicro } from '@/lib/preview/cuc-micro';

export const CONTACT_TOPIC_KEYS = [
  'pro-longue-duree',
  'stage-decouverte',
  'weekend-immersion',
  'afdas-artistes-interpretes',
  'stunt-summer-camp',
  'workshop-international',
  'tournage-production',
  'cuc-events',
  'autre',
] as const;

export type ContactTopicKey = (typeof CONTACT_TOPIC_KEYS)[number];

interface ContactProgramChipsProps {
  selectedKeys: string[];
  onChange: (keys: string[]) => void;
}

export const ContactProgramChips: React.FC<ContactProgramChipsProps> = ({
  selectedKeys,
  onChange,
}) => {
  const t = useTranslations('contact.form');

  const toggleKey = (key: string) => {
    if (selectedKeys.includes(key)) {
      // Don't allow unselecting everything
      if (selectedKeys.length > 1) {
        onChange(selectedKeys.filter((k) => k !== key));
      }
    } else {
      onChange([...selectedKeys, key]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor="contact-program-chips"
          className="block font-mono-tech uppercase text-zinc-300"
        >
          <span {...cucMicro('contact.form.labelProgram')}>{t('labelProgram')}</span>
        </label>
        <span className="text-[10px] font-mono-tech text-zinc-500 uppercase tracking-wider">
          Choix multiple possible
        </span>
      </div>

      <div id="contact-program-chips" className="flex flex-wrap gap-2 pt-1" role="group" aria-label="Sujets de demande">
        {CONTACT_TOPIC_KEYS.map((key) => {
          const isSelected = selectedKeys.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleKey(key)}
              className={`px-3 py-1.5 text-xs font-mono-tech uppercase transition-all flex items-center gap-1.5 border cursor-pointer select-none ${
                isSelected
                  ? 'bg-[#FFE500] text-black border-[#FFE500] font-bold shadow-[0_0_12px_rgba(255,229,0,0.25)]'
                  : 'bg-[#14141c] text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-zinc-200'
              }`}
            >
              {isSelected ? (
                <Check className="w-3 h-3 text-black stroke-[3]" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
              )}
              <span>{t(`options.${key}`)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
