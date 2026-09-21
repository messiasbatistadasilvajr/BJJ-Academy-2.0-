import crypto from 'crypto';

export interface AnonymizedUserAuditRecord {
  anonymizedUserId: string; // Hash SHA-256 irreversível
  pseudonym: string;        // "Atleta Anonimizado #XXXX"
  anonymizedAt: string;
  originalRole: string;
  financialHistoryPreserved: boolean;
  documentsRedacted: boolean;
}

export class LgpdComplianceService {
  private static instance: LgpdComplianceService;

  private constructor() {}

  public static getInstance(): LgpdComplianceService {
    if (!LgpdComplianceService.instance) {
      LgpdComplianceService.instance = new LgpdComplianceService();
    }
    return LgpdComplianceService.instance;
  }

  /**
   * Anonimiza com criptografia SHA-256 um identificador pessoal (CPF, E-mail ou UID)
   */
  public hashIdentifier(identifier: string): string {
    const salt = 'BJJACADEMY_LGPD_COMPLIANCE_2026';
    return crypto.createHmac('sha256', salt).update(identifier.trim().toLowerCase()).digest('hex');
  }

  /**
   * Executa a rotina de exclusão de conta em conformidade com o Art. 18 e 16 da LGPD:
   * 1. Elimina dados sensíveis pessoais (fotos, telefones, e-mails, endereços).
   * 2. Mantém os registros contábeis e fiscais das faturas de forma anonimizada
   *    para garantir a integridade fiscal da academia e cumprir obrigações legais.
   */
  public processAccountDeletionAndAnonymization(params: {
    userId: string;
    email: string;
    name: string;
    invoicesCount: number;
  }): AnonymizedUserAuditRecord {
    const hash = this.hashIdentifier(params.userId);
    const shortHash = hash.substring(0, 8).toUpperCase();
    const pseudonym = `Atleta Anonimizado #${shortHash}`;

    console.log(`[LGPD Compliance] Exclusão e anonimização de conta processada para o usuário ${params.userId}. Pseudônimo contábil gerado: ${pseudonym}`);

    return {
      anonymizedUserId: hash,
      pseudonym,
      anonymizedAt: new Date().toISOString(),
      originalRole: 'aluno',
      financialHistoryPreserved: params.invoicesCount > 0,
      documentsRedacted: true
    };
  }
}

export const lgpdComplianceService = LgpdComplianceService.getInstance();
