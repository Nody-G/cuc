/**
 * Sauvegarde automatique du site CUC — erreur d'orchestration.
 *
 * Couche « Domaine pur » (`AGENTS.md` § 1) : une erreur **nommée**, qui porte
 * la clé d'objet fautive quand elle existe. Isolée dans son propre module pour
 * que `naming.ts` et `preflight.ts` puissent la lever sans créer de dépendance
 * circulaire vers `orchestrate.ts` (`AGENTS.md` § 4, une seule source par sujet).
 *
 * `orchestrate.ts` la réexporte : l'API publique (`BackupRunError` importée
 * depuis `./orchestrate` par les CLI et les tests) reste strictement inchangée.
 */
export class BackupRunError extends Error {
    readonly objectKey: string | null;

    constructor(message: string, objectKey: string | null = null) {
        super(message);
        this.name = 'BackupRunError';
        this.objectKey = objectKey;
    }
}
