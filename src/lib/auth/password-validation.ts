/**
 * Validation des mots de passe pour le Cockpit CUC.
 * Conforme aux règles SRP (`AGENTS.md` § 1) : logique pure, testable unitairement.
 */

export interface PasswordValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Valide les exigences de sécurité minimales pour un mot de passe Cockpit.
 */
export function validatePasswordRequirements(password: string): PasswordValidationResult {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Le mot de passe ne peut pas être vide.' };
  }

  const trimmed = password.trim();
  if (trimmed.length < 8) {
    return { valid: false, error: 'Le mot de passe doit comporter au moins 8 caractères.' };
  }

  return { valid: true };
}

/**
 * Valide la concordance entre le mot de passe et sa confirmation.
 */
export function validatePasswordConfirmation(
  password: string,
  confirmation: string,
): PasswordValidationResult {
  const reqCheck = validatePasswordRequirements(password);
  if (!reqCheck.valid) {
    return reqCheck;
  }

  if (password.trim() !== confirmation.trim()) {
    return { valid: false, error: 'Les deux mots de passe ne correspondent pas.' };
  }

  return { valid: true };
}
