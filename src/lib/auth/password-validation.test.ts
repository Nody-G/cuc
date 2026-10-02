import { describe, expect, it } from 'vitest';
import {
  validatePasswordConfirmation,
  validatePasswordRequirements,
} from './password-validation';

describe('password-validation', () => {
  describe('validatePasswordRequirements', () => {
    it('refuse les mots de passe vides ou trop courts', () => {
      expect(validatePasswordRequirements('')).toEqual({
        valid: false,
        error: 'Le mot de passe ne peut pas être vide.',
      });
      expect(validatePasswordRequirements('1234567')).toEqual({
        valid: false,
        error: 'Le mot de passe doit comporter au moins 8 caractères.',
      });
      expect(validatePasswordRequirements('   ')).toEqual({
        valid: false,
        error: 'Le mot de passe doit comporter au moins 8 caractères.',
      });
    });

    it('accepte les mots de passe valides d’au moins 8 caractères', () => {
      expect(validatePasswordRequirements('12345678')).toEqual({ valid: true });
      expect(validatePasswordRequirements('cucSecurePass2026!')).toEqual({ valid: true });
    });
  });

  describe('validatePasswordConfirmation', () => {
    it('refuse si le mot de passe initial n’est pas valide', () => {
      expect(validatePasswordConfirmation('short', 'short')).toEqual({
        valid: false,
        error: 'Le mot de passe doit comporter au moins 8 caractères.',
      });
    });

    it('refuse si la confirmation ne correspond pas', () => {
      expect(validatePasswordConfirmation('securePass123', 'securePass456')).toEqual({
        valid: false,
        error: 'Les deux mots de passe ne correspondent pas.',
      });
    });

    it('accepte si les deux mots de passe sont identiques et conformes', () => {
      expect(validatePasswordConfirmation('securePass123', 'securePass123')).toEqual({
        valid: true,
      });
    });
  });
});
