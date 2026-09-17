import { StudentProfile, RegisteredAcademy, SaasPlanTier, SAAS_PLAN_LIMITS, SAAS_PLAN_DETAILS } from '../types';
import { saveStudentToFirestore, saveAcademyToFirestore } from '../firebase/firestoreService';

export interface PlanValidationResponse {
  allowed: boolean;
  status: 'APPROVED' | 'PLAN_LIMIT_REACHED' | 'INVALID_TENANT' | 'ERROR';
  message: string;
  planTier: SaasPlanTier;
  limit: number;
  currentActive: number;
  remainingSlots: number;
  suggestedUpgradeTier?: SaasPlanTier;
}

export class StudentEnrollmentService {
  /**
   * Validação pré-cadastro com Database Tier & API
   * Valida se a academia possui cota disponível antes de salvar no Firestore
   */
  static async validateAndEnroll(params: {
    academy: RegisteredAcademy;
    student: Partial<StudentProfile>;
    allStudents: StudentProfile[];
  }): Promise<PlanValidationResponse> {
    const { academy, student, allStudents } = params;
    const tenantId = academy.id || 'acad_loyalty_jiujitsu';
    
    // Alunos ativos pertencentes a esta academia
    const activeCount = allStudents.filter(s => 
      (s.academyId === academy.id || s.tenantId === academy.id) && 
      (s.status === 'ATIVO' || s.status === undefined)
    ).length;

    const studentStatus = student.status || 'ATIVO';

    try {
      // 1. Chamada à API para validação autoritativa no Backend/Database Tier
      const response = await fetch('/api/students/validate-and-enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          student: {
            id: student.id,
            name: student.name,
            email: student.email,
            status: studentStatus,
            belt: student.belt
          },
          clientCountOverride: activeCount
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          allowed: false,
          status: 'PLAN_LIMIT_REACHED',
          message: data.message || `Limite de alunos atingido para o plano ${academy.saasPlanTier || 'BRONZE'}.`,
          planTier: data.planTier || academy.saasPlanTier || 'BRONZE',
          limit: data.limit || SAAS_PLAN_LIMITS[academy.saasPlanTier || 'BRONZE'],
          currentActive: data.currentActive ?? activeCount,
          remainingSlots: data.remainingSlots ?? 0,
          suggestedUpgradeTier: data.suggestedUpgradeTier || (academy.saasPlanTier === 'BRONZE' ? 'PRATA' : 'OURO')
        };
      }

      return {
        allowed: true,
        status: 'APPROVED',
        message: data.message || 'Cadastro autorizado dentro dos limites.',
        planTier: data.planTier || academy.saasPlanTier || 'BRONZE',
        limit: data.limit,
        currentActive: data.currentActive,
        remainingSlots: data.remainingSlots
      };
    } catch (err) {
      console.warn('[StudentEnrollmentService] Falha na rede do backend, aplicando validação resiliente local:', err);
      
      // Fallback resiliente local se a rede offline
      const tier: SaasPlanTier = academy.saasPlanTier || 'BRONZE';
      const limit = academy.maxActiveStudentsLimit || SAAS_PLAN_LIMITS[tier];

      if (studentStatus === 'ATIVO' && activeCount >= limit) {
        return {
          allowed: false,
          status: 'PLAN_LIMIT_REACHED',
          message: `Limite de alunos ativos atingido para o ${SAAS_PLAN_DETAILS[tier].label} (${activeCount}/${limit}). Faça o upgrade para continuar.`,
          planTier: tier,
          limit,
          currentActive: activeCount,
          remainingSlots: 0,
          suggestedUpgradeTier: tier === 'BRONZE' ? 'PRATA' : 'OURO'
        };
      }

      return {
        allowed: true,
        status: 'APPROVED',
        message: 'Cadastro autorizado dentro do limite local.',
        planTier: tier,
        limit,
        currentActive: activeCount + 1,
        remainingSlots: Math.max(0, limit - (activeCount + 1))
      };
    }
  }

  /**
   * Realiza o upgrade imediato do plano SaaS da academia
   */
  static async upgradeAcademyPlan(
    academy: RegisteredAcademy,
    newTier: SaasPlanTier
  ): Promise<{ success: boolean; updatedAcademy: RegisteredAcademy; message: string }> {
    const tenantId = academy.id || 'acad_loyalty_jiujitsu';
    const newLimit = SAAS_PLAN_LIMITS[newTier];

    const updatedAcademy: RegisteredAcademy = {
      ...academy,
      saasPlanTier: newTier,
      maxActiveStudentsLimit: newLimit,
      monthlyPlatformFeeBRL: SAAS_PLAN_DETAILS[newTier].monthlyBRL
    };

    try {
      // 1. Notifica Backend API
      await fetch(`/api/tenants/${tenantId}/upgrade-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPlanTier: newTier })
      });
    } catch (e) {
      console.warn('[StudentEnrollmentService] Backend upgrade offline, atualizando estado em nuvem diretamente.');
    }

    // 2. Persiste no Firestore
    try {
      await saveAcademyToFirestore(updatedAcademy);
    } catch (firestoreErr) {
      console.error('[StudentEnrollmentService] Erro ao salvar academia no Firestore:', firestoreErr);
    }

    return {
      success: true,
      updatedAcademy,
      message: `Upgrade concluído com sucesso para o ${SAAS_PLAN_DETAILS[newTier].label}! O novo limite é de ${newLimit === 999999 ? 'Alunos Ilimitados' : `${newLimit} alunos ativos`}.`
    };
  }

  /**
   * Sincroniza a contagem atômica de alunos ativos da academia
   */
  static async syncActiveStudentsCount(academy: RegisteredAcademy, allStudents: StudentProfile[]): Promise<number> {
    const activeCount = allStudents.filter(s => 
      (s.academyId === academy.id || s.tenantId === academy.id) && 
      (s.status === 'ATIVO' || s.status === undefined)
    ).length;

    if (academy.activeStudentsCount !== activeCount) {
      const updatedAcademy: RegisteredAcademy = {
        ...academy,
        activeStudentsCount: activeCount
      };

      try {
        await saveAcademyToFirestore(updatedAcademy);
      } catch (e) {
        console.warn('Erro ao atualizar activeStudentsCount no Firestore:', e);
      }

      try {
        await fetch(`/api/tenants/${academy.id}/sync-count`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ count: activeCount })
        });
      } catch (e) {
        // Ignora erro offline
      }
    }

    return activeCount;
  }
}
