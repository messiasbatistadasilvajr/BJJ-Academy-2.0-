/**
 * Brazilian Document & Financial Validators for BJJ Academy Platform
 * Provides algorithmic CNPJ, CPF, CEP, and PIX validation for legal security
 */

/**
 * Validates CNPJ using mathematical modulo 11 checksum
 */
export function validateCNPJ(cnpj: string): boolean {
  if (!cnpj) return false;
  const clean = cnpj.replace(/\D/g, '');

  if (clean.length !== 14) return false;

  // Reject known invalid sequences like 00000000000000, 11111111111111, etc.
  if (/^(\d)\1{13}$/.test(clean)) return false;

  // First verification digit
  let size = clean.length - 2;
  let numbers = clean.substring(0, size);
  const digits = clean.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += Number(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== Number(digits.charAt(0))) return false;

  // Second verification digit
  size = size + 1;
  numbers = clean.substring(0, size);
  sum = 0;
  pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += Number(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== Number(digits.charAt(1))) return false;

  return true;
}

/**
 * Format CNPJ as 00.000.000/0001-00
 */
export function formatCNPJ(cnpj: string): string {
  const clean = cnpj.replace(/\D/g, '').slice(0, 14);
  if (clean.length <= 2) return clean;
  if (clean.length <= 5) return `${clean.slice(0, 2)}.${clean.slice(2)}`;
  if (clean.length <= 8) return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5)}`;
  if (clean.length <= 12) return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8)}`;
  return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12, 14)}`;
}

/**
 * Validates CPF using mathematical modulo 11 checksum
 */
export function validateCPF(cpf: string): boolean {
  if (!cpf) return false;
  const clean = cpf.replace(/\D/g, '');

  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;

  let sum = 0;
  let remainder: number;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(clean.substring(i - 1, i), 10) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(clean.substring(9, 10), 10)) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(clean.substring(i - 1, i), 10) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(clean.substring(10, 11), 10)) return false;

  return true;
}

/**
 * Format CPF as 000.000.000-00
 */
export function formatCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, '').slice(0, 11);
  if (clean.length <= 3) return clean;
  if (clean.length <= 6) return `${clean.slice(0, 3)}.${clean.slice(3)}`;
  if (clean.length <= 9) return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`;
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`;
}

/**
 * Format CEP as 00000-000
 */
export function formatCEP(cep: string): string {
  const clean = cep.replace(/\D/g, '').slice(0, 8);
  if (clean.length <= 5) return clean;
  return `${clean.slice(0, 5)}-${clean.slice(5, 8)}`;
}

/**
 * Validates Brazilian CEP (8 numeric digits)
 */
export function validateCEP(cep: string): boolean {
  if (!cep) return false;
  const clean = cep.replace(/\D/g, '');
  return clean.length === 8;
}

/**
 * Format Phone as (00) 00000-0000 or (00) 0000-0000
 */
export function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, '').slice(0, 11);
  if (clean.length === 0) return '';
  if (clean.length <= 2) return `(${clean}`;
  if (clean.length <= 6) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
  if (clean.length <= 10) return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
}

/**
 * Search Brazilian Address via ViaCEP with timeout
 */
export async function fetchAddressByCEP(cep: string): Promise<{
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
} | null> {
  const clean = cep.replace(/\D/g, '');
  if (clean.length !== 8) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();
    if (data.erro) return { logradouro: '', bairro: '', localidade: '', uf: '', erro: true };

    return {
      logradouro: data.logradouro || '',
      bairro: data.bairro || '',
      localidade: data.localidade || '',
      uf: data.uf || '',
      erro: false
    };
  } catch (err) {
    console.warn('ViaCEP fetch failed or timed out:', err);
    return null;
  }
}

/**
 * Validate PIX Key based on chosen type
 */
export function validatePixKey(
  key: string,
  type: 'cnpj' | 'cpf' | 'email' | 'phone' | 'random'
): { isValid: boolean; message?: string } {
  if (!key || !key.trim()) {
    return { isValid: false, message: 'Informe a Chave PIX oficial da academia.' };
  }

  const clean = key.trim();

  switch (type) {
    case 'cnpj': {
      const isOk = validateCNPJ(clean);
      return {
        isValid: isOk,
        message: isOk ? undefined : 'CNPJ da Chave PIX é inválido.'
      };
    }
    case 'cpf': {
      const isOk = validateCPF(clean);
      return {
        isValid: isOk,
        message: isOk ? undefined : 'CPF da Chave PIX é inválido.'
      };
    }
    case 'email': {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isOk = emailRegex.test(clean);
      return {
        isValid: isOk,
        message: isOk ? undefined : 'E-mail da Chave PIX possui formato inválido.'
      };
    }
    case 'phone': {
      const nums = clean.replace(/\D/g, '');
      const isOk = nums.length === 10 || nums.length === 11;
      return {
        isValid: isOk,
        message: isOk ? undefined : 'Telefone da Chave PIX deve conter DDD + 8 ou 9 dígitos.'
      };
    }
    case 'random': {
      // UUIDv4 format check: 8-4-4-4-12
      const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      const isOk = uuidRegex.test(clean) || clean.length >= 32;
      return {
        isValid: isOk,
        message: isOk ? undefined : 'Chave aleatória (EVP) deve ter o formato de chave PIX de 32 a 36 caracteres.'
      };
    }
    default:
      return { isValid: true };
  }
}

/**
 * Generate an audit hash/protocol for digital signing of SaaS agreement
 */
export function generateContractProtocol(academyId: string, cnpj: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const cleanCnpj = cnpj.replace(/\D/g, '').slice(-4);
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BJJ-TERMS-2026-${cleanCnpj}-${timestamp}-${randomPart}`;
}
