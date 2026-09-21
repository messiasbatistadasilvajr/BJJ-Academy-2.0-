import { financialQueueService, FinancialQueueJob } from './queueService';
import { idempotencyService } from './idempotencyService';
import { FinancialStateMachine, InternalInvoiceStatus } from './stateMachine';
import { financialAuditService } from './financialAuditService';
import { whatsappService } from './whatsappService';
import { asaasSubaccountService } from './asaasSubaccountService';
import { AsaasWebhookPayload } from '../../src/types';

export interface ProcessedWebhookNotification {
  id: string;
  tenantId: string;
  title: string;
  body: string;
  timestamp: string;
  type: 'payment' | 'warning' | 'audit';
}

class FinancialWorker {
  private isProcessing = false;
  private workerInterval: NodeJS.Timeout | null = null;
  private activeWorkers = 1;
  private notifications: ProcessedWebhookNotification[] = [];

  /**
   * Starts the background queue worker
   */
  public start() {
    if (this.workerInterval) return;
    console.log('[Motor Financeiro] Worker de Filas (webhook-ingestion-queue) iniciado com suporte a DLQ.');

    this.workerInterval = setInterval(() => {
      this.pollNextJob();
    }, 400);
  }

  /**
   * Stops the background worker
   */
  public stop() {
    if (this.workerInterval) {
      clearInterval(this.workerInterval);
      this.workerInterval = null;
    }
  }

  private async pollNextJob() {
    if (this.isProcessing) return;

    try {
      const job = await financialQueueService.dequeue();
      if (!job) return;

      this.isProcessing = true;
      await this.handleJob(job);
    } catch (err: any) {
      console.error('[Motor Financeiro Worker] Erro no ciclo de polling:', err);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Processes an individual financial queue job from webhook-ingestion-queue
   */
  public async handleJob(job: FinancialQueueJob): Promise<void> {
    // Suporta eventos Asaas diretos ou eventos unificados (Stripe / Mercado Pago)
    if (job.type === 'GATEWAY_WEBHOOK_EVENT') {
      await this.handleUnifiedGatewayJob(job);
      return;
    }

    const payload = job.payload as AsaasWebhookPayload;
    const eventType = payload.event;
    const payment = payload.payment;
    const eventId = payload.id || `evt_${Date.now()}`;
    const paymentId = payment?.id || 'unknown_payment';
    const tenantId = (payment?.customer?.startsWith('acad_') ? payment.customer : 'acad_matriz');

    // 1. Check idempotency for this event
    const idempotencyKey = idempotencyService.makeKey('asaas', `${eventId}_${eventType}`);
    const { acquired, existingEntry } = await idempotencyService.acquireLock(idempotencyKey);

    if (!acquired && existingEntry?.status === 'completed') {
      console.log(`[Worker] Idempotência ativada: Evento ${eventType} (${eventId}) já foi processado anteriormente. Ignorando duplicata com segurança.`);
      financialAuditService.record({
        tenantId,
        action: 'WEBHOOK_DUPLICATE_IGNORED',
        entity: 'webhook',
        entityId: eventId,
        origin: 'financial_worker',
        result: 'ignored_duplicate',
        details: { eventType, paymentId, reason: 'Evento duplicado detectado pelo cache de Idempotência' }
      });
      await financialQueueService.markCompleted(job.id);
      return;
    }

    try {
      // 2. Map Asaas event to internal Invoice Status
      const targetStatus = FinancialStateMachine.mapAsaasEventToStatus(eventType);

      if (!targetStatus) {
        console.log(`[Worker] Evento informativo Asaas recebido sem alteração de saldo: ${eventType}`);
        financialAuditService.record({
          tenantId,
          action: 'WEBHOOK_PROCESSED',
          entity: 'webhook',
          entityId: eventId,
          origin: 'financial_worker',
          result: 'success',
          details: { eventType, paymentId, note: 'Evento informativo arquivado' }
        });
        await idempotencyService.markCompleted(idempotencyKey, { processed: true, eventType });
        await financialQueueService.markCompleted(job.id);
        return;
      }

      // 3. State Machine transition check
      const currentStatus: InternalInvoiceStatus = 'pending';
      const evalResult = FinancialStateMachine.evaluateTransition(currentStatus, targetStatus, eventType);

      if (!evalResult.isValid) {
        if (evalResult.action === 'ignore_obsolete') {
          financialAuditService.record({
            tenantId,
            action: 'WEBHOOK_DUPLICATE_IGNORED',
            entity: 'invoice',
            entityId: paymentId,
            origin: 'financial_worker',
            result: 'ignored_duplicate',
            details: { reason: evalResult.message, currentStatus, targetStatus, eventType }
          });
          await idempotencyService.markCompleted(idempotencyKey, { ignored: true, reason: evalResult.message });
          await financialQueueService.markCompleted(job.id);
          return;
        } else {
          throw new Error(evalResult.message);
        }
      }

      // 4. Financial Mutation & Audit Record
      let auditAction: any = 'WEBHOOK_PROCESSED';
      let notifTitle = 'Atualização Financeira';
      let notifBody = `Cobrança ${paymentId} atualizada para ${targetStatus}.`;

      if (targetStatus === 'paid') {
        auditAction = 'PAYMENT_RECEIVED';
        notifTitle = '💰 Pagamento Asaas Confirmado!';
        notifBody = `Pagamento de R$ ${(payment?.value || 0).toFixed(2)} liquidado com baixa automática no sistema.`;
      } else if (targetStatus === 'overdue') {
        auditAction = 'CHARGE_OVERDUE';
        notifTitle = '⚠️ Cobrança Vencida (Asaas)';
        notifBody = `A fatura de R$ ${(payment?.value || 0).toFixed(2)} atingiu a data de vencimento.`;
      } else if (targetStatus === 'refunded') {
        auditAction = 'PAYMENT_REFUNDED';
        notifTitle = '↩️ Estorno Processado (Asaas)';
        notifBody = `Estorno de R$ ${(payment?.value || 0).toFixed(2)} efetuado com sucesso.`;
      }

      // 4.1 Processa Assinatura de Software do Tenant (se for evento de plano SaaS)
      if (payment?.subscription) {
        asaasSubaccountService.handleTenantSubscriptionWebhook(eventType, payment);
      }

      // 4.2 Disparo Automatizado de Alerta via WhatsApp para Alunos (PAYMENT_OVERDUE)
      if (eventType === 'PAYMENT_OVERDUE' && !payment?.subscription) {
        const studentName = (payment as any)?.studentName ||
          payment?.description?.split('-')?.[1]?.trim() ||
          (payment as any)?.customerName ||
          'Atleta Loyalty BJJ';
        const studentPhone = (payment as any)?.mobilePhone || (payment as any)?.phone || '85998765432';
        const academyName = (payment as any)?.academyName || 'Loyalty Jiu-Jitsu';
        const linkPagamento = payment?.invoiceUrl || payment?.bankSlipUrl || `https://sandbox.asaas.com/i/${paymentId}`;

        try {
          await whatsappService.enviarAlertaVencimentoAluno({
            alunoNome: studentName,
            alunoTelefone: studentPhone,
            academiaNome: academyName,
            linkPagamento,
            valor: payment?.value,
            dataVencimento: payment?.dueDate,
            tenantId
          });
          console.log(`[Worker] Alerta de WhatsApp de vencimento disparado para ${studentName} (${studentPhone})`);
        } catch (wppErr: any) {
          console.warn('[Worker] Falha ao disparar alerta WhatsApp (não bloqueia job):', wppErr.message);
        }
      }

      financialAuditService.record({
        tenantId,
        action: auditAction,
        entity: 'invoice',
        entityId: paymentId,
        origin: 'financial_worker',
        result: 'success',
        details: {
          eventType,
          targetStatus,
          amount: payment?.value,
          netValue: payment?.netValue,
          billingType: payment?.billingType,
          clientPaymentDate: payment?.clientPaymentDate || new Date().toISOString()
        }
      });

      // 5. Store in-app notification
      const notif: ProcessedWebhookNotification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        tenantId,
        title: notifTitle,
        body: notifBody,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        type: targetStatus === 'paid' ? 'payment' : targetStatus === 'overdue' ? 'warning' : 'audit'
      };
      this.notifications.unshift(notif);
      if (this.notifications.length > 50) this.notifications.pop();

      // 6. Complete Idempotency & Job
      await idempotencyService.markCompleted(idempotencyKey, {
        status: 'completed',
        targetStatus,
        paymentId,
        processedAt: new Date().toISOString()
      });

      await financialQueueService.markCompleted(job.id);
      console.log(`[Worker] Job ${job.id} processado com sucesso: ${eventType} -> Status ${targetStatus}`);
    } catch (err: any) {
      console.error(`[Worker] Erro ao processar job ${job.id} (Tentativa ${job.attempts}/${job.maxAttempts}):`, err.message);
      await idempotencyService.releaseOrMarkFailed(idempotencyKey);
      
      // Volta para a fila com backoff exponencial ou move para DLQ após 3 tentativas
      const failureResult = await financialQueueService.markFailed(job.id, err.message);
      if (failureResult.movedToDlq) {
        financialAuditService.record({
          tenantId,
          action: 'WEBHOOK_PROCESSED',
          entity: 'webhook',
          entityId: eventId,
          origin: 'financial_worker_dlq',
          result: 'failed',
          details: {
            jobId: job.id,
            error: err.message,
            attempts: job.attempts,
            movedToDlq: true
          }
        });
      }
    }
  }

  /**
   * Processa jobs normalizados de múltiplos gateways (Mercado Pago, Stripe)
   */
  private async handleUnifiedGatewayJob(job: FinancialQueueJob): Promise<void> {
    const { parsedEvent } = job.payload || {};
    if (!parsedEvent) {
      await financialQueueService.markCompleted(job.id);
      return;
    }

    const gateway = parsedEvent.gateway || job.gateway || 'gateway';
    const eventId = `evt_${job.id}`;
    const idempotencyKey = idempotencyService.makeKey(gateway, `${parsedEvent.externalChargeId}_${parsedEvent.eventType}`);
    const { acquired, existingEntry } = await idempotencyService.acquireLock(idempotencyKey);

    if (!acquired && existingEntry?.status === 'completed') {
      console.log(`[Worker] Idempotência ativada para gateway ${gateway}. Ignorando duplicata.`);
      await financialQueueService.markCompleted(job.id);
      return;
    }

    try {
      financialAuditService.record({
        tenantId: parsedEvent.tenantId || 'acad_matriz',
        action: parsedEvent.status === 'paid' ? 'PAYMENT_RECEIVED' : 'WEBHOOK_PROCESSED',
        entity: 'invoice',
        entityId: parsedEvent.externalChargeId,
        origin: 'financial_worker',
        result: 'success',
        details: {
          gateway,
          amount: parsedEvent.amount,
          status: parsedEvent.status,
          paymentMethod: parsedEvent.paymentMethod,
          paidAt: parsedEvent.paidAt
        }
      });

      console.log(`[Worker] Pagamento baixado via ${gateway.toUpperCase()} (Fila webhook-ingestion-queue): Cobrança ${parsedEvent.externalChargeId} -> R$ ${parsedEvent.amount}`);

      await idempotencyService.markCompleted(idempotencyKey, {
        status: 'completed',
        externalChargeId: parsedEvent.externalChargeId,
        processedAt: new Date().toISOString()
      });

      await financialQueueService.markCompleted(job.id);
    } catch (err: any) {
      console.error(`[Worker] Falha ao processar evento de gateway ${job.id}:`, err.message);
      await idempotencyService.releaseOrMarkFailed(idempotencyKey);
      await financialQueueService.markFailed(job.id, err.message);
    }
  }

  public getNotifications(tenantId?: string): ProcessedWebhookNotification[] {
    if (!tenantId || tenantId === 'all') {
      return this.notifications;
    }
    return this.notifications.filter(n => n.tenantId === tenantId);
  }

  public getWorkerStats() {
    return {
      isRunning: this.workerInterval !== null,
      isProcessing: this.isProcessing,
      activeWorkers: this.activeWorkers,
      notificationsCount: this.notifications.length
    };
  }
}

export const financialWorker = new FinancialWorker();
