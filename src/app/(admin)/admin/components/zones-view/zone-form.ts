import { POI } from '@/components/ui/campus-map/campusMap.data';

/** Option de lieu CUC Sign proposée dans l'éditeur de zone. */
export interface CucSignLocationOption {
    id: string;
    label: string;
}

/** Lieux CUC Sign rattachables à une zone du campus (Base Supabase Émargement). */
export const CUC_SIGN_LOCATIONS: CucSignLocationOption[] = [
    { id: '0fc475db-34ae-47ce-95f2-b20b402c2859', label: 'Dojo Malik (indoor)' },
    { id: '732aad62-6c56-4329-85da-debb88be9fad', label: 'Tour Jérome Gaspard (outdoor)' },
    { id: 'a195f7db-e934-4605-befa-df47b35c2049', label: 'Salle Zoé Bell (indoor)' },
    { id: '84b68801-d21e-4f97-8d3a-a8dd6d966fea', label: 'Dojo Maurice (indoor)' },
    { id: '7a64268f-54ec-4650-b364-1cb78ebb0e38', label: 'Salle Escalade (indoor)' },
    { id: 'c5e00d0e-16c0-468b-ac13-431a6ce75c1f', label: 'Salle Tabata (indoor)' },
    { id: '85190227-31ee-4ee8-945a-5dbd22ad38f0', label: 'Amphithéatre (indoor)' },
    { id: '42d2da33-de57-4069-ab32-0467c8b3fb1d', label: 'Escaliers (outdoor)' },
    { id: '1f87ca78-ca18-459a-b8ec-0895ce699660', label: 'City Stade (outdoor)' },
];

/** Construit une zone vierge prête à éditer (valeurs par défaut historiques du cockpit). */
export function createEmptyZone(existingCount: number): POI {
    return {
        id: `zone-${Date.now()}`,
        name: '',
        category: 'Hauteur & Chutes Libres',
        description: '',
        specs: '',
        coordinates: '50.0910° N, 3.5375° E',
        badge: 'NOUVEL ESPACE',
        xPercent: 50,
        yPercent: 50,
        image_url: '',
        order_index: existingCount + 1,
        is_active: true,
    };
}
