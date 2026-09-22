/**
 * Hooks de lecture de la vitrine (navigation, pied de page, réseaux sociaux) —
 * surface publique historique.
 *
 * L'implémentation vit dans `navigation/**` ; cette façade conserve les trois
 * exports consommés par la Navbar, le drawer mobile et le Footer.
 */

export { useNavigation } from './navigation/useNavigation';
export { useFooter } from './navigation/useFooter';
export { useSocialLinks } from './navigation/useSocialLinks';
