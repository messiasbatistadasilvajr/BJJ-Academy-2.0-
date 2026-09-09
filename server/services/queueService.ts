import Redis from 'ioredis';
import { idempotencyService } from './idempotencyService';

export interface FinancialQueueJob {
  id: string;
  type: string; // e.g. 'ASAAS_WEBHOOK_EVENT'
  payload: any;
  attempts: number;
  maxAttempts: number;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'dead_letter';
  createdAt: number;
  lastAttemptAt?: number;
  nextRetryAt?: number;
  lastError?: string;
}

const QUEUE_KEY = 'bjj:queue:financial-webhooks';
const DEAD_LETTER_KEY = 'bjj:queue:dead-letter';

class FinancialQueueService {
  private redisClient: Redis | null = null;
  private inMemoryQueue: FinancialQueueJob[] = [];
  private inFlightJobs: Map<string, FinancialQueueJob> = new Map();
  private deadLetterJobs: FinancialQueueJob[] = [];
  private completedCount = 0;
  private failedCount = 0;

  constructor() {
    this.initRedis();
  }

  private initRedis() {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl && redisUrl.trim().length > 0) {
      try {
        this.redisClient = new Redis(redisUrl, {
          maxRetriesPerRequest: 2,
          connectTimeout: 3000
        });
      } catch {
        this.redisClient = null;
      }
    }
  }

  /**
   * Enqueue a job into the financial queue
   */
  public async enqueue(type: string, payload: any, maxAttempts = 3): Promise<FinancialQueueJob> {
    const job: FinancialQueueJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      type,
      payload,
      attempts: 0,
      maxAttempts,
      status: 'queued',
      createdAt: Date.now()
    };

    if (idempotencyService.getRedisStatus() && this.redisClient) {
      try {
        await this.redisClient.rpush(QUEUE_KEY, JSON.stringify(job));
        return job;
      } catch (err) {
        console.warn('[Motor Financeiro] Falha ao enfileirar no Redis, usando fila interna:', err);
      }
    }

    this.inMemoryQueue.push(job);
    return job;
  }

  /**
   * Dequeue next ready job from queue
   */
  public async dequeue(): Promise<FinancialQueueJob | null> {
    const now = Date.now();

    // 1. Try Redis
    if (idempotencyService.getRedisStatus() && this.redisClient) {
      try {
        const raw = await this.redisClient.lpop(QUEUE_KEY);
        if (raw) {
          const job = JSON.parse(raw) as FinancialQueueJob;
          job.status = 'processing';
          job.attempts += 1;
          job.lastAttemptAt = now;
          this.inFlightJobs.set(job.id, job);
          return job;
        }
      } catch (err) {
        // Fallback to memory
      }
    }

    // 2. Memory queue check (check for retryable jobs or new jobs)
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
   * Complete a job successfully
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
   * Schedule retry with exponential backoff or send to dead-letter queue
   */
  public async markFailed(jobId: string, error: string): Promise<{ willRetry: boolean; nextAttempt: number }> {
    const job = this.inFlightJobs.get(jobId);
    if (!job) return { willRetry: false, nextAttempt: 0 };

    this.inFlightJobs.delete(jobId);
    this.failedCount++;
    job.lastError = error;

    if (job.attempts < job.maxAttempts) {
      // Exponential Backoff: 1s, 2s, 4s...
      const backoffMs = Math.pow(2, job.attempts - 1) * 1000;
      job.status = 'queued';
      job.nextRetryAt = Date.now() + backoffMs;

      // Re-enqueue for retry
      this.inMemoryQueue.push(job);
      console.warn(`[Motor Financeiro] Job ${jobId} falhou (${error}). Reagendado em ${backoffMs}ms (Tentativa ${job.attempts}/${job.maxAttempts}).`);
      return { willRetry: true, nextAttempt: job.attempts + 1 };
    }

    // Max attempts exceeded -> Dead Letter Queue
    job.status = 'dead_letter';
    this.deadLetterJobs.push(job);
    console.error(`[Motor Financeiro] Job ${jobId} esgotou ${job.maxAttempts} tentativas. Movido para Dead-Letter Queue.`);

    if (idempotencyService.getRedisStatus() && this.redisClient) {
      try {
        await this.redisClient.rpush(DEAD_LETTER_KEY, JSON.stringify(job));
      } catch {
        // memory already retained
      }
    }

    return { willRetry: false, nextAttempt: job.attempts };
  }

  /**
   * Status metrics for monitoring dashboard
   */
  public getStatusMetrics() {
    return {
      queueName: QUEUE_KEY,
      redisConnected: idempotencyService.getRedisStatus(),
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
