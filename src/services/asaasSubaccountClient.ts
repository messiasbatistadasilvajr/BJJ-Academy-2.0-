// =================================================================
// BJJACADEMY - CLIENTE DE INTEGRAÇÃO COM SUBCONTAS & SPLIT ASAAS
// Comunica com as rotas de backend do BJJACADEMY
// =================================================================

import { SaasPlanTier } from '../types';

export interface TenantAsaasConfig {
  tenantId: string;
  nome: string;
  plano_tipo: SaasPlanTier;
  limite_alunos: number;
  status: 'ATIVO' | 'INATIVO' | 'BLOQUEADO';
  hasSubaccount: boolean;
  asaas_wallet_id?: string;
  asaas_account_number?: string;
  asaas_subscription_id?: string;
  overdue_since?: string | null;
  blocked_at?: string | null;
  masterWalletId: string;
  defaultSplitFixedFee: number;
}

export interface StudentEnrollmentPayload {
  nome: string;
  email?: string;
  phone?: string;
  status: 'ATIVO' | 'INATIVO';
  faixa?: string;
  graus?: number;
}

export interface StudentPaymentWithSplitPayload {
  studentId: string;
  studentName: string;
  value: number;
  dueDate: string;
  billingType?: 'PIX' | 'BOLETO' | 'CREDIT_CARD';
  description?: string;
  splitFeeOverride?: number;
}

export class AsaasSubaccountClient {
  private static getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
    const isCeo = typeof window !== 'undefined' && localStorage.getItem('bjj_is_ceo_authenticated') === 'true';
    const activeAcademyId = typeof window !== 'undefined' ? localStorage.getItem('bjj_active_academy_id') || 'acad_loyalty_jiujitsu' : 'acad_loyalty_jiujitsu';
    const role = isCeo ? 'CEO' : 'ADMIN_ACADEMIA';
    return {
      'Content-Type': 'application/json',
      'Authorization': isCeo ? 'Bearer jwt_token_ceo_messias_master' : 'Bearer mock_jwt_ADMIN_ACADEMIA',
      'x-user-role': role,
      'x-academy-id': activeAcademyId,
      ...extraHeaders
    };
  }

  /**
   * Obtém a configuração de subconta e split do Tenant
   */
  static async getTenantConfig(tenantId: string): Promise<TenantAsaasConfig> {
    try {
      const res = await fetch(`/api/tenants/${tenantId}/asaas/config`, {
        headers: AsaasSubaccountClient.getAuthHeaders()
      });
      if (!res.ok) {
        throw new Error('Falha ao obter status Asaas da academia.');
      }
      return await res.json();
    } catch (err) {
      console.warn('[AsaasClient] Fallback local para status da academia');
      return {
        tenantId,
        nome: 'Loyalty Jiu-Jitsu',
        plano_tipo: 'OURO',
        limite_alunos: 999999,
        status: 'ATIVO',
        hasSubaccount: true,
        asaas_wallet_id: 'wal_loyalty_matriz_883',
        asaas_account_number: '00048192',
        asaas_subscription_id: 'sub_bjj_ouro_001',
        masterWalletId: 'wallet_master_bjjacademy_01',
        defaultSplitFixedFee: 2.00
      };
    }
  }

  /**
   * Dispara a criação de Subconta Asaas para o mestre da academia
   */
  static async createSubaccount(tenantId: string, data: {
    name: string;
    email: string;
    cpfCnpj: string;
    phone: string;
    address?: string;
    postalCode?: string;
  }) {
    const res = await fetch(`/api/tenants/${tenantId}/asaas/subaccount`, {
      method: 'POST',
      headers: AsaasSubaccountClient.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return await res.json();
  }

  /**
   * Cadastra aluno executando a validação no Database Tier
   */
  static async enrollStudent(tenantId: string, student: StudentEnrollmentPayload) {
    const res = await fetch(`/api/tenants/${tenantId}/students/enroll`, {
      method: 'POST',
      headers: AsaasSubaccountClient.getAuthHeaders(),
      body: JSON.stringify(student)
    });
    const result = await res.json();
    if (!res.ok) {
      throw result;
    }
    return result;
  }

  /**
   * Emite cobrança do aluno com Split automático para a BJJACADEMY Master
   */
  static async createStudentChargeWithSplit(tenantId: string, payload: StudentPaymentWithSplitPayload) {
    const res = await fetch(`/api/tenants/${tenantId}/students/charge-with-split`, {
      method: 'POST',
      headers: AsaasSubaccountClient.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (!res.ok) {
      throw result;
    }
    return result;
  }

  /**
   * Cria ou altera a assinatura do software BJJACADEMY Master
   */
  static async createSoftwareSubscription(tenantId: string, planTier: SaasPlanTier, customerId = 'cus_master_default') {
    const res = await fetch(`/api/tenants/${tenantId}/asaas/subscription`, {
      method: 'POST',
      headers: AsaasSubaccountClient.getAuthHeaders(),
      body: JSON.stringify({ customerId, planTier })
    });
    return await res.json();
  }

  /**
   * Dispara alerta amigável de cobrança via WhatsApp
   */
  static async sendWhatsAppOverdueAlert(data: {
    alunoNome: string;
    alunoTelefone: string;
    academiaNome?: string;
    linkPagamento?: string;
    valor?: number;
    tenantId?: string;
  }) {
    const res = await fetch('/api/whatsapp/send-overdue-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  }

  /**
   * Obtém histórico dos últimos disparos de WhatsApp
   */
  static async getWhatsAppLogs() {
    try {
      const res = await fetch('/api/whatsapp/logs');
      return await res.json();
    } catch {
      return { success: true, logs: [] };
    }
  }

  /**
   * Executa ou simula a rotina agendada de lembretes automáticos de 3 dias antes (D-3)
   */
  static async triggerScheduledAdvanceReminders(data: {
    invoices: any[];
    students?: any[];
    daysAhead?: number;
    academyName?: string;
    defaultPixKey?: string;
  }) {
    try {
      const res = await fetch('/api/whatsapp/scheduled-reminders/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      console.warn('Falha na chamada scheduled reminders:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Obtém status do agendador automático de lembretes
   */
  static async getScheduledRemindersStatus() {
    try {
      const res = await fetch('/api/whatsapp/scheduled-reminders/status');
      return await res.json();
    } catch {
      return {
        success: true,
        schedulerActive: true,
        cronSchedule: '02:00 Diário (Automático)',
        advanceDays: 3,
        totalAdvanceRemindersSent: 0,
        recentLogs: []
      };
    }
  }

  /**
   * Dispara um lembrete preventivo individual (3 dias antes)
   */
  static async sendSingleAdvanceReminder(data: {
    alunoNome: string;
    alunoTelefone: string;
    academiaNome?: string;
    valor: number;
    dataVencimento: string;
    diasParaVencer?: number;
    chavePix?: string;
    linkPagamento?: string;
    tenantId?: string;
    alunoId?: string;
    invoiceId?: string;
  }) {
    try {
      const res = await fetch('/api/whatsapp/send-advance-reminder', {
        method: 'POST',
        headers: AsaasSubaccountClient.getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Realiza upgrade do plano SaaS (Restrito ao CEO Messias)
   */
  static async upgradePlan(tenantId: string, newPlanTier: SaasPlanTier) {
    const res = await fetch(`/api/tenants/${tenantId}/upgrade-plan`, {
      method: 'POST',
      headers: AsaasSubaccountClient.getAuthHeaders(),
      body: JSON.stringify({ newPlanTier })
    });
    return await res.json();
  }
}

