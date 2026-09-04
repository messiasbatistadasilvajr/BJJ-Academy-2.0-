// Financial Calculations & Late Fee / Interest Engine for BJJ Academies

export interface LateFeeCalculationResult {
  isOverdue: boolean;
  daysOverdue: number;
  originalAmount: number;
  finePercent: number; // e.g., 2%
  fineAmount: number; // originalAmount * finePercent
  dailyInterestPercent: number; // e.g., 0.0333% (1% monthly pro-rata)
  interestAmount: number; // originalAmount * (dailyInterestPercent / 100) * daysOverdue
  totalUpdatedAmount: number; // originalAmount + fineAmount + interestAmount
  formulaText: string;
}

/**
 * Parses date strings in format DD/MM/YYYY or YYYY-MM-DD
 */
export function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Calculates late fee (multa) and daily interest (juros de mora)
 * Standard Brazilian Consumer / Financial Regulations:
 * - Multa por Atraso: 2,00% (art. 52, § 1º do CDC)
 * - Juros de Mora: 1,00% ao mês (0,0333% ao dia corrido) pro-rata die
 */
export function calculateLateFeeAndInterest(
  originalAmount: number,
  dueDateStr: string,
  referenceDate: Date = new Date(2026, 8, 2), // Reference: 02/Sep/2026 (app context)
  customFinePercent: number = 2.0,
  customMonthlyInterestPercent: number = 1.0
): LateFeeCalculationResult {
  const dueDate = parseDate(dueDateStr);
  
  // Set both to start of day for accurate calendar day difference
  const dueMidnight = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  const refMidnight = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  
  const diffTime = refMidnight.getTime() - dueMidnight.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const isOverdue = diffDays > 0;
  const daysOverdue = isOverdue ? diffDays : 0;
  
  if (!isOverdue) {
    return {
      isOverdue: false,
      daysOverdue: 0,
      originalAmount,
      finePercent: customFinePercent,
      fineAmount: 0,
      dailyInterestPercent: customMonthlyInterestPercent / 30,
      interestAmount: 0,
      totalUpdatedAmount: originalAmount,
      formulaText: 'Fatura em dia ou a vencer. Nenhum juros ou multa aplicado.'
    };
  }
  
  // 1. Multa por atraso (2%)
  const fineAmount = Math.round((originalAmount * (customFinePercent / 100)) * 100) / 100;
  
  // 2. Juros de mora diário (1% ao mês / 30 dias = 0.03333% ao dia)
  const dailyInterestRate = (customMonthlyInterestPercent / 30) / 100;
  const interestAmount = Math.round((originalAmount * dailyInterestRate * daysOverdue) * 100) / 100;
  
  // 3. Total atualizado
  const totalUpdatedAmount = Math.round((originalAmount + fineAmount + interestAmount) * 100) / 100;
  
  const formulaText = `Multa fixa (${customFinePercent}%): R$ ${fineAmount.toFixed(2).replace('.', ',')} + Juros (${(customMonthlyInterestPercent / 30).toFixed(3)}%/dia x ${daysOverdue} dias): R$ ${interestAmount.toFixed(2).replace('.', ',')}`;

  return {
    isOverdue: true,
    daysOverdue,
    originalAmount,
    finePercent: customFinePercent,
    fineAmount,
    dailyInterestPercent: customMonthlyInterestPercent / 30,
    interestAmount,
    totalUpdatedAmount,
    formulaText
  };
}

/**
 * SaaS Platform Billing Rules for BJJ Academy SaaS:
 * - Taxa Fixa por Academia: R$ 130,00 / mês
 * - Taxa Variável por Aluno Ativo no Tatame: R$ 1,30 / mês
 * - Fórmula Dinâmica: R$ 130,00 + (Alunos Ativos * R$ 1,30)
 */
export const SAAS_FIXED_FEE_BRL = 130.00;
export const SAAS_PER_STUDENT_FEE_BRL = 1.30;

export interface SaasLicenseFeeBreakdown {
  activeStudents: number;
  fixedFee: number;
  variableFee: number;
  totalFee: number;
  formulaDescription: string;
}

export function calculateSaasLicenseFee(
  activeStudents: number = 0,
  fixedFee: number = SAAS_FIXED_FEE_BRL,
  perStudentFee: number = SAAS_PER_STUDENT_FEE_BRL
): SaasLicenseFeeBreakdown {
  const safeStudents = Math.max(0, activeStudents);
  const variableFee = Math.round(safeStudents * perStudentFee * 100) / 100;
  const totalFee = Math.round((fixedFee + variableFee) * 100) / 100;

  return {
    activeStudents: safeStudents,
    fixedFee,
    variableFee,
    totalFee,
    formulaDescription: `R$ ${fixedFee.toFixed(2).replace('.', ',')} (fixo) + ${safeStudents} alunos x R$ ${perStudentFee.toFixed(2).replace('.', ',')} = R$ ${totalFee.toFixed(2).replace('.', ',')}`
  };
}

export interface SaasProjectionResult {
  academiesCount: number;
  avgStudentsPerAcademy: number;
  totalActiveStudents: number;
  fixedMRR: number;
  variableMRR: number;
  totalMRR: number;
  totalARR: number; // MRR * 12
}

export function projectSaasScale(
  academiesCount: number,
  avgStudentsPerAcademy: number,
  fixedFee: number = SAAS_FIXED_FEE_BRL,
  perStudentFee: number = SAAS_PER_STUDENT_FEE_BRL
): SaasProjectionResult {
  const totalActiveStudents = academiesCount * avgStudentsPerAcademy;
  const fixedMRR = academiesCount * fixedFee;
  const variableMRR = totalActiveStudents * perStudentFee;
  const totalMRR = fixedMRR + variableMRR;
  const totalARR = totalMRR * 12;

  return {
    academiesCount,
    avgStudentsPerAcademy,
    totalActiveStudents,
    fixedMRR,
    variableMRR,
    totalMRR,
    totalARR
  };
}

/**
 * Format currency to BRL (R$ 1.234,56) safely
 */
export function formatBRL(value: number | null | undefined): string {
  if (value === null || value === undefined || typeof value !== 'number' || isNaN(value)) {
    return 'R$ 0,00';
  }
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  } catch {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  }
}
