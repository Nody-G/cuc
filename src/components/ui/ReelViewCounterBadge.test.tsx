import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ReelViewCounterBadge, formatReelViews } from './ReelViewCounterBadge';

describe('formatReelViews', () => {
  it('privilégie viewsFormatted quand renseigné', () => {
    expect(formatReelViews(14350140, '14,3 M')).toBe('14,3 M');
    expect(formatReelViews(122000, '122 k')).toBe('122 k');
  });

  it('formate les nombres bruts supérieurs au million', () => {
    expect(formatReelViews(2200000)).toBe('2,2 M');
    expect(formatReelViews(14350000)).toBe('14 M');
  });

  it('formate les nombres bruts en milliers', () => {
    expect(formatReelViews(450000)).toBe('450 k');
    expect(formatReelViews(84000)).toBe('84,0 k');
  });

  it('gère les nombres inférieurs à 1000', () => {
    expect(formatReelViews(750)).toBe('750');
  });

  it('retourne une chaîne vide si aucune vue ou vue <= 0', () => {
    expect(formatReelViews(0, '')).toBe('');
    expect(formatReelViews(undefined, '')).toBe('');
    expect(formatReelViews(0, '0')).toBe('');
    expect(formatReelViews(0, '—')).toBe('');
  });
});

describe('ReelViewCounterBadge', () => {
  it('ne rend rien si aucune vue disponible', () => {
    const { container } = render(<ReelViewCounterBadge views={0} />);
    expect(container.firstChild).toBeNull();
  });

  it('rend un badge compact avec icône et nombre formaté', () => {
    render(<ReelViewCounterBadge viewsFormatted="14,3 M" />);
    expect(screen.getByText('14,3 M')).toBeDefined();
  });

  it('rend la variante détaillée avec label vues', () => {
    render(<ReelViewCounterBadge viewsFormatted="1,8 M" variant="detailed" />);
    expect(screen.getByText('1,8 M')).toBeDefined();
    expect(screen.getByText('vues')).toBeDefined();
  });
});
