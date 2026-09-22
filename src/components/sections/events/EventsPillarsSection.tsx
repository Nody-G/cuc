'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  STATIC_PILLAR_IMAGES,
  useEventsPillars,
  type PillarCopy,
} from './pillars/useEventsPillars';
import { DbEventPillarCard } from './pillars/DbEventPillarCard';
import { StaticPillarCard } from './pillars/StaticPillarCard';

/**
 * Piliers d'agence — façade de composition.
 *
 * L'orchestration (textes éditoriaux en place + événements CMS + overlays EN)
 * vit dans `useEventsPillars` ; les cartes dans `pillars/**`.
 */
export const EventsPillarsSection: React.FC = () => {
  const t = useTranslations('eventsAgence');
  const pillars = t.raw('pillars') as PillarCopy[];

  const { pillarItems, localizedEvents } = useEventsPillars(pillars);

  return (
    <section className="py-20">
      <div className="page-shell space-y-16">
        {localizedEvents.length > 0 ? (
          localizedEvents.map((evt, idx) => (
            <DbEventPillarCard key={evt.id} evt={evt} isReversed={idx % 2 === 1} />
          ))
        ) : (
          <>
            {/* 1. SPECTACLES (Fallback) */}
            <StaticPillarCard
              item={pillarItems[0]}
              index={0}
              reversed={false}
              imageUrl={STATIC_PILLAR_IMAGES[0]}
            />

            {/* 2. ANIMATIONS */}
            <StaticPillarCard
              item={pillarItems[1]}
              index={1}
              reversed={true}
              imageUrl={STATIC_PILLAR_IMAGES[1]}
            />

            {/* 3. TEAM BUILDING */}
            <StaticPillarCard
              item={pillarItems[2]}
              index={2}
              reversed={false}
              imageUrl={STATIC_PILLAR_IMAGES[2]}
            />
          </>
        )}
      </div>
    </section>
  );
};
