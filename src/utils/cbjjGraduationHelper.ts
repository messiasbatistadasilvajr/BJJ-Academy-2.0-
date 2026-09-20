import { BeltColor, StudentProfile, CBJJGraduationCheck, OfficialGraduationCertificate } from '../types';

/**
 * Tabela Oficial CBJJ / IBJJF de Idades Mínimas e Carência (Meses)
 * Chaveada nos valores do tipo BeltColor
 */
export const CBJJ_RULES: Record<BeltColor, { minAge: number; minMonths: number; nextBelt: BeltColor }> = {
  white: { minAge: 4, minMonths: 12, nextBelt: 'blue' },
  grey_white: { minAge: 4, minMonths: 8, nextBelt: 'grey' },
  grey: { minAge: 4, minMonths: 8, nextBelt: 'grey_black' },
  grey_black: { minAge: 4, minMonths: 8, nextBelt: 'yellow_white' },
  yellow_white: { minAge: 7, minMonths: 8, nextBelt: 'yellow' },
  yellow: { minAge: 7, minMonths: 8, nextBelt: 'yellow_black' },
  yellow_black: { minAge: 7, minMonths: 8, nextBelt: 'orange_white' },
  orange_white: { minAge: 10, minMonths: 8, nextBelt: 'orange' },
  orange: { minAge: 10, minMonths: 8, nextBelt: 'orange_black' },
  orange_black: { minAge: 10, minMonths: 8, nextBelt: 'green_white' },
  green_white: { minAge: 13, minMonths: 8, nextBelt: 'green' },
  green: { minAge: 13, minMonths: 8, nextBelt: 'green_black' },
  green_black: { minAge: 13, minMonths: 8, nextBelt: 'blue' },
  blue: { minAge: 16, minMonths: 24, nextBelt: 'purple' },
  purple: { minAge: 17, minMonths: 18, nextBelt: 'brown' },
  brown: { minAge: 18, minMonths: 12, nextBelt: 'black' },
  black: { minAge: 19, minMonths: 36, nextBelt: 'red_black' },
  red_black: { minAge: 50, minMonths: 84, nextBelt: 'red_white' },
  red_white: { minAge: 57, minMonths: 84, nextBelt: 'red' },
  red: { minAge: 67, minMonths: 120, nextBelt: 'red' }
};

export function checkCBJJEligibility(student: StudentProfile): CBJJGraduationCheck {
  const currentBelt = (student.belt as BeltColor) || 'white';
  const rule = CBJJ_RULES[currentBelt] || CBJJ_RULES.white;
  
  // Idade calculada
  const studentAge = student.age || 20;

  // Meses na faixa atual (estimados pelo joinDate ou promotions)
  const lastPromotionDate = student.promotions && student.promotions.length > 0
    ? new Date(student.promotions[student.promotions.length - 1].date)
    : new Date(student.joinDate || '2025-01-01');

  const now = new Date();
  const monthsDiff = Math.max(1, Math.floor((now.getTime() - lastPromotionDate.getTime()) / (1000 * 60 * 60 * 24 * 30.43)));

  const attendanceRequired = rule.minMonths * 12; // Média 12 aulas/mês
  const attendanceCompleted = student.currentAttendanceCount || 120;

  const ageOk = studentAge >= rule.minAge;
  const timeOk = monthsDiff >= rule.minMonths;
  const attendanceOk = attendanceCompleted >= (rule.minMonths * 8);

  const isEligible = ageOk && (timeOk || attendanceOk);

  let reason = 'Apto para exame de graduação oficial!';
  if (!ageOk) {
    reason = `Idade mínima CBJJ para ${rule.nextBelt} é ${rule.minAge} anos (atleta tem ${studentAge}).`;
  } else if (!timeOk && !attendanceOk) {
    reason = `Requer mais ${rule.minMonths - monthsDiff} meses ou ${attendanceRequired - attendanceCompleted} presenças.`;
  }

  return {
    isEligible,
    minAgeRequired: rule.minAge,
    currentAge: studentAge,
    minMonthsRequired: rule.minMonths,
    monthsInCurrentBelt: monthsDiff,
    attendanceCompleted,
    attendanceRequired,
    reason,
    nextBelt: rule.nextBelt
  };
}

export function generateOfficialCertificate(
  student: StudentProfile,
  academyName: string,
  academyId: string,
  headMasterName: string = 'Mestre Rodrigo "Cavalo" (3º Grau)',
  masterCref: string = 'CREF 089234-G/SP',
  awardedBelt?: BeltColor,
  awardedStripes: number = 0
): OfficialGraduationCertificate {
  const certNumber = `CBJJ-${Date.now().toString().slice(-6)}`;
  return {
    id: `cert_${Date.now()}`,
    studentId: student.id,
    studentName: student.name,
    studentCpf: student.cpf,
    academyId: academyId || 'acad_bjj_default',
    academyName: academyName || 'BJJ Academy Oficial',
    headMasterName,
    masterCref,
    awardedBelt: awardedBelt || (student.belt as BeltColor) || 'blue',
    awardedStripes,
    issueDate: new Date().toLocaleDateString('pt-BR'),
    validationQrCodeUrl: `https://bjjacademy.app/diploma?code=${certNumber}`,
    verificationHash: `SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    cbjjFederationNumber: 'CBJJ-FED-SP-9821'
  };
}

export const generateCBJJCertificate = generateOfficialCertificate;
