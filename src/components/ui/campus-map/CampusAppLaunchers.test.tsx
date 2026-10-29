import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IntlTestProvider } from '@/lib/testing/a11y-harness';
import { CampusAppLaunchers } from './CampusAppLaunchers';

describe('CampusAppLaunchers', () => {
  it('rend un bouton d’action direct universel pour lancer la navigation', () => {
    render(
      <IntlTestProvider>
        <CampusAppLaunchers coordinates="50.0909,3.5374" />
      </IntlTestProvider>
    );

    const mainLaunchBtn = screen.getByRole('link', { name: /lancer l'itinéraire/i });
    expect(mainLaunchBtn).toBeInTheDocument();
    expect(mainLaunchBtn).toHaveAttribute(
      'href',
      'https://www.google.com/maps/dir/?api=1&destination=50.0909,3.5374'
    );
    expect(mainLaunchBtn).toHaveAttribute('target', '_blank');
  });

  it('propose des raccourcis directs sans menu déroulant pour Waze et Apple Plans', () => {
    render(
      <IntlTestProvider>
        <CampusAppLaunchers coordinates="50.0909,3.5374" />
      </IntlTestProvider>
    );

    const wazeLink = screen.getByRole('link', { name: /waze/i });
    expect(wazeLink).toBeInTheDocument();
    expect(wazeLink).toHaveAttribute(
      'href',
      'https://waze.com/ul?ll=50.0909,3.5374&navigate=yes'
    );

    const appleLink = screen.getByRole('link', { name: /apple plans/i });
    expect(appleLink).toBeInTheDocument();
    expect(appleLink).toHaveAttribute(
      'href',
      'https://maps.apple.com/?daddr=50.0909,3.5374'
    );
  });
});
