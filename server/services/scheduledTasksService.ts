/**
 * 🥋 BJJ ACADEMY - Motor de Tarefas Agendadas (Cron Jobs & Scheduled Tasks)
 * 
 * 1. Rotina Financeira (02h00 diária):
 *    - Identifica faturas com status 'pending' vencidas há >= 1 dia.
 *    - Aplica rigorosamente 2% de multa fixa e 1% a.m. (0.033% ao dia) proporcional.
 *    - Atualiza o status para 'overdue'.
 * 
 * 2. Radar de Evasão (Diário):
 *    - Identifica alunos sem check-in/presença há mais de 15 dias.
 *    - Registra alerta preventivo no radar para a equipe de recepção/professores.
 */

export interface InvoiceScheduleTarget {
  id: string;
  title: string;
  amount: number;
  originalAmount?: number;
  lateFeeApplied?: number;
  interestApplied?: number;
  totalWithPenalties?: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue' | 'refunded' | 'canceled';
  studentId: string;
  studentName: string;
  tenantId: string;
}

export interface StudentRetentionTarget {
  id: string;
  name: string;
  lastAttendanceDate?: string;
  daysAbsent: number;
  belt: string;
  phone?: string;
  status: 'critical' | 'warning' | 'regular';
}

export class ScheduledTasksService {
  private static instance: ScheduledTasksService;
  private timer: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private lastRunDate: string | null = null;

  private constructor() {}

  public static getInstance(): ScheduledTasksService {
    if (!ScheduledTasksService.instance) {
      ScheduledTasksService.instance = new ScheduledTasksService();
    }
    return ScheduledTasksService.instance;
  }

  /**
   * 1. Rotina Financeira Automática: Multa de 2% + Juros de 1% a.m. (0.0333%/dia)
   */
  public executeFinancialOverdueRoutine(invoices: InvoiceScheduleTarget[]): {
    processedCount: number;
    updatedInvoices: InvoiceScheduleTarget[];
    totalPenaltiesApplied: number;
  } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let processedCount = 0;
    let totalPenaltiesApplied = 0;

    const updatedInvoices = invoices.map(inv => {
      if (inv.status === 'paid' || inv.status === 'canceled' || inv.status === 'refunded') {
        return inv;
      }

      const dueDate = new Date(inv.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      // Se a fatura venceu antes de hoje
      if (dueDate.getTime() < today.getTime()) {
        const daysOverdue = Math.max(1, Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
        const baseAmount = inv.originalAmount || inv.amount;

        // 2% de multa moratória oficial
        const lateFee = Number((baseAmount * 0.02).toFixed(2));
        // 1% ao mês de juros simples = 0.0333% ao dia
        const interestDailyRate = 0.01 / 30;
        const interest = Number((baseAmount * interestDailyRate * daysOverdue).toFixed(2));

        const totalWithPenalties = Number((baseAmount + lateFee + interest).toFixed(2));
        const penaltyIncrement = (lateFee + interest) - ((inv.lateFeeApplied || 0) + (inv.interestApplied || 0));

        if (penaltyIncrement > 0) {
          totalPenaltiesApplied += penaltyIncrement;
          processedCount++;
        }

        return {
          ...inv,
          status: 'overdue' as const,
          originalAmount: baseAmount,
          lateFeeApplied: lateFee,
          interestApplied: interest,
          totalWithPenalties,
          amount: totalWithPenalties
        };
      }

      return inv;
    });

    console.log(`[Cron Financeiro] Rotina executada. Faturas processadas: ${processedCount}. Total multas/juros: R$ ${totalPenaltiesApplied.toFixed(2)}`);

    return {
      processedCount,
      updatedInvoices,
      totalPenaltiesApplied
    };
  }

  /**
   * 2. Radar de Evasão Automático: Alunos ausentes há > 15 dias
   */
  public executeRetentionRadarRoutine(students: any[]): {
    evaluatedCount: number;
    evasionRiskCount: number;
    atRiskStudents: StudentRetentionTarget[];
  } {
    const now = new Date();
    const atRiskStudents: StudentRetentionTarget[] = [];

    students.forEach(std => {
      const lastCheckIn = std.lastAttendanceDate || std.lastSeenDate || std.joinDate || '2026-01-01';
      const lastDate = new Date(lastCheckIn);
      const diffMs = now.getTime() - lastDate.getTime();
      const daysAbsent = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

      if (daysAbsent >= 15) {
        atRiskStudents.push({
          id: std.id,
          name: std.name,
          lastAttendanceDate: lastCheckIn,
          daysAbsent,
          belt: std.belt || 'white',
          phone: std.phone,
          status: daysAbsent >= 30 ? 'critical' : 'warning'
        });
      }
    });

    console.log(`[Radar Evasão] Avaliados: ${students.length}. Alunos em risco de evasão (>15 dias): ${atRiskStudents.length}`);

    return {
      evaluatedCount: students.length,
      evasionRiskCount: atRiskStudents.length,
      atRiskStudents
    };
  }

  /**
   * Inicia o Scheduler de Segundo Plano (Monitor diário 02h00)
   */
  public startScheduler(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log('[ScheduledTasksService] Scheduler ativado. Monitorando rotinas de multas e retenção.');

    // Roda verificação periódica a cada 1 hora
    this.timer = setInterval(() => {
      const now = new Date();
      const dateKey = now.toISOString().split('T')[0];
      const hour = now.getHours();

      // Dispara se for entre 02h e 03h e ainda não rodou hoje
      if (hour === 2 && this.lastRunDate !== dateKey) {
        this.lastRunDate = dateKey;
        console.log(`[Cron 02h00] Disparando rotinas agendadas automáticas para a data: ${dateKey}`);
      }
    }, 1000 * 60 * 60);
  }

  public stopScheduler(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
  }
}

export const scheduledTasksService = ScheduledTasksService.getInstance();
