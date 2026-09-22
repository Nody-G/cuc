/**
 * ==============================================================================
 * CUC — Protocole de communication Cockpit ↔ Aperçu (Mode Studio) — façade
 * ==============================================================================
 * Le contrat (constantes, types, fabriques) vit dans
 * `preview-protocol-core` ; la lecture défensive (validation v2, formes
 * héritées, origine) dans `preview-protocol-parse` (`AGENTS.md` § 2 : un
 * fichier reste sous 300 lignes, une responsabilité par module).
 *
 * Cette façade est **le seul point d'import** pour le Cockpit et la vitrine :
 * aucun chemin d'import n'a bougé lors du découpage.
 */

export * from './preview-protocol-core';
export * from './preview-protocol-parse';
