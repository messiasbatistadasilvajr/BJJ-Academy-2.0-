import { SaasPlanTier, SAAS_PLAN_LIMITS, SAAS_PLAN_DETAILS } from '../../src/types';
import { financialAuditService } from './financialAuditService';

export interface TenantConfig {
  id: string;
  name: string;
  saasPlanTier: SaasPlanTier;
  maxActiveStudentsLimit: number;
  activeStudentsCount: number;
}

export interface StudentEnrollmentPayload {
  tenantId: string;
  student: {
    id: string;
    name: string;
    email?: string;
    status?: 'ATIVO' | 'INATIVO';
    belt?: string;
  };
  clientCountOverride?: number; // Permite sincronia atômica direta do frontend/Firestore
}

export interface ValidationResult {
  allowed: boolean;
  code: 'APPROVED' | 'PLAN_LIMIT_REACHED' | 'INVALID_TENANT' | 'INVALID_DATA';
  message: string;
  tenantId: string;
  tenantName: string;
  planTier: SaasPlanTier;
  limit: number;
  currentActive: number;
  remainingSlots: number;
  suggestedUpgradeTier?: SaasPlanTier;
}

class TenantValidationService {
  // Store default multi-tenant academies and their plan tiers
  private tenantsMap: Map<string, TenantConfig> = new Map([
    [
      'acad_loyalty_jiujitsu',
      {
        id: 'acad_loyalty_jiujitsu',
        name: 'Loyalty Jiu-Jitsu (Matriz Oficial)',
        saasPlanTier: 'OURO',
        maxActiveStudentsLimit: SAAS_PLAN_LIMITS.OURO, // 999999 (Ilimitado)
        activeStudentsCount: 165
      }
    ],
    [
      'acad_bjj_jardins',
      {
        id: 'acad_bjj_jardins',
        name: 'BJJ Academy Jardins',
        saasPlanTier: 'PRATA',
        maxActiveStudentsLimit: SAAS_PLAN_LIMITS.PRATA, // 150
        activeStudentsCount: 112
      }
    ],
    [
      'acad_gracie_barra',
      {
        id: 'acad_gracie_barra',
        name: 'Gracie Barra Centro',
        saasPlanTier: 'BRONZE',
        maxActiveStudentsLimit: SAAS_PLAN_LIMITS.BRONZE, // 40 (Ideal para testar o limite de 40 alunos)
        activeStudentsCount: 38
      }
    ],
    [
      'acad_checkmat_vm',
      {
        id: 'acad_checkmat_vm',
        name: 'Checkmat Tatame Vila Mariana',
        saasPlanTier: 'BRONZE',
        maxActiveStudentsLimit: SAAS_PLAN_LIMITS.BRONZE, // 40 (Teto cheio para teste de bloqueio)
        activeStudentsCount: 40
      }
    ]
  ]);

  /**
   * Retrieves or initializes tenant config
   */
  public getTenant(tenantId: string): TenantConfig {
    if (!this.tenantsMap.has(tenantId)) {
      // Default to Bronze for new unregistered tenants
      this.tenantsMap.set(tenantId, {
        id: tenantId,
        name: `Academia ${tenantId}`,
        saasPlanTier: 'BRONZE',
        maxActiveStudentsLimit: SAAS_PLAN_LIMITS.BRONZE,
        activeStudentsCount: 0
      });
    }
    return this.tenantsMap.get(tenantId)!;
  }

  /**
   * Regra de Bloqueio no Banco de Dados / API (Database & API Tier)
   * 
   * Antes de executar o INSERT / CREATE de novo aluno:
   * 1. Busca os dados do plano da academia (tenants)
   * 2. Verifica a quantidade de alunos ATIVOS
   * 3. Se status === 'ATIVO' e total >= limite: BLOQUEIA com 403 Forbidden
   * 4. Se estiver dentro do limite: AUTORIZA e registra na auditoria
   */
  public validateStudentEnrollment(payload: StudentEnrollmentPayload): ValidationResult {
    const { tenantId, student, clientCountOverride } = payload;

    if (!tenantId) {
      return {
        allowed: false,
        code: 'INVALID_TENANT',
        message: 'Tenant ID da academia é obrigatório para validação de plano.',
        tenantId: '',
        tenantName: 'Desconhecida',
        planTier: 'BRONZE',
        limit: 40,
        currentActive: 0,
        remainingSlots: 0
      };
    }

    const tenant = this.getTenant(tenantId);
    
    // Alunos com status INATIVO não consomem vaga no plano
    const studentStatus = student.status || 'ATIVO';
    const isAddingActive = studentStatus === 'ATIVO';

    // Determina o contador de ativos mais atualizado
    const currentActive = typeof clientCountOverride === 'number' 
      ? clientCountOverride 
      : tenant.activeStudentsCount;

    // Se o aluno for inativo, sempre permite o cadastro
    if (!isAddingActive) {
      financialAuditService.record({
        tenantId,
        action: 'STUDENT_ENROLLMENT_INACTIVE_BYPASS',
        entity: 'student',
        entityId: student.id || 'new_student',
        origin: 'database_tier_rule',
        result: 'success',
        details: {
          studentName: student.name,
          status: 'INATIVO',
          planTier: tenant.saasPlanTier,
          note: 'Aluno cadastrado com status INATIVO. Não consome cota do plano SaaS.'
        }
      });

      return {
        allowed: true,
        code: 'APPROVED',
        message: 'Aluno inativo cadastrado com sucesso (não consome cota de plano).',
        tenantId,
        tenantName: tenant.name,
        planTier: tenant.saasPlanTier,
        limit: tenant.maxActiveStudentsLimit,
        currentActive,
        remainingSlots: Math.max(0, tenant.maxActiveStudentsLimit - currentActive)
      };
    }

    // Regra de Trava: Valida o limite do plano contratado
    if (currentActive >= tenant.maxActiveStudentsLimit) {
      const suggestedUpgradeTier: SaasPlanTier = tenant.saasPlanTier === 'BRONZE' ? 'PRATA' : 'OURO';

      // Registra tentativa bloqueada no log de auditoria corporativo
      financialAuditService.record({
        tenantId,
        action: 'STUDENT_ENROLLMENT_BLOCKED_LIMIT_REACHED',
        entity: 'student',
        entityId: student.id || 'rejected_student',
        origin: 'database_tier_rule',
        result: 'blocked',
        details: {
          studentName: student.name,
          currentActive,
          limit: tenant.maxActiveStudentsLimit,
          planTier: tenant.saasPlanTier,
          suggestedUpgradeTier
        }
      });

      return {
        allowed: false,
        code: 'PLAN_LIMIT_REACHED',
        message: `Limite de alunos ativos atingido para o ${SAAS_PLAN_DETAILS[tenant.saasPlanTier].label} (${currentActive}/${tenant.maxActiveStudentsLimit} alunos). Faça o upgrade para o ${SAAS_PLAN_DETAILS[suggestedUpgradeTier].label} para continuar cadastrando.`,
        tenantId,
        tenantName: tenant.name,
        planTier: tenant.saasPlanTier,
        limit: tenant.maxActiveStudentsLimit,
        currentActive,
        remainingSlots: 0,
        suggestedUpgradeTier
      };
    }

    // Autorizado! Atualiza contador e registra auditoria
    tenant.activeStudentsCount = currentActive + 1;
    const remainingSlots = tenant.maxActiveStudentsLimit - tenant.activeStudentsCount;

    financialAuditService.record({
      tenantId,
      action: 'STUDENT_ENROLLMENT_APPROVED',
      entity: 'student',
      entityId: student.id || 'new_student',
      origin: 'database_tier_rule',
      result: 'success',
      details: {
        studentName: student.name,
        planTier: tenant.saasPlanTier,
        newActiveCount: tenant.activeStudentsCount,
        remainingSlots
      }
    });

    return {
      allowed: true,
      code: 'APPROVED',
      message: 'Cadastro autorizado dentro dos limites do plano atual.',
      tenantId,
      tenantName: tenant.name,
      planTier: tenant.saasPlanTier,
      limit: tenant.maxActiveStudentsLimit,
      currentActive: tenant.activeStudentsCount,
      remainingSlots
    };
  }

  /**
   * Realiza o upgrade do plano SaaS da academia e libera vagas instantaneamente
   */
  public upgradePlan(tenantId: string, newPlanTier: SaasPlanTier): { success: boolean; tenant: TenantConfig; message: string } {
    const tenant = this.getTenant(tenantId);
    const oldTier = tenant.saasPlanTier;
    const oldLimit = tenant.maxActiveStudentsLimit;

    tenant.saasPlanTier = newPlanTier;
    tenant.maxActiveStudentsLimit = SAAS_PLAN_LIMITS[newPlanTier];

    financialAuditService.record({
      tenantId,
      action: 'TENANT_PLAN_UPGRADED',
      entity: 'tenant_subscription',
      entityId: tenantId,
      origin: 'saas_billing',
      result: 'success',
      details: {
        previousTier: oldTier,
        previousLimit: oldLimit,
        newTier: newPlanTier,
        newLimit: tenant.maxActiveStudentsLimit,
        monthlyFeeBRL: SAAS_PLAN_DETAILS[newPlanTier].monthlyBRL
      }
    });

    return {
      success: true,
      tenant,
      message: `Upgrade para o ${SAAS_PLAN_DETAILS[newPlanTier].label} concluído com sucesso! Limite expandido para ${tenant.maxActiveStudentsLimit === 999999 ? 'Ilimitado' : tenant.maxActiveStudentsLimit} alunos ativos.`
    };
  }

  /**
   * Retorna o status de consumo do plano da academia
   */
  public getPlanStatus(tenantId: string, activeStudentsCountOverride?: number) {
    const tenant = this.getTenant(tenantId);
    const count = typeof activeStudentsCountOverride === 'number' ? activeStudentsCountOverride : tenant.activeStudentsCount;
    tenant.activeStudentsCount = count;

    const limit = tenant.maxActiveStudentsLimit;
    const usagePercent = limit >= 999999 ? 0 : Math.min(100, Math.round((count / limit) * 100));
    const isAtLimit = count >= limit;
    const isNearLimit = usagePercent >= 85 && !isAtLimit;
    const remainingSlots = Math.max(0, limit - count);

    return {
      tenantId,
      tenantName: tenant.name,
      planTier: tenant.saasPlanTier,
      planDetails: SAAS_PLAN_DETAILS[tenant.saasPlanTier],
      limit,
      activeStudentsCount: count,
      remainingSlots,
      usagePercent,
      isNearLimit,
      isAtLimit,
      suggestedUpgradeTier: tenant.saasPlanTier === 'BRONZE' ? 'PRATA' : tenant.saasPlanTier === 'PRATA' ? 'OURO' : null
    };
  }

  /**
   * Atualiza a contagem atômica de alunos ativos após remoção ou inativação
   */
  public updateActiveCount(tenantId: string, count: number): void {
    const tenant = this.getTenant(tenantId);
    tenant.activeStudentsCount = Math.max(0, count);
  }
}

export const tenantValidationService = new TenantValidationService();
