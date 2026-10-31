/**
 * Password validation rules from the problem statement:
 * - More than 8 characters (> 8 characters, i.e. 9 or more)
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one special character
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  rules: {
    hasMinLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasSpecialChar: boolean;
  };
}

export function validatePassword(password: string): PasswordValidationResult {
  const hasMinLength = password.length > 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password);

  const errors: string[] = [];
  if (!hasMinLength) {
    errors.push("Password must be more than 8 characters long (at least 9 characters).");
  }
  if (!hasUppercase) {
    errors.push("Password must contain at least one uppercase letter (A-Z).");
  }
  if (!hasLowercase) {
    errors.push("Password must contain at least one lowercase letter (a-z).");
  }
  if (!hasSpecialChar) {
    errors.push("Password must contain at least one special character (e.g. !@#$%^&*).");
  }

  return {
    isValid: errors.length === 0,
    errors,
    rules: {
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasSpecialChar,
    },
  };
}
