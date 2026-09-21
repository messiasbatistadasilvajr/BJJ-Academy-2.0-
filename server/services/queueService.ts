import Redis from 'ioredis';
import { Queue, Worker, Job } from 'bullmq';
import { idempotencyService } from './idempotencyService';

export interface FinancialQueueJob {
  id: string;
  type: string; // e.g. 'ASAAS_WEBHOOK_EVENT', 'GATEWAY_WEBHOOK_EVENT'
  payload: any;
  attempts: number;
  maxAttempts: number;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'dead_letter';
  createdAt: number;
  lastAttemptAt?: number;
  nextRetryAt?: number;
  lastError?: string;
  gateway?: string;
}

export const QUEUE_NAME = 'webhook-ingestion-queue';
export const DLQ_QUEUE_NAME = 'webhook-dead-letter-queue';

class FinancialQueueService {
  private redisConnection: Redis | null = null;
  private bullQueue: Queue | null = null;
  private bullDlqQueue: Queue | null = null;
  
  // Resilient in-memory fallback queues when Redis is unavailable
  private inMemoryQueue: FinancialQueueJob[] = [];
  private inFlightJobs: Map<string, FinancialQueueJob> = new Map();
  private deadLetterJobs: FinancialQueueJob[] = [];
  private completedCount = 0;
  private failedCount = 0;

  constructor() {
    this.initRedisAndBullMQ();
  }

  private initRedisAndBullMQ() {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl && redisUrl.trim().length > 0) {
      try {
        this.redisConnection = new Redis(redisUrl, {
          maxRetriesPerRequest: null, // BullMQ requirement
          enableReadyCheck: false,
          connectTimeout: 3000
        });

        this.redisConnection.on('connect', () => {
          console.log(`[BullMQ / Redis] Conectado com sucesso ao Redis (${redisUrl.replace(/:[^:@]+@/, ':***@')})`);
        });

        this.redisConnection.on('error', (err) => {
          console.warn('[BullMQ / Redis] Conexão com Redis oscilou. Usando fallback resiliente:', err.message);
        });

        // Initialize BullMQ Queue
        this.bullQueue = new Queue(QUEUE_NAME, {
          connection: this.redisConnection,
          defaultJobOptions: {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 1000 // 1s, 2s, 4s
            },
            removeOnComplete: 1000,
            removeOnFail: false
          }
        });

        // Initialize Dead Letter Queue
        this.bullDlqQueue = new Queue(DLQ_QUEUE_NAME, {
          connection: this.redisConnection,
          defaultJobOptions: {
            removeOnComplete: 5000,
            removeOnFail: false
          }
        });

        console.log(`[BullMQ] Filas inicializadas: '${QUEUE_NAME}' e '${DLQ_QUEUE_NAME}'.`);
      } catch (err: any) {
        console.warn('[BullMQ] Não foi possível inicializar BullMQ com Redis. Operando em modo de contingência em memória:', err.message);
        this.bullQueue = null;
        this.bullDlqQueue = null;
      }
    } else {
      console.log('[BullMQ / Fila] REDIS_URL não configurada. Fila em memória ativa com suporte a DLQ e retry exponencial (3 tentativas).');
    }
  }

  /**
   * Enfileira evento na fila `webhook-ingestion-queue`
   */
  public async enqueue(type: string, payload: any, maxAttempts = 3, gateway?: string): Promise<FinancialQueueJob> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const job: FinancialQueueJob = {
      id: jobId,
      type,
      payload,
      attempts: 0,
      maxAttempts,
      status: 'queued',
      createdAt: Date.now(),
      gateway
    };

    // 1. Tenta enfileirar no BullMQ se o Redis estiver disponível
    if (this.bullQueue && this.redisConnection && this.redisConnection.status === 'ready') {
      try {
        await this.bullQueue.add(type, { ...job }, {
          jobId,
          attempts: maxAttempts,
          backoff: {
            type: 'exponential',
            delay: 1000
          }
        });
        return job;
      } catch (err: any) {
        console.warn(`[BullMQ] Falha ao adicionar job no Redis (${err.message}). Utilizando fila em memória.`);
      }
    }

    // 2. Fallback de alta disponibilidade em memória
    this.inMemoryQueue.push(job);
    return job;
  }

  /**
   * Obtém o próximo job para o worker processar
   */
  public async dequeue(): Promise<FinancialQueueJob | null> {
    const now = Date.now();

    // Memory queue check (new jobs or jobs whose backoff delay has passed)
    const readyIndex = this.inMemoryQueue.findIndex(
      j => j.status === 'queued' && (!j.nextRetryAt || j.nextRetryAt <= now)
    );

    if (readyIndex !== -1) {
      const [job] = this.inMemoryQueue.splice(readyIndex, 1);
      job.status = 'processing';
      job.attempts += 1;
      job.lastAttemptAt = now;
      this.inFlightJobs.set(job.id, job);
      return job;
    }

    return null;
  }

  /**
   * Marca o job como concluído com sucesso
   */
  public async markCompleted(jobId: string): Promise<void> {
    const job = this.inFlightJobs.get(jobId);
    if (job) {
      job.status = 'completed';
      this.inFlightJobs.delete(jobId);
    }
    this.completedCount++;
  }

  /**
   * Registra falha, aplica Exponential Backoff (1s, 2s, 4s) e envia para DLQ após 3 tentativas
   */
  public async markFailed(jobId: string, error: string): Promise<{ willRetry: boolean; nextAttempt: number; movedToDlq: boolean }> {
    const job = this.inFlightJobs.get(jobId);
    if (!job) return { willRetry: false, nextAttempt: 0, movedToDlq: false };

    this.inFlightJobs.delete(jobId);
    this.failedCount++;
    job.lastError = error;

    // Se ainda não atingiu o limite de tentativas (ex: 3)
    if (job.attempts < job.maxAttempts) {
      // Exponential Backoff: 1s, 2s, 4s...
      const backoffMs = Math.pow(2, job.attempts - 1) * 1000;
      job.status = 'queued';
      job.nextRetryAt = Date.now() + backoffMs;

      // Re-enfileira para reprocessamento
      this.inMemoryQueue.push(job);
      console.warn(`[Motor Financeiro] Job ${jobId} falhou (${error}). Reagendado com Exponential Backoff em ${backoffMs}ms (Tentativa ${job.attempts}/${job.maxAttempts}).`);
      return { willRetry: true, nextAttempt: job.attempts + 1, movedToDlq: false };
    }

    // Atingiu 3 tentativas -> Envia para Dead Letter Queue (DLQ)
    job.status = 'dead_letter';
    this.deadLetterJobs.push(job);
    console.error(`🚨 [Motor Financeiro] Job ${jobId} esgotou todas as ${job.maxAttempts} tentativas. Movido para Dead Letter Queue (DLQ: ${DLQ_QUEUE_NAME}). Erro: ${error}`);

    // Se o BullMQ estiver ativo, arquiva na fila DLQ persistente
    if (this.bullDlqQueue && this.redisConnection && this.redisConnection.status === 'ready') {
      try {
        await this.bullDlqQueue.add(`DLQ_${job.type}`, {
          ...job,
          movedToDlqAt: Date.now(),
          finalError: error
        }, {
          jobId: `dlq_${job.id}`
        });
      } catch (err: any) {
        console.warn('[BullMQ DLQ] Falha ao enviar para DLQ no Redis:', err.message);
      }
    }

    return { willRetry: false, nextAttempt: job.attempts, movedToDlq: true };
  }

  /**
   * Retorna os jobs acumulados na Dead Letter Queue para inspeção e auditoria
   */
  public getDeadLetterJobs(): FinancialQueueJob[] {
    return this.deadLetterJobs;
  }

  /**
   * Métricas de observabilidade da fila
   */
  public getStatusMetrics() {
    return {
      queueName: QUEUE_NAME,
      dlqQueueName: DLQ_QUEUE_NAME,
      redisConnected: (this.redisConnection && this.redisConnection.status === 'ready') || idempotencyService.getRedisStatus(),
      bullMqActive: this.bullQueue !== null,
      queuedCount: this.inMemoryQueue.length,
      processingCount: this.inFlightJobs.size,
      completedCount: this.completedCount,
      failedCount: this.failedCount,
      deadLetterCount: this.deadLetterJobs.length,
      recentDeadLetters: this.deadLetterJobs.slice(-10)
    };
  }
}

export const financialQueueService = new FinancialQueueService();
