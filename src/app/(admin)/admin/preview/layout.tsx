import React from 'react';

/**
 * Layout dédié à la route d'aperçu live (`/admin/preview`).
 *
 * Pourquoi un layout propre plutôt que le layout racine ?
 * Le layout racine monte le chrome public complet (`MobileStickyCTA`, pont
 * d'aperçu, Speculation Rules, JSON-LD). Dans un cadre embarqué, ces éléments
 * sont au mieux inutiles, au pire nuisibles :
 *  - `MobileStickyCTA` déclenche une requête Supabase et un écouteur `scroll`
 *    qui n'ont aucun sens dans un aperçu ;
 *  - les Speculation Rules y sont restreintes par le navigateur.
 *
 * Ce layout **imbriqué** s'ajoute au layout racine (Next.js compose les
 * layouts), mais il neutralise le chrome superflu en n'ajoutant rien et en
 * laissant le rendu des sections occuper tout l'espace. Le pont d'aperçu
 * (`PreviewBridgeClient`) reste monté par le layout racine : c'est lui qui
 * reçoit le brouillon via `postMessage`.
 */
export default function AdminPreviewLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <div className="min-h-screen bg-[#060608]">{children}</div>;
}
