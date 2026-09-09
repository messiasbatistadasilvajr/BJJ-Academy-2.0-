import Redis from 'ioredis';

export interface IdempotencyEntry {
  status: 'processing' | 'completed' | 'failed';
  result?: any;
  createdAt: number;
  expiresAt: number;
}

const DEFAULT_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days (604,800s)

class IdempotencyService {
  private redisClient: Redis | null = null;
  private memoryStore: Map<string, IdempotencyEntry> = new Map();
  private isRedisConnected = false;

  constructor() {
    this.initRedis();
  }

  private initRedis() {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl && redisUrl.trim().length > 0) {
      try {
        this.redisClient = new Redis(redisUrl, {
          maxRetriesPerRequest: 2,
          connectTimeout: 3000,
          retryStrategy(times) {
            if (times > 3) return null; // stop reconnecting to avoid spam
            return Math.min(times * 500, 2000);
          }
        });

        this.redisClient.on('connect', () => {
          this.isRedisConnected = true;
          console.log('[Motor Financeiro] Redis conectado para controle de Idempotência!');
        });

        this.redisClient.on('error', (err) => {
          this.isRedisConnected = false;
          // Non-blocking fallback to in-memory store
          console.warn('[Motor Financeiro] Redis fallback para cache em memória:', err.message);
        });
      } catch (err: any) {
        this.redisClient = null;
        this.isRedisConnected = false;
        console.warn('[Motor Financeiro] Inicializado em modo de memória local:', err.message);
      }
    }
  }

  public getRedisStatus(): boolean {
    return this.isRedisConnected;
  }

  /**
   * Generates canonical idempotency key
   */
  public makeKey(prefix: string, identifier: string): string {
    return `bjj:idempotency:${prefix}:${identifier.replace(/[^a-zA-Z0-9_\-]/g, '_')}`;
  }

  /**
   * Checks if an event is already processing or completed
   * Returns true if newly acquired (not duplicate), false if already exists (duplicate)
   */
  public async acquireLock(key: string, ttlSeconds = DEFAULT_TTL_SECONDS): Promise<{ acquired: boolean; existingEntry?: IdempotencyEntry }> {
    const now = Date.now();

    // 1. Try Redis first if connected
    if (this.isRedisConnected && this.redisClient) {
      try {
        const existing = await this.redisClient.get(key);
        if (existing) {
          const parsed = JSON.parse(existing) as IdempotencyEntry;
          return { acquired: false, existingEntry: parsed };
        }

        const entry: IdempotencyEntry = {
          status: 'processing',
          createdAt: now,
          expiresAt: now + ttlSeconds * 1000
        };

        // SET with NX (Only set if key does not exist)
        const res = await this.redisClient.set(key, JSON.stringify(entry), 'EX', ttlSeconds, 'NX');
        return { acquired: res === 'OK' };
      } catch (err) {
        console.warn('[Motor Financeiro] Falha temporária Redis get/set, usando fallback memória:', err);
      }
    }

    // 2. Memory Store fallback
    this.cleanExpiredMemoryEntries();
    const existing = this.memoryStore.get(key);
    if (existing && existing.expiresAt > now) {
      return { acquired: false, existingEntry: existing };
    }

    const entry: IdempotencyEntry = {
      status: 'processing',
      createdAt: now,
      expiresAt: now + ttlSeconds * 1000
    };
    this.memoryStore.set(key, entry);
    return { acquired: true };
  }

  /**
   * Marks idempotency key as completed with outcome
   */
  public async markCompleted(key: string, result: any, ttlSeconds = DEFAULT_TTL_SECONDS): Promise<void> {
    const now = Date.now();
    const entry: IdempotencyEntry = {
      status: 'completed',
      result,
      createdAt: now,
      expiresAt: now + ttlSeconds * 1000
    };

    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.set(key, JSON.stringify(entry), 'EX', ttlSeconds);
        return;
      } catch (err) {
        console.warn('[Motor Financeiro] Redis markCompleted falhou, salvando em memória:', err);
      }
    }

    this.memoryStore.set(key, entry);
  }

  /**
   * Marks idempotency key as failed so retry or re-processing is permissible
   */
  public async releaseOrMarkFailed(key: string): Promise<void> {
    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch {
        // ignore
      }
    }
    this.memoryStore.delete(key);
  }

  /**
   * Retrieve cached result for duplicate response
   */
  public async getEntry(key: string): Promise<IdempotencyEntry | null> {
    if (this.isRedisConnected && this.redisClient) {
      try {
        const raw = await this.redisClient.get(key);
        if (raw) return JSON.parse(raw) as IdempotencyEntry;
      } catch {
        // fallback
      }
    }

    const item = this.memoryStore.get(key);
    if (item && item.expiresAt > Date.now()) {
      return item;
    }
    return null;
  }

  public getTrackedCount(): number {
    return this.memoryStore.size;
  }

  private cleanExpiredMemoryEntries() {
    const now = Date.now();
    for (const [key, entry] of this.memoryStore.entries()) {
      if (entry.expiresAt <= now) {
        this.memoryStore.delete(key);
      }
    }
  }
}

export const idempotencyService = new IdempotencyService();
