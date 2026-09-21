import registry from './entities.json';

/**
 * Registre typé des entités traduisibles.
 *
 * La source de vérité est `entities.json` : elle est lue à la fois par
 * l'application (ici) et par les scripts d'audit (`.mjs`, via `fs`). Ajouter une
 * entité traduisible se fait donc en **une ligne** dans le JSON — jamais par une
 * refonte — ce qui garantit que la couche de traduction reste extensible.
 */

export type Locale = 'fr' | 'en';

export type FieldKind = 'scalar' | 'object' | 'array';

export interface EntityField {
    name: string;
    kind: FieldKind;
}

export interface EntityDefinition {
    entity: string;
    label: string;
    /**
     * Table source des lignes traduisibles. **Absente** pour les entités
     * « overlay seul » (`overlayOnly`) : ces lignes vivent dans un miroir JSON
     * (`site_settings`) et n'ont aucune table dédiée. Ne jamais inventer un nom
     * de table — un lien faux serait pire qu'aucun lien.
     */
    table?: string;
    /** Colonne identifiant dans la table source. */
    idField?: string;
    /** Entité sans table source : seuls des overlays sont écrits. */
    overlayOnly?: boolean;
    /** Description lisible de la source réelle (documentation de registre). */
    source?: string;
    fields: EntityField[];
}

const REGISTRY = registry as { entities: EntityDefinition[] };

export const TRANSLATABLE_ENTITIES: EntityDefinition[] = REGISTRY.entities;

/** Noms d'entités acceptés par la table `site_translations`. */
export const OVERLAY_ENTITIES: string[] = TRANSLATABLE_ENTITIES.map((e) => e.entity);

let index: Map<string, EntityDefinition> | null = null;

/** Récupère la définition d'une entité traduisible (ou `undefined`). */
export function getEntityDefinition(entity: string): EntityDefinition | undefined {
    if (!index) index = new Map(TRANSLATABLE_ENTITIES.map((e) => [e.entity, e]));
    return index.get(entity);
}

/** Champs traduisibles d'une entité. */
export function getTranslatableFields(entity: string): string[] {
    return getEntityDefinition(entity)?.fields.map((f) => f.name) ?? [];
}

/** Vrai si l'entité est déclarée traduisible. */
export function isTranslatableEntity(entity: string): boolean {
    return !!getEntityDefinition(entity);
}
