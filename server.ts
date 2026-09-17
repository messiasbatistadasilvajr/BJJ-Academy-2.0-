import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { validateWebhookAuth, validateAsaasPayload, sanitizeLogOutput } from './server/services/asaasValidator';
import { idempotencyService } from './server/services/idempotencyService';
import { financialQueueService } from './server/services/queueService';
import { financialAuditService } from './server/services/financialAuditService';
import { financialWorker } from './server/services/financialWorker';
import { SansaoFinancialQueryService } from './server/services/sansaoFinancialQueryService';
import { tenantValidationService } from './server/services/tenantValidationService';
import { asaasSubaccountService } from './server/services/asaasSubaccountService';
import { whatsappService } from './server/services/whatsappService';

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
        customerName: studentName || 'Aluno Tatame',
        studentName: studentName || 'Aluno Tatame',
        phone: '85998765432',
        invoiceUrl: `https://sandbox.asaas.com/i/pay_${Date.now()}`,
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
  // 6. DATABASE TIER SAAS PLAN VALIDATION & ACTIVE STUDENTS LOCK
  // Regra inviolável no Backend / Database Tier para validação de teto de alunos
  // -----------------------------------------------------------------
  
  // Endpoint de Validação Pré-Insert de Aluno
  app.post('/api/students/validate-and-enroll', (req, res) => {
    const { tenantId, student, clientCountOverride } = req.body;

    if (!tenantId || !student) {
      return res.status(400).json({
        success: false,
        error: 'BAD_REQUEST',
        message: 'Parâmetros tenantId e dados do aluno são obrigatórios.'
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
      status: 'APPROVED',
      message: validation.message,
      tenantId: validation.tenantId,
      tenantName: validation.tenantName,
      planTier: validation.planTier,
      limit: validation.limit,
      currentActive: validation.currentActive,
      remainingSlots: validation.remainingSlots
    });
  });

  // Endpoint para Consultar Status do Plano do Tenant
  app.get('/api/tenants/:tenantId/plan-status', (req, res) => {
    const { tenantId } = req.params;
    const clientCountOverride = req.query.activeCount ? parseInt(req.query.activeCount as string, 10) : undefined;
    const status = tenantValidationService.getPlanStatus(tenantId, clientCountOverride);
    res.json(status);
  });

  // Endpoint de Upgrade de Plano SaaS (Liberando vagas instantaneamente)
  app.post('/api/tenants/:tenantId/upgrade-plan', (req, res) => {
    const { tenantId } = req.params;
    const { newPlanTier } = req.body;

    if (!newPlanTier || !['BRONZE', 'PRATA', 'OURO'].includes(newPlanTier)) {
      return res.status(400).json({
        error: 'INVALID_PLAN_TIER',
        message: 'Plano inválido. Selecione BRONZE, PRATA ou OURO.'
      });
    }

    const upgradeResult = tenantValidationService.upgradePlan(tenantId, newPlanTier);
    res.json(upgradeResult);
  });

  // Endpoint de Sincronia de Contagem de Ativos
  app.post('/api/tenants/:tenantId/sync-count', (req, res) => {
    const { tenantId } = req.params;
    const { count } = req.body;

    if (typeof count === 'number') {
      tenantValidationService.updateActiveCount(tenantId, count);
    }
    const status = tenantValidationService.getPlanStatus(tenantId);
    res.json(status);
  });

  // -----------------------------------------------------------------
  // 7. ASAAS SUBCONTAS, SPLIT DE PAGAMENTO E ASSINATURAS DO SOFTWARE
  // Arquitetura Financeira Multi-Tenant (BJJACADEMY)
  // -----------------------------------------------------------------

  // 7.1 Cadastrar Aluno com Validação Estrita no Backend (cadastrarAluno)
  app.post('/api/tenants/:tenantId/students/enroll', async (req, res) => {
    const { tenantId } = req.params;
    const dadosAluno = req.body;

    try {
      const novoAluno = await asaasSubaccountService.cadastrarAluno(tenantId, dadosAluno);
      return res.status(201).json({
        success: true,
        message: `Aluno ${novoAluno.nome} matriculado com sucesso no sistema!`,
        student: novoAluno
      });
    } catch (err: any) {
      console.warn(`[Student Enrollment Blocked] Tenant ${tenantId}:`, err.message);
      const isLimit = err.code === 'LIMIT_REACHED';
      const isBlocked = err.message?.includes('ACADEMY_BLOCKED');

      return res.status(isLimit || isBlocked ? 403 : 400).json({
        success: false,
        error: isLimit ? 'LIMIT_REACHED' : isBlocked ? 'ACADEMY_BLOCKED' : 'VALIDATION_ERROR',
        message: err.message,
        tenantId,
        currentActive: err.currentActive,
        limit: err.limit,
        suggestedTier: err.suggestedTier
      });
    }
  });

  // 7.2 Assinatura Mensal da Academia para a BJJACADEMY Master (POST /v3/subscriptions)
  app.post('/api/tenants/:tenantId/asaas/subscription', async (req, res) => {
    const { tenantId } = req.params;
    const { customerId, planTier, cardToken } = req.body;

    if (!customerId || !planTier) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'Campos customerId e planTier (BRONZE, PRATA, OURO) são obrigatórios.'
      });
    }

    try {
      const subscription = await asaasSubaccountService.createTenantSoftwareSubscription(
        tenantId,
        customerId,
        planTier,
        cardToken
      );

      // Também sincroniza a regra de teto no serviço de validação
      tenantValidationService.upgradePlan(tenantId, planTier);

      return res.status(200).json({
        success: true,
        message: `Assinatura recorrente do plano ${planTier} criada com sucesso no Asaas.`,
        subscription
      });
    } catch (err: any) {
      console.error('[Asaas Subscription Error]:', err.message);
      return res.status(500).json({
        error: 'SUBSCRIPTION_CREATION_FAILED',
        message: err.message
      });
    }
  });

  // 7.3 Webhook Asaas para Mensalidades das Academias (Tenants)
  // Trata PAYMENT_RECEIVED (ativação imediata) e PAYMENT_OVERDUE (carência de 3 dias)
  app.post('/api/webhooks/asaas/tenants', async (req, res) => {
    const tokenHeader = (req.headers['asaas-access-token'] || req.headers['authorization']) as string | undefined;
    const authResult = validateWebhookAuth(tokenHeader);

    if (!authResult.isAuthorized) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Token de webhook inválido.'
      });
    }

    const { event, payment } = req.body;
    if (!event || !payment) {
      return res.status(400).json({ error: 'Payload incompleto.' });
    }

    try {
      const result = asaasSubaccountService.handleTenantSubscriptionWebhook(event, payment);
      return res.status(200).json({
        success: true,
        event,
        ...result
      });
    } catch (err: any) {
      console.error('[Tenant Webhook Error]:', err);
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  });

  // 7.4 Criação da Subconta Asaas da Academia (POST /v3/accounts)
  // Onboarding onde o dinheiro dos alunos cairá direto
  app.post('/api/tenants/:tenantId/asaas/subaccount', async (req, res) => {
    const { tenantId } = req.params;
    const subaccountData = req.body;

    if (!subaccountData.email || !subaccountData.cpfCnpj) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'Campos email e cpfCnpj são obrigatórios para abertura de subconta Asaas.'
      });
    }

    try {
      const subaccount = await asaasSubaccountService.createTenantSubaccount(tenantId, subaccountData);
      return res.status(201).json({
        success: true,
        message: 'Subconta Asaas criada com sucesso. Chave de API e Carteira vinculadas ao Tenant.',
        subaccount
      });
    } catch (err: any) {
      console.error('[Asaas Subaccount Error]:', err.message);
      return res.status(500).json({
        error: 'SUBACCOUNT_CREATION_FAILED',
        message: err.message
      });
    }
  });

  // 7.5 Cobrança de Aluno com Split para a Carteira Master (POST /v3/payments)
  // Cai direto na subconta da academia retendo a taxa fixa da BJJACADEMY Master
  app.post('/api/tenants/:tenantId/students/charge-with-split', async (req, res) => {
    const { tenantId } = req.params;
    const paymentData = req.body;

    if (!paymentData.studentId || !paymentData.value || !paymentData.dueDate) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'Campos studentId, value e dueDate são obrigatórios para emitir cobrança com split.'
      });
    }

    try {
      const payment = await asaasSubaccountService.createStudentPaymentWithSplit(tenantId, paymentData);
      return res.status(201).json({
        success: true,
        message: 'Cobrança do aluno gerada com Split automático para a BJJACADEMY Master.',
        payment
      });
    } catch (err: any) {
      console.error('[Student Split Payment Error]:', err.message);
      return res.status(400).json({
        error: 'PAYMENT_GENERATION_FAILED',
        message: err.message
      });
    }
  });

  // 7.6 Consulta de Configuração Financeira do Tenant & Split
  app.get('/api/tenants/:tenantId/asaas/config', (req, res) => {
    const { tenantId } = req.params;
    const tenant = asaasSubaccountService.getTenant(tenantId);

    if (!tenant) {
      return res.status(404).json({ error: 'TENANT_NOT_FOUND', message: 'Academia não encontrada.' });
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

  // 7.7 Alertas de Vencimento via WhatsApp (Evolution API / Z-API)
  app.post('/api/whatsapp/send-overdue-alert', async (req, res) => {
    const { alunoNome, alunoTelefone, academiaNome, linkPagamento, valor, dataVencimento, tenantId, alunoId } = req.body;

    if (!alunoNome || !alunoTelefone) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'Campos alunoNome e alunoTelefone são obrigatórios.'
      });
    }

    try {
      const result = await whatsappService.enviarAlertaVencimentoAluno({
        alunoId,
        alunoNome,
        alunoTelefone,
        academiaNome: academiaNome || 'Loyalty Jiu-Jitsu',
        linkPagamento: linkPagamento || 'https://sandbox.asaas.com/i/pay_exemplo_123',
        valor,
        dataVencimento,
        tenantId: tenantId || 'acad_loyalty_jiujitsu'
      });

      return res.status(200).json({
        success: true,
        message: `Alerta amigável de WhatsApp disparado para ${alunoNome}.`,
        result
      });
    } catch (err: any) {
      console.error('[WhatsApp Route Error]:', err);
      return res.status(500).json({ error: 'WHATSAPP_DISPATCH_FAILED', message: err.message });
    }
  });

  app.get('/api/whatsapp/logs', (req, res) => {
    return res.json({
      success: true,
      logs: whatsappService.getRecentLogs()
    });
  });

  // -----------------------------------------------------------------
  // 8. VITE MIDDLEWARE & STATIC ASSETS
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
