var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");

// server/services/asaasValidator.ts
function validateWebhookAuth(tokenHeader) {
  const expectedToken = process.env.ASAAS_WEBHOOK_SECRET || process.env.ASAAS_WEBHOOK_ACCESS_TOKEN;
  if (expectedToken && expectedToken.trim().length > 0) {
    if (!tokenHeader) {
      return {
        isAuthorized: false,
        reason: "Invalid or missing asaas-access-token header"
      };
    }
    const cleanToken = tokenHeader.startsWith("Bearer ") ? tokenHeader.slice(7).trim() : tokenHeader.trim();
    if (cleanToken !== expectedToken.trim()) {
      return {
        isAuthorized: false,
        reason: "Invalid or mismatched asaas-access-token header"
      };
    }
  }
  return { isAuthorized: true };
}
function validateAsaasPayload(body) {
  if (!body || typeof body !== "object") {
    return {
      isValid: false,
      errorCode: "INVALID_PAYLOAD_BODY",
      errorMessage: "O corpo do webhook deve ser um objeto JSON v\xE1lido."
    };
  }
  const payload = body;
  if (!payload.event || typeof payload.event !== "string" || payload.event.trim().length === 0) {
    return {
      isValid: false,
      errorCode: "MISSING_EVENT_TYPE",
      errorMessage: 'Campo "event" ausente ou inv\xE1lido no payload Asaas.'
    };
  }
  const eventType = payload.event.trim();
  const payment = payload.payment;
  if (!payment || typeof payment !== "object") {
    if (!payload.id) {
      return {
        isValid: false,
        errorCode: "MISSING_PAYMENT_ENTITY",
        errorMessage: 'Payload n\xE3o cont\xE9m objeto "payment" nem identificador da transa\xE7\xE3o.'
      };
    }
  }
  const chargeId = payment?.id || payload.id;
  if (!chargeId || typeof chargeId !== "string") {
    return {
      isValid: false,
      errorCode: "INVALID_CHARGE_ID",
      errorMessage: "ID da cobran\xE7a Asaas ausente ou inv\xE1lido."
    };
  }
  if (payment && typeof payment.value === "number" && payment.value < 0) {
    return {
      isValid: false,
      errorCode: "INVALID_AMOUNT",
      errorMessage: "Valor da cobran\xE7a n\xE3o pode ser negativo."
    };
  }
  const internalReference = payment?.externalReference || payment?.invoiceNumber || chargeId;
  const sanitized = {
    event: eventType,
    id: payload.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    dateCreated: payload.dateCreated || (/* @__PURE__ */ new Date()).toISOString(),
    payment: payment ? {
      object: payment.object || "payment",
      id: payment.id,
      value: payment.value ?? 0,
      netValue: payment.netValue,
      originalValue: payment.originalValue,
      interestValue: payment.interestValue,
      description: payment.description,
      billingType: payment.billingType || "PIX",
      status: payment.status || "RECEIVED",
      dueDate: payment.dueDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      paymentDate: payment.paymentDate,
      clientPaymentDate: payment.clientPaymentDate,
      confirmedDate: payment.confirmedDate,
      invoiceUrl: payment.invoiceUrl,
      invoiceNumber: payment.invoiceNumber,
      externalReference: payment.externalReference,
      pixTransaction: payment.pixTransaction,
      customer: payment.customer
    } : void 0
  };
  return {
    isValid: true,
    eventType,
    chargeId,
    internalReference,
    sanitizedPayload: sanitized
  };
}
function sanitizeLogOutput(obj) {
  try {
    const copy = JSON.parse(JSON.stringify(obj));
    const redactKeys = ["token", "secret", "password", "creditCardNumber", "cvv", "asaas-access-token", "apiKey"];
    const traverse = (o) => {
      if (!o || typeof o !== "object") return;
      for (const k of Object.keys(o)) {
        if (redactKeys.some((rk) => k.toLowerCase().includes(rk.toLowerCase()))) {
          o[k] = "[REDACTED]";
        } else if (typeof o[k] === "object") {
          traverse(o[k]);
        }
      }
    };
    traverse(copy);
    return JSON.stringify(copy);
  } catch {
    return "[Log serialization error]";
  }
}

// server/services/idempotencyService.ts
var import_ioredis = __toESM(require("ioredis"), 1);
var DEFAULT_TTL_SECONDS = 7 * 24 * 60 * 60;
var IdempotencyService = class {
  constructor() {
    this.redisClient = null;
    this.memoryStore = /* @__PURE__ */ new Map();
    this.isRedisConnected = false;
    this.initRedis();
  }
  initRedis() {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl && redisUrl.trim().length > 0) {
      try {
        this.redisClient = new import_ioredis.default(redisUrl, {
          maxRetriesPerRequest: 2,
          connectTimeout: 3e3,
          retryStrategy(times) {
            if (times > 3) return null;
            return Math.min(times * 500, 2e3);
          }
        });
        this.redisClient.on("connect", () => {
          this.isRedisConnected = true;
          console.log("[Motor Financeiro] Redis conectado para controle de Idempot\xEAncia!");
        });
        this.redisClient.on("error", (err) => {
          this.isRedisConnected = false;
          console.warn("[Motor Financeiro] Redis fallback para cache em mem\xF3ria:", err.message);
        });
      } catch (err) {
        this.redisClient = null;
        this.isRedisConnected = false;
        console.warn("[Motor Financeiro] Inicializado em modo de mem\xF3ria local:", err.message);
      }
    }
  }
  getRedisStatus() {
    return this.isRedisConnected;
  }
  /**
   * Generates canonical idempotency key
   */
  makeKey(prefix, identifier) {
    return `bjj:idempotency:${prefix}:${identifier.replace(/[^a-zA-Z0-9_\-]/g, "_")}`;
  }
  /**
   * Checks if an event is already processing or completed
   * Returns true if newly acquired (not duplicate), false if already exists (duplicate)
   */
  async acquireLock(key, ttlSeconds = DEFAULT_TTL_SECONDS) {
    const now = Date.now();
    if (this.isRedisConnected && this.redisClient) {
      try {
        const existing2 = await this.redisClient.get(key);
        if (existing2) {
          const parsed = JSON.parse(existing2);
          return { acquired: false, existingEntry: parsed };
        }
        const entry2 = {
          status: "processing",
          createdAt: now,
          expiresAt: now + ttlSeconds * 1e3
        };
        const res = await this.redisClient.set(key, JSON.stringify(entry2), "EX", ttlSeconds, "NX");
        return { acquired: res === "OK" };
      } catch (err) {
        console.warn("[Motor Financeiro] Falha tempor\xE1ria Redis get/set, usando fallback mem\xF3ria:", err);
      }
    }
    this.cleanExpiredMemoryEntries();
    const existing = this.memoryStore.get(key);
    if (existing && existing.expiresAt > now) {
      return { acquired: false, existingEntry: existing };
    }
    const entry = {
      status: "processing",
      createdAt: now,
      expiresAt: now + ttlSeconds * 1e3
    };
    this.memoryStore.set(key, entry);
    return { acquired: true };
  }
  /**
   * Marks idempotency key as completed with outcome
   */
  async markCompleted(key, result, ttlSeconds = DEFAULT_TTL_SECONDS) {
    const now = Date.now();
    const entry = {
      status: "completed",
      result,
      createdAt: now,
      expiresAt: now + ttlSeconds * 1e3
    };
    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.set(key, JSON.stringify(entry), "EX", ttlSeconds);
        return;
      } catch (err) {
        console.warn("[Motor Financeiro] Redis markCompleted falhou, salvando em mem\xF3ria:", err);
      }
    }
    this.memoryStore.set(key, entry);
  }
  /**
   * Marks idempotency key as failed so retry or re-processing is permissible
   */
  async releaseOrMarkFailed(key) {
    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch {
      }
    }
    this.memoryStore.delete(key);
  }
  /**
   * Retrieve cached result for duplicate response
   */
  async getEntry(key) {
    if (this.isRedisConnected && this.redisClient) {
      try {
        const raw = await this.redisClient.get(key);
        if (raw) return JSON.parse(raw);
      } catch {
      }
    }
    const item = this.memoryStore.get(key);
    if (item && item.expiresAt > Date.now()) {
      return item;
    }
    return null;
  }
  getTrackedCount() {
    return this.memoryStore.size;
  }
  cleanExpiredMemoryEntries() {
    const now = Date.now();
    for (const [key, entry] of this.memoryStore.entries()) {
      if (entry.expiresAt <= now) {
        this.memoryStore.delete(key);
      }
    }
  }
};
var idempotencyService = new IdempotencyService();

// server/services/queueService.ts
var import_ioredis2 = __toESM(require("ioredis"), 1);
var QUEUE_KEY = "bjj:queue:financial-webhooks";
var DEAD_LETTER_KEY = "bjj:queue:dead-letter";
var FinancialQueueService = class {
  constructor() {
    this.redisClient = null;
    this.inMemoryQueue = [];
    this.inFlightJobs = /* @__PURE__ */ new Map();
    this.deadLetterJobs = [];
    this.completedCount = 0;
    this.failedCount = 0;
    this.initRedis();
  }
  initRedis() {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl && redisUrl.trim().length > 0) {
      try {
        this.redisClient = new import_ioredis2.default(redisUrl, {
          maxRetriesPerRequest: 2,
          connectTimeout: 3e3
        });
      } catch {
        this.redisClient = null;
      }
    }
  }
  /**
   * Enqueue a job into the financial queue
   */
  async enqueue(type, payload, maxAttempts = 3) {
    const job = {
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      type,
      payload,
      attempts: 0,
      maxAttempts,
      status: "queued",
      createdAt: Date.now()
    };
    if (idempotencyService.getRedisStatus() && this.redisClient) {
      try {
        await this.redisClient.rpush(QUEUE_KEY, JSON.stringify(job));
        return job;
      } catch (err) {
        console.warn("[Motor Financeiro] Falha ao enfileirar no Redis, usando fila interna:", err);
      }
    }
    this.inMemoryQueue.push(job);
    return job;
  }
  /**
   * Dequeue next ready job from queue
   */
  async dequeue() {
    const now = Date.now();
    if (idempotencyService.getRedisStatus() && this.redisClient) {
      try {
        const raw = await this.redisClient.lpop(QUEUE_KEY);
        if (raw) {
          const job = JSON.parse(raw);
          job.status = "processing";
          job.attempts += 1;
          job.lastAttemptAt = now;
          this.inFlightJobs.set(job.id, job);
          return job;
        }
      } catch (err) {
      }
    }
    const readyIndex = this.inMemoryQueue.findIndex(
      (j) => j.status === "queued" && (!j.nextRetryAt || j.nextRetryAt <= now)
    );
    if (readyIndex !== -1) {
      const [job] = this.inMemoryQueue.splice(readyIndex, 1);
      job.status = "processing";
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
  async markCompleted(jobId) {
    const job = this.inFlightJobs.get(jobId);
    if (job) {
      job.status = "completed";
      this.inFlightJobs.delete(jobId);
    }
    this.completedCount++;
  }
  /**
   * Schedule retry with exponential backoff or send to dead-letter queue
   */
  async markFailed(jobId, error) {
    const job = this.inFlightJobs.get(jobId);
    if (!job) return { willRetry: false, nextAttempt: 0 };
    this.inFlightJobs.delete(jobId);
    this.failedCount++;
    job.lastError = error;
    if (job.attempts < job.maxAttempts) {
      const backoffMs = Math.pow(2, job.attempts - 1) * 1e3;
      job.status = "queued";
      job.nextRetryAt = Date.now() + backoffMs;
      this.inMemoryQueue.push(job);
      console.warn(`[Motor Financeiro] Job ${jobId} falhou (${error}). Reagendado em ${backoffMs}ms (Tentativa ${job.attempts}/${job.maxAttempts}).`);
      return { willRetry: true, nextAttempt: job.attempts + 1 };
    }
    job.status = "dead_letter";
    this.deadLetterJobs.push(job);
    console.error(`[Motor Financeiro] Job ${jobId} esgotou ${job.maxAttempts} tentativas. Movido para Dead-Letter Queue.`);
    if (idempotencyService.getRedisStatus() && this.redisClient) {
      try {
        await this.redisClient.rpush(DEAD_LETTER_KEY, JSON.stringify(job));
      } catch {
      }
    }
    return { willRetry: false, nextAttempt: job.attempts };
  }
  /**
   * Status metrics for monitoring dashboard
   */
  getStatusMetrics() {
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
};
var financialQueueService = new FinancialQueueService();

// server/services/financialAuditService.ts
var FinancialAuditService = class {
  constructor() {
    this.inMemoryAudits = [];
    this.maxBufferSize = 500;
  }
  /**
   * Records an immutable audit log entry
   */
  record(entry) {
    const fullLog = {
      ...entry,
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.inMemoryAudits.unshift(fullLog);
    if (this.inMemoryAudits.length > this.maxBufferSize) {
      this.inMemoryAudits.pop();
    }
    console.log(
      `[Audit ${fullLog.origin}] Tenant: ${fullLog.tenantId} | Action: ${fullLog.action} | Entity: ${fullLog.entity}:${fullLog.entityId} | Result: ${fullLog.result}`
    );
    return fullLog;
  }
  /**
   * Queries audit logs with strict Multi-Tenant security
   * - 'all' or general_manager: sees all academy logs
   * - unit_manager: strictly filtered by assignedUnitId
   */
  query(options) {
    const { tenantId, limit = 50, action, entityId } = options;
    return this.inMemoryAudits.filter((log) => {
      if (tenantId && tenantId !== "all" && log.tenantId !== tenantId) {
        return false;
      }
      if (action && log.action !== action) {
        return false;
      }
      if (entityId && log.entityId !== entityId) {
        return false;
      }
      return true;
    }).slice(0, limit);
  }
  getRecentCount() {
    return this.inMemoryAudits.length;
  }
};
var financialAuditService = new FinancialAuditService();

// server/services/stateMachine.ts
var ALLOWED_TRANSITIONS = {
  pending: ["paid", "overdue", "canceled"],
  overdue: ["paid", "canceled"],
  paid: ["refunded"],
  refunded: [],
  canceled: ["pending"]
  // in rare manual uncancel case
};
var FinancialStateMachine = class {
  /**
   * Validates whether moving an invoice from currentStatus to targetStatus is legally valid
   */
  static canTransition(currentStatus, targetStatus) {
    if (currentStatus === targetStatus) return true;
    const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];
    return allowedNext.includes(targetStatus);
  }
  /**
   * Maps an incoming Asaas webhook event to internal Invoice status
   */
  static mapAsaasEventToStatus(eventType) {
    switch (eventType) {
      case "PAYMENT_CONFIRMED":
      case "PAYMENT_RECEIVED":
      case "PAYMENT_DUNNING_RECEIVED":
      case "PAYMENT_ANTICIPATED":
        return "paid";
      case "PAYMENT_OVERDUE":
        return "overdue";
      case "PAYMENT_REFUNDED":
      case "PAYMENT_PARTIALLY_REFUNDED":
        return "refunded";
      case "PAYMENT_DELETED":
        return "canceled";
      case "PAYMENT_CREATED":
      case "PAYMENT_UPDATED":
      case "PAYMENT_RESTORED":
        return "pending";
      default:
        return null;
    }
  }
  /**
   * Evaluates state machine transition and provides diagnostic explanation
   */
  static evaluateTransition(currentStatus, targetStatus, eventType) {
    if (currentStatus === targetStatus) {
      return {
        isValid: true,
        action: "apply",
        message: `Status j\xE1 \xE9 ${currentStatus}. Opera\xE7\xE3o idempotente confirmada.`
      };
    }
    if (currentStatus === "paid" && (targetStatus === "overdue" || targetStatus === "pending")) {
      return {
        isValid: false,
        action: "ignore_obsolete",
        message: `Prote\xE7\xE3o de M\xE1quina de Estados: Cobran\xE7a j\xE1 liquidada (paid). Evento obsoleto "${eventType}" ignorado com sucesso para n\xE3o corromper o saldo.`
      };
    }
    const isAllowed = this.canTransition(currentStatus, targetStatus);
    if (!isAllowed) {
      return {
        isValid: false,
        action: "reject",
        message: `Transi\xE7\xE3o inv\xE1lida de "${currentStatus}" para "${targetStatus}" disparada pelo evento "${eventType}".`
      };
    }
    return {
      isValid: true,
      action: "apply",
      message: `Transi\xE7\xE3o v\xE1lida de "${currentStatus}" para "${targetStatus}".`
    };
  }
};

// server/services/whatsappService.ts
var WhatsAppService = class {
  constructor() {
    // Log em memória dos últimos disparos realizados
    this.messageLogs = [];
    this.apiUrl = process.env.WHATSAPP_API_URL || "https://api.evolution-api.com/message/sendText/bjjacademy";
    this.apiKey = process.env.WHATSAPP_API_KEY || "";
    this.instanceId = process.env.WHATSAPP_INSTANCE_ID || "bjjacademy_matriz";
  }
  /**
   * Formata número de telefone brasileiro para o padrão E.164 (ex: 5585998765432)
   */
  formatPhoneNumber(rawPhone) {
    const cleaned = rawPhone.replace(/\D/g, "");
    if (cleaned.startsWith("55")) {
      return cleaned;
    }
    if (cleaned.length === 10 || cleaned.length === 11) {
      return `55${cleaned}`;
    }
    return cleaned;
  }
  /**
   * Template Oficial de Notificação Amigável do BJJACADEMY
   */
  generateMessageTemplate(alunoNome, academiaNome, linkPagamento) {
    return `Ol\xE1, ${alunoNome}! \u{1F94B} 
Passando para lembrar que a sua mensalidade na ${academiaNome} venceu. Para manter seu acesso liberado aos treinos e ao aplicativo do tatame sem interrup\xE7\xF5es, realize o pagamento utilizando o link abaixo:
\u{1F517} ${linkPagamento}
Oss!`;
  }
  /**
   * Função assíncrona / worker acionada pelo evento PAYMENT_OVERDUE do aluno
   */
  async enviarAlertaVencimentoAluno(params) {
    const { alunoNome, alunoTelefone, academiaNome, linkPagamento, tenantId, alunoId } = params;
    const formattedPhone = this.formatPhoneNumber(alunoTelefone);
    const messageText = this.generateMessageTemplate(alunoNome, academiaNome, linkPagamento);
    const messageId = `wpp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    console.log(`[WhatsApp Service] Disparando alerta de vencimento para ${alunoNome} (${formattedPhone})...`);
    let result;
    if (this.apiKey && this.apiUrl) {
      try {
        const response = await fetch(this.apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": this.apiKey,
            "Authorization": `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            number: formattedPhone,
            text: messageText,
            options: {
              delay: 1200,
              presence: "composing"
            }
          })
        });
        const data = await response.json();
        result = {
          success: response.ok,
          messageId: data.key?.id || messageId,
          recipientPhone: formattedPhone,
          formattedMessage: messageText,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          provider: "evolution-api",
          rawResponse: data
        };
      } catch (err) {
        console.warn(`[WhatsApp Service] Falha no gateway externo. Acionando fallback simulado: ${err.message}`);
        result = {
          success: true,
          messageId,
          recipientPhone: formattedPhone,
          formattedMessage: messageText,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          provider: "simulated-sandbox",
          rawResponse: { simulated: true, reason: err.message }
        };
      }
    } else {
      result = {
        success: true,
        messageId,
        recipientPhone: formattedPhone,
        formattedMessage: messageText,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        provider: "simulated-sandbox",
        rawResponse: {
          simulated: true,
          notice: "Disparo sandbox registrado com sucesso no ecossistema BJJACADEMY."
        }
      };
    }
    financialAuditService.record({
      tenantId,
      action: "CHARGE_OVERDUE",
      entity: "student",
      entityId: alunoId || formattedPhone,
      origin: "financial_worker",
      result: "success",
      details: {
        channel: "whatsapp",
        alunoNome,
        recipientPhone: formattedPhone,
        messageId: result.messageId,
        linkPagamento,
        provider: result.provider
      }
    });
    this.messageLogs.unshift(result);
    if (this.messageLogs.length > 50) this.messageLogs.pop();
    console.log(`[WhatsApp Service] Alerta entregue com sucesso! ID: ${result.messageId}`);
    return result;
  }
  getRecentLogs() {
    return this.messageLogs;
  }
};
var whatsappService = new WhatsAppService();

// src/types.ts
var SAAS_PLAN_LIMITS = {
  BRONZE: 40,
  PRATA: 150,
  OURO: 999999
};
var SAAS_PLAN_DETAILS = {
  BRONZE: {
    tier: "BRONZE",
    label: "Plano Bronze",
    limit: 40,
    monthlyBRL: 69.9,
    description: "Limite estrito de at\xE9 40 alunos ativos. Cobran\xE7as manuais no Asaas.",
    badgeColor: "from-amber-700 to-amber-900 border-amber-600/80 text-amber-200",
    features: ["At\xE9 40 alunos ativos", "Cobran\xE7as manuais no Asaas", "Subconta Asaas dedicada", "Grade de Turmas & Check-in"]
  },
  PRATA: {
    tier: "PRATA",
    label: "Plano Prata",
    limit: 150,
    monthlyBRL: 129.9,
    description: "Limite estrito de at\xE9 150 alunos ativos. Automa\xE7\xE3o de recorr\xEAncia + Chamada por Foto Gemini AI.",
    badgeColor: "from-slate-400 to-slate-600 border-slate-300/80 text-slate-100",
    features: ["At\xE9 150 alunos ativos", "Automa\xE7\xE3o de recorr\xEAncia Asaas", "Chamada por Foto Gemini AI", "Radar de Reten\xE7\xE3o & Churn"]
  },
  OURO: {
    tier: "OURO",
    label: "Plano Ouro (Enterprise)",
    limit: 999999,
    monthlyBRL: 249.9,
    description: "Alunos ilimitados. Automa\xE7\xE3o completa + Split de pagamentos para professores + AI Coach.",
    badgeColor: "from-yellow-400 via-amber-500 to-amber-600 border-yellow-300 text-slate-950 font-bold",
    features: ["Alunos Ilimitados (Sem Teto)", "Split de pagamentos para professores & Master", "AI Coach & Sans\xE3o IA", "Automa\xE7\xE3o completa"]
  }
};

// server/services/asaasSubaccountService.ts
var AsaasSubaccountService = class {
  constructor() {
    // Repositório em memória resiliente sincronizado
    this.tenants = /* @__PURE__ */ new Map();
    this.students = /* @__PURE__ */ new Map();
    this.masterApiKey = process.env.ASAAS_API_KEY || "sandbox_master_key_bjjacademy";
    this.masterWalletId = process.env.ASAAS_MASTER_WALLET_ID || "wallet_master_bjjacademy_01";
    this.defaultSplitFee = Number(process.env.ASAAS_SPLIT_FIXED_FEE || 2);
    this.baseUrl = process.env.ASAAS_ENVIRONMENT === "production" ? "https://api.asaas.com/v3" : "https://sandbox.asaas.com/api/v3";
    this.initDefaultTenants();
  }
  initDefaultTenants() {
    this.tenants.set("acad_loyalty_jiujitsu", {
      id: "acad_loyalty_jiujitsu",
      nome: "Loyalty Jiu-Jitsu (Matriz Oficial CE)",
      plano_tipo: "OURO",
      limite_alunos: SAAS_PLAN_LIMITS.OURO,
      status: "ATIVO",
      asaas_api_key: "sub_key_loyalty_matriz_live",
      asaas_wallet_id: "wal_loyalty_matriz_883",
      asaas_customer_id: "cus_loyalty_master_01",
      asaas_subscription_id: "sub_bjj_ouro_001",
      overdue_since: null,
      email: "messiasbjunior@yahoo.com.br",
      phone: "(85) 98765-4321",
      cnpj: "12.345.678/0001-90"
    });
    this.tenants.set("acad_loyalty_aldeota", {
      id: "acad_loyalty_aldeota",
      nome: "Loyalty Jiu-Jitsu - Unidade Aldeota",
      plano_tipo: "PRATA",
      limite_alunos: SAAS_PLAN_LIMITS.PRATA,
      status: "ATIVO",
      asaas_api_key: "sub_key_loyalty_aldeota_live",
      asaas_wallet_id: "wal_loyalty_aldeota_492",
      asaas_customer_id: "cus_loyalty_aldeota_02",
      asaas_subscription_id: "sub_bjj_prata_002",
      overdue_since: null,
      email: "aldeota@loyaltybjj.com.br",
      phone: "(85) 98888-1111"
    });
    this.tenants.set("acad_loyalty_sul", {
      id: "acad_loyalty_sul",
      nome: "Loyalty Jiu-Jitsu - Unidade Zona Sul",
      plano_tipo: "BRONZE",
      limite_alunos: SAAS_PLAN_LIMITS.BRONZE,
      status: "ATIVO",
      asaas_api_key: "sub_key_loyalty_sul_live",
      asaas_wallet_id: "wal_loyalty_sul_331",
      asaas_customer_id: "cus_loyalty_sul_03",
      asaas_subscription_id: "sub_bjj_bronze_003",
      overdue_since: null,
      email: "sul@loyaltybjj.com.br",
      phone: "(85) 97777-2222"
    });
  }
  // =================================================================
  // 1. REGRA DE BLOQUEIO NO BANCO DE DADOS (DATABASE TIER)
  // Função: cadastrarAluno(tenantId, dadosAluno)
  // =================================================================
  /**
   * Valida cota de alunos ativos e insere o aluno no banco de dados.
   * Lança exceção se o limite do plano for atingido ou se a academia estiver bloqueada.
   */
  async cadastrarAluno(tenantId, dadosAluno) {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error(`TENANT_NOT_FOUND: Academia com ID '${tenantId}' n\xE3o encontrada no banco de dados.`);
    }
    if (tenant.status === "BLOQUEADO") {
      financialAuditService.record({
        tenantId,
        action: "STUDENT_ENROLLMENT_BLOCKED_LIMIT_REACHED",
        entity: "student",
        entityId: dadosAluno.id || "new_student",
        origin: "database_tier_rule",
        result: "blocked",
        details: {
          reason: "TENANT_OVERDUE_LOCKED",
          blockedAt: tenant.blocked_at
        }
      });
      throw new Error(
        `ACADEMY_BLOCKED: A academia ${tenant.nome} est\xE1 BLOQUEADA no sistema por pend\xEAncia financeira na assinatura BJJACADEMY. Regularize o plano para matricular alunos.`
      );
    }
    if (dadosAluno.status !== "ATIVO") {
      const newStudent2 = {
        id: dadosAluno.id || "stu_" + Date.now().toString(36),
        tenant_id: tenantId,
        nome: dadosAluno.nome,
        email: dadosAluno.email,
        phone: dadosAluno.phone,
        status: "INATIVO",
        faixa: dadosAluno.faixa || "white",
        graus: dadosAluno.graus || 0,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const currentList = this.students.get(tenantId) || [];
      this.students.set(tenantId, [...currentList, newStudent2]);
      financialAuditService.record({
        tenantId,
        action: "STUDENT_ENROLLMENT_INACTIVE_BYPASS",
        entity: "student",
        entityId: newStudent2.id,
        origin: "database_tier_rule",
        result: "success",
        details: { message: "Aluno cadastrado como Inativo. Cota do plano n\xE3o consumida." }
      });
      return newStudent2;
    }
    const currentStudents = this.students.get(tenantId) || [];
    const totalAtuaisAtivos = currentStudents.filter((s) => s.status === "ATIVO").length;
    const limiteAlunos = tenant.limite_alunos;
    if (totalAtuaisAtivos >= limiteAlunos) {
      const suggestedTier = tenant.plano_tipo === "BRONZE" ? "PRATA" : "OURO";
      const errorMessage = `UPGRADE_REQUIRED: Limite de ${limiteAlunos} alunos ativos atingido para o plano ${tenant.plano_tipo}. Atualize para o Plano ${suggestedTier} para matricular novos alunos.`;
      financialAuditService.record({
        tenantId,
        action: "STUDENT_ENROLLMENT_BLOCKED_LIMIT_REACHED",
        entity: "student",
        entityId: dadosAluno.id || "blocked_student",
        origin: "database_tier_rule",
        result: "blocked",
        details: {
          totalAtuaisAtivos,
          limiteAlunos,
          planoAtual: tenant.plano_tipo,
          suggestedTier
        }
      });
      const err = new Error(errorMessage);
      err.code = "LIMIT_REACHED";
      err.tenantId = tenantId;
      err.currentActive = totalAtuaisAtivos;
      err.limit = limiteAlunos;
      err.suggestedTier = suggestedTier;
      throw err;
    }
    const newStudent = {
      id: dadosAluno.id || "stu_" + Date.now().toString(36),
      tenant_id: tenantId,
      nome: dadosAluno.nome,
      email: dadosAluno.email,
      phone: dadosAluno.phone,
      status: "ATIVO",
      faixa: dadosAluno.faixa || "white",
      graus: dadosAluno.graus || 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.students.set(tenantId, [...currentStudents, newStudent]);
    financialAuditService.record({
      tenantId,
      action: "STUDENT_ENROLLMENT_APPROVED",
      entity: "student",
      entityId: newStudent.id,
      origin: "database_tier_rule",
      result: "success",
      details: {
        totalAtivosAposInsert: totalAtuaisAtivos + 1,
        limiteMaximo: limiteAlunos,
        vagasRestantes: Math.max(0, limiteAlunos - (totalAtuaisAtivos + 1))
      }
    });
    return newStudent;
  }
  // =================================================================
  // 2. ASSINATURAS DO SOFTWARE BJJACADEMY (POST /v3/subscriptions)
  // Mensalidades cobradas das academias em favor da plataforma Master
  // =================================================================
  /**
   * Dispara assinatura mensal da academia para a plataforma Master no Asaas
   */
  async createTenantSoftwareSubscription(tenantId, customerId, planTier, cardToken) {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) throw new Error(`Academia ${tenantId} n\xE3o encontrada.`);
    const planValues = {
      BRONZE: 69.9,
      PRATA: 129.9,
      OURO: 249.9
    };
    const value = planValues[planTier] || 69.9;
    const nextDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0];
    const subscriptionPayload = {
      customer: customerId,
      billingType: cardToken ? "CREDIT_CARD" : "UNDEFINED",
      value,
      nextDueDate,
      cycle: "MONTHLY",
      description: `BJJACADEMY Software - Mensalidade Plano ${planTier} (${SAAS_PLAN_DETAILS[planTier].description})`,
      ...cardToken ? { creditCardToken: cardToken } : {}
    };
    let subscriptionId = "sub_bjj_" + Date.now().toString(36);
    try {
      if (process.env.ASAAS_API_KEY && process.env.ASAAS_API_KEY !== "sandbox_master_key_bjjacademy") {
        const response = await fetch(`${this.baseUrl}/subscriptions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "access_token": this.masterApiKey
          },
          body: JSON.stringify(subscriptionPayload)
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.errors?.[0]?.description || "Erro ao criar assinatura no Asaas.");
        }
        subscriptionId = data.id || subscriptionId;
      }
    } catch (apiErr) {
      console.warn("[Asaas Subscriptions] Simula\xE7\xE3o de fallback ativa:", apiErr.message);
    }
    tenant.plano_tipo = planTier;
    tenant.limite_alunos = SAAS_PLAN_LIMITS[planTier];
    tenant.asaas_customer_id = customerId;
    tenant.asaas_subscription_id = subscriptionId;
    tenant.status = "ATIVO";
    tenant.overdue_since = null;
    tenant.blocked_at = null;
    this.tenants.set(tenantId, tenant);
    financialAuditService.record({
      tenantId,
      action: "TENANT_PLAN_UPGRADED",
      entity: "tenant_subscription",
      entityId: subscriptionId,
      origin: "saas_billing",
      result: "success",
      details: {
        planTier,
        value,
        cycle: "MONTHLY",
        novoLimiteAlunos: SAAS_PLAN_LIMITS[planTier]
      }
    });
    return {
      subscriptionId,
      value,
      cycle: "MONTHLY",
      nextDueDate,
      status: "ACTIVE",
      payloadEnviado: subscriptionPayload
    };
  }
  // =================================================================
  // 3. WEBHOOK DAS ASSINATURAS DO SOFTWARE (Carência de 3 dias)
  // Trata PAYMENT_RECEIVED e PAYMENT_OVERDUE
  // =================================================================
  /**
   * Processa Webhooks do Asaas para as mensalidades pagas pelas academias
   */
  handleTenantSubscriptionWebhook(event, payment) {
    const subscriptionId = payment?.subscription;
    const customerId = payment?.customer;
    let targetTenant;
    for (const [, tenant] of this.tenants.entries()) {
      if (subscriptionId && tenant.asaas_subscription_id === subscriptionId || customerId && tenant.asaas_customer_id === customerId) {
        targetTenant = tenant;
        break;
      }
    }
    if (!targetTenant) {
      targetTenant = this.tenants.get("acad_loyalty_jiujitsu");
    }
    if (!targetTenant) {
      return {
        actionTaken: "IGNORED",
        message: "Tenant n\xE3o localizado para o evento recebido."
      };
    }
    const tenantId = targetTenant.id;
    if (event === "PAYMENT_RECEIVED" || event === "PAYMENT_CONFIRMED") {
      targetTenant.status = "ATIVO";
      targetTenant.overdue_since = null;
      targetTenant.blocked_at = null;
      this.tenants.set(tenantId, targetTenant);
      financialAuditService.record({
        tenantId,
        action: "PAYMENT_RECEIVED",
        entity: "tenant_subscription",
        entityId: payment?.id || "pay_" + Date.now(),
        origin: "asaas_webhook",
        result: "success",
        details: {
          message: "Mensalidade da plataforma liquidada. Acesso da academia 100% ativo.",
          amount: payment?.value
        }
      });
      return {
        actionTaken: "TENANT_ACTIVATED",
        tenantId,
        tenantStatus: "ATIVO",
        message: `Mensalidade liquidada com sucesso! A academia ${targetTenant.nome} est\xE1 ATIVA.`
      };
    }
    if (event === "PAYMENT_OVERDUE") {
      const now = /* @__PURE__ */ new Date();
      if (!targetTenant.overdue_since) {
        targetTenant.overdue_since = now.toISOString();
        targetTenant.status = "ATIVO";
        this.tenants.set(tenantId, targetTenant);
        financialAuditService.record({
          tenantId,
          action: "CHARGE_OVERDUE",
          entity: "tenant_subscription",
          entityId: payment?.id || "pay_overdue_" + Date.now(),
          origin: "asaas_webhook",
          result: "success",
          details: {
            message: "Mensalidade em atraso. Car\xEAncia de 3 dias concedida antes do bloqueio.",
            overdueSince: targetTenant.overdue_since
          }
        });
        return {
          actionTaken: "GRACE_PERIOD_STARTED",
          tenantId,
          tenantStatus: "ATIVO (EM CAR\xCANCIA)",
          message: `Mensalidade em atraso. Car\xEAncia de 3 dias iniciada em ${now.toLocaleDateString("pt-BR")}. O sistema segue liberado.`
        };
      } else {
        const overdueDate = new Date(targetTenant.overdue_since);
        const diffMs = now.getTime() - overdueDate.getTime();
        const diffDays = diffMs / (1e3 * 60 * 60 * 24);
        if (diffDays >= 3) {
          targetTenant.status = "BLOQUEADO";
          targetTenant.blocked_at = now.toISOString();
          this.tenants.set(tenantId, targetTenant);
          financialAuditService.record({
            tenantId,
            action: "CHARGE_OVERDUE",
            entity: "tenant_subscription",
            entityId: payment?.id || "pay_blocked_" + Date.now(),
            origin: "asaas_webhook",
            result: "blocked",
            details: {
              message: "Car\xEAncia de 3 dias expirada. Academia BLOQUEADA por inadimpl\xEAncia.",
              daysOverdue: Math.floor(diffDays),
              blockedAt: targetTenant.blocked_at
            }
          });
          return {
            actionTaken: "TENANT_BLOCKED",
            tenantId,
            tenantStatus: "BLOQUEADO",
            message: `Car\xEAncia de 3 dias esgotada (${Math.floor(diffDays)} dias de atraso). Academia ${targetTenant.nome} foi BLOQUEADA.`
          };
        } else {
          return {
            actionTaken: "GRACE_PERIOD_ACTIVE",
            tenantId,
            tenantStatus: "ATIVO (EM CAR\xCANCIA)",
            message: `Atraso de ${Math.floor(diffDays)} dia(s). Car\xEAncia v\xE1lida de 3 dias em vigor.`
          };
        }
      }
    }
    return {
      actionTaken: "EVENT_ACKNOWLEDGED",
      tenantId,
      message: `Evento ${event} registrado sem altera\xE7\xE3o de estado.`
    };
  }
  // =================================================================
  // 4. CRIAÇÃO DE SUBCONTA PARA O MESTRE/ACADEMIA (POST /v3/accounts)
  // Onboarding do parceiro onde o dinheiro dos alunos cairá direto
  // =================================================================
  async createTenantSubaccount(tenantId, dto) {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) throw new Error(`Academia ${tenantId} n\xE3o encontrada.`);
    const subaccountPayload = {
      name: dto.name || tenant.nome,
      email: dto.email,
      loginEmail: dto.email,
      cpfCnpj: dto.cpfCnpj.replace(/\D/g, ""),
      birthDate: dto.birthDate || "1985-05-15",
      companyType: dto.companyType || (dto.cpfCnpj.length > 11 ? "LIMITED" : "MEI"),
      phone: dto.phone.replace(/\D/g, ""),
      mobilePhone: (dto.mobilePhone || dto.phone).replace(/\D/g, ""),
      postalCode: (dto.postalCode || "60170-001").replace(/\D/g, ""),
      address: dto.address || "Avenida Santos Dumont",
      addressNumber: dto.addressNumber || "1000",
      complement: dto.complement || "Sala 101",
      province: dto.province || "Aldeota"
    };
    let apiKey = "sub_key_" + tenantId + "_" + Date.now().toString(36);
    let walletId = "wal_" + tenantId + "_" + Math.floor(100 + Math.random() * 900);
    let accountNumber = "000" + Math.floor(1e4 + Math.random() * 9e4);
    try {
      if (process.env.ASAAS_API_KEY && process.env.ASAAS_API_KEY !== "sandbox_master_key_bjjacademy") {
        const response = await fetch(`${this.baseUrl}/accounts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "access_token": this.masterApiKey
          },
          body: JSON.stringify(subaccountPayload)
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.errors?.[0]?.description || "Erro ao criar subconta no Asaas.");
        }
        apiKey = data.apiKey || apiKey;
        walletId = data.walletId || walletId;
        accountNumber = data.accountNumber || accountNumber;
      }
    } catch (err) {
      console.warn("[Asaas Subaccount] Simula\xE7\xE3o de subconta ativa:", err.message);
    }
    tenant.asaas_api_key = apiKey;
    tenant.asaas_wallet_id = walletId;
    tenant.asaas_account_number = accountNumber;
    this.tenants.set(tenantId, tenant);
    financialAuditService.record({
      tenantId,
      action: "PLAN_CHANGED",
      entity: "tenant_subscription",
      entityId: walletId,
      origin: "manager_ui",
      result: "success",
      details: {
        message: "Subconta Asaas gerada e vinculada \xE0 academia com sucesso.",
        walletId,
        accountNumber
      }
    });
    return {
      tenantId,
      apiKey,
      walletId,
      accountNumber,
      accountStatus: "APPROVED",
      payloadEnviado: subaccountPayload
    };
  }
  // =================================================================
  // 5. COBRANÇA DO ALUNO COM SPLIT DE PAGAMENTO (POST /v3/payments)
  // Autentica com a Subconta da academia e retém split para a Master
  // =================================================================
  async createStudentPaymentWithSplit(tenantId, dto) {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) throw new Error(`Academia ${tenantId} n\xE3o encontrada.`);
    if (tenant.status === "BLOQUEADO") {
      throw new Error(`ACADEMY_BLOCKED: A academia ${tenant.nome} est\xE1 bloqueada por pend\xEAncia no SaaS.`);
    }
    const fixedFee = dto.splitFeeOverride !== void 0 ? dto.splitFeeOverride : this.defaultSplitFee;
    const netAcademyValue = Math.max(0, dto.value - fixedFee);
    const subaccountApiKey = tenant.asaas_api_key || this.masterApiKey;
    const splitConfig = [
      {
        walletId: this.masterWalletId,
        fixedValue: fixedFee
      }
    ];
    const paymentPayload = {
      customer: dto.studentId,
      // ID do cliente na subconta
      billingType: dto.billingType || "PIX",
      value: dto.value,
      dueDate: dto.dueDate,
      description: dto.description || `Mensalidade Jiu-Jitsu - ${dto.studentName} (${tenant.nome})`,
      split: splitConfig
    };
    let paymentId = "pay_stu_" + Date.now().toString(36);
    let invoiceUrl = `https://sandbox.asaas.com/i/${paymentId}`;
    try {
      if (subaccountApiKey && subaccountApiKey !== "sandbox_master_key_bjjacademy") {
        const response = await fetch(`${this.baseUrl}/payments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "access_token": subaccountApiKey
            // Autenticação com credencial da subconta
          },
          body: JSON.stringify(paymentPayload)
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.errors?.[0]?.description || "Erro ao criar cobran\xE7a com split.");
        }
        paymentId = data.id || paymentId;
        invoiceUrl = data.invoiceUrl || invoiceUrl;
      }
    } catch (err) {
      console.warn("[Asaas Student Payment] Simula\xE7\xE3o de cobran\xE7a com split ativa:", err.message);
    }
    financialAuditService.record({
      tenantId,
      action: "SPLIT_PROCESSED",
      entity: "split",
      entityId: paymentId,
      origin: "asaas_webhook",
      result: "success",
      details: {
        totalValue: dto.value,
        splitMasterFee: fixedFee,
        netAcademyValue,
        masterWalletId: this.masterWalletId,
        studentName: dto.studentName
      }
    });
    return {
      paymentId,
      value: dto.value,
      splitFee: fixedFee,
      netAcademyValue,
      masterWalletId: this.masterWalletId,
      subaccountWalletId: tenant.asaas_wallet_id || "wal_subaccount_default",
      pixQrCodeUrl: `https://sandbox.asaas.com/api/v3/payments/${paymentId}/pixQrCode`,
      invoiceUrl,
      payloadEnviado: paymentPayload
    };
  }
  // =================================================================
  // GETTERS & HELPERS
  // =================================================================
  getTenant(tenantId) {
    return this.tenants.get(tenantId);
  }
  getAllTenants() {
    return Array.from(this.tenants.values());
  }
  getStudents(tenantId) {
    return this.students.get(tenantId) || [];
  }
  setStudentsList(tenantId, list) {
    this.students.set(tenantId, list);
  }
  getMasterWalletId() {
    return this.masterWalletId;
  }
  getDefaultSplitFee() {
    return this.defaultSplitFee;
  }
};
var asaasSubaccountService = new AsaasSubaccountService();

// server/services/financialWorker.ts
var FinancialWorker = class {
  constructor() {
    this.isProcessing = false;
    this.workerInterval = null;
    this.activeWorkers = 1;
    this.notifications = [];
  }
  /**
   * Starts the background queue worker
   */
  start() {
    if (this.workerInterval) return;
    console.log("[Motor Financeiro] Worker de Filas Asaas iniciado com sucesso.");
    this.workerInterval = setInterval(() => {
      this.pollNextJob();
    }, 400);
  }
  /**
   * Stops the background worker
   */
  stop() {
    if (this.workerInterval) {
      clearInterval(this.workerInterval);
      this.workerInterval = null;
    }
  }
  async pollNextJob() {
    if (this.isProcessing) return;
    try {
      const job = await financialQueueService.dequeue();
      if (!job) return;
      this.isProcessing = true;
      await this.handleJob(job);
    } catch (err) {
      console.error("[Motor Financeiro Worker] Erro no ciclo de polling:", err);
    } finally {
      this.isProcessing = false;
    }
  }
  /**
   * Processes an individual financial queue job
   */
  async handleJob(job) {
    const payload = job.payload;
    const eventType = payload.event;
    const payment = payload.payment;
    const eventId = payload.id || `evt_${Date.now()}`;
    const paymentId = payment?.id || "unknown_payment";
    const tenantId = payment?.customer?.startsWith("acad_") ? payment.customer : "acad_matriz";
    const idempotencyKey = idempotencyService.makeKey("asaas", `${eventId}_${eventType}`);
    const { acquired, existingEntry } = await idempotencyService.acquireLock(idempotencyKey);
    if (!acquired && existingEntry?.status === "completed") {
      console.log(`[Worker] Idempot\xEAncia ativada: Evento ${eventType} (${eventId}) j\xE1 foi processado anteriormente. Ignorando duplicata com seguran\xE7a.`);
      financialAuditService.record({
        tenantId,
        action: "WEBHOOK_DUPLICATE_IGNORED",
        entity: "webhook",
        entityId: eventId,
        origin: "financial_worker",
        result: "ignored_duplicate",
        details: { eventType, paymentId, reason: "Evento duplicado detectado pelo cache de Idempot\xEAncia" }
      });
      await financialQueueService.markCompleted(job.id);
      return;
    }
    try {
      const targetStatus = FinancialStateMachine.mapAsaasEventToStatus(eventType);
      if (!targetStatus) {
        console.log(`[Worker] Evento informativo Asaas recebido sem altera\xE7\xE3o de saldo: ${eventType}`);
        financialAuditService.record({
          tenantId,
          action: "WEBHOOK_PROCESSED",
          entity: "webhook",
          entityId: eventId,
          origin: "financial_worker",
          result: "success",
          details: { eventType, paymentId, note: "Evento informativo arquivado" }
        });
        await idempotencyService.markCompleted(idempotencyKey, { processed: true, eventType });
        await financialQueueService.markCompleted(job.id);
        return;
      }
      const currentStatus = "pending";
      const evalResult = FinancialStateMachine.evaluateTransition(currentStatus, targetStatus, eventType);
      if (!evalResult.isValid) {
        if (evalResult.action === "ignore_obsolete") {
          financialAuditService.record({
            tenantId,
            action: "WEBHOOK_DUPLICATE_IGNORED",
            entity: "invoice",
            entityId: paymentId,
            origin: "financial_worker",
            result: "ignored_duplicate",
            details: { reason: evalResult.message, currentStatus, targetStatus, eventType }
          });
          await idempotencyService.markCompleted(idempotencyKey, { ignored: true, reason: evalResult.message });
          await financialQueueService.markCompleted(job.id);
          return;
        } else {
          throw new Error(evalResult.message);
        }
      }
      let auditAction = "WEBHOOK_PROCESSED";
      let notifTitle = "Atualiza\xE7\xE3o Financeira";
      let notifBody = `Cobran\xE7a ${paymentId} atualizada para ${targetStatus}.`;
      if (targetStatus === "paid") {
        auditAction = "PAYMENT_RECEIVED";
        notifTitle = "\u{1F4B0} Pagamento Asaas Confirmado!";
        notifBody = `Pagamento de R$ ${(payment?.value || 0).toFixed(2)} liquidado com baixa autom\xE1tica no sistema.`;
      } else if (targetStatus === "overdue") {
        auditAction = "CHARGE_OVERDUE";
        notifTitle = "\u26A0\uFE0F Cobran\xE7a Vencida (Asaas)";
        notifBody = `A fatura de R$ ${(payment?.value || 0).toFixed(2)} atingiu a data de vencimento.`;
      } else if (targetStatus === "refunded") {
        auditAction = "PAYMENT_REFUNDED";
        notifTitle = "\u21A9\uFE0F Estorno Processado (Asaas)";
        notifBody = `Estorno de R$ ${(payment?.value || 0).toFixed(2)} efetuado com sucesso.`;
      }
      if (payment?.subscription) {
        asaasSubaccountService.handleTenantSubscriptionWebhook(eventType, payment);
      }
      if (eventType === "PAYMENT_OVERDUE" && !payment?.subscription) {
        const studentName = payment?.studentName || payment?.description?.split("-")?.[1]?.trim() || payment?.customerName || "Atleta Loyalty BJJ";
        const studentPhone = payment?.mobilePhone || payment?.phone || "85998765432";
        const academyName = payment?.academyName || "Loyalty Jiu-Jitsu";
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
        } catch (wppErr) {
          console.warn("[Worker] Falha ao disparar alerta WhatsApp (n\xE3o bloqueia job):", wppErr.message);
        }
      }
      financialAuditService.record({
        tenantId,
        action: auditAction,
        entity: "invoice",
        entityId: paymentId,
        origin: "financial_worker",
        result: "success",
        details: {
          eventType,
          targetStatus,
          amount: payment?.value,
          netValue: payment?.netValue,
          billingType: payment?.billingType,
          clientPaymentDate: payment?.clientPaymentDate || (/* @__PURE__ */ new Date()).toISOString()
        }
      });
      const notif = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        tenantId,
        title: notifTitle,
        body: notifBody,
        timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        type: targetStatus === "paid" ? "payment" : targetStatus === "overdue" ? "warning" : "audit"
      };
      this.notifications.unshift(notif);
      if (this.notifications.length > 50) this.notifications.pop();
      await idempotencyService.markCompleted(idempotencyKey, {
        status: "completed",
        targetStatus,
        paymentId,
        processedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      await financialQueueService.markCompleted(job.id);
      console.log(`[Worker] Job ${job.id} processado com sucesso: ${eventType} -> Status ${targetStatus}`);
    } catch (err) {
      console.error(`[Worker] Erro ao processar job ${job.id}:`, err.message);
      await idempotencyService.releaseOrMarkFailed(idempotencyKey);
      await financialQueueService.markFailed(job.id, err.message);
    }
  }
  getNotifications(tenantId) {
    if (!tenantId || tenantId === "all") {
      return this.notifications;
    }
    return this.notifications.filter((n) => n.tenantId === tenantId);
  }
  getWorkerStats() {
    return {
      isRunning: this.workerInterval !== null,
      isProcessing: this.isProcessing,
      activeWorkers: this.activeWorkers,
      notificationsCount: this.notifications.length
    };
  }
};
var financialWorker = new FinancialWorker();

// server/services/sansaoFinancialQueryService.ts
var SansaoFinancialQueryService = class {
  /**
   * Responds to natural language financial queries strictly in READ-ONLY mode.
   * Guarantees zero mutations on financial ledger.
   */
  static answerFinancialQuery(queryText, invoices, expenses = [], tenantId = "all") {
    const q = queryText.toLowerCase().trim();
    const tenantInvoices = invoices.filter((inv) => {
      if (tenantId === "all") return true;
      return inv.academyId === tenantId || inv.tenantId === tenantId;
    });
    const tenantExpenses = expenses.filter((exp) => {
      if (tenantId === "all") return true;
      return exp.tenantId === tenantId;
    });
    const paidInvoices = tenantInvoices.filter((i) => i.status === "paid");
    const pendingInvoices = tenantInvoices.filter((i) => i.status === "pending");
    const overdueInvoices = tenantInvoices.filter((i) => i.status === "overdue");
    const totalPaid = paidInvoices.reduce((acc, c) => acc + c.amount, 0);
    const totalPending = pendingInvoices.reduce((acc, c) => acc + c.amount, 0);
    const totalOverdue = overdueInvoices.reduce((acc, c) => acc + (c.totalUpdatedAmount || c.amount), 0);
    const paidExpenses = tenantExpenses.filter((e) => e.status === "paid");
    const pendingExpenses = tenantExpenses.filter((e) => e.status === "pending" || e.status === "overdue");
    const totalExpensesPaid = paidExpenses.reduce((acc, e) => acc + e.amount, 0);
    const totalExpensesPending = pendingExpenses.reduce((acc, e) => acc + e.amount, 0);
    const realCashBalance = Math.max(0, totalPaid - totalExpensesPaid);
    let answer = "";
    const metrics = {
      totalPaid,
      totalPending,
      totalOverdue,
      countOverdue: overdueInvoices.length,
      realCashBalance,
      totalExpensesPending
    };
    if (q.includes("inadimplente") || q.includes("devendo") || q.includes("atraso") || q.includes("quem deve")) {
      if (overdueInvoices.length === 0) {
        answer = "Excelente not\xEDcia, Mestre! No momento n\xE3o h\xE1 nenhum aluno com faturas em atraso sob a sua gest\xE3o. A inadimpl\xEAncia est\xE1 em 0%.";
      } else {
        const studentList = overdueInvoices.map((i) => `\u2022 ${i.studentName}: R$ ${(i.totalUpdatedAmount || i.amount).toFixed(2)} (vencido em ${i.dueDate})`).join("\n");
        answer = `Atualmente temos ${overdueInvoices.length} cobran\xE7a(s) em atraso, totalizando R$ ${totalOverdue.toFixed(2)} com encargos legais aplicados:

${studentList}

Voc\xEA pode gerar a 2\xAA via com juros ou cobrar amigavelmente via WhatsApp com 1 clique.`;
      }
    } else if (q.includes("receber") || q.includes("previs\xE3o") || q.includes("previsto")) {
      answer = `Voc\xEA tem R$ ${totalPending.toFixed(2)} a receber em mensalidades vigentes neste m\xEAs (total de ${pendingInvoices.length} faturas aguardando pagamento), al\xE9m de R$ ${totalOverdue.toFixed(2)} em cobran\xE7as em atraso. Faturamento previsto total: R$ ${(totalPaid + totalPending).toFixed(2)}.`;
    } else if (q.includes("recebi") || q.includes("liquidado") || q.includes("caixa") || q.includes("hoje")) {
      answer = `At\xE9 o momento foram liquidados R$ ${totalPaid.toFixed(2)} em ${paidInvoices.length} pagamentos confirmados via PIX e Asaas. Descontando despesas quitadas de R$ ${totalExpensesPaid.toFixed(2)}, o saldo l\xEDquido dispon\xEDvel em caixa \xE9 de R$ ${realCashBalance.toFixed(2)}.`;
    } else if (q.includes("pagar") || q.includes("despesa") || q.includes("conta")) {
      answer = `Voc\xEA possui R$ ${totalExpensesPending.toFixed(2)} em contas a pagar pendentes para esta compet\xEAncia (${pendingExpenses.length} despesas operacionais cadastradas, incluindo aluguel e utilidades).`;
    } else {
      answer = `Vis\xE3o Financeira Geral:
\u2022 Total Recebido: R$ ${totalPaid.toFixed(2)} (${paidInvoices.length} alunos)
\u2022 A Receber: R$ ${totalPending.toFixed(2)} (${pendingInvoices.length} faturas)
\u2022 Inadimpl\xEAncia: R$ ${totalOverdue.toFixed(2)} (${overdueInvoices.length} faturas)
\u2022 Saldo L\xEDquido em Caixa: R$ ${realCashBalance.toFixed(2)}

Todas as informa\xE7\xF5es s\xE3o consultadas em tempo real com garantia de seguran\xE7a somente-leitura.`;
    }
    return {
      query: queryText,
      answer,
      metrics,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      readOnlyGuaranteed: true
    };
  }
};

// server/services/tenantValidationService.ts
var TenantValidationService = class {
  constructor() {
    // Store default multi-tenant academies and their plan tiers
    this.tenantsMap = /* @__PURE__ */ new Map([
      [
        "acad_loyalty_jiujitsu",
        {
          id: "acad_loyalty_jiujitsu",
          name: "Loyalty Jiu-Jitsu (Matriz Oficial)",
          saasPlanTier: "OURO",
          maxActiveStudentsLimit: SAAS_PLAN_LIMITS.OURO,
          // 999999 (Ilimitado)
          activeStudentsCount: 165
        }
      ],
      [
        "acad_bjj_jardins",
        {
          id: "acad_bjj_jardins",
          name: "BJJ Academy Jardins",
          saasPlanTier: "PRATA",
          maxActiveStudentsLimit: SAAS_PLAN_LIMITS.PRATA,
          // 150
          activeStudentsCount: 112
        }
      ],
      [
        "acad_gracie_barra",
        {
          id: "acad_gracie_barra",
          name: "Gracie Barra Centro",
          saasPlanTier: "BRONZE",
          maxActiveStudentsLimit: SAAS_PLAN_LIMITS.BRONZE,
          // 40 (Ideal para testar o limite de 40 alunos)
          activeStudentsCount: 38
        }
      ],
      [
        "acad_checkmat_vm",
        {
          id: "acad_checkmat_vm",
          name: "Checkmat Tatame Vila Mariana",
          saasPlanTier: "BRONZE",
          maxActiveStudentsLimit: SAAS_PLAN_LIMITS.BRONZE,
          // 40 (Teto cheio para teste de bloqueio)
          activeStudentsCount: 40
        }
      ]
    ]);
  }
  /**
   * Retrieves or initializes tenant config
   */
  getTenant(tenantId) {
    if (!this.tenantsMap.has(tenantId)) {
      this.tenantsMap.set(tenantId, {
        id: tenantId,
        name: `Academia ${tenantId}`,
        saasPlanTier: "BRONZE",
        maxActiveStudentsLimit: SAAS_PLAN_LIMITS.BRONZE,
        activeStudentsCount: 0
      });
    }
    return this.tenantsMap.get(tenantId);
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
  validateStudentEnrollment(payload) {
    const { tenantId, student, clientCountOverride } = payload;
    if (!tenantId) {
      return {
        allowed: false,
        code: "INVALID_TENANT",
        message: "Tenant ID da academia \xE9 obrigat\xF3rio para valida\xE7\xE3o de plano.",
        tenantId: "",
        tenantName: "Desconhecida",
        planTier: "BRONZE",
        limit: 40,
        currentActive: 0,
        remainingSlots: 0
      };
    }
    const tenant = this.getTenant(tenantId);
    const studentStatus = student.status || "ATIVO";
    const isAddingActive = studentStatus === "ATIVO";
    const currentActive = typeof clientCountOverride === "number" ? clientCountOverride : tenant.activeStudentsCount;
    if (!isAddingActive) {
      financialAuditService.record({
        tenantId,
        action: "STUDENT_ENROLLMENT_INACTIVE_BYPASS",
        entity: "student",
        entityId: student.id || "new_student",
        origin: "database_tier_rule",
        result: "success",
        details: {
          studentName: student.name,
          status: "INATIVO",
          planTier: tenant.saasPlanTier,
          note: "Aluno cadastrado com status INATIVO. N\xE3o consome cota do plano SaaS."
        }
      });
      return {
        allowed: true,
        code: "APPROVED",
        message: "Aluno inativo cadastrado com sucesso (n\xE3o consome cota de plano).",
        tenantId,
        tenantName: tenant.name,
        planTier: tenant.saasPlanTier,
        limit: tenant.maxActiveStudentsLimit,
        currentActive,
        remainingSlots: Math.max(0, tenant.maxActiveStudentsLimit - currentActive)
      };
    }
    if (currentActive >= tenant.maxActiveStudentsLimit) {
      const suggestedUpgradeTier = tenant.saasPlanTier === "BRONZE" ? "PRATA" : "OURO";
      financialAuditService.record({
        tenantId,
        action: "STUDENT_ENROLLMENT_BLOCKED_LIMIT_REACHED",
        entity: "student",
        entityId: student.id || "rejected_student",
        origin: "database_tier_rule",
        result: "blocked",
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
        code: "PLAN_LIMIT_REACHED",
        message: `Limite de alunos ativos atingido para o ${SAAS_PLAN_DETAILS[tenant.saasPlanTier].label} (${currentActive}/${tenant.maxActiveStudentsLimit} alunos). Fa\xE7a o upgrade para o ${SAAS_PLAN_DETAILS[suggestedUpgradeTier].label} para continuar cadastrando.`,
        tenantId,
        tenantName: tenant.name,
        planTier: tenant.saasPlanTier,
        limit: tenant.maxActiveStudentsLimit,
        currentActive,
        remainingSlots: 0,
        suggestedUpgradeTier
      };
    }
    tenant.activeStudentsCount = currentActive + 1;
    const remainingSlots = tenant.maxActiveStudentsLimit - tenant.activeStudentsCount;
    financialAuditService.record({
      tenantId,
      action: "STUDENT_ENROLLMENT_APPROVED",
      entity: "student",
      entityId: student.id || "new_student",
      origin: "database_tier_rule",
      result: "success",
      details: {
        studentName: student.name,
        planTier: tenant.saasPlanTier,
        newActiveCount: tenant.activeStudentsCount,
        remainingSlots
      }
    });
    return {
      allowed: true,
      code: "APPROVED",
      message: "Cadastro autorizado dentro dos limites do plano atual.",
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
  upgradePlan(tenantId, newPlanTier) {
    const tenant = this.getTenant(tenantId);
    const oldTier = tenant.saasPlanTier;
    const oldLimit = tenant.maxActiveStudentsLimit;
    tenant.saasPlanTier = newPlanTier;
    tenant.maxActiveStudentsLimit = SAAS_PLAN_LIMITS[newPlanTier];
    financialAuditService.record({
      tenantId,
      action: "TENANT_PLAN_UPGRADED",
      entity: "tenant_subscription",
      entityId: tenantId,
      origin: "saas_billing",
      result: "success",
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
      message: `Upgrade para o ${SAAS_PLAN_DETAILS[newPlanTier].label} conclu\xEDdo com sucesso! Limite expandido para ${tenant.maxActiveStudentsLimit === 999999 ? "Ilimitado" : tenant.maxActiveStudentsLimit} alunos ativos.`
    };
  }
  /**
   * Retorna o status de consumo do plano da academia
   */
  getPlanStatus(tenantId, activeStudentsCountOverride) {
    const tenant = this.getTenant(tenantId);
    const count = typeof activeStudentsCountOverride === "number" ? activeStudentsCountOverride : tenant.activeStudentsCount;
    tenant.activeStudentsCount = count;
    const limit = tenant.maxActiveStudentsLimit;
    const usagePercent = limit >= 999999 ? 0 : Math.min(100, Math.round(count / limit * 100));
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
      suggestedUpgradeTier: tenant.saasPlanTier === "BRONZE" ? "PRATA" : tenant.saasPlanTier === "PRATA" ? "OURO" : null
    };
  }
  /**
   * Atualiza a contagem atômica de alunos ativos após remoção ou inativação
   */
  updateActiveCount(tenantId, count) {
    const tenant = this.getTenant(tenantId);
    tenant.activeStudentsCount = Math.max(0, count);
  }
};
var tenantValidationService = new TenantValidationService();

// server.ts
var PORT = 3e3;
async function startServer() {
  const app = (0, import_express.default)();
  app.use(import_express.default.json({ limit: "2mb" }));
  app.use(import_express.default.urlencoded({ extended: true }));
  financialWorker.start();
  app.post("/api/webhooks/asaas", async (req, res) => {
    const startTime = Date.now();
    const tokenHeader = req.headers["asaas-access-token"] || req.headers["authorization"];
    const authResult = validateWebhookAuth(tokenHeader);
    if (!authResult.isAuthorized) {
      console.warn("[Asaas Webhook] Tentativa de acesso n\xE3o autorizada ao webhook:", authResult.reason);
      return res.status(401).json({
        error: "UNAUTHORIZED",
        message: "Token de autentica\xE7\xE3o do webhook Asaas ausente ou inv\xE1lido."
      });
    }
    const validation = validateAsaasPayload(req.body);
    if (!validation.isValid || !validation.sanitizedPayload) {
      console.warn("[Asaas Webhook] Payload inv\xE1lido rejeitado:", validation.errorMessage);
      return res.status(400).json({
        error: validation.errorCode || "BAD_REQUEST",
        message: validation.errorMessage || "Payload Asaas inv\xE1lido."
      });
    }
    const payload = validation.sanitizedPayload;
    const eventId = payload.id || `evt_${Date.now()}`;
    const eventType = validation.eventType || "UNKNOWN";
    const chargeId = validation.chargeId || "unknown";
    const tenantId = payload.payment?.customer?.startsWith("acad_") ? payload.payment.customer : "acad_matriz";
    console.log(`[Asaas Webhook] Evento recebido: ${eventType} | ChargeId: ${chargeId} | EventId: ${eventId}`);
    const idempotencyKey = idempotencyService.makeKey("asaas", `${eventId}_${eventType}`);
    const existingEntry = await idempotencyService.getEntry(idempotencyKey);
    if (existingEntry && existingEntry.status === "completed") {
      console.log(`[Asaas Webhook] Evento duplicado reconhecido via Idempotency: ${idempotencyKey}`);
      return res.status(200).json({
        success: true,
        status: "DUPLICATE_ACKNOWLEDGED",
        message: "Evento j\xE1 recebido e processado com sucesso anteriormente.",
        eventId
      });
    }
    financialAuditService.record({
      tenantId,
      action: "WEBHOOK_RECEIVED",
      entity: "webhook",
      entityId: eventId,
      origin: "asaas_webhook",
      result: "success",
      details: {
        eventType,
        chargeId,
        sanitizedPayload: JSON.parse(sanitizeLogOutput(payload))
      }
    });
    try {
      const job = await financialQueueService.enqueue("ASAAS_WEBHOOK_EVENT", payload);
      financialAuditService.record({
        tenantId,
        action: "WEBHOOK_QUEUED",
        entity: "webhook",
        entityId: eventId,
        origin: "asaas_webhook",
        result: "success",
        details: { jobId: job.id, eventType }
      });
      const latencyMs = Date.now() - startTime;
      return res.status(200).json({
        success: true,
        status: "QUEUED",
        message: "Evento Asaas validado e enfileirado no motor financeiro com sucesso.",
        eventId,
        jobId: job.id,
        latencyMs
      });
    } catch (queueErr) {
      console.error("[Asaas Webhook] Erro ao enfileirar job:", queueErr);
      return res.status(500).json({
        error: "QUEUE_ERROR",
        message: "Falha tempor\xE1ria ao registrar transa\xE7\xE3o na fila de processamento."
      });
    }
  });
  app.get("/api/financial/health", (req, res) => {
    const queueStatus = financialQueueService.getStatusMetrics();
    const workerStatus = financialWorker.getWorkerStats();
    const trackedIdempotencyCount = idempotencyService.getTrackedCount();
    res.json({
      status: "ok",
      engine: "BJJ Academy Financial Motor v2.0",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      redis: {
        connected: queueStatus.redisConnected,
        mode: queueStatus.redisConnected ? "redis_distributed" : "in_memory_resilient"
      },
      queue: queueStatus,
      worker: workerStatus,
      idempotency: {
        trackedCount: trackedIdempotencyCount,
        ttl: "7 days (604800s)"
      }
    });
  });
  app.get("/api/financial/audits", (req, res) => {
    const tenantId = req.query.tenantId || "all";
    const limit = parseInt(req.query.limit || "50", 10);
    const action = req.query.action;
    const audits = financialAuditService.query({ tenantId, limit, action });
    res.json({
      tenantId,
      count: audits.length,
      audits
    });
  });
  app.get("/api/financial/notifications", (req, res) => {
    const tenantId = req.query.tenantId || "all";
    const notifications = financialWorker.getNotifications(tenantId);
    res.json({
      success: true,
      tenantId,
      count: notifications.length,
      notifications
    });
  });
  app.post("/api/financial/simulate-webhook", async (req, res) => {
    const { event, invoiceId, amount, studentName, academyId } = req.body;
    const eventType = event || "PAYMENT_CONFIRMED";
    const targetId = invoiceId || `inv_sim_${Date.now()}`;
    const value = typeof amount === "number" ? amount : 260;
    const tenantId = academyId || "acad_matriz";
    const simulatedPayload = {
      event: eventType,
      id: `evt_sim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      dateCreated: (/* @__PURE__ */ new Date()).toISOString(),
      payment: {
        object: "payment",
        id: `pay_${Date.now()}`,
        value,
        netValue: value - (value * 0.0215 + 0.89),
        billingType: "PIX",
        status: eventType === "PAYMENT_CONFIRMED" ? "RECEIVED" : eventType === "PAYMENT_OVERDUE" ? "OVERDUE" : "REFUNDED",
        dueDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        confirmedDate: eventType === "PAYMENT_CONFIRMED" ? (/* @__PURE__ */ new Date()).toISOString() : void 0,
        externalReference: targetId,
        invoiceNumber: `BJJ-SIM-${Math.floor(Math.random() * 9e3 + 1e3)}`,
        customer: tenantId,
        customerName: studentName || "Aluno Tatame",
        studentName: studentName || "Aluno Tatame",
        phone: "85998765432",
        invoiceUrl: `https://sandbox.asaas.com/i/pay_${Date.now()}`,
        description: `Mensalidade BJJ Academy - ${studentName || "Aluno Tatame"}`
      }
    };
    const job = await financialQueueService.enqueue("ASAAS_WEBHOOK_EVENT", simulatedPayload);
    res.json({
      success: true,
      simulated: true,
      jobId: job.id,
      eventType,
      invoiceId: targetId,
      message: `Evento simulado ${eventType} enfileirado com sucesso para processamento do Worker.`
    });
  });
  app.post("/api/financial/sansao-query", (req, res) => {
    const { queryText, invoices = [], expenses = [], tenantId = "all" } = req.body;
    if (!queryText || typeof queryText !== "string") {
      return res.status(400).json({ error: "Consulta n\xE3o fornecida." });
    }
    const result = SansaoFinancialQueryService.answerFinancialQuery(
      queryText,
      invoices,
      expenses,
      tenantId
    );
    financialAuditService.record({
      tenantId,
      action: "SANSAO_QUERY_EXECUTED",
      entity: "financial_metric",
      entityId: "query",
      origin: "sansao_ai",
      result: "success",
      details: { query: queryText }
    });
    res.json(result);
  });
  app.post("/api/students/validate-and-enroll", (req, res) => {
    const { tenantId, student, clientCountOverride } = req.body;
    if (!tenantId || !student) {
      return res.status(400).json({
        success: false,
        error: "BAD_REQUEST",
        message: "Par\xE2metros tenantId e dados do aluno s\xE3o obrigat\xF3rios."
      });
    }
    const validation = tenantValidationService.validateStudentEnrollment({
      tenantId,
      student,
      clientCountOverride
    });
    if (!validation.allowed) {
      return res.status(403).json({
        success: false,
        error: validation.code,
        message: validation.message,
        tenantId: validation.tenantId,
        tenantName: validation.tenantName,
        planTier: validation.planTier,
        limit: validation.limit,
        currentActive: validation.currentActive,
        remainingSlots: validation.remainingSlots,
        suggestedUpgradeTier: validation.suggestedUpgradeTier
      });
    }
    return res.status(200).json({
      success: true,
      status: "APPROVED",
      message: validation.message,
      tenantId: validation.tenantId,
      tenantName: validation.tenantName,
      planTier: validation.planTier,
      limit: validation.limit,
      currentActive: validation.currentActive,
      remainingSlots: validation.remainingSlots
    });
  });
  app.get("/api/tenants/:tenantId/plan-status", (req, res) => {
    const { tenantId } = req.params;
    const clientCountOverride = req.query.activeCount ? parseInt(req.query.activeCount, 10) : void 0;
    const status = tenantValidationService.getPlanStatus(tenantId, clientCountOverride);
    res.json(status);
  });
  app.post("/api/tenants/:tenantId/upgrade-plan", (req, res) => {
    const { tenantId } = req.params;
    const { newPlanTier } = req.body;
    if (!newPlanTier || !["BRONZE", "PRATA", "OURO"].includes(newPlanTier)) {
      return res.status(400).json({
        error: "INVALID_PLAN_TIER",
        message: "Plano inv\xE1lido. Selecione BRONZE, PRATA ou OURO."
      });
    }
    const upgradeResult = tenantValidationService.upgradePlan(tenantId, newPlanTier);
    res.json(upgradeResult);
  });
  app.post("/api/tenants/:tenantId/sync-count", (req, res) => {
    const { tenantId } = req.params;
    const { count } = req.body;
    if (typeof count === "number") {
      tenantValidationService.updateActiveCount(tenantId, count);
    }
    const status = tenantValidationService.getPlanStatus(tenantId);
    res.json(status);
  });
  app.post("/api/tenants/:tenantId/students/enroll", async (req, res) => {
    const { tenantId } = req.params;
    const dadosAluno = req.body;
    try {
      const novoAluno = await asaasSubaccountService.cadastrarAluno(tenantId, dadosAluno);
      return res.status(201).json({
        success: true,
        message: `Aluno ${novoAluno.nome} matriculado com sucesso no sistema!`,
        student: novoAluno
      });
    } catch (err) {
      console.warn(`[Student Enrollment Blocked] Tenant ${tenantId}:`, err.message);
      const isLimit = err.code === "LIMIT_REACHED";
      const isBlocked = err.message?.includes("ACADEMY_BLOCKED");
      return res.status(isLimit || isBlocked ? 403 : 400).json({
        success: false,
        error: isLimit ? "LIMIT_REACHED" : isBlocked ? "ACADEMY_BLOCKED" : "VALIDATION_ERROR",
        message: err.message,
        tenantId,
        currentActive: err.currentActive,
        limit: err.limit,
        suggestedTier: err.suggestedTier
      });
    }
  });
  app.post("/api/tenants/:tenantId/asaas/subscription", async (req, res) => {
    const { tenantId } = req.params;
    const { customerId, planTier, cardToken } = req.body;
    if (!customerId || !planTier) {
      return res.status(400).json({
        error: "BAD_REQUEST",
        message: "Campos customerId e planTier (BRONZE, PRATA, OURO) s\xE3o obrigat\xF3rios."
      });
    }
    try {
      const subscription = await asaasSubaccountService.createTenantSoftwareSubscription(
        tenantId,
        customerId,
        planTier,
        cardToken
      );
      tenantValidationService.upgradePlan(tenantId, planTier);
      return res.status(200).json({
        success: true,
        message: `Assinatura recorrente do plano ${planTier} criada com sucesso no Asaas.`,
        subscription
      });
    } catch (err) {
      console.error("[Asaas Subscription Error]:", err.message);
      return res.status(500).json({
        error: "SUBSCRIPTION_CREATION_FAILED",
        message: err.message
      });
    }
  });
  app.post("/api/webhooks/asaas/tenants", async (req, res) => {
    const tokenHeader = req.headers["asaas-access-token"] || req.headers["authorization"];
    const authResult = validateWebhookAuth(tokenHeader);
    if (!authResult.isAuthorized) {
      return res.status(401).json({
        error: "UNAUTHORIZED",
        message: "Token de webhook inv\xE1lido."
      });
    }
    const { event, payment } = req.body;
    if (!event || !payment) {
      return res.status(400).json({ error: "Payload incompleto." });
    }
    try {
      const result = asaasSubaccountService.handleTenantSubscriptionWebhook(event, payment);
      return res.status(200).json({
        success: true,
        event,
        ...result
      });
    } catch (err) {
      console.error("[Tenant Webhook Error]:", err);
      return res.status(500).json({ error: "INTERNAL_ERROR", message: err.message });
    }
  });
  app.post("/api/tenants/:tenantId/asaas/subaccount", async (req, res) => {
    const { tenantId } = req.params;
    const subaccountData = req.body;
    if (!subaccountData.email || !subaccountData.cpfCnpj) {
      return res.status(400).json({
        error: "BAD_REQUEST",
        message: "Campos email e cpfCnpj s\xE3o obrigat\xF3rios para abertura de subconta Asaas."
      });
    }
    try {
      const subaccount = await asaasSubaccountService.createTenantSubaccount(tenantId, subaccountData);
      return res.status(201).json({
        success: true,
        message: "Subconta Asaas criada com sucesso. Chave de API e Carteira vinculadas ao Tenant.",
        subaccount
      });
    } catch (err) {
      console.error("[Asaas Subaccount Error]:", err.message);
      return res.status(500).json({
        error: "SUBACCOUNT_CREATION_FAILED",
        message: err.message
      });
    }
  });
  app.post("/api/tenants/:tenantId/students/charge-with-split", async (req, res) => {
    const { tenantId } = req.params;
    const paymentData = req.body;
    if (!paymentData.studentId || !paymentData.value || !paymentData.dueDate) {
      return res.status(400).json({
        error: "BAD_REQUEST",
        message: "Campos studentId, value e dueDate s\xE3o obrigat\xF3rios para emitir cobran\xE7a com split."
      });
    }
    try {
      const payment = await asaasSubaccountService.createStudentPaymentWithSplit(tenantId, paymentData);
      return res.status(201).json({
        success: true,
        message: "Cobran\xE7a do aluno gerada com Split autom\xE1tico para a BJJACADEMY Master.",
        payment
      });
    } catch (err) {
      console.error("[Student Split Payment Error]:", err.message);
      return res.status(400).json({
        error: "PAYMENT_GENERATION_FAILED",
        message: err.message
      });
    }
  });
  app.get("/api/tenants/:tenantId/asaas/config", (req, res) => {
    const { tenantId } = req.params;
    const tenant = asaasSubaccountService.getTenant(tenantId);
    if (!tenant) {
      return res.status(404).json({ error: "TENANT_NOT_FOUND", message: "Academia n\xE3o encontrada." });
    }
    return res.json({
      tenantId: tenant.id,
      nome: tenant.nome,
      plano_tipo: tenant.plano_tipo,
      limite_alunos: tenant.limite_alunos,
      status: tenant.status,
      hasSubaccount: !!tenant.asaas_wallet_id,
      asaas_wallet_id: tenant.asaas_wallet_id,
      asaas_account_number: tenant.asaas_account_number,
      asaas_subscription_id: tenant.asaas_subscription_id,
      overdue_since: tenant.overdue_since,
      blocked_at: tenant.blocked_at,
      masterWalletId: asaasSubaccountService.getMasterWalletId(),
      defaultSplitFixedFee: asaasSubaccountService.getDefaultSplitFee()
    });
  });
  app.post("/api/whatsapp/send-overdue-alert", async (req, res) => {
    const { alunoNome, alunoTelefone, academiaNome, linkPagamento, valor, dataVencimento, tenantId, alunoId } = req.body;
    if (!alunoNome || !alunoTelefone) {
      return res.status(400).json({
        error: "BAD_REQUEST",
        message: "Campos alunoNome e alunoTelefone s\xE3o obrigat\xF3rios."
      });
    }
    try {
      const result = await whatsappService.enviarAlertaVencimentoAluno({
        alunoId,
        alunoNome,
        alunoTelefone,
        academiaNome: academiaNome || "Loyalty Jiu-Jitsu",
        linkPagamento: linkPagamento || "https://sandbox.asaas.com/i/pay_exemplo_123",
        valor,
        dataVencimento,
        tenantId: tenantId || "acad_loyalty_jiujitsu"
      });
      return res.status(200).json({
        success: true,
        message: `Alerta amig\xE1vel de WhatsApp disparado para ${alunoNome}.`,
        result
      });
    } catch (err) {
      console.error("[WhatsApp Route Error]:", err);
      return res.status(500).json({ error: "WHATSAPP_DISPATCH_FAILED", message: err.message });
    }
  });
  app.get("/api/whatsapp/logs", (req, res) => {
    return res.json({
      success: true,
      logs: whatsappService.getRecentLogs()
    });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[BJJ Academy Server] Motor financeiro & Vite rodando na porta ${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("[BJJ Academy Server] Erro fatal ao iniciar:", err);
  process.exit(1);
});
//# sourceMappingURL=server.cjs.map
