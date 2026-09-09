import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { validateWebhookAuth, validateAsaasPayload, sanitizeLogOutput } from './server/services/asaasValidator';
import { idempotencyService } from './server/services/idempotencyService';
import { financialQueueService } from './server/services/queueService';
import { financialAuditService } from './server/services/financialAuditService';
import { financialWorker } from './server/services/financialWorker';
import { SansaoFinancialQueryService } from './server/services/sansaoFinancialQueryService';

const PORT = 3000;

async function startServer() {
  const app = express();

  // Parse JSON payloads with reasonable size limit
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Start background worker for Redis / Financial Queue
  financialWorker.start();

  // -----------------------------------------------------------------
  // 1. ASAAS WEBHOOK OFFICIAL INGESTION ENDPOINT
  // Flow: Asaas Webhook -> API -> Validation -> Idempotency -> Queue -> Worker
  // -----------------------------------------------------------------
  app.post('/api/webhooks/asaas', async (req, res) => {
    const startTime = Date.now();
    const tokenHeader = (req.headers['asaas-access-token'] || req.headers['authorization']) as string | undefined;

    // Step 1: Validate webhook authenticity
    const authResult = validateWebhookAuth(tokenHeader);
    if (!authResult.isAuthorized) {
      console.warn('[Asaas Webhook] Tentativa de acesso não autorizada ao webhook:', authResult.reason);
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Token de autenticação do webhook Asaas ausente ou inválido.'
      });
    }

    // Step 2: Validate payload schema & structure
    const validation = validateAsaasPayload(req.body);
    if (!validation.isValid || !validation.sanitizedPayload) {
      console.warn('[Asaas Webhook] Payload inválido rejeitado:', validation.errorMessage);
      return res.status(400).json({
        error: validation.errorCode || 'BAD_REQUEST',
        message: validation.errorMessage || 'Payload Asaas inválido.'
      });
    }

    const payload = validation.sanitizedPayload;
    const eventId = payload.id || `evt_${Date.now()}`;
    const eventType = validation.eventType || 'UNKNOWN';
    const chargeId = validation.chargeId || 'unknown';
    const tenantId = payload.payment?.customer?.startsWith('acad_') ? payload.payment.customer : 'acad_matriz';

    // Log safely (sanitized, no secrets)
    console.log(`[Asaas Webhook] Evento recebido: ${eventType} | ChargeId: ${chargeId} | EventId: ${eventId}`);

    // Step 3: Fast Idempotency Pre-Check
    const idempotencyKey = idempotencyService.makeKey('asaas', `${eventId}_${eventType}`);
    const existingEntry = await idempotencyService.getEntry(idempotencyKey);

    if (existingEntry && existingEntry.status === 'completed') {
      console.log(`[Asaas Webhook] Evento duplicado reconhecido via Idempotency: ${idempotencyKey}`);
      return res.status(200).json({
        success: true,
        status: 'DUPLICATE_ACKNOWLEDGED',
        message: 'Evento já recebido e processado com sucesso anteriormente.',
        eventId
      });
    }

    // Step 4: Audit Webhook Intake
    financialAuditService.record({
      tenantId,
      action: 'WEBHOOK_RECEIVED',
      entity: 'webhook',
      entityId: eventId,
      origin: 'asaas_webhook',
      result: 'success',
      details: {
        eventType,
        chargeId,
        sanitizedPayload: JSON.parse(sanitizeLogOutput(payload))
      }
    });

    // Step 5: Push into Queue for asynchronous worker processing (Fast HTTP Response)
    try {
      const job = await financialQueueService.enqueue('ASAAS_WEBHOOK_EVENT', payload);

      financialAuditService.record({
        tenantId,
        action: 'WEBHOOK_QUEUED',
        entity: 'webhook',
        entityId: eventId,
        origin: 'asaas_webhook',
        result: 'success',
        details: { jobId: job.id, eventType }
      });

      const latencyMs = Date.now() - startTime;
      return res.status(200).json({
        success: true,
        status: 'QUEUED',
        message: 'Evento Asaas validado e enfileirado no motor financeiro com sucesso.',
        eventId,
        jobId: job.id,
        latencyMs
      });
    } catch (queueErr: any) {
      console.error('[Asaas Webhook] Erro ao enfileirar job:', queueErr);
      return res.status(500).json({
        error: 'QUEUE_ERROR',
        message: 'Falha temporária ao registrar transação na fila de processamento.'
      });
    }
  });

  // -----------------------------------------------------------------
  // 2. HEALTH CHECK & MOTOR METRICS
  // -----------------------------------------------------------------
  app.get('/api/financial/health', (req, res) => {
    const queueStatus = financialQueueService.getStatusMetrics();
    const workerStatus = financialWorker.getWorkerStats();
    const trackedIdempotencyCount = idempotencyService.getTrackedCount();

    res.json({
      status: 'ok',
      engine: 'BJJ Academy Financial Motor v2.0',
      timestamp: new Date().toISOString(),
      redis: {
        connected: queueStatus.redisConnected,
        mode: queueStatus.redisConnected ? 'redis_distributed' : 'in_memory_resilient'
      },
      queue: queueStatus,
      worker: workerStatus,
      idempotency: {
        trackedCount: trackedIdempotencyCount,
        ttl: '7 days (604800s)'
      }
    });
  });

  // -----------------------------------------------------------------
  // 3. MULTI-TENANT FINANCIAL AUDIT LOGS
  // -----------------------------------------------------------------
  app.get('/api/financial/audits', (req, res) => {
    const tenantId = (req.query.tenantId as string) || 'all';
    const limit = parseInt((req.query.limit as string) || '50', 10);
    const action = req.query.action as string | undefined;

    const audits = financialAuditService.query({ tenantId, limit, action });
    res.json({
      tenantId,
      count: audits.length,
      audits
    });
  });

  // -----------------------------------------------------------------
  // 4. SIMULATION ENDPOINT FOR TESTING & INTEGRATION
  // Safely generates and fires a real webhook event through the pipeline
  // -----------------------------------------------------------------
  app.post('/api/financial/simulate-webhook', async (req, res) => {
    const { event, invoiceId, amount, studentName, academyId } = req.body;

    const eventType = event || 'PAYMENT_CONFIRMED';
    const targetId = invoiceId || `inv_sim_${Date.now()}`;
    const value = typeof amount === 'number' ? amount : 260.0;
    const tenantId = academyId || 'acad_matriz';

    const simulatedPayload = {
      event: eventType,
      id: `evt_sim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      dateCreated: new Date().toISOString(),
      payment: {
        object: 'payment',
        id: `pay_${Date.now()}`,
        value,
        netValue: value - (value * 0.0215 + 0.89),
        billingType: 'PIX',
        status: eventType === 'PAYMENT_CONFIRMED' ? 'RECEIVED' : eventType === 'PAYMENT_OVERDUE' ? 'OVERDUE' : 'REFUNDED',
        dueDate: new Date().toISOString().split('T')[0],
        confirmedDate: eventType === 'PAYMENT_CONFIRMED' ? new Date().toISOString() : undefined,
        externalReference: targetId,
        invoiceNumber: `BJJ-SIM-${Math.floor(Math.random() * 9000 + 1000)}`,
        customer: tenantId,
        description: `Mensalidade BJJ Academy - ${studentName || 'Aluno Tatame'}`
      }
    };

    const job = await financialQueueService.enqueue('ASAAS_WEBHOOK_EVENT', simulatedPayload);

    res.json({
      success: true,
      simulated: true,
      jobId: job.id,
      eventType,
      invoiceId: targetId,
      message: `Evento simulado ${eventType} enfileirado com sucesso para processamento do Worker.`
    });
  });

  // -----------------------------------------------------------------
  // 5. SANSÃO IA READ-ONLY FINANCIAL QUERY
  // Strict Read-Only Financial Assistant
  // -----------------------------------------------------------------
  app.post('/api/financial/sansao-query', (req, res) => {
    const { queryText, invoices = [], expenses = [], tenantId = 'all' } = req.body;

    if (!queryText || typeof queryText !== 'string') {
      return res.status(400).json({ error: 'Consulta não fornecida.' });
    }

    const result = SansaoFinancialQueryService.answerFinancialQuery(
      queryText,
      invoices,
      expenses,
      tenantId
    );

    financialAuditService.record({
      tenantId,
      action: 'SANSAO_QUERY_EXECUTED',
      entity: 'financial_metric',
      entityId: 'query',
      origin: 'sansao_ai',
      result: 'success',
      details: { query: queryText }
    });

    res.json(result);
  });

  // -----------------------------------------------------------------
  // 6. VITE MIDDLEWARE & STATIC ASSETS
  // -----------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BJJ Academy Server] Motor financeiro & Vite rodando na porta ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[BJJ Academy Server] Erro fatal ao iniciar:', err);
  process.exit(1);
});
