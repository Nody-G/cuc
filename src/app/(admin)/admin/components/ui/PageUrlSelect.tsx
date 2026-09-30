'use client';

import React, { useState } from 'react';
import { SITE_PAGE_CATALOG } from '@/lib/data/site/page-options';
import { ExternalLink, Link as LinkIcon } from 'lucide-react';

export interface PageUrlSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

/** Formate la valeur du slug en chemin absolu interne `/...` */
function normalizePath(val: string): string {
  if (!val) return '/';
  if (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('#') || val.startsWith('mailto:') || val.startsWith('tel:')) {
    return val;
  }
  return val.startsWith('/') ? val : `/${val}`;
}

export const PageUrlSelect: React.FC<PageUrlSelectProps> = ({
  id,
  value,
  onChange,
  label,
  className = '',
}) => {
  const normalizedValue = normalizePath(value);
  const matchedCatalog = SITE_PAGE_CATALOG.find(
    (p) => normalizePath(p.value) === normalizedValue
  );

  const isKnown = Boolean(matchedCatalog);
  const [userForcedCustom, setUserForcedCustom] = useState(false);
  const isCustom = userForcedCustom || (!isKnown && Boolean(value));

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === '__custom__') {
      setUserForcedCustom(true);
    } else {
      setUserForcedCustom(false);
      onChange(selected);
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-mono text-gray-400">
          {label}
        </label>
      )}

      <div className="space-y-2">
        <div className="relative">
          <select
            id={id}
            value={isCustom ? '__custom__' : (matchedCatalog ? normalizePath(matchedCatalog.value) : '/')}
            onChange={handleSelectChange}
            className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-[#FFE500] pr-8 appearance-none cursor-pointer"
          >
            <optgroup label="Pages du site vitrine">
              {SITE_PAGE_CATALOG.map((page) => {
                const path = normalizePath(page.value);
                return (
                  <option key={page.value} value={path}>
                    {page.label} ({path})
                  </option>
                );
              })}
            </optgroup>
            <optgroup label="Autre destination">
              <option value="__custom__">🔗 Lien externe ou personnalisé...</option>
            </optgroup>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
            <LinkIcon className="w-3.5 h-3.5 text-[#FFE500]" />
          </div>
        </div>

        {isCustom && (
          <div className="relative flex items-center">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://... ou #ancre"
              className="w-full bg-black/60 border border-[#FFE500]/50 rounded-lg px-3 py-1.5 text-xs text-[#FFE500] font-mono focus:outline-hidden focus:border-[#FFE500] pr-8"
            />
            <ExternalLink className="absolute right-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>
    </div>
  );
};
