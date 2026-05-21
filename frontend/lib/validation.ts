// Funções de validação reutilizáveis em todo o frontend

export interface ValidationResult {
  valid: boolean;
  error: string | null;
}

export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();
  if (!trimmed) return { valid: false, error: "E-mail é obrigatório." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
    return { valid: false, error: "E-mail inválido." };
  return { valid: true, error: null };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) return { valid: false, error: "Senha é obrigatória." };
  if (password.length < 6) return { valid: false, error: "Senha deve ter ao menos 6 caracteres." };
  return { valid: true, error: null };
}

export function validateName(name: string): ValidationResult {
  const trimmed = name.trim();
  if (!trimmed) return { valid: false, error: "Nome é obrigatório." };
  if (trimmed.length < 2) return { valid: false, error: "Nome deve ter ao menos 2 caracteres." };
  return { valid: true, error: null };
}

export function validateWeight(value: number | string): ValidationResult {
  const n = Number(value);
  if (value === "" || value === null || value === undefined)
    return { valid: false, error: "Peso é obrigatório." };
  if (isNaN(n)) return { valid: false, error: "Peso deve ser um número." };
  if (n < 0) return { valid: false, error: "Peso não pode ser negativo." };
  if (n > 1000) return { valid: false, error: "Peso não pode ultrapassar 1000 kg." };
  return { valid: true, error: null };
}

export function validateReps(value: number | string): ValidationResult {
  const n = Number(value);
  if (value === "" || value === null || value === undefined)
    return { valid: false, error: "Repetições são obrigatórias." };
  if (!Number.isInteger(n)) return { valid: false, error: "Repetições devem ser um número inteiro." };
  if (n <= 0) return { valid: false, error: "Repetições devem ser maior que zero." };
  if (n > 999) return { valid: false, error: "Repetições não podem ultrapassar 999." };
  return { valid: true, error: null };
}

export function validateWorkoutName(name: string): ValidationResult {
  const trimmed = name.trim();
  if (!trimmed) return { valid: false, error: "Nome do treino é obrigatório." };
  if (trimmed.length < 2) return { valid: false, error: "Nome deve ter ao menos 2 caracteres." };
  if (trimmed.length > 60) return { valid: false, error: "Nome deve ter no máximo 60 caracteres." };
  return { valid: true, error: null };
}

// Valida login — retorna a primeira mensagem de erro encontrada ou null
export function validateLoginForm(email: string, password: string): string | null {
  const e = validateEmail(email);
  if (!e.valid) return e.error;
  const p = validatePassword(password);
  if (!p.valid) return p.error;
  return null;
}

// Valida registro — retorna a primeira mensagem de erro encontrada ou null
export function validateRegisterForm(
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): string | null {
  const n = validateName(name);
  if (!n.valid) return n.error;
  const e = validateEmail(email);
  if (!e.valid) return e.error;
  const p = validatePassword(password);
  if (!p.valid) return p.error;
  if (password !== confirmPassword) return "As senhas não coincidem.";
  return null;
}
