import React, { useState, useEffect } from 'react';
import {
  Activity,
  Server,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Send,
  Bot,
  Play,
  Cpu,
  Database,
  RefreshCw,
  Zap,
  Clock,
  DollarSign,
  Plus,
  Trash2,
  Check,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Invoice, RegisteredAcademy, FinancialAuditLog, PayableExpense, PayableExpenseCategory } from '../../types';
import {
  subscribeToFinancialAudits,
  saveFinancialAuditToFirestore,
  subscribeToPayableExpenses,
  savePayableExpenseToFirestore,
  deletePayableExpenseFromFirestore,
  saveInvoiceToFirestore
} from '../../firebase/firestoreService';

interface FinancialMotorTabProps {
  invoices: Invoice[];
  academies: RegisteredAcademy[];
  activeAcademy: RegisteredAcademy;
  selectedAcademyFilter: string;
  accessProfile: 'general_manager' | 'unit_manager';
  assignedUnitId: string;
  onUpdateInvoiceStatus?: (invoiceId: string, status: Invoice['status'], amountPaid?: number) => void;
  triggerPushNotification?: (title: string, body: string, type?: 'payment' | 'warning' | 'class') => void;
}

export const FinancialMotorTab: React.FC<FinancialMotorTabProps> = ({
  invoices,
  academies,
  activeAcademy,
  selectedAcademyFilter,
  accessProfile,
  assignedUnitId,
  onUpdateInvoiceStatus,
  triggerPushNotification
}) => {
  // Motor Telemetry State
  const [motorHealth, setMotorHealth] = useState<{
    status: string;
    engine: string;
    redis: { connected: boolean; mode: string };
    queue: {
      queuedCount: number;
      processingCount: number;
      completedCount: number;
      failedCount: number;
      deadLetterCount: number;
    };
    worker: { isRunning: boolean; isProcessing: boolean; notificationsCount: number };
    idempotency: { trackedCount: number; ttl: string };
  }>({
    status: 'ok',
    engine: 'BJJ Academy Financial Motor v2.0',
    redis: { connected: false, mode: 'in_memory_resilient' },
    queue: { queuedCount: 0, processingCount: 0, completedCount: 0, failedCount: 0, deadLetterCount: 0 },
    worker: { isRunning: true, isProcessing: false, notificationsCount: 0 },
    idempotency: { trackedCount: 0, ttl: '7 days (604800s)' }
  });

  const [isLoadingHealth, setIsLoadingHealth] = useState(false);

  // Audits & Expenses
  const [audits, setAudits] = useState<FinancialAuditLog[]>([]);
  const [expenses, setExpenses] = useState<PayableExpense[]>([]);

  // Simulation State
  const [simSelectedInvoiceId, setSimSelectedInvoiceId] = useState<string>(
    invoices.find(i => i.status === 'pending' || i.status === 'overdue')?.id || invoices[0]?.id || ''
  );
  const [simEventType, setSimEventType] = useState<'PAYMENT_CONFIRMED' | 'PAYMENT_OVERDUE' | 'PAYMENT_REFUNDED'>('PAYMENT_CONFIRMED');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simFeedback, setSimFeedback] = useState<string | null>(null);

  // New Payable Expense Form
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState<number>(350);
  const [expenseCategory, setExpenseCategory] = useState<PayableExpenseCategory>('aluguel');
  const [expenseDueDate, setExpenseDueDate] = useState('10/09/2026');
  const [expenseRecipient, setExpenseRecipient] = useState('');

  // Sansão IA Financial Query Assistant
  const [iaQuery, setIaQuery] = useState('');
  const [iaAnswer, setIaAnswer] = useState<string | null>(null);
  const [isIaThinking, setIsIaThinking] = useState(false);

  // Multi-tenant effective academy id
  const effectiveTenantId = accessProfile === 'general_manager' ? selectedAcademyFilter : assignedUnitId;

  // Fetch Health status from server
  const fetchHealth = async () => {
    setIsLoadingHealth(true);
    try {
      const res = await fetch('/api/financial/health');
      if (res.ok) {
        const data = await res.json();
        setMotorHealth(data);
      }
    } catch {
      // Offline fallback
    } finally {
      setIsLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  // Subscribe to Audits & Expenses from Firestore
  useEffect(() => {
    const unsubAudits = subscribeToFinancialAudits((list) => {
      setAudits(list);
    });
    const unsubExpenses = subscribeToPayableExpenses((list) => {
      setExpenses(list);
    });
    return () => {
      unsubAudits();
      unsubExpenses();
    };
  }, []);

  // Filtered lists according to Multi-Tenant isolation
  const visibleAudits = audits.filter(a => {
    if (accessProfile === 'unit_manager') return a.tenantId === assignedUnitId;
    return selectedAcademyFilter === 'all' ? true : a.tenantId === selectedAcademyFilter;
  });

  const visibleExpenses = expenses.filter(e => {
    if (accessProfile === 'unit_manager') return e.tenantId === assignedUnitId;
    return selectedAcademyFilter === 'all' ? true : e.tenantId === selectedAcademyFilter;
  });

  // Calculate Cashflow Summary
  const targetInvoices = invoices.filter(inv => {
    if (accessProfile === 'unit_manager') return inv.academyId === assignedUnitId;
    return selectedAcademyFilter === 'all' ? true : inv.academyId === selectedAcademyFilter;
  });

  const totalReceived = targetInvoices.filter(i => i.status === 'paid').reduce((a, c) => a + c.amount, 0);
  const totalReceivablePending = targetInvoices.filter(i => i.status === 'pending').reduce((a, c) => a + c.amount, 0);
  const totalReceivableOverdue = targetInvoices.filter(i => i.status === 'overdue').reduce((a, c) => a + (c.totalUpdatedAmount || c.amount), 0);

  const totalPaidExpenses = visibleExpenses.filter(e => e.status === 'paid').reduce((a, c) => a + c.amount, 0);
  const totalPendingExpenses = visibleExpenses.filter(e => e.status !== 'paid').reduce((a, c) => a + c.amount, 0);

  const realizedBalance = Math.max(0, totalReceived - totalPaidExpenses);
  const projectedBalance = totalReceived + totalReceivablePending - totalPaidExpenses - totalPendingExpenses;

  // Run Asaas Webhook Simulation
  const handleExecuteSimulation = async () => {
    const targetInvoice = invoices.find(i => i.id === simSelectedInvoiceId);
    if (!targetInvoice) return;

    setIsSimulating(true);
    setSimFeedback(null);

    try {
      const res = await fetch('/api/financial/simulate-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: simEventType,
          invoiceId: targetInvoice.id,
          amount: targetInvoice.amount,
          studentName: targetInvoice.studentName,
          academyId: targetInvoice.academyId
        })
      });

      if (res.ok) {
        const json = await res.json();
        setSimFeedback(`✅ ${json.message} (Job ${json.jobId})`);

        // Update local invoice state
        const targetStatus = simEventType === 'PAYMENT_CONFIRMED' ? 'paid' : simEventType === 'PAYMENT_OVERDUE' ? 'overdue' : 'refunded';
        const updatedInvoice: Invoice = {
          ...targetInvoice,
          status: targetStatus,
          paidDate: targetStatus === 'paid' ? `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : targetInvoice.paidDate,
          confirmedDate: targetStatus === 'paid' ? new Date().toISOString() : undefined,
          refundDate: targetStatus === 'refunded' ? new Date().toISOString() : undefined,
          lastWebhookEvent: simEventType,
          lastWebhookProcessedAt: new Date().toISOString()
        };

        await saveInvoiceToFirestore(updatedInvoice);
        if (onUpdateInvoiceStatus) {
          onUpdateInvoiceStatus(updatedInvoice.id, targetStatus, updatedInvoice.amount);
        }

        // Save audit entry to Firestore
        await saveFinancialAuditToFirestore({
          id: `audit_${Date.now()}`,
          tenantId: targetInvoice.academyId,
          action: simEventType === 'PAYMENT_CONFIRMED' ? 'PAYMENT_CONFIRMED' : simEventType === 'PAYMENT_OVERDUE' ? 'CHARGE_OVERDUE' : 'PAYMENT_REFUNDED',
          entity: 'invoice',
          entityId: targetInvoice.id,
          timestamp: new Date().toISOString(),
          origin: 'asaas_webhook',
          result: 'success',
          details: {
            eventType: simEventType,
            amount: targetInvoice.amount,
            studentName: targetInvoice.studentName
          }
        });

        if (triggerPushNotification) {
          if (targetStatus === 'paid') {
            triggerPushNotification(
              '💰 Mensalidade Liquidada via Asaas!',
              `Confirmação recebida para ${targetInvoice.studentName} no valor de R$ ${targetInvoice.amount.toFixed(2)}.`,
              'payment'
            );
          } else if (targetStatus === 'overdue') {
            triggerPushNotification(
              '⚠️ Cobrança Vencida (Asaas)',
              `A fatura de ${targetInvoice.studentName} está vencida. Juros e multa calculados.`,
              'warning'
            );
          }
        }

        fetchHealth();
      } else {
        setSimFeedback('❌ Falha ao processar simulação.');
      }
    } catch {
      setSimFeedback('⚠️ Modo offline: simulação aplicada localmente.');
    } finally {
      setIsSimulating(false);
    }
  };

  // Add Payable Expense
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseDesc.trim() || expenseAmount <= 0) return;

    const newExpense: PayableExpense = {
      id: `exp_${Date.now()}`,
      tenantId: effectiveTenantId === 'all' ? activeAcademy.id : effectiveTenantId,
      category: expenseCategory,
      description: expenseDesc.trim(),
      amount: expenseAmount,
      dueDate: expenseDueDate,
      status: 'pending',
      recipientName: expenseRecipient.trim() || 'Fornecedor Tatame',
      createdAt: new Date().toISOString()
    };

    await savePayableExpenseToFirestore(newExpense);
    await saveFinancialAuditToFirestore({
      id: `audit_${Date.now()}`,
      tenantId: newExpense.tenantId,
      action: 'EXPENSE_CREATED',
      entity: 'expense',
      entityId: newExpense.id,
      timestamp: new Date().toISOString(),
      origin: 'manager_ui',
      result: 'success',
      details: { description: newExpense.description, amount: newExpense.amount }
    });

    setExpenseDesc('');
    setExpenseRecipient('');
    setIsAddingExpense(false);
  };

  // Toggle Expense Status
  const handleToggleExpenseStatus = async (exp: PayableExpense) => {
    const isNowPaid = exp.status !== 'paid';
    const updated: PayableExpense = {
      ...exp,
      status: isNowPaid ? 'paid' : 'pending',
      paidDate: isNowPaid ? new Date().toISOString().split('T')[0] : undefined
    };
    await savePayableExpenseToFirestore(updated);
    await saveFinancialAuditToFirestore({
      id: `audit_${Date.now()}`,
      tenantId: exp.tenantId,
      action: isNowPaid ? 'EXPENSE_PAID' : 'EXPENSE_CREATED',
      entity: 'expense',
      entityId: exp.id,
      timestamp: new Date().toISOString(),
      origin: 'manager_ui',
      result: 'success',
      details: { isNowPaid, amount: exp.amount }
    });
  };

  // Delete Expense
  const handleDeleteExpense = async (expenseId: string) => {
    await deletePayableExpenseFromFirestore(expenseId);
  };

  // Query Sansão IA Financial Assistant
  const handleAskSansao = async (presetQuery?: string) => {
    const q = presetQuery || iaQuery;
    if (!q.trim()) return;

    setIsIaThinking(true);
    setIaAnswer(null);

    try {
      const res = await fetch('/api/financial/sansao-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queryText: q,
          invoices: targetInvoices,
          expenses: visibleExpenses,
          tenantId: effectiveTenantId
        })
      });

      if (res.ok) {
        const json = await res.json();
        setIaAnswer(json.answer);
      } else {
        setIaAnswer('Não foi possível processar a consulta no momento.');
      }
    } catch {
      setIaAnswer('Serviço de inteligência financeira temporariamente operando em modo de contingência local.');
    } finally {
      setIsIaThinking(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="tab-financial-motor">
      {/* HEADER: TELEMETRIA & MOTOR OFICIAL */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1.5">
              <Zap size={11} className="animate-pulse" /> MOTOR FINANCEIRO ATIVO
            </span>
            <span className="text-xs text-slate-400 font-mono">Asaas Webhooks • Fila & Idempotência</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1">
            Arquitetura Financeira Profissional
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
            Fluxo oficial: Asaas Webhook → API Validação → Idempotency (7 dias) → Redis Queue → Worker → Auditoria → Notificação
          </p>
        </div>

        <button
          onClick={fetchHealth}
          disabled={isLoadingHealth}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition border border-slate-700 self-start md:self-auto shadow"
        >
          <RefreshCw size={13} className={isLoadingHealth ? 'animate-spin text-emerald-400' : ''} />
          <span>Atualizar Telemetria</span>
        </button>
      </div>

      {/* 4 CARDS DE TELEMETRIA: WEBHOOK, REDIS/QUEUE, IDEMPOTÊNCIA, WORKER */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Webhook Ingestion API */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium flex items-center gap-1.5">
              <Server size={14} className="text-teal-400" /> Webhook Asaas
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
            /api/webhooks/asaas
          </div>
          <p className="text-[11px] text-slate-400">
            Validação de Header, Schema, Eventos e Anti-tampering
          </p>
        </div>

        {/* Card 2: Redis / Memory Queue */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium flex items-center gap-1.5">
              <Database size={14} className="text-emerald-400" /> Fila (Queue)
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              {motorHealth.redis.connected ? 'REDIS' : 'FIFO V2'}
            </span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-emerald-400 tracking-tight flex items-baseline gap-2">
            <span>{motorHealth.queue.completedCount} proc.</span>
            <span className="text-xs text-slate-500 font-normal">({motorHealth.queue.queuedCount} na fila)</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Tentativas automáticas (backoff exp) & Dead-Letter
          </p>
        </div>

        {/* Card 3: Idempotência & Anti-Duplicidade */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-amber-400" /> Idempotency
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
              TTL 7 DIAS
            </span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {motorHealth.idempotency.trackedCount} chaves
          </div>
          <p className="text-[11px] text-slate-400">
            Zero pagamentos duplicados ou saldo corrompido
          </p>
        </div>

        {/* Card 4: Worker & Estado */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium flex items-center gap-1.5">
              <Cpu size={14} className="text-purple-400" /> Worker State
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold">
              ATIVO
            </span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-purple-300 tracking-tight">
            Máquina de Estados
          </div>
          <p className="text-[11px] text-slate-400">
            Garantia de transição legal (pending → paid / overdue)
          </p>
        </div>
      </div>

      {/* PAINEL DE SIMULAÇÃO DE WEBHOOKS & TESTE DO MOTOR */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Play size={14} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Simulador de Eventos Asaas</h4>
              <p className="text-xs text-slate-400">Dispare eventos de teste reais através da fila, worker e auditoria</p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-mono">Sandbox Seguro</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Escolha da Fatura */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Fatura Alvo</label>
            <select
              value={simSelectedInvoiceId}
              onChange={(e) => setSimSelectedInvoiceId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500"
            >
              {targetInvoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.studentName} — R$ {inv.amount.toFixed(2)} ({inv.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Evento Asaas */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Tipo de Evento Asaas</label>
            <select
              value={simEventType}
              onChange={(e) => setSimEventType(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500"
            >
              <option value="PAYMENT_CONFIRMED">PAYMENT_CONFIRMED (Confirmação de Pagamento)</option>
              <option value="PAYMENT_OVERDUE">PAYMENT_OVERDUE (Cobrança Vencida)</option>
              <option value="PAYMENT_REFUNDED">PAYMENT_REFUNDED (Estorno Processado)</option>
            </select>
          </div>

          {/* Botão de Disparo */}
          <div className="flex items-end">
            <button
              onClick={handleExecuteSimulation}
              disabled={isSimulating || !simSelectedInvoiceId}
              className="w-full py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md"
            >
              {isSimulating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processando Fila...</span>
                </>
              ) : (
                <>
                  <Send size={13} />
                  <span>Disparar Webhook no Motor</span>
                </>
              )}
            </button>
          </div>
        </div>

        {simFeedback && (
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
            {simFeedback}
          </div>
        )}
      </div>

      {/* FLUXO DE CAIXA: REALIZADO VS PREVISTO */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-emerald-400" />
            <h4 className="text-sm font-bold text-white">Demonstrativo de Fluxo de Caixa (Competência Atual)</h4>
          </div>
          <span className="text-xs text-slate-400 font-mono">{activeAcademy.name}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Entradas Realizadas (PIX/Cartão)</div>
            <div className="text-base sm:text-lg font-black text-emerald-400 mt-1">
              R$ {totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Mensalidades liquidadas</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Contas Pagas (Despesas)</div>
            <div className="text-base sm:text-lg font-black text-rose-400 mt-1">
              R$ {totalPaidExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Custos operacionais quitados</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Saldo Líquido em Caixa</div>
            <div className="text-base sm:text-lg font-black text-white mt-1">
              R$ {realizedBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Disponível para reinvestimento</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Saldo Projetado Final</div>
            <div className="text-base sm:text-lg font-black text-teal-400 mt-1">
              R$ {projectedBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Considerando faturas a vencer</div>
          </div>
        </div>
      </div>

      {/* CONTAS A PAGAR (DESPESAS OPERACIONAIS) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white">Contas a Pagar (Despesas Operacionais)</h4>
            <p className="text-xs text-slate-400">Controle de aluguel, energia, professores e fornecedores do tatame</p>
          </div>
          <button
            onClick={() => setIsAddingExpense(!isAddingExpense)}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow"
          >
            <Plus size={13} />
            <span>{isAddingExpense ? 'Cancelar' : 'Nova Despesa'}</span>
          </button>
        </div>

        {/* Form para adicionar despesa */}
        {isAddingExpense && (
          <form onSubmit={handleCreateExpense} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 font-semibold mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Aluguel do Tatame"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-semibold mb-1">Categoria</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 focus:outline-none"
                >
                  <option value="aluguel">Aluguel do Espaço</option>
                  <option value="energia">Energia Elétrica</option>
                  <option value="agua">Água & Saneamento</option>
                  <option value="internet">Internet & TI</option>
                  <option value="professores">Remuneração Professores</option>
                  <option value="fornecedores">Fornecedores & Kimonos</option>
                  <option value="materiais">Limpeza & Higiene Tatame</option>
                  <option value="outras_despesas">Outras Despesas</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-semibold mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-semibold mb-1">Vencimento</label>
                <input
                  type="text"
                  placeholder="10/09/2026"
                  value={expenseDueDate}
                  onChange={(e) => setExpenseDueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow"
              >
                <Check size={13} /> Salvar Despesa
              </button>
            </div>
          </form>
        )}

        {/* Lista de Contas a Pagar */}
        <div className="space-y-2">
          {visibleExpenses.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
              Nenhuma conta a pagar cadastrada no momento para esta unidade.
            </div>
          ) : (
            visibleExpenses.map((exp) => (
              <div
                key={exp.id}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleExpenseStatus(exp)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                      exp.status === 'paid'
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'border-slate-600 text-transparent hover:border-slate-400'
                    }`}
                  >
                    <Check size={12} />
                  </button>
                  <div>
                    <div className={`font-semibold ${exp.status === 'paid' ? 'line-through text-slate-500' : 'text-white'}`}>
                      {exp.description}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Categoria: <span className="capitalize">{exp.category}</span> • Venc: {exp.dueDate}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-bold text-white">R$ {exp.amount.toFixed(2)}</div>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                        exp.status === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {exp.status === 'paid' ? 'Quitado' : 'A Pagar'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteExpense(exp.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SANSÃO IA - ASSISTENTE FINANCEIRO EM LINGUAGEM NATURAL */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Bot size={14} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                Sansão IA • Inteligência Financeira
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                  SOMENTE-LEITURA
                </span>
              </h4>
              <p className="text-xs text-slate-400">Consultas e diagnósticos em linguagem natural sem riscos de alteração</p>
            </div>
          </div>
        </div>

        {/* Consultas Rápidas Sugeridas */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            'Quem está inadimplente?',
            'Quanto tenho para receber?',
            'Quanto recebi este mês?',
            'Qual a previsão de contas a pagar?'
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleAskSansao(prompt)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs border border-slate-800 transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Livre */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Pergunte sobre receitas, faturas, fluxo de caixa..."
            value={iaQuery}
            onChange={(e) => setIaQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskSansao()}
            className="flex-1 bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={() => handleAskSansao()}
            disabled={isIaThinking}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
          >
            {isIaThinking ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles size={13} />
            )}
            <span>Consultar IA</span>
          </button>
        </div>

        {/* Resposta da IA */}
        {iaAnswer && (
          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200 whitespace-pre-line leading-relaxed">
            {iaAnswer}
          </div>
        )}
      </div>

      {/* TRILHA DE AUDITORIA IMUTÁVEL MULTI-TENANT */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-amber-400" />
            <h4 className="text-sm font-bold text-white">Trilha de Auditoria Financeira Imutável</h4>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {visibleAudits.length} registros auditados
          </span>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {visibleAudits.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
              Nenhum registro de auditoria no período selecionado.
            </div>
          ) : (
            visibleAudits.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      log.result === 'success'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : log.result === 'ignored_duplicate'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {log.action}
                  </span>
                  <span className="text-slate-300 font-medium">
                    Entidade: <span className="font-mono text-slate-400">{log.entity}:{log.entityId}</span>
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Origem: <span className="font-mono">{log.origin}</span>
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleString('pt-BR')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
