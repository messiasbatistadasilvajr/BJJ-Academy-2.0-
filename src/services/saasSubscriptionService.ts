import {
  SaasSubscription,
  SaasPaymentStatus,
  SaasPlanType,
  SaasPaymentRecord,
  AcademyAccessLockoutStatus
} from '../types';

const STORAGE_KEY = 'bjja_saas_subscriptions_v2';
const PAYMENTS_STORAGE_KEY = 'bjja_saas_payment_records_v2';

// Helper de datas seguras
function formatDateYYYYMMDD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth(); // 0-indexed

// Dados Iniciais Ricos de Assinaturas SaaS (Multi-Tenant)
const defaultSaasSubscriptions: SaasSubscription[] = [
  {
    id: 'sub_loyalty_001',
    academyId: 'acad_loyalty_jiujitsu',
    academyName: 'Loyalty Jiu-Jitsu',
    branchName: 'Matriz Oficial • CE',
    responsibleName: 'Messias Batista da Silva Junior',
    responsibleEmail: 'contato@loyaltyjiujitsu.com.br',
    responsiblePhone: '(85) 98765-4321',
    responsibleCpfCnpj: '58.087.630/0001-78',
    planTier: 'OURO',
    planName: 'Plano Ouro (Enterprise)',
    monthlyFeeBRL: 249.90,
    maxActiveStudents: 999999,
    billingDueDay: 10,
    dueDate: formatDateYYYYMMDD(new Date(currentYear, currentMonth, 10)),
    lastPaymentDate: formatDateYYYYMMDD(new Date(currentYear, currentMonth - 1, 10)),
    paymentStatus: 'EM_DIA',
    isAccessSuspended: false,
    suspensionReason: undefined,
    paymentHistory: [
      {
        id: 'pay_rec_001',
        subscriptionId: 'sub_loyalty_001',
        academyId: 'acad_loyalty_jiujitsu',
        amountPaidBRL: 249.90,
        paymentDate: formatDateYYYYMMDD(new Date(currentYear, currentMonth, 2)),
        paymentMethod: 'PIX',
        referenceMonth: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`,
        transactionCode: 'PIX-E2E-LOYALTY-2026-9921',
        registeredBy: 'Super Admin (Messias)',
        notes: 'Mensalidade do software quitada via PIX Automatizado Asaas.',
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 'sub_gracie_002',
    academyId: 'acad_gracie_barra_sp',
    academyName: 'Gracie Barra Jardins',
    branchName: 'Unidade Jardins • SP',
    responsibleName: 'Prof. Carlos Eduardo Gracie',
    responsibleEmail: 'carlos.gracie@gbjardins.com.br',
    responsiblePhone: '(11) 98111-2233',
    responsibleCpfCnpj: '12.345.678/0001-90',
    planTier: 'AVANCADO',
    planName: 'Plano Avançado (Até 150 Alunos)',
    monthlyFeeBRL: 149.90,
    maxActiveStudents: 150,
    billingDueDay: 5,
    dueDate: formatDateYYYYMMDD(new Date(currentYear, currentMonth, 5)),
    lastPaymentDate: formatDateYYYYMMDD(new Date(currentYear, currentMonth, 4)),
    paymentStatus: 'EM_DIA',
    isAccessSuspended: false,
    suspensionReason: undefined,
    paymentHistory: [
      {
        id: 'pay_rec_002',
        subscriptionId: 'sub_gracie_002',
        academyId: 'acad_gracie_barra_sp',
        amountPaidBRL: 149.90,
        paymentDate: formatDateYYYYMMDD(new Date(currentYear, currentMonth, 4)),
        paymentMethod: 'PIX',
        referenceMonth: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`,
        transactionCode: 'PIX-GB-2026-7894',
        registeredBy: 'Super Admin (Messias)',
        notes: 'Pagamento antecipado com desconto de pontualidade.',
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 'sub_alliance_003',
    academyId: 'acad_alliance_campinas',
    academyName: 'Alliance Campinas',
    branchName: 'Taquaral • Campinas SP',
    responsibleName: 'Mestre Fernando Ramos',
    responsibleEmail: 'fernando@alliancecampinas.com.br',
    responsiblePhone: '(19) 97222-3344',
    responsibleCpfCnpj: '23.456.789/0001-01',
    planTier: 'BASICO',
    planName: 'Plano Básico (Até 40 Alunos)',
    monthlyFeeBRL: 99.90,
    maxActiveStudents: 40,
    billingDueDay: 15,
    // Vencido há 6 dias
    dueDate: formatDateYYYYMMDD(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)),
    lastPaymentDate: formatDateYYYYMMDD(new Date(Date.now() - 36 * 24 * 60 * 60 * 1000)),
    paymentStatus: 'ATRASADO',
    isAccessSuspended: true, // Bloqueio automático ativado por atraso financeiro!
    suspensionReason: 'Inadimplência - Fatura SaaS em atraso há 6 dias. Professores e alunos desta unidade estão com acesso temporariamente bloqueado.',
    suspendedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    paymentHistory: []
  },
  {
    id: 'sub_checkmat_004',
    academyId: 'acad_checkmat_santos',
    academyName: 'Checkmat Baixada',
    branchName: 'Gonzaga • Santos SP',
    responsibleName: 'Prof. Rodrigo Martins',
    responsibleEmail: 'contato@checkmatsantos.com.br',
    responsiblePhone: '(13) 99333-4455',
    responsibleCpfCnpj: '34.567.890/0001-12',
    planTier: 'AVANCADO',
    planName: 'Plano Avançado (Até 150 Alunos)',
    monthlyFeeBRL: 149.90,
    maxActiveStudents: 150,
    billingDueDay: 20,
    // Vence em 2 dias (Pendente)
    dueDate: formatDateYYYYMMDD(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)),
    lastPaymentDate: formatDateYYYYMMDD(new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)),
    paymentStatus: 'PENDENTE',
    isAccessSuspended: false,
    suspensionReason: undefined,
    paymentHistory: []
  },
  {
    id: 'sub_novauniao_005',
    academyId: 'acad_nova_uniao_bh',
    academyName: 'Nova União Minas',
    branchName: 'Savassi • Belo Horizonte MG',
    responsibleName: 'Prof. Leandro Barbosa',
    responsibleEmail: 'leandro@novauniaominas.com.br',
    responsiblePhone: '(31) 98444-5566',
    responsibleCpfCnpj: '45.678.901/0001-23',
    planTier: 'BASICO',
    planName: 'Plano Básico (Até 40 Alunos)',
    monthlyFeeBRL: 99.90,
    maxActiveStudents: 40,
    billingDueDay: 25,
    // Vencido há 14 dias
    dueDate: formatDateYYYYMMDD(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)),
    lastPaymentDate: formatDateYYYYMMDD(new Date(Date.now() - 44 * 24 * 60 * 60 * 1000)),
    paymentStatus: 'ATRASADO',
    isAccessSuspended: true, // Bloqueio automático ativado por atraso financeiro!
    suspensionReason: 'Acesso suspenso por inadimplência prolongada (14 dias de atraso). Alunos e professores impedidos de acessar.',
    suspendedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    paymentHistory: []
  }
];

export class SaasSubscriptionService {
  /**
   * Obtém todas as assinaturas cadastradas
   */
  static getSubscriptions(): SaasSubscription[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SaasSubscription[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[SaasSubscriptionService] Falha ao ler localStorage, utilizando semente padrão.', e);
    }
    // Salva as sementes se não existirem
    SaasSubscriptionService.saveSubscriptions(defaultSaasSubscriptions);
    return defaultSaasSubscriptions;
  }

  /**
   * Persiste a lista de assinaturas no storage
   */
  static saveSubscriptions(subscriptions: SaasSubscription[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
    } catch (e) {
      console.error('[SaasSubscriptionService] Erro ao gravar assinaturas no localStorage', e);
    }
  }

  /**
   * Regra de Negócio Crítica (Bloqueio Automático / SaaS Lockout Middleware):
   * Verifica se a academia especificada possui bloqueio de acesso (Status ATRASADO ou isAccessSuspended).
   * Se bloqueada, professores e alunos daquela academia são temporariamente impedidos de acessar.
   */
  static checkAcademyAccess(academyId: string): AcademyAccessLockoutStatus {
    const list = SaasSubscriptionService.getSubscriptions();
    const sub = list.find(s => s.academyId === academyId);

    if (!sub) {
      // Se a academia não estiver na tabela SaaS (ex: nova ou não parametrizada), libera por padrão
      return {
        isBlocked: false,
        academyId,
        academyName: 'Academia',
        responsibleName: '',
        paymentStatus: 'EM_DIA',
        isAccessSuspended: false,
        reason: '',
        monthlyFeeBRL: 99.90,
        dueDate: ''
      };
    }

    // Regra 1: Se status financeiro for 'ATRASADO', é bloqueio imediato!
    const isStatusAtrasado = sub.paymentStatus === 'ATRASADO';
    const isManuallySuspended = sub.isAccessSuspended === true;
    const isBlocked = isStatusAtrasado || isManuallySuspended;

    let daysOverdue = 0;
    if (sub.dueDate) {
      const due = new Date(sub.dueDate);
      const diffMs = Date.now() - due.getTime();
      if (diffMs > 0) {
        daysOverdue = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      }
    }

    const defaultReason = isStatusAtrasado
      ? `Acesso bloqueado por inadimplência na mensalidade SaaS do software (${daysOverdue > 0 ? `${daysOverdue} dias de atraso` : 'em atraso'}).`
      : 'Acesso suspenso preventivamente pelo Administrador do Software.';

    return {
      isBlocked,
      academyId: sub.academyId,
      academyName: sub.academyName,
      responsibleName: sub.responsibleName,
      paymentStatus: sub.paymentStatus,
      isAccessSuspended: isBlocked,
      reason: sub.suspensionReason || defaultReason,
      monthlyFeeBRL: sub.monthlyFeeBRL,
      dueDate: sub.dueDate,
      daysOverdue
    };
  }

  /**
   * Ação: 'Registrar Pagamento'
   * Muda status para 'EM_DIA', remove a suspensão/bloqueio instantaneamente
   * e registra no histórico de pagamentos.
   */
  static registerPayment(
    subscriptionId: string,
    params: {
      amountPaidBRL: number;
      paymentMethod: SaasPaymentRecord['paymentMethod'];
      transactionCode?: string;
      notes?: string;
      registeredBy?: string;
      newNextDueDate?: string;
    }
  ): SaasSubscription {
    const list = SaasSubscriptionService.getSubscriptions();
    const index = list.findIndex(s => s.id === subscriptionId);
    if (index === -1) {
      throw new Error(`Assinatura SaaS ${subscriptionId} não encontrada.`);
    }

    const current = list[index];
    const todayStr = formatDateYYYYMMDD(new Date());

    // Calcula próximo vencimento no mês seguinte se não fornecido
    let nextDueStr = params.newNextDueDate;
    if (!nextDueStr) {
      const nextMonthDate = new Date();
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
      nextMonthDate.setDate(current.billingDueDay || 10);
      nextDueStr = formatDateYYYYMMDD(nextMonthDate);
    }

    const newPaymentRecord: SaasPaymentRecord = {
      id: `pay_rec_${Date.now()}`,
      subscriptionId: current.id,
      academyId: current.academyId,
      amountPaidBRL: params.amountPaidBRL || current.monthlyFeeBRL,
      paymentDate: todayStr,
      paymentMethod: params.paymentMethod || 'PIX',
      referenceMonth: todayStr.substring(0, 7),
      transactionCode: params.transactionCode || `PIX-MANUAL-${Date.now().toString().slice(-6)}`,
      notes: params.notes || 'Pagamento confirmado e registrado no Painel Super Admin.',
      registeredBy: params.registeredBy || 'Super Admin (Criador)',
      createdAt: new Date().toISOString()
    };

    const updated: SaasSubscription = {
      ...current,
      paymentStatus: 'EM_DIA', // Regularizado!
      isAccessSuspended: false, // Desbloqueia alunos e professores na mesma hora!
      suspensionReason: undefined,
      suspendedAt: undefined,
      reactivatedAt: new Date().toISOString(),
      lastPaymentDate: todayStr,
      dueDate: nextDueStr,
      updatedAt: new Date().toISOString(),
      paymentHistory: [newPaymentRecord, ...(current.paymentHistory || [])]
    };

    list[index] = updated;
    SaasSubscriptionService.saveSubscriptions(list);
    return updated;
  }

  /**
   * Ação: 'Suspender Acesso'
   * Força a suspensão de acesso de uma academia específica
   */
  static suspendAccess(subscriptionId: string, reason?: string): SaasSubscription {
    const list = SaasSubscriptionService.getSubscriptions();
    const index = list.findIndex(s => s.id === subscriptionId);
    if (index === -1) {
      throw new Error(`Assinatura SaaS ${subscriptionId} não encontrada.`);
    }

    const current = list[index];
    const updated: SaasSubscription = {
      ...current,
      isAccessSuspended: true,
      suspensionReason: reason || 'Acesso suspenso manualmente pelo Super Admin da Plataforma.',
      suspendedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    list[index] = updated;
    SaasSubscriptionService.saveSubscriptions(list);
    return updated;
  }

  /**
   * Ação: 'Reativar Acesso'
   * Reativa o acesso da academia
   */
  static reactivateAccess(subscriptionId: string): SaasSubscription {
    const list = SaasSubscriptionService.getSubscriptions();
    const index = list.findIndex(s => s.id === subscriptionId);
    if (index === -1) {
      throw new Error(`Assinatura SaaS ${subscriptionId} não encontrada.`);
    }

    const current = list[index];
    const updated: SaasSubscription = {
      ...current,
      isAccessSuspended: false,
      suspensionReason: undefined,
      suspendedAt: undefined,
      reactivatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    list[index] = updated;
    SaasSubscriptionService.saveSubscriptions(list);
    return updated;
  }

  /**
   * Ação: 'Editar Plano'
   * Modifica plano contratado, valor da mensalidade e dia de vencimento
   */
  static editPlan(
    subscriptionId: string,
    params: {
      planTier: SaasPlanType;
      monthlyFeeBRL: number;
      billingDueDay: number;
      maxActiveStudents?: number;
    }
  ): SaasSubscription {
    const list = SaasSubscriptionService.getSubscriptions();
    const index = list.findIndex(s => s.id === subscriptionId);
    if (index === -1) {
      throw new Error(`Assinatura SaaS ${subscriptionId} não encontrada.`);
    }

    const current = list[index];

    let planName = 'Plano Básico (Até 40 Alunos)';
    let maxStudents = 40;
    if (params.planTier === 'AVANCADO') {
      planName = 'Plano Avançado (Até 150 Alunos)';
      maxStudents = 150;
    } else if (params.planTier === 'OURO') {
      planName = 'Plano Ouro (Enterprise - Ilimitado)';
      maxStudents = 999999;
    }

    const updated: SaasSubscription = {
      ...current,
      planTier: params.planTier,
      planName,
      monthlyFeeBRL: params.monthlyFeeBRL,
      billingDueDay: params.billingDueDay,
      maxActiveStudents: params.maxActiveStudents || maxStudents,
      updatedAt: new Date().toISOString()
    };

    list[index] = updated;
    SaasSubscriptionService.saveSubscriptions(list);
    return updated;
  }

  /**
   * Rotina Automática de Verificação de Inadimplência (Middleware / Cron)
   * Varre todas as assinaturas; se data de vencimento < hoje e não foi quitada,
   * altera status para 'ATRASADO' e aciona o bloqueio de professores e alunos!
   */
  static runAutoLockoutRoutine(): { checked: number; locked: number; lockedAcademies: string[] } {
    const list = SaasSubscriptionService.getSubscriptions();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let lockedCount = 0;
    const lockedAcademies: string[] = [];

    const updatedList = list.map(sub => {
      if (sub.paymentStatus === 'EM_DIA') {
        return sub;
      }

      if (sub.dueDate) {
        const dueDate = new Date(sub.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        // Se data de vencimento expirou e não está em dia
        if (dueDate < today) {
          const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          const isNewlyLocked = !sub.isAccessSuspended;

          if (isNewlyLocked) {
            lockedCount++;
            lockedAcademies.push(`${sub.academyName} (${daysOverdue} dias)`);
          }

          return {
            ...sub,
            paymentStatus: 'ATRASADO' as SaasPaymentStatus,
            isAccessSuspended: true, // Bloqueia professores e alunos!
            suspensionReason: `Bloqueio Automático do Sistema: Mensalidade SaaS vencida há ${daysOverdue} dia(s).`,
            suspendedAt: sub.suspendedAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
      }
      return sub;
    });

    SaasSubscriptionService.saveSubscriptions(updatedList);
    return {
      checked: list.length,
      locked: lockedCount,
      lockedAcademies
    };
  }

  /**
   * Sincroniza assinaturas a partir de uma lista de RegisteredAcademy caso existam filiais recém criadas
   */
  static syncWithAcademies(academies: { id: string; name: string; branch?: string; legalRepresentativeName?: string; email?: string; phone?: string; cnpj?: string; billingDueDay?: number }[]): void {
    const list = SaasSubscriptionService.getSubscriptions();
    let hasChanges = false;

    academies.forEach(acad => {
      const exists = list.some(s => s.academyId === acad.id);
      if (!exists && acad.id !== 'all') {
        const newSub: SaasSubscription = {
          id: `sub_${acad.id}_${Date.now()}`,
          academyId: acad.id,
          academyName: acad.name,
          branchName: acad.branch || 'Matriz',
          responsibleName: acad.legalRepresentativeName || 'Responsável Legal',
          responsibleEmail: acad.email || 'contato@bjjacademy.com.br',
          responsiblePhone: acad.phone || '(00) 00000-0000',
          responsibleCpfCnpj: acad.cnpj || '',
          planTier: 'BASICO',
          planName: 'Plano Básico (Até 40 Alunos)',
          monthlyFeeBRL: 99.90,
          maxActiveStudents: 40,
          billingDueDay: acad.billingDueDay || 10,
          dueDate: formatDateYYYYMMDD(new Date(currentYear, currentMonth, acad.billingDueDay || 10)),
          paymentStatus: 'EM_DIA',
          isAccessSuspended: false,
          paymentHistory: []
        };
        list.push(newSub);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      SaasSubscriptionService.saveSubscriptions(list);
    }
  }
}
