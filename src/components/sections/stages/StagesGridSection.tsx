'use client';

import React from 'react';
import { useStagesGrid } from './grid/useStagesGrid';
import { StageGridCard } from './grid/StageGridCard';

interface StagesGridSectionProps {
  onOpenApplication: (programId: string) => void;
  /** `sections_data.stages_catalogue` — forme validée dans `useStagesGrid`. */
  customStages?: unknown[];
}

/**
 * Grille des stages — façade de composition.
 *
 * L'orchestration (liste CMS, copie traduite appariée, correctifs Studio) vit
 * dans `useStagesGrid` ; la carte dans `grid/**`.
 */
export const StagesGridSection: React.FC<StagesGridSectionProps> = ({
  onOpenApplication,
  customStages,
}) => {
  const { localizedList } = useStagesGrid(customStages);

  return (
    <section className="py-16">
      <div className="page-shell space-y-12">
        {localizedList.map((stage, stageIndex) => (
          <StageGridCard
            key={stage.id}
            stage={stage}
            stageIndex={stageIndex}
            onOpenApplication={onOpenApplication}
          />
        ))}
      </div>
    </section>
  );
};
