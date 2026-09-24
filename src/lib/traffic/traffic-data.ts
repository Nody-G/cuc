/**
 * ==============================================================================
 * CUC — Données du moniteur de trafic (Mode Studio / Cockpit)
 * ==============================================================================
 * **Façade de ré-export** : le découpage vit dans `lib/traffic/` —
 * `traffic-catalog.ts` (pages suivies), `traffic-windows.ts` (volumes de
 * référence), `traffic-breakdowns.ts` / `traffic-funnels.ts` (répartitions et
 * entonnoirs purs), `traffic-timeseries.ts` (série temporelle) et
 * `traffic-report.ts` (assemblage).
 *
 * Ce que ces données sont : des **ordres de grandeur de démonstration**
 * (`dataSource === 'modelled'`), utiles pour montrer la forme du tableau de bord
 * avant une collecte réelle. Ce qu'elles ne sont pas : des relevés.
 */

export { CUC_PAGES_CATALOG } from './traffic-catalog';
export { generateReport } from './traffic-report';
