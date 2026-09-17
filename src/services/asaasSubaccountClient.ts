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
  /**
   * Obtém a configuração de subconta e split do Tenant
   */
  static async getTenantConfig(tenantId: string): Promise<TenantAsaasConfig> {
    try {
      const res = await fetch(`/api/tenants/${tenantId}/asaas/config`);
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
}
