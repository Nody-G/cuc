/**
 * Chemins de la médiathèque — helpers **purs**.
 *
 * Deux contraintes constatées le 2026-09-24, à ne pas réintroduire :
 *  - un test unitaire ne peut pas importer un chemin traversant un **groupe de
 *    routes** (`(admin)`) : Vitest échoue à la collecte ;
 *  - un dossier littéralement nommé **`media`** fait échouer la collecte de tout
 *    fichier de test qu'il contient (« Cannot read properties of undefined
 *    (reading 'config') »). D'où ce dossier `media-library`.
 */

/** Dernier segment d'un chemin (`media/cuc-visual/001.jpg` → `001.jpg`). */
export function basename(path: string): string {
    return path.split('/').pop() || path;
}
